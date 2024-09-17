import React from "react";
import { getServerSession } from "next-auth/next";
import BanUserButton from "./BanUserButton";

interface BanUserButtonWrapperProps {
  username: string;
}

const BanUserButtonWrapper: React.FC<BanUserButtonWrapperProps> = async ({
  username,
}) => {
  const session = await getServerSession();
  const currentUser = session?.user?.name;

  const response = await fetch(
    `http://localhost:3000/api/v1/users/${currentUser}`,
    { cache: "no-store" },
  );
  const data = await response.json();
  const userGroup = data.user_group;

  const isAdmin = userGroup === "Admin";

  return <BanUserButton username={username} isAdmin={isAdmin} />;
};

export default BanUserButtonWrapper;
