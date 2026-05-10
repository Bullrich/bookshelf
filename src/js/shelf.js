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

    arrowLeft.classList.toggle("hidden",  idx === 0);
    arrowRight.classList.toggle("hidden", idx === bookEls.length - 1);
  }

  track.addEventListener("scroll", function () {
    if (!rafPending) {
      requestAnimationFrame(updateShelf);
      rafPending = true;
    }
  }, { passive: true });

  window.addEventListener("wheel", function (e) {
    e.preventDefault();
    track.scrollLeft += e.deltaY * 1.4;
  }, { passive: false });

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

  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft")  nudge(-1);
    if (e.key === "ArrowRight") nudge(1);
  });

  requestAnimationFrame(function () {
    bookEls[0].scrollIntoView({
      behavior: "instant",
      block:    "nearest",
      inline:   "center"
    });
    setTimeout(updateShelf, 60);
  });

  window._shelf = { nudge: nudge, bookEls: bookEls, getActiveIndex: getActiveIndex };
})();

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

    coverPage.style.background               = d.color;
    document.getElementById("coverTitle").textContent  = d.title;
    document.getElementById("coverAuthor").textContent = d.author;
    document.getElementById("coverDate").textContent   = "Read " + d.date;

    document.getElementById("reviewTitle").textContent = d.title;
    document.getElementById("reviewStars").innerHTML   = starsHtml(parseInt(d.rating, 10));
    document.getElementById("reviewDate").textContent  = "Read " + d.date;
    document.getElementById("reviewBody").innerHTML    = review ? review.innerHTML : "";

    overlay.classList.add("open");

    if (location.hash !== "#" + slug) {
      history.pushState(null, "", "#" + slug);
    }
  }

  function closeBook() {
    overlay.classList.remove("open");
    history.pushState(null, "", location.pathname);
  }

  bookEls.forEach(function (el, i) {
    el.addEventListener("click", function () {
      if (el.classList.contains("active")) {
        openBook(i);
      } else {
        el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    });
  });

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeBook();
  });

  document.getElementById("closeBtn").addEventListener("click", closeBook);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && overlay.classList.contains("open")) closeBook();
    if (e.key === "Enter"  && !overlay.classList.contains("open")) openBook(getIdx());
  });

  function handleHash() {
    var hash = location.hash.slice(1);
    if (!hash) { closeBook(); return; }

    var match = bookEls.findIndex(function (el) { return el.dataset.slug === hash; });
    if (match === -1) return;

    bookEls[match].scrollIntoView({ behavior: "instant", block: "nearest", inline: "center" });
    setTimeout(function () { openBook(match); }, 120);
  }

  window.addEventListener("hashchange", handleHash);

  window.addEventListener("popstate", function () {
    if (!location.hash) { closeBook(); }
    else { handleHash(); }
  });

  if (location.hash) {
    setTimeout(handleHash, 150);
  }
})();

// ── Mobile Scroll Hint ────────────────────────────────────────────────────────
(function () {
  "use strict";

  var hint  = document.getElementById("mobileHint");
  var track = document.getElementById("track");

  var isTouch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  if (!isTouch) return;

  hint.classList.add("visible");

  track.addEventListener("scroll", function () {
    hint.classList.remove("visible");
  }, { once: true, passive: true });
})();
