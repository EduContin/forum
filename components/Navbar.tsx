"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchAvatarUrl = async () => {
      if (session?.user?.name) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/users/${session.user.name}`,
          );
          const userData = await response.json();
          setAvatarUrl(userData.avatar_url);
        } catch (error) {
          console.error("Error fetching avatar URL:", error);
        }
      }
    };

    fetchAvatarUrl();
  }, [session]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
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
            <Link href="/affiliate" className="hover:text-blue-300 transition">
              Affiliate
            </Link>
            <Link href="/help" className="hover:text-blue-300 transition">
              Help
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <div className="bg-gray-700 px-3 py-1 rounded-lg">
                <span className="text-yellow-400">Credits:</span> 0
              </div>
              <div className="bg-gray-700 px-3 py-1 rounded-lg">
                <span className="text-orange-400">BTC:</span> 0.00000000
              </div>
            </div>

            {session?.user && (
              <div className="relative">
                <div
                  className="flex items-center space-x-2 cursor-pointer"
                  onClick={toggleDropdown}
                >
                  <Image
                    src={avatarUrl || "/winter_soldier.gif"}
                    alt={session.user.name || "User"}
                    width={32}
                    height={32}
                    className="rounded-lg w-7 h-7"
                  />
                  <span>{session.user.name}</span>
                </div>
                {isDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-lg py-1 z-50"
                    onClick={handleDropdownClick}
                  >
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
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
