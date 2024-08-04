import React from "react";
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

async function RecentTopics() {
  const threads = await getLatestThreads();

  return (
    <div className="bg-gray-800/80 backdrop-blur rounded-lg p-6 mb-8">
      <h3 className="text-xl font-bold mb-4">Recent Topics</h3>
      <ul className="space-y-2">
        {threads.map((thread: Thread) => (
          <li key={thread.id} className="bg-gray-900 p-4 rounded shadow">
            <a
              href={`/thread/${slugify(thread.title)}-${thread.id}`}
              className="font-semibold"
            >
              {thread.title}
            </a>
            <div className="text-sm text-gray-500">
              By {thread.username} | Last activity:{" "}
              {new Date(thread.last_post_at).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RecentTopics;
