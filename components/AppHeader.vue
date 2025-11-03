<template>
  <header class="border-b border-white/10 sticky top-0 backdrop-blur bg-ink-900/80 z-20">
    <div class="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
      <NuxtLink to="/" class="flex items-center gap-2 group flex-shrink-0">
        <span class="w-2 h-2 rounded-full bg-gold-400 group-hover:scale-125 transition" />
        <span class="tracking-wide font-semibold text-sm sm:text-base">Catálogo - Aldeia Viva</span>
      </NuxtLink>
      <nav class="flex items-center gap-1 sm:gap-2">
        <NuxtLink to="/" class="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md hover:bg-white/5">Lojas</NuxtLink>
        <template v-if="user">
          <NuxtLink to="/admin/store" class="hidden md:block px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md hover:bg-white/5">Minha Loja</NuxtLink>
          <NuxtLink to="/admin/products" class="hidden md:block px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md hover:bg-white/5">Produtos</NuxtLink>
        </template>
        <CartButton />
        <AuthMenu />
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import CartButton from './CartButton.vue'
import AuthMenu from './AuthMenu.vue'

const user = useSupabaseUser()
</script>

