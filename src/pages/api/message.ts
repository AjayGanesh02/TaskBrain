import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  let message: string | string[] | undefined;
  let number: string | string[] | undefined;

  if (req.method == "POST") {
    message = req.body["Body"];
    number = req.body["From"];
  }

  if (!message || !number) {
    return res.status(200).send("<Response></Response>");
  }

  return res.status(200).send("<Response></Response>");
}
