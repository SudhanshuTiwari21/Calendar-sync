import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createEventInUserCalendar } from "@/lib/calendar";
import { getAllConnectedUserIds } from "@/lib/token-store";
import { isAdminUser } from "@/lib/admin";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;
    const isAdmin = isAdminUser(userId);

    if (!userId) {
      return NextResponse.json(
        { error: "Not connected. Please connect Google Calendar first." },
        { status: 401 }
      );
    }

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only the admin can create events. You are not the admin." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, start, end } = body;

    if (!title || !start || !end) {
      return NextResponse.json(
        { error: "Missing required fields: title, start, end" },
        { status: 400 }
      );
    }

    const event = { title, description, start, end };
    const connectedIds = getAllConnectedUserIds();

    if (connectedIds.length === 0) {
      return NextResponse.json(
        { error: "No connected accounts. Connect at least one calendar first." },
        { status: 400 }
      );
    }

    const results: { userId: string; success: boolean; error?: string }[] = [];

    for (const id of connectedIds) {
      try {
        await createEventInUserCalendar(id, event);
        results.push({ userId: id, success: true });
      } catch (err) {
        results.push({
          userId: id,
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    const failed = results.filter((r) => !r.success);
    if (failed.length === results.length) {
      return NextResponse.json(
        {
          error: "Failed to create event in any calendar",
          details: failed,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      syncedTo: results.filter((r) => r.success).length,
      total: results.length,
      failures: failed.length > 0 ? failed : undefined,
    });
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create event",
      },
      { status: 500 }
    );
  }
}
