# Ca & Bag. — Catálogo artesanal + Panel de administración

Sitio de e-commerce para "Ca & Bag.", un emprendimiento de productos
artesanales (bolsos, materas, cartucheras, neceseres y accesorios).
Incluye catálogo público con ficha de producto y un panel de
administración para gestionar el catálogo — todo construido en
**HTML, CSS y JavaScript puro** (ES Modules nativos, sin frameworks
ni build step).

---

## Tabla de contenidos

1. [Cómo correr el proyecto](#cómo-correr-el-proyecto)
2. [Acceso al panel de administración](#acceso-al-panel-de-administración)
3. [Estructura del proyecto](#estructura-del-proyecto)
4. [Arquitectura](#arquitectura)
5. [Funcionalidades](#funcionalidades)
6. [Limitaciones conocidas](#limitaciones-conocidas)
7. [Cómo migrar a un backend real](#cómo-migrar-a-un-backend-real)
8. [Próximos pasos sugeridos](#próximos-pasos-sugeridos)

---

## Cómo correr el proyecto

El proyecto no tiene dependencias ni build step, pero **usa ES Modules**
(`import`/`export`), y los navegadores no permiten cargarlos desde
`file://`. Por eso hace falta un servidor local, cualquiera de estos sirve:

| Herramienta | Comando |
|---|---|
| VS Code (recomendado) | Extensión **Live Server** → clic derecho sobre `index.html` → *Open with Live Server* |
| Node.js | `npx serve .` desde la raíz del proyecto |
| Python 3 | `python3 -m http.server 8000` desde la raíz del proyecto |

Luego abrí:
- **`index.html`** → catálogo público.
- **`admin/login.html`** → panel de administración.

No hace falta ninguna configuración adicional: al abrir el sitio por
primera vez, el catálogo se precarga automáticamente con 8 productos
de ejemplo (ver [`assets/js/data/seed-products.js`](assets/js/data/seed-products.js)).

## Acceso al panel de administración

```
URL:      admin/login.html
Usuario:  admin
Clave:    cabag2026
```

> ⚠️ **Esta autenticación es solo del lado del cliente.** Sirve para
> ocultar el panel de un usuario común que navegue el sitio, pero
> **no es seguridad real**: cualquiera con conocimientos técnicos
> podría saltearla inspeccionando el JavaScript. No debe usarse para
> proteger datos sensibles hasta reemplazarla por autenticación real
> (ver [Cómo migrar a un backend real](#cómo-migrar-a-un-backend-real)).

## Estructura del proyecto

```
cabag_store/
│
├── index.html                    # Catálogo público
├── producto.html                 # Detalle de producto (galería, relacionados)
│
├── admin/
│   ├── login.html                # Login del panel
│   └── dashboard.html            # Listado, alta, edición y borrado de productos
│
├── assets/
│   ├── css/
│   │   ├── variables.css         # Tokens de diseño: colores, radios, tipografía base
│   │   ├── base.css              # Reset, tipografía, header, footer, botones, toasts
│   │   ├── components.css        # Buscador, tarjeta de producto, skeleton loading
│   │   ├── public.css            # Hero, filtros, "por qué elegirnos", contacto
│   │   ├── product.css           # Galería y layout de producto.html
│   │   └── admin.css             # Login, dashboard, tabla, modal de producto
│   │
│   ├── js/
│   │   ├── config.js             # Constantes globales (categorías, WhatsApp, claves de storage)
│   │   │
│   │   ├── utils/
│   │   │   ├── format.js         # Formato de precio, generación de ids, fechas ISO
│   │   │   └── dom.js            # Selectores cortos, toasts, debounce, query params
│   │   │
│   │   ├── models/
│   │   │   └── Product.js        # Forma canónica del producto, normalización y validación
│   │   │
│   │   ├── data/
│   │   │   └── seed-products.js  # Datos de ejemplo (primera carga)
│   │   │
│   │   ├── services/             # Única capa que toca localStorage
│   │   │   ├── StorageAdapter.js # CRUD genérico sobre localStorage (interfaz basada en Promises)
│   │   │   ├── ProductService.js # Lógica de negocio de productos (filtros, imágenes, relacionados)
│   │   │   └── AuthService.js    # Login/logout/sesión del admin (client-side)
│   │   │
│   │   ├── components/
│   │   │   ├── productCard.js    # Tarjeta de producto reutilizable (catálogo + relacionados)
│   │   │   └── skeleton.js       # Placeholders animados de carga
│   │   │
│   │   ├── public/
│   │   │   ├── catalog.js        # Controlador de index.html
│   │   │   └── product.js        # Controlador de producto.html
│   │   │
│   │   └── admin/
│   │       ├── login.js          # Controlador de admin/login.html
│   │       ├── dashboard.js      # Controlador de admin/dashboard.html
│   │       └── product-form.js   # Modal de alta/edición (validación + gestión de imágenes)
│   │
│   └── images/                   # Reservado para assets estáticos propios (hoy vacío)
│
└── README.md
```

> **Nota:** se evaluó reorganizar `AuthService.js` en una carpeta
> `assets/js/auth/` separada y quitar `assets/js/models/`. Se decidió
> conservar la estructura real (`AuthService.js` dentro de `services/`,
> junto a `ProductService.js` y `StorageAdapter.js`; `models/` con la
> definición del producto) porque es la que usan todos los `import`
> del proyecto — reorganizarla habría implicado tocar archivos ya
> integrados sin ningún beneficio funcional.

## Arquitectura

Ninguna pantalla (catálogo, producto, admin) toca `localStorage`
directamente. Todas pasan por **`ProductService`**, que a su vez usa
**`StorageAdapter`** como única pieza que sabe que los datos viven en
`localStorage`:

```
UI (catalog.js · product.js · dashboard.js · product-form.js · login.js)
        ↓
ProductService / AuthService   (reglas de negocio, validaciones)
        ↓
StorageAdapter                 (CRUD genérico, interfaz basada en Promises)
        ↓
localStorage
```

Principios seguidos:

- **Separación por capas**: modelos (`models/`), acceso a datos
  (`services/`), componentes de UI reutilizables (`components/`) y
  controladores de página (`public/`, `admin/`) no se mezclan.
- **Una sola fuente de verdad por dato**: constantes en `config.js`,
  formato de precios en `utils/format.js`, forma del producto en
  `models/Product.js`.
- **CSS organizado por alcance**: `variables.css` (tokens) → `base.css`
  (global) → `components.css` (piezas de UI compartidas entre el sitio
  público y el admin, como la tarjeta de producto y el buscador) →
  hojas específicas por página (`public.css`, `product.css`, `admin.css`).
- **Interfaces listas para red**: tanto `StorageAdapter` como
  `AuthService` exponen métodos `async` que devuelven `Promise`,
  aunque hoy lean de `localStorage` de forma síncrona — para que
  cambiarlos por llamadas HTTP no obligue a tocar el resto del código.

## Funcionalidades

**Catálogo público (`index.html`)**
- Carga inicial con skeleton loading.
- Búsqueda por nombre (con debounce) y filtro por categoría.
- Estado "Agotado" (tarjeta atenuada, badge, botón deshabilitado).
- Botón de WhatsApp con mensaje prellenado por producto.

**Detalle de producto (`producto.html`)**
- Galería con flechas (ocultas si el producto tiene una sola imagen),
  miniaturas clickeables y swipe táctil en celulares.
- Precio, categoría, descripción completa y estado de stock.
- Productos relacionados (misma categoría).
- Lectura del `id` por query string (`producto.html?id=...`) y
  mensajes de error si falta el `id` o el producto no existe.

**Panel de administración (`admin/`)**
- Login protegido con `AuthService` (client-side).
- Dashboard con estadísticas (total, disponibles, agotados, categorías en uso).
- Listado de productos en tabla responsive (se adapta a tarjetas
  apiladas en celular), con búsqueda y filtros por categoría y estado.
- Alta y edición de productos en un mismo modal (`product-form.js`),
  con validación de nombre, categoría, precio e imágenes.
- Subida de múltiples imágenes (convertidas a base64 y guardadas junto
  al producto), reordenamiento (subir/bajar posición) y eliminación
  individual de cada imagen.
- Cambio rápido de disponibilidad con un switch, sin abrir el formulario.
- Eliminación de productos con modal de confirmación.
- Notificaciones (toasts) para cada acción: guardar, eliminar, cambiar
  disponibilidad, errores de validación o de lectura de archivos.

## Limitaciones conocidas

Estas limitaciones son esperables en una solución basada en
`localStorage` y quedan resueltas al migrar a un backend real:

- **Los datos son locales al navegador**: no hay sincronización entre
  dispositivos ni usuarios; cada navegador tiene su propio catálogo.
- **Cupo de almacenamiento limitado**: `localStorage` suele tener un
  límite de ~5-10 MB por sitio. Como las imágenes subidas se guardan
  como base64, catálogos con muchas imágenes en alta resolución
  pueden agotar ese cupo (la UI avisa con un toast si el guardado falla).
- **Autenticación del admin no apta para producción**: ver el aviso
  en [Acceso al panel de administración](#acceso-al-panel-de-administración).

## Cómo migrar a un backend real

### Datos de productos (Node.js + Express + PostgreSQL)

1. Crear un `ApiStorageAdapter` con los mismos métodos que
   `StorageAdapter` (`getAll`, `getById`, `create`, `update`, `remove`,
   `seedIfEmpty`...) pero que hagan `fetch()` a endpoints como
   `GET/POST/PUT/DELETE /api/productos`.
2. Reemplazar la instancia de `StorageAdapter` por `ApiStorageAdapter`
   dentro de `ProductService.js` — una sola línea.
3. Nada más cambia: `ProductService` ya devuelve `Promise`s con la
   misma forma, así que el catálogo, el detalle de producto y el
   admin siguen funcionando sin tocarse.

### Autenticación (JWT / sesiones)

`AuthService.js` ya expone la interfaz que necesitaría una
autenticación real (`login`, `logout`, `isAuthenticated`, `guard`):

1. `login()` pasaría a hacer `fetch('/api/auth/login', ...)` y
   guardar el token que devuelva el servidor en vez del token de demo.
2. `isAuthenticated()` pasaría a validar ese token (o consultar
   `/api/auth/me`).
3. Cada request a la API adjuntaría el token en el header `Authorization`.

Ninguna pantalla del admin necesita cambiar.

## Próximos pasos sugeridos

- Reemplazar `StorageAdapter` por un backend real (ver arriba).
- Autenticación real (JWT/sesiones) en `AuthService`.
- Subida de imágenes a un storage externo (en vez de base64 en `localStorage`).
- Pedidos online y pasarela de pagos, una vez exista backend.
