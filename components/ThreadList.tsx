import React from "react";
import Link from "next/link";
import { slugify } from "@/models/slugify";
import { FaComments, FaUser, FaFolder, FaClock, FaHeart } from "react-icons/fa";

// components/ThreadList.tsx

interface Thread {
  id: number;
  title: string;
  username: string;
  category_name: string;
  post_count: number;
  last_post_at: string;
  first_post_likes: number;
}

interface ThreadListProps {
  threads: Thread[];
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

const ThreadList: React.FC<ThreadListProps> = ({ threads }) => {
  if (!threads || threads.length === 0) {
    return (
      <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 mb-2 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-100">Threads</h2>
        <p className="text-gray-300">No threads available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 mb-2 shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-100">Threads</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-300">
              <th className="py-3 px-4 bg-gray-700/80 rounded-tl-md">Title</th>
              <th className="py-3 px-4 bg-gray-700/80">Author</th>
              <th className="py-3 px-4 bg-gray-700/80">Category</th>
              <th className="py-3 px-4 bg-gray-700/80">Replies</th>
              <th className="py-3 px-4 bg-gray-700/80">Likes</th>
              <th className="py-3 px-4 bg-gray-700/80 rounded-tr-md">
                Last Activity
              </th>
            </tr>
          </thead>
          <tbody>
            {threads.map((thread) => (
              <tr
                key={thread.id}
                className="hover:bg-gray-700/50 transition-colors duration-200"
              >
                <td className="py-3 px-4 border-b border-gray-600/50">
                  <Link
                    href={`/thread/${slugify(thread.title)}-${thread.id}`}
                    className="text-blue-400 hover:text-blue-300 flex items-center"
                  >
                    <FaComments className="mr-2 flex-shrink-0" />
                    <span className="truncate" title={thread.title}>
                      {limitTitle(thread.title)}
                    </span>
                  </Link>
                </td>
                <td className="py-3 px-4 border-b border-gray-600/50 text-gray-300">
                  <div className="flex items-center hover:text-gray-200">
                    <FaUser className="mr-2 text-gray-400 flex-shrink-0" />
                    <a href={`/users/${thread.username}`}>{thread.username}</a>
                  </div>
                </td>
                <td className="py-3 px-4 border-b border-gray-600/50 text-gray-300">
                  <div className="flex items-center">
                    <FaFolder className="mr-2 text-gray-400 flex-shrink-0" />
                    {thread.category_name}
                  </div>
                </td>
                <td className="py-3 px-4 border-b border-gray-600/50 text-gray-300">
                  {thread.post_count - 1}
                </td>
                <td className="py-3 px-4 border-b border-gray-600/50 text-gray-300">
                  <div className="flex items-center">
                    <FaHeart className="mr-2 text-red-400 flex-shrink-0" />
                    {thread.first_post_likes}
                  </div>
                </td>
                <td className="py-3 px-4 border-b border-gray-600/50 text-gray-300">
                  <div className="flex items-center">
                    <FaClock className="mr-2 text-gray-400 flex-shrink-0" />
                    {timeSinceLastActivity(thread.last_post_at)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ThreadList;
