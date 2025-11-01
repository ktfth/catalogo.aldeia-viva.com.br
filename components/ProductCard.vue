<template>
  <div class="group rounded-xl border border-white/10 overflow-hidden bg-ink-800 hover:border-gold-400/50 transition">
    <div class="aspect-[4/3] bg-ink-700 overflow-hidden">
      <img :src="product.image_url || placeholder" alt="" class="w-full h-full object-cover group-hover:scale-[1.02] transition"/>
    </div>
    <div class="p-4 flex flex-col gap-2">
      <div class="flex items-start justify-between gap-3">
        <h3 class="font-semibold">{{ product.name }}</h3>
        <div class="text-gold-300 font-semibold whitespace-nowrap">{{ currency(product.price_cents) }}</div>
      </div>
      <p class="text-sm opacity-80 line-clamp-2">{{ product.description }}</p>
      <div class="flex items-center justify-between">
        <span class="text-xs opacity-70">Estoque: {{ product.stock }}</span>
        <button :disabled="!product.stock" class="px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 disabled:opacity-40" @click="$emit('add', product)">Adicionar</button>
      </div>
    </div>
  </div>
  
</template>

<script setup lang="ts">
const props = defineProps<{ product: any }>()
const placeholder = 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop'
const { currency } = useCurrency()
</script>

