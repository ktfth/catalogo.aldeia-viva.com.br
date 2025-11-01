-- Migração para sistema multi-tenant
-- Cada usuário registrado cria automaticamente uma loja

-- 1. Criar tabela de lojas (stores)
create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),

  -- Informações da loja
  name text not null,
  slug text unique not null,
  description text,
  logo_url text,
  whatsapp_number text not null,

  -- Dono da loja
  owner_id uuid references auth.users(id) on delete cascade not null,

  -- Status
  published boolean not null default true,

  -- Constraints
  constraint slug_format check (slug ~ '^[a-z0-9-]+$'),
  constraint whatsapp_format check (whatsapp_number ~ '^\d{10,15}$')
);

-- 2. Criar tabela de perfis de usuário
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),

  -- Informações do usuário
  full_name text,
  avatar_url text,

  -- Role do usuário (admin = super admin, owner = dono de loja)
  role text not null default 'owner',

  constraint role_check check (role in ('admin', 'owner'))
);

-- 3. Adicionar store_id aos produtos
alter table public.products
  add column if not exists store_id uuid references public.stores(id) on delete cascade;

-- 4. Adicionar store_id aos pedidos
alter table public.orders
  add column if not exists store_id uuid references public.stores(id) on delete cascade;

-- 5. Índices para performance
create index if not exists products_store_id_idx on public.products(store_id);
create index if not exists orders_store_id_idx on public.orders(store_id);
create index if not exists stores_owner_id_idx on public.stores(owner_id);
create index if not exists stores_slug_idx on public.stores(slug);

-- 6. Função auxiliar para verificar se usuário é admin (evita recursão em RLS)
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql stable security definer;

-- 7. Função para criar loja automaticamente ao registrar
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_slug text;
  slug_counter int := 0;
  base_slug text;
begin
  -- Criar perfil do usuário
  insert into public.profiles (id, role)
  values (new.id, 'owner');

  -- Gerar slug único baseado no email
  base_slug := regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9]', '-', 'gi');
  base_slug := lower(base_slug);
  new_slug := base_slug;

  -- Garantir que o slug é único
  while exists (select 1 from public.stores where slug = new_slug) loop
    slug_counter := slug_counter + 1;
    new_slug := base_slug || '-' || slug_counter;
  end loop;

  -- Criar loja padrão para o usuário
  insert into public.stores (owner_id, name, slug, whatsapp_number)
  values (
    new.id,
    'Minha Loja',
    new_slug,
    '5500000000000' -- Número padrão, usuário deve configurar
  );

  return new;
end;
$$ language plpgsql security definer;

-- 7. Trigger para criar loja ao registrar
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 8. Políticas RLS para stores
alter table public.stores enable row level security;

-- Qualquer pessoa pode ver lojas publicadas
drop policy if exists "Stores are viewable by anyone" on public.stores;
create policy "Stores are viewable by anyone"
  on public.stores for select
  using (published = true);

-- Apenas o dono pode ver/editar sua própria loja
drop policy if exists "Users can view own store" on public.stores;
create policy "Users can view own store"
  on public.stores for select
  using (auth.uid() = owner_id);

drop policy if exists "Users can update own store" on public.stores;
create policy "Users can update own store"
  on public.stores for update
  using (auth.uid() = owner_id);

-- Usuários autenticados podem criar sua própria loja
drop policy if exists "Users can create own store" on public.stores;
create policy "Users can create own store"
  on public.stores for insert
  with check (auth.uid() = owner_id);

-- Admins podem ver/editar todas as lojas
drop policy if exists "Admins can manage all stores" on public.stores;
create policy "Admins can manage all stores"
  on public.stores for all
  using (public.is_admin());

-- 9. Políticas RLS para profiles
alter table public.profiles enable row level security;

-- Usuários podem ver e atualizar seu próprio perfil (simplificado para evitar recursão)
drop policy if exists "Users can manage own profile" on public.profiles;
create policy "Users can manage own profile"
  on public.profiles for all
  using (auth.uid() = id);

-- 10. Atualizar políticas de products
drop policy if exists "Products are viewable by anyone" on public.products;
drop policy if exists "Products write requires auth" on public.products;

-- Produtos publicados de lojas publicadas são visíveis por todos
create policy "Products are viewable by anyone"
  on public.products for select
  using (
    published = true
    and exists (
      select 1 from public.stores
      where id = products.store_id and published = true
    )
  );

-- Apenas o dono da loja pode gerenciar seus produtos
create policy "Store owners can manage own products"
  on public.products for all
  using (
    exists (
      select 1 from public.stores
      where id = products.store_id and owner_id = auth.uid()
    )
  );

-- Admins podem gerenciar todos os produtos
create policy "Admins can manage all products"
  on public.products for all
  using (public.is_admin());

-- 11. Atualizar políticas de orders
drop policy if exists "Orders read/write requires auth" on public.orders;

-- Apenas o dono da loja pode ver seus pedidos
create policy "Store owners can view own orders"
  on public.orders for select
  using (
    exists (
      select 1 from public.stores
      where id = orders.store_id and owner_id = auth.uid()
    )
  );

-- Qualquer pessoa (até anônima) pode criar pedido
create policy "Anyone can create orders"
  on public.orders for insert
  with check (true);

-- Admins podem ver todos os pedidos
create policy "Admins can view all orders"
  on public.orders for select
  using (public.is_admin());

-- 12. Função para obter loja do usuário atual
create or replace function public.get_current_user_store()
returns uuid as $$
  select id from public.stores where owner_id = auth.uid() limit 1;
$$ language sql stable;

-- 13. View para facilitar consultas
create or replace view public.stores_with_owner as
select
  s.*,
  p.full_name as owner_name,
  p.avatar_url as owner_avatar
from public.stores s
left join public.profiles p on p.id = s.owner_id;

-- Grant permissions
grant usage on schema public to anon, authenticated;
grant select on public.stores to anon, authenticated;
grant select on public.profiles to authenticated;
grant all on public.stores to authenticated;
grant all on public.profiles to authenticated;
grant select on public.stores_with_owner to anon, authenticated;
