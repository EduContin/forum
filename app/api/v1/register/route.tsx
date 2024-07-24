import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";
import { hash } from "bcrypt";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res
        .status(400)
        .json({ message: "Email, password, and username are required" });
    }

    const client = await pool.connect();
    try {
      // Check if user already exists
      const existingUser = await client.query(
        "SELECT id FROM users WHERE email = $1 OR username = $2",
        [email, username],
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({ message: "User already exists" });
      }

      // Hash the password
      const hashedPassword = await hash(password, 10);

      // Insert new user
      const result = await client.query(
        "INSERT INTO users (email, password, username) VALUES ($1, $2, $3) RETURNING id",
        [email, hashedPassword, username],
      );

      const userId = result.rows[0].id;

      res.status(201).json({ message: "User registered successfully", userId });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
