# Bookshelf Site — Design Spec

**Date:** 2026-05-09
**URL:** bookshelf.bullrich.dev
**Stack:** Eleventy.js, vanilla HTML/CSS/JS, deployed as static site

---

## Overview

A personal bookshelf site displaying books Javier has read, ordered chronologically. The site is a single page with a dark neobrutalist aesthetic — book spines on a wooden shelf, center-zoom horizontal scroll, and a book-open animation that reveals the review. Designed mobile-first; most visitors will be on phones.

---

## Architecture

Single Eleventy-generated `index.html` from a `books/` collection. All book content (metadata + reviews) is compiled into the page at build time — no client-side fetching. Reviews are in the DOM from the start, hidden until opened.

**Routes:**
- `/` — the bookshelf
- `/#slug` — opens that book's review overlay directly (hash-based deep link, no server config needed)

**No additional pages.** No blog, no about, no index — just the shelf.

---

## Content Model

Each book is a markdown file at `src/books/<slug>.md`. The slug is derived from the filename.

```yaml
---
title: Dune
author: Frank Herbert
dateRead: 2022-01-15      # ISO date — drives chronological order
rating: 5                 # Integer 1–5
color: "#C1121F"          # Flat spine color, chosen per book
width: 22                 # Spine width in px (reflects book thickness)
height: 112               # Spine height in px (reflects book height)
---
Review body in plain markdown...
```

Eleventy sorts the collection by `dateRead` ascending: oldest book is leftmost on the shelf, newest is rightmost. The `width` and `height` fields give each spine a slightly different physical size, making the shelf look like a real mixed collection rather than uniform tiles.

---

## Visual Design System

### Color Palette

| Token       | Value     | Usage                                      |
|-------------|-----------|---------------------------------------------|
| Background  | `#0D0D0D` | Page background                             |
| Border      | `#FFFFFF` | All borders — white for visibility on dark  |
| Accent      | `#FFD60A` | Hard shadows, header fill, title tags       |
| Cream       | `#F5EDD6` | Review page background                      |
| Ink         | `#000000` | Text on yellow/accent elements              |

Spine colors are chosen individually per book — fully saturated flat colors, no gradients.

### Typography

| Role             | Font                          | Size  | Style                      |
|------------------|-------------------------------|-------|----------------------------|
| Site header      | Arial Black / system bold     | 36px  | Uppercase, 10px tracking   |
| Title tags       | Arial Black / system bold     | 16px  | Uppercase                  |
| Spine labels     | Courier New                   | 9px   | Uppercase, 1.2px tracking  |
| Review body      | Georgia                       | 14px  | Serif, line-height = ruled |
| Meta (author/date)| Courier New                  | 10px  | Uppercase, wide tracking   |

### Neobrutalism Rules

- **Borders:** `3px solid #FFFFFF` everywhere — white on dark background (not black, which is invisible on dark)
- **Hard shadows:** `5px 5px 0 #FFD60A` — zero blur, zero spread, accent color (not black)
- **No border-radius** anywhere on interactive or structural elements
- **No gradients** on any element
- **No transparency, blur, or glassmorphism**
- **Flat colors only** for book spines and all UI components

### Shelf Visual

- Background: `#0D0D0D` with subtle radial warmth hinting at candlelight
- Wooden plank: layered face + underside with white border and yellow hard shadow
- Inactive spines: `filter: brightness(0.45) saturate(0.6)` — dimmed but structurally visible via white borders
- Adjacent spines: `filter: brightness(0.7) saturate(0.85)`, slight scale
- Active spine: full brightness, yellow side accent stripe

---

## Interactions

### Shelf Browsing

| Input              | Behaviour                                              |
|--------------------|--------------------------------------------------------|
| Mouse wheel        | Vertical scroll redirected to horizontal via JS        |
| Touch swipe        | Native horizontal scroll                               |
| Arrow buttons      | `scrollIntoView({ inline: 'center', behavior: 'smooth' })` |
| Keyboard ← →       | Nudge one book at a time                               |

Scroll snapping: `scroll-snap-type: x proximity` — engages only when near a snap point, so mid-scroll feels fluid, not yanked.

### Center Zoom

- **Active book:** `scale(1.35) translateY(-14px)`, full brightness, yellow side stripe
- **Adjacent books:** `scale(1.1) translateY(-4px)`, 70% brightness
- **Rest:** 45% brightness, no scale
- **Transition:** `0.3s cubic-bezier(0.34, 1.5, 0.64, 1)` (slight overshoot spring)
- **Detection:** `getBoundingClientRect()` on scroll tick via `requestAnimationFrame`

### First-Visit Mobile Scroll Hint

On mobile only, a pulsing arrow animation overlays the right edge of the shelf on first page load, indicating the shelf is horizontally scrollable. Dismissed on the user's first scroll event (`{ once: true }`). Not shown on desktop — the side arrows serve that purpose there.

### Opening a Book

1. Click a **non-active** book → scrolls it to center (does not open yet)
2. Click the **active** (centered) book → opens the review overlay
3. URL hash updates to `#slug` (e.g. `/#dune`) silently via JS
4. Overlay: full-screen dark backdrop, open-book scales up from center
   - **Left page:** flat spine color, title, author, read-date badge
   - **Right page:** cream background with CSS ruled lines + red margin line, star rating, review body in Georgia
5. Close: click outside the book, press Esc, or click ✕ button → overlay closes, hash clears

### Deep Linking

- Page loads with `#dune` in URL → JS finds that book, snaps it to center, opens overlay automatically
- Browser back/forward → `hashchange` event opens/closes the overlay accordingly

---

## File Structure

```
bookshelf/
├── src/
│   ├── books/              # One .md file per book
│   │   ├── dune.md
│   │   ├── sapiens.md
│   │   └── ...
│   ├── _includes/
│   │   └── base.njk        # Base layout
│   ├── index.njk           # Main shelf page (loops over books collection)
│   └── css/
│       └── style.css
├── .eleventy.js            # Eleventy config (sorts books by dateRead)
├── AGENTS.md               # Instructions for AI agents working on this repo
├── README.md               # Human-facing guide for adding books
└── package.json
```

---

## Required Documentation Files

### README.md

Must cover:
- What this project is and the URL it deploys to
- How to run it locally (`npm start` or equivalent)
- **How to add a book** — step-by-step: create `src/books/<slug>.md`, copy the frontmatter template, fill in each field, write the review body
- Full frontmatter field reference with type, required/optional status, and description for each field (`title`, `author`, `dateRead`, `rating`, `color`, `width`, `height`)
- Guidance on choosing `color` (flat/saturated, no gradients), `width` (thin ~15px, average ~22px, thick ~30px+), and `height` (shorter ~85px, average ~110px, tall ~135px)

### AGENTS.md

Must cover:
- Project purpose and tech stack (Eleventy, vanilla JS/CSS)
- Where books live (`src/books/`) and the full frontmatter schema
- The single-page architecture and hash-based navigation pattern
- The neobrutalism design rules (white borders, yellow hard shadows, flat colors, no gradients, no border-radius)
- The CSS/JS patterns used for the shelf (scroll-snap proximity, getBoundingClientRect center detection, wheel redirect)
- How Eleventy sorts and exposes the books collection
- What is intentionally out of scope (no new pages, no filtering, no accounts)

---

## Out of Scope

- Search or filtering
- Genre tags or categories
- User accounts or comments
- Dark/light mode toggle (dark only)
- Any page other than the shelf
