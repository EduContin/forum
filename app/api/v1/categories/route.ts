import database from "@/infra/database";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  try {
    const categoryQuery = `
      SELECT c.id, c.name, c.description,
        (SELECT COUNT(*) FROM threads t WHERE t.category_id = c.id) AS thread_count,
        (SELECT COUNT(*) FROM posts p JOIN threads t ON p.thread_id = t.id WHERE t.category_id = c.id) AS post_count,
        (
          SELECT json_agg(sub)
          FROM (
            SELECT sc.id, sc.name, sc.description,
              (SELECT COUNT(*) FROM threads t WHERE t.category_id = sc.id) AS thread_count,
              (SELECT COUNT(*) FROM posts p JOIN threads t ON p.thread_id = t.id WHERE t.category_id = sc.id) AS post_count
            FROM categories sc
            WHERE sc.parent_id = c.id
          ) sub
        ) AS subcategories
      FROM categories c
      WHERE c.name = $1
    `;

    const result = await database.query({
      text: categoryQuery,
      values: [slug],
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
