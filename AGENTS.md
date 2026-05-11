# AGENTS.md — Bookshelf Site

## Project purpose

Personal reading log at bookshelf.bullrich.dev. Displays books Javier has read as a vertical pile of book spines (dark neobrutalist style). Single Eleventy-generated page, deployed as a static site.

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
dateRead: YYYY-MM       # Month/year — drives sort order (newest first = top of pile)
rating: 1-5             # Integer star rating (optional)
color: "#RRGGBB"        # Flat hex spine color, fully saturated
width: number           # Spine thickness (14–33) — also controls slab height in pile
height: number          # Physical book height (84–140) — kept for reference
```

The markdown body is the review text. Eleventy renders it to HTML and embeds it in hidden `<div id="review-<slug>">` elements. The JS reads these at runtime when a book is opened.

## Eleventy config (`.eleventy.js`)

- `books` collection: `src/books/*.md`, sorted by `dateRead` **descending** (newest first)
- `monthYear` filter: formats ISO date as "Jan 2022"
- Passthrough: `src/css/` and `src/js/` copied unchanged to `_site/`

## Layout: vertical pile of spines

The shelf renders as a vertical stack of horizontal spine slabs — like looking at a pile of books from the side. The centered/active book is visually enlarged.

```
┌─────────────────────────────┐  ← tall active slab (scale 1.22, yellow shadow)
│ BOOK TITLE          AUTHOR  │
├─────────────────────────────┤  ← dimmed near slab (scale 1.06)
│ Another Book                │
├─────────────────────────────┤  ← dimmed inactive slabs
│ Yet Another Book            │
└─────────────────────────────┘
```

Each `.book` element has a `.spine-slab` inside. The slab height is computed via CSS: `calc(var(--thick) * 1.9px)` where `--thick` equals the book's `width` frontmatter value. Thicker books appear taller in the pile.

### Slab anatomy

```html
<div class="book" style="--thick: 22">
  <div class="spine-slab" style="background:#4361EE">
    <div class="slab-edge"></div>       <!-- thin left shadow strip -->
    <div class="slab-text">
      <span class="slab-title">Book Title</span>
      <span class="slab-author">Author Name</span>
    </div>
  </div>
</div>
```

## Architecture: single page + hash navigation

`src/index.njk` loops over `collections.books` to generate book slabs and embeds all review content at build time. No client-side data fetching.

Hash-based deep links: `/#dune` opens the Dune review overlay. JS handles:
1. `window.location.hash` on page load — snaps to book and opens overlay
2. `hashchange` event — opens/closes on browser back/forward
3. `history.pushState` — updates URL hash when overlay opens/closes

## CSS design rules (DO NOT BREAK THESE)

This site uses dark-background neobrutalism. These rules are intentional:

- **Borders:** `3px solid #FFFFFF` — white, not black (black is invisible on dark bg)
- **Hard shadows:** `5px 5px 0 #FFD60A` — accent color, zero blur, never black
- **No border-radius** on interactive/structural elements
- **No gradients on spine/slab colors** — spine and slab backgrounds must be flat hex colors
- **No transparency, blur, or glassmorphism**
- Inactive spines: `filter: brightness(0.42) saturate(0.55)`
- Near spines: `filter: brightness(0.78) saturate(0.88)`, `scale(1.06)`
- Active spine: `filter: brightness(1) saturate(1.15)`, `scale(1.22)`

## Open-book overlay

Always vertical (column) for all screen sizes — no media query override:
- Top half: cover page (book color background, title, author, date badge)
- Gutter: spine-like separator
- Bottom half: review page (lined paper styling, stars, review body)

Animation on open:
- `.open-book`: `bookOpen` — fade + slide up
- `.book-cover-page`: `coverFall` — perspective rotateX flip
- `.book-review-page`: `reviewUnfurl` — clip-path unfurl from top

Animation is reset on every open via forced reflow: `void openBookEl.offsetWidth`.

## JS patterns

- **Center detection:** `getBoundingClientRect()` on scroll tick via `requestAnimationFrame` — finds book whose vertical center is closest to track's vertical center
- **Wheel redirect:** `window.addEventListener('wheel', ...)` with `passive: false`, redirects `deltaY` to `track.scrollTop`; skipped when overlay is open
- **Scroll snap:** `scroll-snap-type: y proximity` on `.shelf-track`
- **Force first active:** At scrollTop=0, first book is set active programmatically (CSS centering padding would create empty gap otherwise)
- **Overlay open/close:** CSS class `.open` on `.overlay`, transitions on `opacity` and `transform`

## What is intentionally out of scope

- No search or filtering
- No genre tags
- No user accounts or comments
- No dark/light mode toggle (dark only)
- No pages other than the single shelf page
- No JavaScript framework or bundler
- No navigation arrows (vertical scroll is natural)
