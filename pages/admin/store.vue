<template>
  <section class="space-y-6">
    <h1 class="text-2xl font-semibold">Configurações da Loja</h1>

    <div v-if="loading || isLoading" class="opacity-70 text-center py-12">Carregando...</div>
    <div v-else-if="loadError || (isError && !store)" class="text-red-300 text-center py-12">
      <p>{{ loadError || message || 'Erro ao carregar loja' }}</p>
      <button @click="$router.push('/welcome')" class="mt-4 px-4 py-2 bg-gold-400 text-black rounded-md">
        Configurar Loja
      </button>
    </div>

    <form v-else-if="store" class="max-w-2xl space-y-6" @submit.prevent="save">
      <!-- Informações Básicas -->
      <div class="bg-ink-800 border border-white/10 rounded-xl p-6 space-y-4">
        <h2 class="text-lg font-semibold">Informações Básicas</h2>

        <div class="space-y-1">
          <label class="text-sm opacity-80">Nome da Loja *</label>
          <input v-model="form.name" required class="w-full bg-ink-700 border border-white/10 rounded-md px-3 py-2 focus:outline-none focus:border-gold-400" />
          <p class="text-xs opacity-60">Nome que aparecerá no seu catálogo</p>
        </div>

        <div class="space-y-1">
          <label class="text-sm opacity-80">Slug (URL) *</label>
          <div class="flex items-center gap-2">
            <span class="text-sm opacity-60">catalogo.app/</span>
            <input v-model="form.slug" required pattern="[a-z0-9-]+" class="flex-1 bg-ink-700 border border-white/10 rounded-md px-3 py-2 focus:outline-none focus:border-gold-400" />
          </div>
          <p class="text-xs opacity-60">Apenas letras minúsculas, números e hífens</p>
        </div>

        <div class="space-y-1">
          <label class="text-sm opacity-80">Descrição</label>
          <textarea v-model="form.description" rows="3" class="w-full bg-ink-700 border border-white/10 rounded-md px-3 py-2 focus:outline-none focus:border-gold-400" placeholder="Descreva sua loja em poucas palavras..." />
        </div>
      </div>

      <!-- WhatsApp -->
      <div class="bg-ink-800 border border-white/10 rounded-xl p-6 space-y-4">
        <h2 class="text-lg font-semibold">WhatsApp</h2>

        <div class="space-y-1">
          <label class="text-sm opacity-80">Número do WhatsApp *</label>
          <input v-model="form.whatsapp_number" required pattern="\d{10,15}" placeholder="5511999999999" class="w-full bg-ink-700 border border-white/10 rounded-md px-3 py-2 focus:outline-none focus:border-gold-400" />
          <p class="text-xs opacity-60">Formato: DDI + DDD + Número (apenas números). Ex: 5511999999999</p>
        </div>
      </div>

      <!-- Logo -->
      <div class="bg-ink-800 border border-white/10 rounded-xl p-6 space-y-4">
        <h2 class="text-lg font-semibold">Logo</h2>

        <ImageUpload
          v-model="form.logo_url"
          bucket="store-logos"
          :folder="store?.id"
          label="Logo da Loja"
          help-text="Logo que aparecerá no topo do seu catálogo"
          :allow-url-input="true"
        />
      </div>

      <!-- Visibilidade -->
      <div class="bg-ink-800 border border-white/10 rounded-xl p-6 space-y-4">
        <h2 class="text-lg font-semibold">Visibilidade</h2>

        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" v-model="form.published" class="accent-gold-400" />
          Loja publicada (visível para o público)
        </label>
      </div>

      <!-- Ações -->
      <div class="flex items-center gap-4">
        <button type="submit" class="px-4 py-2 rounded-md bg-gold-400 text-black font-semibold hover:bg-gold-300">
          Salvar Alterações
        </button>
        <span v-if="message" class="text-sm" :class="isError ? 'text-red-300' : 'text-green-300'">{{ message }}</span>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { currentStore, isLoading, loadError, loadCurrentUserStore, updateStore } = useStore()

const store = computed(() => currentStore.value)

const form = reactive({
  name: '',
  slug: '',
  description: '',
  whatsapp_number: '',
  logo_url: '',
  published: true,
})

const message = ref('')
const isError = ref(false)
const loading = ref(true)

// Carregar dados da loja
onMounted(async () => {
  loading.value = true
  try {
    const result = await loadCurrentUserStore()

    // Se a loja não foi encontrada, redirecionar para welcome
    if (result.error === 'STORE_NOT_FOUND') {
      console.log('[store] Loja não encontrada, redirecionando para /welcome')
      await navigateTo('/welcome')
      return
    }

    if (result.error) {
      isError.value = true
      message.value = result.error
      loading.value = false
      return
    }

    if (store.value) {
      form.name = store.value.name
      form.slug = store.value.slug
      form.description = store.value.description || ''
      form.whatsapp_number = store.value.whatsapp_number
      form.logo_url = store.value.logo_url || ''
      form.published = store.value.published
    }
  } catch (error: any) {
    console.error('Erro ao carregar loja:', error)
    isError.value = true
    message.value = error.message || 'Erro ao carregar dados da loja'
  } finally {
    loading.value = false
  }
})

async function save() {
  message.value = ''
  isError.value = false

  try {
    const { error } = await updateStore({
      name: form.name,
      slug: form.slug,
      description: form.description || null,
      whatsapp_number: form.whatsapp_number,
      logo_url: form.logo_url || null,
      published: form.published,
    })

    if (error) {
      message.value = error.message || 'Erro ao salvar loja'
      isError.value = true
    } else {
      message.value = 'Loja atualizada com sucesso!'
      isError.value = false

      // Atualizar o formulário com os novos dados
      if (store.value) {
        form.name = store.value.name
        form.slug = store.value.slug
        form.description = store.value.description || ''
        form.whatsapp_number = store.value.whatsapp_number
        form.logo_url = store.value.logo_url || ''
        form.published = store.value.published
      }
    }
  } catch (error: any) {
    console.error('Erro ao salvar:', error)
    message.value = error.message || 'Erro inesperado ao salvar'
    isError.value = true
  }
}
</script>
