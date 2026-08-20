// ============================================================
// AUTH SERVICE
//
// ⚠️ Esto es una protección SOLO del lado del cliente: sirve para
// ocultar el panel de administración de un usuario común, pero
// NO es seguridad real (cualquiera con conocimientos técnicos
// podría saltearla editando el JS). No debe usarse todavía para
// proteger datos sensibles de verdad.
//
// Está diseñado para que reemplazarlo por autenticación real
// (JWT + backend Express) sea un cambio LOCAL a este archivo:
// - login() pasaría a hacer un fetch a POST /api/auth/login y
//   guardar el token que devuelva el servidor.
// - isAuthenticated() pasaría a validar ese token (o preguntarle
//   al backend con GET /api/auth/me).
// - Cada request a la API adjuntaría el token en el header
//   Authorization.
// Ninguna pantalla del admin necesita cambiar: todas dependen
// de estos mismos métodos (login, logout, isAuthenticated, guard).
// ============================================================

import { STORAGE_KEYS, CONFIG } from "../config.js";

// Credenciales de demo. TODO(backend): reemplazar por verificación
// contra el servidor — nunca credenciales hardcodeadas en el cliente.
const DEMO_CREDENTIALS = {
  usuario: "admin",
  clave: "cabag2026",
};

export const AuthService = {
  async login(usuario, clave) {
    const ok = usuario === DEMO_CREDENTIALS.usuario && clave === DEMO_CREDENTIALS.clave;
    if (!ok) return { success: false, message: "Usuario o contraseña incorrectos." };

    const session = {
      token: `demo-token-${Date.now()}`, // TODO(backend): token real (JWT) emitido por el servidor
      usuario,
      expiresAt: Date.now() + CONFIG.ADMIN_SESSION_MINUTES * 60 * 1000,
    };
    sessionStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
    return { success: true };
  },

  logout() {
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
  },

  isAuthenticated() {
    const raw = sessionStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (!raw) return false;
    try {
      const session = JSON.parse(raw);
      if (Date.now() > session.expiresAt) {
        this.logout();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  currentUser() {
    const raw = sessionStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (!raw) return null;
    try {
      return JSON.parse(raw).usuario;
    } catch {
      return null;
    }
  },

  /** Llamar al principio de cada página protegida del admin */
  guard({ redirectTo = "login.html" } = {}) {
    if (!this.isAuthenticated()) {
      window.location.href = redirectTo;
    }
  },
};
