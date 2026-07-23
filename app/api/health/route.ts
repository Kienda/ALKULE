import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "alkule-web",
    runtime: "nextjs",
    time: new Date().toISOString(),
  });
}
