-- Schema inicial: produtos, pedidos, políticas e RPC

create table if not exists public.products (
  id bigserial primary key,
  created_at timestamp with time zone default now(),
  name text not null,
  description text default '',
  price_cents integer not null check (price_cents >= 0),
  image_url text,
  stock integer not null default 0 check (stock >= 0),
  published boolean not null default true
);

alter table public.products enable row level security;

drop policy if exists "Products are viewable by anyone" on public.products;
create policy "Products are viewable by anyone" on public.products for select using (true);

drop policy if exists "Products write requires auth" on public.products;
create policy "Products write requires auth" on public.products for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create table if not exists public.orders (
  id bigserial primary key,
  created_at timestamp with time zone default now(),
  items jsonb not null,
  total_cents integer not null check (total_cents >= 0)
);

alter table public.orders enable row level security;

drop policy if exists "Orders read/write requires auth" on public.orders;
create policy "Orders read/write requires auth" on public.orders for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create or replace function public.decrement_stock(p_product_id bigint, p_qty int)
returns void as $$
begin
  update public.products set stock = greatest(0, stock - p_qty) where id = p_product_id;
end;
$$ language plpgsql security definer;

grant execute on function public.decrement_stock(bigint, int) to anon, authenticated;

