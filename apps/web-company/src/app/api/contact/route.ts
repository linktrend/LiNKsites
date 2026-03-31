import { NextResponse } from "next/server";

export async function POST() {
  // Placeholder for contact form handling (to be wired to email/CRM).
  return NextResponse.json({ status: "ok", message: "Contact request received (stub)." });
}
