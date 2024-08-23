import { notFound } from "next/navigation";
import MountainBackground from "@/components/MountainBackground";
import { getServerSession } from "next-auth/next";
import UserProfile from "@/components/UserProfile";

async function fetchUserProfile(username: string) {
  const res = await fetch(
    `http://localhost:3000/api/v1/users/${encodeURIComponent(username)}`,
  );

  if (!res.ok) {
    return res.status === 404 ? null : null;
  }

  return res.json();
}

async function fetchUserReputations(username: string) {
  const res = await fetch(
    `http://localhost:3000/api/v1/users/${encodeURIComponent(username)}/reputations`,
  );

  if (!res.ok) {
    throw new Error("Failed to fetch user reputations");
  }

  return res.json();
}

export default async function UserProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const user = await fetchUserProfile(params.username.toLowerCase());
  const reputations = await fetchUserReputations(params.username.toLowerCase());
  const session = await getServerSession();
  const currentUser = session?.user?.name;

  if (!user) {
    notFound();
  }

  return (
    <div className="min-h-screen text-white">
      <MountainBackground isLoading={false} isSuccess={false} />
      <UserProfile
        user={user}
        reputations={reputations}
        currentUser={currentUser}
      />
    </div>
  );
}
