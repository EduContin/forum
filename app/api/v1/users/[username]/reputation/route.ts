// app/api/v1/users/[username]/reputation/route.ts

import { NextRequest, NextResponse } from "next/server";
import database from "@/infra/database";
import { getServerSession } from "next-auth/next";

/**
 * Handles the POST request to update the reputation of a user.
 * @param request - The NextRequest object representing the incoming request.
 * @param params - An object containing the route parameters, including the username.
 * @returns A NextResponse object representing the response to the request.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { username: string } },
) {
  const { reputation_change, comment } = await request.json();
  const session = await getServerSession();
  const voterUsername = session?.user?.name;

  console.log("Voter Username: ", voterUsername);

  if (!voterUsername) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userResult = await database.query({
    text: "SELECT id, reputation FROM users WHERE username = $1",
    values: [params.username],
  });

  const voterResult = await database.query({
    text: "SELECT id FROM users WHERE username = $1",
    values: [voterUsername],
  });

  if (userResult.rows.length === 0 || voterResult.rows.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const userId = userResult.rows[0].id;
  const voterId = voterResult.rows[0].id;
  const userReputation = userResult.rows[0].reputation;

  if (userId === voterId) {
    return NextResponse.json(
      { error: "You cannot change your own reputation" },
      { status: 403 },
    );
  }

  try {
    // Check if the voter has already changed the reputation of the user
    const existingReputationResult = await database.query({
      text: "SELECT reputation_change FROM user_reputations WHERE user_id = $1 AND voter_id = $2",
      values: [userId, voterId],
    });

    if (existingReputationResult.rows.length > 0) {
      // If the voter has already changed the reputation, update the existing record
      const existingReputationChange =
        existingReputationResult.rows[0].reputation_change;
      const updatedReputation =
        userReputation - existingReputationChange + reputation_change;

      await database.query({
        text: `
          UPDATE user_reputations
          SET reputation_change = $1, comment = $2, updated_at = NOW()
          WHERE user_id = $3 AND voter_id = $4
        `,
        values: [reputation_change, comment, userId, voterId],
      });

      await database.query({
        text: "UPDATE users SET reputation = $1 WHERE id = $2",
        values: [updatedReputation, userId],
      });

      return NextResponse.json({ message: "Reputation updated successfully" });
    } else {
      // If the voter has not changed the reputation before, insert a new record
      await database.query({
        text: `
          INSERT INTO user_reputations (user_id, voter_id, reputation_change, comment)
          VALUES ($1, $2, $3, $4)
        `,
        values: [userId, voterId, reputation_change, comment],
      });

      const updatedReputation = userReputation + reputation_change;

      await database.query({
        text: "UPDATE users SET reputation = $1 WHERE id = $2",
        values: [updatedReputation, userId],
      });

      return NextResponse.json({ message: "Reputation added successfully" });
    }
  } catch (error) {
    console.error("Error updating reputation:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

/**
 * Deletes the reputation of a user.
 *
 * @param request - The NextRequest object.
 * @param params - The parameters object containing the username.
 * @param params.username - The username of the user whose reputation is being deleted.
 * @returns A NextResponse object with the result of the deletion.
 **/
export async function DELETE(
  request: NextRequest,
  { params }: { params: { username: string } },
) {
  const session = await getServerSession();
  const voterUsername = session?.user?.name;

  if (!voterUsername) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userResult = await database.query({
    text: "SELECT id, reputation FROM users WHERE username = $1",
    values: [params.username],
  });

  const voterResult = await database.query({
    text: "SELECT id FROM users WHERE username = $1",
    values: [voterUsername],
  });

  if (userResult.rows.length === 0 || voterResult.rows.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const userId = userResult.rows[0].id;
  const voterId = voterResult.rows[0].id;
  const userReputation = userResult.rows[0].reputation;

  try {
    // Retrieve the reputation change from the user_reputations table
    const reputationResult = await database.query({
      text: "SELECT reputation_change FROM user_reputations WHERE user_id = $1 AND voter_id = $2",
      values: [userId, voterId],
    });

    if (reputationResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Reputation not found" },
        { status: 404 },
      );
    }

    const reputationChange = reputationResult.rows[0].reputation_change;

    // Delete the reputation from the user_reputations table
    await database.query({
      text: "DELETE FROM user_reputations WHERE user_id = $1 AND voter_id = $2",
      values: [userId, voterId],
    });

    // Update the reputation in the users table
    const updatedReputation = userReputation - reputationChange;

    await database.query({
      text: "UPDATE users SET reputation = $1 WHERE id = $2",
      values: [updatedReputation, userId],
    });

    return NextResponse.json({ message: "Reputation removed successfully" });
  } catch (error) {
    console.error("Error removing reputation:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
