import { NextRequest, NextResponse } from "next/server";
import { getOAuth2Client } from "@/lib/auth";
import { setTokens } from "@/lib/token-store";

async function fetchUserEmail(accessToken: string): Promise<string> {
  const res = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) throw new Error("Failed to fetch user info");
  const data = (await res.json()) as { email?: string };
  if (!data.email) throw new Error("No email in user info");
  return data.email;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (error) {
    return NextResponse.redirect(
      `${baseUrl}?error=${encodeURIComponent(error)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${baseUrl}?error=${encodeURIComponent("No authorization code received")}`
    );
  }

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      throw new Error("No access token received");
    }

    const userEmail = await fetchUserEmail(tokens.access_token);
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const isAdmin = !!adminEmail && userEmail.toLowerCase() === adminEmail;

    setTokens(userEmail, {
      access_token: tokens.access_token!,
      refresh_token: tokens.refresh_token ?? undefined,
      expiry_date: tokens.expiry_date ?? undefined,
    });

    const response = NextResponse.redirect(`${baseUrl}/dashboard`);
    response.cookies.set("calendar_connected", "true", {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    response.cookies.set("user_id", userEmail, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    response.cookies.set("is_admin", isAdmin ? "true" : "false", {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(
      `${baseUrl}?error=${encodeURIComponent("Failed to connect calendar")}`
    );
  }
}
