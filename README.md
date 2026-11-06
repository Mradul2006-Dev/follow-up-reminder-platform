# RemindPulse MD: Patient Follow-up Reminder Platform

Frontend (phase 1) built from the Google Stitch export. Next.js 14 (App Router), TypeScript, Tailwind CSS v3.
**Mock data only.** There is no backend, database, auth or WhatsApp integration yet.

## Run

```bash
npm install
npm run dev        # http://localhost:3000  (redirects to /dashboard)
npm run build      # production build
npm run lint && npm run typecheck
```

## Screens

| Route         | What it does                                                                                   |
| ------------- | ---------------------------------------------------------------------------------------------- |
| `/dashboard`  | Stats, today's follow-ups (filter tabs, search, pagination, row actions), upcoming rail        |
| `/patients`   | Patient list, consent filter, search, Add Patient, record/revoke WhatsApp consent              |
| `/follow-ups` | Today / Upcoming / Past / All with status filter, search, pagination                           |
| `/settings`   | Clinic profile, automation toggles, editable message templates with live WhatsApp preview      |

Header actions (Add Patient, Schedule Follow-up) and the search box work on every page.

## Structure

```
src/lib/types.ts            domain types (mirror future Supabase tables)
src/lib/mock-data.ts        deterministic seed data (1,284 patients, follow-ups)
src/lib/stats.ts            dashboard numbers, derived from the data
src/lib/followups.ts        pure helpers (status transitions, search, labels)
src/lib/store/store.tsx     the only place state is mutated; calls services
src/lib/services/           <- INTEGRATION SEAM (see below)
src/components/ui/          reusable primitives (Button, Modal, Dropdown, Pagination ...)
src/components/layout/      Sidebar, Header, MobileNav, AppShell
src/components/modals/      Add Patient, Schedule/Reschedule Follow-up, Visit Summary
```

## Integration guide (Supabase + Twilio)

All persistence and messaging goes through `src/lib/services/types.ts`:

- `PatientService`, `FollowUpService`, `SettingsService` -> implement with Supabase, then export them from
  `src/lib/services/index.ts` in place of `mockServices`. Components do not need to change.
- `WhatsAppService.sendReminder` -> implement **server-side** (API route / edge function) with Twilio.
  Use pre-approved templates with quick-reply buttons; a Twilio status webhook should update
  `follow_ups.status` (e.g. `scheduled` -> `confirmed`).
- The store seeds state synchronously from mock data. With Supabase, load initial data on the server (or in an effect)
  and add loading/error states.
- `MOCK_TODAY` in `src/lib/date.ts` pins the demo to Oct 24, 2025. Replace with the real current date/clinic timezone.
- Secrets live in server-side env vars only. See `.env.example` (placeholders, nothing real is committed).
  The consent flag (`patients.whatsappOptIn`) must be enforced server-side before any message is sent.

## Notes

- Icons use a self-hosted Material Symbols font (`public/fonts`, ~4 MB). Subset it before production.
- Data resets on page refresh (in-memory).
