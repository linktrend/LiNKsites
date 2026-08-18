#!/usr/bin/env python3
"""Write and verify exact-tree receipts for the LiNKsites full CI suite."""

from __future__ import annotations

import argparse
import hashlib
import io
import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

SHA_RE = re.compile(r"^[0-9a-f]{40}$")
RECEIPT_NAME = "full-suite-receipt.json"


def fail(message: str) -> None:
    raise SystemExit(f"FAIL: {message}")


def git(*args: str) -> str:
    proc = subprocess.run(["git", *args], text=True, capture_output=True)
    if proc.returncode != 0:
        fail((proc.stderr or proc.stdout or "git command failed").strip())
    return proc.stdout.strip()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return f"sha256:{digest.hexdigest()}"


def require_sha(value: str, label: str) -> str:
    normalized = value.strip().lower()
    if not SHA_RE.fullmatch(normalized):
        fail(f"{label} must be a full 40-character commit SHA")
    return normalized


def validate_receipt(
    receipt: dict[str, Any],
    *,
    repo: str,
    run_id: int,
    run_head_sha: str,
    candidate_tree_sha: str,
    lockfile_sha256: str,
) -> None:
    expected = {
        "schemaVersion": 1,
        "status": "passed",
        "repository": repo,
        "workflowRunId": run_id,
        "sourceSha": require_sha(run_head_sha, "run head SHA"),
        "treeSha": require_sha(candidate_tree_sha, "candidate tree SHA"),
        "lockfileSha256": lockfile_sha256,
    }
    mismatches = [
        f"{key}: expected {value!r}, got {receipt.get(key)!r}"
        for key, value in expected.items()
        if receipt.get(key) != value
    ]
    require_sha(str(receipt.get("testedCheckoutSha") or ""), "tested checkout SHA")
    if mismatches:
        fail("full-suite receipt mismatch: " + "; ".join(mismatches))


def api_request(url: str, token: str, *, binary: bool = False) -> Any:
    request = urllib.request.Request(
        url,
        headers={
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {token}",
            "User-Agent": "linksites-full-suite-reuse/1",
            "X-GitHub-Api-Version": "2022-11-28",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            payload = response.read()
    except urllib.error.HTTPError as exc:
        # A stale artifact from an unrelated historical run may be expired or
        # inaccessible to the runner token.  Treat only that binary artifact
        # as a candidate to skip; metadata/API failures remain fatal, and the
        # exact-tree receipt below is still validated strictly.
        if binary and exc.code in {401, 404}:
            return None
        fail(f"GitHub API request failed for {url}: {exc}")
    except (urllib.error.URLError, TimeoutError) as exc:
        fail(f"GitHub API request failed for {url}: {exc}")
    if binary:
        return payload
    try:
        return json.loads(payload)
    except json.JSONDecodeError as exc:
        fail(f"GitHub API returned invalid JSON for {url}: {exc}")


def command_write(args: argparse.Namespace) -> None:
    source_sha = require_sha(args.source_sha, "source SHA")
    tested_sha = require_sha(args.tested_sha, "tested SHA")
    receipt = {
        "schemaVersion": 1,
        "status": "passed",
        "repository": args.repo,
        "sourceSha": source_sha,
        "testedCheckoutSha": tested_sha,
        "treeSha": require_sha(git("rev-parse", "HEAD^{tree}"), "tree SHA"),
        "lockfileSha256": sha256_file(Path("pnpm-lock.yaml")),
        "workflowRunId": int(args.workflow_run_id),
        "workflowUrl": args.workflow_url,
        "generatedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
    }
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(receipt, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(receipt, sort_keys=True))


def command_verify(args: argparse.Namespace) -> None:
    token = (os.environ.get("GITHUB_TOKEN") or "").strip()
    if not token:
        fail("GITHUB_TOKEN is required to verify prior full-suite artifacts")
    repo = args.repo.strip()
    if not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", repo):
        fail("repo must be owner/name")

    candidate_sha = require_sha(git("rev-parse", "HEAD"), "candidate SHA")
    candidate_tree = require_sha(git("rev-parse", "HEAD^{tree}"), "candidate tree SHA")
    lock_hash = sha256_file(Path("pnpm-lock.yaml"))
    workflow = urllib.parse.quote(args.workflow, safe="")
    base = f"https://api.github.com/repos/{repo}"
    runs = api_request(
        f"{base}/actions/workflows/{workflow}/runs?status=success&event=pull_request&per_page=100",
        token,
    ).get("workflow_runs", [])

    for run in runs:
        run_id = int(run.get("id") or 0)
        run_head = str(run.get("head_sha") or "").lower()
        if not run_id or not SHA_RE.fullmatch(run_head):
            continue
        artifacts = api_request(f"{base}/actions/runs/{run_id}/artifacts?per_page=100", token).get("artifacts", [])
        expected_name = f"linksites-full-suite-{run_head}"
        artifact = next(
            (
                item
                for item in artifacts
                if item.get("name") == expected_name and not item.get("expired")
            ),
            None,
        )
        if artifact is None:
            continue
        archive = api_request(str(artifact["archive_download_url"]), token, binary=True)
        if archive is None:
            continue
        if len(archive) > 25 * 1024 * 1024:
            fail("full-suite evidence artifact exceeds 25 MiB safety limit")
        with zipfile.ZipFile(io.BytesIO(archive)) as bundle:
            names = [name for name in bundle.namelist() if name.endswith(RECEIPT_NAME)]
            if len(names) != 1:
                continue
            receipt = json.loads(bundle.read(names[0]))
        try:
            validate_receipt(
                receipt,
                repo=repo,
                run_id=run_id,
                run_head_sha=run_head,
                candidate_tree_sha=candidate_tree,
                lockfile_sha256=lock_hash,
            )
        except SystemExit:
            continue
        evidence = {
            "schemaVersion": 1,
            "status": "passed",
            "candidateSha": candidate_sha,
            "candidateTreeSha": candidate_tree,
            "reusedSourceSha": run_head,
            "fullSuiteRunId": run_id,
            "fullSuiteUrl": run.get("html_url"),
            "fileIdentity": "exact-git-tree",
            "lockfileSha256": lock_hash,
        }
        output = Path(args.output)
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(json.dumps(evidence, indent=2, sort_keys=True) + "\n", encoding="utf-8")
        print(json.dumps(evidence, sort_keys=True))
        return
    fail(f"no successful, unexpired full-suite receipt matches candidate tree {candidate_tree}")


def parser() -> argparse.ArgumentParser:
    root = argparse.ArgumentParser()
    commands = root.add_subparsers(dest="command", required=True)
    write = commands.add_parser("write")
    write.add_argument("--repo", required=True)
    write.add_argument("--source-sha", required=True)
    write.add_argument("--tested-sha", required=True)
    write.add_argument("--workflow-run-id", required=True, type=int)
    write.add_argument("--workflow-url", required=True)
    write.add_argument("--output", required=True)
    write.set_defaults(func=command_write)
    verify = commands.add_parser("verify")
    verify.add_argument("--repo", required=True)
    verify.add_argument("--workflow", default="ci.yml")
    verify.add_argument("--output", required=True)
    verify.set_defaults(func=command_verify)
    return root


def main() -> None:
    args = parser().parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
