import database from "infra/database";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sectionsQuery = `
      SELECT s.id, s.name, s.description,
        (SELECT json_agg(c ORDER BY c.created_at)
         FROM (
           SELECT c.id, c.name, c.description, c.is_subfolder, c.created_at,
             (SELECT COUNT(*) FROM threads t WHERE t.category_id = c.id) AS thread_count,
             (SELECT COUNT(*) FROM posts p JOIN threads t ON p.thread_id = t.id WHERE t.category_id = c.id) AS post_count,
             (SELECT json_agg(sc ORDER BY sc.created_at)
              FROM (
                SELECT sc.id, sc.name, sc.description, sc.is_subfolder, sc.created_at,
                  (SELECT COUNT(*) FROM threads t WHERE t.category_id = sc.id) AS thread_count,
                  (SELECT COUNT(*) FROM posts p JOIN threads t ON p.thread_id = t.id WHERE t.category_id = sc.id) AS post_count,
                  (SELECT json_agg(t.name) FROM category_tags ct
                   JOIN tags t ON ct.tag_id = t.id
                   WHERE ct.category_id = sc.id) AS tags
                FROM categories sc
                WHERE sc.parent_id = c.id
              ) sc
             ) AS subcategories,
             (SELECT json_agg(t.name) FROM category_tags ct
              JOIN tags t ON ct.tag_id = t.id
              WHERE ct.category_id = c.id) AS tags
           FROM categories c
           WHERE c.section_id = s.id AND c.parent_id IS NULL
         ) c
        ) AS categories
      FROM sections s
      ORDER BY s.created_at
    `;

    const result = await database.query(sectionsQuery);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching forum structure:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
