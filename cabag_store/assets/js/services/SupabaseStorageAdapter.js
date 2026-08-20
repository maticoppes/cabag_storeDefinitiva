// ============================================================
// SUPABASE STORAGE ADAPTER
//
// Equivalente a StorageAdapter.js pero contra Supabase/PostgreSQL
// en vez de localStorage. Implementa lectura y escritura de
// productos (getAll/getById/create/update/remove/setDisponibilidad)
// y de sus imágenes (public.product_images + Supabase Storage).
//
// Traduce entre las tablas de Supabase y el modelo Product que ya usa
// toda la app (ver models/Product.js). Ningún otro archivo del
// proyecto necesita saber que las columnas se llaman distinto
// (created_at/updated_at) ni cómo se guardan las imágenes: ese mapeo
// vive únicamente acá (mapRowToProduct / mapProductToRow / las
// funciones de imágenes).
//
// created_at/updated_at los gestiona PostgreSQL, nunca el frontend:
// - created_at: default now() en la tabla (se aplica solo).
// - updated_at: default now() cubre el INSERT, pero un UPDATE
//   necesita un trigger para actualizarse solo. Ver
//   supabase/sql/001_set_updated_at_trigger.sql — hay que correrlo
//   una vez en el SQL Editor de Supabase antes de editar productos
//   con CONFIG.DATA_SOURCE = "supabase".
//
// IMÁGENES — contrato { id, url, order } (igual que siempre):
// - Los archivos se suben a Supabase Storage (bucket
//   CONFIG.SUPABASE_STORAGE_BUCKET) y `url` termina siendo la URL
//   pública que devuelve Storage — la misma que ya consumía <img>.
// - Cada imagen es una fila en public.product_images
//   (id uuid, product_id uuid, url text, "order" integer).
// - Requiere el bucket + las policies de supabase/sql/002_product_images_setup.sql.
//
// Import dinámico: este archivo (y por lo tanto supabaseClient.js)
// solo se carga si ProductService detecta CONFIG.DATA_SOURCE ===
// "supabase". Con el valor por defecto ("localStorage") nunca se
// evalúa, así que no hace falta tener credenciales cargadas para que
// el resto del sitio siga funcionando.
// ============================================================

import { supabase } from "./supabaseClient.js";
import { CONFIG } from "../config.js";
import { createProduct, normalizeImages } from "../models/Product.js";
import { generateId } from "../utils/format.js";

const TABLE = "products";
const IMAGES_TABLE = "product_images";
const BUCKET = CONFIG.SUPABASE_STORAGE_BUCKET;

/** Convierte una fila de public.products (+ sus imágenes ya resueltas) al modelo Product */
function mapRowToProduct(row, imagenes = []) {
  return createProduct({
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion,
    precio: row.precio,
    categoria: row.categoria,
    disponible: row.disponible,
    imagenes,
    fechaCreacion: row.created_at,
    fechaActualizacion: row.updated_at,
  });
}

/**
 * Convierte un Product (o los cambios de un Product) a una fila de
 * public.products. A propósito NUNCA incluye id, created_at ni
 * updated_at (los gestiona PostgreSQL) ni imagenes (eso va a
 * product_images, ver funciones de imágenes más abajo).
 */
function mapProductToRow(product) {
  return {
    nombre: product.nombre,
    descripcion: product.descripcion,
    precio: product.precio,
    categoria: product.categoria,
    disponible: product.disponible,
  };
}

/** Convierte una fila de product_images al shape { id, url, order } que usa la app */
function mapImageRow(row) {
  return { id: row.id, url: row.url, order: row.order };
}

/** Trae las imágenes de varios productos en una sola consulta, agrupadas por product_id */
async function fetchImagesForProducts(productIds) {
  const ids = productIds.filter(Boolean);
  if (ids.length === 0) return new Map();

  const { data, error } = await supabase
    .from(IMAGES_TABLE)
    .select("*")
    .in("product_id", ids)
    .order("order", { ascending: true });

  if (error) {
    throw new Error(`[SupabaseStorageAdapter] Error al leer imágenes: ${error.message}`);
  }

  const byProduct = new Map();
  for (const row of data || []) {
    const list = byProduct.get(row.product_id) || [];
    list.push(mapImageRow(row));
    byProduct.set(row.product_id, list);
  }
  return byProduct;
}

/**
 * Reconcilia product_images para que coincida con `after`, partiendo
 * de `before` (lo que ya había en la base antes de este guardado):
 * - imágenes en `before` que ya no están en `after` -> DELETE
 * - imágenes de `after` sin `id` conocido en `before` -> INSERT
 * - imágenes presentes en ambos -> UPDATE (por si cambió el orden)
 * No borra los archivos de Storage de las imágenes eliminadas
 * (limitación conocida, ver README).
 */
async function syncImages(productId, before, after) {
  const beforeIds = new Set(before.map((img) => img.id));
  const afterIds = new Set(after.map((img) => img.id));

  const toDelete = before.filter((img) => !afterIds.has(img.id));
  const toInsert = after.filter((img) => !beforeIds.has(img.id));
  const toUpdate = after.filter((img) => beforeIds.has(img.id));

  if (toDelete.length > 0) {
    const { error } = await supabase
      .from(IMAGES_TABLE)
      .delete()
      .in("id", toDelete.map((img) => img.id));
    if (error) throw new Error(`[SupabaseStorageAdapter] Error al eliminar imágenes: ${error.message}`);
  }

  if (toInsert.length > 0) {
    const rows = toInsert.map((img) => ({ product_id: productId, url: img.url, order: img.order }));
    const { error } = await supabase.from(IMAGES_TABLE).insert(rows);
    if (error) throw new Error(`[SupabaseStorageAdapter] Error al agregar imágenes: ${error.message}`);
  }

  for (const img of toUpdate) {
    const { error } = await supabase
      .from(IMAGES_TABLE)
      .update({ url: img.url, order: img.order })
      .eq("id", img.id);
    if (error) throw new Error(`[SupabaseStorageAdapter] Error al actualizar una imagen: ${error.message}`);
  }
}

export const SupabaseStorageAdapter = {
  async getAll() {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`[SupabaseStorageAdapter] Error al leer productos: ${error.message}`);
    }
    const rows = data || [];
    const imagesByProduct = await fetchImagesForProducts(rows.map((row) => row.id));
    return rows.map((row) => mapRowToProduct(row, imagesByProduct.get(row.id) || []));
  },

  async getById(id) {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`[SupabaseStorageAdapter] Error al leer el producto "${id}": ${error.message}`);
    }
    if (!data) return null;

    const imagesByProduct = await fetchImagesForProducts([id]);
    return mapRowToProduct(data, imagesByProduct.get(id) || []);
  },

  /** product: objeto con forma Product. id/timestamps los define la base; imagenes se sincronizan aparte */
  async create(product) {
    const { data, error } = await supabase
      .from(TABLE)
      .insert(mapProductToRow(product))
      .select()
      .single();

    if (error) {
      throw new Error(`[SupabaseStorageAdapter] Error al crear el producto: ${error.message}`);
    }

    await syncImages(data.id, [], product.imagenes || []);
    const imagesByProduct = await fetchImagesForProducts([data.id]);
    return mapRowToProduct(data, imagesByProduct.get(data.id) || []);
  },

  /**
   * changes: objeto con forma Product (ya mergeado) con los valores nuevos.
   * previousImages: `imagenes` tal como estaban en la base ANTES de este
   * guardado (necesario para poder diferenciar altas/bajas/reordenamientos).
   */
  async update(id, changes, previousImages = []) {
    const { data, error } = await supabase
      .from(TABLE)
      .update(mapProductToRow(changes))
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`[SupabaseStorageAdapter] Error al actualizar el producto "${id}": ${error.message}`);
    }

    await syncImages(id, previousImages, changes.imagenes || []);
    const imagesByProduct = await fetchImagesForProducts([id]);
    return mapRowToProduct(data, imagesByProduct.get(id) || []);
  },

  async remove(id) {
    // product_images no tiene (según lo confirmado) una FK con ON DELETE
    // CASCADE garantizada, así que se borra explícitamente acá.
    const { error: imagesError } = await supabase.from(IMAGES_TABLE).delete().eq("product_id", id);
    if (imagesError) {
      throw new Error(
        `[SupabaseStorageAdapter] Error al eliminar imágenes del producto "${id}": ${imagesError.message}`
      );
    }

    const { error } = await supabase.from(TABLE).delete().eq("id", id);
    if (error) {
      throw new Error(`[SupabaseStorageAdapter] Error al eliminar el producto "${id}": ${error.message}`);
    }
    return true;
  },

  async setDisponibilidad(id, disponible) {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ disponible })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(
        `[SupabaseStorageAdapter] Error al cambiar la disponibilidad del producto "${id}": ${error.message}`
      );
    }
    const imagesByProduct = await fetchImagesForProducts([id]);
    return mapRowToProduct(data, imagesByProduct.get(id) || []);
  },

  // ---- Gestión de imágenes (uso granular; el flujo principal del admin usa create/update de arriba) ----

  async addImages(productId, urls = []) {
    const imagesByProduct = await fetchImagesForProducts([productId]);
    const existing = imagesByProduct.get(productId) || [];
    const rows = urls.map((url, i) => ({ product_id: productId, url, order: existing.length + i }));

    const { data, error } = await supabase.from(IMAGES_TABLE).insert(rows).select();
    if (error) throw new Error(`[SupabaseStorageAdapter] Error al agregar imágenes: ${error.message}`);

    return normalizeImages([...existing, ...(data || []).map(mapImageRow)]);
  },

  async removeImage(productId, imageId) {
    const { error } = await supabase
      .from(IMAGES_TABLE)
      .delete()
      .eq("id", imageId)
      .eq("product_id", productId);
    if (error) throw new Error(`[SupabaseStorageAdapter] Error al eliminar la imagen: ${error.message}`);

    const imagesByProduct = await fetchImagesForProducts([productId]);
    return normalizeImages(imagesByProduct.get(productId) || []);
  },

  async reorderImages(productId, orderedIds = []) {
    const updates = orderedIds.map((imageId, index) =>
      supabase.from(IMAGES_TABLE).update({ order: index }).eq("id", imageId).eq("product_id", productId)
    );
    const results = await Promise.all(updates);
    const failed = results.find((r) => r.error);
    if (failed) throw new Error(`[SupabaseStorageAdapter] Error al reordenar imágenes: ${failed.error.message}`);

    const imagesByProduct = await fetchImagesForProducts([productId]);
    return normalizeImages(imagesByProduct.get(productId) || []);
  },

  /**
   * Sube un archivo real (File) al bucket de Storage y devuelve su URL
   * pública. No toca product_images: eso lo hace syncImages/addImages
   * una vez que ya se tiene la URL final.
   */
  async uploadImageFile(file) {
    const ext = (file.name && file.name.includes(".") ? file.name.split(".").pop() : "jpg").toLowerCase();
    const path = `${generateId("img")}.${ext}`;

    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

    if (uploadError) {
      throw new Error(`[SupabaseStorageAdapter] Error al subir la imagen: ${uploadError.message}`);
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  },
};