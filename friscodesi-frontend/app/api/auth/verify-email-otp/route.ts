import { NextRequest, NextResponse } from "next/server";

const strapiUrl = process.env.STRAPI_URL ?? "http://localhost:1337";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();
    const response = await fetch(`${strapiUrl}/api/email-verification/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
      cache: "no-store",
    });
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || "Entered OTP is invalid" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      verified: true,
      verificationToken: data.verificationToken,
    });
  } catch {
    return NextResponse.json(
      { error: "Entered OTP is invalid" },
      { status: 500 }
    );
  }
}
