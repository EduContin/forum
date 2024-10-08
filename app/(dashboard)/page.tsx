"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import CircularProgress from "@mui/material/CircularProgress";
import dynamic from "next/dynamic";

const DynamicShoutbox = dynamic(() => import("@/components/Shoutbox"), {
  loading: () => <p>Loading Shoutbox...</p>,
});

const DynamicForumSummary = dynamic(() => import("@/components/ForumSummary"), {
  loading: () => <p>Loading Forum Summary...</p>,
});

const DynamicStickyTopics = dynamic(
  () => import("@/components/AnnouncementsTopics"),
  {
    loading: () => <p>Loading Sticky Topics...</p>,
  },
);

const DynamicRecentTopics = dynamic(() => import("@/components/RecentTopics"), {
  loading: () => <p>Loading Recent Topics...</p>,
});

const MemoizedMountainBackground = React.memo(
  dynamic(() => import("@/components/MountainBackground")),
);
const DynamicAnimatedDashboard = dynamic(
  () => import("@/components/AnimatedDashboard"),
);

interface ForumDashboardProps {
  // Add any props if needed
}

const ForumDashboard: React.FC<ForumDashboardProps> = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <CircularProgress />;
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen text-white relative">
      <MemoizedMountainBackground isLoading={false} isSuccess={false} />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <DynamicAnimatedDashboard>
          <h1 className="text-4xl font-bold mb-8 text-center">
            Welcome, {session?.user?.name}
          </h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2">
              <DynamicShoutbox />
              <DynamicForumSummary />
            </div>
            <div>
              <DynamicStickyTopics />
              <DynamicRecentTopics />
            </div>
          </div>
          <div className="flex justify-between"></div>
        </DynamicAnimatedDashboard>
      </div>
    </div>
  );
};

export default ForumDashboard;
