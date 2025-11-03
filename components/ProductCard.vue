<template>
  <div class="group rounded-lg sm:rounded-xl border border-white/10 overflow-hidden bg-ink-800 hover:border-gold-400/50 transition">
    <div class="aspect-[4/3] bg-ink-700 overflow-hidden flex items-center justify-center">
      <img
        :src="imageUrl"
        :alt="product.name"
        :class="product.image_url ? 'w-full h-full object-cover' : 'w-1/2 h-1/2 object-contain opacity-40'"
        class="group-hover:scale-[1.02] transition"
        @error="handleImageError"
      />
    </div>
    <div class="p-3 sm:p-4 flex flex-col gap-1.5 sm:gap-2">
      <div class="flex items-start justify-between gap-2 sm:gap-3">
        <h3 class="font-semibold text-sm sm:text-base">{{ product.name }}</h3>
        <div class="text-gold-300 font-semibold text-sm sm:text-base whitespace-nowrap">{{ currency(product.price_cents) }}</div>
      </div>
      <p class="text-xs sm:text-sm opacity-80 line-clamp-2">{{ product.description }}</p>
      <div class="flex items-center justify-between mt-1">
        <span class="text-xs opacity-70">Estoque: {{ product.stock }}</span>
        <button
          :disabled="!product.stock"
          class="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md bg-white/10 hover:bg-white/20 disabled:opacity-40 transition"
          @click="$emit('add', product)"
        >
          Adicionar
        </button>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
const props = defineProps<{
  product: any
  storeLogo?: string | null
}>()

const defaultPlaceholder = 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop'
const { currency } = useCurrency()
const imageError = ref(false)

// Definir a imagem a ser exibida com prioridade: imagem do produto > logo da loja > placeholder
const imageUrl = computed(() => {
  if (imageError.value) {
    return props.storeLogo || defaultPlaceholder
  }
  return props.product.image_url || props.storeLogo || defaultPlaceholder
})

function handleImageError() {
  imageError.value = true
}
</script>

