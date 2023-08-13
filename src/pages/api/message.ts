import type { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";
import { Client } from "@notionhq/client";
import { kv } from "@vercel/kv";
import { env } from "process";
import { z } from "zod";

const redisSchema = z.object({
  access_token: z.string(),
  database_id: z.string(),
  user_info: z.string().optional(),
});

const bodySchema = z.object({
  From: z.string(),
  Body: z.string(),
});

const chatResponseSchema = z.object({
  task: z.string(),
  category: z.enum(["School", "Work", "Research", "Personal"]),
  complete_by: z.string().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method != "POST") {
    return res.send("<Response></Response>");
  }

  const body_parsed = bodySchema.safeParse(req.body);

  if (!body_parsed.success) {
    return res.send("<Response></Response>");
  }

  const number = body_parsed.data.From;
  const message = body_parsed.data.Body;

  const data = await kv.hgetall<Record<string, string>>(`user:${number}`);
  const redis_resp = redisSchema.safeParse(data);
  if (!redis_resp.success) {
    return res.send("<Response></Response>");
  }
  console.log(redis_resp.data.access_token);
  console.log(redis_resp.data.database_id);
  console.log(message);

  const notion = new Client({
    auth: redis_resp.data.access_token,
  });

  const database = await notion.databases.retrieve({
    database_id: redis_resp.data.database_id,
  });

  const category_options =
    database.properties.Category?.type == "select" &&
    database.properties.Category.select.options;
  if (!category_options) {
    return res.send("<Response></Response>");
  }

  const configuration = new Configuration({
    organization: "org-2hOgR9fGaEoEtjkWnR2r54gh",
    apiKey: env.OPENAI_API_TOKEN,
  });
  const openai = new OpenAIApi(configuration);

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: generatePrompt(redis_resp.data.user_info ?? ""),
      },
      {
        role: "user",
        content: message,
      },
    ],
  });
  console.log(completion.data);
  console.log(completion.data.choices[0]?.message?.content);

  const completion_message = completion.data.choices[0]?.message?.content;

  if (!completion_message) {
    console.log("chatgpt screwed up");
    return res.send("<Response></Response>");
  }
  const parsed_task = chatResponseSchema.safeParse(
    JSON.parse(completion_message)
  );
  if (!parsed_task.success) {
    console.log("task not parsed");
    return res.send("<Response></Response>");
  }

  const category = category_options.find((elt) => {
    return elt.name == parsed_task.data.category;
  });

  if (!category) {
    console.log("no category");
    console.log(category_options);
    return res.send("<Response></Response>");
  }

  void notion.pages.create({
    parent: {
      database_id: redis_resp.data.database_id,
    },
    properties: {
      Action: {
        type: "title",
        title: [
          {
            type: "text",
            text: {
              content: parsed_task.data.task,
            },
          },
        ],
      },
      Done: {
        type: "checkbox",
        checkbox: false,
      },
      Category: {
        type: "select",
        select: category,
      },
      "Complete by": {
        type: "date",
        date: parsed_task.data.complete_by
          ? {
              start: parsed_task.data.complete_by,
            }
          : null,
      },
    },
  });

  console.log();

  res.send("<Response></Response>");
}

function generatePrompt(user_info: string): string {
  const currentdate = new Date();
  return `
    The current date is ${currentdate.toString()}.
    For each message, you need to output a JSON object that categorizes and formats the task described in the message 
    The output has the following keys: 
    - task, a string 
    - category, a string that that is one of "Research", "Personal", "Work", or "School"
    - complete_by, an optional string of the format "yyyy-mm-dd"
    ${
      user_info
        ? "The person has provided the following info to help in categorizing:" +
          user_info
        : ""
    }
    `;
}
