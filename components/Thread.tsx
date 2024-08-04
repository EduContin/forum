"use client";

import React, { useState } from "react";
import Image from "next/image";
import customEmojis from "@/models/custom-emojis";

interface Post {
  id: number;
  content: string;
  username: string;
  created_at: string;
  user_id: number;
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
  const [replyContent, setReplyContent] = useState("");

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const renderContentWithEmojis = (content: string) => {
    const parts = content.split(/(:[a-zA-Z0-9_+-]+:)/g);

    return parts.map((part, index) => {
      const emojiUrl = customEmojis[part as keyof typeof customEmojis];
      if (emojiUrl) {
        return (
          <Image
            key={index}
            src={emojiUrl}
            alt={part}
            width={20}
            height={20}
            className="inline-block h-7 w-7"
          />
        );
      }
      return part;
    });
  };

  const handleEmojiClick = (emoji: string) => {
    setReplyContent((prevContent) => prevContent + emoji);
    setShowEmojiPicker(false);
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/v1/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: replyContent,
          threadId: thread.id,
          userId: 1, // Replace with the actual user ID from authentication
        }),
      });

      if (response.ok) {
        // Refresh the page or update the posts list
        window.location.reload();
      } else {
        console.error("Failed to submit reply");
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
    }
  };

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
            <div className="flex items-center mb-2">
              <Image
                src={`https://avatars.dicebear.com/api/identicon/${post.user_id}.svg`}
                alt="Profile Picture"
                width={40}
                height={40}
                className="rounded-full mr-2"
              />
              <span className="font-semibold">{post.username}</span>
              <span className="text-sm text-gray-400 ml-auto">
                {new Date(post.created_at).toLocaleString()}
              </span>
            </div>
            <div className="whitespace-pre-wrap">
              {renderContentWithEmojis(post.content)}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleReplySubmit} className="mt-4">
        <div className="relative">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows={4}
            placeholder="Write your reply..."
            required
          />
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute top-2 right-2 p-1.5 pl-2 pr-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 focus:outline-none transition-colors"
          >
            😀
          </button>
        </div>
        {showEmojiPicker && (
          <div className="absolute mt-2 p-2 bg-gray-700 rounded-md z-10">
            {Object.keys(customEmojis).map((emoji) => (
              <span
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                className="m-1 p-1 hover:bg-gray-600 rounded cursor-pointer"
              >
                <Image
                  src={customEmojis[emoji]}
                  alt={emoji}
                  width={20}
                  height={20}
                />
              </span>
            ))}
          </div>
        )}
        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Submit Reply
        </button>
      </form>
    </div>
  );
};

export default Thread;
