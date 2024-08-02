import { NextResponse } from "next/server";
import database from "@/infra/database";

export async function GET() {
  const result = await database.query({
    text: `
      SELECT * 
      FROM (
        SELECT * 
        FROM messages
        ORDER BY created_at DESC
        LIMIT 10
      ) sub
      ORDER BY created_at DESC;
    `,
  });
  return NextResponse.json(result, { status: 200 });
}

export async function POST(request: Request) {
  const data = await request.json();
  console.log(data);
  const { username, message } = data;
  await database.query({
    text: `INSERT INTO messages (username, message) VALUES ($1, $2);`,
    values: [username, message],
  });
  return NextResponse.json(
    { message: "Message stored successfully" },
    { status: 200 },
  );
}
