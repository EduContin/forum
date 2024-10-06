"use client";

import React from "react";

interface BanUserButtonProps {
  username: any;
  isAdmin: boolean;
}

const BanUserButton: React.FC<BanUserButtonProps> = ({ username, isAdmin }) => {
  if (!isAdmin) {
    return null;
  }
  const handleBanUser = async () => {
    if (confirm("Are you sure you want to ban this user?")) {
      try {
        const response = await fetch(`/api/v1/users/${username}/ban`, {
          method: "POST",
        });
        if (response.ok) {
          alert("User banned successfully");
        } else {
          const data = await response.json();
          alert(`Failed to ban user: ${data.message}`);
        }
      } catch (error) {
        console.error("Error banning user:", error);
        alert("An error occurred while trying to ban the user");
      }
    }
  };

  return (
    <button
      onClick={handleBanUser}
      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
    >
      Ban User
    </button>
  );
};

export default BanUserButton;
