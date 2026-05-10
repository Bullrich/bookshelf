# AGENTS.md — Bookshelf Site

## Project purpose

Personal reading log at bookshelf.bullrich.dev. Displays books Javier has read as a horizontal neobrutalist bookshelf. Single Eleventy-generated page, deployed as a static site.

## Tech stack

- **Eleventy 3.x** — static site generator, Nunjucks templates
- **Vanilla CSS** — no framework, design tokens via custom properties
- **Vanilla JS** — no bundler, no framework, IIFE modules in `src/js/shelf.js`
- **Markdown** — one `.md` file per book in `src/books/`

## Book content model

Each book is `src/books/<slug>.md` with this frontmatter:

```yaml
title: string           # Display title
author: string          # Author full name
dateRead: YYYY-MM-DD    # ISO date — drives sort order (ascending)
rating: 1-5             # Integer star rating
color: "#RRGGBB"        # Flat hex spine color, fully saturated
width: number           # Spine width px (14–33)
height: number          # Spine height px (84–140)
```

The markdown body is the review text. Eleventy renders it to HTML and embeds it in hidden `<div id="review-<slug>">` elements. The JS reads these at runtime when a book is opened.

## Eleventy config (`.eleventy.js`)

- `books` collection: `src/books/*.md`, sorted by `dateRead` ascending
- `monthYear` filter: formats ISO date as "Jan 2022"
- Passthrough: `src/css/` and `src/js/` copied unchanged to `_site/`

## Architecture: single page + hash navigation

`src/index.njk` loops over `collections.books` to generate book spines and embeds all review content at build time. No client-side data fetching.

Hash-based deep links: `/#dune` opens the Dune review overlay. JS handles:
1. `window.location.hash` on page load — snaps to book and opens overlay
2. `hashchange` event — opens/closes on browser back/forward
3. `history.pushState` — updates URL hash when overlay opens/closes

## CSS design rules (DO NOT BREAK THESE)

This site uses dark-background neobrutalism. These rules are intentional:

- **Borders:** `3px solid #FFFFFF` — white, not black (black is invisible on dark bg)
- **Hard shadows:** `5px 5px 0 #FFD60A` — accent color, zero blur, never black
- **No border-radius** on interactive/structural elements
- **No gradients** on any element (book spine colors are flat)
- **No transparency, blur, or glassmorphism**
- Inactive spines: `filter: brightness(0.45) saturate(0.6)`
- Active spine: `filter: brightness(1) saturate(1.15)`, `scale(1.35) translateY(-14px)`

## JS patterns

- **Center detection:** `getBoundingClientRect()` on scroll tick via `requestAnimationFrame`
- **Wheel redirect:** `window.addEventListener('wheel', ...)` with `passive: false`, redirects `deltaY` to `track.scrollLeft`
- **Scroll snap:** `scroll-snap-type: x proximity` — smooth, not hard-yanked
- **Overlay open/close:** CSS class `.open` on `.overlay`, transition on `opacity` and `transform`

## What is intentionally out of scope

- No search or filtering
- No genre tags
- No user accounts or comments
- No dark/light mode toggle (dark only)
- No pages other than the single shelf page
- No JavaScript framework or bundler
