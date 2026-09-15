# Ca & Bag. — Tienda Online Artesanal y Panel de Gestión

Aplicación web de comercio electrónico y gestión de catálogo desarrollada para **Ca & Bag.**, un emprendimiento familiar enfocado en la confección artesanal de bolsos, mochilas, materas, cartucheras, neceseres y accesorios textiles.

El proyecto cuenta con un doble propósito: resolver una **necesidad real del negocio** mediante una solución funcional, ágil y mantenible, y servir como **proyecto de portfolio profesional** que demuestra buenas prácticas de arquitectura de software, seguridad en servicios en la nube y desarrollo frontend moderno con tecnologías web nativas.

---

## 🌐 Demo

> ⏳ **Próximamente: demo online**
>
> *Nota: El catálogo es de acceso público para cualquier visitante, mientras que el panel de administración cuenta con acceso privado restringido a la gestión del negocio.*

---

## 📸 Capturas de pantalla

<!--
Espacio reservado para incorporar capturas de pantalla reales de la aplicación.
Instrucciones: sustituir los comentarios y placeholders por las imágenes correspondientes.
-->

| Catálogo Público | Detalle de Producto |
| :---: | :---: |
| <!-- Captura: Catálogo público con buscador y filtros de categorías --> *[ Captura: Catálogo público con filtros y búsqueda ]* | <!-- Captura: Ficha individual de producto y galería interactiva --> *[ Captura: Ficha de producto y galería interactiva ]* |

| Panel de Administración | Alta y Edición de Producto |
| :---: | :---: |
| <!-- Captura: Dashboard con métricas de inventario y tabla --> *[ Captura: Dashboard con métricas y tabla de productos ]* | <!-- Captura: Modal de creación/edición y gestión de fotos --> *[ Captura: Modal de edición y carga optimizada de fotos ]* |

---

## 🎯 Sobre el proyecto

El proyecto nace para dar respuesta a las necesidades concretas de un emprendimiento textil artesanal en crecimiento:

* **Administrar el catálogo de forma autónoma:** Permitir la gestión ágil de productos, precios, categorías, descripciones y disponibilidad sin depender de bases de datos manuales ni conocimientos técnicos.
* **Brindar una experiencia ágil a los clientes:** Ofrecer un catálogo digital interactivo donde los compradores pueden explorar productos, examinar fotografías en detalle, consultar disponibilidad en tiempo real e iniciar contacto directo para encargar pedidos.
* **Facilitar la gestión de contenidos:** Proveer al administrador herramientas para crear, editar, reordenar fotos y cambiar la disponibilidad de productos de forma inmediata.
* **Desarrollo para un caso de uso real:** Cada decisión técnica y de diseño fue tomada para resolver problemas específicos del negocio con una solución profesional y sostenible.

---

## ✨ Funcionalidades

### Catálogo público
* **Visualización de productos:** Cuadrícula responsive con tarjetas informativas, imágenes de portada y badges de categoría.
* **Búsqueda en tiempo real:** Filtrado instantáneo por nombre con técnica de *debounce* para optimizar el rendimiento.
* **Filtros dinámicos por categoría:** Botones de filtrado generados automáticamente a partir de la configuración centralizada (*Bolsos, Mochilas, Materas, Cartucheras, Neceseres, Accesorios*).
* **Indicadores de stock:** Marcadores visuales de estado ("Disponible" / "Agotado") con bloqueo automático de consultas para artículos sin existencias.
* **Skeleton loading:** Animaciones de carga que mejoran la experiencia de usuario mientras se obtienen los datos.

### Detalle de producto
* **Ficha completa:** Vista individual (`producto.html?id=...`) con información detallada, precio, descripción y categoría.
* **Galería interactiva:** Visualizador con navegación por flechas, miniaturas interactivas, contador de imágenes y soporte de gestos táctiles (*swipe*) en dispositivos móviles.
* **Productos relacionados:** Sección de recomendaciones automáticas basada en productos de la misma categoría.

### Contacto
* **Integración con WhatsApp:** Botón de consulta directa con mensaje prellenado que incluye el nombre del producto, precio y enlace de referencia.
* **Integración con Instagram:** Acceso directo al perfil oficial del emprendimiento.

### Panel de administración
* **Autenticación:** Inicio de sesión seguro con correo electrónico y contraseña mediante Supabase Auth.
* **Dashboard y métricas:** Panel de control con estadísticas en tiempo real (total de productos, artículos disponibles, agotados y categorías activas).
* **Gestión de inventario (CRUD completo):** Creación, edición y eliminación de productos con validaciones de formulario y diálogos de confirmación.
* **Conmutador de stock:** Cambio rápido de disponibilidad con un clic desde la tabla de productos.
* **Sistema de notificaciones:** Avisos flotantes (*toasts*) para confirmar operaciones exitosas o advertir sobre errores.

### Gestión de imágenes
* **Carga múltiple:** Selección simultánea de varias fotografías por producto.
* **Reordenamiento visual:** Control interactivo para subir o bajar la posición de cada foto, definiendo automáticamente la portada del producto.
* **Eliminación individual:** Posibilidad de quitar imágenes específicas antes o durante la edición.

### Optimización de imágenes
* **Procesamiento en el navegador:** Compresión y redimensionamiento en el cliente mediante Canvas API antes de iniciar la transferencia a la nube.
* **Escala proporcional:** Ajuste automático a un máximo de **1600 px** en su lado mayor preservando la nitidez de telas y costuras.
* **Formato WebP con fallback:** Conversión a WebP con calidad `0.85` (o JPEG según compatibilidad del navegador), reduciendo considerablemente el peso de las imágenes antes de subirlas a la nube.

---

## 🛠️ Tecnologías utilizadas

| Área | Tecnología | Rol en el proyecto |
| :--- | :--- | :--- |
| **Frontend** | **HTML5** | Estructura semántica, accesibilidad y maquetación web. |
| **Estilos** | **CSS3** | Sistema de diseño basado en Custom Properties (variables), Flexbox y CSS Grid. |
| **Lógica** | **JavaScript (ES Modules)** | Código modular nativo (`import`/`export`) sin dependencias externas ni frameworks. |
| **Backend / BaaS** | **Supabase** | Plataforma de servicios backend para autenticación, base de datos y almacenamiento. |
| **Base de datos** | **PostgreSQL** | Base de datos relacional para persistencia de productos e imágenes. |
| **Autenticación** | **Supabase Auth** | Manejo de sesiones y tokens seguros para el panel de administración. |
| **Almacenamiento** | **Supabase Storage** | Almacenamiento en la nube de activos multimedia (bucket `product-images`). |
| **Seguridad** | **Row Level Security (RLS)** | Políticas de control de acceso a nivel de fila y objeto. |
| **Control de versiones** | **Git / GitHub** | Control de versiones y repositorio de código fuente. |

---

## 🏛️ Arquitectura

El proyecto está diseñado bajo una arquitectura modular por capas desacopladas, lo que garantiza una clara separación de responsabilidades:

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

### Principios arquitectónicos aplicados:
* **Separación de responsabilidades:** La interfaz de usuario no realiza consultas SQL ni interactúa directamente con clientes de almacenamiento; siempre delega en `ProductService` y `AuthService`.
* **Patrón Adaptador:** `SupabaseStorageAdapter` traduce las respuestas y esquemas relacionales de Supabase al modelo canónico `Product.js`.
* **Desacoplamiento de persistencia:** `ProductService` expone interfaces asíncronas estándar, permitiendo intercambiar el backend sin modificar las vistas ni los componentes.
* **Componentes reutilizables y utilidades puras:** Componentes de interfaz (`productCard.js`, `skeleton.js`) y módulos utilitarios (`format.js`, `dom.js`, `image.js`) sin acoplamiento a servicios externos.

---

## 📁 Estructura del proyecto

```text
cabag_store/
├── index.html                    # Catálogo público y portada principal
├── producto.html                 # Ficha detallada de producto
├── .gitignore                    # Reglas de exclusión para Git y secretos
├── README.md                     # Documentación del proyecto
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
│   │   ├── product.css           # Galería interactiva y ficha de producto
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

## 🔒 Seguridad y Control de Acceso

El proyecto aplica el principio de mínimo privilegio mediante la combinación de autenticación por tokens y políticas de seguridad en base de datos:

1. **Autenticación en servidor:** La validación de credenciales se realiza directamente en Supabase Auth, gestionando sesiones seguras mediante JSON Web Tokens (JWT).
2. **Row Level Security (RLS) en PostgreSQL:**
   * `public.products`: Permisos de lectura (`SELECT`) abiertos para roles `anon` y `authenticated`. Operaciones de escritura (`INSERT`, `UPDATE`, `DELETE`) restringidas estrictamente al rol `authenticated`.
   * `public.product_images`: Lectura pública para visualización en el catálogo; inserción, actualización y borrado limitados exclusivamente a usuarios `authenticated`.
3. **Políticas de Supabase Storage:**
   * Bucket `product-images`: Lectura pública para entrega directa mediante etiquetas `<img>`, mientras que las operaciones de subida y eliminación requieren autenticación activa.
4. **Manejo de claves de acceso:**
   * El cliente frontend opera únicamente con la clave anónima pública (`anon / publishable key`).
   * **Nunca se utiliza ni se expone la `service_role key` en el frontend.**
   * No se incluyen credenciales, contraseñas ni datos sensibles en el repositorio.

---

## ⚡ Optimización de imágenes

Para garantizar tiempos de carga rápidos en dispositivos móviles y reducir el consumo de ancho de banda:

* **Canvas API nativo:** La función `optimizeImageFile` ([assets/js/utils/image.js](assets/js/utils/image.js)) procesa cada imagen en memoria antes de la subida.
* **Escalado y compresión:** Si la imagen excede los **1600 px** en su dimensión mayor, se redimensiona proporcionalmente y se comprime en formato **WebP** con calidad `0.85`.
* **Fallback automático:** En caso de que el navegador no soporte la codificación WebP en canvas, se genera automáticamente un archivo JPEG comprimido.
* **Reducción de transferencia:** Reduce considerablemente el peso de las imágenes antes de subirlas a la nube, sin pérdida perceptible de calidad visual en el catálogo.

---

## ⚙️ Configuración de Supabase

Para replicar o desplegar la infraestructura backend:

1. **Crear proyecto:** Registrar un nuevo proyecto en [supabase.com](https://supabase.com).
2. **Ejecutar migraciones SQL:** En el **SQL Editor** de Supabase, ejecutar en orden los scripts incluidos en `supabase/sql/`:
   * `001_set_updated_at_trigger.sql`
   * `003_product_images_and_storage_setup.sql`
   * `004_fix_images_and_storage_rls.sql`
3. **Crear usuario administrador:** En **Authentication → Users**, crear la cuenta del administrador.
4. **Configurar variables públicas:** En [assets/js/config.js](assets/js/config.js), definir los valores provistos en **Project Settings → API**:
   ```javascript
   export const CONFIG = {
     DATA_SOURCE: "supabase",
     SUPABASE_URL: "https://TU_PROYECTO.supabase.co",
     SUPABASE_ANON_KEY: "TU_CLAVE_PUBLICA_ANON",
     SUPABASE_STORAGE_BUCKET: "product-images",
     // ...
   };
   ```

> 🔒 **Aclaración de seguridad:** La URL pública de Supabase y la `anon/publishable key` pueden utilizarse en frontend cuando el acceso está correctamente protegido mediante RLS, pero nunca debe exponerse una `service_role key`.

---

## 💻 Instalación y ejecución local

Al estar desarrollado en **HTML5, CSS3 y JavaScript nativo**, el proyecto no requiere compiladores, transpiladores ni instalación de paquetes `npm`.

Debido a que las políticas de seguridad de los navegadores restringen la carga de módulos ES mediante el protocolo `file://`, la aplicación debe ejecutarse mediante un servidor HTTP local:

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

## 🎓 Enfoque de portfolio

Este proyecto demuestra un conjunto de competencias técnicas y buenas prácticas aplicadas al desarrollo de software:

* **Vanilla JavaScript sin frameworks:** Implementación completa de la lógica de negocio, manipulación eficiente del DOM y renderizado dinámico sin dependencias externas.
* **Arquitectura modular:** Organización del código en módulos ES independientes y reutilizables.
* **Separación de responsabilidades:** División estricta en capas (presentación, servicios de negocio, modelos y acceso a datos).
* **Patrón Adapter:** Aislamiento de la persistencia de datos mediante adaptadores (`SupabaseStorageAdapter`), permitiendo desacoplar la aplicación de la infraestructura backend.
* **Integración con Supabase y PostgreSQL:** Modelado relacional, consultas SQL, inserción y sincronización de datos relacionales (`products` y `product_images`).
* **Autenticación robusta:** Control de acceso y sesiones seguras en el servidor mediante Supabase Auth.
* **Seguridad declarativa (Row Level Security):** Definición de políticas de RLS granulares para proteger la lectura pública y restringir la escritura a usuarios autenticados.
* **Almacenamiento de archivos (Storage):** Gestión de assets multimedia en Supabase Storage con políticas de acceso alineadas a la base de datos.
* **Optimización de imágenes en el cliente:** Procesamiento y compresión mediante Canvas API en el navegador antes de la subida a la nube para mejorar los tiempos de carga y el rendimiento web (WPO).
* **Diseño responsive:** Interfaz adaptable a dispositivos móviles y de escritorio mediante CSS moderno (Grid, Flexbox y Custom Properties).
* **Integración con WhatsApp e Instagram:** Canales de comunicación directa integrados en el flujo de consulta y conversión de clientes.
* **Desarrollo orientado a un caso de negocio real:** Solución técnica diseñada específicamente para responder a las necesidades operativas de un emprendimiento familiar.

---

## 📌 Estado del proyecto

El sistema se encuentra completamente funcional y preparado para ser utilizado en la operatoria del emprendimiento Ca & Bag.

---

## 🚀 Próximas mejoras

Posibles líneas de evolución para futuras iteraciones del proyecto:

* Despliegue público definitivo en plataforma de hosting.
* Configuración de dominio personalizado.
* Mejoras adicionales de analítica y métricas comerciales.
* Mejoras continuas de accesibilidad web (WCAG / a11y).
* Implementación de tests automatizados (unitarios y de integración para servicios y adaptadores).

---

## 👤 Autor

### Matías Coppes

Full Stack Developer Jr.
