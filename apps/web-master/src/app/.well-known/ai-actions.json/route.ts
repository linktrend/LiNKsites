import { NextResponse } from "next/server";
import { getAiActions } from "@/config";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  const actions = getAiActions();
  return NextResponse.json(actions, {
    headers: {
      "cache-control": "public, max-age=300",
    },
  });
}
