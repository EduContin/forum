import { NextRequest, NextResponse } from "next/server";
import database from "@/infra/database";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const categorySlug = searchParams.get("categorySlug");
  const threadId = searchParams.get("threadId");

  const offset = (page - 1) * pageSize;

  try {
    let query = `
      SELECT t.*, u.username, c.name AS category_name, 
             COUNT(p.id) AS post_count, 
             MAX(p.created_at) AS last_post_at
      FROM threads t
      JOIN users u ON t.user_id = u.id
      JOIN categories c ON t.category_id = c.id
      LEFT JOIN posts p ON t.id = p.thread_id
    `;

    const queryParams: any[] = [];
    if (categorySlug) {
      query += ` WHERE LOWER(REPLACE(c.name, ' ', '-')) = $1`;
      queryParams.push(categorySlug);
    } else if (threadId) {
      query += ` WHERE t.id = $1`;
      queryParams.push(threadId);
    }

    query += `
      GROUP BY t.id, u.username, c.name
      ORDER BY t.updated_at DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    queryParams.push(pageSize, offset);

    const result = await database.query({
      text: query,
      values: queryParams,
    });

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching threads:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const { title, content, userId, categoryId } = await request.json();

  try {
    const result = await database.query({
      text: `
        WITH new_thread AS (
          INSERT INTO threads (title, user_id, category_id)
          VALUES ($1, $2, $3)
          RETURNING id
        )
        INSERT INTO posts (content, user_id, thread_id)
        SELECT $4, $2, id FROM new_thread
        RETURNING thread_id
      `,
      values: [title, userId, categoryId, content],
    });

    const threadId = result.rows[0].thread_id;

    return NextResponse.json({ threadId }, { status: 201 });
  } catch (error) {
    console.error("Error creating thread:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
