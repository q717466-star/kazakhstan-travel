# Defense & Live Demonstration Script (3–5 Minutes)

## Preparation (Before Presenting)
1. Start the server locally: `npm run dev`
2. Open three browser tabs:
   - Tab 1: `http://localhost:3000/en` (Public site)
   - Tab 2: `http://localhost:3000/admin/leads` (Sign in with `manager@kazakhstan-travel.local` / `Manager!2026`)
   - Tab 3: `http://localhost:3000/admin/simulator` (Bot & Webhook Test Bench)

## Walkthrough Sequence

1. **Public Website & UX Modernization (0:00 – 1:15)**
   - Show `/en`: fullscreen Charyn Canyon hero, Quick Trip Finder, asymmetric destination mosaic, popular 4x4 tours, verifiable company facts (`Since 2011`), and the interactive Leaflet Atlas map (click a destination marker to inspect elevation & linked tours).
   - Switch `/en` -> `/ru` -> `/kk` in the header to show complete localization with zero language mixing.
   - Open `/en/tours` and demonstrate live multi-filter combinations without page reload.

2. **Tour Detail & Web Pre-Booking (1:15 – 2:00)**
   - Open `/en/tours/charyn-canyon`: show gallery lightbox, expandable day-by-day timeline, interactive route map, and sticky booking card.
   - Submit the web pre-booking form -> highlight the instant `#KT-xxxxx` request number and `"Your booking is not confirmed yet."` notice.
   - Point to the **Book via Telegram** (`?start=tour_CHARYN-1D`) and **Book via WhatsApp** (`wa.me/...CHARYN-1D`) buttons right underneath.

3. **Telegram & WhatsApp Bots + Edge Cases (2:00 – 3:30)**
   - Switch to Tab 3 (`/admin/simulator`).
   - On **Telegram Bot**, select `CHARYN-1D` -> click **Launch** to simulate opening `t.me/...?start=tour_CHARYN-1D`.
   - Demonstrate validation: send past date `2020-01-01` (rejected), then valid `2027-07-15`, `2` travelers, name, choose **This chat** (show it does NOT re-ask phone), skip optional fields, tap **Proceed to Submit** -> **Decline** (no lead created), then toggle **Simulate DB Save Failure ON**, tap **I Agree & Submit** (no `#KT-xxxxx` issued, draft preserved), toggle failure **OFF**, tap **Retry Submission** -> `#KT-xxxxx` issued!
   - Switch to **WhatsApp Cloud API** and run a quick `Plan My Trip` custom itinerary with an international phone (`+44 20 7946 0958`). Click **Replay Duplicate Webhook Event** to prove zero duplicate leads.

4. **Unified Closed CRM Registry & CMS (3:30 – 4:30)**
   - Switch to Tab 2 (`/admin/leads`): refresh and show Website, Telegram, and WhatsApp requests all stored in the **same table** with sequential `#KT-xxxxx` IDs.
   - Filter by channel (`Telegram` / `WhatsApp` / `Website`).
   - Open the newest lead card (`/admin/leads/<id>`): inspect consent timestamp, parameters, notification trail, change status from `New` to `In Progress`, and save an audit note.
   - Briefly show `/admin/tours` CMS to confirm tours, prices, itineraries, and photos are managed without touching code.
