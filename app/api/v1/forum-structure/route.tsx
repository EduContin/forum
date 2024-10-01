// pages/api/v1/forum-structure.ts

import { NextApiRequest, NextApiResponse } from "next";
import database from "infra/database";
import { NextResponse } from "next/server";

export async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const sectionsQuery = `
      SELECT s.id, s.name, s.description,
        (SELECT json_agg(c)
         FROM (
           SELECT c.id, c.name, c.description, c.is_subfolder,
             (SELECT COUNT(*) FROM threads t WHERE t.category_id = c.id) AS thread_count,
             (SELECT COUNT(*) FROM posts p JOIN threads t ON p.thread_id = t.id WHERE t.category_id = c.id) AS post_count,
             (SELECT json_agg(sc)
              FROM (
                SELECT sc.id, sc.name, sc.description, sc.is_subfolder,
                  (SELECT COUNT(*) FROM threads t WHERE t.category_id = sc.id) AS thread_count,
                  (SELECT COUNT(*) FROM posts p JOIN threads t ON p.thread_id = t.id WHERE t.category_id = sc.id) AS post_count,
                  (SELECT json_agg(t.name) FROM category_tags ct
                   JOIN tags t ON ct.tag_id = t.id
                   WHERE ct.category_id = sc.id) AS tags
                FROM categories sc
                WHERE sc.parent_id = c.id
                ORDER BY sc.name
              ) sc
             ) AS subcategories,
             (SELECT json_agg(t.name) FROM category_tags ct
              JOIN tags t ON ct.tag_id = t.id
              WHERE ct.category_id = c.id) AS tags
           FROM categories c
           WHERE c.section_id = s.id AND c.parent_id IS NULL
           ORDER BY c.name
         ) c
        ) AS categories
      FROM sections s
      ORDER BY s.name
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
