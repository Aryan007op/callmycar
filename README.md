# CallMyCar (UnblockIt)

A civic-minded web app that bridges the gap between stranded drivers and vehicle owners anonymously via AI Voice Agents and encrypted SMS relays.

## 🚀 Architecture & Structure

```
d:/antigravity op/callmycar/
├── stitch_ai_assistance_gateway/         ← Stitch UI reference files (design source)
│   ├── callmycar_home_vehicle_search/    ← Screen 1: Home + plate lookup
│   ├── callmycar_contact_vehicle_owner/  ← Screen 2: Contact relay & AI voice
│   └── retro_civic_pop/DESIGN.md         ← Design system token specifications
│
└── app/
    ├── frontend/                         ← React 19 + Vite + Tailwind CSS
    │   ├── src/
    │   │   ├── api/client.js             ← Backend client with seamless offline fallback
    │   │   ├── components/
    │   │   │   ├── Header.jsx            ← Fixed nav with logo & links
    │   │   │   ├── Footer.jsx            ← 4-column brand & legal footer
    │   │   │   └── AICallModal.jsx       ← Progressive live AI voice call modal
    │   │   └── pages/
    │   │       ├── Home.jsx              ← Screen 1: Plate lookup, parking bay & bento
    │   │       └── Contact.jsx           ← Screen 2: Verified banner, AI voice & SMS relay
    │   └── vite.config.js                ← Proxies /api to backend port 3001
    │
    └── backend/                          ← Express.js API server
        └── server.js                     ← /api/lookup, /api/call, /api/status, /api/sms
```

## 🛠️ How to Run

### Option 1: Run Frontend
```bash
cd app/frontend
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Option 2: Run Backend
```bash
cd app/backend
node server.js
```
API running on [http://localhost:3001](http://localhost:3001).

## Telegram Vehicle Pairing

The registration success screen links the owner to the Telegram bot with the vehicle plate embedded in a `/start` deep link. The backend configures the Telegram webhook on startup when `TELEGRAM_WEBHOOK_URL` and `TELEGRAM_WEBHOOK_SECRET` are set.

Configure these backend environment variables in local development and in the deployment environment:

- `TELEGRAM_BOT_TOKEN` from BotFather.
- `TELEGRAM_WEBHOOK_URL` as the public API URL ending in `/api/telegram-webhook`.
- `TELEGRAM_WEBHOOK_SECRET` as a private random secret containing letters, numbers, `_`, or `-`.
- `FIREBASE_PROJECT_ID` and `FIREBASE_SERVICE_ACCOUNT_JSON` for server-side Firestore access. The service account JSON must be kept as a server secret. Local Google Application Default Credentials are also supported.
- `TELEGRAM_BOT_USERNAME` is optional; when omitted, the backend retrieves it from Telegram using the bot token.

The webhook writes the Telegram chat ID to `vehicles/{cleanPlate}`. Alert delivery reads that document on the backend and returns a pairing-required response until the owner connects Telegram.

## WhatsApp Delivery Setup

The WhatsApp button sends through WhatsApp Web. Start the backend on a persistent machine and scan the QR code printed in its terminal on first run. The linked session is saved on the persistent auth path so it remains authenticated after restarts. The `/api/whatsapp-status` endpoint reports whether the session is ready.

Vercel serverless cannot keep the browser or authentication session alive. For AWS, use the EC2 + persistent EBS setup in [`app/backend/AWS_DEPLOY.md`](app/backend/AWS_DEPLOY.md) and [`app/backend/docker-compose.aws.yml`](app/backend/docker-compose.aws.yml). Scan the backend's QR once, then set frontend build variable `VITE_BACKEND_URL` in the frontend host to the backend's public HTTPS URL and redeploy the frontend. Leave it blank for local development through the Vite proxy. Twilio credentials are still used by the separate voice-call features, but WhatsApp alerts do not fall back to Twilio.

### Option 3: From Root Folder
```bash
npm run dev     # Starts Vite frontend
npm run server  # Starts Express backend
```

## 🎨 Design System Match
- **Palette**: Retro Civic Pop (`primary-container`: Canary Yellow, `secondary-fixed`: Lavender, `tertiary`: Vintage Mint, `on-surface`: Carbon near-black)
- **Hard Shadow Rule**: Tactile neo-brutalist offset shadows (`shadow-[4px_4px_0px_#111827]`) with physical press states (`translate(2px, 2px)`).
- **Typography**: Space Grotesk for headlines & vehicle plates (`code-plate`), Plus Jakarta Sans for body copy.
