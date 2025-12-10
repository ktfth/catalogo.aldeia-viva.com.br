<template>
  <section class="space-y-4 sm:space-y-6">
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
      <h1 class="text-xl sm:text-2xl font-semibold">Produtos</h1>
      <button v-if="currentStore" class="px-3 py-2 text-sm sm:text-base rounded-md bg-gold-400 text-black font-semibold" @click="toggleForm = !toggleForm">
        {{ toggleForm ? 'Cancelar' : 'Novo produto' }}
      </button>
    </div>

    <div v-if="initLoading || isLoading" class="opacity-70 text-center py-12">Carregando sua loja...</div>
    <div v-else-if="loadError" class="text-red-300 text-center py-12">Erro: {{ loadError }}</div>
    <div v-else-if="!currentStore" class="opacity-70 text-center py-12">Loja não encontrada</div>

    <template v-else>
    <div v-if="toggleForm" class="bg-ink-800 border border-white/10 rounded-lg sm:rounded-xl p-4 sm:p-6">
      <form class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4" @submit.prevent="save">
        <div>
          <label class="text-xs sm:text-sm opacity-80 block mb-1">Nome</label>
          <input v-model="form.name" required class="w-full bg-ink-700 border border-white/10 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:border-gold-400" />
        </div>
        <div>
          <label class="text-xs sm:text-sm opacity-80 block mb-1">Preço (R$)</label>
          <input v-model.number="form.price" type="number" min="0" step="0.01" required class="w-full bg-ink-700 border border-white/10 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:border-gold-400" />
        </div>
        <div class="md:col-span-2">
          <label class="text-xs sm:text-sm opacity-80 block mb-1">Descrição</label>
          <textarea v-model="form.description" rows="3" class="w-full bg-ink-700 border border-white/10 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:border-gold-400" />
        </div>
        <div class="md:col-span-2">
          <ImageUpload
            v-model="form.image_url"
            bucket="product-images"
            :folder="currentStore?.id"
            label="Imagem do Produto"
            help-text="Imagem do produto que será exibida no catálogo (opcional - logo da loja será usado como fallback)"
            :allow-url-input="true"
          />
        </div>
        <div>
          <label class="text-xs sm:text-sm opacity-80 block mb-1">Estoque</label>
          <input v-model.number="form.stock" type="number" min="0" class="w-full bg-ink-700 border border-white/10 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:border-gold-400" />
        </div>
        <div class="md:col-span-2 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <label class="flex items-center gap-2 text-xs sm:text-sm"><input type="checkbox" v-model="form.published" class="accent-gold-400"/> Publicado</label>
          <button class="w-full sm:w-auto px-4 py-2 rounded-md bg-gold-400 text-black font-semibold hover:bg-gold-300">Salvar Produto</button>
          <span v-if="err" class="text-red-300 text-xs sm:text-sm">{{ err }}</span>
        </div>
      </form>
    </div>

    <div v-if="loadingProducts" class="text-center opacity-70 py-8">Carregando produtos...</div>
    <div v-else-if="products.length === 0" class="text-center opacity-60 py-12 bg-ink-800 border border-white/10 rounded-lg sm:rounded-xl">
      Nenhum produto cadastrado. Clique em "Novo produto" para começar.
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      <div v-for="p in products" :key="p.id" class="border border-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 bg-ink-800 space-y-2">
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-sm sm:text-base truncate">{{ p.name }}</div>
            <div class="text-xs sm:text-sm opacity-70">{{ currency(p.price_cents) }}</div>
          </div>
          <span class="text-xs px-2 py-0.5 sm:py-1 rounded border border-white/10 whitespace-nowrap flex-shrink-0" :class="p.published ? 'text-green-300' : 'text-yellow-300'">
            {{ p.published ? 'Publicado' : 'Rascunho' }}
          </span>
        </div>
        <div class="text-xs sm:text-sm line-clamp-2">{{ p.description }}</div>
        <div class="text-xs opacity-80">Estoque: {{ p.stock }}</div>
        <div class="flex flex-wrap gap-1.5 sm:gap-2">
          <button class="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md bg-white/10 hover:bg-white/20" @click="togglePublish(p)">
            {{ p.published ? 'Ocultar' : 'Publicar' }}
          </button>
          <button class="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md bg-white/10 hover:bg-white/20" @click="adjustStock(p, 1)">+1</button>
          <button class="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md bg-white/10 hover:bg-white/20" @click="adjustStock(p, -1)" :disabled="p.stock<=0">-1</button>
          <button class="ml-auto px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md bg-red-500/20 hover:bg-red-500/30" @click="remove(p)">Excluir</button>
        </div>
      </div>
    </div>
    </template>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
import { useCurrency } from '@/composables/useCart'

const { currency } = useCurrency()
const { currentStore, isLoading, loadError, loadCurrentUserStore } = useStore()
const client = useSupabaseClient<any>()
const toggleForm = ref(false)
const err = ref('')

const form = reactive({ name: '', description: '', price: 0, image_url: '', stock: 0, published: true })

// Carregar loja e produtos
const products = ref<any[]>([])
const loadingProducts = ref(false)

async function loadProducts() {
  if (!currentStore.value) return

  loadingProducts.value = true
  console.log('[loadProducts] Carregando produtos para loja:', currentStore.value.id)

  const { data, error } = await client
    .from('products')
    .select('*')
    .eq('store_id', currentStore.value.id)
    .order('created_at', { ascending: false })

  if (!error && data) {
    console.log('[loadProducts] Produtos carregados:', data.length)
    console.log('[loadProducts] Produtos:', data)
    products.value = data
  } else if (error) {
    console.error('[loadProducts] Erro ao carregar produtos:', error)
  }
  loadingProducts.value = false
}

async function refresh() {
  await loadProducts()
}

// Carregar dados ao montar
const initLoading = ref(true)

onMounted(async () => {
  try {
    console.log('[products] Iniciando carregamento da página de produtos')
    const result = await loadCurrentUserStore()

    console.log('[products] Resultado do loadCurrentUserStore:', result)
    console.log('[products] currentStore.value:', currentStore.value)

    // Se a loja não foi encontrada, redirecionar para welcome
    if (result.error === 'STORE_NOT_FOUND') {
      console.log('[products] Loja não encontrada, redirecionando para /welcome')
      await navigateTo('/welcome')
      return
    }

    if (currentStore.value) {
      console.log('[products] Loja carregada, ID:', currentStore.value.id, 'Nome:', currentStore.value.name)
      await loadProducts()
    } else {
      console.warn('[products] currentStore.value é null após loadCurrentUserStore')
    }
  } catch (error) {
    console.error('[products] Erro ao inicializar:', error)
  } finally {
    initLoading.value = false
  }
})

async function save() {
  if (!currentStore.value) {
    err.value = 'Loja não encontrada'
    return
  }

  err.value = ''
  const payload = {
    name: form.name,
    description: form.description,
    price_cents: Math.round(form.price * 100),
    image_url: form.image_url,
    stock: form.stock,
    published: form.published,
    store_id: currentStore.value.id,
  }

  console.log('[save] Salvando produto:', payload)
  const { data, error } = await client.from('products').insert(payload).select()

  if (error) {
    console.error('[save] Erro ao salvar produto:', error)
    err.value = error.message
    return
  }

  console.log('[save] Produto salvo com sucesso:', data)
  toggleForm.value = false
  Object.assign(form, { name: '', description: '', price: 0, image_url: '', stock: 0, published: true })
  await refresh()
}

async function togglePublish(p: any) {
  await client.from('products').update({ published: !p.published }).eq('id', p.id)
  await refresh()
}
async function adjustStock(p: any, delta: number) {
  await client.from('products').update({ stock: Math.max(0, (p.stock || 0) + delta) }).eq('id', p.id)
  await refresh()
}
async function remove(p: any) {
  await client.from('products').delete().eq('id', p.id)
  await refresh()
}
</script>

