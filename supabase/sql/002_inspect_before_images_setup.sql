-- ============================================================
-- INSPECCIÓN — correr esto PRIMERO, antes del script de setup.
-- Es de solo lectura: no crea, modifica ni borra nada.
--
-- Objetivo: saber qué políticas/bucket ya existen antes de decidir
-- qué crear, para no duplicar policies ni abrir un bucket que ya
-- estaba configurado de otra forma.
--
-- Pegá cada bloque en el SQL Editor de Supabase y revisá el
-- resultado antes de seguir con 003_product_images_and_storage_setup.sql.
-- ============================================================

-- 1) ¿RLS está habilitado en product_images?
select relname as tabla, relrowsecurity as rls_habilitado
from pg_class
where relname = 'product_images';

-- 2) Políticas RLS ya existentes sobre product_images
select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'product_images';

-- 3) Buckets de Storage ya existentes (para confirmar si "product-images" ya está creado)
select id, name, public, created_at
from storage.buckets;

-- 4) Políticas ya existentes sobre storage.objects (afectan a TODOS los buckets)
select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'storage' and tablename = 'objects';