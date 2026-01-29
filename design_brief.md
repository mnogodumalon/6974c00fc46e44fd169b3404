# Design Brief: Bestellabgleich-System

## 1. App Analysis

### What This App Does
This is an **Order Comparison System** (Bestellabgleich) that helps businesses verify that their orders match the order confirmations received from suppliers. Users upload order documents (Bestellungen) and order confirmations (Auftragsbestätigungen), the system uses OCR to extract data, and then automatically compares them to find discrepancies. It's a critical quality control tool for procurement departments.

### Who Uses This
Procurement managers, purchasing assistants, and operations staff who need to verify that what they ordered matches what the supplier confirmed. They process many documents daily and need to quickly identify discrepancies before goods arrive.

### The ONE Thing Users Care About Most
**"Are there any mismatches I need to deal with?"** - Users want to see at a glance how many comparisons have discrepancies that require their attention. The match rate and pending issues are their primary concern.

### Primary Actions (IMPORTANT!)
1. **Neuen Abgleich starten** → Primary Action Button - Start a new comparison by selecting a Bestellung and Auftragsbestätigung
2. View comparison details when discrepancies are found
3. Mark comparisons as resolved (weiter)

---

## 2. What Makes This Design Distinctive

### Visual Identity
This design embraces a **precision-focused, technical aesthetic** that suits a document comparison tool. A cool slate-blue base with a sharp teal accent creates a professional atmosphere that signals accuracy and reliability. The design feels like a **quality control dashboard** - clean, no-nonsense, but with subtle sophistication in its typography and spacing that elevates it above generic admin panels.

### Layout Strategy
- **Asymmetric layout on desktop**: Wide left column (70%) contains the hero metric and comparison list; narrow right column (30%) shows recent documents for quick reference
- **Hero metric dominates**: The "Übereinstimmungsrate" (match rate) percentage takes center stage with large typography and a semi-circular gauge visualization
- **Visual interest through contrast**: The hero uses a large radial gauge with thick strokes, while secondary KPIs use compact inline badges - creating clear hierarchy
- **Status-driven color coding**: Green for matches, amber/orange for discrepancies, creating instant visual scanning

### Unique Element
The **semi-circular gauge** for the match rate uses a thick 12px stroke with a gradient from teal to slate, giving it a premium instrument-panel feel. The percentage number sits inside the gauge with extreme size (64px) creating a bold focal point that anchors the entire dashboard.

---

## 3. Theme & Colors

### Font
- **Family:** Space Grotesk
- **URL:** `https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap`
- **Why this font:** Space Grotesk has a technical, precision feel with its geometric forms and slightly condensed proportions. Perfect for a data comparison tool that needs to feel accurate and modern.

### Color Palette
All colors as complete hsl() functions:

| Purpose | Color | CSS Variable |
|---------|-------|--------------|
| Page background | `hsl(210 25% 97%)` | `--background` |
| Main text | `hsl(215 25% 17%)` | `--foreground` |
| Card background | `hsl(0 0% 100%)` | `--card` |
| Card text | `hsl(215 25% 17%)` | `--card-foreground` |
| Borders | `hsl(210 18% 88%)` | `--border` |
| Primary action | `hsl(173 58% 39%)` | `--primary` |
| Text on primary | `hsl(0 0% 100%)` | `--primary-foreground` |
| Accent highlight | `hsl(173 58% 94%)` | `--accent` |
| Muted background | `hsl(210 20% 94%)` | `--muted` |
| Muted text | `hsl(215 16% 47%)` | `--muted-foreground` |
| Success/positive | `hsl(158 64% 42%)` | (component use) |
| Warning/attention | `hsl(38 92% 50%)` | (component use) |
| Error/negative | `hsl(0 72% 51%)` | `--destructive` |

### Why These Colors
The cool slate-blue background creates a calm, focused environment suitable for detailed comparison work. The teal primary (`hsl(173 58% 39%)`) is distinctive but professional - it signals precision and reliability without being generic blue. The subtle warmth in the warning orange creates urgency for discrepancies without being alarming.

### Background Treatment
The page background uses a subtle cool gray (`hsl(210 25% 97%)`) that's slightly blue-tinted, creating a professional workspace feel. Cards sit on pure white, creating clear separation and depth without heavy shadows.

---

## 4. Mobile Layout (Phone)

Design mobile as a COMPLETELY SEPARATE experience, not squeezed desktop.

### Layout Approach
Mobile prioritizes the hero metric and action button. The match rate gauge dominates the top fold, with status cards using horizontal scroll for space efficiency. The list of comparisons uses a compact card format optimized for thumb scrolling.

### What Users See (Top to Bottom)

**Header:**
Simple header with app title "Bestellabgleich" left-aligned. No navigation clutter.

**Hero Section (The FIRST thing users see):**
- **What:** Match rate percentage with semi-circular gauge
- **Size:** Takes approximately 45% of viewport height
- **Styling:**
  - Large 56px number centered in gauge
  - "Übereinstimmungsrate" label below (14px, muted)
  - Gauge uses 10px stroke, gradient from primary to muted
  - Card with generous padding (24px)
- **Why:** Users need to know instantly if there are problems to address

**Section 2: Status Summary**
- Horizontal scrolling row of 3 compact status badges
- "Gesamt Abgleiche" (total), "Übereinstimmend" (matching), "Mit Abweichungen" (with discrepancies)
- Each badge: icon + number + label, pill-shaped, background colored by status
- Fits without scrolling on most phones, but scrolls gracefully if needed

**Section 3: Letzte Abgleiche (Recent Comparisons)**
- Section title "Letzte Abgleiche" with small "Alle anzeigen" link
- Stack of comparison cards (max 5 visible)
- Each card shows:
  - Status indicator (green dot or orange dot)
  - Bestellnummer and Lieferant
  - Date (compact format: "15. Jan")
  - Chevron for drill-down

**Bottom Navigation / Action:**
- Fixed bottom bar with primary action button
- "Neuen Abgleich starten" - full width, teal background, white text
- 16px margin from edges, safe area aware

### Mobile-Specific Adaptations
- Gauge is smaller but still prominent (200px diameter vs 280px desktop)
- Status badges use horizontal scroll instead of grid
- Comparison list cards are more compact (less padding, single-line info)
- No right sidebar - documents list is accessible via separate tab/view

### Touch Targets
- All tappable elements minimum 44px height
- Comparison cards have full-width tap area
- Primary button is 52px tall for comfortable thumb tap

### Interactive Elements
- Comparison cards tap to show full detail view with:
  - Both document numbers
  - Full discrepancy list (if any)
  - Option to mark as "weiter" (proceed)

---

## 5. Desktop Layout

### Overall Structure
Two-column asymmetric layout:
- **Left column (70%):** Hero metric + comparison list
- **Right column (30%):** Recent documents sidebar

Eye flow: Hero gauge (top-left, largest) → Status KPIs (below hero) → Comparison list (main content) → Documents sidebar (reference)

### Section Layout

**Top Left Area - Hero (spans 60% width, first row):**
- Match rate gauge (280px diameter)
- Large percentage in center
- "Übereinstimmungsrate" label
- Contained in elevated card

**Top Right Area - Quick Stats (spans 40% width, first row):**
- 3 KPI cards in vertical stack within the row
- Total comparisons
- Matching count
- Discrepancies count (highlighted if > 0)

**Main Content Area - Left Column:**
- "Letzte Abgleiche" section heading with filter dropdown
- Table view of comparisons:
  - Status (icon)
  - Bestellnummer
  - AB-Nummer (order confirmation)
  - Lieferant
  - Datum
  - Abweichungen (count)
- Sortable columns
- Pagination if > 10 items

**Right Sidebar:**
- "Dokumente" section
- Two tabs: "Bestellungen" / "Bestätigungen"
- List of recent documents (5 each)
- Shows: Nummer, Lieferant, OCR status icon
- Quick access without leaving dashboard

### What Appears on Hover
- Table rows highlight with subtle background change
- Status badges show tooltip with full status text
- Document items in sidebar show "Abgleich starten" quick action

### Clickable/Interactive Areas
- Table rows click to expand inline detail view showing:
  - Full comparison results
  - Discrepancy details in table format
  - Action buttons
- Sidebar documents click to start new comparison with that document pre-selected

---

## 6. Components

### Hero KPI
The MOST important metric that users see first.

- **Title:** Übereinstimmungsrate
- **Data source:** AutomatischerAbgleich app
- **Calculation:** (count where abgleich_status = true) / (total count) × 100
- **Display:** Semi-circular gauge with percentage in center
  - Gauge: 280px desktop, 200px mobile
  - Stroke: 12px desktop, 10px mobile
  - Number: 64px desktop, 56px mobile, font-weight 700
  - Color: gradient from primary (full) to muted (empty)
- **Context shown:** "von X Abgleichen" subtitle showing total
- **Why this is the hero:** Instantly answers "how well are things going?" - the core user need

### Secondary KPIs

**Gesamt Abgleiche (Total Comparisons)**
- Source: AutomatischerAbgleich
- Calculation: count of all records
- Format: number
- Display: Compact card with icon, uses muted styling

**Übereinstimmend (Matching)**
- Source: AutomatischerAbgleich
- Calculation: count where abgleich_status = true
- Format: number with percentage
- Display: Card with success color accent (green)

**Mit Abweichungen (With Discrepancies)**
- Source: AutomatischerAbgleich
- Calculation: count where abgleich_status = false
- Format: number
- Display: Card with warning color accent (orange) - draws attention if > 0

### Chart (if applicable)
No chart needed for this dashboard. The gauge visualization serves as the primary data visualization. The comparison list provides the detailed breakdown.

### Lists/Tables

**Letzte Abgleiche (Recent Comparisons)**
- Purpose: Show recent comparison results for review and action
- Source: AutomatischerAbgleich (joined with Bestellung and Auftragsbestaetigung via applookup)
- Fields shown:
  - Status indicator (boolean → icon/color)
  - Bestellnummer (from linked Bestellung)
  - AB-Nummer (from linked Auftragsbestaetigung)
  - Lieferant
  - Datum (createdat)
  - Abweichungen (parsed from abgleich_abweichungen, show count or "Keine")
- Mobile style: Stacked cards with status dot, main info, and chevron
- Desktop style: Table with sortable columns
- Sort: By createdat descending (newest first)
- Limit: 10 items with pagination

**Documents Sidebar (Desktop only)**
- Purpose: Quick access to source documents
- Source: Bestellung and Auftragsbestaetigung
- Fields shown: Nummer, Lieferant, OCR status
- Style: Simple list with icon indicators
- Sort: By createdat descending
- Limit: 5 per type

### Primary Action Button (REQUIRED!)

- **Label:** "Neuen Abgleich starten"
- **Action:** add_record
- **Target app:** AbgleichStarten (which triggers the automatic comparison)
- **What data:** Form with two select fields:
  - abgleich_bestellung (select from Bestellung records)
  - abgleich_ab (select from Auftragsbestaetigung records)
- **Mobile position:** bottom_fixed (full width bar)
- **Desktop position:** header (top right of main content area)
- **Why this action:** Starting new comparisons is the core workflow - users need to verify orders constantly

---

## 7. Visual Details

### Border Radius
Rounded (8px) - professional but not too soft. Cards use 12px for slight extra softness.

### Shadows
Subtle - cards use `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)` for gentle lift without feeling heavy.

### Spacing
Normal to spacious - generous padding inside cards (20px mobile, 24px desktop), 16px gaps between elements. The dashboard should feel organized and breathable, not cramped.

### Animations
- **Page load:** Stagger fade-in for cards (50ms delay between each)
- **Hover effects:** Subtle background color shift on interactive rows
- **Tap feedback:** Scale down slightly (0.98) on button press
- **Gauge:** Animate from 0 to actual value on load (600ms ease-out)

---

## 8. CSS Variables (Copy Exactly!)

The implementer MUST copy these values exactly into `src/index.css`:

```css
:root {
  --background: hsl(210 25% 97%);
  --foreground: hsl(215 25% 17%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(215 25% 17%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(215 25% 17%);
  --primary: hsl(173 58% 39%);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(210 20% 94%);
  --secondary-foreground: hsl(215 25% 17%);
  --muted: hsl(210 20% 94%);
  --muted-foreground: hsl(215 16% 47%);
  --accent: hsl(173 58% 94%);
  --accent-foreground: hsl(173 58% 25%);
  --destructive: hsl(0 72% 51%);
  --border: hsl(210 18% 88%);
  --input: hsl(210 18% 88%);
  --ring: hsl(173 58% 39%);
  --chart-1: hsl(173 58% 39%);
  --chart-2: hsl(158 64% 42%);
  --chart-3: hsl(38 92% 50%);
  --chart-4: hsl(215 25% 17%);
  --chart-5: hsl(210 20% 94%);
  --radius: 0.5rem;
}
```

---

## 9. Implementation Checklist

The implementer should verify:
- [ ] Font loaded from Google Fonts URL above (Space Grotesk)
- [ ] All CSS variables copied exactly
- [ ] Mobile layout matches Section 4 (hero gauge, horizontal status badges, stacked cards, fixed bottom button)
- [ ] Desktop layout matches Section 5 (two-column asymmetric, hero left, sidebar right)
- [ ] Hero element is prominent as described (large gauge with percentage)
- [ ] Colors create the mood described in Section 2 (professional, precision-focused)
- [ ] Primary action button present and functional
- [ ] Status colors applied correctly (green for match, orange for discrepancy)
- [ ] Gauge animates on load
- [ ] Table/list shows linked data from Bestellung and Auftragsbestaetigung
