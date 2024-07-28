import NextAuth, { DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import database from "@/infra/database";

// Extend the built-in session types
declare module "next-auth" {
  // eslint-disable-next-line no-unused-vars
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
  // eslint-disable-next-line no-unused-vars
  interface User {
    id: string;
  }
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const result = await database.query({
          text: `SELECT * FROM users WHERE username = $1`,
          values: [credentials.username],
        });
        const user = result.rows[0];

        if (
          user &&
          (await bcrypt.compare(credentials.password, user.password))
        ) {
          return { id: user.id.toString(), name: user.username };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
