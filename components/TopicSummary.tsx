import React from "react";

const TopicSummary = () => {
  const topics = [
    {
      id: 1,
      title: "Introduction and Welcome",
      author: "Admin",
      replies: 5,
      views: 100,
      lastActivity: "2023-06-01",
    },
    {
      id: 2,
      title: "Upcoming Events",
      author: "EventCoordinator",
      replies: 10,
      views: 250,
      lastActivity: "2023-06-02",
    },
    {
      id: 3,
      title: "New Feature Suggestions",
      author: "ProductManager",
      replies: 20,
      views: 500,
      lastActivity: "2023-06-03",
    },
    // Add more topics as needed
  ];

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4">Topic Summary</h2>
      <table className="w-full">
        <thead>
          <tr className="text-left">
            <th className="py-2 px-4 bg-gray-700/80 rounded-tl-md">Topic</th>
            <th className="py-2 px-4 bg-gray-700/80">Author</th>
            <th className="py-2 px-4 bg-gray-700/80 text-center">Replies</th>
            <th className="py-2 px-4 bg-gray-700/80 text-center">Views</th>
            <th className="py-2 px-4 bg-gray-700/80 rounded-tr-md">
              Last Activity
            </th>
          </tr>
        </thead>
        <tbody>
          {topics.map((topic) => (
            <tr key={topic.id}>
              <td className="py-2 px-4 border-b border-gray-600/50">
                {topic.title}
              </td>
              <td className="py-2 px-4 border-b border-gray-600/50">
                {topic.author}
              </td>
              <td className="py-2 px-4 border-b border-gray-600/50 text-center">
                {topic.replies}
              </td>
              <td className="py-2 px-4 border-b border-gray-600/50 text-center">
                {topic.views}
              </td>
              <td className="py-2 px-4 border-b border-gray-600/50">
                {topic.lastActivity}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopicSummary;
