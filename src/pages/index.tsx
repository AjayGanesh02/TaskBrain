import type { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { env } from "process";
import { useEffect, useState } from "react";

function App() {
  const [dbs, setdbs] = useState<DatabaseObjectResponse[]>([]);
  const redirect =
    env.NODE_ENV == "development"
      ? "http://localhost:3000"
      : "https://task-brain.vercel.app";

  // When you open the app, this doesn't do anything, but after you sign into Notion, you'll be redirected back with a code at which point we call our backend.
  useEffect(() => {
    const params = new URL(window.document.location.toString()).searchParams;
    const code = params.get("code");
    if (!code) return;
    const dbfetch = async () => {
      const resp = await fetch(`/api/login/${code}`);
      setdbs(await resp.json());
    };
    void dbfetch();
  }, []);

  return (
    <div>
      <a
        style={{ display: "block" }}
        href={`https://api.notion.com/v1/oauth/authorize?client_id=4e3bc30d-04bd-4e08-bdfe-55a0562492be&response_type=code&owner=user&redirect_uri=${redirect}`}
      >
        Connect to Notion
      </a>
      {dbs.map((db, id) => (
        <div
          style={{
            display: "inline-flex",
            whiteSpace: "pre",
            border: "1px solid black",
            marginBottom: 10,
          }}
          key={id}
        >
          {}
          <form>
            <label>phone</label>
            <input type="tel"></input>
            <button type="submit" name="Use this database">
              Use This Database
            </button>
          </form>
        </div>
      ))}
    </div>
  );
}

export default App;
