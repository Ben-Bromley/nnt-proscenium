import type { RoleType } from '@prisma/client'
import type { H3Error } from 'h3'

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterCredentials {
  email: string
  password: string
  name?: string
}

export const useAuth = () => {
  const { session, fetch: refreshSession } = useUserSession()

  const user = computed(() => session.value?.user)
  const isLoggedIn = computed(() => !!user.value)

  // Reactive state for pending and error
  const pending = ref(false)
  const error = ref<H3Error | null>(null)

  const login = async (credentials: LoginCredentials) => {
    try {
      pending.value = true
      error.value = null

      const response = await $fetch('/api/auth/login', {
        method: 'POST',
        body: credentials,
      })

      console.log('Login response:', response)

      await refreshSession()
      return response.data!.user
    }
    catch (err: unknown) {
      // Handle H3Error responses
      if (err && typeof err === 'object' && 'statusCode' in err) {
        error.value = err as H3Error
      }
      else {
        // Handle network or other errors
        error.value = {
          statusCode: 500,
          statusMessage: 'Network Error',
          data: { message: 'Failed to connect to server' },
        } as H3Error
      }

      throw err
    }
    finally {
      pending.value = false
    }
  }

  const register = async (credentials: RegisterCredentials) => {
    try {
      pending.value = true
      error.value = null

      const result = await $fetch('/api/auth/register', {
        method: 'POST',
        body: credentials,
      })

      // Note: Don't refresh session here since user needs to verify email first
      return result
    }
    catch (err: unknown) {
      // Handle H3Error responses
      if (err && typeof err === 'object' && 'statusCode' in err) {
        error.value = err as H3Error
      }
      else {
        // Handle network or other errors
        error.value = {
          statusCode: 500,
          statusMessage: 'Network Error',
          data: { message: 'Failed to connect to server' },
        } as H3Error
      }

      throw err
    }
    finally {
      pending.value = false
    }
  }

  const logout = async () => {
    try {
      pending.value = true
      error.value = null

      await $fetch('/api/auth/logout', {
        method: 'POST',
      })

      await refreshSession()
      await navigateTo('/login')
    }
    catch (err: unknown) {
      // Handle H3Error responses
      if (err && typeof err === 'object' && 'statusCode' in err) {
        error.value = err as H3Error
      }
      else {
        // Handle network or other errors
        error.value = {
          statusCode: 500,
          statusMessage: 'Network Error',
          data: { message: 'Failed to connect to server' },
        } as H3Error
      }

      throw err
    }
    finally {
      pending.value = false
    }
  }

  const hasRole = (role: RoleType): boolean => {
    if (!user.value) return false
    return user.value.roles.includes(role)
  }

  const hasAnyRole = (roles: RoleType[]): boolean => {
    if (!user.value) return false
    return user.value.roles.some(userRole => roles.includes(userRole as RoleType))
  }

  const hasAllRoles = (roles: RoleType[]): boolean => {
    if (!user.value) return false
    return roles.every(role => user.value?.roles.includes(role))
  }

  const clearError = () => {
    error.value = null
  }

  return {
    user: readonly(user),
    isLoggedIn: readonly(isLoggedIn),
    pending: readonly(pending),
    error: readonly(error),
    login,
    register,
    logout,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    clearError,
    refresh: refreshSession,
  }
}
