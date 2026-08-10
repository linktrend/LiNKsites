import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ status: "ok", service: "web-master" }, { headers: { "cache-control": "no-store" } });
}
