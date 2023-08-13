import type { NextApiRequest, NextApiResponse } from "next";
import { kv } from "@vercel/kv";
import { z } from "zod";

const bodySchema = z.object({
  access_token: z.string(),
  database_id: z.string(),
  phone: z.string(),
});

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method != "POST") {
    return res.json({ error: "invalid" });
  }

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.json({ error: "invalid" });
  }

  void kv.hset(`user:+1${parsed.data.phone}`, {
    access_token: parsed.data.access_token,
    database_id: parsed.data.database_id,
  });

  return res.json({ success: "registered" });
}
