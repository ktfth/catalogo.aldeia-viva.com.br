export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()

  // Páginas que requerem autenticação
  const requiresAuth = to.path.startsWith('/admin') || to.path === '/welcome'

  if (requiresAuth && !user.value) {
    return navigateTo('/login?next=' + encodeURIComponent(to.fullPath))
  }
})

