import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: [
    '@nuxtjs/supabase',
    '@nuxtjs/tailwindcss',
  ],
  supabase: {
    // Desabilitar redirecionamento automático para páginas públicas
    redirect: false,
  },
  runtimeConfig: {
    public: {
      whatsappNumber: process.env.PUBLIC_WHATSAPP_NUMBER || '',
      hcaptchaSiteKey: '', // Automaticamente pega de NUXT_PUBLIC_HCAPTCHA_SITE_KEY
    },
  },
  app: {
    head: {
      title: 'Catálogo - Aldeia Viva',
      titleTemplate: '%s | Aldeia Viva',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#0b0b0c' },
        { name: 'description', content: 'Plataforma multi-tenant de catálogos com checkout via WhatsApp' },
        { name: 'author', content: 'Aldeia Viva' },
        { name: 'keywords', content: 'catálogo, e-commerce, whatsapp, loja virtual, multi-tenant' },
        // Open Graph
        { property: 'og:title', content: 'Catálogo - Aldeia Viva' },
        { property: 'og:description', content: 'Plataforma multi-tenant de catálogos com checkout via WhatsApp' },
        { property: 'og:type', content: 'website' },
        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Catálogo - Aldeia Viva' },
        { name: 'twitter:description', content: 'Plataforma multi-tenant de catálogos com checkout via WhatsApp' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ],
      script: [
        { src: 'https://js.hcaptcha.com/1/api.js', async: true, defer: true }
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' }
  },
  nitro: {
    preset: 'vercel'
  },
  typescript: {
    strict: true
  },
  tailwindcss: {
    viewer: false
  },
  // Usar template customizado de loading
  spaLoadingTemplate: 'app/spa-loading-template.html',
})

