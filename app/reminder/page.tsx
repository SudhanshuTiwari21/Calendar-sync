import Reminder from "@/components/Reminder";

export default function ReminderPage() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div>
      <p className="text-center text-purple-300 text-sm py-4 bg-purple-900/50">
        This is a preview. Real reminders are sent by the Google Calendar app when an event triggers.
      </p>
      <Reminder
        title="Testing"
        time={timeStr}
        snoozeMinutes={15}
      />
    </div>
  );
}
