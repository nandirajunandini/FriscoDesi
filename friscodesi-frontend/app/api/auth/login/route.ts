import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // ==============================
    // LOGIN TO STRAPI
    // ==============================

    const res = await fetch(
      `${process.env.STRAPI_URL}/api/auth/local`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: email,
          password,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 400 }
      );
    }

    const token = data.jwt;

    // ==============================
    // GET LOGGED-IN USER
    // ==============================

    const userRes = await fetch(
  `${process.env.STRAPI_URL}/api/users/me?populate=role`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!userRes.ok) {
      return NextResponse.json(
        { error: "Unable to retrieve user information" },
        { status: 500 }
      );
    }

    const user = await userRes.json();

    const role = user.role?.name || "User";

    // ==============================
    // RESPONSE
    // ==============================

    const response = NextResponse.json({
      success: true,
    });

    // ==============================
    // AUTH TOKEN
    // ==============================

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    // ==============================
    // USER ROLE
    // ==============================

    response.cookies.set("role", role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { error: "Something went wrong during login" },
      { status: 500 }
    );
  }
}