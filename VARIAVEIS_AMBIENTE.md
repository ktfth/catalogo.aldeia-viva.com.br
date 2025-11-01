# Variáveis de Ambiente - Guia Completo

Este documento explica todas as variáveis de ambiente usadas no projeto.

## Variáveis do Supabase (Nuxt)

O módulo `@nuxtjs/supabase` reconhece automaticamente estas variáveis:

### `SUPABASE_URL` (obrigatória)
**Descrição:** URL base da API do Supabase

**Valores conforme ambiente:**
- **Supabase CLI Local:** `http://127.0.0.1:54321`
- **Docker Compose:** `http://localhost:8000`
- **Supabase Cloud:** `https://seu-projeto.supabase.co`

### `SUPABASE_KEY` (obrigatória)
**Descrição:** Chave pública anon para autenticação client-side

**Valor padrão (desenvolvimento local):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

**Importante:**
- Esta é a chave que o frontend usa
- É seguro expor no código client-side
- Para produção, use a chave do seu projeto Supabase Cloud

### `SERVICE_ROLE_KEY` (opcional)
**Descrição:** Chave de serviço com privilégios administrativos

**Uso:** Apenas para operações server-side que precisam bypass de RLS

**Valor padrão (desenvolvimento local):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```

**Importante:**
- ⚠️ **NUNCA** exponha esta chave no código client-side
- Apenas para uso em server routes/API endpoints
- Permite bypass total das políticas RLS

## Variáveis da Aplicação

### `PUBLIC_WHATSAPP_NUMBER` (obrigatória)
**Descrição:** Número do WhatsApp para checkout

**Formato:** DDI + DDD + Número (apenas dígitos)

**Exemplos:**
- Brasil: `5511999999999` (55 = Brasil, 11 = São Paulo)
- Brasil: `5521987654321` (21 = Rio de Janeiro)

### `NODE_ENV`
**Descrição:** Ambiente de execução

**Valores:**
- `development` - Desenvolvimento local
- `production` - Produção

**Configurado automaticamente** pelo Nuxt.

## Variáveis do Docker Compose

Estas variáveis são usadas apenas quando rodando via `docker-compose.yml`:

### Autenticação

#### `JWT_SECRET` (obrigatória para Docker)
**Descrição:** Segredo para assinatura de tokens JWT

**Valor padrão:** `your-super-secret-jwt-token-with-at-least-32-characters-long`

**Produção:** Gere uma chave forte:
```bash
openssl rand -base64 32
```

#### `JWT_EXPIRY`
**Descrição:** Tempo de expiração do token em segundos

**Valor padrão:** `3600` (1 hora)

#### `SITE_URL`
**Descrição:** URL base da aplicação para redirects

**Valor padrão:** `http://localhost:3000`

#### `API_EXTERNAL_URL`
**Descrição:** URL pública da API Supabase

**Valor padrão:** `http://localhost:8000`

### Email (SMTP)

#### `SMTP_HOST`
**Descrição:** Servidor SMTP

**Desenvolvimento:** `inbucket` (servidor de teste incluído)

**Produção:** Use serviço real (ex: `smtp.sendgrid.net`)

#### `SMTP_PORT`
**Descrição:** Porta do servidor SMTP

**Valor padrão:** `2500` (Inbucket)

**Produção:** Geralmente `587` ou `465`

#### `SMTP_ADMIN_EMAIL`
**Descrição:** Email remetente

**Valor padrão:** `admin@aldeiavivadev.local`

#### `SMTP_SENDER_NAME`
**Descrição:** Nome do remetente

**Valor padrão:** `Catalogo Aldeia Viva`

### PostgreSQL

#### `PGRST_DB_SCHEMAS`
**Descrição:** Schemas expostos pela API PostgREST

**Valor padrão:** `public`

## Como Usar

### Desenvolvimento com Supabase CLI

Arquivo `.env` mínimo:

```env
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
PUBLIC_WHATSAPP_NUMBER=5511999999999
```

### Desenvolvimento com Docker Compose

Use o `.env.example` completo como base.

### Produção com Supabase Cloud

1. Crie projeto em https://supabase.com
2. Vá em Settings > API
3. Copie as credenciais:

```env
# Produção
SUPABASE_URL=https://abc123.supabase.co
SUPABASE_KEY=eyJhbG...sua-chave-anon
SERVICE_ROLE_KEY=eyJhbG...sua-chave-service

# Aplicação
PUBLIC_WHATSAPP_NUMBER=5511999999999

# SMTP Real
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=sua-senha-sendgrid
SMTP_ADMIN_EMAIL=contato@aldeiaviva.com.br
```

## Troubleshooting

### Erro: "Your project's URL and Key are required"

**Causa:** Falta `SUPABASE_URL` ou `SUPABASE_KEY` no `.env`

**Solução:**
1. Verifique se o arquivo `.env` existe na raiz do projeto
2. Confirme que tem as duas variáveis:
   ```env
   SUPABASE_URL=http://127.0.0.1:54321
   SUPABASE_KEY=eyJh...
   ```
3. Reinicie a aplicação (`Ctrl+C` e `pnpm dev`)

### Erro: "Failed to fetch"

**Causa:** Supabase não está rodando ou URL incorreta

**Soluções:**
- **Supabase CLI:** Rode `pnpm supabase:status` para verificar
- **Docker:** Rode `docker compose ps` para ver containers
- Verifique se a URL no `.env` está correta

### Erro de autenticação: "Invalid JWT"

**Causa:** `JWT_SECRET` diferente entre serviços (Docker)

**Solução:** Certifique-se que todos os serviços usam o mesmo `JWT_SECRET`

## Referências

- [Nuxt Supabase Module](https://supabase.nuxtjs.org/)
- [Supabase Environment Variables](https://supabase.com/docs/guides/cli/config)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)

## Segurança em Produção

### ✅ Boas Práticas

1. **Nunca commite o arquivo `.env`** (já está no `.gitignore`)
2. **Use variáveis de ambiente** do servidor/plataforma de deploy
3. **Gere `JWT_SECRET` único** para cada ambiente
4. **Use HTTPS** em produção
5. **Rotacione chaves** periodicamente

### ⚠️ Nunca Exponha

- `SERVICE_ROLE_KEY` no frontend
- `JWT_SECRET`
- Senhas de SMTP
- Credenciais de banco

### ✅ Seguro Expor

- `SUPABASE_URL`
- `SUPABASE_KEY` (anon key)
- `PUBLIC_WHATSAPP_NUMBER`

Estas variáveis públicas já vão para o bundle do frontend de qualquer forma.
