import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import MountainBackground from "@/components/MountainBackground";

async function fetchUserProfile(username: string) {
  const res = await fetch(
    `http://localhost:3000/api/v1/users/${encodeURIComponent(username)}`,
  );

  if (!res.ok) {
    throw new Error("Failed to fetch user profile");
  }

  return res.json();
}

export default async function UserProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const user = await fetchUserProfile(params.username.toLowerCase());

  if (!user) {
    notFound();
  }

  return (
    <div className="min-h-screen text-white relative">
      <MountainBackground isLoading={false} isSuccess={false} />
      <div className="h-64 bg-gradient-to-r from-blue-600 to-purple-700"></div>
      <div className="container mx-auto px-4">
        <div className="relative -mt-24 flex flex-col items-center md:flex-row md:items-end">
          <div className="flex-shrink-0 mb-4 md:mb-0">
            <Image
              src={user.avatar_url || "/winter_soldier.gif"}
              alt={user.username}
              className="w-40 h-40 rounded-full border-4 border-white shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
              width={160}
              height={160}
            />
          </div>
          <div className="md:ml-6 text-center md:text-left">
            <h1 className="text-4xl font-bold text-white mb-2">
              {user.username}
            </h1>
            <p className="text-xl text-gray-300">{user.user_group}</p>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-800 rounded-lg shadow-md p-6 animate-fade-in">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">Bio</h2>
            <p className="text-gray-300">{user.bio || "No bio available"}</p>
          </div>
          <div className="bg-gray-800 rounded-lg shadow-md p-6 animate-fade-in">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">Stats</h2>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span className="text-gray-400">Threads:</span>
                <span className="text-gray-200">{user.threads_count}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">Posts:</span>
                <span className="text-gray-200">{user.posts_count}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">Likes Received:</span>
                <span className="text-gray-200">{user.likes_received}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">Reputation:</span>
                <span className="text-gray-200">{user.reputation}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">Vouches:</span>
                <span className="text-gray-200">{user.vouches}</span>
              </li>
            </ul>
          </div>
          <div className="bg-gray-800 rounded-lg shadow-md p-6 animate-fade-in">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">Activity</h2>
            <p className="text-gray-300">
              Last Seen: {user.last_seen || "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
