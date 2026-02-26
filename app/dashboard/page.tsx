"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Status = {
  connected: boolean;
  isAdmin: boolean;
  userId: string | null;
  connectedAccountsCount: number;
};

export default function Dashboard() {
  const [status, setStatus] = useState<Status | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() =>
        setStatus({
          connected: false,
          isAdmin: false,
          userId: null,
          connectedAccountsCount: 0,
        })
      );
  }, []);

  async function handleSyncNow() {
    setSyncLoading(true);
    setSyncMessage(null);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");
      const count = data.connectedAccounts ?? 0;
      setSyncMessage(
        data.synced > 0
          ? `Synced ${data.synced} new event(s) to ${count} account(s).`
          : data.message ?? `No new events to sync. (${count} connected account(s).)`
      );
    } catch (e) {
      setSyncMessage(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setSyncLoading(false);
    }
  }

  if (status === null) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-950 via-purple-900 to-purple-700">
        <p className="text-purple-200">Loading…</p>
      </main>
    );
  }

  if (!status.connected) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-950 via-purple-900 to-purple-700 p-6">
        <p className="text-purple-200 mb-6">Not connected to Google Calendar.</p>
        <Link
          href="/"
          className="px-6 py-3 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-semibold"
        >
          Connect
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center py-12 px-6 bg-gradient-to-b from-indigo-950 via-purple-900 to-purple-700">
      <h1 className="text-2xl font-bold text-white mb-2">
        {status.isAdmin ? "Admin Dashboard" : "Dashboard"}
      </h1>
      <p className="text-purple-200 mb-8 text-center max-w-md">
        {status.isAdmin
          ? "Create events in your Google Calendar app. Click Sync now to copy new events to all connected calendars (one-way: admin → everyone)."
          : "You're connected. Events created by the admin will appear in your Google Calendar. Reminders are sent by Google Calendar when the event time comes."}
      </p>

      {status.isAdmin && (
        <>
          <p className="text-purple-300 text-sm mb-4">
            Connected accounts: <strong>{status.connectedAccountsCount}</strong>
          </p>
          <button
            onClick={handleSyncNow}
            disabled={syncLoading}
            className="px-8 py-4 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-semibold disabled:opacity-60 mb-4"
          >
            {syncLoading ? "Syncing…" : "Sync now"}
          </button>
          {syncMessage && (
            <p className="text-purple-200 text-sm mb-6 max-w-md text-center">
              {syncMessage}
            </p>
          )}
        </>
      )}

      <Link
        href="/reminder"
        className="px-6 py-3 rounded-full bg-purple-500/80 hover:bg-purple-500 text-white font-medium"
      >
        View Reminder (preview)
      </Link>
      <p className="text-purple-400 text-xs mt-4 text-center max-w-sm">
        Real reminders are sent by the Google Calendar app when an event triggers.
      </p>
    </main>
  );
}
