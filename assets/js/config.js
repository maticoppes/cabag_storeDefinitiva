// ============================================================
// CONFIG — valores globales de la app.
// Centralizar esto acá permite cambiar de localStorage a un
// backend real tocando un solo lugar más adelante.
// ============================================================

export const CONFIG = {
  WHATSAPP_NUMBER: "+543447467921",
  INSTAGRAM_URL: "https://www.instagram.com/cabag_store/",
  STORAGE_PREFIX: "cabag_store",
  CATEGORIES: ["Bolsos", "Mochilas", "Materas", "Cartucheras", "Neceseres", "Accesorios"],
  ADMIN_SESSION_MINUTES: 60,

  // ---- Migración a Supabase (en curso, ver services/SupabaseStorageAdapter.js) ----
  // "localStorage" (default, comportamiento actual sin cambios) | "supabase" (lectura de prueba).
  // Cambiar a "supabase" solo afecta getAll/getById/getRelated de ProductService.
  // Crear, editar, eliminar e imágenes siguen escribiendo en localStorage por ahora.
  DATA_SOURCE: "supabase",

  // Completar acá con los datos de tu proyecto Supabase (Project Settings → API).
  // Usar SIEMPRE la "anon" / "publishable" key. NUNCA la "service_role" key ni
  // ninguna clave secreta: este archivo se sirve tal cual al navegador.
  SUPABASE_URL: "https://qctnddniezydbswrytja.supabase.co", // ej: "https://xxxxxxxxxxxx.supabase.co"
  SUPABASE_ANON_KEY: "sb_publishable_j_mbGs8v0ofmH1_q0_yhZQ_J36bxq4Q", // ej: "eyJhbGciOi..."

  // Bucket de Supabase Storage donde se suben las imágenes de producto.
  // Ver supabase/sql/002_inspect_before_images_setup.sql (inspección,
  // correr primero) y supabase/sql/003_product_images_and_storage_setup.sql
  // (crea el bucket y las policies, correr después de revisar el punto 1).
  SUPABASE_STORAGE_BUCKET: "product-images",
};

export const STORAGE_KEYS = {
  PRODUCTS: `${CONFIG.STORAGE_PREFIX}_products`,
  AUTH_SESSION: `${CONFIG.STORAGE_PREFIX}_admin_session`,
};