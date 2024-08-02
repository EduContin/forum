"use client";
import { SessionProvider } from "next-auth/react";
import React from "react";

export default function SessionProviderClient({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
