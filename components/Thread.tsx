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
  signature: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
  avatar_url: string;
  bio: string | null;
  user_group: string;
  threads_count: number;
  posts_count: number;
  likes_received: number;
  reputation: number;
  vouches: number;
  last_seen: string | null;
  signature: string;
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
  const [userSignature, setUserSignature] = useState("");
  const [users, setUsers] = useState<{ [key: string]: User }>({});

  useEffect(() => {
    const fetchLikes = async () => {
      if (session?.user?.id) {
        const postIds = initialPosts.map((post) => post.id).join(",");
        try {
          const response = await fetch(
            `/api/v1/likes?postIds=${postIds}&userId=${session.user.id}`,
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

    const fetchUsers = async () => {
      const usernames = new Set(posts.map((post) => post.username));
      for (const username of usernames) {
        try {
          const response = await fetch(`/api/v1/users/${username}`);
          if (response.ok) {
            const user = await response.json();
            setUsers((prevUsers) => ({ ...prevUsers, [username]: user }));
          }
        } catch (error) {
          console.error(`Error fetching user ${username}:`, error);
        }
      }
    };

    fetchLikes();
    fetchUsers();
  }, [session, initialPosts]);

  useEffect(() => {
    const fetchSignature = async () => {
      if (session?.user?.name) {
        try {
          const response = await fetch(`/api/v1/users/${session.user.name}`);
          if (response.ok) {
            const user = await response.json();
            setUserSignature(user.signature);
          }
        } catch (error) {
          console.error("Error fetching signature:", error);
        }
      }
    };

    fetchSignature();
  });

  const renderUserProfile = (username: string) => {
    const user = users[username];
    if (!user) return null;

    return (
      <div className="bg-gray-800 rounded-lg overflow-hidden max-w-xs mx-auto">
        {/* Cover image and profile picture */}
        <div className="relative">
          <div className="h-24 bg-gradient-to-r from-blue-600 to-purple-700 flex items-end justify-center pb-2">
            <h3 className="text-xl font-bold text-white mb-12">
              <a href={`/users/${user.username}`} className="font-semibold">
                {user.username}
              </a>
            </h3>
          </div>
          <img
            src={user.avatar_url || `/winter_soldier.gif`}
            alt="Profile Picture"
            className="absolute left-1/2 transform -translate-x-1/2 -bottom-12 w-24 h-24 rounded-full border-4 border-gray-800"
          />
        </div>

        <div className="pt-16 px-4 pb-6">
          {/* Reputation and Likes */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-700 rounded-lg">
              <p
                className={`text-2xl font-bold ${
                  user.reputation >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {user.reputation}
              </p>
              <p className="text-xs text-gray-400">Reputation</p>
            </div>
            <div className="text-center p-3 bg-gray-700 rounded-lg">
              <p className="text-2xl font-bold text-green-500">
                {user.likes_received}
              </p>
              <p className="text-xs text-gray-400">Likes</p>
            </div>
          </div>

          {/* User group */}
          <p className="text-gray-300 font-bold text-sm mb-4 text-center">
            {user.user_group}
          </p>

          {/* User details */}
          <div className="text-xs text-gray-300 space-y-2">
            <p>
              <span className="font-semibold">POSTS:</span> {user.posts_count}
            </p>
            <p>
              <span className="font-semibold">THREADS:</span>{" "}
              {user.threads_count}
            </p>
            <p>
              <span className="font-semibold">JOINED:</span>{" "}
              {new Date(user.created_at).toLocaleDateString()}
            </p>
            <p>
              <span className="font-semibold">VOUCHES:</span> {user.vouches}
            </p>
            <p>
              <span className="font-semibold">CREDITS:</span>{" "}
              {user.credits || 0}
            </p>
          </div>
        </div>
      </div>
    );
  };

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
        /\[spoiler\](.*?)\[\/spoiler\]/g,
        "<span class='spoiler-content'>$1</span>",
      )
      .replace(/\[hidden\](.*?)\[\/hidden\]/g, (match, content) => {
        const firstPost = posts[0];
        return firstPost.is_liked_by_user
          ? "<span style='color:#ff0000'>" + content + "</span>"
          : "<span class='hidden-content'>Like this post to see the content</span>";
      })
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
            <div key={post.id} className="flex">
              <div className=" pr-4">{renderUserProfile(post.username)}</div>
              <div className="w-5/6">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">
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
                        post.is_liked_by_user
                          ? "text-blue-500"
                          : "text-gray-400"
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
                {userSignature && (
                  <div className="mt-4 bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto">
                    <h3 className="text-lg font-semibold">User Signature:</h3>
                    <p>{renderContentWithEmojisAndBBCode(userSignature)}</p>
                  </div>
                )}
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
