# Catálogo Aldeia Viva

Catálogo minimalista e luxuoso com checkout via WhatsApp, autenticação completa e painel administrativo.

## Stack Tecnológica

- **Frontend**: Nuxt 3 + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Containerização**: Docker + Docker Compose

## Estrutura do Projeto

```
catalogo.aldeia-viva.com.br/
├── pages/                    # Páginas da aplicação
│   ├── index.vue            # Catálogo público
│   ├── login.vue            # Autenticação
│   └── admin/
│       └── products.vue     # Gestão de produtos
├── composables/             # Lógica compartilhada
│   └── useCart.ts          # Carrinho de compras
├── middleware/              # Middlewares
│   └── auth.ts             # Proteção de rotas
├── supabase/               # Configuração do Supabase
│   ├── migrations/         # Migrações do banco
│   ├── seed.sql           # Dados iniciais
│   ├── config.toml        # Configuração local
│   └── kong.yml           # API Gateway
├── docker-compose.yml      # Orquestração de containers
└── Dockerfile             # Build da aplicação
```

## Funcionalidades

### Catálogo Público
- Visualização de produtos com imagens e preços
- Carrinho de compras com totalizador
- Checkout via WhatsApp com pedido formatado
- Interface minimalista e responsiva

### Painel Administrativo
- Autenticação segura com Supabase Auth
- CRUD completo de produtos
- Controle de estoque
- Publicação/ocultação de produtos
- Proteção de rotas com middleware

### Infraestrutura
- Supabase completo rodando localmente via Docker
- PostgreSQL com Row Level Security (RLS)
- Autenticação JWT com refresh tokens
- API REST via PostgREST
- Realtime subscriptions
- Storage para imagens
- Supabase Studio para administração do banco

## Pré-requisitos

**Opção recomendada (Supabase CLI):**
- Node.js 20+
- pnpm 9.0.0+
- Supabase CLI ([instruções de instalação](https://supabase.com/docs/guides/cli/getting-started))

**Opção alternativa (Docker):**
- Docker e Docker Compose
- Node.js 20+ (opcional)
- pnpm 9.0.0+

## Instalação e Execução

### Opção 1: Usando Supabase CLI (Recomendado)

#### 1. Clone o repositório

```bash
git clone <repo-url>
cd catalogo.aldeia-viva.com.br
```

#### 2. Instale as dependências

```bash
pnpm install
```

#### 3. Inicie o Supabase local

```bash
pnpm supabase:start
# ou: supabase start
```

O Supabase CLI irá:
- Baixar e iniciar os containers Docker necessários
- Criar o banco de dados local
- Aplicar as migrações automaticamente
- Mostrar as credenciais de acesso

**Anote as URLs e chaves exibidas**, especialmente:
- API URL: `http://127.0.0.1:54321`
- anon key: `eyJh...`

#### 4. Configure o arquivo .env

O arquivo `.env` já está configurado com os valores padrão do Supabase CLI. Ajuste apenas:

```env
PUBLIC_WHATSAPP_NUMBER=5511999999999  # Seu número de WhatsApp
```

#### 5. Inicie a aplicação

```bash
pnpm dev
```

#### 6. Acesse a aplicação

- **Aplicação**: http://localhost:3000
- **Supabase Studio**: http://127.0.0.1:54323
- **Inbucket (emails de teste)**: http://127.0.0.1:54324

#### Comandos úteis do Supabase CLI

```bash
# Ver status dos serviços
pnpm supabase:status

# Parar o Supabase
pnpm supabase:stop

# Resetar banco de dados (limpa e reaplica migrations + seeds)
pnpm db:reset

# Aplicar apenas seeds
pnpm db:seed
```

### Opção 2: Usando Docker Compose

#### Opção A: Rodar tudo (Supabase + Aplicação)

```bash
docker compose --profile full up -d
```

Serviços disponíveis:
- **Aplicação**: http://localhost:3000
- **Supabase Studio**: http://localhost:3001
- **Supabase API**: http://localhost:8000
- **Inbucket (emails)**: http://localhost:9000
- **PostgreSQL**: localhost:5432

#### Opção B: Rodar apenas a infraestrutura Supabase

```bash
docker compose --profile infra up -d
```

Depois rode a aplicação localmente:

```bash
pnpm install
pnpm dev
```

#### Opção C: Rodar apenas a aplicação (use Supabase Cloud)

Atualize o `.env` com suas credenciais do Supabase Cloud:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anon
```

```bash
docker compose --profile app up -d
```

### 4. Acesse a aplicação

- **Catálogo público**: http://localhost:3000
- **Login**: http://localhost:3000/login
- **Admin**: http://localhost:3000/admin/products (requer autenticação)
- **Supabase Studio**: http://localhost:3001 (se rodando com profile `infra` ou `full`)

## Comandos Úteis

### Docker Compose

```bash
# Iniciar com perfil completo
docker compose --profile full up -d

# Iniciar apenas infraestrutura
docker compose --profile infra up -d

# Iniciar apenas aplicação
docker compose --profile app up -d

# Ver logs
docker compose logs -f app
docker compose logs -f db

# Parar tudo
docker compose down

# Parar e remover volumes (limpa banco de dados)
docker compose down -v

# Rebuild da aplicação
docker compose build app
docker compose up -d app
```

### Desenvolvimento Local (sem Docker)

```bash
# Instalar dependências
pnpm install

# Rodar em modo de desenvolvimento
pnpm dev

# Build de produção
pnpm build

# Rodar build de produção
pnpm start
```

## Banco de Dados

### Schema

O banco possui duas tabelas principais:

**products**
- `id` - ID único do produto
- `name` - Nome do produto
- `description` - Descrição detalhada
- `price_cents` - Preço em centavos (ex: 4990 = R$ 49,90)
- `image_url` - URL da imagem
- `stock` - Quantidade em estoque
- `published` - Se está publicado no catálogo
- `created_at` - Data de criação

**orders**
- `id` - ID único do pedido
- `items` - JSON com itens do pedido
- `total_cents` - Total em centavos
- `created_at` - Data do pedido

### Políticas de Segurança (RLS)

- **products**: Leitura pública, escrita apenas para usuários autenticados
- **orders**: Leitura/escrita apenas para usuários autenticados

### Seeds

O banco vem com 5 produtos de exemplo. Para resetar os dados:

```bash
# Se usando Supabase local via Docker
docker compose exec db psql -U postgres -d postgres -f /docker-entrypoint-initdb.d/seed.sql
```

## Autenticação

### Criar primeiro usuário administrador

1. Acesse http://localhost:3000/login
2. Clique em "Criar conta"
3. Insira email e senha (mínimo 6 caracteres)
4. Com `ENABLE_EMAIL_AUTOCONFIRM=true`, a conta é ativada automaticamente

### Verificar emails (desenvolvimento)

Acesse o Inbucket em http://localhost:9000 para ver emails de confirmação, recuperação de senha, etc.

## Supabase Studio

O Supabase Studio está disponível em http://localhost:3001 quando rodando com `--profile infra` ou `--profile full`.

Use para:
- Visualizar e editar dados nas tabelas
- Executar queries SQL
- Gerenciar usuários
- Configurar políticas de segurança (RLS)
- Ver logs e métricas

## Produção

### Checklist para Deploy

1. **Variáveis de Ambiente**:
   - Use um projeto Supabase Cloud ou configure Supabase em seu servidor
   - Gere um `JWT_SECRET` forte e único
   - Configure `SUPABASE_URL` e `SUPABASE_ANON_KEY` com valores de produção
   - Configure `PUBLIC_WHATSAPP_NUMBER` correto
   - Configure SMTP real (SendGrid, Mailgun, etc)

2. **Build de Produção**:
   ```bash
   docker build -t catalogo-aldeia-viva .
   docker run -p 3000:3000 --env-file .env catalogo-aldeia-viva
   ```

3. **Banco de Dados**:
   - Execute as migrações em `supabase/migrations/`
   - Configure backups automáticos
   - Revise as políticas de RLS

4. **Segurança**:
   - Use HTTPS
   - Configure CORS adequadamente
   - Revise as políticas de autenticação
   - Configure rate limiting

## Troubleshooting

### Aplicação não conecta ao Supabase

Verifique se:
- Os serviços do Supabase estão rodando: `docker compose ps`
- O Kong está saudável: `docker compose logs kong`
- As variáveis `SUPABASE_URL` e `SUPABASE_ANON_KEY` estão corretas no `.env`

### Erro de autenticação

- Verifique se o `JWT_SECRET` é o mesmo em todos os serviços
- Confirme que o Auth service está rodando: `docker compose logs auth`
- Limpe cookies e localStorage do navegador

### Banco de dados não inicializa

- Verifique os logs: `docker compose logs db`
- Se necessário, remova volumes e recrie: `docker compose down -v && docker compose --profile full up -d`

### Porta já em uso

Se alguma porta já estiver em uso, edite o `docker-compose.yml` e altere o mapeamento:

```yaml
ports:
  - '3001:3000'  # Muda a porta externa de 3000 para 3001
```

## Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT.

## Suporte

Para dúvidas e suporte, abra uma issue no repositório.
