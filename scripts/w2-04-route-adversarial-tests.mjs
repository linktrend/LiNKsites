import assert from "node:assert/strict";
import { request as httpRequest } from "node:http";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const root = resolve(new URL("..", import.meta.url).pathname);
const fixture = JSON.parse(await readFile(join(root, "apps/web-master/data/w2-04-published-fixture.json"), "utf8"));
const privatePages = fixture.pages.map((page) => ({
  ...page,
  id: `${page.id}-private`,
  site: "private-only-site",
  previewEnvironment: "private-preview",
}));
const publicPages = fixture.pages.map((page) => ({
  ...page,
  id: `${page.id}-public`,
  site: "public-site",
  previewEnvironment: "public",
}));
const testFixture = {
  ...fixture,
  sites: [
    { id: "private-only-site", status: "published" },
    { id: "public-site", status: "published" },
  ],
  siteDomains: [
    { id: "private-only-domain", hostname: "private.test", site: "private-only-site", primary: true },
    { id: "public-domain", hostname: "127.0.0.1", site: "public-site", primary: true },
  ],
  pages: [...privatePages, ...publicPages],
};

const port = 4300 + (process.pid % 500);
const fixtureDirectory = await mkdtemp(join(tmpdir(), "linksites-w2-04-routes-"));
const fixturePath = join(fixtureDirectory, "fixture.json");
await writeFile(fixturePath, JSON.stringify(testFixture), "utf8");

const server = spawn("pnpm", ["--filter", "@linksites/web-master", "dev", "--hostname", "127.0.0.1", "--port", String(port)], {
  cwd: root,
  env: {
    ...process.env,
    NEXT_PUBLIC_CMS_PROVIDER: "fixture",
    CMS_FIXTURE_PATH: fixturePath,
    AI_ACTIONS_SECRET: "ltfx.auto.ai_actions_secret.6159af24f66e.v1",
    NEXT_PUBLIC_SITE_URL: `http://127.0.0.1:${port}`,
  },
  stdio: ["ignore", "pipe", "pipe"],
});

let output = "";
server.stdout.on("data", (chunk) => { output += chunk.toString(); });
server.stderr.on("data", (chunk) => { output += chunk.toString(); });

const request = (host, path, init = {}) => new Promise((resolveRequest, rejectRequest) => {
  const body = init.body ?? "";
  const requestHeaders = {
    Host: `${host}:${port}`,
    "x-forwarded-host": `${host}:${port}`,
    ...(init.headers ?? {}),
    ...(body ? { "content-length": Buffer.byteLength(body) } : {}),
  };
  const requestHandle = httpRequest({
    hostname: "127.0.0.1",
    port,
    path,
    method: init.method ?? "GET",
    headers: requestHeaders,
  }, (response) => {
    const chunks = [];
    response.on("data", (chunk) => chunks.push(chunk));
    response.on("end", () => resolveRequest({
      status: response.statusCode,
      headers: response.headers,
      text: () => Promise.resolve(Buffer.concat(chunks).toString("utf8")),
    }));
  });
  requestHandle.on("error", rejectRequest);
  if (body) requestHandle.write(body);
  requestHandle.end();
});

try {
  let ready = false;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/healthz`);
      if (response.status === 200) {
        ready = true;
        break;
      }
    } catch {
      // The dev server is still compiling or binding its port.
    }
    await delay(250);
  }
  assert.equal(ready, true, `web-master dev server did not start\n${output}`);

  const privateRoutes = [
    ["GET", "/llms.txt"],
    ["GET", "/.well-known/ai-actions.json"],
    ["GET", "/ai/markdown?path=/"],
  ];
  for (const [method, path] of privateRoutes) {
    const response = await request("private.test", path, { method });
    assert.equal(response.status, 404, `private-only ${method} ${path} must fail closed`);
  }

  const privateRobots = await request("private.test", "/robots.txt");
  assert.equal(privateRobots.status, 200, "private-only robots policy remains an operational response");
  assert.match(await privateRobots.text(), /Disallow: \/\s*$/m);
  assert.doesNotMatch(await privateRobots.text(), /Sitemap:/);
  const privateSitemap = await request("private.test", "/sitemap.xml");
  assert.equal(privateSitemap.status, 200, "private-only sitemap remains an operational response");
  assert.doesNotMatch(await privateSitemap.text(), /<url>/);

  const contactBody = JSON.stringify({
    intentTag: "sales",
    formData: { name: "private probe" },
  });
  for (const [method, path, headers] of [
    ["POST", "/api/contact", { "content-type": "application/json" }],
    ["OPTIONS", "/api/contact", {}],
    ["POST", "/api/ai-actions/contact", { "content-type": "application/json", "x-ai-action-token": "ltfx.auto.token.96d3a59d7d73.v1" }],
  ]) {
    const response = await request("private.test", path, {
      method,
      headers,
      body: method === "POST" ? contactBody : undefined,
    });
    assert.equal(response.status, 404, `private-only ${method} ${path} must not accept or proxy contact requests`);
  }

  for (const path of ["/llms.txt", "/.well-known/ai-actions.json", "/ai/markdown?path=/", "/robots.txt", "/sitemap.xml"]) {
    const response = await request("127.0.0.1", path);
    assert.notEqual(response.status, 404, `eligible public counterpart must retain ${path}`);
  }
  const publicContact = await request("127.0.0.1", "/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: contactBody,
  });
  assert.equal(publicContact.status, 200, "eligible public counterpart must retain contact processing");

  const publicAiContact = await request("127.0.0.1", "/api/ai-actions/contact", {
    method: "POST",
    headers: { "content-type": "application/json", "x-ai-action-token": "ltfx.auto.token.57b9df736885.v1" },
    body: contactBody,
  });
  assert.equal(publicAiContact.status, 200, "eligible public counterpart must retain the AI contact action");
} finally {
  server.kill("SIGTERM");
  server.unref();
  await Promise.race([
    new Promise((resolveExit) => server.once("exit", resolveExit)),
    delay(1000),
  ]);
  if (server.exitCode === null && server.signalCode === null) server.kill("SIGKILL");
  await rm(fixtureDirectory, { recursive: true, force: true });
}

console.log("W2-04 route adversarial tests: PASS");
console.log("private-only: llms, AI actions/markdown, robots, sitemap, contact, OPTIONS, and AI proxy fail closed");
console.log("public counterpart: discovery and contact routes retain intended behavior");
