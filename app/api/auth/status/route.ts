import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAllConnectedUserIds, ensureTokenStoreLoaded } from "@/lib/token-store";
import { isAdminUser } from "@/lib/admin";

export async function GET() {
  await ensureTokenStoreLoaded();

  const cookieStore = await cookies();
  const connected = cookieStore.get("calendar_connected")?.value === "true";
  const userId = cookieStore.get("user_id")?.value;
  const isAdmin = isAdminUser(userId);

  const connectedCount = connected ? getAllConnectedUserIds().length : 0;

  return NextResponse.json({
    connected,
    isAdmin,
    userId: userId || null,
    connectedAccountsCount: connectedCount,
  });
}
