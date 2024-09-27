// pages/api/v1/nowpayments-webhook.ts

import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import {
  createUser,
  deleteUserDetails,
  getUserDetailsByOrderId,
} from "@/lib/user";

const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const signature = req.headers["x-nowpayments-sig"];
  const payload = req.body;

  // Verify signature
  const hmac = crypto.createHmac("sha512", IPN_SECRET as string);
  const digest = hmac.update(JSON.stringify(payload)).digest("hex");

  if (signature !== digest) {
    return res.status(400).json({ error: "Invalid signature" });
  }

  if (payload.payment_status === "finished") {
    const { order_id } = payload;

    // Retrieve user details (implement this function)
    const userDetails = await getUserDetailsByOrderId(order_id);

    if (userDetails) {
      // Create the user (implement this function)
      await createUser(userDetails);

      // Delete temporary user details (implement this function)
      await deleteUserDetails(order_id);
    }
  }

  res.status(200).json({ status: "ok" });
}
