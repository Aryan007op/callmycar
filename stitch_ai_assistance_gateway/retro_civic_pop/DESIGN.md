---
name: Retro Civic Pop
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daef'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edff'
  surface-container-high: '#e1e8fd'
  surface-container-highest: '#dce2f7'
  on-surface: '#141b2b'
  on-surface-variant: '#4e4635'
  inverse-surface: '#293040'
  inverse-on-surface: '#edf0ff'
  outline: '#807662'
  outline-variant: '#d2c5ae'
  surface-tint: '#785a00'
  primary: '#785a00'
  on-primary: '#ffffff'
  primary-container: '#f6c343'
  on-primary-container: '#6c5100'
  inverse-primary: '#f2bf40'
  secondary: '#8d447c'
  on-secondary: '#ffffff'
  secondary-container: '#ffa8e6'
  on-secondary-container: '#7d366d'
  tertiary: '#006a65'
  on-tertiary: '#ffffff'
  tertiary-container: '#61ddd4'
  on-tertiary-container: '#005f5a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdf9b'
  primary-fixed-dim: '#f2bf40'
  on-primary-fixed: '#251a00'
  on-primary-fixed-variant: '#5b4300'
  secondary-fixed: '#ffd7f0'
  secondary-fixed-dim: '#fface7'
  on-secondary-fixed: '#3a0032'
  on-secondary-fixed-variant: '#712c63'
  tertiary-fixed: '#7cf6ec'
  tertiary-fixed-dim: '#5dd9d0'
  on-tertiary-fixed: '#00201e'
  on-tertiary-fixed-variant: '#00504c'
  background: '#f9f9ff'
  on-background: '#141b2b'
  surface-variant: '#dce2f7'
typography:
  display-hero:
    fontFamily: Space Grotesk
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 46px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-lg:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 18px
    letterSpacing: 0.04em
  label-md:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  code-plate:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: 0.12em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1.25rem
  margin: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
  space-2xl: 4rem
---

## Brand & Style

This design system channels a high-energy, friendly, retro-tech neo-brutalist movement. It merges mid-century arcade pop with contemporary digital product design to transform civic accountability—such as parking notifications and vehicle lookup—from an adversarial interaction into an engaging, community-first experience.

### Visual Mood & Persona
- **Warm & Optimistic:** Saturated canary yellows paired with punchy lilac/bubblegum create an inviting, approachable atmosphere that diffuses everyday road friction.
- **Retro-Tech Utility:** Inspired by isometric arcade perspective, tactile physical pushbuttons, and crisp mechanical linework.
- **Neo-Brutalist Light:** Celebrates bold outlines (`#111827`), punchy solid drop shadows (offset without blur), and clear dimensional layers while remaining soft and friendly through rounded pill corners and generous spatial rhythm.
- **Target Audience:** Urban drivers, cyclists, pedestrians, and modern vehicle fleet operators who appreciate straightforward, delightful civic utility without bureaucratic sterility.

## Colors

The palette employs warm, saturated primaries balanced with high-contrast structural darks and pastel utility surfaces:

- **Primary (`#F6C343`):** Radiant Amber Gold. Drives hero banners, primary canvas zones, active highlights, and primary CTA bases.
- **Secondary (`#F29CDA` / `#EFA6DE`):** Vivid Retro Lilac-Pink. Used for section breaks, secondary action tiers, notification badges, and playful container accents.
- **Tertiary (`#4ECDC4`):** Vintage Mint/Teal. Delivers instant feedback for status tags (e.g., "Parked", "Resolved"), success metrics, toggle switches, and isometric illustration details.
- **Neutral Deep (`#111827`):** Near-black Carbon. Provides absolute contrast for headlines, iconic 2px/3px structural borders, and flat hard-offset drop shadows.
- **Neutral Light (`#FFFDF7` / `#FFFFFF`):** Warm milk-white foundation for input fields, text cards, modal sheets, and data tables to preserve effortless readability.

## Typography

The pairing blends the structured, geometric quirkiness of **Space Grotesk** with the fluid, hyper-legible ergonomics of **Plus Jakarta Sans**.

- **Display & Headings:** Set in `Space Grotesk` (weights 600 and 700). Its square terminals and retro-futuristic proportions anchor hero sections, plate search bars, and title ribbons.
- **Body & Continuous Copy:** Set in `Plus Jakarta Sans`. Its open apertures and smooth humanist curves guarantee effortless scanning on mobile screens during rapid outdoors tasks.
- **License Plate & Identifier Tokens:** Utilizes `code-plate` (Space Grotesk 700 with wide letter-spacing `0.12em`) inside high-contrast framed input fields to mimic physical vehicle registration plates.

## Layout & Spacing

Layout adheres to a 12-column responsive fluid grid on desktop and a single/two-column stack on mobile, framed with generous margins and rhythmic content containers.

### Grid Architecture
- **Desktop (>=1024px):** 12 columns, `1.25rem` (20px) gutters, `2.5rem` (40px) outer margin, max content width capped at `1200px`.
- **Tablet (768px - 1023px):** 8 columns, `1rem` (16px) gutters, `2rem` (32px) margins.
- **Mobile (<768px):** 4 columns, `0.75rem` (12px) gutters, `1.25rem` (20px) outer margin.

### Wave Dividers & Segment Transitions
Sections transition between solid color backgrounds (such as the Lilac hero and the Sunny Yellow action deck) using organic scallop or wavy divider SVGs, establishing distinctive separation without sterile grey divider lines.

## Elevation & Depth

This system avoids blurry realistic drop shadows in favor of a tactile, neo-brutalist hard shadow model:

- **The Hard Offset Rule:** Surfaces and interactive items express elevation through solid black (`#111827`) offset shadows with `0px` blur.
  - **Level 1 (Cards, Static Panels):** `box-shadow: 3px 3px 0px #111827; border: 2px solid #111827;`
  - **Level 2 (Buttons, Badges, Plate Inputs):** `box-shadow: 4px 4px 0px #111827; border: 2px solid #111827;`
  - **Level 3 (Modals, Action Dialogs, Floating Tooltips):** `box-shadow: 6px 6px 0px #111827; border: 3px solid #111827;`
- **Active / Pressed State:** On click or press, elements translate diagonally (`transform: translate(2px, 2px);`) while the shadow reduces proportionately, producing an authentic tactile "click" sensation.
- **Overlay Panels:** Translucent frosted overlays are strictly replaced by crisp high-contrast surfaces over solid tinted backdrops.

## Shapes

Shapes in this system combine structural stability with pill-rounded friendliness (Level 3):

- **Interactive CTAs & Buttons:** Full pill geometry (`border-radius: 9999px`).
- **Vehicle Input Fields & Plate Frames:** Pill or high-radius container (`border-radius: 1.25rem`) with defined 2px `#111827` borders.
- **Cards & Functional Modules:** Pill-adjacent generous rounds (`border-radius: 1.5rem` to `2rem`).
- **Pill Badges & Status Chips:** Fully rounded caps with internal padded micro-icons.

## Components

### Buttons
- **Primary CTA:** Saturated warm tone (e.g., `#EFA6DE` or `#E67E48` as in the reference proceed bar), pill-shaped, encapsulated by a `2px solid #111827` stroke, hard `4px 4px 0px #111827` offset shadow. Label rendered in bold Space Grotesk.
- **Secondary / Ghost CTA:** White or clear background with `2px solid #111827` outline and matching hard offset shadow. On hover, background fills with Tertiary Mint (`#4ECDC4`).
- **Micro-Pills:** Compact height (`36px`), full rounded pill, used for action items like "See Plans" and "Copy Link".

### License Plate & Lookup Input
- **Container:** High-visibility `#FFFFFF` background with heavy `2px solid #111827` border, `1.25rem` radius, and `4px 4px 0px #111827` shadow.
- **Typography:** Display uppercase monospaced feel using Space Grotesk (`code-plate`), placeholder in subdued `#6B7280`.
- **States:** Focus ring uses `#4ECDC4` solid offset or an expanded `3px` solid `#111827` boundary without blur.

### Cards & Action Modules
- **Surface:** Crisp white or light pastel background (`#FFFDF7`), framed with `2px solid #111827` and `4px 4px 0px #111827` drop shadow.
- **Headers:** Space Grotesk title paired with an isometric mini-icon or colored circular badge.
- **Inner Dividers:** Single-pixel solid `#111827` dashed or solid horizontal rules.

### Chips & Tags
- **Status Badges:** Mint (`#4ECDC4`), Lavender (`#EFA6DE`), and Primrose (`#F6C343`) fills with `1.5px solid #111827` border, font size `12px`, uppercase letter-spaced tracking.

### Checkboxes & Radios
- **Shape:** Square with `4px` corner radius for checkboxes, perfect circles for radios.
- **Style:** `2px solid #111827` border with a crisp `2px 2px 0px #111827` shadow. Checked state fills with `#4ECDC4` displaying a chunky black checkmark icon.

### Quick-Action Communication Sheets
- Bottom sheet or centered modal for vehicle owner contact options (e.g., "Parked in Front of Driveway", "Lights Left On", "Window Open"). 
- Stacked pill button lists with distinct colored icons and immediate haptic feedback on touch.