export default defineNuxtRouteMiddleware((_to) => {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated.value) {
    return navigateTo('/')
  }
})
