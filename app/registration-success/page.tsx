// app/registration-success/page.tsx

import React from "react";
import Link from "next/link";

export default function RegistrationSuccess() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <main className="text-center">
        <h1 className="text-4xl font-bold mb-4">Registration Successful!</h1>
        <p className="mb-4">
          Thank you for registering. Your account has been created.
        </p>
        <Link href="/login">
          <a className="text-blue-500 underline">Login to your account</a>
        </Link>
      </main>
    </div>
  );
}
