// ============================================================
// PÁGINA — Dashboard del admin (admin/dashboard.html)
// Orquesta ProductService + AuthService + el componente
// product-form.js. No sabe nada de localStorage: si mañana
// ProductService pasa a hablar con una API, este archivo no cambia.
// ============================================================

import { AuthService } from "../services/AuthService.js";
import { ProductService } from "../services/ProductService.js";
import { CONFIG } from "../config.js";
import { formatPrice } from "../utils/format.js";
import { qs, qsa, escapeHtml, debounce, toast } from "../utils/dom.js";
import { initProductForm } from "./product-form.js";

// Protege la ruta: sin sesión activa, redirige al login.
AuthService.guard({ redirectTo: "login.html" });

const ICON_EDIT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`;
const ICON_DELETE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>`;

const els = {
  userName: qs("#adminUserName"),
  logoutBtn: qs("#logoutBtn"),

  statTotal: qs("#statTotal"),
  statDisponibles: qs("#statDisponibles"),
  statAgotados: qs("#statAgotados"),
  statCategorias: qs("#statCategorias"),

  searchInput: qs("#searchInput"),
  categoryFilter: qs("#categoryFilter"),
  statusFilter: qs("#statusFilter"),

  tableBody: qs("#productsTableBody"),
  emptyState: qs("#emptyState"),

  btnNewProduct: qs("#btnNewProduct"),

  deleteModal: qs("#deleteModal"),
  deleteModalClose: qs("#deleteModalClose"),
  deleteCancel: qs("#deleteCancel"),
  deleteConfirm: qs("#deleteConfirm"),
  deleteProductName: qs("#deleteProductName"),
};

let allProducts = [];
let pendingDeleteId = null;

// ---- Sesión ----
els.userName.textContent = AuthService.currentUser() || "admin";
els.logoutBtn.addEventListener("click", () => {
  AuthService.logout();
  window.location.href = "login.html";
});

// ---- Filtros ----
function populateCategoryFilter() {
  const options = CONFIG.CATEGORIES.map((cat) => `<option value="${cat}">${cat}</option>`).join("");
  els.categoryFilter.insertAdjacentHTML("beforeend", options);
}

function getFilteredProducts() {
  const search = els.searchInput.value.trim().toLowerCase();
  const categoria = els.categoryFilter.value;
  const estado = els.statusFilter.value;

  return allProducts.filter((p) => {
    const matchesSearch = !search || p.nombre.toLowerCase().includes(search);
    const matchesCategory = categoria === "Todos" || p.categoria === categoria;
    const matchesStatus =
      estado === "Todos" || (estado === "disponible" ? p.disponible : !p.disponible);
    return matchesSearch && matchesCategory && matchesStatus;
  });
}

// ---- Stats ----
function renderStats() {
  const total = allProducts.length;
  const disponibles = allProducts.filter((p) => p.disponible).length;
  const agotados = total - disponibles;
  const categorias = new Set(allProducts.map((p) => p.categoria)).size;

  els.statTotal.textContent = total;
  els.statDisponibles.textContent = disponibles;
  els.statAgotados.textContent = agotados;
  els.statCategorias.textContent = categorias;
}

// ---- Tabla ----
function productRowHtml(product) {
  const cover = product.imagenes[0]?.url || "https://placehold.co/100x100?text=%20";
  const soldOut = !product.disponible;

  return `
    <tr data-id="${product.id}">
      <td class="cell-product" data-label="Producto">
        <div class="row-product">
          <div class="row-thumb"><img src="${cover}" alt="" loading="lazy"></div>
          <div>
            <p class="row-name">${escapeHtml(product.nombre)}</p>
            <p class="row-meta">${product.imagenes.length} imagen${product.imagenes.length === 1 ? "" : "es"}</p>
          </div>
        </div>
      </td>
      <td data-label="Categoría">${escapeHtml(product.categoria)}</td>
      <td data-label="Precio">${formatPrice(product.precio)}</td>
      <td data-label="Estado">
        <div style="display:flex; align-items:center; gap:10px;">
          <label class="switch">
            <input type="checkbox" class="toggle-disponible" ${product.disponible ? "checked" : ""}>
            <span class="switch-track"></span>
          </label>
          <span class="status-pill ${soldOut ? "soldout" : "available"}">${soldOut ? "Agotado" : "Disponible"}</span>
        </div>
      </td>
      <td data-label="Acciones">
        <div class="table-actions">
          <button type="button" class="icon-btn btn-edit" title="Editar" aria-label="Editar producto">${ICON_EDIT}</button>
          <button type="button" class="icon-btn icon-btn-danger btn-delete" title="Eliminar" aria-label="Eliminar producto">${ICON_DELETE}</button>
        </div>
      </td>
    </tr>
  `;
}

function renderTable() {
  const filtered = getFilteredProducts();
  els.tableBody.innerHTML = filtered.map(productRowHtml).join("");
  els.emptyState.hidden = filtered.length !== 0;

  qsa(".toggle-disponible", els.tableBody).forEach((toggle) => {
    toggle.addEventListener("change", async (e) => {
      const id = e.target.closest("tr").dataset.id;
      await ProductService.setDisponibilidad(id, e.target.checked);
      toast(e.target.checked ? "Producto marcado como disponible." : "Producto marcado como agotado.");
      await refresh({ keepFilters: true });
    });
  });

  qsa(".btn-edit", els.tableBody).forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.closest("tr").dataset.id;
      const product = await ProductService.getById(id);
      if (product) productForm.open(product);
    });
  });

  qsa(".btn-delete", els.tableBody).forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const row = e.target.closest("tr");
      const id = row.dataset.id;
      const product = allProducts.find((p) => p.id === id);
      openDeleteModal(product);
    });
  });
}

// ---- Eliminar producto ----
function openDeleteModal(product) {
  pendingDeleteId = product.id;
  els.deleteProductName.textContent = product.nombre;
  els.deleteModal.hidden = false;
}

function closeDeleteModal() {
  pendingDeleteId = null;
  els.deleteModal.hidden = true;
}

els.deleteModalClose.addEventListener("click", closeDeleteModal);
els.deleteCancel.addEventListener("click", closeDeleteModal);
els.deleteModal.addEventListener("click", (e) => {
  if (e.target === els.deleteModal) closeDeleteModal();
});

els.deleteConfirm.addEventListener("click", async () => {
  if (!pendingDeleteId) return;
  await ProductService.remove(pendingDeleteId);
  toast("Producto eliminado.");
  closeDeleteModal();
  await refresh({ keepFilters: true });
});

// ---- Alta / edición ----
const productForm = initProductForm({
  onSaved: () => refresh({ keepFilters: true }),
});

els.btnNewProduct.addEventListener("click", () => productForm.open());

// ---- Carga de datos ----
async function refresh({ keepFilters = false } = {}) {
  allProducts = await ProductService.getAll();
  renderStats();
  renderTable();
  if (!keepFilters) {
    els.searchInput.value = "";
    els.categoryFilter.value = "Todos";
    els.statusFilter.value = "Todos";
  }
}

els.searchInput.addEventListener("input", debounce(renderTable, 200));
els.categoryFilter.addEventListener("change", renderTable);
els.statusFilter.addEventListener("change", renderTable);

async function init() {
  populateCategoryFilter();
  await ProductService.ensureSeeded();
  await refresh();
}

init();
