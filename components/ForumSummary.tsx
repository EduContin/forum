// components/ForumSummary.tsx
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

interface Section {
  id: number;
  name: string;
  categories: Category[];
}

const ForumSummary: React.FC = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await fetch("/api/v1/forum-structure");
        if (response.ok) {
          const data = await response.json();
          setSections(data);
          if (data.length > 0) {
            setActiveSection(data[0].name);
          }
        } else {
          console.error("Failed to fetch forum structure");
        }
      } catch (error) {
        console.error("Error fetching forum structure:", error);
      }
    };

    fetchSections();
  }, []);

  return (
    <div className="bg-gray-800 text-white">
      <nav className="container mx-auto px-4 py-2">
        <ul className="flex space-x-4 overflow-x-auto">
          {sections.map((section) => (
            <li key={section.id}>
              <button
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeSection === section.name
                    ? "bg-gray-900 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
                onClick={() => setActiveSection(section.name)}
              >
                {section.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="container mx-auto px-4 py-6">
        {sections.map((section) => (
          <div
            key={section.id}
            className={activeSection === section.name ? "block" : "hidden"}
          >
            <h2 className="text-2xl font-bold mb-4">{section.name}</h2>
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-800 text-left">
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Threads</th>
                    <th className="py-3 px-4">Posts</th>
                  </tr>
                </thead>
                <tbody>
                  {section.categories.map((category) => (
                    <tr key={category.id} className="border-b border-gray-800">
                      <td className="py-4 px-4">
                        <Link href={`/category/${slugify(category.name)}`}>
                          <span className="font-medium text-blue-400 hover:text-blue-300">
                            {category.name}
                          </span>
                        </Link>
                        <p className="text-sm text-gray-400 mt-1">
                          {category.description}
                        </p>
                      </td>
                      <td className="py-4 px-4">{category.thread_count}</td>
                      <td className="py-4 px-4">{category.post_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForumSummary;
