// components/ForumSummary.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { slugify } from "@/models/slugify";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isLoading, setIsLoading] = useState(true);

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
      } finally {
        setIsLoading(false);
      }
    };

    fetchSections();
  }, []);

  return (
    <div className="bg-gray-800/90 p-6 rounded-lg shadow-lg mb-8">
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <nav className="mb-6">
            <div className="bg-gray-900/80 rounded-lg p-2">
              <ul className="flex flex-wrap gap-2">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out ${
                        activeSection === section.name
                          ? "bg-blue-600 text-white shadow-lg transform scale-105"
                          : "text-slate-300 hover:bg-gray-700/70 hover:text-white"
                      }`}
                      onClick={() => setActiveSection(section.name)}
                      aria-pressed={activeSection === section.name}
                    >
                      {section.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
          <AnimatePresence mode="wait">
            {sections.map((section) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={activeSection === section.name ? "block" : "hidden"}
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-400 border-b border-gray-700">
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4 text-center">Threads</th>
                        <th className="py-3 px-4 text-center">Posts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.categories.map((category) => (
                        <tr
                          key={category.id}
                          className="border-b border-gray-700 last:border-b-0 hover:bg-gray-700/50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <Link
                              href={`/category/${slugify(category.name)}`}
                              className="font-semibold text-white hover:text-blue-300 transition-colors"
                            >
                              {category.name}
                            </Link>
                            <p className="text-sm text-gray-400 mt-1">
                              {category.description}
                            </p>
                          </td>
                          <td className="py-4 px-4 text-center text-gray-300">
                            {category.thread_count}
                          </td>
                          <td className="py-4 px-4 text-center text-gray-300">
                            {category.post_count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default ForumSummary;
