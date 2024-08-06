import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import React from "react";
import SessionProviderClient from "@/components/SessionProviderClient";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Forum",
  description: "A forum for secure trades",
};

export default function RootLayout({
  children,
  session,
}: Readonly<{
  children: React.ReactNode;
  session: any;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProviderClient session={session}>
          {children}
        </SessionProviderClient>
      </body>
    </html>
  );
}
