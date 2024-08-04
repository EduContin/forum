"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { slugify } from "@/models/slugify";

interface Category {
  id: number;
  name: string;
  description: string;
  thread_count: number;
  post_count: number;
}

const ForumSummary: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/v1/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else {
          console.error("Failed to fetch categories");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 mb-2">
      <h2 className="text-2xl font-bold mb-4">Categories</h2>
      <table className="w-full">
        <thead>
          <tr className="text-left">
            <th className="py-2 px-4 bg-gray-700/80 rounded-tl-md">Category</th>
            <th className="py-2 px-4 bg-gray-700/80">Threads</th>
            <th className="py-2 px-4 bg-gray-700/80 rounded-tr-md">Posts</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td className="py-2 px-4 border-b border-gray-600/50">
                <Link href={`/category/${slugify(category.name)}`}>
                  <strong className="text-white hover:text-gray-300">
                    {category.name}
                  </strong>
                </Link>
                <p className="text-sm text-gray-500">{category.description}</p>
              </td>
              <td className="py-2 px-4 border-b border-gray-600/50">
                {category.thread_count}
              </td>
              <td className="py-2 px-4 border-b border-gray-600/50">
                {category.post_count}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ForumSummary;
