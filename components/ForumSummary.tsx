import React from "react";

const ForumSummary = () => {
  const subForums = [
    {
      id: 1,
      name: "General Discussion",
      description: "Discuss general topics and share ideas.",
    },
    {
      id: 2,
      name: "Announcements",
      description: "Stay up-to-date with the latest news and announcements.",
    },
    {
      id: 3,
      name: "Feedback",
      description: "Provide feedback and suggestions to improve the forum.",
    },
    // Add more sub-forums as needed
  ];

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 mb-2">
      <h2 className="text-2xl font-bold mb-4">Sub-Forums</h2>
      <table className="w-full">
        <thead>
          <tr className="text-left">
            <th className="py-2 px-4 bg-gray-700/80 rounded-tl-md">
              Sub-Forum
            </th>
            <th className="py-2 px-4 bg-gray-700/80 rounded-tr-md">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {subForums.map((subForum) => (
            <tr key={subForum.id}>
              <td className="py-2 px-4 border-b border-gray-600/50">
                {subForum.name}
              </td>
              <td className="py-2 px-4 border-b border-gray-600/50">
                {subForum.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ForumSummary;
