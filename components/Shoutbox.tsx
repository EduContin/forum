"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { io } from "socket.io-client";

const MAX_MESSAGE_LENGTH = 100;

const Shoutbox = () => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);

  useEffect(() => {
    const newSocket = io("http://localhost:4000", {
      withCredentials: true,
    });
    setSocket(newSocket);

    newSocket.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    newSocket.on("messageUpdated", (updatedMessage) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === updatedMessage.id ? updatedMessage : msg,
        ),
      );
    });

    newSocket.on("message_error", (error) => {
      setErrorMessage(error);
      // Clear error message after 5 seconds
      setTimeout(() => setErrorMessage(""), 5000);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() !== "" && session) {
      if (inputMessage.length <= MAX_MESSAGE_LENGTH) {
        const newMessage = {
          id: Date.now(),
          user: session.user.name,
          message: inputMessage,
        };
        socket.emit("message", newMessage);
        setInputMessage("");
      } else {
        setErrorMessage("Message exceeds the maximum length");
      }
    }
  };

  const handleEditMessage = (messageId) => {
    setEditingMessageId(messageId);
    const messageToEdit = messages.find((msg) => msg.id === messageId);
    if (messageToEdit) {
      setInputMessage(messageToEdit.message);
    }
  };

  const handleUpdateMessage = () => {
    if (inputMessage.trim() !== "" && session && editingMessageId) {
      if (inputMessage.length <= MAX_MESSAGE_LENGTH) {
        const updatedMessage = {
          id: editingMessageId,
          user: session.user.name,
          message: inputMessage,
        };
        socket.emit("updateMessage", updatedMessage);
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
      <div className="h-64 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-2">
            <strong>{msg.user}: </strong>
            {msg.message}
            {session && session.user.name === msg.user && (
              <button
                onClick={() => handleEditMessage(msg.id)}
                className="ml-2 text-xs text-blue-500 hover:text-blue-600"
              >
                Edit
              </button>
            )}
          </div>
        ))}
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
