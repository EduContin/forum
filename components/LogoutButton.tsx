"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <button
      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
      onClick={handleLogout}
    >
      Logout
    </button>
  );
};

export default LogoutButton;
