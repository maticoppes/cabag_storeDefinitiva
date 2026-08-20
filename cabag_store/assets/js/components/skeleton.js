// ============================================================
// COMPONENTE — Skeleton loading
// Placeholder animado que se muestra mientras se resuelve la
// carga de productos (hoy desde localStorage; más adelante
// desde una API, donde la latencia lo hace más necesario todavía).
// ============================================================

export function skeletonCardsHtml(count = 8) {
  return Array.from({ length: count })
    .map(
      () => `
      <div class="skeleton-card" aria-hidden="true">
        <div class="skeleton-block skeleton-media"></div>
        <div class="skeleton-block skeleton-line" style="width:70%"></div>
        <div class="skeleton-block skeleton-line" style="width:40%"></div>
        <div class="skeleton-block skeleton-line" style="width:90%"></div>
        <div class="skeleton-block skeleton-line" style="width:60%"></div>
      </div>`
    )
    .join("");
}
