// lib/user.ts

import database from "@/infra/database";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

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
  console.log("Storing user details:", userDetails, "from order ID:", orderId);
  const hashedPassword = await bcrypt.hash(userDetails.password, 10);
  try {
    await database.query({
      text: "INSERT INTO pending_users (order_id, username, email, password) VALUES ($1, $2, $3, $4)",
      values: [
        orderId,
        userDetails.username,
        userDetails.email,
        hashedPassword,
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
  referralCode?: string;
}) {
  const referralCode = generateReferralCode();
  try {
    const result = await database.query({
      text: "INSERT INTO users (username, email, password, referral_code) VALUES ($1, $2, $3, $4) RETURNING id",
      values: [
        userDetails.username,
        userDetails.email,
        userDetails.password,
        referralCode,
      ],
    });
    return result.rows[0];
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
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

export async function processReferral(
  newUserId: number,
  referralCode: string | undefined,
) {
  if (!referralCode) return;

  try {
    const referrer = await database.query({
      text: "SELECT id FROM users WHERE referral_code = $1",
      values: [referralCode],
    });

    if (referrer.rows.length > 0) {
      const referrerId = referrer.rows[0].id;
      await database.query({
        text: "UPDATE users SET referred_by = $1 WHERE id = $2",
        values: [referrerId, newUserId],
      });

      await addCommission(referrerId, newUserId, 2); // $2 (25% of $8)

      const referrerOfReferrer = await database.query({
        text: "SELECT referred_by FROM users WHERE id = $1",
        values: [referrerId],
      });

      if (
        referrerOfReferrer.rows.length > 0 &&
        referrerOfReferrer.rows[0].referred_by
      ) {
        await addCommission(
          referrerOfReferrer.rows[0].referred_by,
          newUserId,
          0.8,
        ); // $0.8 (10% of $8)
      }
    }
  } catch (error) {
    console.error("Error processing referral:", error);
  }
}

async function addCommission(
  userId: number,
  referredId: number,
  amount: number,
) {
  await database.query({
    text: "INSERT INTO referrals (referrer_id, referred_id, commission) VALUES ($1, $2, $3)",
    values: [userId, referredId, amount],
  });

  await database.query({
    text: "UPDATE users SET affiliate_balance = affiliate_balance + $1 WHERE id = $2",
    values: [amount, userId],
  });
}

function generateReferralCode() {
  return uuidv4().substr(0, 8);
}
