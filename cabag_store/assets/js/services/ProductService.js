// ============================================================
// PRODUCT SERVICE
//
// Toda la lógica de negocio de productos vive acá. Ni el
// catálogo público ni el admin tocan StorageAdapter directamente:
// siempre pasan por este servicio. Así, cuando haya backend
// (Express + PostgreSQL), solo cambia StorageAdapter (o se
// reemplaza por uno que haga fetch a la API), y las páginas que
// consumen ProductService no se enteran del cambio.
// ============================================================

import { StorageAdapter } from "./StorageAdapter.js";
import { STORAGE_KEYS, CONFIG } from "../config.js";
import { SEED_PRODUCTS } from "../data/seed-products.js";
import { createProduct, normalizeImages, validateProduct } from "../models/Product.js";
import { generateId, nowIso } from "../utils/format.js";

const storage = new StorageAdapter(STORAGE_KEYS.PRODUCTS);

// ---- Local vs. Supabase (migración en curso) ----
//
// Import DINÁMICO a propósito: si CONFIG.DATA_SOURCE se queda en
// "localStorage" (el default), SupabaseStorageAdapter.js —y por lo
// tanto supabaseClient.js— nunca se cargan, así que el resto del
// sitio sigue funcionando exactamente igual que antes de este módulo,
// incluso sin credenciales de Supabase configuradas.
async function getWriteAdapter() {
  if (CONFIG.DATA_SOURCE === "supabase") {
    const { SupabaseStorageAdapter } = await import("./SupabaseStorageAdapter.js");
    return SupabaseStorageAdapter;
  }
  return null; // null = usar `storage` (localStorage) directamente
}

async function fetchAllRaw() {
  const adapter = await getWriteAdapter();
  return adapter ? adapter.getAll() : storage.getAll();
}

async function fetchByIdRaw(id) {
  const adapter = await getWriteAdapter();
  return adapter ? adapter.getById(id) : storage.getById(id);
}

export const ProductService = {
  /** Carga los datos de ejemplo la primera vez que se abre el sitio */
  async ensureSeeded() {
    return storage.seedIfEmpty(SEED_PRODUCTS.map((p) => createProduct(p)));
  },

  /**
   * Devuelve productos, con filtros opcionales.
   * @param {{ categoria?: string, search?: string, soloDisponibles?: boolean }} filters
   */
  async getAll(filters = {}) {
    const items = await fetchAllRaw();
    return items.filter((p) => {
      const matchesCategory = !filters.categoria || filters.categoria === "Todos" || p.categoria === filters.categoria;
      const matchesSearch =
        !filters.search || p.nombre.toLowerCase().includes(filters.search.trim().toLowerCase());
      const matchesAvailability = !filters.soloDisponibles || p.disponible;
      return matchesCategory && matchesSearch && matchesAvailability;
    });
  },

  async getById(id) {
    return fetchByIdRaw(id);
  },

  /** Productos de la misma categoría, excluyendo el actual */
  async getRelated(product, limit = 4) {
    const all = await fetchAllRaw();
    return all
      .filter((p) => p.categoria === product.categoria && p.id !== product.id)
      .slice(0, limit);
  },

  /**
   * Deja las imágenes listas para persistir: si alguna trae un `file`
   * (File recién elegido en el formulario, todavía no subido), lo sube
   * a Supabase Storage y reemplaza `url` por la URL pública resultante.
   * Con localStorage no hace nada — ahí `url` ya es la data: URL final.
   * La UI (product-form.js) llama a esto; nunca importa Supabase.
   */
  async resolveImagesForSave(images = []) {
    const adapter = await getWriteAdapter();
    if (!adapter) return images;

    const resolved = [];
    for (const img of images) {
      if (img.file) {
        const url = await adapter.uploadImageFile(img.file);
        resolved.push({ id: img.id, url, order: img.order });
      } else {
        resolved.push({ id: img.id, url: img.url, order: img.order });
      }
    }
    return resolved;
  },

  async create(data) {
    const { valid, errors } = validateProduct(data);
    if (!valid) {
      const error = new Error("Datos de producto inválidos");
      error.fieldErrors = errors;
      throw error;
    }

    const adapter = await getWriteAdapter();
    if (adapter) {
      // id/created_at/updated_at los define PostgreSQL. Las imágenes
      // (ya resueltas por resolveImagesForSave) se sincronizan contra
      // product_images dentro del propio adapter.create().
      return adapter.create(data);
    }

    const product = createProduct(data);
    return storage.create(product);
  },

  async update(id, changes) {
    const current = await fetchByIdRaw(id);
    if (!current) throw new Error("Producto no encontrado");
    const merged = { ...current, ...changes };
    if (changes.imagenes) merged.imagenes = normalizeImages(changes.imagenes);

    const { valid, errors } = validateProduct(merged);
    if (!valid) {
      const error = new Error("Datos de producto inválidos");
      error.fieldErrors = errors;
      throw error;
    }

    const adapter = await getWriteAdapter();
    if (adapter) {
      // updated_at lo actualiza el trigger de PostgreSQL (ver
      // supabase/sql/001_set_updated_at_trigger.sql), no el frontend.
      // `current.imagenes` (lo que ya había en product_images) se pasa
      // para que el adapter pueda calcular altas/bajas/reordenamientos.
      return adapter.update(id, merged, current.imagenes);
    }

    merged.fechaActualizacion = nowIso();
    return storage.update(id, merged);
  },

  async remove(id) {
    const adapter = await getWriteAdapter();
    if (adapter) return adapter.remove(id);
    return storage.remove(id);
  },

  async setDisponibilidad(id, disponible) {
    const adapter = await getWriteAdapter();
    if (adapter) return adapter.setDisponibilidad(id, disponible);
    return storage.update(id, { disponible, fechaActualizacion: nowIso() });
  },

  // ---- Gestión de imágenes ----
  // Uso granular (alta de una imagen suelta, borrado puntual,
  // reordenamiento sin pasar por el formulario completo). El flujo
  // principal del admin (product-form.js) sigue usando create()/update()
  // con el array completo de `imagenes` — estos métodos quedan
  // disponibles para quien los necesite, ahora también contra Supabase.

  async addImages(id, urls = []) {
    const adapter = await getWriteAdapter();
    if (adapter) return adapter.addImages(id, urls);

    const product = await storage.getById(id);
    if (!product) throw new Error("Producto no encontrado");
    const nuevas = urls.map((url, i) => ({
      id: generateId("img"),
      url,
      order: product.imagenes.length + i,
    }));
    const imagenes = normalizeImages([...product.imagenes, ...nuevas]);
    return storage.update(id, { imagenes, fechaActualizacion: nowIso() });
  },

  async removeImage(id, imageId) {
    const adapter = await getWriteAdapter();
    if (adapter) return adapter.removeImage(id, imageId);

    const product = await storage.getById(id);
    if (!product) throw new Error("Producto no encontrado");
    const imagenes = normalizeImages(product.imagenes.filter((img) => img.id !== imageId));
    return storage.update(id, { imagenes, fechaActualizacion: nowIso() });
  },

  /** orderedIds: array de ids de imagen en el nuevo orden deseado */
  async reorderImages(id, orderedIds) {
    const adapter = await getWriteAdapter();
    if (adapter) return adapter.reorderImages(id, orderedIds);

    const product = await storage.getById(id);
    if (!product) throw new Error("Producto no encontrado");
    const byId = new Map(product.imagenes.map((img) => [img.id, img]));
    const imagenes = normalizeImages(orderedIds.map((imgId) => byId.get(imgId)).filter(Boolean));
    return storage.update(id, { imagenes, fechaActualizacion: nowIso() });
  },
};