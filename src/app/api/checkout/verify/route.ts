import { NextRequest, NextResponse } from "next/server";
import { verifiedSessions } from "@/app/api/webhooks/stripe/route";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ verified: false, error: "Missing session_id" }, { status: 400 });
  }

  const verified = verifiedSessions.has(sessionId);
  return NextResponse.json({ verified });
}
