/* =========================================================
   EDIT THIS BLOCK: your name and links in ONE place.
   Every link and name on every page is filled from here.
   ========================================================= */
const SITE = {
  name: "veronika mark",
  youtube: "https://www.youtube.com/@yourchannel",
  instagram: "https://www.instagram.com/yourusername",
  newsletter: "https://veronikamark.eo.page/newsletter",
  email: "contact@veronikamark.com",
};

/* =========================================================
   REVIEW SCREENSHOTS: add as many file names as you like.
   Put the image files in the images/ folder, then list them here.
   Row 1 and row 2 both use this list (row 2 in reverse order).
   ========================================================= */
const REVIEW_SCREENSHOTS = [
  "images/R1.png",
  "images/R2.png",
  "images/R3.png",
  "images/R4.png",
  "images/R5.png",
  "images/R6.png",
];

/* ---------------------------------------------------------
   Fill name and links
   --------------------------------------------------------- */
document.querySelectorAll("[data-site]").forEach((el) => {
  const v = SITE[el.dataset.site];
  if (v) el.textContent = v;
});
document.querySelectorAll("[data-link]").forEach((a) => {
  const key = a.dataset.link;
  const v = SITE[key];
  if (!v) return;
  a.href = key === "email" ? "mailto:" + v : v;
  if (key !== "email") {
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  }
});

/* ---------------------------------------------------------
   Theme toggle (remembers the choice)
   --------------------------------------------------------- */
const root = document.documentElement;
const themeBtn = document.querySelector(".theme-toggle");
function setThemeLabel() {
  if (!themeBtn) return;
  const dark = root.getAttribute("data-theme") === "dark";
  themeBtn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  themeBtn.setAttribute("aria-pressed", String(dark));
}
setThemeLabel();
if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) { /* storage blocked */ }
    setThemeLabel();
  });
}

/* ---------------------------------------------------------
   Mobile menu + navbar border on scroll
   --------------------------------------------------------- */
const nav = document.querySelector(".nav");
const burger = document.querySelector(".burger");
const links = document.querySelector(".nav-links");
if (burger && links) {
  burger.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      links.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    })
  );
}
function onScrollNav() {
  if (nav) nav.classList.toggle("scrolled", window.scrollY > 8);
}
window.addEventListener("scroll", onScrollNav, { passive: true });
onScrollNav();

/* ---------------------------------------------------------
   Year in footer
   --------------------------------------------------------- */
document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

/* ---------------------------------------------------------
   Testimonials: rows slide with the page scroll.
   Row 1 moves right-to-left, row 2 moves left-to-right,
   in both scroll directions, and loops forever.
   --------------------------------------------------------- */
(function initMarquees() {
  const rows = document.querySelectorAll(".marquee");
  if (!rows.length || !REVIEW_SCREENSHOTS.length) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SPEED = 0.6; // pixels moved per pixel scrolled

  const state = [];

  function makeSet(list, n) {
    const frag = document.createDocumentFragment();
    for (let c = 0; c < n; c++) {
      list.forEach((src, i) => {
        const card = document.createElement("div");
        card.className = "shot";
        const img = document.createElement("img");
        img.src = src;
        img.alt = c === 0 ? "Review screenshot " + (i + 1) : "";
        if (c > 0) img.setAttribute("aria-hidden", "true");
        img.loading = "lazy";
        img.decoding = "async";
        card.appendChild(img);
        frag.appendChild(card);
      });
    }
    return frag;
  }

  function build() {
    state.length = 0;
    rows.forEach((row, idx) => {
      const track = row.querySelector(".track");
      track.textContent = "";
      const list = idx % 2 === 0 ? REVIEW_SCREENSHOTS : REVIEW_SCREENSHOTS.slice().reverse();

      if (reduce) {
        row.classList.add("static");
        track.appendChild(makeSet(list, 1));
        return;
      }

      // measure one set, then repeat it until the row is wide enough to loop
      track.appendChild(makeSet(list, 1));
      const setWidth = track.scrollWidth + parseFloat(getComputedStyle(track).columnGap || 0);
      const copies = Math.max(2, Math.ceil(row.clientWidth / setWidth) + 2);
      track.textContent = "";
      track.appendChild(makeSet(list, copies));
      state.push({ track, setWidth, dir: idx % 2 === 0 ? -1 : 1 });
    });
    update(true);
  }

  let current = 0;
  let target = 0;
  let ticking = false;

  function frame() {
    current += (target - current) * 0.14; // smooth easing
    if (Math.abs(target - current) < 0.1) current = target;
    paint();
    if (current !== target) requestAnimationFrame(frame);
    else ticking = false;
  }
  function paint() {
    state.forEach((s) => {
      const o = ((current * SPEED) % s.setWidth + s.setWidth) % s.setWidth;
      const x = s.dir < 0 ? -o : o - s.setWidth;
      s.track.style.transform = "translate3d(" + x + "px,0,0)";
    });
  }
  function update(jump) {
    target = window.scrollY;
    if (jump) current = target;
    if (jump) { paint(); return; }
    if (!ticking) { ticking = true; requestAnimationFrame(frame); }
  }

  window.addEventListener("scroll", () => update(false), { passive: true });
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 200);
  });
  build();
})();
