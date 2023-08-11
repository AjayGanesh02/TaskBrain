import type { NextRequest } from "next/server";

export async function GET(request: NextRequest, response: Response) {
  console.log(request);
  return `<Response></Response>`;
}
