// app/registration-cancelled/page.tsx

import React from "react";
import Link from "next/link";

export default function RegistrationCancelled() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <main className="text-center">
        <h1 className="text-4xl font-bold mb-4">Registration Cancelled</h1>
        <p className="mb-4">
          Your registration was cancelled. No payment was processed.
        </p>
        <Link href="/register">
          <a className="text-blue-500 underline">Try registering again</a>
        </Link>
      </main>
    </div>
  );
}
