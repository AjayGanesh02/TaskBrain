import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import { env } from "~/env.mjs";

const NOTION_HOST = "https://api.notion.com";
const NOTION_API_VERSION = "2022-06-28";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      // ...other properties
      // role: UserRole;
    };
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub,
      },
    }),
  },
  providers: [
    {
      id: "notion",
      name: "Notion",
      type: "oauth",
      token: {
        url: `${NOTION_HOST}/v1/oauth/token`,
      },
      userinfo: {
        url: `${NOTION_HOST}/v1/users`,

        // The result of this method will be the input to the `profile` callback.
        // We use a custom request handler, since we need to do things such as pass the "Notion-Version" header
        // More info: https://next-auth.js.org/configuration/providers/oauth
        async request(context) {
          const profile = await fetch(`${NOTION_HOST}/v1/users/me`, {
            headers: {
              Authorization: `Bearer ${context.tokens.access_token}`,
              "Notion-Version": NOTION_API_VERSION,
            },
          });

          const {
            bot: {
              owner: { user },
            },
          } = await profile.json();

          return user;
        },
      },
      authorization: env.NOTION_AUTH_URL,

      async profile(profile, tokens) {
        return {
          id: profile.id,
          name: profile.name,
          email: profile.person.email,
          image: profile.avatar_url,
        };
      },
      style: {
        logo: "/notion.svg",
        logoDark: "/notion.svg",
        bg: "#fff",
        text: "#000",
        bgDark: "#fff",
        textDark: "#000",
      },
    },
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
