# Ca & Bag. — Tienda Online Artesanal y Panel de Gestión

Aplicación web de comercio electrónico y gestión de catálogo desarrollada para **Ca & Bag.**, un emprendimiento familiar enfocado en la confección artesanal de bolsos, mochilas, materas, cartucheras, neceseres y accesorios textiles.

El proyecto cumple un doble propósito: es una **solución funcional y real** diseñada para la operatoria cotidiana del negocio y, a la vez, una **pieza de portfolio profesional** que demuestra buenas prácticas de arquitectura de software, seguridad en backend as a service y desarrollo frontend moderno sin frameworks.

---

## 📸 Capturas de pantalla

<!-- Espacio reservado para incorporar capturas visuales de la aplicación -->

| Catálogo Público | Detalle de Producto |
| :---: | :---: |
| *[ Captura: Catálogo público con filtros y búsqueda ]* | *[ Captura: Ficha de producto y galería interactiva ]* |

| Panel de Administración | Formulario y Gestión de Imágenes |
| :---: | :---: |
| *[ Captura: Dashboard con métricas y tabla de productos ]* | *[ Captura: Modal de edición y carga optimizada de fotos ]* |

---

## 🛠️ Tecnologías utilizadas

El proyecto fue construido priorizando estándares web nativos, rendimiento y mantenibilidad, evitando sobrecarga de dependencias:

* **Frontend:**
  * **HTML5:** Estructura semántica, accesibilidad y soporte responsive.
  * **CSS3:** Tokens de diseño mediante Custom Properties (variables), Flexbox, CSS Grid y micro-interacciones fluidas.
  * **JavaScript (ES Modules nativos):** Modularidad pura (`import`/`export`), programación asíncrona (`async`/`await`) y manipulación eficiente del DOM.
* **Backend y Persistencia (BaaS):**
  * **Supabase:** Plataforma backend basada en tecnologías abiertas.
  * **PostgreSQL:** Base de datos relacional para productos e imágenes.
  * **Supabase Auth:** Autenticación y gestión de sesiones seguras para el administrador.
  * **Supabase Storage:** Almacenamiento en la nube para activos multimedia (bucket `product-images`).
  * **Row Level Security (RLS):** Control de acceso granular a nivel de fila y objeto.
* **Control de versiones:** Git y GitHub.

---

## 🚀 Funcionalidades

### Catálogo Público
* **Exploración de productos:** Cuadrícula responsive con tarjetas informativas y badges de estado.
* **Búsqueda en tiempo real:** Búsqueda por coincidencia de texto con *debounce* para optimizar el rendimiento.
* **Filtros por categoría dinámicos:** Generación automática de filtros (*Bolsos, Mochilas, Materas, Cartucheras, Neceseres, Accesorios*) sincronizados con la configuración global.
* **Detalle de producto:** Página individual (`producto.html?id=...`) con descripción completa, precio y control de stock.
* **Galería interactiva:** Visualizador de imágenes con navegación por flechas, miniaturas interactivas, contador y gestos táctiles (*swipe*) en dispositivos móviles.
* **Productos relacionados:** Recomendaciones automáticas basadas en la misma categoría.
* **Estados de disponibilidad:** Indicadores visuales de stock ("Disponible" / "Agotado") e inhabilitación dinámica de consultas en productos sin existencias.
* **Canales de contacto directo:**
  * Enlace directo a WhatsApp con mensaje contextualizado y prellenado con los datos del producto de interés.
  * Acceso directo al perfil de Instagram oficial del negocio.
* **Estados de carga:** Tarjetas con animación *skeleton loading* durante la consulta a la base de datos.

### Panel de Administración (`/admin`)
* **Autenticación segura:** Acceso restringido mediante inicio de sesión autenticado contra Supabase Auth.
* **Dashboard y métricas:** Resumen en tiempo real del catálogo (total de productos, artículos disponibles, productos agotados y categorías activas).
* **Gestión de inventario (CRUD completo):**
  * Creación de nuevos productos con validaciones de formulario.
  * Edición integral de datos (título, precio, categoría, descripción, estado).
  * Conmutador rápido de disponibilidad (*switch* directo en la tabla).
  * Eliminación de productos con diálogo modal de confirmación.
* **Gestión avanzada de imágenes:**
  * Subida de múltiples fotos por producto.
  * Reordenamiento de imágenes (*subir/bajar posición*) con asignación automática de foto de portada.
  * Eliminación individual de fotografías antes y durante la edición.
* **Feedback operativo:** Notificaciones flotantes (*toasts*) para confirmar acciones o reportar errores.

### Procesamiento y Optimización de Imágenes
* **Optimización en el cliente (Browser Canvas API):** Cada fotografía seleccionada por el administrador es procesada localmente en el navegador antes de iniciar la subida a la nube.
* **Redimensionamiento inteligente:** Las imágenes que superan los **1600 px** en su lado mayor son escaladas proporcionalmente, preservando la nitidez de telas y texturas artesanales.
* **Compresión a WebP:** Conversión automática a formato **WebP** con calidad `0.85` (con fallback transparente a JPEG en navegadores que lo requieran), logrando reducciones de peso superiores al 90% (de 5–15 MB a 100–250 KB) para cargas ultrarrápidas en redes móviles.
* **Persistencia relacional:** Almacenamiento de archivos en Supabase Storage y vinculación de URLs y orden en la tabla `public.product_images`.

---

## 🏛️ Arquitectura del Software

El sistema sigue una arquitectura por capas desacopladas que favorece la separación de responsabilidades y permite reemplazar componentes sin afectar las interfaces de usuario:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Capa de Presentación (UI)                       │
│     catalog.js · product.js · dashboard.js · product-form.js · login.js│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Capa de Negocio y Servicios                     │
│               ProductService.js       │       AuthService.js           │
│     (Validaciones, filtros, orquestación) (Sesión y autenticación)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         Capa de Acceso a Datos                         │
│               SupabaseStorageAdapter.js · supabaseClient.js             │
│        (Mapeo de entidades, consultas SQL, subida a Storage)           │
│        [StorageAdapter.js disponible para fallback local opcional]     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                           Backend (Supabase)                           │
│  PostgreSQL (products · product_images) │ Storage (product-images)     │
└────────────────────────────────────────────────────────────────────────┘
```

### Principios de diseño aplicados:
* **Separación de responsabilidades:** La interfaz de usuario nunca ejecuta consultas directas a Supabase ni interactúa con APIs de almacenamiento; siempre delega en `ProductService` y `AuthService`.
* **Patrón Adaptador:** `SupabaseStorageAdapter` traduce las filas y tablas de PostgreSQL al modelo de datos unificado `Product.js`.
* **Fuente única de verdad:** Constantes globales, URLs de contacto y categorías centralizadas en [assets/js/config.js](assets/js/config.js).
* **Módulos utilitarios puros:** Funciones de formateo monetario, manipulación DOM y compresión de imágenes encapsuladas en `assets/js/utils/`.

---

## 📁 Estructura del proyecto

```text
cabag_store/
├── index.html                    # Catálogo público y portada principal
├── producto.html                 # Ficha detallada de producto
├── .gitignore                    # Reglas de exclusión para Git y secretos
├── README.md                     # Documentación general del proyecto
│
├── admin/
│   ├── login.html                # Formulario de autenticación administrativa
│   └── dashboard.html            # Panel de control, métricas y modal de gestión
│
├── assets/
│   ├── css/
│   │   ├── variables.css         # Tokens de diseño (paleta cromática, tipografías, radios)
│   │   ├── base.css              # Reset, tipografía, header, footer y toasts globales
│   │   ├── components.css        # Tarjeta de producto, buscador y skeleton screens
│   │   ├── public.css            # Secciones públicas: hero, filtros y contacto
│   │   ├── product.css           # Galería interactiva y ficha de producto.html
│   │   └── admin.css             # Estilos del panel, tabla responsive y formularios
│   │
│   ├── js/
│   │   ├── config.js             # Configuración central (Supabase, WhatsApp, categorías)
│   │   │
│   │   ├── utils/
│   │   │   ├── format.js         # Formateo de moneda (ARS), fechas ISO e IDs
│   │   │   ├── dom.js            # Helpers de manipulación del DOM, toasts, debounce
│   │   │   └── image.js          # Optimización de imágenes en Canvas (WebP, max 1600px)
│   │   │
│   │   ├── models/
│   │   │   └── Product.js        # Definición del modelo, normalización y validaciones
│   │   │
│   │   ├── data/
│   │   │   └── seed-products.js  # Catálogo inicial de prueba y demostración
│   │   │
│   │   ├── services/
│   │   │   ├── supabaseClient.js         # Inicialización del cliente Supabase JS
│   │   │   ├── SupabaseStorageAdapter.js # Adaptador de persistencia con Supabase
│   │   │   ├── StorageAdapter.js         # Adaptador para almacenamiento local (fallback)
│   │   │   ├── ProductService.js         # Lógica de negocio y orquestación de productos
│   │   │   └── AuthService.js            # Gestión de autenticación y estado de sesión
│   │   │
│   │   ├── components/
│   │   │   ├── productCard.js    # Componente reutilizable de tarjeta de catálogo
│   │   │   └── skeleton.js       # Plantillas animadas de carga
│   │   │
│   │   ├── public/
│   │   │   ├── catalog.js        # Controlador del catálogo público (index.html)
│   │   │   └── product.js        # Controlador de la vista de producto (producto.html)
│   │   │
│   │   └── admin/
│   │       ├── login.js          # Controlador de la pantalla de login
│   │       ├── dashboard.js      # Controlador de métricas y tabla del panel
│   │       └── product-form.js   # Controlador del modal de alta/edición y fotos
│   │
│   └── images/
│       └── README.md             # Guía para incorporación de recursos gráficos estáticos
│
└── supabase/
    └── sql/
        ├── 001_set_updated_at_trigger.sql        # Trigger automático para timestamp updated_at
        ├── 002_inspect_before_images_setup.sql   # Consultas de verificación de esquema y policies
        ├── 003_product_images_and_storage_setup.sql # Creación de bucket y estructura inicial
        └── 004_fix_images_and_storage_rls.sql    # Políticas RLS definitivas de seguridad
```

---

## 🔒 Seguridad y Control de Acceso (RLS)

El proyecto implementa un modelo de seguridad robusto basado en el principio de mínimo privilegio:

1. **Autenticación:** Las credenciales nunca se evalúan en el cliente; se validan directamente en el servidor de Supabase Auth mediante tokens de sesión.
2. **Row Level Security (RLS) en Base de Datos:**
   * `public.products`: Lectura pública (`anon`, `authenticated`) para que cualquier visitante consulte el catálogo. Operaciones de escritura (`INSERT`, `UPDATE`, `DELETE`) restringidas únicamente al rol `authenticated`.
   * `public.product_images`: Lectura pública para renderizado de fotografías; inserción, actualización y borrado restringidos exclusivamente a usuarios `authenticated`.
3. **Seguridad en Supabase Storage:**
   * Bucket `product-images`: Permiso de lectura pública (`SELECT`) para visualización directa en etiquetas `<img>`. Políticas de `INSERT` y `DELETE` bloqueadas para accesos anónimos y habilitadas únicamente para el administrador autenticado.
4. **Protección de Credenciales:**
   * El frontend utiliza únicamente la clave pública anónima (`anon / publishable key`), cuya operativa está estrictamente limitada por las políticas RLS.
   * **Nunca** se utiliza ni se incluye la clave secreta con privilegios elevados (`service_role key`) en el código del cliente.

---

## ⚙️ Configuración de Supabase

Para desplegar o replicar la infraestructura backend en un nuevo entorno:

1. **Crear un proyecto en Supabase:** Acceder a [supabase.com](https://supabase.com) y crear un proyecto.
2. **Ejecutar scripts SQL:** En la sección **SQL Editor** del dashboard de Supabase, ejecutar en orden los scripts ubicados en la carpeta `supabase/sql/`:
   * `001_set_updated_at_trigger.sql` (automatización de fecha de actualización).
   * `003_product_images_and_storage_setup.sql` (creación del bucket `product-images` y tablas).
   * `004_fix_images_and_storage_rls.sql` (aplicación de políticas de seguridad RLS definitivas).
3. **Crear usuario administrador:** En la sección **Authentication → Users**, registrar la cuenta de correo y contraseña del administrador.
4. **Vincular el frontend:** En el archivo `assets/js/config.js`, completar con los datos de conexión provistos en **Project Settings → API**:
   ```javascript
   export const CONFIG = {
     DATA_SOURCE: "supabase",
     SUPABASE_URL: "https://TU_PROYECTO.supabase.co",
     SUPABASE_ANON_KEY: "TU_CLAVE_PUBLICA_ANON",
     SUPABASE_STORAGE_BUCKET: "product-images",
     // ...
   };
   ```

---

## 💻 Instalación y ejecución local

Dado que el proyecto utiliza **HTML5, CSS3 y JavaScript puro con ES Modules**, no requiere herramientas de construcción (*build tools*), transpiladores ni instalación de dependencias `npm`.

Debido a que las políticas de seguridad de los navegadores (*CORS*) restringen la carga de módulos ES mediante el protocolo `file://`, la aplicación debe servirse a través de un servidor HTTP local:

### Opción 1: Visual Studio Code (Recomendada)
1. Abrir la carpeta del proyecto en VS Code.
2. Instalar la extensión **Live Server**.
3. Hacer clic derecho sobre `index.html` y seleccionar **"Open with Live Server"**.

### Opción 2: Node.js
```bash
npx serve .
```

### Opción 3: Python 3
```bash
python -m http.server 8000
```

* **Catálogo público:** `http://localhost:8000/index.html`
* **Panel de administración:** `http://localhost:8000/admin/login.html`

---

## 🎯 Enfoque de Portfolio

Este proyecto refleja una serie de competencias técnicas y decisiones de diseño orientadas a entornos profesionales:

* **Dominio de Vanilla JavaScript:** Implementación de arquitectura completa (servicios, adaptadores, componentes, enrutamiento ligero por URL y gestión de estado) sin depender de frameworks.
* **Integración BaaS y Cloud:** Implementación de bases de datos relacionales, autenticación y almacenamiento de objetos con Supabase.
* **Diseño e Implementación de Seguridad:** Configuración integral de Row Level Security (RLS) para proteger endpoints y assets multimedia.
* **Optimización de Rendimiento Web (WPO):** Manipulación de imágenes en el cliente antes de la subida mediante la API Canvas del navegador, reduciendo el ancho de banda y garantizando fluidez en dispositivos móviles.
* **Diseño Orientado al Negocio:** Construcción de una solución a medida para un caso de uso real, priorizando usabilidad, experiencia del usuario y canales de conversión comerciales (WhatsApp e Instagram).

---

## 📌 Estado del proyecto

El sistema se encuentra **completamente funcional, auditado y preparado para la operatoria productiva** del emprendimiento Ca & Bag.
