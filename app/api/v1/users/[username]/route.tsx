// app/api/v1/users/[username]/route.tsx

import { NextResponse } from "next/server";
import database from "@/infra/database";

export async function GET(
  request: Request,
  { params }: { params: { username: string } },
) {
  const { username } = params;

  try {
    const result = await database.query({
      text: "SELECT id, username, created_at, avatar_url, bio, user_group, threads_count, posts_count, likes_received, reputation, vouches, last_seen, signature, caution, banned, referral_code, referred_by, affiliate_balance FROM users WHERE LOWER(username) = LOWER($1)",
      values: [username],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = result.rows[0];
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching the user profile" },
      { status: 500 },
    );
  }
}
