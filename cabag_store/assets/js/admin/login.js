// ============================================================
// PÁGINA — Login del admin (admin/login.html)
// Toda la verificación de credenciales vive en AuthService;
// este archivo solo se ocupa del formulario y la UI.
// ============================================================

import { AuthService } from "../services/AuthService.js";
import { qs } from "../utils/dom.js";

const form = qs("#loginForm");
const usuarioInput = qs("#usuario");
const claveInput = qs("#clave");
const submitBtn = qs("#loginSubmit");
const formError = qs("#formError");

function setFieldError(fieldId, hasError) {
  qs(`#${fieldId}`).classList.toggle("has-error", hasError);
}

function showFormError(message) {
  formError.textContent = message;
  formError.classList.toggle("show", Boolean(message));
}

function validate() {
  const errors = {};
  if (!usuarioInput.value.trim()) errors.usuario = true;
  if (!claveInput.value) errors.clave = true;

  setFieldError("fieldUsuario", Boolean(errors.usuario));
  setFieldError("fieldClave", Boolean(errors.clave));

  return Object.keys(errors).length === 0;
}

// Si ya hay sesión activa, saltear directo al dashboard
if (await AuthService.isAuthenticated()) {
  window.location.href = "dashboard.html";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  showFormError("");

  if (!validate()) return;

  submitBtn.disabled = true;
  submitBtn.textContent = "Ingresando...";

  const result = await AuthService.login(usuarioInput.value.trim(), claveInput.value);

  if (result.success) {
    window.location.href = "dashboard.html";
    return;
  }

  showFormError(result.message || "No pudimos iniciar sesión.");
  submitBtn.disabled = false;
  submitBtn.textContent = "Ingresar";
});
