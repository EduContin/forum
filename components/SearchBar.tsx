"use client";

import React, { useState } from "react";

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    // Perform search logic here
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSearch} className="flex items-center">
        <input
          type="text"
          placeholder="Search topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 rounded-l-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Search
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
