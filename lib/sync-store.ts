/**
 * Tracks which admin calendar events we've already synced.
 * In production, persist this in a database.
 */
let lastSyncTime = 0;
const syncedEventIds = new Set<string>();

export function getLastSyncTime(): number {
  return lastSyncTime;
}

export function setLastSyncTime(t: number) {
  lastSyncTime = t;
}

export function isEventSynced(eventId: string): boolean {
  return syncedEventIds.has(eventId);
}

export function markEventSynced(eventId: string) {
  syncedEventIds.add(eventId);
}
