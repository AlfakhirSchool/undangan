import { NextResponse } from "next/server";
import { COOKIE_NAME, isValidPassword, sessionToken } from "@/lib/admin-auth";

export async function POST(req: Request) {
  const { password } = await req.json();
  if (!isValidPassword(password)) {
    return NextResponse.json({ error: "wrong password" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, await sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
