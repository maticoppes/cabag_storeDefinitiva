// ============================================================
// PÁGINA — Detalle de producto (producto.html)
// Lee el id desde la query string, pide el producto a
// ProductService y arma galería + info + relacionados.
// No sabe nada de localStorage: si ProductService pasa a leer
// de una API, este archivo no cambia.
// ============================================================

import { ProductService } from "../services/ProductService.js";
import { productCardHtml, buildWhatsappLink } from "../components/productCard.js";
import { formatPrice } from "../utils/format.js";
import { qs, qsa, getQueryParam } from "../utils/dom.js";
import { CONFIG } from "../config.js";

const els = {
  detail: qs("#productDetail"),
  error: qs("#productError"),
  errorMessage: qs("#productErrorMessage"),
  breadcrumbCurrent: qs("#breadcrumbCurrent"),
  pageTitle: qs("#pageTitle"),

  galleryMain: qs("#galleryMain"),
  galleryImage: qs("#galleryImage"),
  galleryPrev: qs("#galleryPrev"),
  galleryNext: qs("#galleryNext"),
  galleryCounter: qs("#galleryCounter"),
  galleryThumbs: qs("#galleryThumbs"),

  category: qs("#productCategory"),
  title: qs("#productTitle"),
  price: qs("#productPrice"),
  stock: qs("#productStock"),
  desc: qs("#productDesc"),
  whatsapp: qs("#productWhatsapp"),
  whatsappLabel: qs("#productWhatsappLabel"),

  relatedSection: qs("#relatedSection"),
  relatedGrid: qs("#relatedGrid"),
};

// ---- Estado de la galería ----
const gallery = { images: [], index: 0 };

function showGalleryImage(index) {
  const total = gallery.images.length;
  if (total === 0) return;
  gallery.index = ((index % total) + total) % total;
  const img = gallery.images[gallery.index];

  els.galleryImage.src = img.url;
  els.galleryImage.alt = "";
  // Reinicia la animación de fade-in en cada cambio
  els.galleryImage.style.animation = "none";
  void els.galleryImage.offsetWidth;
  els.galleryImage.style.animation = "";

  if (total > 1) {
    els.galleryCounter.hidden = false;
    els.galleryCounter.textContent = `${gallery.index + 1} / ${total}`;
  }

  qsThumbs().forEach((thumb, i) => thumb.classList.toggle("active", i === gallery.index));
}

function qsThumbs() {
  return Array.from(els.galleryThumbs.querySelectorAll(".gallery-thumb"));
}

function initGallery(images, productName) {
  gallery.images = images;
  gallery.index = 0;
  els.galleryImage.alt = productName;

  const hasMultiple = images.length > 1;
  els.galleryPrev.hidden = !hasMultiple;
  els.galleryNext.hidden = !hasMultiple;
  els.galleryThumbs.hidden = !hasMultiple;

  if (hasMultiple) {
    els.galleryThumbs.innerHTML = images
      .map(
        (img, i) => `
        <button type="button" class="gallery-thumb ${i === 0 ? "active" : ""}" data-index="${i}" aria-label="Ver imagen ${i + 1}">
          <img src="${img.url}" alt="" loading="lazy">
        </button>`
      )
      .join("");

    qsThumbs().forEach((thumb) => {
      thumb.addEventListener("click", () => showGalleryImage(Number(thumb.dataset.index)));
    });

    els.galleryPrev.addEventListener("click", () => showGalleryImage(gallery.index - 1));
    els.galleryNext.addEventListener("click", () => showGalleryImage(gallery.index + 1));

    initSwipe();
  }

  showGalleryImage(0);
}

/** Swipe táctil sobre la imagen principal, para navegar en celulares */
function initSwipe() {
  let startX = 0;
  let deltaX = 0;
  const threshold = 40;

  els.galleryMain.addEventListener(
    "touchstart",
    (e) => {
      startX = e.touches[0].clientX;
      deltaX = 0;
    },
    { passive: true }
  );

  els.galleryMain.addEventListener(
    "touchmove",
    (e) => {
      deltaX = e.touches[0].clientX - startX;
    },
    { passive: true }
  );

  els.galleryMain.addEventListener("touchend", () => {
    if (Math.abs(deltaX) > threshold) {
      showGalleryImage(gallery.index + (deltaX < 0 ? 1 : -1));
    }
  });
}

// ---- Info del producto ----
function renderInfo(product) {
  els.pageTitle.textContent = `${product.nombre} | Ca & Bag.`;
  els.breadcrumbCurrent.textContent = product.nombre;

  els.category.textContent = product.categoria;
  els.title.textContent = product.nombre;
  els.price.textContent = formatPrice(product.precio);
  els.desc.textContent = product.descripcion;

  const soldOut = !product.disponible;
  els.stock.textContent = soldOut ? "Agotado" : "Disponible";
  els.stock.classList.toggle("is-soldout", soldOut);

  if (soldOut) {
    els.whatsapp.classList.add("is-disabled");
    els.whatsapp.removeAttribute("target");
    els.whatsapp.href = "#";
    els.whatsapp.setAttribute("aria-disabled", "true");
    els.whatsapp.addEventListener("click", (e) => e.preventDefault());
    els.whatsappLabel.textContent = "Agotado";
  } else {
    els.whatsapp.href = buildWhatsappLink(product);
    els.whatsappLabel.textContent = "Consultar por WhatsApp";
  }
}

// ---- Relacionados ----
async function renderRelated(product) {
  const related = await ProductService.getRelated(product, 4);
  if (related.length === 0) return;
  els.relatedGrid.innerHTML = related.map(productCardHtml).join("");
  els.relatedSection.hidden = false;
}

// ---- Error ----
function showError(message) {
  if (message) els.errorMessage.textContent = message;
  els.detail.hidden = true;
  els.relatedSection.hidden = true;
  els.error.hidden = false;
}

// ---- WhatsApp & Instagram links ----
function initWhatsappLinks() {
  const waUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}`;
  qsa(".btn-whatsapp, .float-wa").forEach((el) => {
    if (el.id !== "productWhatsapp") {
      el.href = waUrl;
    }
  });
}

function initInstagramLinks() {
  const igUrl = CONFIG.INSTAGRAM_URL;
  if (!igUrl) return;
  qsa(".btn-instagram, .footer-ig").forEach((el) => {
    el.href = igUrl;
  });
}

// ---- Init ----
async function init() {
  initWhatsappLinks();
  initInstagramLinks();
  await ProductService.ensureSeeded();

  const id = getQueryParam("id");
  if (!id) {
    showError("No se especificó ningún producto en el enlace.");
    return;
  }

  const product = await ProductService.getById(id);
  if (!product) {
    showError("El producto que buscás no existe o ya no está disponible en nuestro catálogo.");
    return;
  }

  initGallery(product.imagenes, product.nombre);
  renderInfo(product);
  els.detail.hidden = false;
  await renderRelated(product);
}

init();
