import { H3Error } from 'h3'
import { FetchError } from 'ofetch'

// Extract a user-friendly error message from a fetch error
export function getErrorMessage(error: unknown): string {
  if (error instanceof H3Error || error instanceof FetchError) {
    return error.data?.statusMessage || error.statusMessage || error.message || 'An error occurred. Please try again'
  }

  if (error instanceof Error) {
    return error.message || 'Network error. Please check your connection and try again'
  }

  return 'An unexpected error occurred. Please try again'
}

// Handle an API error by extracting and setting an error message
export function handleApiError(error: unknown, errorRef: Ref<string>) {
  errorRef.value = getErrorMessage(error)
}
