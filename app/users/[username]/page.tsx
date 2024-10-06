import { notFound } from "next/navigation";
import MountainBackground from "@/components/MountainBackground";
import { getServerSession } from "next-auth/next";
import UserProfile from "@/components/UserProfile";
import BanUserButtonWrapper from "@/components/BanUserButtonWrapper";

const apiUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function fetchUserProfile(username: string) {
  const res = await fetch(
    `${apiUrl}/api/v1/users/${encodeURIComponent(username)}`,
  );

  if (!res.ok) {
    return res.status === 404 ? null : null;
  }

  return res.json();
}

async function fetchUserReputations(username: string) {
  const res = await fetch(
    `${apiUrl}/api/v1/users/${encodeURIComponent(username)}/reputations`,
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

  const currentUserRes = await fetch(`${apiUrl}/api/v1/users/${currentUser}`);
  if (!currentUserRes.ok) {
    throw new Error("Failed to fetch current user");
  }
  const currentUserData = await currentUserRes.json();
  const currentUserGroup = currentUserData.user_group;

  if (!user) {
    notFound();
  }

  return (
    <div className="min-h-screen text-white">
      <MountainBackground isLoading={false} isSuccess={false} />
      {currentUserGroup === "Admin" && (
        <BanUserButtonWrapper username={user.username} />
      )}
      <UserProfile
        user={user}
        reputations={reputations}
        currentUser={currentUser}
      />
    </div>
  );
}
