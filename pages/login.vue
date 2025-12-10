<template>
  <div class="max-w-md mx-auto bg-ink-800 border border-white/10 rounded-xl p-6 space-y-4">
    <h1 class="text-xl font-semibold">Entrar ou criar conta</h1>
    <form class="space-y-3" @submit.prevent="submit">
      <div class="space-y-1">
        <label class="text-sm opacity-80">Email</label>
        <input v-model="email" type="email" required class="w-full bg-ink-700 border border-white/10 rounded-md px-3 py-2 focus:outline-none focus:border-gold-400" />
      </div>
      <div class="space-y-1">
        <label class="text-sm opacity-80">Senha</label>
        <input v-model="password" type="password" required minlength="6" class="w-full bg-ink-700 border border-white/10 rounded-md px-3 py-2 focus:outline-none focus:border-gold-400" />
      </div>
      <div ref="hcaptchaContainer" class="h-captcha"></div>
      <div class="flex gap-2">
        <button class="px-3 py-2 rounded-md bg-gold-400 text-black font-semibold" :disabled="loading">
          {{ loading ? 'Aguarde...' : 'Entrar' }}
        </button>
        <button class="px-3 py-2 rounded-md bg-white/10" type="button" @click="register" :disabled="loading">
          Criar conta
        </button>
      </div>
      <p v-if="error" class="text-red-300 text-sm">{{ error }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
const client = useSupabaseClient()
const route = useRoute()
const config = useRuntimeConfig()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const hcaptchaContainer = ref<HTMLElement | null>(null)

// Interface para o hCaptcha
interface HCaptcha {
  render: (container: HTMLElement, params: any) => string
  reset: (widgetId?: string) => void
  getResponse: (widgetId?: string) => string
  execute: (widgetId?: string) => void
}

declare global {
  interface Window {
    hcaptcha?: HCaptcha
  }
}

let hcaptchaWidgetId: string | null = null

// Renderizar o widget do hCaptcha quando o componente for montado
onMounted(() => {
  if (!config.public.hcaptchaSiteKey) {
    console.warn('hCaptcha site key não configurada. Configure NUXT_PUBLIC_HCAPTCHA_SITE_KEY no arquivo .env')
    return
  }

  // Esperar o script do hCaptcha carregar
  const interval = setInterval(() => {
    if (window.hcaptcha && hcaptchaContainer.value) {
      clearInterval(interval)
      try {
        hcaptchaWidgetId = window.hcaptcha.render(hcaptchaContainer.value, {
          sitekey: config.public.hcaptchaSiteKey,
          theme: 'dark',
        })
      } catch (e) {
        console.error('Erro ao renderizar hCaptcha:', e)
      }
    }
  }, 100)

  // Limpar o intervalo após 10 segundos se não carregar
  setTimeout(() => clearInterval(interval), 10000)
})

// Função para obter o token do hCaptcha
function getHCaptchaToken(): string | null {
  if (!window.hcaptcha || !hcaptchaWidgetId) {
    return null
  }
  return window.hcaptcha.getResponse(hcaptchaWidgetId) || null
}

// Função para resetar o hCaptcha
function resetHCaptcha() {
  if (window.hcaptcha && hcaptchaWidgetId) {
    window.hcaptcha.reset(hcaptchaWidgetId)
  }
}

async function submit() {
  error.value = ''
  loading.value = true

  try {
    const captchaToken = getHCaptchaToken()

    const { error: err } = await client.auth.signInWithPassword({
      email: email.value,
      password: password.value,
      options: {
        captchaToken: captchaToken || undefined,
      },
    })

    if (err) {
      error.value = translateAuthError(err.message)
      resetHCaptcha()
      return
    }

    navigateTo((route.query.next as string) || '/admin/products')
  } finally {
    loading.value = false
  }
}

async function register() {
  error.value = ''
  loading.value = true

  try {
    const captchaToken = getHCaptchaToken()

    const { data, error: err } = await client.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        emailRedirectTo: undefined, // Desabilitar verificação de email em produção
        captchaToken: captchaToken || undefined,
      },
    })

    if (err) {
      error.value = translateAuthError(err.message)
      resetHCaptcha()
      return
    }

    // Aguardar um pouco para o trigger criar a loja
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Verificar se o usuário foi autenticado automaticamente
    if (data.session) {
      // Usuário logado com sucesso, redirecionar para welcome
      navigateTo('/welcome')
    } else {
      // Se não houver sessão, pode ser que precise confirmar email
      error.value = 'Por favor, verifique seu email para confirmar o cadastro.'
    }
  } finally {
    loading.value = false
  }
}
</script>

