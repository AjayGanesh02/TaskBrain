import { Client } from "@notionhq/client";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (typeof req.query.access_token !== "string") {
    return res.json([]);
  }
  const notion = new Client({
    auth: req.query.access_token,
  });

  const data = await notion.search({
    filter: {
      property: "object",
      value: "database",
    },
  });
  return res.json(data?.results || []);
}
