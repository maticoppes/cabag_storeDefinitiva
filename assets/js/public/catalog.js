// ============================================================
// PÁGINA — Catálogo público (index.html)
// Orquesta ProductService + componentes. No sabe nada de
// localStorage: si mañana ProductService lee de una API, este
// archivo no cambia.
// ============================================================

import { ProductService } from "../services/ProductService.js";
import { productCardHtml } from "../components/productCard.js";
import { skeletonCardsHtml } from "../components/skeleton.js";
import { qs, qsa, debounce, escapeHtml } from "../utils/dom.js";
import { CONFIG } from "../config.js";

const grid = qs("#productGrid");
const searchInput = qs("#searchInput");
const filtersContainer = qs("#filters");
const noResults = qs("#noResults");

let activeFilter = "Todos";

function initWhatsappLinks() {
  const waUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}`;
  qsa(".btn-whatsapp, .float-wa").forEach((el) => {
    el.href = waUrl;
  });
}

function initInstagramLinks() {
  const igUrl = CONFIG.INSTAGRAM_URL;
  if (!igUrl) return;
  qsa(".btn-instagram, .footer-ig").forEach((el) => {
    el.href = igUrl;
  });
}

async function render() {
  const filters = { categoria: activeFilter, search: searchInput.value };
  const products = await ProductService.getAll(filters);

  grid.innerHTML = products.map(productCardHtml).join("");
  noResults.hidden = products.length !== 0;
}

function initNavigationScrollspy() {
  const navLinks = qsa(".main-nav a[href^='#']");
  if (!navLinks.length) return;

  const sectionMap = new Map();
  navLinks.forEach((link) => {
    const hash = link.getAttribute("href");
    if (!hash || hash === "#") return;
    try {
      const section = qs(hash);
      if (section) {
        sectionMap.set(section, link);
      }
    } catch {
      // Ignore any non-selector href
    }
  });

  if (sectionMap.size === 0) return;

  function setActiveLink(activeLink) {
    navLinks.forEach((link) => link.classList.remove("is-active", "active"));
    if (activeLink) {
      activeLink.classList.add("is-active", "active");
    }
  }

  // Click handler for instant response
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setActiveLink(link);
    });
  });

  // IntersectionObserver for scrolling
  const observer = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries.filter((e) => e.isIntersecting);
      if (visibleEntries.length > 0) {
        // Find section closest to top of viewport
        const bestEntry = visibleEntries.reduce((prev, curr) => {
          return Math.abs(curr.boundingClientRect.top) < Math.abs(prev.boundingClientRect.top) ? curr : prev;
        });
        const targetLink = sectionMap.get(bestEntry.target);
        if (targetLink) {
          setActiveLink(targetLink);
        }
      }
    },
    {
      root: null,
      rootMargin: "-20% 0px -55% 0px",
      threshold: [0, 0.25, 0.5]
    }
  );

  sectionMap.forEach((_, section) => {
    observer.observe(section);
  });

  // Check top position or hash on page load
  const currentHash = window.location.hash;
  const hashLink = navLinks.find((l) => l.getAttribute("href") === currentHash);
  if (hashLink) {
    setActiveLink(hashLink);
  } else {
    setActiveLink(navLinks[0]);
  }
}

function initFilters() {
  if (filtersContainer) {
    const categoryButtons = CONFIG.CATEGORIES.map(
      (cat) => `<button class="filter-btn" data-filter="${escapeHtml(cat)}">${escapeHtml(cat)}</button>`
    ).join("");
    filtersContainer.innerHTML = `<button class="filter-btn active" data-filter="Todos">Todos</button>${categoryButtons}`;
  }

  const filterButtons = qsa(".filter-btn", filtersContainer);
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.filter;
      render();
    });
  });
}

function initSearch() {
  searchInput.addEventListener("input", debounce(render, 200));
}

async function init() {
  initNavigationScrollspy();
  initWhatsappLinks();
  initInstagramLinks();
  grid.innerHTML = skeletonCardsHtml(8);
  initFilters();
  initSearch();
  await ProductService.ensureSeeded();
  await render();
}

init();
