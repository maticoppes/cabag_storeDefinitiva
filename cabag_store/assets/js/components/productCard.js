// ============================================================
// COMPONENTE — Tarjeta de producto (catálogo público)
// ============================================================

import { formatPrice } from "../utils/format.js";
import { escapeHtml } from "../utils/dom.js";
import { CONFIG } from "../config.js";

const WA_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.6 6.32A8.86 8.86 0 0 0 3.1 16.75L2 21l4.36-1.14a8.85 8.85 0 0 0 4.24 1.08h.01a8.86 8.86 0 0 0 6.99-14.62Zm-6.99 13.6h-.01a7.35 7.35 0 0 1-3.75-1.03l-.27-.16-2.59.68.69-2.53-.18-.26a7.36 7.36 0 1 1 6.11 3.3Zm4.04-5.5c-.22-.11-1.31-.65-1.51-.72-.2-.07-.35-.11-.5.11-.15.22-.57.72-.7.87-.13.15-.26.16-.48.05-.22-.11-.94-.35-1.79-1.1a6.7 6.7 0 0 1-1.24-1.54c-.13-.22-.01-.34.1-.45.1-.1.22-.26.33-.39.11-.13.15-.22.22-.37.07-.15.04-.28-.02-.39-.07-.11-.5-1.2-.68-1.64-.18-.43-.36-.37-.5-.38h-.42c-.15 0-.39.05-.59.28-.2.22-.77.75-.77 1.83s.79 2.13.9 2.28c.11.15 1.55 2.37 3.76 3.32.53.23.94.36 1.26.47.53.17 1 .14 1.38.09.42-.06 1.31-.53 1.49-1.05.19-.51.19-.95.13-1.05-.06-.09-.2-.15-.42-.26Z"/></svg>`;

/** Arma el link de WhatsApp con mensaje prellenado para un producto puntual */
export function buildWhatsappLink(product) {
  const msg = encodeURIComponent(
    `Hola! Me interesa el producto "${product.nombre}" (${formatPrice(product.precio)}). ¿Me das más información?`
  );
  return `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${msg}`;
}

/** Devuelve el HTML de una tarjeta de producto para el grid del catálogo */
export function productCardHtml(product) {
  const cover = product.imagenes[0]?.url || "https://placehold.co/500x500?text=Sin+imagen";
  const soldOut = !product.disponible;

  return `
    <article class="product-card ${soldOut ? "is-soldout" : ""}">
      <a href="producto.html?id=${encodeURIComponent(product.id)}" class="product-media">
        <span class="product-badge">${escapeHtml(product.categoria)}</span>
        ${soldOut ? `<span class="product-badge product-badge-soldout">Agotado</span>` : ""}
        <img src="${cover}" alt="${escapeHtml(product.nombre)}" loading="lazy">
      </a>
      <div class="product-body">
        <a href="producto.html?id=${encodeURIComponent(product.id)}" class="product-title-link">
          <h3 class="product-title">${escapeHtml(product.nombre)}</h3>
        </a>
        <p class="product-price">${formatPrice(product.precio)}</p>
        <p class="product-desc">${escapeHtml(product.descripcion)}</p>
        <a class="product-cta ${soldOut ? "is-disabled" : ""}"
           href="${soldOut ? "#" : buildWhatsappLink(product)}"
           ${soldOut ? "aria-disabled=\"true\" onclick=\"return false;\"" : 'target="_blank"'}>
          ${WA_ICON}
          ${soldOut ? "Agotado" : "Consultar por WhatsApp"}
        </a>
      </div>
    </article>
  `;
}
