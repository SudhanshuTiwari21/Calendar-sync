import { google } from "googleapis";
import { getOAuth2Client } from "./auth";
import { getTokens, setTokens } from "./token-store";

export interface CalendarEvent {
  title: string;
  description?: string;
  start: string; // ISO string
  end: string;   // ISO string
}

export async function createEventInUserCalendar(
  userId: string,
  event: CalendarEvent
) {
  const tokens = getTokens(userId);
  if (!tokens?.access_token) {
    throw new Error("User not connected. Please connect Google Calendar first.");
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials(tokens);
  oauth2Client.on("tokens", (newTokens) => {
    if (newTokens.access_token || newTokens.refresh_token) {
      setTokens(userId, {
        access_token: (newTokens.access_token ?? tokens.access_token)!,
        refresh_token: newTokens.refresh_token ?? tokens.refresh_token ?? undefined,
        expiry_date: newTokens.expiry_date ?? tokens.expiry_date ?? undefined,
      });
    }
  });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const response = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: event.title,
      description: event.description,
      start: {
        dateTime: event.start,
        timeZone,
      },
      end: {
        dateTime: event.end,
        timeZone,
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "popup", minutes: 15 },
          { method: "email", minutes: 10 },
        ],
      },
    },
  });

  return response.data;
}

export interface CalendarEventItem {
  id: string;
  summary?: string | null;
  description?: string | null;
  start?: { dateTime?: string; date?: string } | null;
  end?: { dateTime?: string; date?: string } | null;
}

export async function listAdminCalendarEvents(
  adminUserId: string,
  timeMin: string,
  updatedMin?: string
): Promise<CalendarEventItem[]> {
  const tokens = getTokens(adminUserId);
  if (!tokens?.access_token) {
    throw new Error("Admin calendar not connected.");
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials(tokens);
  oauth2Client.on("tokens", (newTokens) => {
    if (newTokens.access_token || newTokens.refresh_token) {
      setTokens(adminUserId, {
        access_token: (newTokens.access_token ?? tokens.access_token)!,
        refresh_token: newTokens.refresh_token ?? tokens.refresh_token ?? undefined,
        expiry_date: newTokens.expiry_date ?? tokens.expiry_date ?? undefined,
      });
    }
  });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin,
    ...(updatedMin && { updatedMin }),
    singleEvents: true,
    orderBy: "startTime",
  });

  const items = (res.data.items || []) as CalendarEventItem[];
  return items.filter(
    (e) =>
      e.id &&
      e.start?.dateTime &&
      e.end?.dateTime
  );
}

/** Normalize admin event to our CalendarEvent shape (timed events only). */
export function toCalendarEvent(item: CalendarEventItem): CalendarEvent | null {
  const start = item.start?.dateTime;
  const end = item.end?.dateTime;
  if (!start || !end) return null;
  return {
    title: item.summary || "(No title)",
    description: item.description ?? undefined,
    start,
    end,
  };
}
