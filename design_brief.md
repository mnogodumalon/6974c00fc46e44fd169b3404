# Design Brief: Bestellabgleich-System Dashboard

## 1. App Analysis

### What This App Does
This is an **Order Matching System** (Bestellabgleich-System) that helps procurement teams verify that order confirmations from suppliers match the original purchase orders. Users upload PDFs of orders (Bestellungen) and order confirmations (Auftragsbestätigungen), the system extracts data via OCR, and then automatically compares them to identify discrepancies. This prevents costly errors in procurement processes.

### Who Uses This
Procurement specialists, purchasing managers, and administrative staff who need to verify incoming order confirmations against their original orders. They're typically processing multiple orders daily and need to quickly identify which confirmations have issues that require attention.

### The ONE Thing Users Care About Most
**How many order matches have discrepancies?** Users need to immediately see which matches require their attention - the problematic ones where the confirmation doesn't match the order. This is the critical insight that drives their daily work.

### Primary Actions (IMPORTANT!)
1. **Neuen Abgleich starten** → Primary Action Button (Start a new matching process by linking an order to a confirmation)
2. View discrepancy details
3. Upload new order documents

---

## 2. What Makes This Design Distinctive

### Visual Identity
The design uses a **cool professional blue-gray palette with amber warning accents** that creates a sense of precision and reliability fitting for a document verification system. The warm amber accent draws immediate attention to items needing action, creating a visual "alert radar" effect. The overall aesthetic feels like a premium logistics or ERP tool - trustworthy, efficient, and serious about accuracy.

### Layout Strategy
- **Asymmetric desktop layout** with the hero status overview on the left (60%) and a compact action/stats panel on the right (40%)
- The hero is emphasized through **size dominance** - a large status donut chart showing the match/mismatch ratio takes center stage
- Visual interest comes from **contrasting card treatments**: the hero uses a subtle gradient border to stand out, while secondary cards use flat backgrounds
- Mobile uses **bold numeric typography** for the hero status count, with cards stacked in priority order

### Unique Element
The **status donut chart** in the hero section uses thick strokes with a subtle inner shadow and displays the discrepancy count in the center as a large, bold number. When there are discrepancies, the chart segment pulses subtly with a soft glow animation, creating urgency without being alarming. This makes the dashboard feel like a monitoring command center.

---

## 3. Theme & Colors

### Font
- **Family:** Plus Jakarta Sans
- **URL:** `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap`
- **Why this font:** Plus Jakarta Sans has a professional, contemporary feel with subtle geometric touches. Its slightly rounded terminals feel approachable while maintaining the seriousness needed for business software. The excellent weight range allows for strong typographic hierarchy.

### Color Palette
All colors as complete hsl() functions:

| Purpose | Color | CSS Variable |
|---------|-------|--------------|
| Page background | `hsl(220 20% 97%)` | `--background` |
| Main text | `hsl(220 25% 15%)` | `--foreground` |
| Card background | `hsl(0 0% 100%)` | `--card` |
| Card text | `hsl(220 25% 15%)` | `--card-foreground` |
| Borders | `hsl(220 15% 88%)` | `--border` |
| Primary action | `hsl(220 65% 48%)` | `--primary` |
| Text on primary | `hsl(0 0% 100%)` | `--primary-foreground` |
| Accent highlight | `hsl(220 60% 95%)` | `--accent` |
| Muted background | `hsl(220 15% 94%)` | `--muted` |
| Muted text | `hsl(220 10% 45%)` | `--muted-foreground` |
| Success/positive | `hsl(152 55% 42%)` | (component use) |
| Warning/attention | `hsl(38 95% 50%)` | (component use) |
| Error/negative | `hsl(0 72% 51%)` | `--destructive` |

### Why These Colors
The cool blue-gray foundation creates a calm, professional environment suited for focused analytical work. The primary blue is confident but not aggressive - perfect for a business tool. The amber warning color (used sparingly for discrepancies) provides strong contrast against the cool palette, making problems impossible to miss. The green success color is muted and earthy, celebrating matches without distraction.

### Background Treatment
The background uses a very subtle cool gray (`hsl(220 20% 97%)`) that's warmer than pure white but still feels clean. Cards are pure white to lift off the background slightly, creating gentle depth without harsh shadows.

---

## 4. Mobile Layout (Phone)

Design mobile as a COMPLETELY SEPARATE experience, not squeezed desktop.

### Layout Approach
Mobile emphasizes the hero metric (discrepancy count) as an oversized number that dominates the first viewport. The design creates urgency hierarchy: red/amber items appear first, then green successful matches. Visual interest comes from the large typographic treatment of numbers and status badges.

### What Users See (Top to Bottom)

**Header:**
- Title "Bestellabgleich" left-aligned, 20px semibold
- Primary action button "Neuer Abgleich" as a compact pill button on the right

**Hero Section (The FIRST thing users see):**
- Large status metric card taking ~35% of viewport height
- Center-aligned layout with:
  - Small label "Abweichungen" in muted text (14px)
  - HUGE number showing count of discrepancies (64px, bold, amber color if >0, green if 0)
  - Subtext "von X Abgleichen" in muted text (14px)
- Card has a subtle top border accent (4px) that's amber if discrepancies exist, green if all clear
- **Why this is the hero:** This single number tells users if they need to take action today. Zero means they can relax; any positive number demands attention.

**Section 2: Abgleich-Übersicht (Match Status Breakdown)**
- Horizontal row of 3 compact stat badges (not full cards - inline style)
- Shows: "X Übereinstimmend" (green dot) | "X Mit Abweichung" (amber dot) | "X Ausstehend" (gray dot)
- 14px text, tightly spaced

**Section 3: Aktuelle Abgleiche (Recent Matches)**
- Section title "Aktuelle Abgleiche" with count badge
- Vertically stacked cards for each match, showing:
  - Status indicator (colored left border: green=match, amber=discrepancy, gray=pending)
  - Order number and confirmation number
  - Supplier name
  - Date
  - Tap to expand and see discrepancy details (if any)
- Limited to 5 most recent, with "Alle anzeigen" link

**Section 4: Dokumente (Documents)**
- Collapsible section (collapsed by default on mobile)
- Tab-like toggle: "Bestellungen" | "Bestätigungen"
- Simple list of recent uploads with OCR status indicator
- Limited to 5 items each

**Bottom Navigation / Action:**
- Fixed bottom button "Neuen Abgleich starten" (full width, primary color)
- This duplicates the header action but is easier to reach with thumb

### Mobile-Specific Adaptations
- Donut chart from desktop becomes a simple numeric display (easier to read at small size)
- Table-based lists become card-based lists
- Documents section is collapsed to save space
- All touch targets minimum 44px height

### Touch Targets
- All interactive cards: minimum 48px height
- Buttons: 48px height
- Tab toggles: 44px height with generous horizontal padding

### Interactive Elements
- Match cards expand on tap to show discrepancy details (if discrepancies exist)
- Document items link to PDF viewer

---

## 5. Desktop Layout

### Overall Structure
**Two-column asymmetric layout:**
- Left column (60%): Hero section + chart + recent matches table
- Right column (40%): Stats summary + quick actions + documents

The eye flows: Hero chart (center-left) → Stats panel (right) → Recent matches (below hero)

### Section Layout

**Top Area (spans both columns):**
- Header bar with title "Bestellabgleich-System" and primary action button "Neuer Abgleich"

**Left Column - Main Content:**
1. **Hero Card (takes ~40% of left column height)**
   - Donut chart showing match status distribution (matches vs discrepancies vs pending)
   - Large center number showing discrepancy count
   - Legend below chart with clickable status filters

2. **Recent Matches Table (fills remaining height)**
   - Full table with columns: Status, Bestellnummer, AB-Nummer, Lieferant, Datum, Abweichungen
   - Status shown as colored badge
   - Sortable columns
   - Pagination at bottom

**Right Column - Supporting Content:**
1. **Stats Cards (compact, stacked vertically)**
   - Total Abgleiche (total matches)
   - Übereinstimmend (matching)
   - Mit Abweichung (with discrepancies)
   - Ausstehend (pending OCR)

2. **Dokumente Section**
   - Two collapsible panels: Bestellungen, Auftragsbestätigungen
   - Each shows count and latest 3 items
   - Upload button in each panel

### What Appears on Hover
- Table rows: subtle background highlight + "Details anzeigen" text appears
- Chart segments: tooltip with exact count and percentage
- Stats cards: subtle lift effect (shadow increase)

### Clickable/Interactive Areas
- Table rows → Open detail modal showing full comparison between order and confirmation
- Chart segments → Filter table to show only that status
- Document items → Open PDF viewer

---

## 6. Components

### Hero KPI
The MOST important metric that users see first.

- **Title:** Abweichungen
- **Data source:** `automatischer_abgleich` app, filter where `abgleich_status === false`
- **Calculation:** Count of records where `abgleich_status` is `false`
- **Display:**
  - Desktop: Donut chart with center number
  - Mobile: Large standalone number (64px bold)
- **Context shown:** "von X Abgleichen" showing total count for context
- **Why this is the hero:** Discrepancies are the actionable items - users need to know immediately if there are problems to resolve

### Secondary KPIs

**Gesamt-Abgleiche (Total Matches)**
- Source: `automatischer_abgleich` app
- Calculation: Total count of all records
- Format: number
- Display: Compact stat card, medium emphasis

**Übereinstimmend (Matching)**
- Source: `automatischer_abgleich` app, filter `abgleich_status === true`
- Calculation: Count where status is true
- Format: number with green accent
- Display: Compact stat card

**OCR Ausstehend (Pending OCR)**
- Source: Combined count from `bestellung` and `auftragsbestaetigung` where `ocr_status === false`
- Calculation: Count of records still awaiting OCR processing
- Format: number with muted style
- Display: Compact stat card

### Chart

- **Type:** Donut chart - WHY: Perfect for showing part-to-whole relationship of match statuses. The center hole allows displaying the key metric (discrepancy count) prominently.
- **Title:** Abgleich-Status
- **What question it answers:** What proportion of my order matches have issues?
- **Data source:** `automatischer_abgleich` app
- **Segments:**
  - Übereinstimmend (green): count where `abgleich_status === true`
  - Mit Abweichung (amber): count where `abgleich_status === false`
  - Noch nicht abgeglichen (gray): orders without a matching record (calculated)
- **Mobile simplification:** Replace with large number display only (chart doesn't work well at small sizes)

### Lists/Tables

**Aktuelle Abgleiche (Recent Matches)**
- Purpose: Let users see recent matching results and quickly identify which need attention
- Source: `automatischer_abgleich` app
- Fields shown:
  - Status badge (color-coded)
  - Bestellnummer (from linked `bestellung` record)
  - AB-Nummer (from linked `auftragsbestaetigung` record)
  - Lieferant
  - Datum
  - Abweichungen summary (first line or count)
- Mobile style: Cards with colored left border
- Desktop style: Full table with hover states
- Sort: By `createdat` descending (newest first)
- Limit: 10 items with pagination (desktop), 5 with "show all" (mobile)

**Bestellungen List**
- Purpose: Show recent orders and their OCR status
- Source: `bestellung` app
- Fields shown: Bestellnummer, Lieferant, Datum, OCR Status badge
- Mobile style: Compact list items
- Desktop style: Compact list in sidebar
- Sort: By `createdat` descending
- Limit: 5 items

**Auftragsbestätigungen List**
- Purpose: Show recent confirmations and their OCR status
- Source: `auftragsbestaetigung` app
- Fields shown: AB-Nummer, Lieferant, Datum, OCR Status badge
- Mobile style: Compact list items
- Desktop style: Compact list in sidebar
- Sort: By `createdat` descending
- Limit: 5 items

### Primary Action Button (REQUIRED!)

- **Label:** "Neuer Abgleich" (desktop header) / "Neuen Abgleich starten" (mobile bottom)
- **Action:** add_record
- **Target app:** `automatischer_abgleich` (6974c003a5ae425a8e64d3b3)
- **What data:**
  - `abgleich_bestellung`: Select dropdown of orders (applookup)
  - `abgleich_ab`: Select dropdown of confirmations (applookup)
- **Mobile position:** bottom_fixed (full width button)
- **Desktop position:** header (right-aligned button)
- **Why this action:** Creating new matches is the core workflow - users need to link orders to their confirmations to start the verification process

---

## 7. Visual Details

### Border Radius
Rounded (8px) - professional but not harsh. Cards use 12px for a slightly softer feel.

### Shadows
Subtle - Cards have `0 1px 3px rgba(0,0,0,0.06)` for gentle lift. Hover states increase to `0 4px 12px rgba(0,0,0,0.08)`.

### Spacing
Normal - 24px gap between major sections, 16px within card content, 12px between list items.

### Animations
- **Page load:** Subtle fade-in stagger (cards appear 50ms apart)
- **Hover effects:** Cards lift slightly (translateY -2px) with shadow increase over 150ms
- **Tap feedback:** Quick scale to 0.98 and back
- **Chart:** Segments animate in on load, spinning from 0 to final value

---

## 8. CSS Variables (Copy Exactly!)

The implementer MUST copy these values exactly into `src/index.css`:

```css
:root {
  --background: hsl(220 20% 97%);
  --foreground: hsl(220 25% 15%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(220 25% 15%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(220 25% 15%);
  --primary: hsl(220 65% 48%);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(220 15% 94%);
  --secondary-foreground: hsl(220 25% 15%);
  --muted: hsl(220 15% 94%);
  --muted-foreground: hsl(220 10% 45%);
  --accent: hsl(220 60% 95%);
  --accent-foreground: hsl(220 25% 15%);
  --destructive: hsl(0 72% 51%);
  --border: hsl(220 15% 88%);
  --input: hsl(220 15% 88%);
  --ring: hsl(220 65% 48%);
  --radius: 0.5rem;

  /* Custom semantic colors for this app */
  --success: hsl(152 55% 42%);
  --warning: hsl(38 95% 50%);
}
```

---

## 9. Implementation Checklist

The implementer should verify:
- [ ] Font loaded from URL above (Plus Jakarta Sans with weights 300-700)
- [ ] All CSS variables copied exactly
- [ ] Mobile layout matches Section 4 (hero number, stacked cards, bottom action)
- [ ] Desktop layout matches Section 5 (60/40 split, donut chart, table)
- [ ] Hero element is prominent as described (large number/chart)
- [ ] Colors create the professional, calm mood described in Section 2
- [ ] Status colors used correctly: green=match, amber=discrepancy, gray=pending
- [ ] Primary action button present in both mobile (bottom fixed) and desktop (header)
- [ ] Donut chart implemented for desktop with center number
- [ ] Table has proper hover states and is sortable
- [ ] Data loaded from correct apps using existing types and services
