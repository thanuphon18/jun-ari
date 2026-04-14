-- Guest checkout identifier on orders table.
-- Safe to re-run: uses IF NOT EXISTS.

alter table public.orders
  add column if not exists guest_user_id text;

comment on column public.orders.guest_user_id is 'Stable guest identifier for non-authenticated checkout orders';

create index if not exists orders_guest_user_id_idx
  on public.orders (guest_user_id)
  where guest_user_id is not null;
