// app/api/auth/[...nextauth]/route.tsx
import NextAuth from "next-auth";
import { authOptions } from "./auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
