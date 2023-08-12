import { SvelteKitAuth } from "@auth/sveltekit";
import Notion from "@auth/core/providers/notion";
import { NOTION_CLIENT_ID, NOTION_CLIENT_SECRET } from "$env/static/private";

export const handle = SvelteKitAuth({
  providers: [Notion({ clientId: NOTION_CLIENT_ID, clientSecret: NOTION_CLIENT_SECRET, redirectUri: "https://task-brain.vercel.app" })],
});