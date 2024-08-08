import { NextRequest, NextResponse } from "next/server";
import database from "@/infra/database";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } },
) {
  const categorySlug = params.slug;

  try {
    const result = await database.query({
      text: `SELECT * FROM categories WHERE LOWER(REPLACE(name, ' ', '-')) = $1`,
      values: [categorySlug],
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
