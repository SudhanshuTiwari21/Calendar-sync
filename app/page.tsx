"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

function ConnectContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const err = searchParams.get("error");
    if (err) setError(decodeURIComponent(err));
  }, [searchParams]);

  async function handleConnect() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/connect");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to connect");
      if (data.url) window.location.href = data.url;
      else throw new Error("No redirect URL received");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connection failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-950 via-purple-900 to-purple-700 p-6">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold text-white mb-2">Calendar Sync</h1>
        <p className="text-purple-200 mb-8">
          Connect your Google Calendar to sync events from our system into your
          calendar automatically.
        </p>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/20 text-red-200 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleConnect}
          disabled={loading}
          className="w-full max-w-xs mx-auto px-8 py-4 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-semibold text-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Connecting…" : "Connect"}
        </button>

        <p className="mt-6 text-purple-300 text-sm">
          You&apos;ll be redirected to Google to grant calendar access.
        </p>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-950 via-purple-900 to-purple-700">
          <p className="text-purple-200">Loading…</p>
        </main>
      }
    >
      <ConnectContent />
    </Suspense>
  );
}
