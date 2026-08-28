-- ============================================================
-- MIGRACIÓN 004 — Corrección de RLS para Imágenes y Storage
--
-- Aplica el modelo de permisos definitivo:
-- - Visitantes (anon): solo lectura (SELECT) de imágenes en catálogo.
-- - Admin logueado (authenticated): lectura, subida, edición y borrado
--   de imágenes en public.product_images y en storage.objects.
--
-- Cómo aplicarlo: copiar y ejecutar en Supabase → SQL Editor.
-- Es idempotente (drop policy if exists + create).
-- ============================================================


-- ============================================================
-- 1. STORAGE.OBJECTS (Bucket: 'product-images')
-- ============================================================

-- Asegurar que el bucket 'product-images' exista como público
-- (si ya existe, ON CONFLICT DO NOTHING no altera nada)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Eliminar policies previas conocidas sobre storage.objects
drop policy if exists "product_images_bucket_select" on storage.objects;
drop policy if exists "product_images_bucket_insert" on storage.objects;
drop policy if exists "product_images_bucket_delete" on storage.objects;
drop policy if exists "storage_product_images_select" on storage.objects;
drop policy if exists "storage_product_images_insert" on storage.objects;
drop policy if exists "storage_product_images_delete" on storage.objects;
drop policy if exists "Give anon users access to images" on storage.objects;
drop policy if exists "Allow authenticated uploads" on storage.objects;

-- SELECT en Storage: permitido a anon y authenticated
create policy "storage_product_images_select"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'product-images');

-- INSERT en Storage: solo admin autenticado
create policy "storage_product_images_insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-images');

-- DELETE en Storage: solo admin autenticado
create policy "storage_product_images_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'product-images');


-- ============================================================
-- 2. PUBLIC.PRODUCT_IMAGES
-- ============================================================

alter table public.product_images enable row level security;

-- Eliminar policies previas conocidas sobre public.product_images
drop policy if exists "product_images_select_anon" on public.product_images;
drop policy if exists "product_images_insert_anon" on public.product_images;
drop policy if exists "product_images_update_anon" on public.product_images;
drop policy if exists "product_images_delete_anon" on public.product_images;
drop policy if exists "product_images_select_anon_and_auth" on public.product_images;
drop policy if exists "product_images_insert_authenticated_only" on public.product_images;
drop policy if exists "product_images_update_authenticated_only" on public.product_images;
drop policy if exists "product_images_delete_authenticated_only" on public.product_images;

-- SELECT: Lectura para catálogo público (anon) y admin (authenticated)
create policy "product_images_select_anon_and_auth"
on public.product_images
for select
to anon, authenticated
using (true);

-- INSERT: Creación solo admin autenticado
create policy "product_images_insert_authenticated_only"
on public.product_images
for insert
to authenticated
with check (true);

-- UPDATE: Edición y reordenamiento solo admin autenticado
create policy "product_images_update_authenticated_only"
on public.product_images
for update
to authenticated
using (true)
with check (true);

-- DELETE: Eliminación solo admin autenticado
create policy "product_images_delete_authenticated_only"
on public.product_images
for delete
to authenticated
using (true);
