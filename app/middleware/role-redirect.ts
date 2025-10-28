/**
 * Middleware to redirect users to their role-appropriate dashboard
 * when they access /admin without a specific path
 */
export default defineNuxtRouteMiddleware((to) => {
  // Only apply to /admin root path
  if (to.path !== '/admin' && to.path !== '/admin/') {
    return
  }

  const { user } = useUserSession()

  if (!user.value) {
    return
  }

  // MANAGER users should go to FOH dashboard
  if (user.value.roles.includes('MANAGER') && !user.value.roles.includes('ADMIN')) {
    return navigateTo('/admin/foh')
  }

  // TRAINER users should go to training dashboard (future)
  if (user.value.roles.includes('TRAINER') && !user.value.roles.includes('ADMIN')) {
    return navigateTo('/admin/training')
  }

  // ADMIN stays on /admin
  // Multiple roles default to /admin
})
