import React from "react";
import Thread from "@/components/Thread";

const apiUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function getThread(threadId: string) {
  const response = await fetch(
    `${apiUrl}/api/v1/threads?threadId=${threadId}`,
    { cache: "no-store" },
  );
  if (!response.ok) {
    throw new Error("Failed to fetch thread");
  }
  const threads = await response.json();
  return threads[0];
}

async function getPosts(threadId: string) {
  const response = await fetch(`${apiUrl}/api/v1/posts?threadId=${threadId}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }
  return response.json();
}

export default async function ThreadPage({
  params,
}: {
  params: { id: string };
}) {
  const threadId = params.id.split("-").pop();
  if (!threadId) {
    return <div>Thread not found</div>;
  }

  try {
    const [thread, posts] = await Promise.all([
      getThread(threadId),
      getPosts(threadId),
    ]);

    return (
      <main className="container mx-auto px-4 py-8">
        <Thread thread={thread} posts={posts} />
      </main>
    );
  } catch (error) {
    console.error("Error fetching thread or posts:", error);
    return <div>Error fetching thread or posts</div>;
  }
}
