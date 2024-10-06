"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import debounce from "lodash/debounce";

const MAX_CHARACTERS = 250; // Set the maximum character limit
const CHARACTERS_PER_LINE = 250; // Set the number of characters per line
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [signature, setSignature] = useState("");
  const [avatarUrl, setavatarUrl] = useState("");
  const [historyIndex, setHistoryIndex] = useState(0);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [, setContentHistory] = useState<string[]>([""]);
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedFontSize, setSelectedFontSize] = useState("medium");
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [selectionRange, setSelectionRange] = useState<[number, number] | null>(
    null,
  );

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

        setSignature(formattedContent);
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
        const selectedText = signature.substring(start, end);
        const newContent =
          signature.substring(0, start) +
          openTag +
          selectedText +
          closeTag +
          signature.substring(end);
        updateContent(newContent);
        textarea.focus();
        textarea.setSelectionRange(
          start + openTag.length,
          end + openTag.length,
        );
      }
    },
    [signature, updateContent],
  );

  const insertColorTag = useCallback(
    (color: string) => {
      const textarea = textareaRef.current;
      if (textarea) {
        const start = selectionRange
          ? selectionRange[0]
          : textarea.selectionStart;
        const end = selectionRange ? selectionRange[1] : textarea.selectionEnd;
        let selectedText = signature.substring(start, end);

        // Remove existing color tags if any
        selectedText = selectedText.replace(
          /\[color=[^\]]+\]|\[\/color\]/g,
          "",
        );

        // Add new color tag
        const newContent =
          signature.substring(0, start) +
          `[color=${color}]${selectedText}[/color]` +
          signature.substring(end);

        updateContent(newContent);
        textarea.focus();
        const newStart = start;
        const newEnd = start + `[color=${color}]${selectedText}[/color]`.length;
        textarea.setSelectionRange(newStart, newEnd);
        setSelectionRange([newStart, newEnd]);
      }
    },
    [signature, updateContent, selectionRange],
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
      const selectedText = signature.substring(start, end);
      const url = prompt("Enter URL:");
      const text = selectedText || prompt("Enter link text:");
      if (url && text) {
        const newContent =
          signature.substring(0, start) +
          `[url=${url}]${text}[/url]` +
          signature.substring(end);
        updateContent(newContent);
      }
    }
  }, [signature, updateContent]);

  const handleColorChange = debounce((color: string) => {
    setSelectedColor(color);
    insertColorTag(color);
  }, 200);

  const handleFontSizeChange = (size: string) => {
    setSelectedFontSize(size);
    insertTextStyle(`[size=${size}]`, "[/size]");
  };

  const formatContent = (signature: string) => {
    return signature
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
        "<span class='hidden-signature'>Like this post to see the signature</span>",
      )
      .replace(
        /\[spoiler\](.*?)\[\/spoiler\]/g,
        "<span class='spoiler-signature'>$1</span>",
      )
      .replace(/\n/g, "<br>");
  };

  useEffect(() => {
    if (!session) {
      router.push("/login");
    }
  }, [router, session]);

  const updateSetting = async (settingType: string, data: any) => {
    try {
      const response = await fetch("/api/v1/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settingType, ...data }),
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess(result.message);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "An error occurred");
      }
    } catch (error) {
      setError(`An error occurred while updating ${settingType}`);
    }
  };

  const handleEmailUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateSetting("email", { email });
  };

  const handleSignatureUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateSetting("signature", { signature });
  };

  const handleProfilePictureUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(avatarUrl);
      const blob = await response.blob();
      console.log("Comparing blob size", blob.size, MAX_IMAGE_SIZE);
      if (blob.size > MAX_IMAGE_SIZE) {
        setError("Profile picture size exceeds the maximum allowed (2MB)");
        return;
      }
      updateSetting("profilePicture", { avatarUrl });
    } catch (error) {
      setError("Invalid image URL or unable to fetch the image");
    }
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    updateSetting("password", { currentPassword, newPassword });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">User Settings</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      <div className="space-y-8">
        <form onSubmit={handleEmailUpdate} className="space-y-4">
          <h2 className="text-2xl font-semibold">Update Email</h2>
          <div>
            <label htmlFor="email" className="block mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Update Email
          </button>
        </form>

        <form onSubmit={handleSignatureUpdate} className="space-y-4">
          <h2 className="text-2xl font-semibold">Update Signature</h2>
          <div>
            <label htmlFor="signature" className="block mb-1">
              Signature
            </label>
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
              id="signature"
              ref={textareaRef}
              value={signature}
              onChange={(e) => updateContent(e.target.value)}
              onSelect={() => {
                if (textareaRef.current) {
                  setSelectionRange([
                    textareaRef.current.selectionStart,
                    textareaRef.current.selectionEnd,
                  ]);
                }
              }}
              className="w-full px-3 py-2 border rounded"
              required
            />
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
                  className="bg-gray-700/50 rounded-md p-4 whitespace-pre-wrap break-all"
                  dangerouslySetInnerHTML={{ __html: formatContent(signature) }}
                />
              </div>
            )}
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Update Signature
          </button>
        </form>

        <form onSubmit={handleProfilePictureUpdate} className="space-y-4">
          <h2 className="text-2xl font-semibold">Update Profile Picture</h2>
          <div>
            <label htmlFor="avatarUrl" className="block mb-1">
              Profile Picture URL
            </label>
            <input
              type="url"
              id="avatarUrl"
              value={avatarUrl}
              onChange={(e) => setavatarUrl(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Update Profile Picture
          </button>
        </form>

        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <h2 className="text-2xl font-semibold">Change Password</h2>
          <div>
            <label htmlFor="currentPassword" className="block mb-1">
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block mb-1">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}
