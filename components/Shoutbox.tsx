"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import { DefaultEventsMap } from "@socket.io/component-emitter";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const MAX_MESSAGE_LENGTH = 100;

interface Message {
  id: number;
  username: string;
  message: string;
}

const customEmojis: { [key: string]: string } = {
  ":noo:": "/no.jpeg",
  ":winter:": "/winter_soldier.gif",
};

const Shoutbox = () => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [socket, setSocket] = useState<Socket<
    DefaultEventsMap,
    DefaultEventsMap
  > | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const shoutboxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const newSocket = io("http://localhost:4000", { withCredentials: true });
    setSocket(newSocket);

    newSocket.on("message", (message: Message) => {
      setMessages((prevMessages) => [message, ...prevMessages]);
    });

    newSocket.on("messageUpdated", (updatedMessage: Message) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === updatedMessage.id ? updatedMessage : msg,
        ),
      );
    });

    newSocket.on("recentMessages", (recentMessages: Message[]) => {
      setMessages(recentMessages);
    });

    newSocket.on("message_error", (error: string) => {
      setErrorMessage(error);
      setTimeout(() => setErrorMessage(""), 5000);
    });

    fetch("/api/v1/shoutbox/history")
      .then((response) => response.json())
      .then((data) => {
        setMessages(data.rows);
      })
      .catch((error) =>
        console.error("Error fetching shoutbox history:", error),
      );

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  const renderMessageWithEmojis = (message: string) => {
    const parts = message.split(/(:[a-zA-Z0-9_+-]+:)/g);
    return parts.map((part, index) => {
      const emojiUrl = customEmojis[part as keyof typeof customEmojis];
      if (emojiUrl) {
        return (
          <Image
            key={index}
            src={emojiUrl}
            alt={part}
            className="inline-block h-5 w-5 align-text-bottom"
            width={20}
            height={20}
          />
        );
      }
      return part;
    });
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() !== "" && session) {
      if (inputMessage.length <= MAX_MESSAGE_LENGTH) {
        const newMessage = {
          id: Date.now(),
          username: session.user.name,
          message: inputMessage,
        };
        if (socket) {
          socket.emit("message", newMessage);
        }
        setInputMessage("");

        try {
          await fetch("/api/v1/shoutbox/history", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: session.user.name,
              message: inputMessage,
            }),
          });
        } catch (error) {
          console.error("Error sending message:", error);
          setErrorMessage("Failed to send message. Please try again.");
        }
      } else {
        setErrorMessage("Message exceeds the maximum length");
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (editingMessageId) {
        handleUpdateMessage();
      } else {
        handleSendMessage();
      }
    }
  };

  const handleEditMessage = (messageId: number) => {
    const messageToEdit = messages.find((msg) => msg.id === messageId);
    if (messageToEdit) {
      setEditingMessageId(messageId);
      setInputMessage(messageToEdit.message);
      inputRef.current?.focus();
    }
  };

  const handleUpdateMessage = () => {
    if (inputMessage.trim() !== "" && session && editingMessageId) {
      if (inputMessage.length <= MAX_MESSAGE_LENGTH) {
        const updatedMessage = {
          id: editingMessageId,
          username: session.user.name,
          message: inputMessage,
        };
        if (socket) {
          socket.emit("updateMessage", updatedMessage);
        }
        setInputMessage("");
        setEditingMessageId(null);
      } else {
        setErrorMessage("Message exceeds the maximum length");
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setInputMessage("");
  };

  const handleEmojiClick = (emoji: string) => {
    setInputMessage((prevMessage) => prevMessage + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-3 text-white">Shoutbox</h2>
      <div className="h-64 overflow-y-auto mb-3 space-y-1" ref={shoutboxRef}>
        <AnimatePresence>
          {messages.length > 0 ? (
            messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="bg-gray-800 py-1.5 px-2 rounded-md flex items-center"
              >
                <img
                  src="/winter_soldier.gif"
                  alt="Profile"
                  className="h-5 w-5 rounded-full mr-2 flex-shrink-0"
                />
                <div className="flex-grow min-w-0 flex items-center">
                  <span className="font-semibold text-blue-400 text-xs mr-1">
                    {msg.username}:
                  </span>
                  <p className="text-gray-300 text-xs truncate">
                    {renderMessageWithEmojis(msg.message)}
                  </p>
                </div>
                {session && session.user.name === msg.username && (
                  <button
                    onClick={() => handleEditMessage(msg.id)}
                    className="text-xs text-gray-400 hover:text-blue-400 transition-colors ml-1 flex-shrink-0"
                  >
                    Edit
                  </button>
                )}
              </motion.div>
            ))
          ) : (
            <p className="text-gray-400 text-sm">No messages yet.</p>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-3 relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={inputMessage}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className="flex-grow p-2 rounded-l-md bg-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          placeholder={
            editingMessageId ? "Edit your message..." : "Type your message..."
          }
          maxLength={MAX_MESSAGE_LENGTH}
        />
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-1.5 pl-2 pr-2 ml-1 bg-gray-600 text-white rounded-md hover:bg-gray-500 focus:outline-none transition-colors"
        >
          😀
        </button>
        {showEmojiPicker && (
          <div className="absolute right-0 bottom-full mb-2 bg-gray-800 p-2 rounded-md shadow-lg">
            {Object.keys(customEmojis).map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                className="m-1 p-1 hover:bg-gray-700 rounded"
              >
                <img
                  src={customEmojis[emoji]}
                  alt={emoji}
                  className="w-6 h-6"
                />
              </button>
            ))}
          </div>
        )}
      </div>
      {errorMessage && (
        <p className="text-red-500 mt-1 text-xs">{errorMessage}</p>
      )}
      {editingMessageId && (
        <button
          onClick={handleCancelEdit}
          className="mt-2 px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none transition-colors text-xs"
        >
          Cancel
        </button>
      )}
    </div>
  );
};

export default Shoutbox;
