<template>
  <div>
    <button
      v-if="!user"
      class="px-3 py-2 rounded-md bg-white/10 hover:bg-white/20"
      @click="navigateTo('/login')"
    >Entrar</button>
    <div v-else class="flex items-center gap-2">
      <span class="text-sm opacity-80 hidden sm:block">{{ user.email }}</span>
      <button class="px-3 py-2 rounded-md hover:bg-white/10" @click="logout">Sair</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
const client = useSupabaseClient()

async function logout() {
  await client.auth.signOut()
  await navigateTo('/')
}
</script>

