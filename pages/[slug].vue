<template>
  <section class="space-y-4 sm:space-y-6">
    <!-- Cabeçalho da Loja -->
    <div v-if="store" class="text-center space-y-3 sm:space-y-4">
      <img v-if="store.logo_url" :src="store.logo_url" alt="Logo" class="w-20 h-20 sm:w-24 sm:h-24 mx-auto object-contain" />
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold">{{ store.name }}</h1>
        <p v-if="store.description" class="text-base sm:text-lg opacity-80 mt-1 sm:mt-2 px-4">{{ store.description }}</p>
      </div>
    </div>

    <!-- Busca e Filtros -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
      <h2 class="text-lg sm:text-xl font-semibold">Produtos</h2>
      <input
        v-model="q"
        type="search"
        placeholder="Buscar produtos"
        class="bg-ink-800 border border-white/10 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:border-gold-400 w-full sm:w-64"
      />
    </div>

    <!-- Lista de Produtos -->
    <div v-if="pending" class="opacity-70 text-center py-12">Carregando...</div>
    <div v-else-if="filtered.length === 0" class="text-center opacity-60 py-12">
      Nenhum produto encontrado
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      <ProductCard v-for="p in filtered" :key="p.id" :product="p" :store-logo="store?.logo_url" @add="addToCart" />
    </div>
  </section>
</template>

<script setup lang="ts">
import ProductCard from '@/components/ProductCard.vue'
import { useCart } from '@/composables/useCart'

const route = useRoute()
const router = useRouter()
const client = useSupabaseClient<any>()
const { getStoreBySlug } = useStore()
const { add, setStore } = useCart()
const q = ref('')

// Carregar loja pelo slug
const slug = computed(() => route.params.slug as string)

// Usar asyncData para carregar loja e produtos
const { data: storeData, pending, error: storeError } = await useAsyncData(
  `store-${slug.value}`,
  async () => {
    // Carregar loja
    const { data: storeResult, error } = await getStoreBySlug(slug.value)

    if (error || !storeResult) {
      console.error('Loja não encontrada:', error)
      return null
    }

    // Configurar carrinho para essa loja
    setStore(storeResult.id, storeResult.whatsapp_number)

    // Carregar produtos
    const { data: productsResult, error: productsError } = await client
      .from('products')
      .select('*')
      .eq('store_id', storeResult.id)
      .eq('published', true)
      .gt('stock', 0)
      .order('created_at', { ascending: false })

    if (productsError) {
      console.error('Erro ao carregar produtos:', productsError)
    }

    return {
      store: storeResult,
      products: productsResult || []
    }
  },
  {
    server: true,
    lazy: false,
  }
)

// Redirecionar se loja não encontrada
watch(() => storeData.value, (data) => {
  if (!pending.value && !data) {
    router.push('/')
  }
}, { immediate: true })

const store = computed(() => storeData.value?.store || null)
const products = computed(() => storeData.value?.products || [])

const filtered = computed(() => {
  const list = products.value
  if (!q.value) return list

  return list.filter(p => {
    const searchText = [p.name, p.description].join(' ').toLowerCase()
    return searchText.includes(q.value.toLowerCase())
  })
})

function addToCart(p: any) {
  add(p)
}

// SEO
useHead({
  title: () => store.value ? `${store.value.name} | Catálogo` : 'Catálogo',
  meta: [
    { name: 'description', content: () => store.value?.description || 'Catálogo de produtos' }
  ]
})
</script>
