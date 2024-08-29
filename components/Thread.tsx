"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import customEmojis from "@/models/custom-emojis";
import SessionProviderClient from "./SessionProviderClient";

interface Post {
  id: number;
  content: string;
  username: string;
  created_at: string;
  user_id: number;
  avatar_url: string;
  likes_count: number;
  is_liked_by_user: boolean;
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

const Thread: React.FC<ThreadProps> = ({ thread, posts: initialPosts }) => {
  const { data: session } = useSession();
  const [replyContent, setReplyContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [posts, setPosts] = useState(initialPosts);

  useEffect(() => {
    const fetchLikes = async () => {
      if (session?.user?.id) {
        const postIds = initialPosts.map((post) => post.id).join(",");
        try {
          const response = await fetch(
            `/api/v1/likes?postIds=${postIds} ${session.user.id}`,
          );
          if (response.ok) {
            const likedPosts = await response.json();
            setPosts((prevPosts) =>
              prevPosts.map((post) => ({
                ...post,
                is_liked_by_user: likedPosts[post.id] || false,
              })),
            );
          }
        } catch (error) {
          console.error("Error fetching likes:", error);
        }
      }
    };

    fetchLikes();
  }, [session, initialPosts]);

  const renderContentWithEmojisAndBBCode = (content: string) => {
    const parsedContent = content
      .replace(/\[b\](.*?)\[\/b\]/g, "<b>$1</b>")
      .replace(/\[i\](.*?)\[\/i\]/g, "<i>$1</i>")
      .replace(/\[u\](.*?)\[\/u\]/g, "<u>$1</u>")
      .replace(/\[s\](.*?)\[\/s\]/g, "<s>$1</s>")
      .replace(
        /\[color=(\w+|#[0-9a-fA-F]{6})\](.*?)\[\/color\]/g,
        "<span style='color:$1'>$2</span>",
      )
      .replace(
        /\[size=(\w+)\](.*?)\[\/size\]/g,
        "<span style='font-size:$1'>$2</span>",
      )
      .replace(
        /\[align=(\w+)\](.*?)\[\/align\]/g,
        "<div style='text-align:$1'>$2</div>",
      )
      .replace(
        /\[quote\](.*?)\[\/quote\]/g,
        "<blockquote class='border-l-4 border-gray-500 pl-4 my-2 italic'>$1</blockquote>",
      )
      .replace(/\[code\](.*?)\[\/code\]/g, "<pre><code>$1</code></pre>")
      .replace(
        /\[img\](.*?)\[\/img\]/g,
        "<img src='$1' alt='User uploaded image' />",
      )
      .replace(
        /\[url=([^\]]+)\](.*?)\[\/url\]/g,
        "<a href='$1' target='_blank' rel='noopener noreferrer'>$2</a>",
      )
      .replace(
        /\[hidden\](.*?)\[\/hidden\]/g,
        "<span class='hidden-content'>Like this post to see the content</span>",
      )
      .replace(
        /\[spoiler\](.*?)\[\/spoiler\]/g,
        "<span class='spoiler-content'>$1</span>",
      )
      .replace(/\n/g, "<br>");

    const parts = parsedContent.split(/(:[a-zA-Z0-9_+-]+:)/g);

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
      return (
        <span key={index} dangerouslySetInnerHTML={{ __html: part }}></span>
      );
    });
  };

  const handleEmojiClick = (emoji: string) => {
    setReplyContent((prevContent) => prevContent + emoji);
    setShowEmojiPicker(false);
  };

  const handleLike = async (postId: number) => {
    if (!session || !session.user) {
      console.error("User not authenticated");
      return;
    }

    try {
      const response = await fetch(`/api/v1/likes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          userId: session.user.id,
        }),
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setPosts(
          posts.map((post) =>
            post.id === postId ? { ...post, ...updatedPost } : post,
          ),
        );
      } else {
        console.error("Failed to like post");
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session || !session.user) {
      console.error("User not authenticated");
      return;
    }

    try {
      const response = await fetch(`/api/v1/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: replyContent,
          threadId: thread.id,
          userId: session.user.id,
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
    <SessionProviderClient session={session}>
      <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 mb-2">
        <h2 className="text-2xl font-bold mb-4">{thread.title}</h2>
        <p className="text-sm text-gray-400 mb-4">
          Posted by
          <a href={`/users/${thread.username}`}> {thread.username} </a>
          in {thread.category_name} on{" "}
          {new Date(thread.created_at).toLocaleString()}
        </p>
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <img
                  src={post.avatar_url || `/winter_soldier.gif`}
                  alt="Profile Picture"
                  width={40}
                  height={40}
                  className="rounded-lg mr-2 h-14 w-14"
                />
                <a href={`/users/${thread.username}`} className="font-semibold">
                  {post.username}
                </a>
                <span className="text-sm text-gray-400 ml-auto">
                  {new Date(post.created_at).toLocaleString()}
                </span>
              </div>
              <div className="whitespace-pre-wrap">
                {renderContentWithEmojisAndBBCode(post.content)}
              </div>
              <div className="mt-2 flex items-center">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center space-x-1 ${
                    post.is_liked_by_user ? "text-blue-500" : "text-gray-400"
                  } hover:text-blue-500 transition-colors`}
                  disabled={!session || !session.user}
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  <span>{post.likes_count}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        {session && session.user ? (
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
              <div className="absolute right-6 mt-2 p-2 bg-gray-700 rounded-md z-10">
                {Object.keys(customEmojis).map((emoji) => (
                  <span
                    key={emoji}
                    onClick={() => handleEmojiClick(emoji)}
                    className="m-1 p-1 rounded cursor-pointer"
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
        ) : (
          <p className="mt-4 text-gray-400">
            Please log in to reply to this thread.
          </p>
        )}
      </div>
    </SessionProviderClient>
  );
};

export default Thread;
