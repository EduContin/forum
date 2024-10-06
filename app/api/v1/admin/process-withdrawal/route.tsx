// app/api/v1/admin/process-withdrawal/route.ts

import { NextResponse } from "next/server";
import database from "@/infra/database";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.name) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const userQuery = await database.query({
      text: "SELECT user_group FROM users WHERE username = $1",
      values: [session.user.name],
    });

    if (
      userQuery.rows.length === 0 ||
      userQuery.rows[0].user_group !== "Admin"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { userId, amount } = await request.json();

    if (!userId || !amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    await database.query("BEGIN");

    const userResult = await database.query({
      text: "SELECT affiliate_balance FROM users WHERE id = $1 FOR UPDATE",
      values: [userId],
    });

    if (userResult.rows.length === 0) {
      await database.query("ROLLBACK");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentBalance = userResult.rows[0].affiliate_balance;

    if (currentBalance < amount) {
      await database.query("ROLLBACK");
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 },
      );
    }

    await database.query({
      text: "UPDATE users SET affiliate_balance = affiliate_balance - $1 WHERE id = $2",
      values: [amount, userId],
    });

    await database.query({
      text: "INSERT INTO withdrawals (user_id, amount, status) VALUES ($1, $2, $3)",
      values: [userId, amount, "Processed"],
    });

    await database.query("COMMIT");

    return NextResponse.json({ success: true });
  } catch (error) {
    await database.query("ROLLBACK");
    console.error("Error processing withdrawal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
