"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/models/slugify";
import customEmojis from "@/models/custom-emojis";
import Image from "next/image";
import { useSession } from "next-auth/react";
import debounce from "lodash/debounce";

interface CreateThreadFormProps {
  categoryId: number;
}

const CreateThreadForm: React.FC<CreateThreadFormProps> = ({ categoryId }) => {
  const { data: session } = useSession();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [contentHistory, setContentHistory] = useState<string[]>([""]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [selectedFontSize, setSelectedFontSize] = useState("medium");
  const [selectionRange, setSelectionRange] = useState<[number, number] | null>(
    null,
  );

  const MAX_CHARACTERS = 5000; // Set the maximum character limit
  const CHARACTERS_PER_LINE = 1000; // Set the number of characters per line
  const MAX_TITLE_CHARACTERS = 70;

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

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    if (newTitle.length <= MAX_TITLE_CHARACTERS) {
      setTitle(newTitle);
    }
  };

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      setContent(contentHistory[historyIndex - 1]);
    }
  }, [historyIndex, contentHistory]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "z") {
        event.preventDefault();
        undo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [undo]);

  const handleEmojiClick = (emoji: string) => {
    updateContent(content + emoji);
    setShowEmojiPicker(false);
  };

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

  const handleColorChange = debounce((color: string) => {
    setSelectedColor(color);
    insertColorTag(color);
  }, 200);

  const handleFontSizeChange = (size: string) => {
    setSelectedFontSize(size);
    insertTextStyle(`[size=${size}]`, "[/size]");
  };

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
          onChange={handleTitleChange}
          className="w-full px-3 py-2 bg-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
          maxLength={MAX_TITLE_CHARACTERS}
        />
        <div className="text-sm text-gray-400 mt-1">
          {title.length}/{MAX_TITLE_CHARACTERS} characters
        </div>
      </div>
      <div className="relative mb-4">
        <label htmlFor="content" className="block mb-2">
          Content
        </label>
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
              className="bg-gray-700/50 rounded-md p-4 whitespace-pre-wrap break-all"
              dangerouslySetInnerHTML={{ __html: formatContent(content) }}
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
