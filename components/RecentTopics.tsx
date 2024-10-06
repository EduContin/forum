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
  const apiUrl = process.env.NEXT_PUBLIC_APP_URL;
  const response = await fetch(`${apiUrl}/api/v1/threads?page=1&pageSize=10`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch threads");
  }
  return response.json();
}

const limitTitle = (title: string, maxLength: number = 70): string => {
  if (title.length > maxLength) {
    return title.slice(0, maxLength - 3) + "...";
  }
  return title;
};

const timeSinceLastActivity = (lastActivity: string): string => {
  const now = new Date();
  const lastActivityTime = new Date(lastActivity);
  const delta = now.getTime() - lastActivityTime.getTime();

  const minutes = Math.floor(delta / 60000);
  const hours = Math.floor(delta / 3600000);
  const days = Math.floor(delta / 86400000);
  const months = Math.floor(days / 30);

  if (months >= 1) {
    return `${months} month${months > 1 ? "s" : ""} ago`;
  } else if (days >= 1) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  } else if (hours >= 1) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (minutes >= 1) {
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else {
    return "just now";
  }
};

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
              {limitTitle(thread.title)}
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
              | Last activity: {timeSinceLastActivity(thread.last_post_at)}
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
