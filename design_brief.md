# Design Brief: Bestellabgleich-System Dashboard

## 1. App Analysis

### What This App Does
This is an **Order Comparison System (Bestellabgleich-System)** used in B2B procurement workflows. Users upload purchase orders (Bestellungen) and order confirmations (Auftragsbestätigungen), then the system automatically compares them to detect discrepancies in quantities, prices, delivery dates, or item details. This prevents costly errors from mismatched orders going unnoticed until goods arrive.

### Who Uses This
Procurement specialists, purchasing clerks, and operations managers in mid-sized companies who process multiple supplier orders daily. They need to quickly spot which comparisons failed and what specific differences exist. They're busy, not tech-savvy, and want to see problems at a glance without clicking through multiple screens.

### The ONE Thing Users Care About Most
**How many comparisons have discrepancies right now?** They want to immediately see if everything is okay (all green) or if there are problems requiring attention (red alerts). The ratio of matched vs. mismatched comparisons is their primary concern.

### Primary Actions (IMPORTANT!)
1. **Neuen Abgleich starten** (Start new comparison) → Primary Action Button - users frequently need to initiate a comparison between an order and its confirmation
2. View details of a specific discrepancy
3. Mark comparison as reviewed/resolved

---

## 2. What Makes This Design Distinctive

### Visual Identity
A cool, precise aesthetic that reflects the analytical nature of procurement work. The design uses a slate-blue undertone throughout with a bold teal accent that signals "comparison" and "verification" - trust and accuracy without being cold. The typography is technical and precise (IBM Plex Sans) reflecting the data-driven nature of the work, while generous spacing keeps the dense information scannable.

### Layout Strategy
The layout uses **asymmetric weighting** to create clear hierarchy:
- **Hero section** dominates the top with a large status indicator showing the critical match rate
- Two smaller supporting KPIs sit beside it (total comparisons, pending reviews)
- Below, a full-width recent comparisons list shows the actual work items
- The asymmetry comes from the hero being 2x the visual weight of supporting KPIs

Visual interest is created through:
- **Size variation**: Hero KPI is 48px vs 24px for secondary metrics
- **Color coding**: Green/red/amber status indicators create immediate meaning
- **Card depth variation**: Hero card has more elevation than list items
- **Whitespace**: Hero section has extra breathing room below it

### Unique Element
A **circular progress ring** around the match rate percentage that fills based on the success ratio. When 100% of comparisons match, the ring is completely green. As discrepancies increase, the ring shows a red segment. This gamification-inspired element makes the abstract match rate visceral and immediately understandable - like a health meter in a game.

---

## 3. Theme & Colors

### Font
- **Family:** IBM Plex Sans
- **URL:** `https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap`
- **Why this font:** IBM Plex Sans conveys technical precision and trustworthiness - perfect for a data verification system. Its slightly condensed characters allow more data to fit while remaining highly readable.

### Color Palette
All colors as complete hsl() functions:

| Purpose | Color | CSS Variable |
|---------|-------|--------------|
| Page background | `hsl(210 20% 98%)` | `--background` |
| Main text | `hsl(215 25% 17%)` | `--foreground` |
| Card background | `hsl(0 0% 100%)` | `--card` |
| Card text | `hsl(215 25% 17%)` | `--card-foreground` |
| Borders | `hsl(214 20% 90%)` | `--border` |
| Primary action | `hsl(173 58% 39%)` | `--primary` |
| Text on primary | `hsl(0 0% 100%)` | `--primary-foreground` |
| Accent highlight | `hsl(173 40% 95%)` | `--accent` |
| Muted background | `hsl(210 20% 96%)` | `--muted` |
| Muted text | `hsl(215 16% 47%)` | `--muted-foreground` |
| Success/positive | `hsl(158 64% 40%)` | (component use) |
| Error/negative | `hsl(0 72% 51%)` | `--destructive` |

### Why These Colors
The cool slate-blue base creates a calm, professional environment that doesn't fatigue eyes during long work sessions. The teal primary is distinctive without being loud - it suggests verification and checking (like a checkmark color). The subtle warm cream undertone in the background prevents it from feeling sterile. Red and green are used sparingly only for status indicators where color meaning is universal.

### Background Treatment
The background is a subtle cool gray-blue (`hsl(210 20% 98%)`) - not pure white - creating depth when cards sit on top. No gradients or patterns; the simplicity keeps focus on the data.

---

## 4. Mobile Layout (Phone)

Design mobile as a COMPLETELY SEPARATE experience optimized for quick status checks on the go.

### Layout Approach
Mobile uses a stacked vertical flow with the hero status ring taking prominent center position. The design assumes mobile users are checking "is everything okay?" rather than doing deep analysis. Size variation creates hierarchy: the hero ring is large and centered, while KPIs use a compact horizontal arrangement.

### What Users See (Top to Bottom)

**Header:**
- App title "Bestellabgleich" left-aligned, 20px semibold
- Primary action button "Neuer Abgleich" as icon button (+ icon) in top right, 44px touch target

**Hero Section (The FIRST thing users see):**
- Large circular progress ring, 180px diameter, centered
- Inside the ring: Match rate percentage in 48px bold (e.g., "87%")
- Below the number: "Übereinstimmung" label in 14px muted text
- Ring stroke is 10px with rounded caps
- Green fill for matched portion, red for mismatched
- Takes approximately 45% of initial viewport height
- **Why this is hero:** Users opening on mobile want instant status - "are there problems?" This ring gives that answer in under 1 second.

**Section 2: Quick Stats Row**
- Horizontal row of 3 compact stats, not cards - just inline numbers
- "23 Abgleiche" | "3 Abweichungen" | "5 Offen"
- Each stat: 24px number above 12px label, separated by thin vertical dividers
- This row is dense and scannable, contrasting with the spacious hero above

**Section 3: Aktuelle Abgleiche (Recent Comparisons)**
- Section header "Aktuelle Abgleiche" 16px semibold
- List of comparison cards, each card showing:
  - Status indicator dot (green/red) on left edge, 12px
  - Order number and confirmation number on two lines
  - Supplier name in muted text
  - Date on right side
  - Chevron indicating tap-to-expand
- Cards have minimal padding (12px) and 4px gap between them
- Show last 5 comparisons, then "Alle anzeigen" link

**Bottom Navigation / Action:**
- Floating action button (FAB) in bottom-right corner
- Teal primary color, 56px diameter
- Plus icon inside
- 16px margin from edges
- This duplicates the header action for thumb-friendly access

### Mobile-Specific Adaptations
- Hero ring is centered and larger relative to screen than on desktop
- Stats row is horizontal scroll if needed, but 3 stats should fit
- Comparison cards are full-width with reduced padding
- No hover states - tap feedback via subtle scale animation

### Touch Targets
- All tappable elements minimum 44px
- FAB is 56px for easy thumb reach
- Card rows have full-width tap area

### Interactive Elements
- Tapping a comparison card expands it inline to show discrepancy details (if any)
- Collapsible accordion pattern - only one expanded at a time

---

## 5. Desktop Layout

### Overall Structure
Two-column layout with 65/35 split:
- **Left column (65%):** Hero metrics section + comparison list
- **Right column (35%):** Quick filters and summary sidebar

The eye flows: Hero ring (top-left) → Supporting KPIs (below hero) → Comparison list (scrollable main content) → Filters (right sidebar for power users)

Visual interest comes from the asymmetric column split and the hero ring's size dominance.

### Section Layout

**Top Area (Left Column):**
- Hero card spans full left column width
- Contains: Large progress ring (200px) on left, text stats on right
- Ring shows match percentage with green/red segments
- Right of ring:
  - "87%" large number (56px)
  - "Übereinstimmung" label
  - "23 von 26 Abgleichen erfolgreich" subtext
- Card has subtle shadow (0 2px 8px rgba(0,0,0,0.06))

**Below Hero (Left Column):**
- Row of 3 metric cards, equal width
- "Gesamt-Abgleiche" (total comparisons) - count + trend
- "Abweichungen" (discrepancies) - count, red accent if > 0
- "Ausstehend" (pending review) - count, amber if > 0
- Each card: Number large (32px), label below (14px muted)

**Main Content (Left Column):**
- "Aktuelle Abgleiche" section header with sort dropdown
- Table-style list showing:
  - Status column (dot indicator)
  - Bestellnummer (order number)
  - AB-Nummer (confirmation number)
  - Lieferant (supplier)
  - Datum (date)
  - Abweichungen (discrepancy count or "Keine")
- Alternating row backgrounds for scanability
- Pagination at bottom

**Right Sidebar (35%):**
- Sticky position, doesn't scroll with main content
- "Filter" section:
  - Status filter (Alle / Übereinstimmend / Abweichend)
  - Date range picker
  - Supplier dropdown
- "Neuer Abgleich" primary button, full sidebar width
- Below button: Quick stats summary
  - Documents this week
  - Avg. processing time

### What Appears on Hover
- Table rows highlight with subtle background tint
- Comparison rows show "Details anzeigen" link on right
- Metric cards show subtle elevation increase

### Clickable/Interactive Areas
- Clicking any comparison row opens a detail modal showing:
  - Full comparison data
  - Side-by-side order vs confirmation fields
  - Highlighted discrepancies in red
  - "Als geprüft markieren" action button

---

## 6. Components

### Hero KPI
The MOST important metric that users see first.

- **Title:** Übereinstimmungsrate (Match Rate)
- **Data source:** Abgleichsergebnis app
- **Calculation:** Count records where `abgleich_status === true` divided by total records, multiply by 100
- **Display:** Large percentage number (56px desktop, 48px mobile) inside a circular progress ring
- **Context shown:** Ring visualization shows proportion, subtext shows "X von Y Abgleichen erfolgreich"
- **Why this is the hero:** The match rate is the single number that tells users if the system is healthy or needs attention. Everything else is supporting detail.

### Secondary KPIs

**Gesamt-Abgleiche (Total Comparisons)**
- Source: Abgleichsergebnis (count all records)
- Calculation: Simple count
- Format: number
- Display: Card with large number

**Abweichungen (Discrepancies)**
- Source: Abgleichsergebnis where `abgleich_status === false`
- Calculation: Count of failed comparisons
- Format: number with red accent if > 0
- Display: Card with large number, destructive color when > 0

**Ausstehende Prüfungen (Pending Reviews)**
- Source: Abgleichsergebnis where `abgleich_weiter === false` or null
- Calculation: Count of items not yet marked as reviewed
- Format: number with amber accent if > 0
- Display: Card with large number

### Chart (if applicable)
- **Type:** None for initial version - the circular progress ring serves as the primary visualization
- The data is more suited to lists than time-series charts since comparisons are discrete events

### Lists/Tables

**Aktuelle Abgleiche (Recent Comparisons)**
- Purpose: Show the actual work items users need to review
- Source: Abgleichsergebnis joined with AbgleichStarten → Bestellung and Auftragsbestaetigung
- Fields shown:
  - Status indicator (from abgleich_status)
  - Bestellnummer (from linked Bestellung)
  - AB-Nummer (from linked Auftragsbestaetigung)
  - Lieferant (from linked Bestellung)
  - Datum (createdat from Abgleichsergebnis)
  - Abweichungen count or "Keine"
- Mobile style: Compact cards with status dot, stacked text
- Desktop style: Table rows with columns
- Sort: By date descending (newest first)
- Limit: 10 items with pagination

### Primary Action Button (REQUIRED!)

- **Label:** "Neuer Abgleich" (mobile: plus icon only in FAB)
- **Action:** navigate to comparison selection
- **Target app:** Opens a modal/dialog to select Bestellung and Auftragsbestaetigung to compare
- **What data:** User selects from dropdown: 1) Bestellung, 2) Auftragsbestaetigung - then submits to create AbgleichStarten record
- **Mobile position:** FAB (bottom-right floating action button) + small icon button in header
- **Desktop position:** Sidebar, full-width button at top of right column
- **Why this action:** Starting a new comparison is the most frequent action - users receive new confirmations constantly and need to verify them against orders

---

## 7. Visual Details

### Border Radius
Rounded (8px) - professional but not sharp, not overly soft

### Shadows
Subtle - cards use `0 2px 8px rgba(0,0,0,0.06)`, hero card slightly more `0 4px 12px rgba(0,0,0,0.08)`

### Spacing
Spacious - 24px gap between major sections, 16px within cards, 8px between list items

### Animations
- **Page load:** Subtle fade-in (200ms), progress ring animates from 0 to actual value (600ms ease-out)
- **Hover effects:** Cards lift slightly with increased shadow
- **Tap feedback:** Brief scale to 0.98 on mobile touch

---

## 8. CSS Variables (Copy Exactly!)

The implementer MUST copy these values exactly into `src/index.css`:

```css
:root {
  --background: hsl(210 20% 98%);
  --foreground: hsl(215 25% 17%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(215 25% 17%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(215 25% 17%);
  --primary: hsl(173 58% 39%);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(210 20% 96%);
  --secondary-foreground: hsl(215 25% 17%);
  --muted: hsl(210 20% 96%);
  --muted-foreground: hsl(215 16% 47%);
  --accent: hsl(173 40% 95%);
  --accent-foreground: hsl(215 25% 17%);
  --destructive: hsl(0 72% 51%);
  --border: hsl(214 20% 90%);
  --input: hsl(214 20% 90%);
  --ring: hsl(173 58% 39%);
  --chart-1: hsl(158 64% 40%);
  --chart-2: hsl(0 72% 51%);
  --chart-3: hsl(45 93% 47%);
  --chart-4: hsl(173 58% 39%);
  --chart-5: hsl(215 16% 47%);
  --radius: 0.5rem;
}
```

---

## 9. Implementation Checklist

The implementer should verify:
- [ ] IBM Plex Sans font loaded from Google Fonts URL
- [ ] All CSS variables copied exactly as specified
- [ ] Mobile layout matches Section 4 (FAB, centered hero ring, compact stats row)
- [ ] Desktop layout matches Section 5 (65/35 split, hero with ring left-aligned)
- [ ] Hero progress ring animates on load
- [ ] Hero shows actual match rate from API data
- [ ] Secondary KPIs show correct counts with color coding
- [ ] Comparison list shows linked data (order number, confirmation number, supplier)
- [ ] FAB appears on mobile only
- [ ] Sidebar with filters appears on desktop only
- [ ] "Neuer Abgleich" button opens selection dialog
- [ ] Color coding: green for matched, red for discrepancies, amber for pending
