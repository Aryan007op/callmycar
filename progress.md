# CallMyCar (UnblockIt) — Development Progress & Handover Guide

> **Document Purpose:** This file summarizes everything implemented so far according to the official implementation plan (`callmycar_implementation_plan.md`). Any AI model or developer picking up this codebase can quickly understand the system architecture, design constraints, current state, and next steps.

---

## 1. Project Overview & Core Mission

- **Problem:** Urban drivers get blocked by parked cars. Government vehicle databases (like VAHAN) mask owner phone numbers for privacy, leading to hostile street encounters, towing fees, or stranded drivers.
- **Solution:** A privacy-first civic web application where a stranded driver looks up a blocking car's license plate, selects the civic issue, and triggers an automated, masked **AI Voice Agent call** or **anonymous SMS** to the registered owner without exposing either party's personal phone number.
- **Visual Source of Truth:** `stitch_ai_assistance_gateway/` contains reference designs generated in Stitch (`callmycar_home_vehicle_search`, `callmycar_contact_vehicle_owner`, and `retro_civic_pop/DESIGN.md`). **The built UI must strictly match these designs.**

---

## 2. Directory Layout

```
d:/antigravity op/callmycar/
├── package.json                              ← Root runner scripts (npm run dev, npm run server)
├── README.md                                 ← Project overview & run instructions
├── progress.md                               ← This handover document
│
├── stitch_ai_assistance_gateway/             ← Reference files (READ ONLY)
│   ├── callmycar_home_vehicle_search/        ← Screen 1 reference (code.html, screen.png)
│   ├── callmycar_contact_vehicle_owner/      ← Screen 2 reference (code.html, screen.png)
│   └── retro_civic_pop/DESIGN.md             ← Official design tokens & specifications
│
└── app/
    ├── frontend/                             ← React 19 + Vite + Tailwind CSS
    │   ├── package.json                      ← React 19, react-router-dom, framer-motion, lucide-react
    │   ├── vite.config.js                    ← Vite configured with proxy: /api -> http://localhost:3001
    │   ├── index.html                        ← Space Grotesk, Plus Jakarta Sans, exact Tailwind tokens
    │   └── src/
    │       ├── index.css                     ← Base layer styling, neo-brutalist tactile interactions
    │       ├── main.jsx                      ← React application entry point
    │       ├── App.jsx                       ← React Router config (/ and /contact/:plate)
    │       ├── api/
    │       │   └── client.js                 ← Fetch client for backend with auto-mock fallback
    │       ├── components/
    │       │   ├── Header.jsx                ← Fixed navigation bar with logo, links, and avatar
    │       │   ├── Footer.jsx                ← 4-column brand, platform, and legal footer
    │       │   └── AICallModal.jsx           ← Modal with progressive live call states & visualizer
    │       └── pages/
    │           ├── Home.jsx                  ← Screen 1: Hero, Bay #4 scene, Plate Lookup, Bento
    │           └── Contact.jsx               ← Screen 2: Relay breadcrumb, AI Voice Card, SMS Card
    │
    └── backend/                              ← Express.js API Server
        ├── package.json                      ← express, cors, dotenv
        └── server.js                         ← /api/lookup, /api/call, /api/status/:id, /api/sms
```

---

## 3. Implementation Status vs. Implementation Plan

| Plan Phase | Component / Task | Status | Notes |
|---|---|---|---|
| **Phase 1** | Design Foundation & Token System | ✅ Completed | Exact Retro Civic Pop tokens in `index.html` & `tailwind.config` |
| **Phase 1** | Typography & Icons Setup | ✅ Completed | Space Grotesk + Plus Jakarta Sans + Material Symbols Outlined |
| **Phase 2** | Shared Components (`Header`, `Footer`) | ✅ Completed | Pixel-perfect to Stitch source with active link states |
| **Phase 3** | Screen 1: Hero Section | ✅ Completed | Lavender neo-brutalist playground with dot-matrix & companion bot |
| **Phase 3** | Screen 1: Scallop Wave SVG Divider | ✅ Completed | Organic SVG curve between Lavender and Canary Yellow decks |
| **Phase 3** | Screen 1: Elm Street Bay #4 Card | ✅ Completed | Isometric parking scene with live status tags & prompt |
| **Phase 3** | Screen 1: Plate Lookup Tool | ✅ Completed | State picker, embossed plate field, demo chips, proceed CTA |
| **Phase 3** | Screen 1: Inline Notice Selector | ✅ Completed | Expands upon lookup with 4 civic prompt buttons & toast |
| **Phase 3** | Screen 1: Bento Grid & Pledge Banner | ✅ Completed | 3-step sequence + 120,000 drivers civic pledge card |
| **Phase 4** | Screen 2: Step Breadcrumbs | ✅ Completed | `1. Plate` → `2. Select Relay` → `3. Solved` tracker |
| **Phase 4** | Screen 2: Verified Vehicle Banner | ✅ Completed | Plate chip, Community Verified, Active Shield, ~42s response |
| **Phase 4** | Screen 2: Urgency Switcher | ✅ Completed | Toggle between Urgent Dispatch & Gentle Reminder |
| **Phase 4** | Screen 2: AI Voice Agent Card | ✅ Completed | Speech config, soundwave indicator, risk tiers, initiate CTA |
| **Phase 4** | Screen 2: Anonymous SMS Card | ✅ Completed | 5 preset templates, photo attachment input, send alert CTA |
| **Phase 4** | Screen 2: Relay Architecture Diagram | ✅ Completed | Reporter (A) → Relay Node (B) → Vehicle Owner (C) |
| **Phase 4** | Screen 2: `AICallModal` | ✅ Completed | Progressive 4-step call simulation, live timer, audio visualizer |
| **Phase 5** | Screen 3: Register Vehicle (`/register`) | ✅ Completed | Dedicated onboarding flow, masked phone link, live decal preview |
| **Phase 5** | Backend: Register API (`POST /api/register`) | ✅ Completed | Enrolls car & owner phone into DB; activates SafeNeighborhood shield |
| **Phase 5** | Backend: Vehicle Lookup (`POST /api/lookup`) | ✅ Completed | Mock VAHAN database supporting NY, CA, WA, DL, & dynamic plates |
| **Phase 5** | Backend: AI Call Trigger (`POST /api/call`) | ✅ Completed | Vapi AI Voice integration (`VAPI_API_KEY`, `VAPI_ASSISTANT_ID`) + simulation |
| **Phase 5** | Backend: Live Call Polling (`GET /api/status/:id`)| ✅ Completed | Returns progression (ringing → answered → speaking → completed) |
| **Phase 5** | Backend: SMS Dispatch (`POST /api/sms`) | ✅ Completed | Relay dispatch with Twilio integration hooks |
| **Phase 6** | Production Build Verification | ✅ Completed | `npm run build` succeeds cleanly in < 1 second |
| **Phase 6** | Live Services Execution | ✅ Running | Frontend (port 5173) and Backend (port 3001) are active |

---

## 4. Key Architectural Decisions

1. **Exact Design Fidelity:**
   The design system is **Retro Civic Pop** (neo-brutalist light with 0px blur hard shadows `shadow-[4px_4px_0px_#111827]`, pill-shaped geometry, and saturated canary yellows + lavender + mint). No arbitrary colors were introduced; all values match `retro_civic_pop/DESIGN.md`.

2. **Full-Stack Separation with Zero-Setup Fallback:**
   - The frontend communicates with the backend via Vite's proxy (`/api` -> `http://localhost:3001`).
   - If the backend is stopped or unavailable, `src/api/client.js` automatically degrades gracefully to client-side simulations so the UI remains 100% interactive and demo-ready at all times.

3. **In-Memory Mock Database:**
   Pre-configured test license plates in `app/backend/server.js`:
   - `AA 1234` (NY) — Sapphire Blue Sedan (2022)
   - `782 WXY` (CA) — Pearl White Sedan (2023)
   - `4XYZ 890` (WA) — Midnight Black SUV (2021)
   - `DL 01 AB 1234` (DL, India) — Modern Steel Sedan (2021)
   - Any other input string generates a valid verified vehicle record dynamically.

---

## 5. Live Ports & How to Run

- **Frontend:** `http://localhost:5173/` (Vite dev server)
- **Backend:** `http://localhost:3001/` (Express API)

**Commands to start from root (`d:/antigravity op/callmycar`):**
```bash
npm run dev     # Starts Vite frontend on :5173
npm run server  # Starts Express server on :3001
```

---

## 6. What to Build Next (Roadmap for Next Steps)

1. **Real API Integration (Production Credentials):**
   - Add `.env` in `app/backend/` with `BLAND_AI_API_KEY` or `VAPI_API_KEY` for placing actual live AI outbound phone calls.
   - Add `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PROXY_NUMBER` for real SMS delivery.
2. **Real Photo Upload Handling:**
   - Implement multipart form data (`multer`) on `POST /api/sms` to store anonymous photo attachments for the blocking car.
3. **Sound Effects / Audio Feedback:**
   - Add subtle haptic click sounds or synthetic dial tones during the `AICallModal` countdown.
4. **Mobile Testing & PWA Manifest:**
   - Add a Web App Manifest so users can save CallMyCar as a home screen PWA on iOS/Android.
