"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/models/slugify";
import customEmojis from "@/models/custom-emojis";
import Image from "next/image";
import { useSession } from "next-auth/react";

interface CreateThreadFormProps {
  categoryId: number;
}

const CreateThreadForm: React.FC<CreateThreadFormProps> = ({ categoryId }) => {
  const { data: session } = useSession();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiClick = (emoji: string) => {
    setContent((prevContent) => prevContent + emoji);
    setShowEmojiPicker(false);
  };

  const insertTextStyle = (openTag: string, closeTag: string) => {
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
      setContent(newContent);
      textarea.focus();
      textarea.setSelectionRange(start + openTag.length, end + openTag.length);
    }
  };

  const formatContent = (content: string) => {
    return content
      .replace(/\[b\](.*?)\[\/b\]/g, "<b>$1</b>")
      .replace(/\[u\](.*?)\[\/u\]/g, "<u>$1</u>")
      .replace(
        /\[size=large\](.*?)\[\/size\]/g,
        "<span class='text-lg'>$1</span>",
      )
      .replace(
        /\[hidden\](.*?)\[\/hidden\]/g,
        "<span class='hidden-content'>$1</span>",
      )
      .replace(
        /\[spoiler\](.*?)\[\/spoiler\]/g,
        "<span class='spoiler-content blur'>$1</span>",
      )
      .replace(/\n/g, "<br>");
  };

  const toggleSpoiler = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.currentTarget.classList.toggle("blur");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/v1/threads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          categoryId,
          userId: session?.user.id,
        }),
      });

      if (response.ok) {
        const { threadId } = await response.json();
        const slug = slugify(title);
        router.push(`/thread/${slug}-${threadId}`);
      } else {
        console.error("Failed to create thread");
      }
    } catch (error) {
      console.error("Error creating thread:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 mb-4"
    >
      <h2 className="text-2xl font-bold mb-4">Create New Thread</h2>
      <div className="mb-4">
        <label htmlFor="title" className="block mb-2">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="content" className="block mb-2">
          Content
        </label>
        <div className="relative">
          <div className="mb-2 flex space-x-2">
            <button
              type="button"
              onClick={() => insertTextStyle("[b]", "[/b]")}
              className="px-2 py-1 bg-gray-600 text-white rounded"
            >
              B
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
              onClick={() => insertTextStyle("[size=large]", "[/size]")}
              className="px-2 py-1 bg-gray-600 text-white rounded"
            >
              Large
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
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows={5}
            required
          />
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute top-12 right-2 p-1.5 pl-2 pr-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 focus:outline-none transition-colors"
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
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {showPreview ? "Hide Preview" : "Show Preview"}
          </button>
        </div>
        {showPreview && (
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-2">Preview:</h3>
            <div
              className="bg-gray-700/50 rounded-md p-4 whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: formatContent(content) }}
              onClick={(event) => {
                if (
                  event.target instanceof HTMLSpanElement &&
                  event.target.classList.contains("spoiler-content")
                ) {
                  // toggleSpoiler only in elements with spoiler-content
                  toggleSpoiler(event.target.classList.toggle("blur")
                }
              }}
            />
          </div>
        )}
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        Create Thread
      </button>
    </form>
  );
};

export default CreateThreadForm;
