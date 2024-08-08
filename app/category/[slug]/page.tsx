import React from "react";
import ThreadList from "@/components/ThreadList";
import Link from "next/link";

async function getCategoryThreads(categorySlug: string) {
  const apiUrl = "http://localhost:3000";
  const response = await fetch(
    `${apiUrl}/api/v1/threads?categorySlug=${categorySlug}&page=1&pageSize=10`,
    { cache: "no-store" },
  );
  if (!response.ok) {
    throw new Error("Failed to fetch threads");
  }
  return response.json();
}

async function getCategory(categorySlug: string) {
  const apiUrl = "http://localhost:3000";
  const response = await fetch(`${apiUrl}/api/v1/categories/${categorySlug}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch category");
  }
  return response.json();
}

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const categorySlug = params.slug;
  const [category, threads] = await Promise.all([
    getCategory(categorySlug),
    getCategoryThreads(categorySlug),
  ]);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">{category.name}</h1>
          <p className="text-xl">{category.description}</p>
        </div>
        <Link href={`/category/${categorySlug}/create`}>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
            Create Thread
          </button>
        </Link>
      </div>
      <ThreadList threads={threads} />
    </main>
  );
}
