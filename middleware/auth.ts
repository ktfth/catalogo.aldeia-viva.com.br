export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()
  if (to.path.startsWith('/admin') && !user.value) {
    return navigateTo('/login?next=' + encodeURIComponent(to.fullPath))
  }
})

