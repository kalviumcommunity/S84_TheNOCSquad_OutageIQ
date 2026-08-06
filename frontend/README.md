# OutageIQ Frontend

This is the isolated OutageIQ duplicate for the NOCSquad workspace.

Pages are split into separate files:

- `src/pages/login-page.tsx`
- `src/pages/outage-iq-overview-page.tsx`
- `src/pages/outage-queue-page.tsx`
- `src/pages/regional-view-page.tsx`
- `src/pages/analytics-page.tsx`
- `src/pages/export-page.tsx`

The app talks to the backend through `VITE_API_BASE_URL` and keeps the existing analytics project untouched.
