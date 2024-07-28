"use client";

import React from "react";
import { useRouter } from "next/navigation";

const NewTopicButton = () => {
  const router = useRouter();

  const handleNewTopicClick = () => {
    router.push("/new-topic");
  };

  return (
    <button
      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
      onClick={handleNewTopicClick}
    >
      New Topic
    </button>
  );
};

export default NewTopicButton;
