// ============================================================
// PÁGINA — Catálogo público (index.html)
// Orquesta ProductService + componentes. No sabe nada de
// localStorage: si mañana ProductService lee de una API, este
// archivo no cambia.
// ============================================================

import { ProductService } from "../services/ProductService.js";
import { productCardHtml } from "../components/productCard.js";
import { skeletonCardsHtml } from "../components/skeleton.js";
import { qs, qsa, debounce } from "../utils/dom.js";
import { CONFIG } from "../config.js";

const grid = qs("#productGrid");
const searchInput = qs("#searchInput");
const filterButtons = qsa(".filter-btn");
const noResults = qs("#noResults");

let activeFilter = "Todos";

function initWhatsappLinks() {
  const waUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}`;
  qsa(".btn-whatsapp, .float-wa").forEach((el) => {
    el.href = waUrl;
  });
}

async function render() {
  const filters = { categoria: activeFilter, search: searchInput.value };
  const products = await ProductService.getAll(filters);

  grid.innerHTML = products.map(productCardHtml).join("");
  noResults.hidden = products.length !== 0;
}

function initFilters() {
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
  initWhatsappLinks();
  grid.innerHTML = skeletonCardsHtml(8);
  initFilters();
  initSearch();
  await ProductService.ensureSeeded();
  await render();
}

init();
