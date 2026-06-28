# TopJobOffer — Student Ambassador Portal

The intern portal for the TopJobOffer Student Ambassador Program. Students
register, get shortlisted/selected by an admin, complete four onboarding tasks,
then run a 30-day mission to earn points and climb a leaderboard for rewards.

Built with **Next.js 16** (App Router + Proxy), **MongoDB/Mongoose**, **shadcn/ui**
+ **Tailwind v4**, **jose** sessions, and **nodemailer** transactional email.

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in the values below
npm run dev
```

Open http://localhost:3000.

## Environment variables

See `.env.example`. Summary:

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string (e.g. a free Atlas cluster). |
| `SESSION_SECRET` | Random string used to sign session + magic-link tokens. |
| `ADMIN_PASSWORD` | Shared password for the `/admin` area. |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | SMTP for nodemailer. Leave unset to log emails to the console. |
| `EMAIL_FROM` | From address for outgoing email. |
| `NEXT_PUBLIC_APP_URL` | Public base URL, used to build magic links in emails. |
| `TJO_API_MODE` | `mock` (default) or `live` for the main-app verification API. |
| `TJO_API_BASE_URL` / `TJO_API_KEY` | Required only when `TJO_API_MODE=live`. |

The app builds, lints, and typechecks with no secrets set; database/email/API
calls fail or fall back gracefully at request time.

## How it works

- **Register** (`/register`) → saves a `Student` and sends a welcome email.
- **Admin** (`/admin`, password-gated) → review applicants, **Shortlist** (emails a
  private magic link), **Select**, or **Reject**.
- **Onboarding** (`/onboarding`, student magic-link session) → four tasks verified
  against the main-app API (mock by default). All four verified → officially **selected**.
- **Dashboard** (`/dashboard`) → 30-day mission cards with progress, points balance,
  leaderboard rank, and reward tiers. "Sync my stats" pulls the latest mission stats.

### Verification API

`lib/topjoboffer-api.ts` is the single client for the main app's verification
endpoint. It runs in `mock` mode (deterministic fixtures) until the real endpoint
exists. To go live, set `TJO_API_BASE_URL` + `TJO_API_KEY` and `TJO_API_MODE=live`.

### Auth

Lightweight and swappable: `jose`-signed cookies for the admin (`ADMIN_PASSWORD`)
and for students (magic link emailed on shortlist). `proxy.ts` gates the `/admin`
and `/onboarding` + `/dashboard` areas. Swapping to Clerk later means replacing
`lib/auth.ts` + `proxy.ts` while pages/routes keep calling `lib/session.ts`.

## Scripts

```bash
npm run dev        # start the dev server
npm run build      # production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```
