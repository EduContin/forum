// app/api/v1/create-invoice/route.ts

import { NextResponse } from "next/server";
import { storeUserDetails } from "@/lib/user";

const API_KEY = process.env.NOWPAYMENTS_API_KEY;
const API_URL = "https://api.nowpayments.io/v1/invoice";

export async function POST(request: Request) {
  try {
    const { email, username, password, price_amount, price_currency } = await request.json();
    const orderId = Date.now().toString();

    if (!API_KEY) {
      throw new Error("API key is not defined");
    }

    const invoiceData = {
      price_amount: price_amount,
      price_currency: price_currency,
      order_id: orderId,
      order_description: "Forum registration fee",
      ipn_callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/nowpayments-webhook`,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/registration-success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/registration-cancelled`,
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invoiceData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("NOWPayments API error:", errorData);
      throw new Error(`NOWPayments API error: ${response.status} ${response.statusText}`);
    }

    const invoice = await response.json();
    console.log("Invoice created successfully:", invoice);

    // Store user details
    await storeUserDetails(orderId, { username, email, password });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Invoice creation error:", error);
    return NextResponse.json({ error: error.message || "Failed to create invoice" }, { status: 500 });
  }
}