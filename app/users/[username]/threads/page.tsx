// app/users/[username]/threads/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import ThreadList from "@/components/ThreadList";

interface Thread {
  id: number;
  title: string;
  username: string;
  category_name: string;
  post_count: number;
  last_post_at: string;
  first_post_likes: number;
}

const UserThreads: React.FC = () => {
  const userUsername =
    typeof window !== "undefined" ? window.location.pathname.split("/")[2] : "";
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const threadsPerPage = 10;

  useEffect(() => {
    const fetchUserThreads = async (page: number) => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/v1/users/${userUsername}/threads?page=${page}&limit=${threadsPerPage}`,
        );
        if (response.ok) {
          const data = await response.json();
          setThreads(data.threads);
          setTotalPages(data.totalPages);
        } else {
          console.error("Failed to fetch user threads");
        }
      } catch (error) {
        console.error("Error fetching user threads:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userUsername) {
      fetchUserThreads(currentPage);
    }
  }, [userUsername, currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-100">
        {userUsername}&apos;s Threads
      </h1>
      <ThreadList threads={threads} />
      <div className="mt-6 flex justify-center">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`mx-1 px-3 py-1 rounded ${
              currentPage === page
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
};

export default UserThreads;
