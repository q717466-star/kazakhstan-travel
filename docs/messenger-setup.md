# Messenger Setup Guide (Telegram Bot API & WhatsApp Cloud API)

## 1. Telegram Bot Setup

1. Open [@BotFather](https://t.me/BotFather) in Telegram, run `/newbot`, choose a name (e.g., `Kazakhstan Travel Concierge`) and username (e.g., `kazakhstan_travel_bot`).
2. Copy the bot token into `.env`:
   ```env
   TELEGRAM_BOT_TOKEN=123456:ABC-your-token
   TELEGRAM_BOT_USERNAME=kazakhstan_travel_bot
   TELEGRAM_WEBHOOK_SECRET=choose-a-random-webhook-secret
   ```
3. **Option A — Local Long Polling (easiest without HTTPS):**
   ```bash
   npm run bot:telegram
   ```
4. **Option B — Production HTTPS Webhook:**
   Register your deployed HTTPS endpoint with Telegram:
   ```bash
   curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url":"https://your-domain.com/api/webhooks/telegram","secret_token":"'"${TELEGRAM_WEBHOOK_SECRET}"'"}'
   ```
5. **Deep-Link Format on Tour Cards:**
   `https://t.me/<TELEGRAM_BOT_USERNAME>?start=tour_<TOUR_CODE>` (e.g., `tour_CHARYN-1D`).

---

## 2. WhatsApp Cloud API (Meta Business Platform)

1. In [Meta for Developers](https://developers.facebook.com/), create an app of type **Business** and add the **WhatsApp** product.
2. Under **WhatsApp -> API Setup**, note:
   - Temporary or permanent **System User Access Token** -> `WHATSAPP_ACCESS_TOKEN`
   - **Phone Number ID** -> `WHATSAPP_PHONE_NUMBER_ID`
   - **Test Phone Number** (for `wa.me` link) -> `WHATSAPP_DISPLAY_PHONE`
   - **App Secret** (App Settings -> Basic) -> `WHATSAPP_APP_SECRET`
3. Add to `.env`:
   ```env
   WHATSAPP_ACCESS_TOKEN=EAAG...
   WHATSAPP_PHONE_NUMBER_ID=1234567890
   WHATSAPP_VERIFY_TOKEN=kt_whatsapp_verify_dev
   WHATSAPP_APP_SECRET=your_meta_app_secret
   WHATSAPP_DISPLAY_PHONE=15550001234
   ```
4. Under **WhatsApp -> Configuration -> Webhook**, configure:
   - **Callback URL:** `https://your-domain.com/api/webhooks/whatsapp`
   - **Verify Token:** value matching `WHATSAPP_VERIFY_TOKEN`
   - Subscribe to the **`messages`** webhook field.
5. Every `POST` request to `/api/webhooks/whatsapp` verifies the `X-Hub-Signature-256` HMAC-SHA256 header against `WHATSAPP_APP_SECRET`.

---

## 3. Agreed Simulator Mode (When Live Meta Access Is Unavailable)

If a live Meta WhatsApp Business test number or public HTTPS tunnel is not configured during defense/review:
- Open `/admin/simulator` (signed in as Staff).
- The simulator executes authentic Telegram `Update` and WhatsApp Cloud API `entry[].changes[].value.messages[]` structures against the exact production adapters and unified database.
- **Explicit Reporting Rule:** In `docs/test-matrix.md`, simulator-verified WhatsApp checks explicitly record that **live message transport with Meta servers was not tested**, while verifying webhook payload parsing, HMAC signature validation, business logic, and CRM persistence.
