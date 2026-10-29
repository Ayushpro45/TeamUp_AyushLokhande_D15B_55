# TeamUp — Cosmic Hackathon Matcher: Design Specification

> A structured design document optimized for IDE / AI-driven development environments.
> Translates the visual aesthetics of the TeamUp project into actionable technical specifications, component logic, and styling rules.

---

## 1. Visual Language & Global Styles

The application uses a **Glassmorphism design system** set against high-fidelity, animated cosmic backgrounds to create a **"Premium Tech"** feel.

### 1.1 Color Palette

**Backgrounds:**

| Token | Value | Usage |
|---|---|---|
| Cosmic Deep | `#0B0118` | Base background |
| Nebula Purple | `#2D0B5A` | Secondary background / panels |
| Plasma Teal | `#00D2FF` | Accent / highlights |

**Glass Panels:**

| Token | Value |
|---|---|
| Surface | `rgba(255, 255, 255, 0.05)` to `rgba(255, 255, 255, 0.1)` |
| Border | `1px solid rgba(255, 255, 255, 0.15)` |
| Iridescent Edge | `linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%, rgba(138,43,226,0.3) 100%)` |

**Typography:**

| Token | Value |
|---|---|
| Font Family | Inter or Montserrat (Sans-serif) |
| Headings | `#FFFFFF` (White) |
| Body | `rgba(255, 255, 255, 0.8)` (Off-white for readability) |

### 1.2 Global Effects

| Effect | CSS Value |
|---|---|
| Backdrop Blur | `backdrop-filter: blur(16px) saturate(180%);` |
| Shadows | `box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);` |

**Animation Strategy:**
- **Background:** Slow-motion CSS `linear-gradient` shift or subtle particle engine (Canvas).
- **Hover:** Elevation increase via `scale(1.02)` and increased border opacity.

---

## 2. Core Components

### 2.1 Navigation Bar (Glass Island)

- **Behavior:** Sticky top, floating "Island" style.
- **Style:**
  - `max-width: 1200px`, centered with auto margins.
  - **Profile/CTA:** Gradient button (Teal to Purple).
  - **Links:** Ghost buttons with subtle underglow on hover.

### 2.2 Squad Finder Card

- **Layout:** Vertical stack or 2-column small grid.
- **Elements:**
  - **Match Badge:** Top-right circular progress indicator with glowing neon ring.
  - **Tags:** Capsule-style badges with semi-transparent fills.
  - **Member Avatars:** Overlapping circular images with a `2px` glass border.

### 2.3 Form Elements

- **Inputs:** Translucent backgrounds with `1px solid` borders that glow on focus.
- **Buttons:**
  - **Primary:** Vibrant linear gradient (`#00D2FF` to `#9D50BB`).
  - **Secondary:** Glass-button with white text.

---

## 3. Screen Specifications

### 3.1 Landing Page (`/`)

- **Hero Section:** Left-aligned bold typography with iridescent text-shadow.
- **Interactive Element:** A 3D-tilted "floating" preview of a project card to the right of the hero text.
- **Call to Action:** Primary button with a persistent pulse animation to draw focus.

### 3.2 Login Portal (`/login`)

- **Layout:** Centered 2-column card.
- **Left Column:** "Why Join?" features list with glowing icons and persuasive copy.
- **Right Column:** Clean authentication form (Email/Password) + Social Auth buttons (GitHub/Google) in glass style.

### 3.3 Squad Dashboard (`/dashboard`)

- **Search Bar:** Ultra-wide glass input with a magnifying glass icon.
- **Filtering System:** Horizontal scrolling category chips (AI, Web3, UX, etc.).
- **Grid System:** `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` with a gap of `2rem`.
- **Match Engine:** Each card displays a "% Match" based on user profile tags vs. team requirements.

---

## 4. Implementation Notes for IDE

- **Tailwind Config Extensions:**
  - Add `backdropBlur: { 'xs': '2px', 'md': '12px', 'xl': '24px' }`.
  - Custom animation `spin-slow` for background nebula movement.
- **Accessibility:** Ensure contrast ratios on text remain high by adjusting `backdrop-filter: brightness(0.8)` on dark background sections.
