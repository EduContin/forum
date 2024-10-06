"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CircularProgress } from "@mui/material";
import ForumSummary from "@/components/ForumSummary";
import StickyTopics from "@/components/AnnouncementsTopics";
import RecentTopics from "@/components/RecentTopics";
import AnimatedDashboard from "@/components/AnimatedDashboard";
import MountainBackground from "@/components/MountainBackground";
import Shoutbox from "@/components/Shoutbox";

export default function ForumDashboard() {
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
      <MountainBackground isLoading={false} isSuccess={false} />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <AnimatedDashboard>
          <h1 className="text-4xl font-bold mb-8 text-center">
            Welcome, {session?.user?.name}
          </h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2">
              <Shoutbox />
              <ForumSummary />
            </div>
            <div>
              <StickyTopics />
              <RecentTopics />
            </div>
          </div>
          <div className="flex justify-between"></div>
        </AnimatedDashboard>
      </div>
    </div>
  );
}
