import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, response: Response) {
  const { body } = request;
  console.log(request.body);
  return `<Response></Response>`;
}
