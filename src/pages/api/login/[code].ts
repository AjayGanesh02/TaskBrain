import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { env } from "process";
import { Client } from "@notionhq/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { code } = req.query;

  const redirect =
    env.NODE_ENV == "development"
      ? "http://localhost:3000"
      : "https://task-brain.vercel.app";

  // Generate an access token with the code we got earlier and the client_id and client_secret we retrived earlier
  const resp: { data: { access_token: string } } = await axios({
    method: "POST",
    url: "https://api.notion.com/v1/oauth/token",
    auth: {
      username: env.NOTION_CLIENT_ID ?? "",
      password: env.NOTION_CLIENT_SECRET ?? "",
    },
    headers: { "Content-Type": "application/json" },
    data: {
      code,
      grant_type: "authorization_code",
      redirect_uri: redirect,
    },
  });

  //   const respy = await fetch("https://api.notion.com/v1/oauth/token", {
  //     method: "POST",
  //     headers: {
  //       Authorization: `${env.NOTION_CLIENT_ID}:${env.NOTION_CLIENT_SECRET}`,
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       code: code,
  //       grant_type: "authorization_code",
  //       redirect_uri: "http://localhost:3000",
  //     }),
  //   });

  console.log(resp);

  const notion = new Client({
    auth: resp.data.access_token,
  });

  const data = await notion.search({
    filter: {
      property: "object",
      value: "database",
    },
  });

  res.json(data?.results || []);
}
