import { z } from 'zod'

const CartItem = z.object({
  id: z.number(),
  name: z.string(),
  price_cents: z.number(),
  qty: z.number().min(1),
  store_id: z.string().optional(),
})
export type CartItem = z.infer<typeof CartItem>

const state = reactive({
  items: [] as CartItem[],
  storeId: null as string | null,
  whatsappNumber: '' as string,
})

export function useCart() {
  const items = computed(() => state.items)
  const totalQty = computed(() => state.items.reduce((n, it) => n + it.qty, 0))
  const totalCents = computed(() => state.items.reduce((n, it) => n + it.qty * it.price_cents, 0))

  function setStore(storeId: string, whatsappNumber: string) {
    // Se trocar de loja, limpar carrinho
    if (state.storeId && state.storeId !== storeId) {
      state.items = []
    }
    state.storeId = storeId
    state.whatsappNumber = whatsappNumber
  }

  function add(p: { id: number; name: string; price_cents: number; store_id?: string }) {
    const idx = state.items.findIndex(i => i.id === p.id)
    if (idx >= 0) state.items[idx].qty += 1
    else state.items.push({ id: p.id, name: p.name, price_cents: p.price_cents, qty: 1, store_id: p.store_id })
  }

  function remove(id: number) {
    const idx = state.items.findIndex(i => i.id === id)
    if (idx >= 0) state.items.splice(idx, 1)
  }

  function clear() {
    state.items = []
    state.storeId = null
    state.whatsappNumber = ''
  }

  function currency(cents: number) {
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const canCheckout = computed(() => items.value.length > 0 && state.whatsappNumber.length >= 10)

  async function checkout() {
    if (!canCheckout.value) return
    const lines = [
      '*Novo pedido*\n',
      ...items.value.map(i => `• ${i.name} x${i.qty} — ${currency(i.price_cents * i.qty)}`),
      `\nTotal: *${currency(totalCents.value)}*`
    ]
    const msg = encodeURIComponent(lines.join('\n'))
    const url = `https://wa.me/${state.whatsappNumber}?text=${msg}`

    // Optional: persist order + naive stock decrement (requires auth policies)
    try {
      const client = useSupabaseClient<any>()
      const { data: order, error } = await client.from('orders').insert({
        items: items.value,
        total_cents: totalCents.value,
        store_id: state.storeId,
      }).select().single()
      if (error) console.warn('order save failed', error.message)
      // naive stock decrement per item (demo only)
      await Promise.all(items.value.map(i => client.rpc('decrement_stock', { p_product_id: i.id, p_qty: i.qty })))
    } catch (e) {
      console.warn('persist failed', e)
    }

    if (process.client) window.open(url, '_blank')
    clear()
  }

  return { items, totalQty, totalCents, add, remove, clear, checkout, canCheckout, currency, setStore }
}

export function useCurrency() {
  function currency(cents: number) {
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }
  return { currency }
}

