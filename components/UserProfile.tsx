"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type UserProfileProps = {
  user: any;
  reputations: any[];
  currentUser: string | null | undefined;
};

export default function UserProfile({
  user,
  reputations,
  currentUser,
}: UserProfileProps) {
  const [showReputationPopup, setShowReputationPopup] = useState(false);
  const [reputationChange, setReputationChange] = useState(0);
  const [reputationComment, setReputationComment] = useState("");
  const [recentThreads, setRecentThreads] = useState([]);
  const popupRef = useRef<HTMLDivElement>(null);

  // TODO: Implement awards system API retrival
  const awards = [
    { name: "Diamond.svg" },
    { name: "Diamond.svg" },
    { name: "Diamond.svg" },
    { name: "Diamond.svg" },
    // Add more awards as needed
  ];

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setShowReputationPopup(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    const fetchRecentThreads = async () => {
      try {
        const res = await fetch(`/api/v1/threads?userId=${user.id}&pageSize=5`);
        if (res.ok) {
          const threads = await res.json();
          setRecentThreads(threads);
        } else {
          console.error("Failed to fetch recent threads");
        }
      } catch (error) {
        console.error("Error fetching recent threads:", error);
      }
    };

    fetchRecentThreads();
  }, [user.id]);

  const handleReputationSubmit = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/v1/users/${encodeURIComponent(
          user.username,
        )}/reputation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reputation_change: reputationChange,
            comment: reputationComment,
          }),
        },
      );

      if (res.ok) {
        window.location.reload();
      } else {
        console.error("Failed to update reputation");
      }
    } catch (error) {
      console.error("Error updating reputation:", error);
    }
  };

  const handleReputationDelete = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/v1/users/${encodeURIComponent(
          user.username,
        )}/reputation`,
        {
          method: "DELETE",
        },
      );

      if (res.ok) {
        window.location.reload();
      } else {
        console.error("Failed to delete reputation");
      }
    } catch (error) {
      console.error("Error deleting reputation:", error);
    }
  };

  return (
    <div className="min-h-screen text-white relative z-1">
      <header className="bg-gradient-to-r from-blue-600 to-purple-700 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-start ">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg mb-6 md:mb-0 md:mr-8"
            >
              <img
                src={user.avatar_url || "/winter_soldier.gif"}
                alt={user.username}
                width={160}
                height={160}
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center md:text-left"
            >
              <h1 className="text-4xl font-bold mb-2">{user.username}</h1>
              <p className="text-xl text-blue-200">{user.user_group}</p>
            </motion.div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-2 py-4">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-3">
            {/* Reputation and Likes */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gray-800 rounded-lg shadow-md p-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 bg-gray-700 rounded-lg">
                  <p
                    className={`text-2xl font-bold ${user.reputation >= 0 ? "text-green-500" : "text-red-500"}`}
                  >
                    {user.reputation}
                  </p>
                  <p className="text-xs text-gray-400">Reputation</p>
                  <span>
                    <button
                      className="font-bold text-base text-blue-400"
                      onClick={() => setShowReputationPopup(true)}
                    >
                      +
                    </button>
                  </span>
                </div>
                <div className="text-center p-2 bg-gray-700 rounded-lg">
                  <p className="text-2xl font-bold text-green-500">
                    {user.likes_received}
                  </p>
                  <p className="text-xs text-gray-400">Likes</p>
                </div>
              </div>
            </motion.section>

            {/* Information */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-gray-800 rounded-lg shadow-md p-3"
            >
              <h2 className="text-base font-semibold mb-2 text-blue-400">
                Information
              </h2>
              <div className="space-y-1 text-xs">
                {[
                  { label: "Status", value: user.status || "Offline" },
                  { label: "UID", value: user.uid },
                  { label: "Registration Date", value: user.registration_date },
                  { label: "Last Visit", value: user.last_visit },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between">
                    <span className="text-gray-400">{item.label}:</span>
                    <span>{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Blank space for future usergroup banners */}
            <div className="h-32"></div>
          </div>

          {/* Center Column */}
          <div className="md:col-span-3 space-y-3">
            {/* Stats */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-gray-800 rounded-lg shadow-md p-3"
            >
              <h2 className="text-base font-semibold mb-2 text-blue-400">
                Stats
              </h2>
              <div className="flex justify-between text-xs">
                {[
                  { label: "Threads", value: user.threads_count },
                  { label: "Posts", value: user.posts_count },
                  { label: "Vouches", value: user.vouches },
                  { label: "Credits", value: user.credits || 0 },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="font-bold">{stat.value}</p>
                    <p className="text-gray-400">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Signature (Ad Banner) */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-gray-800 rounded-lg shadow-md p-3 mt-auto"
            >
              <h2 className="text-base font-semibold mb-2 text-blue-400">
                Signature
              </h2>
              <div className="bg-gray-700 rounded-lg p-2 text-xs">
                {user.signature || "No signature set"}
              </div>
            </motion.section>
          </div>

          {/* Right Column */}
          <div className="md:col-span-2 space-y-3">
            {/* Awards */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="bg-gray-800 rounded-lg shadow-md p-3"
            >
              <h2 className="text-base font-semibold mb-2 text-blue-400">
                Awards
              </h2>
              <div className="bg-gray-900 rounded-lg p-2 min-h-[200px] max-h-[400px] overflow-y-auto">
                <div className="flex flex-wrap gap-2 p-1 items-start content-start">
                  {awards.map((award, index) => (
                    <div key={index} className="w-7 h-7 flex-shrink-0">
                      <img
                        src={`/badges/${award.name}`}
                        alt={award.name.slice(0, -4)}
                        className="w-full h-full object-contain"
                        title={award.name.slice(0, -4)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Recent Threads */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="bg-gray-800 rounded-lg shadow-md p-3"
            >
              <h2 className="text-base font-semibold mb-2 text-blue-400">
                Recent Threads
              </h2>
              <div className="space-y-2">
                {recentThreads.map((thread: any) => (
                  <div
                    key={thread.id}
                    className="bg-gray-700 rounded-lg p-2 text-xs"
                  >
                    <Link href={`/threads/${thread.id}`}>
                      <span className="text-blue-400 hover:underline font-semibold truncate block">
                        {thread.title}
                      </span>
                    </Link>
                    <p className="text-gray-400 mt-1">
                      Posted in {thread.category_name} on{" "}
                      {new Date(thread.created_at).toLocaleDateString()}
                    </p>
                    <p className="mt-1">
                      {thread.post_count} replies • Last post:{" "}
                      {new Date(thread.last_post_at).toLocaleString()}
                    </p>
                  </div>
                ))}
                {recentThreads.length === 0 && (
                  <p className="text-gray-400">No recent threads found.</p>
                )}
              </div>
            </motion.section>
          </div>
        </div>
      </main>
      <AnimatePresence>
        {showReputationPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
          >
            <motion.div
              ref={popupRef}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full max-h-[80vh] overflow-y-auto"
            >
              <h2 className="text-3xl font-bold mb-6 text-blue-400">
                Reputation
              </h2>
              <div className="space-y-4 mb-6">
                {reputations.map((reputation: any) => (
                  <div
                    key={reputation.id}
                    className="bg-gray-700 rounded-lg p-4 transition-all duration-300 hover:shadow-md"
                  >
                    <p>
                      <Link href={`/users/${reputation.voter_username}`}>
                        <span className="font-semibold text-blue-400 hover:underline">
                          {reputation.voter_username}
                        </span>
                      </Link>
                      :{" "}
                      <span
                        className={`${
                          reputation.reputation_change > 0
                            ? "text-green-500"
                            : "text-red-500"
                        } font-bold`}
                      >
                        {reputation.reputation_change > 0 ? "+" : ""}
                        {reputation.reputation_change}
                      </span>
                    </p>
                    <p className="text-gray-400 mt-1">{reputation.comment}</p>
                  </div>
                ))}
              </div>
              {currentUser && currentUser !== user.username && (
                <div className="bg-gray-700 rounded-lg p-6 mb-6">
                  <h3 className="text-2xl font-bold mb-4 text-blue-400">
                    Add/Edit Reputation
                  </h3>
                  <div className="mb-4">
                    <label className="block mb-2">Reputation Change:</label>
                    <select
                      className="w-full bg-gray-600 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={reputationChange || 0}
                      onChange={(e) =>
                        setReputationChange(parseInt(e.target.value))
                      }
                    >
                      <option value={0}>0</option>
                      <option value={5}>+5</option>
                      <option value={4}>+4</option>
                      <option value={3}>+3</option>
                      <option value={2}>+2</option>
                      <option value={1}>+1</option>
                      <option value={-1}>-1</option>
                      <option value={-2}>-2</option>
                      <option value={-3}>-3</option>
                      <option value={-4}>-4</option>
                      <option value={-5}>-5</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2">Comment:</label>
                    <textarea
                      className="w-full bg-gray-600 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={reputationComment}
                      onChange={(e) => setReputationComment(e.target.value)}
                      rows={3}
                    ></textarea>
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button
                      className="bg-blue-600 text-white rounded-md px-6 py-2 hover:bg-blue-700 transition-colors duration-300"
                      onClick={handleReputationSubmit}
                    >
                      Submit
                    </button>
                    <button
                      className="bg-red-600 text-white rounded-md px-6 py-2 hover:bg-red-700 transition-colors duration-300"
                      onClick={handleReputationDelete}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
              <button
                className="w-full bg-gray-700 text-blue-400 rounded-md px-6 py-3 hover:bg-gray-600 transition-colors duration-300"
                onClick={() => setShowReputationPopup(false)}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <style jsx>{`
        .truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
          display: block;
        }
      `}</style>
    </div>
  );
}
