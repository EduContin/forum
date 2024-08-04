import React from "react";
import ThreadList from "@/components/ThreadList";

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
      <h1 className="text-4xl font-bold mb-4">{category.name}</h1>
      <p className="text-xl mb-8">{category.description}</p>
      <ThreadList threads={threads} />
    </main>
  );
}
