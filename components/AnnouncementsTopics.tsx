"use client";

import React from "react";

const StickyTopics = () => {
  const stickyTopics = [
    {
      id: 1,
      title: "Forum Rules and Guidelines",
      author: "Admin",
      lastActivity: "2023-05-01",
    },
    {
      id: 2,
      title: "Frequently Asked Questions",
      author: "Moderator",
      lastActivity: "2023-05-15",
    },
    // Add more sticky topics as needed
  ];

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 mb-8">
      <h3 className="text-xl font-bold mb-4">Announcements</h3>
      <ul className="space-y-2">
        {stickyTopics.map((topic) => (
          <li key={topic.id} className="bg-gray-900 p-4 rounded">
            <div className="font-semibold">{topic.title}</div>
            <div className="text-sm text-gray-500">
              Posted by
              <a
                href={`/users/${topic.author}`}
                className="font-semibold text-gray-300"
              >
                {" "}
                {topic.author}{" "}
              </a>{" "}
              | Last activity: {topic.lastActivity}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StickyTopics;
