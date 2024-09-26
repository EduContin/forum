// lib/user.ts

import database from "@/infra/database";
import bcrypt from "bcrypt";

export async function getUserDetailsByOrderId(orderId: string) {
  try {
    const result = await database.query({
      text: "SELECT username, email, password FROM pending_users WHERE order_id = $1",
      values: [orderId],
    });

    if (result.rows.length > 0) {
      return result.rows[0];
    }
    return null;
  } catch (error) {
    console.error("Error getting user details by order ID:", error);
    return null;
  }
}

export async function storeUserDetails(
  orderId: string,
  userDetails: { username: string; email: string; password: string },
) {
  try {
    await database.query({
      text: "INSERT INTO pending_users (order_id, username, email, password) VALUES ($1, $2, $3, $4)",
      values: [
        orderId,
        userDetails.username,
        userDetails.email,
        userDetails.password,
      ],
    });
    return true;
  } catch (error) {
    console.error("Error storing user details:", error);
    return false;
  }
}

export async function createUser(userDetails: {
  username: string;
  email: string;
  password: string;
}) {
  try {
    const hashedPassword = await bcrypt.hash(userDetails.password, 10);
    await database.query({
      text: "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
      values: [userDetails.username, userDetails.email, hashedPassword],
    });
    return true;
  } catch (error) {
    console.error("Error creating user:", error);
    return false;
  }
}

export async function deleteUserDetails(orderId: string) {
  try {
    await database.query({
      text: "DELETE FROM pending_users WHERE order_id = $1",
      values: [orderId],
    });
    return true;
  } catch (error) {
    console.error("Error deleting user details:", error);
    return false;
  }
}
