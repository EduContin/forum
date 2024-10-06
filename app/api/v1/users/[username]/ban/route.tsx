import { NextResponse } from "next/server";
import database from "@/infra/database";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

export async function POST(
  request: Request,
  { params }: { params: { username: string } },
) {
  const session = await getServerSession(authOptions);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/users/${session?.user?.name}`,
    { cache: "no-store" },
  );
  const data = await response.json();

  const userGroup = data.user_group;
  if (!session || userGroup !== "Admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { username } = params;

  try {
    const result = await database.query({
      text: `
        UPDATE users 
        SET banned = CASE WHEN banned = true THEN false ELSE true END
        WHERE username = $1
        RETURNING *
      `,
      values: [username],
    });

    if (result.rowCount === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const updatedUser = result.rows[0];
    const action = updatedUser.banned ? "banned" : "unbanned";

    return NextResponse.json(
      { message: `User ${action} successfully` },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating user ban status:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
