# Bookshelf

Live at **[bullrich.dev/bookshelf](https://bullrich.dev/bookshelf/)** — a dark neobrutalist bookshelf displaying books I've read, newest first.

A vertical pile of book spines where the centered book snaps into focus and scales up. Click any active book to open an animated review overlay.

```
┌──────────────────────────────────────────┐
│  BOOKSHELF                               │
│  Books I've read — in order              │
│                                          │
│  ┌────────────────────────────────────┐  │  ← active book (enlarged + yellow shadow)
│  │  THIS INEVITABLE RUIN  Matt Dinni. │  │
│  ├────────────────────────────────────┤  │  ← near book (slightly enlarged)
│  │  The Eye of the Bedlam Bride       │  │
│  ├────────────────────────────────────┤  │  ← dimmed books
│  │  The Dungeon Anarchist's Cookbook  │  │
│  ├────────────────────────────────────┤  │
│  │  Dungeon Crawler Carl              │  │
│  └────────────────────────────────────┘  │
│                                          │
│  THIS INEVITABLE RUIN                    │
│  Matt Dinniman · Dec 2025                │
└──────────────────────────────────────────┘
```

## Tech stack

- **Eleventy 3.x** — static site generator
- **Nunjucks** — templating
- **Vanilla CSS** — no framework, dark neobrutalism design
- **Vanilla JS** — no bundler, IIFEs in `src/js/shelf.js`

## Running locally

```bash
npm install
npm start        # dev server at http://localhost:8080
npm run build    # production build to _site/
```

## Adding a book

1. Create `src/books/<slug>.md` where `<slug>` is a URL-safe title (e.g. `name-of-the-wind.md`).
2. Fill in the frontmatter:

```yaml
---
title: Book Title
author: Author Name
dateRead: 2024-03          # YYYY-MM — determines position (newest = top)
rating: 4                  # Integer 1–5 (optional)
color: "#4361EE"           # Flat spine color — see guidance below
width: 22                  # Spine thickness in px (14–33)
height: 112                # Physical book height in px (84–140)
---
Your review goes here. Leave empty if you have no review.
```

3. The `width` value controls how tall the spine slab appears in the pile — thicker books look thicker.

## Frontmatter field reference

| Field      | Type   | Required | Description |
|------------|--------|----------|-------------|
| `title`    | string | yes      | Book title |
| `author`   | string | yes      | Author full name |
| `dateRead` | date   | yes      | `YYYY-MM` — drives sort order (newest first) |
| `rating`   | number | no       | Star rating 1–5 |
| `color`    | string | yes      | Hex color for the spine slab |
| `width`    | number | yes      | Spine thickness in px — also sets slab height |
| `height`   | number | yes      | Physical book height in px (used for aspect ratio reference) |

## Choosing colour, width, and height

**Colour:** Fully saturated flat colour — no pastels, no near-white, no near-black. The colour is dimmed when the book is inactive. Good examples: `#C1121F`, `#4361EE`, `#2DC653`, `#F77F00`, `#7B2FBE`.

**Width (book thickness → slab height in pile):**
- Thin (~100–200 pages): 14–18
- Average (~300–400 pages): 19–24
- Thick (~500+ pages): 25–33

**Height (physical book size — kept for reference):**
- Pocket/small paperback: 84–95
- Standard paperback: 96–115
- Tall hardcover: 116–140
