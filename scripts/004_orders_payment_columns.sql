-- Payment gateway metadata (Beam, etc.). Run against your Supabase project.
-- Safe to re-run: uses IF NOT EXISTS.

alter table public.orders
  add column if not exists payment_provider text,
  add column if not exists external_payment_id text,
  add column if not exists currency text default 'THB',
  add column if not exists customer_email text;

comment on column public.orders.payment_provider is 'e.g. beam';
comment on column public.orders.external_payment_id is 'Gateway payment / link id for idempotent lookups';

create unique index if not exists orders_external_payment_id_uidx
  on public.orders (external_payment_id)
  where external_payment_id is not null;
