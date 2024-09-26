// app/api/v1/nowpayments-webhook/route.ts

import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  getUserDetailsByOrderId,
  createUser,
  deleteUserDetails,
} from "@/lib/user";

const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-nowpayments-sig");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 },
    );
  }

  if (!IPN_SECRET) {
    console.error("IPN_SECRET is not defined");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 },
    );
  }

  const hmac = crypto.createHmac("sha512", IPN_SECRET);
  const digest = hmac.update(body).digest("hex");

  if (signature !== digest) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const payload = JSON.parse(body);

  if (payload.payment_status === "finished") {
    const { order_id } = payload;

    // Retrieve user details
    const userDetails = await getUserDetailsByOrderId(order_id);

    if (userDetails) {
      // Create the user
      const success = await createUser(userDetails);

      if (success) {
        // Delete temporary user details
        await deleteUserDetails(order_id);
        console.log(`User created successfully for order ${order_id}`);
      } else {
        console.error(`Failed to create user for order ${order_id}`);
      }
    } else {
      console.error(`User details not found for order ${order_id}`);
    }
  }

  return NextResponse.json({ status: "ok" });
}
