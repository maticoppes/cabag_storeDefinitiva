// ============================================================
// AUTH SERVICE
//
// Login del panel de administración. Igual patrón que ProductService/
// SupabaseStorageAdapter: rama según CONFIG.DATA_SOURCE.
//
// - DATA_SOURCE === "localStorage" (default): protección SOLO del
//   lado del cliente (DEMO_CREDENTIALS hardcodeadas + sessionStorage).
//   NO es seguridad real — sirve para ocultar el panel de un usuario
//   común, cualquiera con conocimientos técnicos podría saltearla
//   editando el JS. Sin cambios de comportamiento en este módulo.
//
// - DATA_SOURCE === "supabase": autenticación real contra Supabase
//   Auth (supabase.auth.signInWithPassword/signOut/getSession), por
//   email + password. La sesión la persiste y valida el propio SDK
//   de Supabase (no sessionStorage propio en esta rama).
//
// Import dinámico a propósito: si DATA_SOURCE se queda en
// "localStorage", supabaseClient.js nunca se carga, igual que en
// ProductService/SupabaseStorageAdapter — cero riesgo para quien no
// migró Auth todavía.
//
// Interfaz pública sin cambios (login, logout, isAuthenticated,
// currentUser, guard), pero ahora TODAS son async: supabase-js no
// tiene forma síncrona de confirmar una sesión real. Los únicos
// call sites que necesitaron tocarse por esto son login.js y
// dashboard.js (agregar `await`/`async`, nada de lógica nueva).
// ============================================================

import { STORAGE_KEYS, CONFIG } from "../config.js";

// Credenciales de demo (rama localStorage únicamente).
const DEMO_CREDENTIALS = {
  usuario: "admin",
  clave: "cabag2026",
};

async function getSupabaseAuth() {
  if (CONFIG.DATA_SOURCE !== "supabase") return null;
  const { supabase } = await import("./supabaseClient.js");
  return supabase.auth;
}

export const AuthService = {
  /**
   * `usuario`: usuario de demo en la rama localStorage, email en la
   * rama Supabase (Supabase Auth por email/password).
   */
  async login(usuario, clave) {
    const auth = await getSupabaseAuth();

    if (auth) {
      const { error } = await auth.signInWithPassword({ email: usuario, password: clave });
      if (error) return { success: false, message: "Usuario o contraseña incorrectos." };
      return { success: true };
    }

    const ok = usuario === DEMO_CREDENTIALS.usuario && clave === DEMO_CREDENTIALS.clave;
    if (!ok) return { success: false, message: "Usuario o contraseña incorrectos." };

    const session = {
      token: `demo-token-${Date.now()}`,
      usuario,
      expiresAt: Date.now() + CONFIG.ADMIN_SESSION_MINUTES * 60 * 1000,
    };
    sessionStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
    return { success: true };
  },

  async logout() {
    const auth = await getSupabaseAuth();
    if (auth) {
      await auth.signOut();
      return;
    }
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
  },

  async isAuthenticated() {
    const auth = await getSupabaseAuth();
    if (auth) {
      const { data } = await auth.getSession();
      return Boolean(data.session);
    }

    const raw = sessionStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (!raw) return false;
    try {
      const session = JSON.parse(raw);
      if (Date.now() > session.expiresAt) {
        await this.logout();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  async currentUser() {
    const auth = await getSupabaseAuth();
    if (auth) {
      const { data } = await auth.getSession();
      return data.session?.user?.email || null;
    }

    const raw = sessionStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (!raw) return null;
    try {
      return JSON.parse(raw).usuario;
    } catch {
      return null;
    }
  },

  /** Llamar al principio de cada página protegida del admin */
  async guard({ redirectTo = "login.html" } = {}) {
    const isAuth = await this.isAuthenticated();
    if (!isAuth) {
      window.location.href = redirectTo;
      return false;
    }
    return true;
  },
};