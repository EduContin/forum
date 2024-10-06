import React from "react";
import ThreadList from "@/components/ThreadList";
import Link from "next/link";
import { slugify } from "@/models/slugify";

interface Subcategory {
  id: number;
  name: string;
  description: string;
  thread_count: number;
  post_count: number;
}

async function getCategoryData(categorySlug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const response = await fetch(`${apiUrl}/api/v1/categories/${categorySlug}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch category data");
  }
  const data = await response.json();
  return {
    ...data,
    subcategories: data.subcategories || [],
  };
}

async function getCategoryThreads(categoryId: number, page = 1, pageSize = 10) {
  const apiUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const response = await fetch(
    `${apiUrl}/api/v1/threads?categoryId=${categoryId}&page=${page}&pageSize=${pageSize}`,
    { cache: "no-store" },
  );
  if (!response.ok) {
    throw new Error("Failed to fetch threads");
  }
  return response.json();
}

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const categorySlug = params.slug;
  const categoryData = await getCategoryData(categorySlug);
  const threads = await getCategoryThreads(categoryData.id);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">{categoryData.name}</h1>
          <p className="text-xl text-gray-300">{categoryData.description}</p>
        </div>
        <Link href={`/category/${slugify(categoryData.name)}/create`}>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
            Create Thread
          </button>
        </Link>
      </div>

      {categoryData.subcategories && categoryData.subcategories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Subcategories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryData.subcategories.map((subcategory: Subcategory) => (
              <Link
                key={subcategory.id}
                href={`/category/${slugify(subcategory.name)}`}
                className="block p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <h3 className="text-xl font-semibold">{subcategory.name}</h3>
                <p className="text-gray-400">{subcategory.description}</p>
                <div className="mt-2 text-sm text-gray-500">
                  Threads: {subcategory.thread_count} | Posts:{" "}
                  {subcategory.post_count}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-semibold mb-4">
          Threads in {categoryData.name}
        </h2>
        {threads.length > 0 ? (
          <ThreadList threads={threads} />
        ) : (
          <p className="text-gray-400">No threads in this category yet.</p>
        )}
      </div>
    </main>
  );
}
