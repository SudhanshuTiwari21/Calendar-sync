"use client";

import { useState } from "react";

interface ReminderProps {
  title?: string;
  time?: string;
  snoozeMinutes?: number;
}

export default function Reminder({
  title = "Testing",
  time = "5:55 pm",
  snoozeMinutes: initialSnooze = 15,
}: ReminderProps) {
  const [snoozeMinutes, setSnoozeMinutes] = useState(initialSnooze);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  function handleDismiss() {
    setDismissed(true);
  }

  function handleComplete() {
    setDismissed(true);
  }

  function handleSnooze() {
    setDismissed(true);
    // In a real app, you'd schedule a new reminder here
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-between py-16 px-6 bg-gradient-to-b from-[#2d2640] via-[#4a3f6b] to-[#7b6b9e]">
      {/* Title & Time */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold text-white mb-3">{title}</h1>
        <p className="text-gray-300 text-lg">{time}</p>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-sm space-y-4 mb-12">
        <button
          onClick={handleDismiss}
          className="w-full py-4 rounded-full bg-[#6b5b95] hover:bg-[#7a6aa3] text-white font-semibold text-lg transition"
        >
          Dismiss
        </button>
        <button
          onClick={handleComplete}
          className="w-full py-4 rounded-full bg-[#6b5b95] hover:bg-[#7a6aa3] text-white font-semibold text-lg transition"
        >
          Complete
        </button>
      </div>

      {/* Snooze Controls */}
      <div className="flex items-center justify-center gap-4 w-full max-w-sm">
        <button
          onClick={() => setSnoozeMinutes((m) => Math.max(5, m - 5))}
          className="w-12 h-12 rounded-full bg-[#8b7ab5] hover:bg-[#9a8ac4] text-white text-2xl font-light flex items-center justify-center transition shadow-lg"
        >
          −
        </button>
        <button
          onClick={handleSnooze}
          className="flex-1 py-4 px-6 rounded-full bg-[#8b7ab5] hover:bg-[#9a8ac4] text-white font-semibold transition shadow-lg"
        >
          Snooze {snoozeMinutes} mins
        </button>
        <button
          onClick={() => setSnoozeMinutes((m) => Math.min(60, m + 5))}
          className="w-12 h-12 rounded-full bg-[#8b7ab5] hover:bg-[#9a8ac4] text-white text-2xl font-light flex items-center justify-center transition shadow-lg"
        >
          +
        </button>
      </div>
    </main>
  );
}
