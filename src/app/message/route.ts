import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, response: Response) {
  const res = await request.json();
  return "<Response><Message>test</Message></Response>";
}
