"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import { DefaultEventsMap } from "@socket.io/component-emitter";

const MAX_MESSAGE_LENGTH = 100;

interface Message {
  id: number;
  username: string;
  message: string;
}

// Custom emoji mapping
const customEmojis: { [key: string]: string } = {
  ":smile:": "/path/to/smile.gif",
  ":laugh:": "/path/to/laugh.png",
  ":wink:": "/path/to/wink.gif",
  ":heart:": "/path/to/heart.png",
  ":thumbsup:": "/path/to/thumbsup.gif",
  ":noo:": "/no.jpeg",
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
  const shoutboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSocket = io("http://localhost:4000", {
      withCredentials: true,
    });
    setSocket(newSocket);

    newSocket.on("message", (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
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
      const emojiUrl = customEmojis[part];
      if (emojiUrl) {
        return (
          <img
            key={index}
            src={emojiUrl}
            alt={part}
            className="inline-block h-8 w-8 align-text-bottom"
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

  const handleEditMessage = (messageId: number) => {
    const messageToEdit = messages.find((msg) => msg.id === messageId);
    if (messageToEdit) {
      setEditingMessageId(messageId);
      setInputMessage(messageToEdit.message);
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

  return (
    <div className="bg-gray-800 p-4 rounded-md mb-8">
      <h2 className="text-2xl font-bold mb-4">Shoutbox</h2>
      <div className="h-64 overflow-y-auto" ref={shoutboxRef}>
        {messages.length > 0 ? (
          messages
            .slice()
            .reverse()
            .map((msg) => (
              <div key={msg.id} className="mb-2">
                <strong>{msg.username}: </strong>
                {renderMessageWithEmojis(msg.message)}
                {session && session.user.name === msg.username && (
                  <button
                    onClick={() => handleEditMessage(msg.id)}
                    className="ml-2 text-xs text-blue-500 hover:text-blue-600"
                  >
                    Edit
                  </button>
                )}
              </div>
            ))
        ) : (
          <p>No messages yet.</p>
        )}
      </div>
      <div className="mt-4">
        <input
          type="text"
          value={inputMessage}
          onChange={handleInputChange}
          className="w-full p-2 rounded-md bg-gray-700 text-white focus:outline-none"
          placeholder="Type your message..."
          maxLength={MAX_MESSAGE_LENGTH}
        />
        {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
        {editingMessageId ? (
          <div>
            <button
              onClick={handleUpdateMessage}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
            >
              Update
            </button>
            <button
              onClick={handleCancelEdit}
              className="mt-2 ml-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={handleSendMessage}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
          >
            Send
          </button>
        )}
      </div>
    </div>
  );
};

export default Shoutbox;
