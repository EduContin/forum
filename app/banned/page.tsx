// pages/banned.tsx

import React from "react";
import Head from "next/head";

const BannedPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <Head>
        <title>Account Banned - Forum</title>
        <meta
          name="description"
          content="Your account has been banned from this forum."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="text-center px-4">
        <h1 className="text-4xl font-bold text-red-600 mb-8">Account Banned</h1>
        <div className="bg-white p-8 rounded-lg shadow-md max-w-lg">
          <p className="text-xl text-gray-800 mb-4">
            We regret to inform you that your account has been banned from this
            forum.
          </p>
          <p className="text-lg text-gray-600">
            If you believe this is an error, please contact the forum
            administrators for further assistance.
          </p>
        </div>
        <a
          href="mailto:admin@alpened.com"
          className="mt-8 inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Contact Admin
        </a>
      </main>
    </div>
  );
};

export default BannedPage;
