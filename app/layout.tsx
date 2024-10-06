// app/layout.tsx
"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import React from "react";
import SessionProviderClient from "@/components/SessionProviderClient";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProviderClient>
          <Navbar />
          {children}
        </SessionProviderClient>
      </body>
    </html>
  );
}
