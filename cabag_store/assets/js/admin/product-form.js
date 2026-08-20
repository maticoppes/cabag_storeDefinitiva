// ============================================================
// COMPONENTE — Formulario de producto (crear / editar)
// Encapsula el modal de alta y edición: valida los campos,
// gestiona la subida/orden/borrado de imágenes, y guarda a
// través de ProductService. dashboard.js solo llama a
// open(producto) / open() y recibe un callback cuando se guarda.
// ============================================================

import { ProductService } from "../services/ProductService.js";
import { CONFIG } from "../config.js";
import { generateId } from "../utils/format.js";
import { qs, toast } from "../utils/dom.js";

const ICON_UP = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 19V5M5 12l7-7 7 7"/></svg>`;
const ICON_DOWN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14M5 12l7 7 7-7"/></svg>`;
const ICON_REMOVE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 6l12 12M18 6L6 18"/></svg>`;

export function initProductForm({ onSaved }) {
  const els = {
    modal: qs("#productModal"),
    form: qs("#productForm"),
    title: qs("#modalTitle"),
    closeBtn: qs("#modalClose"),
    cancelBtn: qs("#modalCancel"),
    submitBtn: qs("#productSubmit"),
    errorBanner: qs("#productFormError"),

    idInput: qs("#productId"),
    nombreInput: qs("#nombre"),
    categoriaSelect: qs("#categoria"),
    precioInput: qs("#precio"),
    descripcionInput: qs("#descripcion"),
    disponibleInput: qs("#disponible"),

    imageInput: qs("#imageInput"),
    imageList: qs("#imageList"),
  };

  let editingId = null;
  let images = []; // { id, url, order }

  populateCategories();

  function populateCategories() {
    const options = CONFIG.CATEGORIES.map((cat) => `<option value="${cat}">${cat}</option>`).join("");
    els.categoriaSelect.insertAdjacentHTML("beforeend", options);
  }

  function resetForm() {
    editingId = null;
    images = [];
    els.form.reset();
    els.idInput.value = "";
    els.disponibleInput.checked = true;
    clearErrors();
    renderImages();
  }

  function clearErrors() {
    els.errorBanner.classList.remove("show");
    els.errorBanner.textContent = "";
    ["fieldNombre", "fieldCategoria", "fieldPrecio", "fieldImagenes"].forEach((id) =>
      qs(`#${id}`).classList.remove("has-error")
    );
  }

  function applyFieldErrors(errors = {}) {
    clearErrors();
    if (errors.nombre) qs("#fieldNombre").classList.add("has-error");
    if (errors.categoria) qs("#fieldCategoria").classList.add("has-error");
    if (errors.precio) qs("#fieldPrecio").classList.add("has-error");
    if (errors.imagenes) qs("#fieldImagenes").classList.add("has-error");
  }

  // ---- Gestión de imágenes ----

  function renderImages() {
    els.imageList.innerHTML = images
      .map(
        (img, index) => `
        <div class="image-item" data-index="${index}">
          <div class="image-item-thumb">
            ${index === 0 ? '<span class="image-item-cover-tag">Portada</span>' : ""}
            <img src="${img.url}" alt="">
          </div>
          <div class="image-item-controls">
            <button type="button" class="move-up" title="Subir orden" ${index === 0 ? "disabled" : ""}>${ICON_UP}</button>
            <button type="button" class="move-down" title="Bajar orden" ${index === images.length - 1 ? "disabled" : ""}>${ICON_DOWN}</button>
            <button type="button" class="remove" title="Eliminar imagen">${ICON_REMOVE}</button>
          </div>
        </div>`
      )
      .join("");

    els.imageList.querySelectorAll(".image-item").forEach((item) => {
      const index = Number(item.dataset.index);
      item.querySelector(".move-up")?.addEventListener("click", () => moveImage(index, -1));
      item.querySelector(".move-down")?.addEventListener("click", () => moveImage(index, 1));
      item.querySelector(".remove").addEventListener("click", () => removeImage(index));
    });
  }

  function moveImage(index, delta) {
    const target = index + delta;
    if (target < 0 || target >= images.length) return;
    [images[index], images[target]] = [images[target], images[index]];
    // Sin esto, normalizeImages (Product.js) ordena por el campo `order`
    // de cada imagen -no por su posición en este array- y el intercambio
    // de arriba se pierde al guardar.
    images.forEach((img, i) => { img.order = i; });
    renderImages();
  }

  function removeImage(index) {
    images.splice(index, 1);
    renderImages();
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  async function handleFileSelection(fileList) {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) return;

    let loaded;
    try {
      loaded = await Promise.all(files.map(readFileAsDataUrl));
    } catch (err) {
      // Logueamos el error real: antes se descartaba y el toast genérico
      // no permitía saber si la falla era de lectura, de memoria, etc.
      console.error("[product-form] Error al leer un archivo de imagen:", err);
      toast("No pudimos leer una de las imágenes seleccionadas.", { type: "error" });
      return;
    }

    // `file` se guarda para subir el archivo real a Storage recién al
    // guardar (ver resolveImagesForSave en ProductService). Con
    // localStorage se ignora: la data: URL en `url` ya es la definitiva.
    loaded.forEach((url, i) => images.push({ id: generateId("img"), url, order: images.length, file: files[i] }));
    renderImages();
  }

  els.imageInput.addEventListener("change", async (e) => {
    await handleFileSelection(e.target.files);
    e.target.value = ""; // permite volver a elegir el mismo archivo si se borró antes
  });

  // ---- Abrir / cerrar modal ----

  function open(product = null) {
    resetForm();

    if (product) {
      editingId = product.id;
      els.title.textContent = "Editar producto";
      els.submitBtn.textContent = "Guardar cambios";
      els.idInput.value = product.id;
      els.nombreInput.value = product.nombre;
      els.categoriaSelect.value = product.categoria;
      els.precioInput.value = product.precio;
      els.descripcionInput.value = product.descripcion;
      els.disponibleInput.checked = product.disponible;
      images = product.imagenes.map((img) => ({ ...img }));
    } else {
      els.title.textContent = "Agregar producto";
      els.submitBtn.textContent = "Guardar producto";
    }

    renderImages();
    els.modal.hidden = false;
    els.nombreInput.focus();
  }

  function close() {
    els.modal.hidden = true;
  }

  els.closeBtn.addEventListener("click", close);
  els.cancelBtn.addEventListener("click", close);
  els.modal.addEventListener("click", (e) => {
    if (e.target === els.modal) close();
  });

  // ---- Guardado ----

  els.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();

    const data = {
      nombre: els.nombreInput.value,
      categoria: els.categoriaSelect.value,
      precio: Number(els.precioInput.value),
      descripcion: els.descripcionInput.value,
      disponible: els.disponibleInput.checked,
      imagenes: images,
    };

    els.submitBtn.disabled = true;
    const originalLabel = els.submitBtn.textContent;
    els.submitBtn.textContent = "Guardando...";

    try {
      try {
        data.imagenes = await ProductService.resolveImagesForSave(images);
      } catch (uploadErr) {
        console.error("[product-form] Error al subir una imagen:", uploadErr);
        toast("No pudimos subir una de las imágenes. Probá de nuevo.", { type: "error" });
        return;
      }

      if (editingId) {
        await ProductService.update(editingId, data);
        toast("Producto actualizado correctamente.");
      } else {
        await ProductService.create(data);
        toast("Producto creado correctamente.");
      }
      close();
      onSaved?.();
    } catch (err) {
      if (err.fieldErrors) {
        applyFieldErrors(err.fieldErrors);
        els.errorBanner.textContent = "Revisá los campos marcados antes de guardar.";
        els.errorBanner.classList.add("show");
      } else {
        toast("Ocurrió un error al guardar el producto.", { type: "error" });
      }
    } finally {
      els.submitBtn.disabled = false;
      els.submitBtn.textContent = originalLabel;
    }
  });

  return { open, close };
}