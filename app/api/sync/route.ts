import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminEmail } from "@/lib/admin";
import { getAllConnectedUserIds, getTokens, ensureTokenStoreLoaded } from "@/lib/token-store";
import {
  listAdminCalendarEvents,
  toCalendarEvent,
  createEventInUserCalendar,
} from "@/lib/calendar";
import {
  getLastSyncTime,
  setLastSyncTime,
  isEventSynced,
  markEventSynced,
} from "@/lib/sync-store";

export async function POST() {
  try {
    await ensureTokenStoreLoaded();

    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;
    const adminEmail = getAdminEmail();

    if (!adminEmail) {
      return NextResponse.json(
        { error: "ADMIN_EMAIL is not set. Set it in .env.local." },
        { status: 500 }
      );
    }

    if (!userId || userId.trim().toLowerCase() !== adminEmail.trim().toLowerCase()) {
      return NextResponse.json(
        { error: "Only the admin can run sync." },
        { status: 403 }
      );
    }

    // Use the logged-in user's id for lookup (same key used when they connected)
    const adminTokens = getTokens(userId);
    if (!adminTokens) {
      return NextResponse.json(
        {
          error:
            "Admin calendar not connected. Please go to the home page and click Connect again with your admin Google account (tokens may have been lost after a server restart).",
        },
        { status: 400 }
      );
    }

    const adminKey = userId.trim().toLowerCase();
    const connectedIds = getAllConnectedUserIds().filter((id) => id !== adminKey);

    if (connectedIds.length === 0) {
      return NextResponse.json({
        success: true,
        synced: 0,
        connectedAccounts: 0,
        message: "No other connected accounts to sync to.",
      });
    }

    let timeMin: string;
    let updatedMin: string | undefined;
    const last = getLastSyncTime();
    if (last === 0) {
      const d = new Date();
      d.setHours(d.getHours() - 24);
      timeMin = d.toISOString();
    } else {
      timeMin = new Date(0).toISOString();
      updatedMin = new Date(last).toISOString();
    }

    const events = await listAdminCalendarEvents(userId, timeMin, updatedMin);
    let syncedCount = 0;

    for (const item of events) {
      if (!item.id || isEventSynced(item.id)) continue;
      const event = toCalendarEvent(item);
      if (!event) continue;

      let allOk = true;
      for (const id of connectedIds) {
        try {
          await createEventInUserCalendar(id, event);
        } catch {
          allOk = false;
        }
      }
      if (allOk) {
        markEventSynced(item.id);
        syncedCount += 1;
      }
    }

    setLastSyncTime(Date.now());

    return NextResponse.json({
      success: true,
      synced: syncedCount,
      connectedAccounts: connectedIds.length,
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Sync failed",
      },
      { status: 500 }
    );
  }
}
