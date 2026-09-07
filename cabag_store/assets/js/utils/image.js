// ============================================================
// UTILS — Image Optimization
// Redimensiona y comprime imágenes en el navegador (Canvas API)
// antes de subirlas a Supabase Storage o persistirlas.
// ============================================================

const DEFAULT_OPTIONS = {
  maxDimension: 1600,
  quality: 0.85,
  mimeType: "image/webp",
  fallbackMimeType: "image/jpeg",
};

/**
 * Carga un File en un elemento Image HTML en memoria
 * @param {File} file
 * @returns {Promise<HTMLImageElement>}
 */
function createImageElement(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`No se pudo decodificar el archivo de imagen "${file.name}".`));
    };
    img.src = url;
  });
}

/**
 * Convierte un elemento canvas a Blob de forma asíncrona
 * @param {HTMLCanvasElement} canvas
 * @param {string} mimeType
 * @param {number} quality
 * @returns {Promise<Blob | null>}
 */
function canvasToBlob(canvas, mimeType, quality) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
}

/**
 * Optimiza un archivo de imagen:
 * 1. Redimensiona proporcionalmente si el ancho o alto supera 1600px.
 * 2. Comprime con calidad 0.85 en formato WebP (con fallback a JPEG).
 * 3. Devuelve un nuevo objeto File listo para Storage y un DataURL para preview.
 *
 * @param {File} file - Archivo original seleccionado por el usuario
 * @param {Partial<typeof DEFAULT_OPTIONS>} [customOptions]
 * @returns {Promise<{ file: File, dataUrl: string, width: number, height: number }>}
 */
export async function optimizeImageFile(file, customOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...customOptions };

  if (!file || !file.type.startsWith("image/")) {
    throw new Error("El archivo seleccionado no es una imagen válida.");
  }

  const img = await createImageElement(file);

  let { naturalWidth: width, naturalHeight: height } = img;
  const max = opts.maxDimension;

  // Redimensionar proporcionalmente solo si supera el máximo
  if (width > max || height > max) {
    if (width > height) {
      height = Math.round((height * max) / width);
      width = max;
    } else {
      width = Math.round((width * max) / height);
      height = max;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("No se pudo inicializar el contexto de dibujo para optimizar la imagen.");
  }

  // Suavizado de alta calidad para preservar nitidez de telas y detalles
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);

  // Intentar exportar a WebP
  let blob = await canvasToBlob(canvas, opts.mimeType, opts.quality);
  let ext = "webp";

  // Fallback a JPEG si el navegador no soporta exportar a WebP
  if (!blob || blob.type !== opts.mimeType) {
    blob = await canvasToBlob(canvas, opts.fallbackMimeType, opts.quality);
    ext = "jpg";
  }

  if (!blob) {
    throw new Error(`Error al comprimir la imagen "${file.name}".`);
  }

  const originalName = file.name || "imagen";
  const baseName = originalName.lastIndexOf(".") !== -1
    ? originalName.substring(0, originalName.lastIndexOf("."))
    : originalName;
  const optimizedFileName = `${baseName}.${ext}`;

  const optimizedFile = new File([blob], optimizedFileName, {
    type: blob.type,
    lastModified: Date.now(),
  });

  const dataUrl = canvas.toDataURL(blob.type, opts.quality);

  return {
    file: optimizedFile,
    dataUrl,
    width,
    height,
  };
}
