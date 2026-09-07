// ============================================================
// SEED DATA
// Datos de ejemplo que se cargan una única vez en localStorage
// si todavía no hay productos guardados (ver ProductService.ensureSeeded).
// El día que haya backend, este archivo deja de usarse: los datos
// van a vivir en la base de datos y llegarán vía API.
// ============================================================

function imgs(seed, colors) {
  return colors.map((c) => ({ url: `https://placehold.co/700x700/${c}?text=${encodeURIComponent(seed)}` }));
}

export const SEED_PRODUCTS = [
  {
    nombre: "Bolso Tote Lino Natural",
    categoria: "Bolsos",
    precio: 85000,
    descripcion:
      "Bolso amplio en lino natural con asas reforzadas, ideal para el día a día. Interior con bolsillo para celular y llaves, base reforzada para mayor durabilidad.",
    disponible: true,
    imagenes: imgs("Bolso+Tote", ["ede4d3/8a6a4a", "e3d5bd/8a6a4a", "d9c9a8/6f5a3f"]),
  },
  {
    nombre: "Matera Tejida Bohemia",
    categoria: "Materas",
    precio: 42000,
    descripcion:
      "Matera en tela de algodón tejida a mano, con estilo bohemio y correas ajustables. Ideal para el mate de todos los días.",
    disponible: true,
    imagenes: imgs("Matera+Tejida", ["e3ddce/6f6656", "d6cdb8/6f6656"]),
  },
  {
    nombre: "Cartuchera Floral Patchwork",
    categoria: "Cartucheras",
    precio: 38000,
    descripcion:
      "Cartuchera con diseño patchwork floral y detalle de flecos tejidos a mano. Cierre de cremallera resistente.",
    disponible: true,
    imagenes: imgs("Cartuchera", ["d9ceb8/7a6142", "cabf9f/7a6142", "bdb08e/5f4d31"]),
  },
  {
    nombre: "Neceser Viajero Crema",
    categoria: "Neceseres",
    precio: 55000,
    descripcion:
      "Neceser con compartimentos internos, ideal para organizar tus productos de viaje. Tela impermeable en el interior.",
    disponible: false,
    imagenes: imgs("Neceser", ["e6e0f0/5f5578"]),
  },
  {
    nombre: "Bolso Crossbody Terracota",
    categoria: "Bolsos",
    precio: 72000,
    descripcion:
      "Bolso cruzado en tela de lona gruesa color terracota con correa ajustable. Compartimento interno con cierre.",
    disponible: true,
    imagenes: imgs("Crossbody", ["8a5a3c/f5ede1", "9c6a48/f5ede1"]),
  },
  {
    nombre: "Matera Cactus Primavera",
    categoria: "Materas",
    precio: 38000,
    descripcion: "Matera en tela estampada con flores primaverales, perfecta para plantas pequeñas.",
    disponible: true,
    imagenes: imgs("Matera+Cactus", ["e8e2d5/6f6656", "dcd4c2/6f6656"]),
  },
  {
    nombre: "Cartera Mini Artesanal",
    categoria: "Accesorios",
    precio: 65000,
    descripcion: "Mini cartera en tela de algodón con bordado a mano y cadena dorada desmontable.",
    disponible: true,
    imagenes: imgs("Cartera+Mini", ["9fae9c/2e3a2c", "8a9c87/2e3a2c", "7c8f79/1f291d"]),
  },
  {
    nombre: "Neceser Doble Oliva",
    categoria: "Neceseres",
    precio: 48000,
    descripcion: "Neceser doble en tela de algodón color oliva, con dos compartimentos y cierre YKK.",
    disponible: true,
    imagenes: imgs("Neceser+Oliva", ["6b7d5e/eef2e6", "5c6d50/eef2e6"]),
  },
];
