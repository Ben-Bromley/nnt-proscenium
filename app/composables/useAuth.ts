/**
 * Basic wrapper for nuxt-auth-utils
 * Provides session state and helper functions for common auth checks
 */
export const useAuth = () => {
  const { loggedIn, user, session, fetch: refreshSession, clear: clearSession } = useUserSession()

  // Computed properties for common checks
  const isAuthenticated = computed(() => !!loggedIn.value)
  const isEmailVerified = computed(() => !!user.value?.emailVerified)
  const isSetupCompleted = computed(() => !!user.value?.setupCompleted)

  // Role helper functions
  const hasRole = (role: string): boolean => {
    return user.value?.roles?.includes(role) ?? false
  }

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => user.value?.roles?.includes(role)) ?? false
  }

  const hasAllRoles = (roles: string[]): boolean => {
    return roles.every(role => user.value?.roles?.includes(role)) ?? false
  }

  return {
    // Session state from nuxt-auth-utils
    loggedIn,
    user,
    session,
    refreshSession,
    clearSession,

    // Computed helpers
    isAuthenticated,
    isEmailVerified,
    isSetupCompleted,

    // Role helpers
    hasRole,
    hasAnyRole,
    hasAllRoles,
  }
}
