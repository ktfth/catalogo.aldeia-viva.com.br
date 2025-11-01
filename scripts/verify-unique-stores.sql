-- Script de verificação: Garantir lojas únicas por usuário
-- Execute este script para verificar se há duplicatas e aplicar a correção

-- 1. Verificar quantas lojas cada usuário possui
SELECT
  owner_id,
  COUNT(*) as total_stores,
  ARRAY_AGG(id ORDER BY created_at) as store_ids,
  ARRAY_AGG(name ORDER BY created_at) as store_names
FROM public.stores
GROUP BY owner_id
HAVING COUNT(*) > 1
ORDER BY total_stores DESC;

-- Se o resultado acima mostrar usuários com mais de 1 loja, há duplicatas!

-- 2. Verificar se a constraint existe
SELECT
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conname = 'stores_owner_id_unique'
  AND conrelid = 'public.stores'::regclass;

-- 3. Estatísticas gerais
SELECT
  COUNT(DISTINCT owner_id) as usuarios_com_loja,
  COUNT(*) as total_lojas,
  COUNT(*) - COUNT(DISTINCT owner_id) as lojas_duplicadas
FROM public.stores;

-- 4. Listar todas as lojas por usuário (debug)
SELECT
  s.id,
  s.owner_id,
  u.email,
  s.name,
  s.slug,
  s.created_at,
  s.published
FROM public.stores s
LEFT JOIN auth.users u ON u.id = s.owner_id
ORDER BY s.owner_id, s.created_at;
