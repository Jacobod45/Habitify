# Habitify — IS4447 Mobile Application Development

**GitHub Repository:** https://github.com/Jacobod45/Habitify

---

## Expo Link / QR Code

| Platform | Link |
|----------|------|
| iOS | https://expo.dev/preview/update?message=Final+submission&updateRuntimeVersion=1.0.0&createdAt=2026-04-23T19%3A08%3A51.397Z&slug=exp&projectId=c74287a9-b2cb-4abe-a402-cf5c1d5ee817&group=d566939f-d08b-4ea5-9f7c-812750237ec3 |
| Android | https://expo.dev/preview/update?message=Final+submission&updateRuntimeVersion=1.0.0&createdAt=2026-04-23T19%3A07%3A36.272Z&slug=exp&projectId=c74287a9-b2cb-4abe-a402-cf5c1d5ee817&group=ac810ae0-6c8b-4513-a321-ef23156a64a8 |

To open on your phone: install **Expo Go** from the App Store or Google Play, then scan the QR code found at either link above.

---

## App Details

- **App Name:** Habitify
- **Option:** A — Habit Tracker
- **Student Number:** [your student number]

Habitify is a mobile habit tracking application that allows users to define habits, log activity over time, set weekly and monthly targets, and view progress through charts and insights.

---

## Setup Instructions

### Prerequisites

- Node.js (v18 or later)
- npm
- Expo Go installed on your phone (for testing)

### Install Dependencies

```bash
npm install
```

### Run the App

```bash
npx expo start
```

Scan the QR code displayed in the terminal with Expo Go on your phone.

### Demo Account

A pre-seeded demo account is available for immediate testing:

- **Email:** demo@example.com
- **Password:** demo1234

### Environment Variables

Create a `.env` file in the project root (already gitignored):

```
EXPO_PUBLIC_NINJA_API_KEY=your_api_ninjas_key_here
```

Get a free API key at https://api-ninjas.com to enable the daily motivational quote feature. The app works without it and will display a fallback quote.

---

## Features

- Register, log in, log out, and delete account
- Create, edit, and delete habits with categories
- Log habit activity with date, count, and notes
- Set weekly and monthly goals with progress tracking
- Search and filter habits by text, category, and date range
- Insights with bar charts (daily completions, per-habit breakdown)
- Streak tracking for consecutive days
- Light and dark mode with persistent preference
- Daily reminder notifications (mobile only)
- Export habit logs as CSV
- Daily motivational quote via external API
- Full offline storage using SQLite via Drizzle ORM
