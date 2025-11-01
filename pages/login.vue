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
      <div class="flex gap-2">
        <button class="px-3 py-2 rounded-md bg-gold-400 text-black font-semibold">Entrar</button>
        <button class="px-3 py-2 rounded-md bg-white/10" type="button" @click="register">Criar conta</button>
      </div>
      <p v-if="error" class="text-red-300 text-sm">{{ error }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
const client = useSupabaseClient()
const route = useRoute()
const email = ref('')
const password = ref('')
const error = ref('')

async function submit() {
  error.value = ''
  const { error: err } = await client.auth.signInWithPassword({ email: email.value, password: password.value })
  if (err) { error.value = err.message; return }
  navigateTo((route.query.next as string) || '/admin/products')
}

async function register() {
  error.value = ''
  const { error: err } = await client.auth.signUp({ email: email.value, password: password.value })
  if (err) { error.value = err.message; return }
  // Redirecionar novo usuário para página de boas-vindas
  navigateTo('/welcome')
}
</script>

