// app/api/v1/hoodpay-webhook/route.tsx

import { NextResponse } from "next/server";
import {
  createUser,
  deleteUserDetails,
  getUserDetailsByOrderId,
} from "@/lib/user";

export async function POST(request: Request) {
  // const signature = request.headers.get("x-hoodpay-signature");
  const payload = await request.json();
  console.log("Received webhook payload:", JSON.stringify(payload, null, 2));

  if (
    payload.eventType === "PAYMENT_COMPLETED" &&
    payload.forPaymentEvents.status === "COMPLETED"
  ) {
    const payment_id = payload.forPaymentEvents.id;
    const processToken = payload.forPaymentEvents.metadata.processToken;

    console.log(
      `Processing completed payment for ID: ${payment_id}, Process Token: ${processToken}`,
    );

    try {
      // Retrieve user details using the processToken
      const userDetails = await getUserDetailsByOrderId(processToken);
      console.log(userDetails);
      if (userDetails) {
        console.log(`User details found for Process Token: ${processToken}`);

        const newUser = await createUser(userDetails);
        console.log(
          `User created successfully for Process Token: ${processToken}`,
        );
        console.log(`New User: ${JSON.stringify(newUser, null, 2)}`);

        // Delete temporary user details
        await deleteUserDetails(processToken);
        console.log(
          `Temporary user details deleted for Process Token: ${processToken}`,
        );
      } else {
        console.log(`No user details found for Process Token: ${processToken}`);
      }
    } catch (error) {
      console.error(`Error processing payment ${payment_id}:`, error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  } else {
    console.log(`Ignoring non-completed payment event: ${payload.eventType}`);
  }

  return NextResponse.json({ status: "ok" });
}
