import { NextResponse } from "next/server";
import database from "@/infra/database";

export async function GET() {
  try {
    const result = await database.query({
      text: `
        SELECT c.*, 
               COUNT(DISTINCT t.id) as thread_count, 
               COUNT(DISTINCT p.id) as post_count
        FROM categories c
        LEFT JOIN threads t ON c.id = t.category_id
        LEFT JOIN posts p ON t.id = p.thread_id
        GROUP BY c.id
      `,
    });

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
