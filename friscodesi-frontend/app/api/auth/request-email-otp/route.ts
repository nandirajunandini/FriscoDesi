import { NextRequest, NextResponse } from "next/server";

const strapiUrl = process.env.STRAPI_URL ?? "http://localhost:1337";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const response = await fetch(`${strapiUrl}/api/email-verification/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      cache: "no-store",
    });
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || "Unable to send an OTP." },
        { status: response.status }
      );
    }

    return NextResponse.json({ sent: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to send an OTP." },
      { status: 500 }
    );
  }
}
