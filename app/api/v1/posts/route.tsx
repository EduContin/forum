import { NextRequest, NextResponse } from "next/server";
import database from "@/infra/database";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const threadId = searchParams.get("threadId");

  try {
    const result = await database.query({
      text: `
        SELECT p.*, u.username, u.avatar_url
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.thread_id = $1
        ORDER BY p.created_at ASC
      `,
      values: [threadId],
    });

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const { content, threadId, userId } = await request.json();

  try {
    const result = await database.query({
      text: `
        INSERT INTO posts (content, thread_id, user_id)
        VALUES ($1, $2, $3)
        RETURNING id
      `,
      values: [content, threadId, userId],
    });

    return NextResponse.json({ postId: result.rows[0].id }, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId");

  if (!postId) {
    return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
  }

  try {
    const result = await database.query({
      text: `
        UPDATE posts
        SET content = 'This content was deleted', is_deleted = true
        WHERE id = $1
        RETURNING id, content, is_deleted
      `,
      values: [postId],
    });

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
