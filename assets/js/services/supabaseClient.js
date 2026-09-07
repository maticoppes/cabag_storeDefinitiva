// ============================================================
// SUPABASE CLIENT
//
// Única pieza del proyecto que inicializa el cliente de supabase-js.
// Nadie más debería llamar a createClient(): todo lo que necesite
// hablar con Supabase importa el `supabase` que exporta este archivo
// (hoy solo SupabaseStorageAdapter.js).
//
// El proyecto no usa npm/build step (HTML + CSS + JS puro con
// <script type="module">), así que supabase-js se importa desde un
// CDN que sirve el paquete como ES Module. Si en el futuro el
// proyecto suma un bundler, esta línea es la única que habría que
// cambiar por `import { createClient } from "@supabase/supabase-js"`.
//
// Este archivo solo se carga cuando hace falta (import dinámico desde
// SupabaseStorageAdapter.js, que a su vez ProductService solo importa
// si CONFIG.DATA_SOURCE === "supabase"). Con DATA_SOURCE en
// "localStorage" (el valor por defecto), este archivo nunca se
// ejecuta y el resto del sitio sigue funcionando exactamente igual
// que antes de este módulo.
// ============================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CONFIG } from "../config.js";

if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY) {
  throw new Error(
    'Faltan las credenciales de Supabase. Completá SUPABASE_URL y SUPABASE_ANON_KEY ' +
      "en assets/js/config.js (Project Settings → API en tu proyecto Supabase) antes de " +
      'usar CONFIG.DATA_SOURCE = "supabase".'
  );
}

// SUPABASE_ANON_KEY es la "anon"/"publishable" key: está pensada para
// exponerse en el cliente y queda sujeta a las políticas de RLS de
// cada tabla. Nunca poner acá la "service_role" key.
export const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);