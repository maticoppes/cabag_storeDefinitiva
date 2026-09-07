// ============================================================
// UTILS — formato
// Funciones puras, sin dependencias de otros módulos del proyecto.
// ============================================================

const priceFormatter = new Intl.NumberFormat("es-AR");

export function formatPrice(value) {
  return `$${priceFormatter.format(Number(value) || 0)}`;
}

/**
 * Genera un id único razonable sin dependencias externas.
 * Cuando haya backend real, el id lo va a generar la base de datos
 * y esta función deja de usarse — por eso vive aislada acá.
 */
export function generateId(prefix = "id") {
  const rand = Math.random().toString(36).slice(2, 9);
  const time = Date.now().toString(36);
  return `${prefix}_${time}_${rand}`;
}

export function nowIso() {
  return new Date().toISOString();
}
