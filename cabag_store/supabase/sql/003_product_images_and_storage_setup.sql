-- ============================================================
-- SETUP — correr SOLO DESPUÉS de revisar
-- 002_inspect_before_images_setup.sql y de leer el aviso de
-- seguridad de más abajo. Es idempotente (drop policy if exists +
-- create), se puede correr más de una vez sin duplicar nada.
--
-- ⚠️ AVISO DE SEGURIDAD — LEER ANTES DE CORRER LA PARTE 2
--
-- La app todavía NO tiene autenticación real contra Supabase:
-- AuthService (login del admin) sigue siendo una protección
-- solamente del lado del cliente, no genera una sesión de Supabase
-- Auth. Por lo tanto no existe un auth.uid() real con el que
-- restringir la escritura "solo al admin" — exactamente el mismo
-- límite que ya se aceptó implícitamente cuando se migró create/
-- update/remove de products a Supabase.
--
-- Las policies de escritura (INSERT/UPDATE/DELETE) de este script
-- quedan abiertas al rol "anon" — es decir, CUALQUIERA que tenga la
-- anon key (que viaja en el JS del sitio, pública por diseño) podría
-- crear, editar o borrar productos, imágenes y archivos del bucket,
-- no solo el admin. Es el mismo nivel de riesgo que products ya
-- tiene hoy, no uno nuevo — pero corresponde dejarlo explícito acá
-- porque estás por abrirlo también para archivos (Storage).
--
-- Alternativa más segura: posponer las policies de escritura de
-- este script hasta migrar AuthService a Supabase Auth real, y
-- mientras tanto seguir probando con DATA_SOURCE = "localStorage",
-- o ejecutar altas/bajas de imágenes manualmente vos como
-- administrador (con la service_role key, nunca desde el frontend)
-- en lugar de desde el panel.
-- ============================================================


-- ============================================================
-- PARTE 1 — Lectura pública (bajo riesgo: el catálogo ya muestra
-- estos datos sin login). Recomendado correr esta parte siempre.
-- ============================================================

alter table public.product_images enable row level security;

drop policy if exists "product_images_select_anon" on public.product_images;
create policy "product_images_select_anon"
on public.product_images
for select
to anon
using (true);

-- Bucket para las imágenes de producto (público: se muestran sin login,
-- necesitan URL directa para <img src>). No falla si ya existe.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product_images_bucket_select" on storage.objects;
create policy "product_images_bucket_select"
on storage.objects for select
to anon
using (bucket_id = 'product-images');


-- ============================================================
-- PARTE 2 — Escritura con la key anon (ver aviso de seguridad
-- arriba). Correr solo si aceptás ese trade-off por ahora.
-- ============================================================

drop policy if exists "product_images_insert_anon" on public.product_images;
create policy "product_images_insert_anon"
on public.product_images
for insert
to anon
with check (true);

drop policy if exists "product_images_update_anon" on public.product_images;
create policy "product_images_update_anon"
on public.product_images
for update
to anon
using (true)
with check (true);

drop policy if exists "product_images_delete_anon" on public.product_images;
create policy "product_images_delete_anon"
on public.product_images
for delete
to anon
using (true);

drop policy if exists "product_images_bucket_insert" on storage.objects;
create policy "product_images_bucket_insert"
on storage.objects for insert
to anon
with check (bucket_id = 'product-images');

drop policy if exists "product_images_bucket_delete" on storage.objects;
create policy "product_images_bucket_delete"
on storage.objects for delete
to anon
using (bucket_id = 'product-images');