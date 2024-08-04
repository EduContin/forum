import { NextRequest, NextResponse } from "next/server";
import database from "@/infra/database";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const threadId = params.id;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");

  const offset = (page - 1) * pageSize;

  try {
    const threadResult = await database.query({
      text: `
        SELECT t.*, u.username, c.name AS category_name
        FROM threads t
        JOIN users u ON t.user_id = u.id
        JOIN categories c ON t.category_id = c.id
        WHERE t.id = $1
      `,
      values: [threadId],
    });

    if (threadResult.rows.length === 0) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    const postsResult = await database.query({
      text: `
        SELECT p.*, u.username
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.thread_id = $1
        ORDER BY p.created_at ASC
        LIMIT $2 OFFSET $3
      `,
      values: [threadId, pageSize, offset],
    });

    await database.query({
      text: "UPDATE threads SET view_count = view_count + 1 WHERE id = $1",
      values: [threadId],
    });

    return NextResponse.json({
      thread: threadResult.rows[0],
      posts: postsResult.rows,
    });
  } catch (error) {
    console.error("Error fetching thread:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
