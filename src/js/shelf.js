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
