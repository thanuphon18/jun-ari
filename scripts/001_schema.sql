-- GreenLeaf ERP Schema (ERPNext-inspired)
-- Maps: Item→products, Item Price→product_variants, Sales Order→orders, 
-- Stock Ledger→inventory+stock_adjustments, Loyalty Points→points_ledger, Coupon Code→discount_codes

-- ============================================================
-- 1. PROFILES (linked to auth.users)
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role text not null default 'b2c' check (role in ('b2c', 'b2b', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Admin can see all profiles
create policy "profiles_admin_select" on public.profiles
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Admin can update all profiles
create policy "profiles_admin_update" on public.profiles
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ============================================================
-- 2. DISTRIBUTOR PROFILES (ERPNext: Customer Group / Pricing Rule)
-- ============================================================
create table if not exists public.distributor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade unique,
  company_name text not null default '',
  tax_id text,
  tier int not null default 1 check (tier in (1, 2, 3)),
  credit_window_days int not null default 30,
  created_at timestamptz not null default now()
);

alter table public.distributor_profiles enable row level security;

create policy "distributor_select_own" on public.distributor_profiles
  for select using (auth.uid() = user_id);

create policy "distributor_update_own" on public.distributor_profiles
  for update using (auth.uid() = user_id);

create policy "distributor_admin_select" on public.distributor_profiles
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "distributor_admin_all" on public.distributor_profiles
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ============================================================
-- 3. PRODUCTS (ERPNext: Item)
-- ============================================================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  category text not null default 'General',
  status text not null default 'active' check (status in ('active', 'draft', 'archived')),
  image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

-- Public can read active products
create policy "products_public_read" on public.products
  for select using (true);

-- Admin can do everything
create policy "products_admin_all" on public.products
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ============================================================
-- 4. PRODUCT VARIANTS (ERPNext: Item Variant + Item Price)
-- ============================================================
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text not null unique,
  name text not null,
  retail_price numeric(10,2) not null default 0,
  b2b_tier1_price numeric(10,2) not null default 0,
  b2b_tier2_price numeric(10,2) not null default 0,
  b2b_tier3_price numeric(10,2) not null default 0
);

alter table public.product_variants enable row level security;

create policy "variants_public_read" on public.product_variants
  for select using (true);

create policy "variants_admin_all" on public.product_variants
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ============================================================
-- 5. INVENTORY (ERPNext: Bin / Stock Ledger)
-- ============================================================
create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete cascade unique,
  total_stock int not null default 0,
  b2b_reserved int not null default 0,
  b2c_available int not null default 0,
  low_stock_threshold int not null default 50,
  restock_date date
);

alter table public.inventory enable row level security;

create policy "inventory_public_read" on public.inventory
  for select using (true);

create policy "inventory_admin_all" on public.inventory
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ============================================================
-- 6. ORDERS (ERPNext: Sales Order / Sales Invoice)
-- ============================================================
create table if not exists public.orders (
  id text primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','confirmed','processing','shipped','delivered','returned','cancelled')),
  total_amount numeric(10,2) not null default 0,
  payment_method text not null default 'card',
  shipping_address jsonb,
  po_number text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;

-- Users can see own orders
create policy "orders_select_own" on public.orders
  for select using (auth.uid() = user_id);

-- Users can insert own orders
create policy "orders_insert_own" on public.orders
  for insert with check (auth.uid() = user_id);

-- Admin can see all
create policy "orders_admin_select" on public.orders
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Admin can update all
create policy "orders_admin_update" on public.orders
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ============================================================
-- 7. ORDER ITEMS (ERPNext: Sales Order Item)
-- ============================================================
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id),
  product_name text not null default '',
  variant_name text not null default '',
  qty int not null default 1,
  unit_price numeric(10,2) not null default 0
);

alter table public.order_items enable row level security;

-- Users see items for their own orders
create policy "order_items_select_own" on public.order_items
  for select using (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

-- Users can insert items for their own orders
create policy "order_items_insert_own" on public.order_items
  for insert with check (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

-- Admin can see all
create policy "order_items_admin_select" on public.order_items
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ============================================================
-- 8. POINTS LEDGER (ERPNext: Loyalty Point Entry)
-- ============================================================
create table if not exists public.points_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  delta int not null default 0,
  reason text not null default '',
  order_id text references public.orders(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.points_ledger enable row level security;

create policy "points_select_own" on public.points_ledger
  for select using (auth.uid() = user_id);

create policy "points_admin_all" on public.points_ledger
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ============================================================
-- 9. DISCOUNT CODES (ERPNext: Coupon Code / Pricing Rule)
-- ============================================================
create table if not exists public.discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type text not null default 'percent' check (type in ('percent','fixed','points')),
  value numeric(10,2) not null default 0,
  usage_limit int not null default 0,
  used_count int not null default 0,
  active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.discount_codes enable row level security;

-- Public can read (for code validation at checkout)
create policy "discount_codes_public_read" on public.discount_codes
  for select using (true);

create policy "discount_codes_admin_all" on public.discount_codes
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ============================================================
-- 10. STOCK ADJUSTMENTS (ERPNext: Stock Reconciliation)
-- ============================================================
create table if not exists public.stock_adjustments (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  delta int not null default 0,
  reason text not null default '',
  operator_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.stock_adjustments enable row level security;

create policy "stock_adj_admin_all" on public.stock_adjustments
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
