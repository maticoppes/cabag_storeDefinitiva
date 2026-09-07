-- ============================================================
-- Mantiene public.products.updated_at actualizado automáticamente.
--
-- El default `updated_at timestamptz not null default now()` solo
-- se aplica en el INSERT. Sin este trigger, un UPDATE no toca
-- updated_at, y el frontend (a propósito) nunca envía ese valor:
-- por eso hace falta esto en la base antes de usar
-- CONFIG.DATA_SOURCE = "supabase" para editar productos.
--
-- Cómo aplicarlo: pegar y ejecutar este archivo completo en
-- Supabase → SQL Editor. Es idempotente (se puede correr más de
-- una vez sin duplicar el trigger).
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_products_updated_at on public.products;

create trigger set_products_updated_at
before update on public.products
for each row
execute function public.set_updated_at();