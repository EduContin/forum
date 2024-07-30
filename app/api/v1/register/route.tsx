import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import database from "@/infra/database";

export async function POST(request: Request) {
  const { username, email, password } = await request.json();
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await database.query({
      text: `INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id`,
      values: [username, email, hashedPassword],
    });
    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Registration failed" },
      { status: 500 },
    );
  }
}
