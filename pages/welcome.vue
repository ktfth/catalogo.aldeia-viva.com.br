<template>
  <section class="max-w-2xl mx-auto space-y-8 py-12">
    <!-- Hero -->
    <div class="text-center space-y-4">
      <div class="w-16 h-16 bg-gold-400 rounded-full mx-auto flex items-center justify-center">
        <span class="text-3xl">🎉</span>
      </div>
      <h1 class="text-3xl font-bold">Bem-vindo ao Catálogo Aldeia viva!</h1>
      <p class="text-lg opacity-80">Sua loja foi criada com sucesso. Vamos configurá-la?</p>
    </div>

    <!-- Formulário -->
    <div class="bg-ink-800 border border-white/10 rounded-xl p-6 space-y-6">
      <div class="space-y-2">
        <h2 class="text-xl font-semibold">Configure sua loja</h2>
        <p class="text-sm opacity-70">Estas informações aparecerão no seu catálogo público</p>
      </div>

      <form class="space-y-4" @submit.prevent="save">
        <!-- Nome da Loja -->
        <div class="space-y-1">
          <label class="text-sm opacity-80">Nome da Loja *</label>
          <input
            v-model="form.name"
            required
            placeholder="Ex: Minha Loja de Produtos"
            class="w-full bg-ink-700 border border-white/10 rounded-md px-3 py-2 focus:outline-none focus:border-gold-400"
          />
          <p class="text-xs opacity-60">Como sua loja será chamada</p>
        </div>

        <!-- Slug -->
        <div class="space-y-1">
          <label class="text-sm opacity-80">URL da sua loja *</label>
          <div class="flex items-center gap-2">
            <span class="text-sm opacity-60 whitespace-nowrap">{{ baseUrl }}/</span>
            <input
              v-model="form.slug"
              required
              pattern="[a-z0-9-]+"
              placeholder="minha-loja"
              class="flex-1 bg-ink-700 border border-white/10 rounded-md px-3 py-2 focus:outline-none focus:border-gold-400"
            />
          </div>
          <p class="text-xs opacity-60">Apenas letras minúsculas, números e hífens</p>
        </div>

        <!-- WhatsApp -->
        <div class="space-y-1">
          <label class="text-sm opacity-80">Número do WhatsApp *</label>
          <input
            v-model="form.whatsapp_number"
            required
            pattern="\d{10,15}"
            placeholder="5511999999999"
            class="w-full bg-ink-700 border border-white/10 rounded-md px-3 py-2 focus:outline-none focus:border-gold-400"
          />
          <p class="text-xs opacity-60">
            Formato: DDI + DDD + Número (apenas números)<br>
            Exemplo: 5511999999999 (Brasil, São Paulo)
          </p>
        </div>

        <!-- Descrição (opcional) -->
        <div class="space-y-1">
          <label class="text-sm opacity-80">Descrição (opcional)</label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Descreva sua loja em poucas palavras..."
            class="w-full bg-ink-700 border border-white/10 rounded-md px-3 py-2 focus:outline-none focus:border-gold-400"
          />
        </div>

        <!-- Botões -->
        <div class="flex items-center gap-4 pt-4">
          <button
            type="submit"
            :disabled="saving"
            class="px-6 py-3 rounded-md bg-gold-400 text-black font-semibold hover:bg-gold-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ saving ? 'Salvando...' : 'Começar' }}
          </button>
          <button
            type="button"
            @click="skip"
            class="px-6 py-3 rounded-md bg-white/10 hover:bg-white/20"
          >
            Fazer depois
          </button>
        </div>

        <p v-if="error" class="text-red-300 text-sm">{{ error }}</p>
      </form>
    </div>

    <!-- Dica -->
    <div class="bg-gold-400/10 border border-gold-400/20 rounded-xl p-4">
      <p class="text-sm">
        <strong>💡 Dica:</strong> Você poderá alterar todas essas configurações depois em
        <NuxtLink to="/admin/store" class="underline">Minha Loja</NuxtLink>
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { currentStore, loadCurrentUserStore, createStore, isStoreConfigured } = useStore()
const user = useSupabaseUser()
const router = useRouter()

const form = reactive({
  name: '',
  slug: '',
  whatsapp_number: '',
  description: '',
})

const saving = ref(false)
const error = ref('')

// Calcular URL base dinamicamente
const baseUrl = computed(() => {
  if (process.client) {
    return window.location.origin
  }
  return ''
})

onMounted(async () => {
  await loadCurrentUserStore()

  // Se a loja já está configurada, redirecionar para produtos
  if (currentStore.value && isStoreConfigured.value) {
    await router.push('/admin/products')
    return
  }

  // Se a loja existe mas não está configurada, pré-preencher formulário
  if (currentStore.value) {
    console.log('[welcome] Loja existe mas não está configurada, pré-preenchendo formulário')
    form.name = currentStore.value.name !== 'Minha Loja' ? currentStore.value.name : ''
    form.slug = currentStore.value.slug
    form.whatsapp_number = currentStore.value.whatsapp_number !== '5500000000000' ? currentStore.value.whatsapp_number : ''
    form.description = currentStore.value.description || ''
  } else {
    // Gerar slug sugerido baseado no email
    if (user.value?.email && !form.slug) {
      const baseName = user.value.email.split('@')[0]
      form.slug = baseName.toLowerCase().replace(/[^a-z0-9]/g, '-')
    }
  }
})

async function save() {
  error.value = ''
  saving.value = true

  try {
    const cleanSlug = form.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-')

    // createStore agora automaticamente detecta se a loja existe
    // e atualiza ou cria conforme necessário
    console.log('[welcome] Salvando loja...')
    const { error: saveError } = await createStore({
      name: form.name,
      slug: cleanSlug,
      whatsapp_number: form.whatsapp_number,
      description: form.description || undefined,
    })

    if (saveError) {
      error.value = saveError.message
    } else {
      await router.push('/admin/products')
    }
  } catch (e: any) {
    error.value = e.message || 'Erro ao salvar loja'
  } finally {
    saving.value = false
  }
}

async function skip() {
  await router.push('/admin/products')
}
</script>
