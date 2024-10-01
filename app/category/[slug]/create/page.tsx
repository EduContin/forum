import React from "react";
import CreateThreadForm from "@/components/CreateThreadForm";

async function getCategory(categorySlug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const response = await fetch(`${apiUrl}/api/v1/categories/${categorySlug}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch category");
  }
  return response.json();
}

export default async function CreateThreadPage({
  params,
}: {
  params: { slug: string };
}) {
  const categorySlug = params.slug;
  const category = await getCategory(categorySlug);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">
        Create New Thread in {category.name}
      </h1>
      <CreateThreadForm categoryId={category.id} />
    </main>
  );
}
