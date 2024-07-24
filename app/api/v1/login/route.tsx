import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken";

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
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT id, email, password FROM users WHERE email = $1",
        [email],
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const user = result.rows[0];
      const passwordMatch = await compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" },
      );

      res.status(200).json({ token });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
