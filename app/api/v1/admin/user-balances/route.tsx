// app/api/v1/admin/user-balances/route.ts

import { NextResponse } from "next/server";
import database from "@/infra/database";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.name) {
    console.log("Unauthorized: No session or user name");
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const userQuery = await database.query({
      text: "SELECT user_group FROM users WHERE username = $1",
      values: [session.user.name],
    });
    console.log("User query result:", userQuery.rows);

    if (
      userQuery.rows.length === 0 ||
      userQuery.rows[0].user_group !== "Admin"
    ) {
      console.log("Unauthorized: Not an admin");
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const result = await database.query({
      text: "SELECT id, username, affiliate_balance AS balance FROM users WHERE affiliate_balance > 0 ORDER BY affiliate_balance DESC",
    });
    console.log("Query result:", result.rows);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching user balances:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
