# Próximos Passos e Melhorias

Este documento lista os próximos passos recomendados para evoluir a aplicação do Catálogo Aldeia Viva.

## Status Atual

✅ Aplicação funcionando com Supabase CLI
✅ Autenticação implementada
✅ CRUD de produtos completo
✅ Carrinho de compras
✅ Checkout via WhatsApp
✅ Docker Compose configurado (opcional)
✅ Migrações e seeds do banco

## Próximos Passos Imediatos

### 1. Funcionalidades Essenciais

#### 1.1. Upload de Imagens
**Prioridade: Alta**

Atualmente os produtos usam URLs externas para imagens. Implementar upload usando Supabase Storage.

**Tarefas:**
- [ ] Criar bucket público `product-images` no Supabase
- [ ] Adicionar componente de upload de imagem no formulário de produtos
- [ ] Implementar função para fazer upload via Supabase Storage
- [ ] Gerar URL pública da imagem após upload
- [ ] Adicionar validação de tipo e tamanho de arquivo
- [ ] Implementar compressão/resize de imagens (opcional)

**Arquivos a modificar:**
- `pages/admin/products.vue` - adicionar input de upload
- Criar composable `composables/useImageUpload.ts`

#### 1.2. Gestão de Pedidos
**Prioridade: Alta**

Criar interface para visualizar e gerenciar pedidos recebidos.

**Tarefas:**
- [ ] Criar página `/admin/orders`
- [ ] Listar pedidos ordenados por data
- [ ] Mostrar detalhes do pedido (items, total, data)
- [ ] Adicionar status do pedido (pendente, processando, enviado, concluído)
- [ ] Implementar filtros (por data, status)
- [ ] Adicionar paginação
- [ ] Criar dashboard com métricas (total de vendas, produtos mais vendidos)

**Arquivos a criar:**
- `pages/admin/orders.vue`
- `pages/admin/index.vue` (dashboard)

#### 1.3. Categorias de Produtos
**Prioridade: Média**

Organizar produtos em categorias para facilitar navegação.

**Tarefas:**
- [ ] Criar tabela `categories` no banco
- [ ] Adicionar campo `category_id` em `products`
- [ ] Criar migração SQL
- [ ] Implementar CRUD de categorias
- [ ] Adicionar filtro por categoria no catálogo público
- [ ] Criar menu de navegação por categorias

**Migration SQL necessária:**
```sql
-- Criar tabela de categorias
create table public.categories (
  id bigserial primary key,
  created_at timestamp with time zone default now(),
  name text not null unique,
  slug text not null unique,
  description text,
  published boolean not null default true
);

-- Adicionar categoria aos produtos
alter table public.products
  add column category_id bigint references public.categories(id);

-- Políticas RLS
alter table public.categories enable row level security;

create policy "Categories are viewable by anyone"
  on public.categories for select using (true);

create policy "Categories write requires auth"
  on public.categories for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
```

### 2. Melhorias de UX/UI

#### 2.1. Loading States
**Prioridade: Média**

Melhorar feedback visual durante operações assíncronas.

**Tarefas:**
- [ ] Adicionar skeletons/placeholders durante carregamento
- [ ] Implementar loading spinners em botões
- [ ] Adicionar transições suaves entre estados
- [ ] Mostrar toasts de sucesso/erro após operações

#### 2.2. Validação de Formulários
**Prioridade: Média**

Melhorar validação usando Zod schemas.

**Tarefas:**
- [ ] Criar schemas Zod para produtos
- [ ] Adicionar validação client-side
- [ ] Mostrar mensagens de erro claras
- [ ] Prevenir envio de formulários inválidos

#### 2.3. Busca Avançada
**Prioridade: Baixa**

Melhorar funcionalidade de busca.

**Tarefas:**
- [ ] Implementar busca full-text no PostgreSQL
- [ ] Adicionar filtros (preço, categoria, estoque)
- [ ] Criar página de resultados de busca dedicada
- [ ] Adicionar ordenação (mais recente, preço, nome)

### 3. Segurança e Performance

#### 3.1. Proteção de API
**Prioridade: Alta**

**Tarefas:**
- [ ] Revisar políticas RLS do banco
- [ ] Implementar rate limiting
- [ ] Adicionar validação server-side em todas as operações
- [ ] Implementar logs de auditoria
- [ ] Adicionar proteção CSRF

#### 3.2. Otimizações
**Prioridade: Média**

**Tarefas:**
- [ ] Implementar cache de produtos
- [ ] Adicionar lazy loading de imagens
- [ ] Otimizar queries do banco (índices)
- [ ] Implementar paginação em listas grandes
- [ ] Configurar CDN para assets estáticos

#### 3.3. SEO
**Prioridade: Baixa**

**Tarefas:**
- [ ] Adicionar meta tags dinâmicas por produto
- [ ] Implementar sitemap.xml
- [ ] Adicionar structured data (Schema.org)
- [ ] Configurar Open Graph para compartilhamento social
- [ ] Otimizar performance (Lighthouse score)

### 4. Funcionalidades Avançadas

#### 4.1. Variações de Produtos
**Prioridade: Média**

Permitir produtos com variações (tamanho, cor, etc).

**Tarefas:**
- [ ] Criar tabela `product_variants`
- [ ] Implementar interface de gestão de variantes
- [ ] Atualizar carrinho para suportar variantes
- [ ] Ajustar controle de estoque por variante

#### 4.2. Cupons de Desconto
**Prioridade: Baixa**

**Tarefas:**
- [ ] Criar tabela `coupons`
- [ ] Implementar validação de cupons
- [ ] Adicionar campo para cupom no checkout
- [ ] Calcular desconto no total
- [ ] Criar interface administrativa para cupons

#### 4.3. Relatórios e Analytics
**Prioridade: Baixa**

**Tarefas:**
- [ ] Implementar dashboard com métricas
- [ ] Gráficos de vendas por período
- [ ] Produtos mais vendidos
- [ ] Relatório de estoque baixo
- [ ] Exportação de dados (CSV, PDF)

#### 4.4. Notificações
**Prioridade: Baixa**

**Tarefas:**
- [ ] Configurar envio de emails transacionais
- [ ] Email de confirmação de pedido
- [ ] Notificação de estoque baixo para admin
- [ ] Integrar com serviço de email (SendGrid, Resend)

### 5. DevOps e Infraestrutura

#### 5.1. CI/CD
**Prioridade: Média**

**Tarefas:**
- [ ] Configurar GitHub Actions
- [ ] Testes automatizados
- [ ] Deploy automático
- [ ] Versionamento semântico
- [ ] Changelog automático

#### 5.2. Monitoramento
**Prioridade: Média**

**Tarefas:**
- [ ] Configurar logs estruturados
- [ ] Implementar error tracking (Sentry)
- [ ] Monitoramento de performance
- [ ] Alertas de erros críticos
- [ ] Healthcheck endpoints

#### 5.3. Backup e Recuperação
**Prioridade: Alta**

**Tarefas:**
- [ ] Configurar backups automáticos do banco
- [ ] Testar processo de recuperação
- [ ] Documentar procedimentos de disaster recovery
- [ ] Implementar backup de arquivos (Storage)

### 6. Testes

#### 6.1. Testes Unitários
**Prioridade: Média**

**Tarefas:**
- [ ] Configurar Vitest
- [ ] Testar composables (useCart, etc)
- [ ] Testar utilitários
- [ ] Atingir 80% de cobertura

#### 6.2. Testes E2E
**Prioridade: Baixa**

**Tarefas:**
- [ ] Configurar Playwright
- [ ] Testar fluxo de compra completo
- [ ] Testar autenticação
- [ ] Testar CRUD de produtos

## Melhorias Técnicas

### Refatorações Sugeridas

1. **Componentização**
   - Extrair formulários repetidos em componentes reutilizáveis
   - Criar biblioteca de componentes UI (Button, Input, Modal, etc)
   - Implementar design system consistente

2. **Type Safety**
   - Gerar tipos TypeScript do schema do Supabase
   - Adicionar validação de runtime com Zod
   - Eliminar uso de `any`

3. **Estado Global**
   - Considerar Pinia para estado compartilhado mais complexo
   - Persistir carrinho no localStorage
   - Sincronizar estado entre tabs

4. **Acessibilidade**
   - Adicionar ARIA labels
   - Garantir navegação por teclado
   - Testar com screen readers
   - Melhorar contraste de cores

## Roadmap Sugerido

### Fase 1 (1-2 semanas)
- Upload de imagens
- Gestão de pedidos básica
- Melhorias de segurança (RLS review)

### Fase 2 (2-3 semanas)
- Categorias de produtos
- Loading states e validações
- Otimizações de performance

### Fase 3 (3-4 semanas)
- Variações de produtos
- Dashboard com métricas
- Notificações por email

### Fase 4 (Contínuo)
- Testes automatizados
- CI/CD
- Monitoramento
- SEO

## Recursos Úteis

### Documentação
- [Nuxt 3 Docs](https://nuxt.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zod](https://zod.dev)

### Ferramentas Recomendadas
- **UI Components**: HeadlessUI, Radix Vue
- **Email**: Resend, SendGrid
- **Analytics**: Plausible, Umami
- **Monitoring**: Sentry, LogRocket
- **Testing**: Vitest, Playwright

## Conclusão

A aplicação já está funcional e pronta para uso básico. As melhorias acima são sugestões para torná-la mais robusta, escalável e com melhor experiência de usuário.

Priorize as funcionalidades de acordo com as necessidades do negócio e feedback dos usuários.
