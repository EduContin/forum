import { NextRequest, NextResponse } from "next/server";
import database from "@/infra/database";

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } },
) {
  try {
    const username = params.username;
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // First, get the user ID from the username
    const userResult = await database.query({
      text: "SELECT id FROM users WHERE username = $1",
      values: [username],
    });

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userResult.rows[0].id;

    const countResult = await database.query({
      text: "SELECT COUNT(*) FROM threads WHERE user_id = $1",
      values: [userId],
    });

    const totalThreads = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalThreads / limit);

    const result = await database.query({
      text: `
        SELECT 
          t.id,
          t.title,
          u.username,
          c.name AS category_name,
          COUNT(p.id) AS post_count,
          MAX(p.created_at) AS last_post_at,
          t.view_count,
          t.status,
          (SELECT COUNT(*) FROM likes WHERE post_id = (SELECT id FROM posts WHERE thread_id = t.id ORDER BY created_at ASC LIMIT 1)) AS first_post_likes
        FROM 
          threads t
          JOIN users u ON t.user_id = u.id
          JOIN categories c ON t.category_id = c.id
          LEFT JOIN posts p ON t.id = p.thread_id
        WHERE 
          t.user_id = $1
        GROUP BY 
          t.id, t.title, u.username, c.name, t.view_count, t.status
        ORDER BY 
          t.created_at DESC
        LIMIT $2 OFFSET $3
      `,
      values: [userId, limit, offset],
    });

    const threads = result.rows.map(
      (thread: {
        id: any;
        title: any;
        username: any;
        category_name: any;
        post_count: string;
        last_post_at: any;
        view_count: any;
        status: any;
        first_post_likes: string;
      }) => ({
        id: thread.id,
        title: thread.title,
        username: thread.username,
        category_name: thread.category_name,
        post_count: parseInt(thread.post_count),
        last_post_at: thread.last_post_at,
        view_count: thread.view_count,
        status: thread.status,
        first_post_likes: parseInt(thread.first_post_likes),
      }),
    );

    return NextResponse.json({
      threads,
      currentPage: page,
      totalPages,
      totalThreads,
    });
  } catch (error) {
    console.error("Error fetching user threads:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
