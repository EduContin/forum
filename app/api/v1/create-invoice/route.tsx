// app/api/v1/create-invoice/route.tsx

import { storeUserDetails } from "@/lib/user";
import { NextResponse } from "next/server";

const API_KEY = process.env.HOODPAY_API_KEY;
const BUSINESS_ID = process.env.HOODPAY_BUSINESS_ID;
const API_URL = "https://api.hoodpay.io/v1/businesses";

export async function POST(request: Request) {
  try {
    const { price_amount, username, email, password, referralCode } =
      await request.json();

    if (!API_KEY || !BUSINESS_ID) {
      throw new Error("API key or Business ID is not defined");
    }

    const processToken = Date.now().toString();

    const paymentData = {
      currency: "USD",
      amount: price_amount,
      metadata: {
        processToken: processToken,
      },
      notifyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/hoodpay-webhook`,
    };

    const response = await fetch(`${API_URL}/${BUSINESS_ID}/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("HOODPAY API error:", errorData);
      throw new Error(
        `HOODPAY API error: ${response.status} ${response.statusText}`,
      );
    }

    const payment = await response.json();
    console.log("Payment created successfully:", payment);
    console.log("Referral code: ", referralCode);
    // Store pending user data including the referral code
    storeUserDetails(processToken, {
      username,
      email,
      password,
      referralCode,
    } as {
      username: string;
      email: string;
      password: string;
      referralCode: string;
    });

    return NextResponse.json({
      payment_url: payment.data.url,
      payment_id: payment.data.id,
    });
  } catch (error) {
    console.error("Payment creation error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to create payment" },
      { status: 500 },
    );
  }
}
