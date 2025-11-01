-- Seeds de desenvolvimento: usuário admin e loja de exemplo

-- ESTRATÉGIA: O trigger handle_new_user() cria uma loja automaticamente quando inserimos em auth.users
-- Vamos aproveitar isso e apenas atualizar a loja criada pelo trigger

-- 1. Criar usuário admin de exemplo (senha: admin123)
-- O trigger vai criar automaticamente:
--   - Um perfil em public.profiles com role='owner'
--   - Uma loja em public.stores com dados padrão
insert into auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
)
values (
  'a0000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'admin@aldeiavivadev.local',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  'authenticated'
) on conflict (id) do nothing;

-- 2. Atualizar perfil para role='admin' (trigger criou com role='owner')
update public.profiles
set
  full_name = 'Administrador',
  role = 'admin'
where id = 'a0000000-0000-0000-0000-000000000001'::uuid;

-- 3. Atualizar a loja criada pelo trigger com dados da Aldeia Viva
-- O trigger já criou uma loja, vamos apenas atualizá-la
update public.stores
set
  name = 'Aldeia Viva',
  slug = 'aldeia-viva',
  description = 'Produtos naturais e orgânicos de alta qualidade',
  whatsapp_number = '5511999999999',
  published = true
where owner_id = 'a0000000-0000-0000-0000-000000000001'::uuid;

-- 4. Criar produtos de exemplo para a loja
-- Buscar o ID da loja do admin (criada pelo trigger)
insert into public.products (name, description, price_cents, image_url, stock, published, store_id)
select
  name,
  description,
  price_cents,
  image_url,
  stock,
  published,
  (select id from public.stores where owner_id = 'a0000000-0000-0000-0000-000000000001'::uuid limit 1) as store_id
from (values
  ('Café Especial', 'Blend artesanal com notas de chocolate e caramelo.', 4590, 'https://images.unsplash.com/photo-1507133750040-4a8f57021524?q=80&w=1200&auto=format&fit=crop', 20, true),
  ('Chá de Ervas', 'Calmante natural com hortelã, camomila e capim-limão.', 2990, 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1200&auto=format&fit=crop', 35, true),
  ('Mel Orgânico', 'Mel silvestre cru, colheita sustentável.', 5490, 'https://images.unsplash.com/photo-1517263904808-5dc91e3e7044?q=80&w=1200&auto=format&fit=crop', 15, true),
  ('Granola Premium', 'Mix crocante com castanhas e frutas secas.', 3890, 'https://images.unsplash.com/photo-1547578319-3b64d2d78d37?q=80&w=1200&auto=format&fit=crop', 40, true),
  ('Azeite Extravirgem', 'Variedade Arbequina, acidez controlada.', 7990, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop', 10, true)
) as tmp(name, description, price_cents, image_url, stock, published)
on conflict do nothing;

