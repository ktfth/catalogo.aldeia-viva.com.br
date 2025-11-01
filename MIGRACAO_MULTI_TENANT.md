# Migração para Sistema Multi-Tenant

Este documento explica as mudanças feitas para transformar a aplicação em um sistema multi-tenant onde cada usuário registrado cria automaticamente sua própria loja.

## O que mudou?

### Antes
- Aplicação single-tenant (uma única loja)
- Produtos pertenciam a todos
- WhatsApp configurado via variável de ambiente
- Qualquer usuário autenticado podia gerenciar produtos

### Depois
- Aplicação multi-tenant (múltiplas lojas)
- Cada usuário que se registra ganha automaticamente uma loja
- Cada loja tem seu próprio WhatsApp, logo, nome e slug
- Usuários só podem gerenciar produtos da própria loja
- Catálogo público lista todas as lojas
- Sistema de roles (admin/owner)

## Estrutura do Banco de Dados

### Novas Tabelas

#### `stores` - Lojas
- `id` (uuid) - ID da loja
- `owner_id` (uuid) - Dono da loja (FK para auth.users)
- `name` (text) - Nome da loja
- `slug` (text) - URL amigável (ex: minha-loja)
- `description` (text) - Descrição
- `logo_url` (text) - URL do logo
- `whatsapp_number` (text) - Número do WhatsApp
- `published` (boolean) - Se está publicada

#### `profiles` - Perfis de Usuário
- `id` (uuid) - ID do usuário (FK para auth.users)
- `full_name` (text) - Nome completo
- `avatar_url` (text) - URL do avatar
- `role` (text) - Role do usuário (admin ou owner)

### Tabelas Modificadas

#### `products`
- Adicionado `store_id` (uuid) - FK para stores

#### `orders`
- Adicionado `store_id` (uuid) - FK para stores

## Como Migrar

### 1. Parar a aplicação

```bash
# Ctrl+C no terminal onde está rodando pnpm dev
```

### 2. Resetar o banco de dados

```bash
pnpm db:reset
```

Este comando irá:
- Limpar todas as tabelas
- Aplicar a migração `0001_init.sql` (estrutura base)
- Aplicar a migração `0002_multi_tenant.sql` (novo sistema)
- Popular com dados de exemplo (loja "Aldeia Viva" + 5 produtos)

### 3. Credenciais de Teste

Após o reset, você terá:

**Usuário Admin:**
- Email: `admin@aldeiavivadev.local`
- Senha: `admin123`
- Role: `admin` (pode ver/gerenciar todas as lojas)

**Loja de Exemplo:**
- Nome: "Aldeia Viva"
- Slug: `aldeia-viva`
- URL: http://localhost:3000/aldeia-viva

### 4. Iniciar a aplicação

```bash
pnpm dev
```

### 5. Testar o Sistema

#### Catálogo Público
1. Acesse http://localhost:3000
2. Você verá a lista de lojas
3. Clique em "Aldeia Viva"
4. Navegue pelos produtos

#### Criar Nova Loja (Registrar Novo Usuário)
1. Acesse http://localhost:3000/login
2. Clique em "Criar conta"
3. Use email: `loja@test.com` / senha: `123456`
4. Você será redirecionado automaticamente
5. Uma loja será criada automaticamente com slug baseado no email

#### Configurar Sua Loja
1. Após fazer login, clique em "Minha Loja" no menu
2. Configure:
   - Nome da loja
   - Slug (URL)
   - Descrição
   - Logo
   - **WhatsApp** (importante!)
3. Salve as alterações

#### Adicionar Produtos
1. Clique em "Produtos" no menu
2. Clique em "Novo produto"
3. Preencha os dados
4. Salve

#### Testar Checkout
1. Acesse sua loja pelo slug: http://localhost:3000/seu-slug
2. Adicione produtos ao carrinho
3. Clique em "Finalizar no WhatsApp"
4. O pedido será enviado para o WhatsApp da **sua loja**

## Novas Funcionalidades

### Sistema de Roles

#### Owner (Padrão)
- Pode gerenciar apenas sua própria loja
- Pode ver/editar produtos da própria loja
- Pode ver pedidos da própria loja

#### Admin
- Pode ver/gerenciar todas as lojas
- Pode ver/editar todos os produtos
- Pode ver todos os pedidos
- Pode alterar roles de usuários

### Páginas e Rotas

#### Públicas
- `/` - Lista de todas as lojas
- `/[slug]` - Catálogo de uma loja específica
- `/login` - Login/Registro

#### Autenticadas
- `/admin/store` - Configurações da minha loja
- `/admin/products` - Gerenciar produtos da minha loja

### Políticas de Segurança (RLS)

Todas as tabelas têm Row Level Security habilitado:

**Stores:**
- Leitura pública (apenas lojas publicadas)
- Apenas o dono pode editar sua loja
- Admins podem editar todas

**Products:**
- Leitura pública (apenas de lojas publicadas)
- Apenas o dono da loja pode gerenciar seus produtos
- Admins podem gerenciar todos

**Orders:**
- Apenas o dono da loja pode ver seus pedidos
- Admins podem ver todos

**Profiles:**
- Usuários só veem seu próprio perfil
- Admins veem todos

## Mudanças no Código

### Novos Composables

#### `useStore()`
```typescript
const {
  currentStore,      // Loja do usuário atual
  currentProfile,    // Perfil do usuário
  isAdmin,           // Se é admin
  isStoreOwner,      // Se é dono da loja
  loadCurrentUserStore,  // Carregar dados
  updateStore,       // Atualizar loja
  getStoreBySlug,    // Buscar loja por slug
} = useStore()
```

### Composables Atualizados

#### `useCart()`
```typescript
const {
  setStore,  // Definir loja ativa no carrinho (NOVO)
  // ... resto igual
} = useCart()
```

## Checklist Pós-Migração

- [ ] Banco resetado com `pnpm db:reset`
- [ ] Login com admin@aldeiavivadev.local funciona
- [ ] Consegue acessar /admin/store
- [ ] Consegue configurar logo e WhatsApp da loja
- [ ] Consegue criar produtos
- [ ] Produtos aparecem no catálogo público
- [ ] Checkout via WhatsApp usa número da loja
- [ ] Criar nova conta gera loja automaticamente
- [ ] Cada loja mostra apenas seus produtos

## Troubleshooting

### Erro: "relation stores does not exist"
**Solução:** Execute `pnpm db:reset` para aplicar as migrações

### Erro: "store_id violates foreign key constraint"
**Solução:** O banco tem dados antigos. Rode `pnpm db:reset`

### Loja não criada ao registrar
**Solução:** Verifique os logs do Supabase. A trigger `handle_new_user` deve criar automaticamente.

### Produtos não aparecem no admin
**Solução:** Certifique-se de que `currentStore` está carregado. Verifique se o usuário tem uma loja associada.

### WhatsApp não funciona
**Solução:** Configure o número na página /admin/store. Formato: DDI+DDD+Número (apenas números)

## Próximos Passos Sugeridos

Agora que o sistema é multi-tenant, você pode:

1. **Upload de Imagens**
   - Usar Supabase Storage para logos e produtos
   - Ver [PROXIMOS_PASSOS.md](PROXIMOS_PASSOS.md)

2. **Dashboard**
   - Métricas da loja (vendas, produtos mais vendidos)
   - Ver pedidos recebidos

3. **Customização**
   - Temas personalizados por loja
   - Cores, fontes, etc.

4. **Domínios Customizados**
   - Permitir que cada loja tenha seu próprio domínio

5. **Planos e Pagamentos**
   - Sistema de assinatura
   - Limites por plano (produtos, pedidos, etc)

## Documentação Adicional

- [README.md](README.md) - Documentação geral
- [PROXIMOS_PASSOS.md](PROXIMOS_PASSOS.md) - Roadmap de melhorias
- [QUICK_START.md](QUICK_START.md) - Guia rápido
- [VARIAVEIS_AMBIENTE.md](VARIAVEIS_AMBIENTE.md) - Variáveis de ambiente
