"use client";

import React, { useState, useEffect } from "react";
import { slugify } from "@/models/slugify";

interface Thread {
  id: number;
  title: string;
  username: string;
  category_name: string;
  post_count: number;
  last_post_at: string;
}

async function getLatestThreads() {
  const apiUrl = "http://localhost:3000";
  const response = await fetch(`${apiUrl}/api/v1/threads?page=1&pageSize=10`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch threads");
  }
  return response.json();
}

function RecentTopics() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        setIsLoading(true);
        const latestThreads = await getLatestThreads();
        setThreads(latestThreads);
        setError(null);
      } catch (err) {
        setError("Failed to fetch threads");
      } finally {
        setIsLoading(false);
      }
    };

    fetchThreads();

    const intervalId = setInterval(fetchThreads, 30000);

    return () => clearInterval(intervalId);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="bg-gray-800/80 backdrop-blur rounded-lg p-6 mb-8">
      <h3 className="text-xl font-bold mb-4">Recent Topics</h3>
      <ul className="space-y-2">
        {threads.map((thread: Thread) => (
          <li key={thread.id} className="bg-gray-900 p-4 rounded shadow">
            <a
              href={`/thread/${slugify(thread.title)}-${thread.id}`}
              className="font-semibold truncate"
              title={thread.title}
            >
              {thread.title}
            </a>
            <div className="text-sm text-gray-500">
              By
              <a
                href={`/users/${thread.username}`}
                className="font-semibold text-gray-300"
              >
                {" "}
                {thread.username}{" "}
              </a>
              | Last activity: {new Date(thread.last_post_at).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
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

export default RecentTopics;
