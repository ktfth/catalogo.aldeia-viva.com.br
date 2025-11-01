# Guia Rápido de Início

Este guia te ajudará a ter a aplicação rodando em **menos de 5 minutos**.

## Passo 1: Instalar o Supabase CLI

### Windows
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### macOS
```bash
brew install supabase/tap/supabase
```

### Linux
```bash
brew install supabase/tap/supabase
```

[Outras opções de instalação](https://supabase.com/docs/guides/cli/getting-started)

## Passo 2: Clonar e Configurar

```bash
# Clone o repositório
git clone <repo-url>
cd catalogo.aldeia-viva.com.br

# Instale as dependências
pnpm install

# Copie o arquivo de ambiente (já configurado!)
cp .env.example .env
```

## Passo 3: Iniciar o Supabase

```bash
pnpm supabase:start
```

Aguarde alguns segundos. O Supabase irá:
- Baixar imagens Docker necessárias (apenas na primeira vez)
- Iniciar todos os serviços
- Aplicar migrações automaticamente
- Popular o banco com dados de exemplo

## Passo 4: Iniciar a Aplicação

```bash
pnpm dev
```

## Passo 5: Acessar

Pronto! Acesse:

- **Catálogo**: http://localhost:3000
- **Supabase Studio**: http://127.0.0.1:54323
- **Emails de teste**: http://127.0.0.1:54324

## Próximos Passos

### Criar sua primeira conta

1. Acesse http://localhost:3000/login
2. Clique em "Criar conta"
3. Use qualquer email (ex: admin@test.com) e senha (mín. 6 caracteres)
4. Você será autenticado automaticamente

### Acessar o painel admin

1. Após fazer login, acesse http://localhost:3000/admin/products
2. Você verá 5 produtos de exemplo
3. Experimente criar, editar e excluir produtos

### Testar o checkout

1. Na página inicial (http://localhost:3000), adicione produtos ao carrinho
2. Clique no carrinho e depois em "Finalizar no WhatsApp"
3. Você será redirecionado para o WhatsApp com o pedido formatado

### Configurar seu número de WhatsApp

Edite o arquivo `.env`:

```env
PUBLIC_WHATSAPP_NUMBER=5511999999999  # Coloque seu número com DDI
```

Reinicie a aplicação (`Ctrl+C` e `pnpm dev` novamente).

## Comandos Úteis

```bash
# Ver status do Supabase
pnpm supabase:status

# Parar o Supabase (libera recursos)
pnpm supabase:stop

# Resetar banco de dados (limpa tudo e reaplica dados de exemplo)
pnpm db:reset

# Ver logs da aplicação
# (apenas observe o terminal onde rodou pnpm dev)

# Ver logs do Supabase
docker logs supabase_db_catalogo.aldeia-viva.com.br -f
```

## Troubleshooting Rápido

### Erro: "Supabase URL is required"

Verifique se o arquivo `.env` existe e tem a linha:
```env
SUPABASE_URL=http://127.0.0.1:54321
```

### Erro: "Connection refused"

O Supabase não está rodando. Execute:
```bash
pnpm supabase:start
```

### Porta 3000 já está em uso

Altere a porta no `package.json`:
```json
"dev": "nuxt dev --port 3001 --host 0.0.0.0"
```

### Produtos não aparecem

Rode o comando para popular o banco:
```bash
pnpm db:reset
```

## Explorando o Supabase Studio

Acesse http://127.0.0.1:54323 para:

- **Table Editor**: Ver e editar dados diretamente
- **SQL Editor**: Executar queries SQL
- **Authentication**: Gerenciar usuários
- **Database**: Ver schema, políticas RLS, etc
- **Logs**: Ver logs do banco e API

## Próximas Melhorias

Após ter a aplicação rodando, confira o arquivo [PROXIMOS_PASSOS.md](PROXIMOS_PASSOS.md) para ideias de melhorias e novas funcionalidades.

## Documentação Completa

Para mais detalhes, consulte o [README.md](README.md) completo.

## Suporte

Problemas? Abra uma issue no repositório com:
- Descrição do erro
- Logs do terminal
- Sistema operacional
- Versões (Node, pnpm, Supabase CLI)
