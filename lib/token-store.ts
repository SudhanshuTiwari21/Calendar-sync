/**
 * Token store: in-memory with file persistence so tokens survive server restarts.
 * For production, use a proper database (e.g., Redis, PostgreSQL).
 */

import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

interface StoredToken {
  access_token: string;
  refresh_token?: string | null;
  expiry_date?: number;
}

const tokenStore = new Map<string, StoredToken>();

const DATA_DIR = join(process.cwd(), ".data");
const TOKENS_FILE = join(DATA_DIR, "tokens.json");

function normalizeKey(email: string): string {
  return email.trim().toLowerCase();
}

async function loadFromFile(): Promise<void> {
  try {
    const raw = await readFile(TOKENS_FILE, "utf-8");
    const data = JSON.parse(raw) as Record<string, StoredToken>;
    for (const [key, tokens] of Object.entries(data)) {
      if (tokens?.access_token) tokenStore.set(key, tokens);
    }
  } catch {
    // File missing or invalid - ignore
  }
}

function saveToFile(): void {
  (async () => {
    try {
      await mkdir(DATA_DIR, { recursive: true });
      const data: Record<string, StoredToken> = {};
      Array.from(tokenStore.entries()).forEach(([key, tokens]) => {
        data[key] = tokens;
      });
      await writeFile(TOKENS_FILE, JSON.stringify(data, null, 0), "utf-8");
    } catch (err) {
      console.error("Token store: failed to persist tokens", err);
    }
  })();
}

let loadPromise: Promise<void> | null = null;

/** Call at the start of API routes that need tokens (e.g. sync). Loads from file if memory is empty. */
export async function ensureTokenStoreLoaded(): Promise<void> {
  if (tokenStore.size > 0) return;
  if (!loadPromise) loadPromise = loadFromFile();
  await loadPromise;
}

export function setTokens(userId: string, tokens: StoredToken): void {
  tokenStore.set(normalizeKey(userId), tokens);
  saveToFile();
}

export function getTokens(userId: string): StoredToken | undefined {
  return tokenStore.get(normalizeKey(userId));
}

/** All user ids (emails) that have connected their calendar. Keys are normalized lowercase. */
export function getAllConnectedUserIds(): string[] {
  return Array.from(tokenStore.keys());
}