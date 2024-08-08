import database from "@/infra/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postIds = searchParams.get("postIds")?.split(",").map(Number);
  const userId = searchParams.get("userId");

  if (!postIds || postIds.length === 0) {
    return NextResponse.json(
      { error: "No post IDs provided" },
      { status: 400 },
    );
  }

  console.log(userId);

  if (!userId) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 },
    );
  }

  try {
    const result = await database.query({
      text: `
          SELECT post_id, true AS is_liked_by_user
          FROM likes
          WHERE user_id = $1 AND post_id = ANY($2::int[])
        `,
      values: [userId, postIds],
    });

    const likedPosts = result.rows.reduce(
      (
        acc: { [x: string]: any },
        row: { post_id: string | number; is_liked_by_user: any },
      ) => {
        acc[row.post_id] = row.is_liked_by_user;
        return acc;
      },
      {},
    );

    return NextResponse.json(likedPosts);
  } catch (error) {
    console.error("Error fetching likes:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const { postId, userId } = await request.json();

  try {
    // Start a transaction
    await database.query("BEGIN");

    // Try to insert a like
    const insertResult = await database.query({
      text: "INSERT INTO likes (user_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *",
      values: [userId, postId],
    });

    if (insertResult.rowCount > 0) {
      // If a like was inserted, increment the likes_count and likes_received
      await database.query({
        text: "UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1",
        values: [postId],
      });
      await database.query({
        text: "UPDATE users SET likes_received = likes_received + 1 WHERE id = (SELECT user_id FROM posts WHERE id = $1)",
        values: [postId],
      });
    } else {
      // If no like was inserted (already liked), remove the like
      await database.query({
        text: "DELETE FROM likes WHERE user_id = $1 AND post_id = $2",
        values: [userId, postId],
      });
      await database.query({
        text: "UPDATE posts SET likes_count = likes_count - 1 WHERE id = $1",
        values: [postId],
      });
      await database.query({
        text: "UPDATE users SET likes_received = likes_received - 1 WHERE id = (SELECT user_id FROM posts WHERE id = $1)",
        values: [postId],
      });
    }

    // Commit the transaction
    await database.query("COMMIT");

    // Fetch the updated post data
    const updatedPost = await database.query({
      text: "SELECT likes_count, (SELECT EXISTS(SELECT 1 FROM likes WHERE user_id = $1 AND post_id = $2)) as is_liked_by_user FROM posts WHERE id = $2",
      values: [userId, postId],
    });

    return NextResponse.json(updatedPost.rows[0]);
  } catch (error) {
    await database.query("ROLLBACK");
    console.error("Error handling like:", error);
    return NextResponse.error();
  }
}
