# 🔧 Correção: Race Condition no Registro de Usuário

## 🐛 Problema Encontrado

Ao registrar um novo usuário, ocorria o erro:

```
ERROR: duplicate key value violates unique constraint "stores_owner_id_unique" (SQLSTATE 23505)
```

## 🔍 Causa Raiz

**Race Condition** entre o trigger do banco e a lógica da aplicação:

```
Timeline do Problema:
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuário se registra                                      │
│    ↓                                                         │
│ 2. Trigger cria loja automaticamente (handle_new_user)      │
│    ↓                                                         │
│ 3. Usuário é redirecionado para /welcome                    │
│    ↓                                                         │
│ 4. welcome.vue carrega (onMounted)                          │
│    ├─ loadCurrentUserStore() NÃO encontra loja ainda        │
│    │  (transação do trigger pode não ter commitado)         │
│    └─ Pré-preenche formulário sem dados                     │
│    ↓                                                         │
│ 5. Usuário clica "Começar"                                  │
│    ↓                                                         │
│ 6. createStore() executa:                                   │
│    ├─ Verifica se loja existe → NÃO encontra               │
│    └─ Tenta criar → ERRO! Loja já existe (pelo trigger)    │
│       ❌ SQLSTATE 23505                                     │
└─────────────────────────────────────────────────────────────┘
```

**Por que acontece:**

1. **Trigger cria loja** quando usuário registra
2. **Transação ainda não commitou** quando `loadCurrentUserStore()` executa
3. **Loja "aparece" depois**, quando `createStore()` tenta inserir
4. **Constraint bloqueia** a duplicata

---

## ✅ Solução Implementada

### 1️⃣ Verificação em 3 Níveis

```typescript
async function createStore(storeData) {
  // NÍVEL 1: Usar loja já carregada em memória (mais rápido)
  if (currentStore.value && currentStore.value.owner_id === user.value.id) {
    console.log('[useStore] Usando loja já carregada, atualizando...')
    return await updateStore(storeData)
  }

  // NÍVEL 2: Buscar no banco de dados
  const { data: existingStore } = await client
    .from('stores')
    .select('*')
    .eq('owner_id', user.value.id)
    .maybeSingle()

  if (existingStore) {
    console.log('[useStore] Loja encontrada no banco, atualizando...')
    return await updateStore(storeData)
  }

  // NÍVEL 3: Criar (apenas se realmente não existir)
  console.log('[useStore] Criando nova loja...')
  const { data, error } = await client
    .from('stores')
    .insert({ owner_id: user.value.id, ...storeData })

  // FALLBACK: Se erro 23505, recarregar e atualizar
  if (error?.code === '23505') {
    console.warn('[useStore] Race condition! Recarregando e atualizando...')

    const { data: justCreatedStore } = await client
      .from('stores')
      .select('*')
      .eq('owner_id', user.value.id)
      .single()

    if (justCreatedStore) {
      return await updateStore(storeData)
    }
  }

  return { data, error }
}
```

---

### 2️⃣ Tratamento Específico do Erro 23505

**Antes:**
```typescript
if (error.code === '23505') {
  return { error: new Error('Você já possui uma loja') }
}
```

**Depois:**
```typescript
if (error.code === '23505') {
  // Identificar tipo de violação
  if (error.message.includes('stores_owner_id_unique')) {
    // Race condition - loja criada pelo trigger
    console.warn('Race condition detectada')

    // RECUPERAR: buscar loja e atualizar
    const justCreatedStore = await buscarLojaExistente()
    return await atualizarLoja(justCreatedStore, storeData)
  }

  if (error.message.includes('stores_slug_key')) {
    // Slug duplicado - erro real do usuário
    return { error: new Error('Slug já em uso') }
  }
}
```

---

## 🧪 Cenários de Teste

### ✅ Cenário 1: Registro Normal (Sem Race Condition)

```
1. Usuário registra (email: test@example.com)
2. Trigger cria loja com slug "test"
3. Transação commita ANTES de /welcome carregar
4. loadCurrentUserStore() encontra loja
5. Formulário pré-preenche com "test"
6. Usuário ajusta e salva
7. createStore() detecta loja em currentStore.value
8. ✅ Atualiza diretamente (NÍVEL 1)
```

**Logs:**
```
[useStore] Usando loja já carregada (id: abc-123), atualizando...
[useStore] Loja atualizada com sucesso
```

---

### ✅ Cenário 2: Race Condition Leve

```
1. Usuário registra
2. Trigger cria loja
3. /welcome carrega ANTES da transação commitar
4. loadCurrentUserStore() NÃO encontra loja
5. Formulário fica vazio
6. Usuário preenche e salva
7. createStore() verifica banco (NÍVEL 2)
8. ✅ Encontra loja criada pelo trigger
9. ✅ Atualiza ao invés de criar
```

**Logs:**
```
[useStore] Verificando se loja já existe no banco...
[useStore] Loja encontrada no banco (id: xyz-789), atualizando...
[useStore] Loja atualizada com sucesso
```

---

### ✅ Cenário 3: Race Condition Severa (FALLBACK)

```
1. Usuário registra
2. /welcome carrega rapidamente
3. loadCurrentUserStore() NÃO encontra (tx não commitou)
4. Usuário salva formulário
5. createStore() verifica banco (NÍVEL 2)
6. NÃO encontra (tx ainda não commitou)
7. Tenta criar (NÍVEL 3)
8. ❌ Erro 23505 (tx do trigger commitou nesse meio tempo)
9. ✅ FALLBACK ativa
10. ✅ Recarrega loja do banco
11. ✅ Atualiza com dados do formulário
```

**Logs:**
```
[useStore] Criando nova loja...
[useStore] Erro ao criar loja: duplicate key...
[useStore] Race condition detectada: loja foi criada pelo trigger.
[useStore] Tentando carregar e atualizar a loja existente...
[useStore] Loja atualizada com sucesso
```

---

## 📊 Fluxograma da Solução

```
createStore(storeData)
    │
    ├─► NÍVEL 1: currentStore.value existe?
    │   ├─ SIM ──► Atualizar ──► ✅ Sucesso
    │   └─ NÃO ──► Continuar ▼
    │
    ├─► NÍVEL 2: Buscar no banco
    │   ├─ Encontrou? ──► Atualizar ──► ✅ Sucesso
    │   └─ Não encontrou ──► Continuar ▼
    │
    ├─► NÍVEL 3: Tentar criar
    │   ├─ Sucesso? ──► ✅ Retornar
    │   └─ Erro 23505? ──► Continuar ▼
    │
    └─► FALLBACK: Recarregar e atualizar
        ├─ Recarregar banco ──► Encontrou?
        │   ├─ SIM ──► Atualizar ──► ✅ Sucesso
        │   └─ NÃO ──► ❌ Erro final
        │
        └─ ✅ Usuário nunca vê o erro!
```

---

## 🎯 Benefícios da Solução

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Erro visível ao usuário** | ✅ Sim (23505) | ❌ Não (recupera automaticamente) |
| **Verificações antes de criar** | 1 (apenas banco) | 3 (memória + banco + fallback) |
| **Tratamento de race condition** | ❌ Não | ✅ Sim |
| **Performance** | Média | Alta (usa cache em memória) |
| **Logs de debug** | Genéricos | Detalhados por nível |

---

## 🔍 Como Identificar Race Condition

**Logs para procurar:**

```bash
# Bom - NÍVEL 1 (mais rápido)
[useStore] Usando loja já carregada (id: ...), atualizando...

# OK - NÍVEL 2 (banco normal)
[useStore] Verificando se loja já existe no banco...
[useStore] Loja encontrada no banco (id: ...), atualizando...

# Atenção - NÍVEL 3 (tentou criar)
[useStore] Criando nova loja...
[useStore] Loja criada com sucesso: ...

# RACE CONDITION! - FALLBACK ativado
[useStore] Criando nova loja...
[useStore] Erro ao criar loja: duplicate key...
[useStore] Race condition detectada: loja foi criada pelo trigger.
[useStore] Tentando carregar e atualizar a loja existente...
```

Se você vê o último padrão frequentemente, significa:
- Trigger está funcionando ✅
- Transações estão lentas ⚠️
- FALLBACK está funcionando ✅

---

## 🛠️ Manutenção Futura

### Se o problema persistir:

1. **Aumentar delay no /welcome:**
   ```typescript
   onMounted(async () => {
     // Dar tempo para trigger commitar
     await new Promise(resolve => setTimeout(resolve, 100))
     await loadCurrentUserStore()
   })
   ```

2. **Retry na verificação:**
   ```typescript
   async function waitForStore(maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       const store = await buscarLoja()
       if (store) return store
       await delay(100 * (i + 1))
     }
     return null
   }
   ```

3. **Usar event listener no trigger:**
   ```sql
   -- Notificar aplicação quando loja for criada
   PERFORM pg_notify('store_created', NEW.id::text);
   ```

---

## ✅ Validação da Correção

**Teste:**
```bash
# 1. Limpar banco
supabase db reset

# 2. Iniciar app
npm run dev

# 3. Registrar novo usuário
# - Email: test@example.com
# - Senha: 123456

# 4. Na página /welcome, preencher e salvar
# - Nome: Minha Loja Teste
# - Slug: test-store
# - WhatsApp: 5511999999999

# 5. Verificar logs no console
# Deve ver NÍVEL 1, 2 ou FALLBACK - NUNCA erro para o usuário
```

**Verificar no banco:**
```sql
SELECT id, owner_id, name, slug
FROM stores
WHERE owner_id = (SELECT id FROM auth.users WHERE email = 'test@example.com');
```

**Resultado esperado:**
```
      id       |   owner_id   |      name        |    slug
---------------+--------------+------------------+-------------
 abc-123-xyz   | user-123     | Minha Loja Teste | test-store
```

✅ Apenas 1 loja, sem erros!

---

## 📝 Arquivos Modificados

- ✅ [composables/useStore.ts](composables/useStore.ts) - Função `createStore()` com 3 níveis + fallback

---

**Data da Correção:** 2025-01-01
**Status:** ✅ Resolvido
**Impacto:** Alto - Previne erro crítico no fluxo de registro
