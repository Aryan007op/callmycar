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

### Option 3: From Root Folder
```bash
npm run dev     # Starts Vite frontend
npm run server  # Starts Express backend
```

## 🎨 Design System Match
- **Palette**: Retro Civic Pop (`primary-container`: Canary Yellow, `secondary-fixed`: Lavender, `tertiary`: Vintage Mint, `on-surface`: Carbon near-black)
- **Hard Shadow Rule**: Tactile neo-brutalist offset shadows (`shadow-[4px_4px_0px_#111827]`) with physical press states (`translate(2px, 2px)`).
- **Typography**: Space Grotesk for headlines & vehicle plates (`code-plate`), Plus Jakarta Sans for body copy.
