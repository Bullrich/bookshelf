# Bookshelf Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page dark neobrutalist personal bookshelf site at bookshelf.bullrich.dev using Eleventy.js, where books are written as markdown files and displayed as scrollable horizontal book spines that open into a full review.

**Architecture:** Eleventy generates a single `index.html` from a `books/` markdown collection sorted by `dateRead`. All review content is compiled into the page at build time as hidden DOM elements; a vanilla JS shelf reads those elements and drives the center-zoom scroll, open-book overlay, and hash-based deep linking.

**Tech Stack:** Eleventy 3.x, Nunjucks templates, vanilla CSS (no framework), vanilla JS (no bundler), deployed as a static site.

---

## File Map

| File | Responsibility |
|------|---------------|
| `.eleventy.js` | Eleventy config: books collection, dateRead sort, date filter, passthrough |
| `src/_includes/base.njk` | HTML shell: `<head>`, meta viewport, CSS/JS links, body wrapper |
| `src/index.njk` | Main shelf page: header, shelf track loop, overlay markup, hidden reviews |
| `src/css/style.css` | All styles: design tokens, shelf, spines, overlay, mobile hint, animations |
| `src/js/shelf.js` | All JS: center detection, scroll redirect, arrows, open/close, hash nav |
| `src/books/*.md` | One file per book: frontmatter + review body |
| `README.md` | How to run locally and how to add a book |
| `AGENTS.md` | Agent-readable project context and design rules |

---

## Task 1: Project Setup

**Files:**
- Modify: `package.json`
- Create: `.eleventy.js`
- Create: `src/books/.gitkeep`
- Create: `src/_includes/.gitkeep`
- Create: `src/css/.gitkeep`
- Create: `src/js/.gitkeep`

- [ ] **Install Eleventy**

```bash
npm install --save-dev @11ty/eleventy
```

- [ ] **Add npm scripts to `package.json`**

Replace the `scripts` block:

```json
"scripts": {
  "start": "eleventy --serve",
  "build": "eleventy"
}
```

- [ ] **Create `.eleventy.js`**

```js
module.exports = function (eleventyConfig) {
  // Sort books oldest-first (ascending dateRead)
  eleventyConfig.addCollection("books", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/books/*.md")
      .sort((a, b) => new Date(a.data.dateRead) - new Date(b.data.dateRead));
  });

  // Format dateRead as "Jan 2022"
  eleventyConfig.addFilter("monthYear", function (dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  });

  // Pass JS and CSS through unchanged
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");

  return {
    dir: {
      input: "src",
      output: "_site",
    },
  };
};
```

- [ ] **Create directory structure**

```bash
mkdir -p src/books src/_includes src/css src/js
```

- [ ] **Verify Eleventy is wired up**

```bash
npm run build
```

Expected: `_site/` directory created, no errors. (It will be empty since there's no content yet — that's fine.)

- [ ] **Commit**

```bash
git add .
git commit -m "feat: add Eleventy, project structure, and build scripts"
```

---

## Task 2: Base Layout

**Files:**
- Create: `src/_includes/base.njk`

- [ ] **Create `src/_includes/base.njk`**

```njk
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Books Javier Bullrich has read — a personal bookshelf.">
  <title>Bookshelf — Javier Bullrich</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  {{ content | safe }}
  <script src="/js/shelf.js"></script>
</body>
</html>
```

- [ ] **Commit**

```bash
git add src/_includes/base.njk
git commit -m "feat: add base Nunjucks layout"
```

---

## Task 3: Sample Book Data

**Files:**
- Create: `src/books/dune.md`
- Create: `src/books/sapiens.md`
- Create: `src/books/name-of-the-wind.md`

These are real sample books used to verify the collection works. You will add your own books later by copying this pattern.

- [ ] **Create `src/books/dune.md`**

```markdown
---
title: Dune
author: Frank Herbert
dateRead: 2022-01-15
rating: 5
color: "#C1121F"
width: 22
height: 112
---
Epic in every sense. The world-building is unlike anything else in science fiction — politics, religion, ecology, and prophecy woven into a single unforgettable narrative. Paul's transformation feels earned, and the ending refuses to give you the comfort you expect.
```

- [ ] **Create `src/books/sapiens.md`**

```markdown
---
title: Sapiens
author: Yuval Noah Harari
dateRead: 2022-03-10
rating: 4
color: "#4361EE"
width: 18
height: 90
---
A sweeping view of human history that constantly challenges your assumptions. Not every argument is airtight, but the questions it raises about money, religion, and empire are hard to shake long after you finish.
```

- [ ] **Create `src/books/name-of-the-wind.md`**

```markdown
---
title: Name of the Wind
author: Patrick Rothfuss
dateRead: 2022-06-22
rating: 5
color: "#2DC653"
width: 26
height: 128
---
The prose alone is worth the price of entry. Kvothe is a flawed, magnetic hero and the framing device — a legend narrating his own legend — is one of the cleverest structural moves in modern fantasy.
```

- [ ] **Verify the collection builds correctly**

```bash
npm run build
```

Expected: `_site/` updated, no errors, no warnings about missing frontmatter fields.

- [ ] **Commit**

```bash
git add src/books/
git commit -m "feat: add three sample books to seed the collection"
```

---

## Task 4: CSS Design Tokens and Base Styles

**Files:**
- Create: `src/css/style.css`

- [ ] **Create `src/css/style.css` with design tokens and reset**

```css
/* ═══════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════ */
:root {
  --bg:        #0D0D0D;
  --accent:    #FFD60A;
  --border:    #FFFFFF;
  --cream:     #F5EDD6;
  --ink:       #000000;

  /* Neobrutalism shadow — accent color, zero blur */
  --shadow-sm: 3px 3px 0 var(--accent);
  --shadow-md: 5px 5px 0 var(--accent);
  --shadow-lg: 7px 7px 0 var(--accent);

  /* Neobrutalism border — white on dark */
  --border-rule: 3px solid var(--border);
}

/* ═══════════════════════════════════════
   RESET + BASE
═══════════════════════════════════════ */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: var(--bg);
  color: var(--border);
  font-family: 'Courier New', Courier, monospace;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  user-select: none;
}
```

- [ ] **Build and check the CSS is copied through**

```bash
npm run build
```

Expected: `_site/css/style.css` exists with the token content.

- [ ] **Commit**

```bash
git add src/css/style.css
git commit -m "feat: add CSS design tokens and base reset"
```

---

## Task 5: Shelf Page HTML — Header, Shelf Track, Info Bar

**Files:**
- Create: `src/index.njk`

- [ ] **Create `src/index.njk`**

```njk
---
layout: base.njk
---

<!-- ── HEADER ── -->
<div class="header">
  <div class="header-box">
    <h1>Bookshelf</h1>
  </div>
  <p class="header-sub">Books I've read — in order</p>
</div>

<!-- ── SHELF ── -->
<div class="shelf-outer">
  <button class="arrow arrow-left" id="arrowLeft" aria-label="Previous book">&#8249;</button>
  <button class="arrow arrow-right" id="arrowRight" aria-label="Next book">&#8250;</button>

  <div class="shelf-track" id="track">
    {% for book in collections.books %}
    <div class="book"
         data-index="{{ loop.index0 }}"
         data-slug="{{ book.fileSlug }}"
         data-title="{{ book.data.title }}"
         data-author="{{ book.data.author }}"
         data-date="{{ book.data.dateRead | monthYear }}"
         data-rating="{{ book.data.rating }}"
         data-color="{{ book.data.color }}">
      <div class="spine"
           style="width:{{ book.data.width }}px;height:{{ book.data.height }}px;background:{{ book.data.color }}">
        <span class="spine-title">{{ book.data.title }}</span>
      </div>
    </div>
    {% endfor %}
  </div>

  <div class="plank-wrap">
    <div class="plank-face"></div>
    <div class="plank-under"></div>
  </div>
</div>

<!-- ── INFO BAR ── -->
<div class="info-bar">
  <div class="book-tag" id="bookTag" aria-live="polite"></div>
  <div class="book-meta" id="bookMeta" aria-live="polite"></div>
</div>

<p class="scroll-hint">scroll · swipe · click to open</p>

<!-- ── MOBILE SCROLL HINT ── -->
<div class="mobile-hint" id="mobileHint" aria-hidden="true">
  <span class="mobile-hint-arrow">&#8250;</span>
</div>

<!-- ── OPEN BOOK OVERLAY ── -->
<div class="overlay" id="overlay" role="dialog" aria-modal="true" aria-label="Book review">
  <div class="open-book" id="openBook">

    <div class="book-cover-page" id="coverPage">
      <h2 class="cover-title" id="coverTitle"></h2>
      <p class="cover-author" id="coverAuthor"></p>
      <div class="cover-badge" id="coverDate"></div>
    </div>

    <div class="book-gutter"></div>

    <div class="book-review-page">
      <button class="close-btn" id="closeBtn" aria-label="Close review">&#x2715;</button>
      <div class="review-title" id="reviewTitle"></div>
      <div class="review-stars" id="reviewStars"></div>
      <div class="review-date" id="reviewDate"></div>
      <div class="review-body" id="reviewBody"></div>
    </div>

  </div>
</div>

<!-- ── HIDDEN REVIEW CONTENT (compiled at build time) ── -->
<div class="book-reviews" hidden>
  {% for book in collections.books %}
  <div id="review-{{ book.fileSlug }}">{{ book.templateContent | safe }}</div>
  {% endfor %}
</div>
```

- [ ] **Build and verify the shelf HTML is generated**

```bash
npm run build && grep -c 'class="book"' _site/index.html
```

Expected: outputs `3` (one per sample book).

- [ ] **Verify review content is embedded**

```bash
grep -c 'class="book-reviews"' _site/index.html
```

Expected: `1`

- [ ] **Commit**

```bash
git add src/index.njk
git commit -m "feat: add shelf page HTML with Nunjucks book loop and overlay structure"
```

---

## Task 6: Shelf CSS — Header, Shelf, Spines, Plank, Info Bar

**Files:**
- Modify: `src/css/style.css`

Append all of the following to the existing `style.css` (do not replace the tokens from Task 4).

- [ ] **Append header styles**

```css
/* ═══════════════════════════════════════
   HEADER
═══════════════════════════════════════ */
.header {
  margin-bottom: 48px;
  text-align: center;
}

.header-box {
  display: inline-block;
  background: var(--accent);
  border: var(--border-rule);
  box-shadow: var(--shadow-lg);
  padding: 10px 28px 8px;
}

.header h1 {
  font-family: 'Arial Black', Arial, sans-serif;
  font-size: clamp(24px, 5vw, 38px);
  font-weight: 900;
  letter-spacing: 10px;
  text-transform: uppercase;
  color: var(--ink);
  line-height: 1;
}

.header-sub {
  margin-top: 16px;
  font-size: 10px;
  letter-spacing: 4px;
  color: rgba(255, 255, 255, 0.28);
  text-transform: uppercase;
}
```

- [ ] **Append shelf structure styles**

```css
/* ═══════════════════════════════════════
   SHELF
═══════════════════════════════════════ */
.shelf-outer {
  position: relative;
  width: 100%;
  max-width: 600px;
  padding: 0 44px;
}

.shelf-track {
  display: flex;
  align-items: flex-end;
  gap: 5px;
  overflow-x: scroll;
  overflow-y: hidden;
  /* proximity: only snaps when near a snap point — smooth, not yanked */
  scroll-snap-type: x proximity;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  /* Side padding = half width so first/last book can center */
  padding: 60px calc(50% - 20px) 0;
}

.shelf-track::-webkit-scrollbar {
  display: none;
}

/* ── PLANK ── */
.plank-wrap {
  border: var(--border-rule);
  border-top: none;
  box-shadow: var(--shadow-lg);
}

.plank-face {
  height: 16px;
  background: #7a4e28;
  border-top: 3px solid rgba(255, 255, 255, 0.25);
  border-bottom: 3px solid var(--border);
}

.plank-under {
  height: 6px;
  background: #3d2210;
}
```

- [ ] **Append book spine styles**

```css
/* ═══════════════════════════════════════
   BOOK SPINES
═══════════════════════════════════════ */
.book {
  flex-shrink: 0;
  scroll-snap-align: center;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transform-origin: bottom center;
  filter: brightness(0.45) saturate(0.6);
  transition:
    transform 0.3s cubic-bezier(0.34, 1.5, 0.64, 1),
    filter 0.3s ease;
  position: relative;
}

.book.near {
  filter: brightness(0.7) saturate(0.85);
  transform: scale(1.1) translateY(-4px);
  z-index: 4;
}

.book.active {
  filter: brightness(1) saturate(1.15);
  transform: scale(1.35) translateY(-14px);
  z-index: 10;
}

/* Spine face */
.spine {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 10px;
  border: 3px solid var(--border);
  border-bottom: none;
  position: relative;
  transition: box-shadow 0.3s ease;
}

/* Top cap — same background color as spine, inherits from inline style */
.spine::before {
  content: '';
  position: absolute;
  top: -8px;
  left: -3px;
  right: -3px;
  height: 8px;
  background: inherit;
  border: 3px solid var(--border);
  border-bottom: none;
  filter: brightness(1.25);
}

/* Yellow accent stripe on active book */
.book.active .spine::after {
  content: '';
  position: absolute;
  right: -3px;
  top: 15%;
  width: 5px;
  height: 35%;
  background: var(--accent);
}

.spine-title {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-family: 'Courier New', monospace;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.2px;
  color: #fff;
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-height: 82%;
  text-transform: uppercase;
}
```

- [ ] **Append arrow and info bar styles**

```css
/* ═══════════════════════════════════════
   ARROWS
═══════════════════════════════════════ */
.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-80%);
  z-index: 30;
  width: 44px;
  height: 44px;
  background: var(--cream);
  color: var(--ink);
  border: var(--border-rule);
  box-shadow: 4px 4px 0 var(--border);
  font-size: 22px;
  font-weight: 900;
  font-family: 'Arial Black', Arial, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  line-height: 1;
  transition: background 0.1s, box-shadow 0.08s, transform 0.08s;
}

.arrow:hover {
  background: var(--accent);
}

.arrow:active {
  box-shadow: 1px 1px 0 var(--border);
  transform: translateY(-80%) translate(3px, 3px);
}

.arrow.hidden {
  opacity: 0;
  pointer-events: none;
}

.arrow-left  { left: -4px; }
.arrow-right { right: -4px; }

@keyframes nudge-arrow {
  0%, 100% { box-shadow: 4px 4px 0 var(--border); transform: translateY(-80%) translate(0, 0); }
  50%       { box-shadow: 6px 6px 0 var(--border); transform: translateY(-80%) translate(-2px, -2px); }
}

.arrow-right {
  animation: nudge-arrow 1.8s ease-in-out infinite;
}

.arrow-right:active {
  animation: none;
}

/* ═══════════════════════════════════════
   INFO BAR
═══════════════════════════════════════ */
.info-bar {
  margin-top: 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  min-height: 64px;
}

.book-tag {
  display: inline-block;
  background: var(--accent);
  color: var(--ink);
  border: var(--border-rule);
  box-shadow: var(--shadow-sm);
  padding: 5px 18px 4px;
  font-family: 'Arial Black', Arial, sans-serif;
  font-size: 16px;
  font-weight: 900;
  letter-spacing: 1px;
  text-transform: uppercase;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.2s, transform 0.2s;
  white-space: nowrap;
  min-width: 80px;
  text-align: center;
}

.book-tag.visible {
  opacity: 1;
  transform: translateY(0);
}

.book-meta {
  margin-top: 8px;
  font-size: 10px;
  letter-spacing: 3px;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  opacity: 0;
  transition: opacity 0.2s 0.06s;
  text-align: center;
}

.book-meta.visible {
  opacity: 1;
}

.scroll-hint {
  margin-top: 26px;
  font-size: 9px;
  letter-spacing: 4px;
  color: rgba(255, 255, 255, 0.15);
  text-transform: uppercase;
}
```

- [ ] **Verify CSS passes through to build output**

```bash
npm run build && wc -l _site/css/style.css
```

Expected: line count matches the source file (no truncation).

- [ ] **Commit**

```bash
git add src/css/style.css
git commit -m "feat: add shelf, spine, arrow, and info bar CSS"
```

---

## Task 7: Open Book Overlay CSS + Mobile Hint CSS

**Files:**
- Modify: `src/css/style.css`

Append to the end of `style.css`.

- [ ] **Append overlay styles**

```css
/* ═══════════════════════════════════════
   OPEN BOOK OVERLAY
═══════════════════════════════════════ */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.88);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s;
}

.overlay.open {
  opacity: 1;
  pointer-events: all;
}

.open-book {
  display: flex;
  max-width: 680px;
  width: 92%;
  border: var(--border-rule);
  box-shadow: var(--shadow-lg);
  transform: scale(0.9) translateY(20px);
  transition: transform 0.3s cubic-bezier(0.34, 1.3, 0.64, 1);
}

.overlay.open .open-book {
  transform: scale(1) translateY(0);
}

/* Spine gutter between the two pages */
.book-gutter {
  width: 12px;
  min-width: 12px;
  background: #1a1a1a;
  border-left: 3px solid var(--border);
  border-right: 3px solid var(--border);
  box-shadow: inset 3px 0 10px rgba(0, 0, 0, 0.8), inset -3px 0 10px rgba(0, 0, 0, 0.8);
}

/* Left page: cover */
.book-cover-page {
  flex: 1;
  min-height: 340px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  position: relative;
}

.cover-title {
  font-family: 'Arial Black', Arial, sans-serif;
  font-size: clamp(16px, 3vw, 22px);
  font-weight: 900;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #fff;
  text-align: center;
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.5);
  margin-bottom: 8px;
}

.cover-author {
  font-size: 11px;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.65);
  text-transform: uppercase;
  text-align: center;
}

.cover-badge {
  margin-top: 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.35);
  padding: 4px 12px;
  font-size: 9px;
  letter-spacing: 3px;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
}

/* Right page: review */
.book-review-page {
  flex: 1.1;
  background: var(--cream);
  background-image: repeating-linear-gradient(
    transparent, transparent 27px,
    #d4c5a9 27px, #d4c5a9 28px
  );
  padding: 28px 24px 24px;
  position: relative;
  font-family: Georgia, serif;
  min-height: 340px;
  overflow-y: auto;
  max-height: 80vh;
}

/* Red margin line */
.book-review-page::before {
  content: '';
  position: absolute;
  left: 44px;
  top: 0;
  bottom: 0;
  width: 1px;
  background: rgba(200, 70, 50, 0.4);
  pointer-events: none;
}

.review-title {
  font-size: 13px;
  font-weight: 700;
  color: #1a0f00;
  padding-left: 32px;
  line-height: 28px;
}

.review-stars {
  color: #c4821a;
  font-size: 14px;
  padding-left: 32px;
  line-height: 28px;
}

.review-date {
  font-size: 9px;
  letter-spacing: 2px;
  color: #8a7560;
  text-transform: uppercase;
  padding-left: 32px;
  line-height: 28px;
  margin-bottom: 0;
}

.review-body {
  padding-left: 32px;
  font-size: 12px;
  line-height: 28px;
  color: #3a2f1e;
}

.review-body p {
  margin: 0;
}

/* Close button */
.close-btn {
  position: absolute;
  top: -16px;
  right: -16px;
  width: 36px;
  height: 36px;
  background: var(--accent);
  border: var(--border-rule);
  box-shadow: var(--shadow-sm);
  font-family: 'Arial Black', Arial, sans-serif;
  font-size: 14px;
  font-weight: 900;
  color: var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: background 0.1s, box-shadow 0.08s, transform 0.08s;
}

.close-btn:hover {
  background: #fff;
}

.close-btn:active {
  box-shadow: 1px 1px 0 var(--border);
  transform: translate(2px, 2px);
}
```

- [ ] **Append mobile scroll hint styles**

```css
/* ═══════════════════════════════════════
   MOBILE SCROLL HINT
═══════════════════════════════════════ */
.mobile-hint {
  position: fixed;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 20;
  pointer-events: none;
  opacity: 0;
}

/* Only show on touch/mobile */
@media (hover: none) and (pointer: coarse) {
  .mobile-hint.visible {
    opacity: 1;
  }
}

.mobile-hint-arrow {
  display: block;
  font-size: 40px;
  color: var(--accent);
  text-shadow: 2px 2px 0 var(--border);
  animation: hint-pulse 1.2s ease-in-out infinite;
}

@keyframes hint-pulse {
  0%, 100% { transform: translateX(0); opacity: 0.9; }
  50%       { transform: translateX(6px); opacity: 0.4; }
}
```

- [ ] **Commit**

```bash
git add src/css/style.css
git commit -m "feat: add open-book overlay CSS and mobile scroll hint CSS"
```

---

## Task 8: Shelf JavaScript — Scroll, Center Zoom, Arrows

**Files:**
- Create: `src/js/shelf.js`

- [ ] **Create `src/js/shelf.js` with scroll and center detection**

```js
(function () {
  "use strict";

  const track     = document.getElementById("track");
  const bookTagEl = document.getElementById("bookTag");
  const bookMetaEl= document.getElementById("bookMeta");
  const arrowLeft = document.getElementById("arrowLeft");
  const arrowRight= document.getElementById("arrowRight");

  const bookEls   = Array.from(track.querySelectorAll(".book"));
  let activeIndex = 0;
  let rafPending  = false;

  // ── Center detection ──────────────────────────────────────
  // Uses getBoundingClientRect on every scroll tick — reliable
  // because it measures actual rendered positions, not scroll math.
  function getActiveIndex() {
    const trackRect = track.getBoundingClientRect();
    const center    = trackRect.left + trackRect.width / 2;
    let best = 0, bestDist = Infinity;

    bookEls.forEach(function (el, i) {
      const r    = el.getBoundingClientRect();
      const dist = Math.abs((r.left + r.width / 2) - center);
      if (dist < bestDist) { bestDist = dist; best = i; }
    });

    return best;
  }

  function updateShelf() {
    rafPending = false;
    const idx  = getActiveIndex();
    if (idx === activeIndex && bookEls[idx].classList.contains("active")) return;
    activeIndex = idx;

    bookEls.forEach(function (el, i) {
      var d = Math.abs(i - idx);
      el.classList.toggle("active", d === 0);
      el.classList.toggle("near",   d === 1);
    });

    // Update info bar with animation
    var b = bookEls[idx].dataset;
    bookTagEl.classList.remove("visible");
    bookMetaEl.classList.remove("visible");

    requestAnimationFrame(function () {
      bookTagEl.textContent  = b.title;
      bookMetaEl.textContent = b.author + "  ·  " + b.date;
      requestAnimationFrame(function () {
        bookTagEl.classList.add("visible");
        bookMetaEl.classList.add("visible");
      });
    });

    // Arrow visibility
    arrowLeft.classList.toggle("hidden",  idx === 0);
    arrowRight.classList.toggle("hidden", idx === bookEls.length - 1);
  }

  // Throttle via rAF
  track.addEventListener("scroll", function () {
    if (!rafPending) {
      requestAnimationFrame(updateShelf);
      rafPending = true;
    }
  }, { passive: true });

  // ── Redirect vertical wheel to horizontal scroll ──────────
  window.addEventListener("wheel", function (e) {
    e.preventDefault();
    track.scrollLeft += e.deltaY * 1.4;
  }, { passive: false });

  // ── Arrow buttons ─────────────────────────────────────────
  function nudge(dir) {
    var target = Math.max(0, Math.min(bookEls.length - 1, activeIndex + dir));
    bookEls[target].scrollIntoView({
      behavior: "smooth",
      block:    "nearest",
      inline:   "center"
    });
  }

  arrowLeft.addEventListener("click",  function () { nudge(-1); });
  arrowRight.addEventListener("click", function () { nudge(1);  });

  // ── Keyboard navigation ───────────────────────────────────
  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft")  nudge(-1);
    if (e.key === "ArrowRight") nudge(1);
  });

  // ── Init: snap to first book ──────────────────────────────
  requestAnimationFrame(function () {
    bookEls[0].scrollIntoView({
      behavior: "instant",
      block:    "nearest",
      inline:   "center"
    });
    setTimeout(updateShelf, 60);
  });

  // Export nudge and bookEls for use by other parts of shelf.js
  window._shelf = { nudge: nudge, bookEls: bookEls, getActiveIndex: getActiveIndex };
})();
```

- [ ] **Build and open the page in a browser**

```bash
npm start
```

Open `http://localhost:8080`. Verify:
- Books appear on the shelf
- Mouse wheel scrolls horizontally
- Center book is highlighted (full brightness, larger)
- Adjacent books are slightly scaled
- Info bar shows the active book's title and author
- Arrow buttons navigate

- [ ] **Commit**

```bash
git add src/js/shelf.js
git commit -m "feat: add shelf JS — center detection, wheel redirect, arrows"
```

---

## Task 9: Open Book JS + Hash Navigation

**Files:**
- Modify: `src/js/shelf.js`

Append the following to the bottom of `shelf.js` (inside the same IIFE is not required — add after the closing `})();`).

- [ ] **Append open/close book logic and hash navigation to `src/js/shelf.js`**

```js
// ── Open Book + Hash Navigation ───────────────────────────────────────────────
(function () {
  "use strict";

  var overlay   = document.getElementById("overlay");
  var coverPage = document.getElementById("coverPage");
  var bookEls   = window._shelf.bookEls;
  var nudge     = window._shelf.nudge;
  var getIdx    = window._shelf.getActiveIndex;

  function starsHtml(rating) {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  }

  function openBook(idx) {
    var el     = bookEls[idx];
    var d      = el.dataset;
    var slug   = d.slug;
    var review = document.getElementById("review-" + slug);

    // Populate cover page
    coverPage.style.background               = d.color;
    document.getElementById("coverTitle").textContent  = d.title;
    document.getElementById("coverAuthor").textContent = d.author;
    document.getElementById("coverDate").textContent   = "Read " + d.date;

    // Populate review page
    document.getElementById("reviewTitle").textContent = d.title;
    document.getElementById("reviewStars").innerHTML   = starsHtml(parseInt(d.rating, 10));
    document.getElementById("reviewDate").textContent  = "Read " + d.date;
    document.getElementById("reviewBody").innerHTML    = review ? review.innerHTML : "";

    // Open overlay
    overlay.classList.add("open");

    // Update URL hash silently (no page reload, no scroll jump)
    if (location.hash !== "#" + slug) {
      history.pushState(null, "", "#" + slug);
    }
  }

  function closeBook() {
    overlay.classList.remove("open");
    // Clear hash without triggering hashchange scroll
    history.pushState(null, "", location.pathname);
  }

  // Click on book spine: non-active → center it; active → open
  bookEls.forEach(function (el, i) {
    el.addEventListener("click", function () {
      if (el.classList.contains("active")) {
        openBook(i);
      } else {
        el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    });
  });

  // Close via overlay backdrop click
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeBook();
  });

  // Close via ✕ button
  document.getElementById("closeBtn").addEventListener("click", closeBook);

  // Close via Escape key; Enter opens active book
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && overlay.classList.contains("open")) closeBook();
    if (e.key === "Enter"  && !overlay.classList.contains("open")) openBook(getIdx());
  });

  // ── Deep link: open book if hash is present on load ───────
  function handleHash() {
    var hash = location.hash.slice(1); // strip leading #
    if (!hash) { closeBook(); return; }

    var match = bookEls.findIndex(function (el) { return el.dataset.slug === hash; });
    if (match === -1) return;

    // Snap to that book, then open
    bookEls[match].scrollIntoView({ behavior: "instant", block: "nearest", inline: "center" });
    setTimeout(function () { openBook(match); }, 120);
  }

  // hashchange fires for direct hash changes (e.g. clicking a shared link)
  window.addEventListener("hashchange", handleHash);

  // popstate fires when browser back/forward is used after pushState calls
  window.addEventListener("popstate", function () {
    if (!location.hash) { closeBook(); }
    else { handleHash(); }
  });

  // Check hash on initial load
  if (location.hash) {
    setTimeout(handleHash, 150);
  }
})();
```

- [ ] **Test the open/close flow in the browser**

```bash
npm start
```

Verify:
- Click a non-active book → scrolls to center (does not open)
- Click the active (centered) book → overlay opens with cover + review
- URL changes to `#dune` (or whatever book)
- Click ✕ or outside → overlay closes, hash clears
- Press Esc → closes overlay
- Press Enter → opens active book

- [ ] **Test deep linking**

Navigate directly to `http://localhost:8080/#dune` in the browser. Expected: page loads, Dune snaps to center, overlay opens automatically.

- [ ] **Commit**

```bash
git add src/js/shelf.js
git commit -m "feat: add open-book overlay JS and hash-based deep linking"
```

---

## Task 10: Mobile Scroll Hint JS

**Files:**
- Modify: `src/js/shelf.js`

Append after the previous block in `shelf.js`.

- [ ] **Append mobile hint logic to `src/js/shelf.js`**

```js
// ── Mobile Scroll Hint ────────────────────────────────────────────────────────
(function () {
  "use strict";

  var hint  = document.getElementById("mobileHint");
  var track = document.getElementById("track");

  // Only show on touch devices that have not yet scrolled
  var isTouch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  if (!isTouch) return;

  hint.classList.add("visible");

  // Remove hint the first time the user scrolls
  track.addEventListener("scroll", function () {
    hint.classList.remove("visible");
  }, { once: true, passive: true });
})();
```

- [ ] **Test on a mobile device or Chrome DevTools mobile simulation**

Open DevTools → Toggle device toolbar (Cmd+Shift+M on Mac). Reload the page. Verify:
- Pulsing yellow arrow appears on the right edge
- Arrow disappears the moment you swipe the shelf

- [ ] **Commit**

```bash
git add src/js/shelf.js
git commit -m "feat: add mobile first-visit scroll hint"
```

---

## Task 11: README and AGENTS Documentation

**Files:**
- Create: `README.md`
- Create: `AGENTS.md`

- [ ] **Create `README.md`**

```markdown
# Bookshelf

Personal reading log at [bookshelf.bullrich.dev](https://bookshelf.bullrich.dev).
A dark neobrutalist bookshelf displaying books I've read, in chronological order.

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
rating: 4                 # Integer 1–5
color: "#4361EE"          # Flat spine color — see colour guidance below
width: 22                 # Spine width in px
height: 112               # Spine height in px
---
Your review goes here. Plain prose, a few sentences to a few paragraphs.
```

3. Write your review as the markdown body (after the `---`).

## Frontmatter field reference

| Field      | Type   | Required | Description |
|------------|--------|----------|-------------|
| `title`    | string | yes      | Book title as it appears on the spine and overlay |
| `author`   | string | yes      | Author full name |
| `dateRead` | date   | yes      | ISO 8601 date you finished the book (`YYYY-MM-DD`) |
| `rating`   | number | yes      | Star rating 1–5 |
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
```

- [ ] **Create `AGENTS.md`**

```markdown
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
```

- [ ] **Verify build still works after adding docs**

```bash
npm run build
```

Expected: no errors, `_site/index.html` still contains the expected book count.

- [ ] **Commit**

```bash
git add README.md AGENTS.md
git commit -m "docs: add README with book-adding guide and AGENTS.md with project context"
```

---

## Task 12: End-to-End Smoke Test

No new files — this task verifies the complete build works before shipping.

- [ ] **Full build verification**

```bash
npm run build
```

Expected: exits 0, `_site/index.html` exists.

- [ ] **Verify collection sort order**

```bash
grep 'data-slug' _site/index.html
```

Expected: books appear in `dune`, `sapiens`, `name-of-the-wind` order (oldest first, by `dateRead`).

- [ ] **Verify review content is embedded**

```bash
grep 'id="review-dune"' _site/index.html
```

Expected: one match containing the Dune review text.

- [ ] **Verify deep link works**

Start the dev server and open `http://localhost:8080/#sapiens`. Expected: Sapiens snaps to center, overlay opens with Sapiens cover and review.

- [ ] **Verify mobile hint on touch simulation**

Open Chrome DevTools, enable mobile simulation, reload. Expected: pulsing yellow arrow visible on right edge, disappears on first swipe.

- [ ] **Final commit**

```bash
git add .
git commit -m "chore: end-to-end smoke test passed — bookshelf MVP complete"
```
