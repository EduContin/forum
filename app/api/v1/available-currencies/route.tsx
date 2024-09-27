// app/api/v1/available-currencies/route.ts

import { NextResponse } from "next/server";

const API_KEY = process.env.NOWPAYMENTS_API_KEY;
const API_URL = "https://api.nowpayments.io/v1";

export async function GET() {
  try {
    // Fetch all available currencies
    const currenciesResponse = await fetch(`${API_URL}/currencies`, {
      headers: { "x-api-key": API_KEY as string },
    });
    const currencies = await currenciesResponse.json();

    // Filter currencies based on minimum amount
    const validCurrencies = await Promise.all(
      currencies.currencies.map(async (currency: string) => {
        const minAmountResponse = await fetch(
          `${API_URL}/min-amount?currency_from=${currency}&currency_to=xmr&fiat_equivalent=usd`,
          {
            headers: { "x-api-key": API_KEY as string },
          },
        );
        const { min_amount, fiat_equivalent } = await minAmountResponse.json();
        console.log(
          "Min amount for",
          currency,
          "is",
          min_amount,
          " fiat USD: ",
          fiat_equivalent,
        );
        return fiat_equivalent <= 8 ? currency : null;
      }),
    );

    const filteredCurrencies = validCurrencies.filter(Boolean);
    return NextResponse.json({ currencies: filteredCurrencies });
  } catch (error) {
    console.error("Error fetching currencies:", error);
    return NextResponse.json(
      { error: "Failed to fetch currencies" },
      { status: 500 },
    );
  }
}
