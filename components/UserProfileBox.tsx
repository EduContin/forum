// components/UserProfileBox.tsx

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

const UserProfileBox: React.FC = () => {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!session || !session.user) {
    return null;
  }

  const { user } = session;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="absolute bg-gray-800 backdrop-blur-sm rounded-lg py-2 px-5 top-4 right-4">
      <div
        className="flex items-center space-x-2 cursor-pointer"
        onClick={toggleMenu}
      >
        <p className="text-white font-semibold">{user.name}</p>
        <Image
          src={user.image || "/winter_soldier.gif"}
          alt={user.name || "User Avatar"}
          className="w-8 h-8 rounded-full"
          width={40}
          height={40}
        />
      </div>
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-2">
          <Link
            href={`/users/${user.name}`}
            className="block px-4 py-2 hover:bg-gray-100"
          >
            Profile
          </Link>
          <button
            onClick={() => signOut()}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfileBox;
