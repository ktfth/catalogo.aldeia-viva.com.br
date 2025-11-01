<template>
  <section class="space-y-8">
    <!-- Hero -->
    <div class="text-center space-y-4 py-12">
      <h1 class="text-4xl font-bold">Lojas Disponíveis</h1>
      <p class="text-lg opacity-80">Explore os catálogos das lojas cadastradas</p>
    </div>

    <!-- Busca -->
    <div class="max-w-2xl mx-auto">
      <input v-model="q" type="search" placeholder="Buscar lojas..." class="w-full bg-ink-800 border border-white/10 rounded-md px-4 py-3 focus:outline-none focus:border-gold-400" />
    </div>

    <!-- Lista de Lojas -->
    <div v-if="pending" class="opacity-70 text-center">Carregando...</div>
    <div v-else-if="filtered.length === 0" class="text-center opacity-60 py-12">
      Nenhuma loja encontrada
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <NuxtLink
        v-for="store in filtered"
        :key="store.id"
        :to="`/${store.slug}`"
        class="block border border-white/10 rounded-xl p-6 bg-ink-800 hover:bg-ink-700 transition-colors space-y-4"
      >
        <!-- Logo -->
        <div v-if="store.logo_url" class="w-full h-32 flex items-center justify-center">
          <img :src="store.logo_url" :alt="store.name" class="max-w-full max-h-full object-contain" />
        </div>
        <div v-else class="w-full h-32 bg-white/5 rounded flex items-center justify-center text-4xl font-bold opacity-20">
          {{ store.name.charAt(0) }}
        </div>

        <!-- Info -->
        <div class="space-y-2">
          <h3 class="text-xl font-semibold">{{ store.name }}</h3>
          <p v-if="store.description" class="text-sm opacity-70 line-clamp-2">{{ store.description }}</p>
          <div class="flex items-center gap-2 text-sm opacity-60">
            <span>Ver catálogo →</span>
          </div>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
const client = useSupabaseClient<any>()
const q = ref('')

// Usar asyncData para SSR correto
const { data: stores, pending, error } = await useAsyncData(
  'stores',
  async () => {
    const { data, error } = await client
      .from('stores')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao carregar lojas:', error)
      return []
    }

    return data || []
  },
  {
    server: true,
    lazy: false,
  }
)

const filtered = computed(() => {
  const list = stores.value || []
  if (!q.value) return list

  return list.filter(s => {
    const searchText = [s.name, s.description, s.slug].join(' ').toLowerCase()
    return searchText.includes(q.value.toLowerCase())
  })
})

// SEO
useHead({
  title: 'Lojas | Catálogo Multi-Tenant',
  meta: [
    { name: 'description', content: 'Explore catálogos de produtos de diversas lojas' }
  ]
})
</script>

