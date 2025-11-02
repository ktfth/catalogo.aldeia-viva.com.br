# 🔧 Variáveis de Ambiente - Guia Simplificado

## 📋 Variáveis ESSENCIAIS para a Aplicação

A aplicação Nuxt 3 precisa de **apenas 2 variáveis** para funcionar:

### ✅ Obrigatórias

```env
# 1. URL do Supabase
SUPABASE_URL=http://127.0.0.1:54321

# 2. Chave pública (anon key)
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🎯 Configuração por Ambiente

### Desenvolvimento Local (Supabase CLI)

```env
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

**Uso:**
```bash
# 1. Iniciar Supabase
supabase start

# 2. Iniciar aplicação
npm run dev
```

---

### Produção (Supabase Cloud)

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=eyJhbGc...sua-chave-real-aqui...
```

**Como obter:**
1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings → API**
4. Copie:
   - **Project URL** → `SUPABASE_URL`
   - **anon/public key** → `SUPABASE_KEY`

---

## ⚙️ Variável Opcional

### WhatsApp Padrão (não necessário)

```env
PUBLIC_WHATSAPP_NUMBER=5599999999999
```

**Nota:** Esta variável NÃO é usada pela aplicação atual. Cada loja configura seu próprio número de WhatsApp através da interface.

---

## ❌ Variáveis NÃO Necessárias para a Aplicação Nuxt

As seguintes variáveis em `.env.example` são **apenas para o Supabase local** (Docker/CLI) e **não são usadas pela aplicação Nuxt**:

- ❌ `SERVICE_ROLE_KEY` - Operações admin do Supabase
- ❌ `JWT_SECRET` - Geração de tokens (interno do Supabase)
- ❌ `SMTP_*` - Configuração de email (interno do Supabase)
- ❌ `SITE_URL` - Configuração do Supabase Auth
- ❌ `POSTGRES_*` - Configuração do PostgreSQL (interno)
- ❌ `PGRST_*` - Configuração do PostgREST (interno)

**Essas variáveis são configuradas automaticamente pelo `supabase start`.**

---

## 📝 Como Configurar

### Opção 1: Copiar o Mínimo

```bash
# Criar .env com apenas o essencial
cp .env.minimal .env

# Editar se necessário (já vem configurado para local)
nano .env
```

### Opção 2: Copiar Completo

```bash
# Copiar exemplo completo
cp .env.example .env

# Funciona do mesmo jeito! As variáveis extras são ignoradas pela aplicação
```

---

## 🔍 Como a Aplicação Usa as Variáveis

### No Nuxt Config

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/supabase'],

  // Apenas esta variável é usada pela aplicação:
  runtimeConfig: {
    public: {
      whatsappNumber: process.env.PUBLIC_WHATSAPP_NUMBER || '',
    },
  },
})
```

### No Código

```typescript
// O módulo @nuxtjs/supabase usa automaticamente:
const client = useSupabaseClient() // Usa SUPABASE_URL + SUPABASE_KEY

// Variável customizada (opcional):
const config = useRuntimeConfig()
console.log(config.public.whatsappNumber) // PUBLIC_WHATSAPP_NUMBER
```

---

## ✅ Checklist de Configuração

- [ ] Arquivo `.env` existe na raiz do projeto
- [ ] `SUPABASE_URL` está configurado
- [ ] `SUPABASE_KEY` está configurado
- [ ] Supabase está rodando (`supabase start` ou Cloud)
- [ ] Aplicação inicia sem erros (`npm run dev`)

---

## 🆘 Troubleshooting

### Erro: "Invalid API key"

**Causa:** `SUPABASE_KEY` incorreto ou faltando

**Solução:**
```bash
# Local: Use a chave padrão do Supabase demo
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# Cloud: Copie do dashboard do Supabase
```

---

### Erro: "fetch failed"

**Causa:** `SUPABASE_URL` incorreto ou Supabase não está rodando

**Solução:**
```bash
# Verificar se Supabase está rodando
supabase status

# Se não estiver, iniciar:
supabase start

# Verificar URL no .env:
# Local: http://127.0.0.1:54321
# Cloud: https://seu-projeto.supabase.co
```

---

### Aplicação funciona mas sem WhatsApp

**Normal!** O número do WhatsApp é configurado por loja na interface:
1. Login → Minha Loja → WhatsApp
2. Cada loja tem seu próprio número

---

## 📚 Arquivo de Referência

**Arquivo mínimo:** [.env.minimal](.env.minimal)
**Arquivo completo:** [.env.example](.env.example)
**Documentação completa:** [VARIAVEIS_AMBIENTE.md](VARIAVEIS_AMBIENTE.md)

---

## 🎯 Resumo

**Para desenvolvimento local:**
```bash
cp .env.minimal .env
supabase start
npm run dev
```

**Para produção:**
1. Criar projeto no Supabase Cloud
2. Copiar URL e Key para `.env`
3. `npm run build && npm start`

✅ Pronto! A aplicação está configurada.
