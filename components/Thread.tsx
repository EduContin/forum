import React from "react";

interface Post {
  id: number;
  content: string;
  username: string;
  created_at: string;
}

interface ThreadProps {
  thread: {
    id: number;
    title: string;
    username: string;
    category_name: string;
    created_at: string;
  };
  posts: Post[];
}

const Thread: React.FC<ThreadProps> = ({ thread, posts }) => {
  return (
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 mb-2">
      <h2 className="text-2xl font-bold mb-4">{thread.title}</h2>
      <p className="text-sm text-gray-400 mb-4">
        Posted by {thread.username} in {thread.category_name} on{" "}
        {new Date(thread.created_at).toLocaleString()}
      </p>
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">{post.username}</span>
              <span className="text-sm text-gray-400">
                {new Date(post.created_at).toLocaleString()}
              </span>
            </div>
            <p>{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Thread;
