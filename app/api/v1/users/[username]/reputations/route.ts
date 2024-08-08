// app/api/v1/users/[username]/reputations/route.ts

import { NextRequest, NextResponse } from "next/server";
import database from "@/infra/database";

/**
 * Retrieves the reputation information for a specific user.
 * @param request - The NextRequest object.
 * @param params - The parameters object containing the username.
 * @returns A JSON response containing the user's reputation information.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } },
) {
  try {
    const result = await database.query({
      text: `
        SELECT ur.id, ur.reputation_change, ur.comment, u.username AS voter_username
        FROM user_reputations ur
        JOIN users u ON ur.voter_id = u.id
        WHERE ur.user_id = (SELECT id FROM users WHERE LOWER(username) = LOWER($1))
      `,
      values: [params.username],
    });

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching user reputations:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
