#!/bin/bash
# Script para aplicar migrações do Supabase

set -e

echo "======================================"
echo "Aplicando Migrações do Supabase"
echo "======================================"

# Verificar se o Supabase está rodando
if ! curl -s http://127.0.0.1:54321/rest/v1/ > /dev/null 2>&1; then
    echo "❌ Erro: Supabase não está rodando!"
    echo "Execute: supabase start"
    exit 1
fi

echo "✅ Supabase está rodando"
echo ""

# Aplicar migrações
echo "Aplicando migrações..."
cd "$(dirname "$0")/.."

# Se estiver usando Supabase CLI
if command -v supabase &> /dev/null; then
    echo "Usando Supabase CLI para aplicar migrações..."
    supabase db reset
    echo "✅ Migrações aplicadas com sucesso!"
else
    echo "⚠️  Supabase CLI não encontrado"
    echo "Aplique manualmente executando os arquivos SQL em ordem:"
    echo "  1. supabase/migrations/0001_init.sql"
    echo "  2. supabase/migrations/0002_multi_tenant.sql"
    echo "  3. supabase/migrations/0003_unique_store_per_user.sql"
fi

echo ""
echo "======================================"
echo "Para verificar o banco, execute:"
echo "psql 'postgresql://postgres:postgres@127.0.0.1:54322/postgres' -f scripts/verify-unique-stores.sql"
echo "======================================"
