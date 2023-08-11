import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, response: Response) {
  const text = request.body;
  if (typeof text == null) {
    return `<Response></Response>`;
  }
  console.log(text);
  return `<Response></Response>`;
}
