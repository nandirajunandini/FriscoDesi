import { NextResponse } from "next/server";

export async function POST(req: Request) {

  const { email, password } = await req.json();

  // LOGIN TO STRAPI
  const res = await fetch("http://localhost:1337/api/auth/local", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identifier: email,
      password,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 400 }
    );
  }

  const token = data.jwt;

  // GET USER ROLE
  const userRes = await fetch(
    "http://localhost:1337/api/users/me?populate=role",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const user = await userRes.json();

  const role = user.role?.name || "User";

  const response = NextResponse.json({ success: true });

  // SAVE TOKEN
  response.cookies.set("token", token, {
    httpOnly: true,
    path: "/",
  });

  // SAVE ROLE
  response.cookies.set("role", role, {
    httpOnly: true,
    path: "/",
  });

  return response;
}