import { z } from 'zod'

// Schema da loja
const Store = z.object({
  id: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  logo_url: z.string().nullable(),
  whatsapp_number: z.string(),
  owner_id: z.string().uuid(),
  published: z.boolean(),
})

export type Store = z.infer<typeof Store>

// Schema do perfil
const Profile = z.object({
  id: z.string().uuid(),
  full_name: z.string().nullable(),
  avatar_url: z.string().nullable(),
  role: z.enum(['admin', 'owner']),
})

export type Profile = z.infer<typeof Profile>

// Função auxiliar para garantir que o número do WhatsApp tenha o código do Brasil (55)
function normalizeWhatsAppNumber(number: string): string {
  // Remove espaços e caracteres especiais
  const cleanNumber = number.replace(/\D/g, '')

  // Se já começa com 55, retorna como está
  if (cleanNumber.startsWith('55')) {
    return cleanNumber
  }

  // Caso contrário, adiciona 55 no início
  return '55' + cleanNumber
}

export function useStore() {
  const client = useSupabaseClient<any>()
  const user = useSupabaseUser()

  // Estado da loja do usuário atual
  const currentStore = useState<Store | null>('currentStore', () => null)
  const currentProfile = useState<Profile | null>('currentProfile', () => null)
  const isLoading = useState<boolean>('storeLoading', () => false)
  const loadError = useState<string | null>('storeLoadError', () => null)

  // Carregar loja do usuário
  async function loadCurrentUserStore() {
    if (!user.value) {
      currentStore.value = null
      currentProfile.value = null
      isLoading.value = false
      loadError.value = null
      return { data: null, error: null }
    }

    isLoading.value = true
    loadError.value = null

    try {
      console.log('[useStore] Carregando dados para usuário:', user.value.id)

      // Carregar perfil
      const { data: profile, error: profileError } = await client
        .from('profiles')
        .select('*')
        .eq('id', user.value.id)
        .single()

      if (profileError) {
        console.error('[useStore] Erro ao carregar perfil:', profileError)
        console.error('[useStore] Código do erro:', profileError.code)
        console.error('[useStore] Detalhes:', profileError.details, profileError.hint)

        // Se perfil não existe, pode ser que o trigger não executou
        if (profileError.code === 'PGRST116') {
          throw new Error('Perfil não encontrado. O registro pode não ter sido concluído corretamente.')
        }

        throw new Error(`Erro ao carregar perfil: ${profileError.message}`)
      }

      console.log('[useStore] Perfil carregado com sucesso')
      currentProfile.value = profile

      // Carregar loja
      const { data: store, error: storeError } = await client
        .from('stores')
        .select('*')
        .eq('owner_id', user.value.id)
        .single()

      if (storeError) {
        console.error('[useStore] Erro ao carregar loja:', storeError)
        console.error('[useStore] Código do erro:', storeError.code)
        console.error('[useStore] Detalhes:', storeError.details, storeError.hint)

        // Se loja não existe (código PGRST116), pode ser que o trigger não executou
        if (storeError.code === 'PGRST116') {
          console.warn('[useStore] Loja não encontrada. Redirecionando para página de boas-vindas.')
          // Não é um erro fatal - redirecionar para /welcome
          currentStore.value = null
          isLoading.value = false
          loadError.value = 'STORE_NOT_FOUND'
          return { data: null, error: 'STORE_NOT_FOUND' }
        }

        throw new Error(`Erro ao carregar loja: ${storeError.message}`)
      }

      console.log('[useStore] Loja carregada com sucesso')
      currentStore.value = store
      isLoading.value = false
      return { data: store, error: null }
    } catch (error: any) {
      console.error('[useStore] Erro geral:', error)
      currentStore.value = null
      loadError.value = error.message || 'Erro desconhecido'
      isLoading.value = false
      return { data: null, error: error.message }
    }
  }

  // Atualizar loja
  async function updateStore(data: Partial<Store>) {
    if (!currentStore.value) return { error: new Error('Nenhuma loja carregada') }

    // Normalizar número do WhatsApp se presente
    const updatedData = {
      ...data,
      ...(data.whatsapp_number && { whatsapp_number: normalizeWhatsAppNumber(data.whatsapp_number) })
    }

    const { error } = await client
      .from('stores')
      .update(updatedData)
      .eq('id', currentStore.value.id)

    if (!error) {
      await loadCurrentUserStore()
    }

    return { error }
  }

  // Atualizar perfil
  async function updateProfile(data: Partial<Profile>) {
    if (!user.value) return { error: new Error('Usuário não autenticado') }

    const { error } = await client
      .from('profiles')
      .update(data)
      .eq('id', user.value.id)

    if (!error) {
      await loadCurrentUserStore()
    }

    return { error }
  }

  // Buscar loja por slug (para catálogo público)
  async function getStoreBySlug(slug: string) {
    const { data, error } = await client
      .from('stores')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    return { data, error }
  }

  // Criar loja para usuário atual (ou atualizar se já existir)
  async function createStore(storeData: { name: string; slug: string; whatsapp_number: string; description?: string }) {
    if (!user.value) return { error: new Error('Usuário não autenticado') }

    console.log('[useStore] Tentando criar/atualizar loja para usuário:', user.value.id)

    // Normalizar número do WhatsApp
    const normalizedWhatsApp = normalizeWhatsAppNumber(storeData.whatsapp_number)

    // Primeiro, tentar usar a loja já carregada em currentStore
    if (currentStore.value && currentStore.value.owner_id === user.value.id) {
      console.log('[useStore] Usando loja já carregada (id:', currentStore.value.id, '), atualizando...')
      const { error: updateError } = await client
        .from('stores')
        .update({
          name: storeData.name,
          slug: storeData.slug,
          whatsapp_number: normalizedWhatsApp,
          description: storeData.description || null,
        })
        .eq('id', currentStore.value.id)

      if (!updateError) {
        await loadCurrentUserStore()
        return { data: currentStore.value, error: null }
      }

      return { data: null, error: updateError }
    }

    // Verificar se o usuário já tem uma loja (garantindo unicidade)
    console.log('[useStore] Verificando se loja já existe no banco...')
    const { data: existingStore, error: checkError } = await client
      .from('stores')
      .select('*')
      .eq('owner_id', user.value.id)
      .maybeSingle()

    if (checkError) {
      console.error('[useStore] Erro ao verificar loja existente:', checkError)
      return { data: null, error: checkError }
    }

    // Se já existe uma loja, atualizar ao invés de criar
    if (existingStore) {
      console.log('[useStore] Loja encontrada no banco (id:', existingStore.id, '), atualizando...')
      const { error: updateError } = await client
        .from('stores')
        .update({
          name: storeData.name,
          slug: storeData.slug,
          whatsapp_number: normalizedWhatsApp,
          description: storeData.description || null,
        })
        .eq('id', existingStore.id)

      if (!updateError) {
        await loadCurrentUserStore()
        return { data: currentStore.value, error: null }
      }

      return { data: null, error: updateError }
    }

    // Criar nova loja (apenas se não existir)
    console.log('[useStore] Criando nova loja...')
    const { data, error } = await client
      .from('stores')
      .insert({
        owner_id: user.value.id,
        name: storeData.name,
        slug: storeData.slug,
        whatsapp_number: normalizedWhatsApp,
        description: storeData.description || null,
        published: true,
      })
      .select()
      .single()

    if (error) {
      console.error('[useStore] Erro ao criar loja:', error)

      // Se o erro for de constraint de unicidade (código 23505)
      if (error.code === '23505') {
        // Violação de unicidade de owner_id - loja foi criada entre a verificação e o insert
        if (error.message.includes('stores_owner_id_unique')) {
          console.warn('[useStore] Race condition detectada: loja foi criada pelo trigger.')
          console.log('[useStore] Tentando carregar e atualizar a loja existente...')

          // Recarregar para pegar a loja criada pelo trigger
          const { data: justCreatedStore } = await client
            .from('stores')
            .select('*')
            .eq('owner_id', user.value.id)
            .single()

          if (justCreatedStore) {
            // Atualizar com os dados do formulário
            const { error: updateError } = await client
              .from('stores')
              .update({
                name: storeData.name,
                slug: storeData.slug,
                whatsapp_number: normalizedWhatsApp,
                description: storeData.description || null,
              })
              .eq('id', justCreatedStore.id)

            if (!updateError) {
              await loadCurrentUserStore()
              return { data: currentStore.value, error: null }
            }

            return { data: null, error: updateError }
          }

          return { data: null, error: new Error('Não foi possível criar ou atualizar a loja. Por favor, tente novamente.') }
        }

        // Violação de unicidade de slug
        if (error.message.includes('stores_slug_key')) {
          return { data: null, error: new Error('Este slug já está em uso. Por favor, escolha outro.') }
        }
      }

      return { data: null, error }
    }

    if (data) {
      console.log('[useStore] Loja criada com sucesso:', data.id)
      currentStore.value = data
    }

    return { data, error: null }
  }

  // Verificar se usuário é admin
  const isAdmin = computed(() => currentProfile.value?.role === 'admin')

  // Verificar se usuário é dono da loja
  const isStoreOwner = computed(() => {
    return user.value && currentStore.value?.owner_id === user.value.id
  })

  // Verificar se a loja está configurada
  const isStoreConfigured = computed(() => {
    if (!currentStore.value) return false
    return (
      currentStore.value.name !== 'Minha Loja' &&
      currentStore.value.whatsapp_number !== '5500000000000'
    )
  })

  return {
    currentStore: readonly(currentStore),
    currentProfile: readonly(currentProfile),
    isLoading: readonly(isLoading),
    loadError: readonly(loadError),
    isAdmin,
    isStoreOwner,
    isStoreConfigured,
    loadCurrentUserStore,
    updateStore,
    updateProfile,
    getStoreBySlug,
    createStore,
  }
}
