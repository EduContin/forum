import React from "react";

const RecentTopics = () => {
  const recentTopics = [
    {
      id: 1,
      title: "New Product Launch Discussion",
      author: "ProductManager",
      lastActivity: "2023-06-10",
    },
    {
      id: 2,
      title: "Customer Feedback Thread",
      author: "CustomerSupport",
      lastActivity: "2023-06-09",
    },
    {
      id: 3,
      title: "Upcoming Webinar Announcement",
      author: "MarketingTeam",
      lastActivity: "2023-06-08",
    },
    // Add more recent topics as needed
  ];

  return (
    <div className="bg-gray-800/80 backdrop-blur rounded-lg p-6 mb-8">
      <h3 className="text-xl font-bold mb-4">Recent Topics</h3>
      <ul className="space-y-2">
        {recentTopics.map((topic) => (
          <li key={topic.id} className="bg-gray-900 p-4 rounded shadow">
            <div className="font-semibold">{topic.title}</div>
            <div className="text-sm text-gray-500">
              Posted by {topic.author} | Last activity: {topic.lastActivity}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentTopics;
