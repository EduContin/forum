"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import customEmojis from "@/models/custom-emojis";
import SessionProviderClient from "./SessionProviderClient";
import debounce from "lodash/debounce";
import { useRouter } from "next/navigation";
import { FaTrashAlt } from "react-icons/fa";

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
  is_deleted: boolean;
}

interface User {
  credits: number;
  banned: any;
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
  const router = useRouter();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [posts, setPosts] = useState(initialPosts);
  const [, setUserSignature] = useState("");
  const [users, setUsers] = useState<{ [key: string]: User }>({});
  const [content, setContent] = useState("");
  const [, setContentHistory] = useState<string[]>([""]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [selectedFontSize, setSelectedFontSize] = useState("medium");
  const [selectionRange, setSelectionRange] = useState<[number, number] | null>(
    null,
  );
  const [isAdmin, setIsAdmin] = useState(false);

  const MAX_CHARACTERS = 5000; // Set the maximum character limit
  const CHARACTERS_PER_LINE = 1000; // Set the number of characters per line

  useEffect(() => {
    if (!thread || !thread.title) {
      router.push("/");
    }
  }, [thread, router]);

  const handleDeletePost = async (postId: number) => {
    if (!isAdmin) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post?",
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/v1/posts?postId=${postId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const deletedPost = await response.json();
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === deletedPost.id ? { ...post, ...deletedPost } : post,
          ),
        );
        alert("Post deleted successfully");
      } else {
        console.error("Failed to delete post");
        alert("Failed to delete post. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("An error occurred while deleting the post. Please try again.");
    }
  };

  useEffect(() => {
    if (session?.user?.name) {
      fetch(`/api/v1/users/${session.user.name}`)
        .then((response) => response.json())
        .then((user) => {
          setIsAdmin(user.user_group === "Admin");
        })
        .catch((error) => console.error("Error fetching user data:", error));
    }
  }, [session]);

  const handleDeleteThread = async () => {
    if (!isAdmin) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this entire thread?",
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/v1/threads/${thread.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        alert("Thread deleted successfully");
        router.push("/"); // Redirect to home page or thread list
      } else {
        console.error("Failed to delete thread");
        alert("Failed to delete thread. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting thread:", error);
      alert("An error occurred while deleting the thread. Please try again.");
    }
  };

  const updateContent = useCallback(
    (newContent: string) => {
      if (newContent.length <= MAX_CHARACTERS) {
        // Apply auto line break
        const lines = newContent.split("\n");
        const formattedLines = lines.map((line) => {
          if (line.length > CHARACTERS_PER_LINE) {
            const chunks = [];
            for (let i = 0; i < line.length; i += CHARACTERS_PER_LINE) {
              chunks.push(line.slice(i, i + CHARACTERS_PER_LINE));
            }
            return chunks.join("\n");
          }
          return line;
        });
        const formattedContent = formattedLines.join("\n");

        setContent(formattedContent);
        setContentHistory((prev) => [
          ...prev.slice(0, historyIndex + 1),
          formattedContent,
        ]);
        setHistoryIndex((prev) => prev + 1);
      }
    },
    [historyIndex],
  );

  const insertTextStyle = useCallback(
    (openTag: string, closeTag: string) => {
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);
        const newContent =
          content.substring(0, start) +
          openTag +
          selectedText +
          closeTag +
          content.substring(end);
        updateContent(newContent);
        textarea.focus();
        textarea.setSelectionRange(
          start + openTag.length,
          end + openTag.length,
        );
      }
    },
    [content, updateContent],
  );

  const insertColorTag = useCallback(
    (color: string) => {
      const textarea = textareaRef.current;
      if (textarea) {
        const start = selectionRange
          ? selectionRange[0]
          : textarea.selectionStart;
        const end = selectionRange ? selectionRange[1] : textarea.selectionEnd;
        let selectedText = content.substring(start, end);

        // Remove existing color tags if any
        selectedText = selectedText.replace(
          /\[color=[^\]]+\]|\[\/color\]/g,
          "",
        );

        // Add new color tag
        const newContent =
          content.substring(0, start) +
          `[color=${color}]${selectedText}[/color]` +
          content.substring(end);

        updateContent(newContent);
        textarea.focus();
        const newStart = start;
        const newEnd = start + `[color=${color}]${selectedText}[/color]`.length;
        textarea.setSelectionRange(newStart, newEnd);
        setSelectionRange([newStart, newEnd]);
      }
    },
    [content, updateContent, selectionRange],
  );

  const handleColorChange = debounce((color: string) => {
    setSelectedColor(color);
    insertColorTag(color);
  }, 200);

  const insertImage = useCallback(() => {
    const url = prompt("Enter image URL:");
    if (url) {
      insertTextStyle(`[img]${url}[/img]`, "");
    }
  }, [insertTextStyle]);

  const insertLink = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.substring(start, end);
      const url = prompt("Enter URL:");
      const text = selectedText || prompt("Enter link text:");
      if (url && text) {
        const newContent =
          content.substring(0, start) +
          `[url=${url}]${text}[/url]` +
          content.substring(end);
        updateContent(newContent);
      }
    }
  }, [content, updateContent]);

  const formatContent = (content: string) => {
    return content
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
  };

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
      const usernames = Array.from(new Set(posts.map((post) => post.username)));
      for (let i = 0; i < usernames.length; i++) {
        const username = usernames[i];
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              <a
                href={`/users/${user.username}`}
                className={`font-semibold ${user.banned ? "line-through text-gray-400" : ""}`}
              >
                {user.username}
              </a>
            </h3>
          </div>
          <Image
            src={user.avatar_url || `/winter_soldier.gif`}
            alt="Profile Picture"
            width={10}
            height={10}
            className="absolute left-1/2 transform -translate-x-1/2 -bottom-12 w-24 h-24 rounded-full border-4 border-gray-800 object-cover"
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
          <p
            className={`text-gray-300 font-bold text-sm mb-4 text-center ${user.banned ? "text-red-500" : ""}`}
          >
            {user.banned ? "Banned" : user.user_group}
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
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent =
        content.substring(0, start) + emoji + content.substring(end);
      setContent(newContent);
      setShowEmojiPicker(false);

      // Set the cursor position after the inserted emoji
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    }
  };

  const handleFontSizeChange = (size: string) => {
    setSelectedFontSize(size);
    insertTextStyle(`[size=${size}]`, "[/size]");
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
          content: content,
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
      {thread && thread.title ? (
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 mb-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{thread.title}</h2>
            {isAdmin && (
              <button
                onClick={handleDeleteThread}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                Delete Thread
              </button>
            )}
          </div>
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
                  <div className="rounded-lg p-4 bg-gray-700/50 overflow-hidden">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">
                        {new Date(post.created_at).toLocaleString()}
                      </span>
                      {isAdmin && !post.is_deleted && (
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
                        >
                          Delete Post
                        </button>
                      )}
                    </div>
                    <div className="whitespace-pre-wrap overflow-wrap-break-word word-break-break-word max-w-full">
                      {post.is_deleted ? (
                        <div className="flex items-center space-x-2 text-gray-500 italic">
                          <FaTrashAlt className="text-red-500" />
                          <span>This content was deleted by a moderator</span>
                        </div>
                      ) : (
                        renderContentWithEmojisAndBBCode(post.content)
                      )}
                    </div>
                    {!post.is_deleted && (
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
                    )}
                  </div>
                  {!post.is_deleted && users[post.username]?.signature && (
                    <div className="mt-4 bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto">
                      <h3 className="text-lg font-semibold">User Signature:</h3>
                      <div className="overflow-wrap-break-word word-break-break-word max-w-full">
                        {renderContentWithEmojisAndBBCode(
                          users[post.username].signature,
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {session && session.user ? (
            <form onSubmit={handleReplySubmit} className="mt-4">
              <div className="relative">
                <div className="mb-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => insertTextStyle("[b]", "[/b]")}
                    className="px-2 py-1 bg-gray-600 text-white rounded"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTextStyle("[i]", "[/i]")}
                    className="px-2 py-1 bg-gray-600 text-white rounded"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTextStyle("[u]", "[/u]")}
                    className="px-2 py-1 bg-gray-600 text-white rounded"
                  >
                    U
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTextStyle("[s]", "[/s]")}
                    className="px-2 py-1 bg-gray-600 text-white rounded"
                  >
                    S
                  </button>
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer"
                  />
                  <select
                    value={selectedFontSize}
                    onChange={(e) => handleFontSizeChange(e.target.value)}
                    className="px-2 py-1 bg-gray-600 text-white rounded"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                  <select
                    onChange={(e) =>
                      insertTextStyle(`[align=${e.target.value}]`, "[/align]")
                    }
                    className="px-2 py-1 bg-gray-600 text-white rounded"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => insertTextStyle("[quote]", "[/quote]")}
                    className="px-2 py-1 bg-gray-600 text-white rounded"
                  >
                    Quote
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTextStyle("[code]", "[/code]")}
                    className="px-2 py-1 bg-gray-600 text-white rounded"
                  >
                    Code
                  </button>
                  <button
                    type="button"
                    onClick={insertImage}
                    className="px-2 py-1 bg-gray-600 text-white rounded"
                  >
                    Image
                  </button>
                  <button
                    type="button"
                    onClick={insertLink}
                    className="px-2 py-1 bg-gray-600 text-white rounded"
                  >
                    Link
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTextStyle("[hidden]", "[/hidden]")}
                    className="px-2 py-1 bg-gray-600 text-white rounded"
                  >
                    Hidden
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTextStyle("[spoiler]", "[/spoiler]")}
                    className="px-2 py-1 bg-gray-600 text-white rounded"
                  >
                    Spoiler
                  </button>
                </div>
                <textarea
                  id="content"
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => updateContent(e.target.value)}
                  onSelect={() => {
                    if (textareaRef.current) {
                      setSelectionRange([
                        textareaRef.current.selectionStart,
                        textareaRef.current.selectionEnd,
                      ]);
                    }
                  }}
                  className="w-full px-3 py-2 pr-10 bg-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  rows={5}
                  required
                />
                <div className="text-sm text-gray-400 mt-1">
                  {content.length}/{MAX_CHARACTERS} characters
                </div>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="absolute top-12 right-2 p-1.5 pl-2 pr-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 focus:outline-none transition-colors"
                >
                  😀
                </button>
              </div>
              {showEmojiPicker && (
                <div className="relative ml-10 right-6 mt-2 p-2 bg-gray-700 rounded-md z-10">
                  {Object.keys(customEmojis).map((emoji) => (
                    <span
                      key={emoji}
                      onClick={() => handleEmojiClick(emoji)}
                      className="inline-block m-1 p-1 hover:bg-gray-600 rounded cursor-pointer"
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
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="px-4 mt-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {showPreview ? "Hide Preview" : "Show Preview"}
                </button>
              </div>
              {showPreview && (
                <div className="mb-4">
                  <h3 className="text-xl font-bold mb-2">Preview:</h3>
                  <div
                    className="bg-gray-700/50 rounded-md p-4 whitespace-pre-wrap overflow-wrap-break-word word-break-break-word max-w-full"
                    dangerouslySetInnerHTML={{ __html: formatContent(content) }}
                  />
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
      ) : null}
    </SessionProviderClient>
  );
};

export default Thread;
