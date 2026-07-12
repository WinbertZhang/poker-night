export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { password, from } = await req.json();

  if (!process.env.APP_PASSWORD) {
    return NextResponse.json({ error: "APP_PASSWORD not configured" }, { status: 500 });
  }

  if (password !== process.env.APP_PASSWORD) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const redirect = (from && from.startsWith("/") && !from.startsWith("/login")) ? from : "/";
  const res = NextResponse.json({ ok: true, redirect });

  res.cookies.set("pn_auth", process.env.APP_PASSWORD, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });

  return res;
}
