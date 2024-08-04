import React from "react";
import Thread from "@/components/Thread";

async function getThread(id: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/threads/${id}`,
  );
  if (!response.ok) {
    throw new Error("Failed to fetch thread");
  }
  return response.json();
}

export default async function ThreadPage({
  params,
}: {
  params: { id: string };
}) {
  const { thread, posts } = await getThread(params.id);

  return (
    <main className="container mx-auto px-4 py-8">
      <Thread thread={thread} posts={posts} />
    </main>
  );
}
