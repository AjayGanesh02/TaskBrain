import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, response: NextResponse) {
  const res = await request.json();
  return NextResponse.json({ res });
}
