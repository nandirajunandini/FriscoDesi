import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    message: "User logged out successfully",
  });

  response.cookies.set("userToken", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}