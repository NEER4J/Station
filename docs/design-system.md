# Design System & UI Reference

> Visual design language for the Station platform (XsiteIO replica for gas station & convenience store management).

---

## 1. Color Palette

All colors use standard Tailwind CSS utility classes.

### Backgrounds
| Usage | Tailwind Class |
|---|---|
| Page/app background | `bg-gray-100` |
| Cards, panels, sidebar active item | `bg-white` |
| Sidebar container | `bg-gray-200` |
| Form inputs | `bg-gray-100` |
| Icon containers, avatar backgrounds | `bg-gray-200` |

### Text
| Usage | Tailwind Class |
|---|---|
| Headings, active nav labels | `text-gray-900` |
| Body copy, inactive nav labels | `text-gray-500` |
| Placeholder text, helper text | `text-gray-400` |

### Accents & Status
| Usage | Tailwind Class |
|---|---|
| Primary CTA buttons, active edit icon | `bg-gray-900` / `text-white` |
| Success badges, positive trends | `text-green-500` |
| Green badge background | `bg-green-500 text-white` |
| Warning/draft count badges | `bg-orange-500 text-white` |
| Positive trend pill | `bg-green-100 text-green-700` |

---

## 2. Typography

**Font Family:** Inter (or system-ui fallback)

| Style | Size | Weight | Usage |
|---|---|---|---|
| Display | 32–40px | 600–700 | Page titles ("Products dashboard") |
| Heading 1 | 28px | 600 | Section headers, modal titles |
| Heading 2 | 20px | 600 | Card titles, widget headers |
| Heading 3 | 16px | 600 | Sub-section labels |
| Body | 14px | 400 | General content, descriptions |
| Label | 13px | 500 | Form labels, nav items |
| Caption | 12px | 400 | Helper text, version strings, timestamps |
| Stat / KPI | 36–48px | 700 | Large metric values ("$128k") |

---

## 3. Spacing & Layout

### Grid System
- **Sidebar width:** 240px (collapsed: 64px icon-only)
- **Content area:** fluid, min 640px
- **Card grid:** 3-column (auto-fit, min 280px per card)
- **Gutter:** 16px between cards, 24px page padding

### Spacing Scale (Tailwind-aligned)
`4 → 8 → 12 → 16 → 20 → 24 → 32 → 48 → 64px`

---

## 4. Border Radius
| Component | Radius |
|---|---|
| Cards, modals, panels | `12px` |
| Buttons (large) | `10px` |
| Buttons (pill/badge) | `999px` (full) |
| Inputs | `8px` |
| Avatar | `50%` (circle) |
| Icon containers | `50%` (circle) or `10px` |
| Sidebar active item | `12px` |

---

## 5. Shadows

Use Tailwind shadow utilities directly:

| Level | Tailwind Class | Usage |
|---|---|---|
| Low | `shadow-sm` | Cards, list items, sidebar active item |
| Medium | `shadow-md` | Modals, dropdowns |
| High | `shadow-lg` | Floating action panels |

---

## 6. Separation Principle — No Borders

**Never use borders or dividers to visually separate sections, cards, or list rows.**

Use background color contrast and soft shadows instead:

| What to separate | How to do it |
|---|---|
| Page background vs card | Card `bg-white` on `bg-gray-100` page background |
| Card vs inner section | Inner section `bg-gray-50` inside a `bg-white` card |
| List rows | Alternating `bg-white` / `bg-gray-50`, or just spacing |
| Sidebar vs content | Sidebar `bg-white`, content area `bg-gray-100` |
| Stacked panels | Each panel `bg-white shadow-sm rounded-xl`, no border |
| Modal sections | Background blocks `bg-gray-50 rounded-lg` instead of `<hr>` |

**Rules:**
- Do not use `border`, `border-t`, `divide-y`, or `<hr>` to separate sections
- Do not use `border-b` on header rows inside cards or lists
- Use `shadow-sm` on white surfaces sitting on a gray background to add depth without borders
- Use `rounded-xl` on all cards and panels — the shape itself acts as a visual separator

---

## 7. Component Patterns

### Sidebar Navigation
- **Structure:** Logo → top-level nav items → expandable sub-sections
- **Active state:** white card with `shadow-sm` and `rounded-xl`, bold label
- **Inactive state:** gray label, no background
- **Expandable sections:** show chevron (up when open, down when closed)
- **Sub-items:** indented ~16px, same active/inactive styling as top-level
- **Badges:** pill-shaped, colored by status
  - Draft/Warning: orange background, white text
  - Scheduled/Active: green background, white text

```
[Icon] Label            ↑ (expanded)
  └── Sub Item
  └── Sub Item     [2] ← badge
  └── Sub Item
```

### Badges / Count Pills
- `px-2 py-0.5 rounded-full text-xs font-semibold`
- Orange: `bg-orange-500 text-white`
- Green: `bg-green-500 text-white`

### Cards
- White background, `rounded-xl shadow-sm` on a `bg-gray-100` page background
- Internal padding: `20px`
- Header row: title (bold) + optional `...` menu button
- Sub-label: muted gray below title
- Content area: flexible, freeform text
- Footer: action buttons aligned bottom-right (e.g., edit FAB)
- Inner sections within a card use `bg-gray-50 rounded-lg` — never a border or divider

### Edit FAB (Floating Action Button)
- Black circle (`bg-gray-900 rounded-full w-9 h-9`)
- Pen/edit icon in white
- Positioned bottom-right of card

### Modals / Dialogs
- White card, centered on `bg-gray-900/30` backdrop
- Max width: `480px`, padding: `32px`
- Icon at top (in gray circle, centered)
- Title: `text-xl font-semibold text-center`
- Subtitle: `text-sm text-gray-500 text-center`
- Dashed separator line
- Form fields below
- Full-width CTA button (black, `rounded-xl`)
- Secondary link below CTA

### Primary Button (CTA)
- `bg-gray-900 text-white rounded-xl py-3 px-6 font-medium text-sm w-full`
- Hover: `hover:bg-gray-800`

### Input Fields
- Border: `border border-gray-200`
- Rounded: `8px`
- Padding: `12px 16px`
- Left icon (optional): envelope, globe, etc. in `text-gray-400`
- Focus ring: `ring-2 ring-gray-900/10`
- Placeholder: muted gray

### User Profile Dropdown
- Card with `shadow-md rounded-2xl`
- Avatar + name + email at top on `bg-gray-50 rounded-lg` block
- Groups separated by spacing (`py-1` gap) and background blocks — no divider lines
- Icon + label rows for menu items

### Invite Panel
- Header icon (avatar-add style), title, subtitle
- Email input + permission dropdown ("can view") in a row
- Black "Invite" button
- "Members with access" list: avatar + name + email rows

### Tab Navigation (Top-level)
- Large text tabs: active = bold + black underline, inactive = muted gray
- Secondary tabs: smaller, active = underlined, inactive = plain

### KPI / Stat Widget
- Icon in `bg-muted rounded-full` container
- Label + question-mark tooltip icon
- Large metric value (bold, 36-48px)
- Trend badge: `↑ 36.8%` in green pill + "vs last year" label
- Subtle sparkline/trend chart overlaid top-right

---

## 8. Navigation Structure (Reference)

Based on the platform modules:

```
Dashboard
Product
  ├── Dashboard
  ├── Drafts
  ├── Released
  ├── Comments
  └── Scheduled
Purchases
Wallet
```

Additional modules for this project (gas station platform):
```
Inventory
  ├── Price Book
  ├── Products
  └── Vendors
Fuel
  ├── Tank Gauges (ATG)
  └── Compliance
POS
  ├── Transactions
  └── Hardware Sync
Administration
  ├── Users & Roles
  └── Stations
Financials
  ├── Reports
  └── Reconciliation
```

---

## 9. Icon System
- **Library:** Lucide React (already in use per codebase)
- **Size defaults:** `16px` inline, `20px` nav, `24px` standalone/FAB icons
- **Color:** inherit from text or explicit gray/white

---

## 10. Motion & Transitions
- **Duration:** 150ms for micro-interactions (hover, badge), 200ms for panel expand/collapse
- **Easing:** `ease-out`
- **Sidebar expand:** height animation with opacity fade for sub-items

---

## 11. Auth Pages (Login / Register / Reset Password)
- Centered card on white or very light background — no sidebar
- Logo at top center
- Title + subtitle
- Form fields stacked vertically
- Single primary CTA button (full-width, black)
- Secondary links below (forgot password, register, alternate method)
- Max width: `350px` (matches current implementation)

---

## Source Images
Design inspiration was derived from four reference screenshots captured during design review:
1. **Product sidebar dashboard** — sidebar nav with expandable sections and count badges
2. **Project canvas (Fit/Build/Launch)** — card grid layout with editable content areas and tabs
3. **User profile dropdown + invite modal** — profile menu patterns and member management UI
4. **Reset password modal** — auth modal pattern with centered icon, form, and CTA
