# Calendar Sync

Next.js app with **one admin account** and **one-way sync**: when the admin creates an event in their calendar (via this app), it is automatically synced to **all connected users’** Google Calendars.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select one)
3. Enable **Google Calendar API**: APIs & Services → Enable APIs → search "Google Calendar API" → Enable
4. Create OAuth credentials:
   - APIs & Services → Credentials → Create Credentials → OAuth client ID
   - Application type: **Web application**
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback`
   - Authorized JavaScript origins: `http://localhost:3000`

### 3. Environment variables

Copy `.env.example` to `.env.local` and set:

```bash
cp .env.example .env.local
```

- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` – from Google Cloud
- `ADMIN_EMAIL` – **exact Google account email** of the admin (e.g. `admin@gmail.com`). Only this account can create events; those events sync to all connected users.
- `NEXT_PUBLIC_APP_URL` – e.g. `http://localhost:3000`

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Flow

1. **Connect** – Any user (admin or not) clicks Connect → Google OAuth → calendar access granted. Their account is stored as a “connected” account.
2. **Admin** – The account whose email matches `ADMIN_EMAIL` sees the **Admin Dashboard** with a “Create event” form and the count of connected accounts.
3. **One-way sync** – When the admin creates an event, it is created in **every** connected account’s primary Google Calendar (including the admin’s). Regular (non-admin) users only see a read-only dashboard; they do not create events here.
4. **Reminder** – Visit `/reminder` for the reminder UI (Dismiss, Complete, Snooze).

## Pages

- `/` – Home with Connect button
- `/dashboard` – After connecting: **Admin** sees create-event form and sync; **others** see “You’re connected” (events from admin will appear in your calendar).
- `/reminder` – Reminder UI

## Token storage

Tokens are stored in memory per user (by email). For production, persist them in a database and add token refresh logic.
