-- Migração: Garantir que cada usuário tenha apenas uma loja
-- Data: 2025-01-01

-- 1. Remover lojas duplicadas (manter apenas a primeira criada por usuário)
DELETE FROM public.stores
WHERE id NOT IN (
  SELECT DISTINCT ON (owner_id) id
  FROM public.stores
  ORDER BY owner_id, created_at ASC
);

-- 2. Adicionar constraint UNIQUE em owner_id
ALTER TABLE public.stores
DROP CONSTRAINT IF EXISTS stores_owner_id_unique;

ALTER TABLE public.stores
ADD CONSTRAINT stores_owner_id_unique UNIQUE (owner_id);

-- 3. Adicionar comentário explicativo
COMMENT ON CONSTRAINT stores_owner_id_unique ON public.stores IS
'Garante que cada usuário (owner_id) tenha apenas uma loja. Relação 1:1 entre auth.users e stores.';

-- 4. Criar índice para melhorar performance em consultas por owner_id
-- (já existe no 0002, mas vamos garantir)
CREATE INDEX IF NOT EXISTS stores_owner_id_idx ON public.stores(owner_id);

-- 5. Atualizar função createStore para lidar com unicidade
-- (A constraint já vai garantir, mas vamos melhorar a mensagem de erro)
COMMENT ON TABLE public.stores IS
'Tabela de lojas. Cada usuário tem exatamente uma loja (1:1).';
