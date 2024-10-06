// app/api/v1/affiliate-data/route.ts

import { NextResponse } from "next/server";
import database from "@/infra/database";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.name) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const userQuery = await database.query({
      text: "SELECT id, referral_code, affiliate_balance FROM users WHERE username = $1",
      values: [session.user.name],
    });

    if (userQuery.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userQuery.rows[0].id;

    const referralsQuery = await database.query({
      text: `
        SELECT u.username as referred_username, r.commission, r.created_at
        FROM referrals r
        JOIN users u ON r.referred_id = u.id
        WHERE r.referrer_id = $1
        ORDER BY r.created_at DESC
      `,
      values: [userId],
    });

    const userData = userQuery.rows[0];
    const referrals = referralsQuery.rows;

    return NextResponse.json({
      referralCode: userData.referral_code,
      balance: userData.affiliate_balance,
      referrals: referrals,
    });
  } catch (error) {
    console.error("Error fetching affiliate data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
