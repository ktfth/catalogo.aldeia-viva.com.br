# Sistema de Upload de Imagens

Este documento descreve a implementação do sistema de upload de imagens para o bucket do Supabase no projeto.

## 📁 Estrutura de Buckets

O sistema utiliza três buckets públicos no Supabase Storage:

### 1. **product-images**
- **Tamanho máximo:** 5MB
- **Formatos aceitos:** PNG, JPEG, JPG, WebP, GIF
- **Estrutura de pastas:** `{store_id}/{filename}`
- **Uso:** Imagens de produtos no catálogo

### 2. **store-logos**
- **Tamanho máximo:** 2MB
- **Formatos aceitos:** PNG, JPEG, JPG, WebP, SVG
- **Estrutura de pastas:** `{store_id}/{filename}`
- **Uso:** Logo da loja exibido no header do catálogo

### 3. **avatars**
- **Tamanho máximo:** 1MB
- **Formatos aceitos:** PNG, JPEG, JPG, WebP
- **Estrutura de pastas:** `{user_id}/{filename}`
- **Uso:** Avatar de perfil de usuários (futuro)

## 🔐 Políticas de Segurança (RLS)

Todas as políticas de Row Level Security foram configuradas na migration [0004_storage_setup.sql](../supabase/migrations/0004_storage_setup.sql):

### Product Images
- ✅ **Leitura:** Público (qualquer pessoa pode visualizar)
- ✅ **Upload:** Apenas donos da loja (pasta = store_id)
- ✅ **Atualização:** Apenas donos da loja
- ✅ **Exclusão:** Apenas donos da loja

### Store Logos
- ✅ **Leitura:** Público (qualquer pessoa pode visualizar)
- ✅ **Upload:** Apenas donos da loja (pasta = store_id)
- ✅ **Atualização:** Apenas donos da loja
- ✅ **Exclusão:** Apenas donos da loja

### Avatars
- ✅ **Leitura:** Público (qualquer pessoa pode visualizar)
- ✅ **Upload:** Apenas o próprio usuário (pasta = user_id)
- ✅ **Atualização:** Apenas o próprio usuário
- ✅ **Exclusão:** Apenas o próprio usuário

### Admin Override
- ✅ Administradores têm acesso total a todos os buckets

## 🛠️ Arquitetura do Sistema

### 1. Composable: `useImageUpload.ts`

Fornece funções utilitárias para gerenciar uploads de imagens:

```typescript
const {
  uploadImage,      // Fazer upload de uma imagem
  deleteImage,      // Deletar uma imagem
  replaceImage,     // Substituir uma imagem existente
  getPublicUrl,     // Obter URL pública de uma imagem
  getPathFromUrl,   // Extrair path de uma URL pública
  validateFile,     // Validar arquivo antes do upload
  maxSizes          // Tamanhos máximos por bucket
} = useImageUpload()
```

**Principais features:**
- Validação de tipo e tamanho de arquivo
- Geração de nomes únicos para arquivos
- Gestão de URLs públicas
- Tratamento de erros consistente

### 2. Componente: `ImageUpload.vue`

Componente reutilizável com UI completa para upload de imagens:

```vue
<ImageUpload
  v-model="form.image_url"
  bucket="product-images"
  :folder="storeId"
  label="Imagem do Produto"
  help-text="Será exibida no catálogo"
  :allow-url-input="true"
/>
```

**Features incluídas:**
- 📤 Upload por clique ou drag & drop
- 🖼️ Preview de imagem com opção de remoção
- ⏳ Indicador de progresso durante upload
- ❌ Validação e mensagens de erro
- 🔗 Opção de inserir URL manualmente (opcional)
- 🎨 Design consistente com o tema do projeto

**Props disponíveis:**
- `modelValue` (string | null): URL da imagem atual
- `bucket` (ImageBucket): Bucket do Supabase ('product-images' | 'store-logos' | 'avatars')
- `folder` (string?): Pasta dentro do bucket (geralmente store_id ou user_id)
- `label` (string?): Label do campo
- `helpText` (string?): Texto de ajuda
- `maxSizeMB` (number?): Tamanho máximo customizado
- `allowedTypes` (string[]?): Tipos MIME permitidos customizados
- `allowUrlInput` (boolean): Habilitar input de URL manual (padrão: false)
- `generateUniqueName` (boolean): Gerar nome único para arquivo (padrão: true)

**Eventos:**
- `update:modelValue`: Emitido quando a URL da imagem muda
- `upload`: Emitido após upload bem-sucedido com { url, path }
- `remove`: Emitido quando a imagem é removida

## 📍 Implementações Atuais

### 1. Página de Produtos (`/pages/admin/products.vue`)

```vue
<ImageUpload
  v-model="form.image_url"
  bucket="product-images"
  :folder="currentStore?.id"
  label="Imagem do Produto"
  help-text="Imagem do produto que será exibida no catálogo"
  :allow-url-input="true"
/>
```

- Upload de imagens de produtos
- Armazenamento na pasta da loja (`store_id`)
- Permite inserir URL externa como alternativa

### 2. Página de Configuração (`/pages/admin/store.vue`)

```vue
<ImageUpload
  v-model="form.logo_url"
  bucket="store-logos"
  :folder="store?.id"
  label="Logo da Loja"
  help-text="Logo que aparecerá no topo do seu catálogo"
  :allow-url-input="true"
/>
```

- Upload do logo da loja
- Armazenamento na pasta da loja (`store_id`)
- Permite inserir URL externa como alternativa

## 🚀 Como Usar em Novos Locais

### Exemplo: Avatar de Usuário

```vue
<template>
  <ImageUpload
    v-model="avatarUrl"
    bucket="avatars"
    :folder="user?.id"
    label="Foto de Perfil"
    help-text="Sua foto de perfil pública"
    :max-size-m-b="1"
  />
</template>

<script setup>
const user = useSupabaseUser()
const avatarUrl = ref('')

// Quando o upload for bem-sucedido
const handleUpload = ({ url, path }) => {
  console.log('Upload concluído:', url)
  // Atualizar banco de dados se necessário
  await updateProfile({ avatar_url: url })
}
</script>
```

## 🔧 Configuração

### 1. Buckets (config.toml)

Os buckets são configurados no arquivo [supabase/config.toml](../supabase/config.toml):

```toml
[storage.buckets.product-images]
public = true
file_size_limit = "5MiB"
allowed_mime_types = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"]
objects_path = "./storage/product-images"
```

### 2. Migration (RLS Policies)

As políticas de segurança são criadas na migration [0004_storage_setup.sql](../supabase/migrations/0004_storage_setup.sql).

Para aplicar a migration localmente:
```bash
pnpm supabase db reset
```

Para produção:
```bash
pnpm supabase db push
```

## 📊 Banco de Dados

Os campos de imagem no banco são do tipo `text` e aceitam valores `null`:

```sql
-- Tabela products
image_url text

-- Tabela stores
logo_url text

-- Tabela profiles
avatar_url text
```

Estes campos armazenam a URL pública completa, seja do Supabase Storage ou externa.

## ✅ Validações

### Validação de Tipo
Apenas tipos de imagem permitidos são aceitos. Tipos customizados podem ser definidos por bucket.

### Validação de Tamanho
Tamanhos máximos por bucket:
- Product Images: 5MB
- Store Logos: 2MB
- Avatars: 1MB

### Validação de Autenticação
Apenas usuários autenticados podem fazer upload. As políticas RLS garantem que apenas donos da loja/usuários possam fazer upload em suas respectivas pastas.

## 🐛 Tratamento de Erros

O sistema fornece mensagens de erro claras para:
- ❌ Arquivo muito grande
- ❌ Tipo de arquivo não permitido
- ❌ Usuário não autenticado
- ❌ Erro ao fazer upload
- ❌ Erro ao carregar preview

## 🎨 UI/UX Features

- **Drag & Drop:** Arraste imagens diretamente para a área de upload
- **Preview:** Visualização instantânea da imagem antes de salvar
- **Progress:** Indicador visual durante o upload
- **Remove:** Botão para remover imagem facilmente
- **URL Input:** Opção de inserir URL externa (quando habilitado)
- **Responsivo:** Design adaptável para mobile e desktop

## 📝 Notas Importantes

1. **URLs Públicas:** Todos os buckets são públicos. As URLs geradas podem ser acessadas sem autenticação.

2. **Organização por Pasta:** Os uploads são organizados por `store_id` ou `user_id` para facilitar gestão e aplicação de políticas RLS.

3. **Nome de Arquivos:** Por padrão, nomes únicos são gerados automaticamente (`timestamp-random.ext`) para evitar conflitos.

4. **Backward Compatibility:** O sistema ainda aceita URLs externas, permitindo migração gradual e flexibilidade.

5. **Cache:** As imagens do Supabase Storage são servidas com cache de 1 hora (`cacheControl: '3600'`).

## 🔮 Próximos Passos Possíveis

- [ ] Implementar upload de avatar de usuário
- [ ] Adicionar redimensionamento automático de imagens
- [ ] Implementar galeria de múltiplas imagens por produto
- [ ] Adicionar cropping de imagens
- [ ] Implementar compressão automática antes do upload
- [ ] Adicionar suporte para múltiplos idiomas nas mensagens

## 📚 Referências

- [Documentação do Supabase Storage](https://supabase.com/docs/guides/storage)
- [RLS Policies no Storage](https://supabase.com/docs/guides/storage/security/access-control)
- [Configuração de Buckets](https://supabase.com/docs/reference/cli/config)
