import React from "react";
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

  const recentTopics = [
    {
      id: 1,
      title: "New Product Launch Discussion",
      author: "ProductManager",
      lastActivity: "2023-06-10",
    },
    {
      id: 2,
      title: "Customer Feedback Thread",
      author: "CustomerSupport",
      lastActivity: "2023-06-09",
    },
    {
      id: 3,
      title: "Upcoming Webinar Announcement",
      author: "MarketingTeam",
      lastActivity: "2023-06-08",
    },
    // Add more recent topics as needed
  ];

  return (
    <div className="bg-gray-800/80 backdrop-blur rounded-lg p-6 mb-8">
      <h3 className="text-xl font-bold mb-4">Recent Topics</h3>
      <ul className="space-y-2">
        {recentTopics.map((topic) => (
          <li key={topic.id} className="bg-gray-900 p-4 rounded shadow">
            <div className="font-semibold">{topic.title}</div>
            <div className="text-sm text-gray-500">
              Posted by {topic.author} | Last activity: {topic.lastActivity}
            </div>
          </li>
        ))}
      </ul>

      <ul className="space-y-2">
        {threads.map((thread: Thread) => (
          <li key={thread.id} className="bg-gray-900 p-4 rounded shadow">
            <div className="font-semibold">{thread.title}</div>
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
