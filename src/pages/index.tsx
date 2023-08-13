import type { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { env } from "process";
import { useEffect, useState } from "react";
import useSWR from "swr";

function App() {
  const [access_token, set_at] = useState<string>("");
  const [logged, setLogged] = useState(false);
  const redirect =
    env.NODE_ENV == "development"
      ? "http://localhost:3000"
      : "https://task-brain.vercel.app";

  // When you open the app, this doesn't do anything, but after you sign into Notion, you'll be redirected back with a code at which point we call our backend.
  useEffect(() => {
    if (logged) {
      return;
    }
    const params = new URL(window.document.location.toString()).searchParams;
    const code = params.get("code");
    if (!code) return;
    const atfetch = async () => {
      const resp = await fetch(`/api/login/${code}`);
      // eslint-disable-next-line
      const json_resp: {
        access_token: string;
      } = await resp.json().catch((_e) => {
        return false;
      });
      if (!json_resp) {
        return;
      }
      set_at(json_resp.access_token);
      setLogged(true);
    };
    void atfetch();
  }, [logged]);

  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  const { data } = useSWR<DatabaseObjectResponse[]>(
    `/api/databases?access_token=${access_token}`,
    fetcher
  );
  return (
    <div>
      <a
        style={{ display: "block" }}
        href={`https://api.notion.com/v1/oauth/authorize?client_id=4e3bc30d-04bd-4e08-bdfe-55a0562492be&response_type=code&owner=user&redirect_uri=${redirect}`}
      >
        Connect to Notion
      </a>
      {data?.map((db, id) => (
        <div
          style={{
            display: "inline-flex",
            whiteSpace: "pre",
            border: "1px solid black",
            marginBottom: 10,
          }}
          key={id}
        >
          <p>{db.title[0]?.plain_text}</p>
          {db.icon?.type == "emoji" ? db.icon.emoji : ""}
          <form action="/api/activate" method="post">
            <input
              type="hidden"
              name="access_token"
              id="access_token"
              value={access_token}
            ></input>
            <input
              type="hidden"
              name="database_id"
              id="database_id"
              value={db.id}
            ></input>
            <label htmlFor="phone">10 digit phone number</label>
            <input type="tel" id="phone" name="phone" required></input>
            <button type="submit">Use This Database</button>
          </form>
        </div>
      ))}
    </div>
  );
}

export default App;
