# Bookshelf

Live at **[bullrich.dev/bookshelf](https://bullrich.dev/bookshelf/)** — a dark neobrutalist bookshelf displaying books I've read, in chronological order.

## Running locally

```bash
npm install
npm start        # dev server at http://localhost:8080
npm run build    # production build to _site/
```

## Adding a book

1. Create a new file at `src/books/<slug>.md` where `<slug>` is a URL-safe version of the title (e.g. `name-of-the-wind.md`).
2. Copy this frontmatter template and fill in every field:

```yaml
---
title: Book Title
author: Author Name
dateRead: 2024-03-15      # ISO date — determines position on the shelf (left = oldest)
rating: 4                 # Integer 1–5 (optional)
color: "#4361EE"          # Flat spine color — see colour guidance below
width: 22                 # Spine width in px
height: 112               # Spine height in px
---
Your review goes here. Leave the body empty if you have no review to write.
```

3. Optionally write your review as the markdown body (after the `---`).

## Frontmatter field reference

| Field      | Type   | Required | Description |
|------------|--------|----------|-------------|
| `title`    | string | yes      | Book title as it appears on the spine and overlay |
| `author`   | string | yes      | Author full name |
| `dateRead` | date   | yes      | ISO 8601 date you finished the book (`YYYY-MM-DD`) |
| `rating`   | number | **no**   | Star rating 1–5 — omit if you have no rating |
| `color`    | string | yes      | Hex color for the spine background |
| `width`    | number | yes      | Spine width in px — reflects book thickness |
| `height`   | number | yes      | Spine height in px — reflects book physical height |

## Choosing colour, width, and height

**Colour:** Pick a fully saturated flat colour — no pastels, no near-white, no near-black. The colour will appear dimmed when the book is not in focus. Good examples: `#C1121F`, `#4361EE`, `#2DC653`, `#F77F00`, `#7B2FBE`.

**Width (book thickness):**
- Thin (~100–200 pages): 14–18px
- Average (~300–400 pages): 19–24px
- Thick (~500+ pages): 25–33px

**Height (book physical size):**
- Pocket/small paperback: 84–95px
- Standard paperback: 96–115px
- Tall hardcover: 116–140px
