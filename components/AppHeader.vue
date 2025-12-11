<template>
  <header class="border-b border-white/10 sticky top-0 backdrop-blur bg-ink-900/80 z-50">
    <div class="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
      <NuxtLink to="/" class="flex items-center gap-2 group flex-shrink-0">
        <span class="w-2 h-2 rounded-full bg-gold-400 group-hover:scale-125 transition" />
        <span class="tracking-wide font-semibold text-sm sm:text-base">Catálogo - Aldeia Viva</span>
      </NuxtLink>

      <!-- Desktop Navigation -->
      <nav class="hidden md:flex items-center gap-2">
        <NuxtLink to="/marketplace" class="px-3 py-2 text-sm rounded-md hover:bg-white/5">Lojas</NuxtLink>
        <template v-if="user">
          <NuxtLink to="/admin/store" class="px-3 py-2 text-sm rounded-md hover:bg-white/5">Minha Loja</NuxtLink>
          <NuxtLink to="/admin/products" class="px-3 py-2 text-sm rounded-md hover:bg-white/5">Produtos</NuxtLink>
        </template>
        <CartButton />
        <AuthMenu />
      </nav>

      <!-- Mobile Navigation -->
      <div class="flex md:hidden items-center gap-2">
        <CartButton />
        <button
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="p-2 rounded-md hover:bg-white/5 transition"
          aria-label="Menu"
        >
          <svg v-if="!mobileMenuOpen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Menu Dropdown -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <nav
        v-if="mobileMenuOpen"
        class="md:hidden border-t border-white/10 bg-ink-900/95 backdrop-blur"
      >
        <div class="max-w-6xl mx-auto px-3 py-3 space-y-1">
          <NuxtLink
            to="/marketplace"
            @click="mobileMenuOpen = false"
            class="block px-3 py-2 text-sm rounded-md hover:bg-white/5 transition"
          >
            Lojas
          </NuxtLink>
          <template v-if="user">
            <NuxtLink
              to="/admin/store"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2 text-sm rounded-md hover:bg-white/5 transition"
            >
              Minha Loja
            </NuxtLink>
            <NuxtLink
              to="/admin/products"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2 text-sm rounded-md hover:bg-white/5 transition"
            >
              Produtos
            </NuxtLink>
          </template>

          <!-- Auth Menu Mobile -->
          <div class="pt-2 border-t border-white/10">
            <template v-if="user">
              <div class="px-3 py-2 text-xs opacity-60">Logado como</div>
              <div class="px-3 py-1 text-sm opacity-80 truncate">{{ user.email }}</div>
              <button
                @click="handleSignOut"
                class="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-white/5 text-red-300 transition"
              >
                Sair
              </button>
            </template>
            <template v-else>
              <NuxtLink
                to="/login"
                @click="mobileMenuOpen = false"
                class="block px-3 py-2 text-sm rounded-md hover:bg-white/5 transition"
              >
                Login
              </NuxtLink>
            </template>
          </div>
        </div>
      </nav>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import CartButton from './CartButton.vue'
import AuthMenu from './AuthMenu.vue'

const user = useSupabaseUser()
const client = useSupabaseClient()
const router = useRouter()
const mobileMenuOpen = ref(false)

// Fechar menu ao navegar
watch(() => router.currentRoute.value.path, () => {
  mobileMenuOpen.value = false
})

async function handleSignOut() {
  await client.auth.signOut()
  mobileMenuOpen.value = false
  router.push('/')
}
</script>

