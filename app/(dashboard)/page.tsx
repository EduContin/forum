import React from "react";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { Alert, Button, CircularProgress } from "@mui/material";
import ForumSummary from "@/components/ForumSummary";
import TopicSummary from "@/components/TopicSummary";
import SearchBar from "@/components/SearchBar";
import StickyTopics from "@/components/AnnouncementsTopics";
import RecentTopics from "@/components/RecentTopics";
import NewTopicButton from "@/components/NewTopicButton";
import LogoutButton from "@/components/LogoutButton";
import AnimatedDashboard from "@/components/AnimatedDashboard";
import MountainBackground from "@/components/MountainBackground";
import Shoutbox from "@/components/Shoutbox";
import SessionProviderClient from "@/components/SessionProviderClient";

export default async function ForumDashboard() {
  let session = null;
  let error = null;

  try {
    session = await getServerSession();
    if (!session) {
      redirect("/login");
    }
  } catch (err) {
    console.error("Error fetching session:", err);
    error = "An error occurred. Please try again.";
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <SessionProviderClient session={session}>
      <div className="min-h-screen text-white relative">
        <MountainBackground isLoading={false} isSuccess={false} />
        {session ? (
          <div className="container mx-auto px-4 py-8 relative z-10">
            <AnimatedDashboard>
              <h1 className="text-4xl font-bold mb-8 text-center">
                Welcome to the Mountain Forum, {session.user?.name}
              </h1>
              <SearchBar />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                <div className="lg:col-span-2">
                  <Shoutbox />
                  <ForumSummary />
                  <TopicSummary />
                </div>
                <div>
                  <StickyTopics />
                  <RecentTopics />
                </div>
              </div>
              <div className="flex justify-between">
                <NewTopicButton />
                <LogoutButton />
              </div>
            </AnimatedDashboard>
          </div>
        ) : (
          <CircularProgress />
        )}
      </div>
    </SessionProviderClient>
  );
}
