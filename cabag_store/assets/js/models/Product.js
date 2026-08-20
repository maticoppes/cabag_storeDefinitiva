// ============================================================
// MODELO — Producto
//
// Esta es la "forma" oficial de un producto en toda la app.
// Tanto el catálogo público como el admin y los servicios
// dependen de esta forma, NO de cómo se guardan los datos.
// Si mañana el backend (Express + PostgreSQL) devuelve JSON
// con esta misma forma, nada del resto de la app se entera
// del cambio.
// ============================================================

import { generateId, nowIso } from "../utils/format.js";

/**
 * @typedef {Object} ProductImage
 * @property {string} id
 * @property {string} url
 * @property {number} order
 */

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} nombre
 * @property {string} descripcion
 * @property {number} precio
 * @property {string} categoria
 * @property {boolean} disponible
 * @property {ProductImage[]} imagenes
 * @property {string} fechaCreacion
 * @property {string} fechaActualizacion
 */

/** Crea un producto nuevo con valores por defecto seguros */
export function createProduct(data = {}) {
  const timestamp = nowIso();
  return {
    id: data.id || generateId("prod"),
    nombre: data.nombre?.trim() || "",
    descripcion: data.descripcion?.trim() || "",
    precio: Number(data.precio) || 0,
    categoria: data.categoria || "",
    disponible: data.disponible ?? true,
    imagenes: normalizeImages(data.imagenes || []),
    fechaCreacion: data.fechaCreacion || timestamp,
    fechaActualizacion: data.fechaActualizacion || timestamp,
  };
}

/** Asegura que cada imagen tenga id y order consistentes */
export function normalizeImages(images = []) {
  return images
    .map((img, index) => ({
      id: img.id || generateId("img"),
      url: img.url,
      order: img.order ?? index,
    }))
    .sort((a, b) => a.order - b.order)
    .map((img, index) => ({ ...img, order: index }));
}

/** Valida los campos mínimos requeridos. Devuelve { valid, errors } */
export function validateProduct(data) {
  const errors = {};
  if (!data.nombre || !data.nombre.trim()) errors.nombre = "El nombre es obligatorio.";
  if (!data.categoria) errors.categoria = "Elegí una categoría.";
  if (data.precio === undefined || data.precio === null || Number(data.precio) < 0) {
    errors.precio = "El precio debe ser un número válido.";
  }
  if (!data.imagenes || data.imagenes.length === 0) {
    errors.imagenes = "Agregá al menos una imagen.";
  }
  return { valid: Object.keys(errors).length === 0, errors };
}
