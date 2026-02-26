import { NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/auth";

export async function GET() {
  try {
    const authUrl = getAuthUrl();
    return NextResponse.json({ url: authUrl });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate auth URL",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
