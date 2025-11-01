<template>
  <div class="relative">
    <button class="px-3 py-2 rounded-md bg-gold-400 text-black font-medium hover:brightness-110" @click="open = !open">
      Carrinho ({{ totalQty }})
    </button>
    <div v-if="open" class="absolute right-0 mt-2 w-80 bg-ink-800 border border-white/10 rounded-lg shadow-xl p-4 z-30">
      <div v-if="items.length === 0" class="text-sm opacity-70">Seu carrinho está vazio.</div>
      <div v-else class="space-y-2">
        <div v-for="(it, idx) in items" :key="idx" class="flex items-center justify-between gap-2">
          <div>
            <div class="font-medium">{{ it.name }}</div>
            <div class="text-xs opacity-70">Qtd: {{ it.qty }}</div>
          </div>
          <div class="text-sm">{{ currency(it.price_cents * it.qty) }}</div>
          <button class="text-xs opacity-70 hover:opacity-100" @click="remove(it.id)">remover</button>
        </div>
        <div class="border-t border-white/10 pt-2 flex items-center justify-between">
          <span class="opacity-80">Total</span>
          <span class="font-semibold">{{ currency(totalCents) }}</span>
        </div>
        <button :disabled="!canCheckout" class="w-full px-3 py-2 rounded-md bg-gold-400 text-black font-semibold disabled:opacity-50" @click="checkout">
          Enviar pedido pelo WhatsApp
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCart } from '@/composables/useCart'

const open = ref(false)
const { items, totalQty, totalCents, remove, checkout, canCheckout, currency } = useCart()
</script>

