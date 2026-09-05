import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    message: "User logged out successfully",
  });

  // Remove authentication token
  response.cookies.set("token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  // Remove user token if it exists
  response.cookies.set("userToken", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  // Remove role
  response.cookies.set("role", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}