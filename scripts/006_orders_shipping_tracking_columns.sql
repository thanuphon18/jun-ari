-- Shipping/tracking fields used by admin + storefront tracking pages.
-- Safe to re-run: uses IF NOT EXISTS.

alter table public.orders
  add column if not exists shipping_carrier text,
  add column if not exists tracking_number text,
  add column if not exists tracking_url text;

comment on column public.orders.shipping_carrier is 'Carrier id (thaipost, flash, kerry, jt, dhl)';
comment on column public.orders.tracking_number is 'Parcel tracking number';
comment on column public.orders.tracking_url is 'Resolved external tracking URL';

create index if not exists orders_shipping_carrier_idx on public.orders (shipping_carrier);
create index if not exists orders_tracking_number_idx on public.orders (tracking_number);
