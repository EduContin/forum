"use client";

import React from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";

const Navbar: React.FC = () => {
  const { data: session } = useSession();

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-6">
          <Link href="/" className="hover:text-blue-300 transition">
            Home
          </Link>
          <Link href="/upgrade" className="hover:text-blue-300 transition">
            Upgrade
          </Link>
          <Link href="/search" className="hover:text-blue-300 transition">
            Search
          </Link>
          <Link href="/games" className="hover:text-blue-300 transition">
            Games
          </Link>
          <Link href="/market" className="hover:text-blue-300 transition">
            Market
          </Link>
          <Link href="/mm" className="hover:text-blue-300 transition">
            MiddleMan
          </Link>
          <Link href="/help" className="hover:text-blue-300 transition">
            Help
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            <div className="bg-gray-700 px-3 py-1 rounded">
              <span className="text-yellow-400">Credits:</span> 0
            </div>
            <div className="bg-gray-700 px-3 py-1 rounded">
              <span className="text-orange-400">BTC:</span> 0.00000000
            </div>
          </div>

          {session?.user && (
            <div className="relative group">
              <div className="flex items-center space-x-2 cursor-pointer">
                <Image
                  src={session.user.image || "/winter_soldier.gif"}
                  alt={session.user.name || "User"}
                  className="w-8 h-8 rounded-full"
                  width={32}
                  height={32}
                />
                <span>{session.user.name}</span>
              </div>
              <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 invisible group-hover:visible">
                <Link
                  href={`/users/${session.user.name}`}
                  className="block px-4 py-2 text-sm hover:bg-gray-600"
                >
                  Profile
                </Link>
                <Link
                  href="/settings"
                  className="block px-4 py-2 text-sm hover:bg-gray-600"
                >
                  Settings
                </Link>
                <button
                  onClick={() => signOut()}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-600"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
