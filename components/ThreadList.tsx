import React from "react";
import Link from "next/link";

interface Thread {
  id: number;
  title: string;
  username: string;
  category_name: string;
  post_count: number;
  last_post_at: string;
}

interface ThreadListProps {
  threads: Thread[];
}

const ThreadList: React.FC<ThreadListProps> = ({ threads }) => {
  if (!threads || threads.length === 0) {
    return (
      <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 mb-2">
        <h2 className="text-2xl font-bold mb-4">Threads</h2>
        <p>No threads available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 mb-2">
      <h2 className="text-2xl font-bold mb-4">Threads</h2>
      <table className="w-full">
        <thead>
          <tr className="text-left">
            <th className="py-2 px-4 bg-gray-700/80 rounded-tl-md">Title</th>
            <th className="py-2 px-4 bg-gray-700/80">Author</th>
            <th className="py-2 px-4 bg-gray-700/80">Category</th>
            <th className="py-2 px-4 bg-gray-700/80">Replies</th>
            <th className="py-2 px-4 bg-gray-700/80 rounded-tr-md">
              Last Post
            </th>
          </tr>
        </thead>
        <tbody>
          {threads.map((thread) => (
            <tr key={thread.id}>
              <td className="py-2 px-4 border-b border-gray-600/50">
                <Link
                  href={`/thread/${thread.id}`}
                  className="text-blue-400 hover:underline"
                >
                  {thread.title}
                </Link>
              </td>
              <td className="py-2 px-4 border-b border-gray-600/50">
                {thread.username}
              </td>
              <td className="py-2 px-4 border-b border-gray-600/50">
                {thread.category_name}
              </td>
              <td className="py-2 px-4 border-b border-gray-600/50">
                {thread.post_count - 1}
              </td>
              <td className="py-2 px-4 border-b border-gray-600/50">
                {new Date(thread.last_post_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ThreadList;
