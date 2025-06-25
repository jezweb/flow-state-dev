import { writable, derived } from 'svelte/store'
import { authClient } from './client'
import type { User, Session } from 'better-auth'

// User store
export const user = writable<User | null>(null)

// Session store
export const session = writable<Session | null>(null)

// Derived store for authentication status
export const isAuthenticated = derived(
  user,
  $user => $user !== null
)

// Initialize auth state
export async function initializeAuth() {
  try {
    const sessionData = await authClient.getSession()
    if (sessionData?.user) {
      user.set(sessionData.user)
      session.set(sessionData.session)
    }
  } catch (error) {
    console.error('Failed to initialize auth:', error)
    user.set(null)
    session.set(null)
  }
}

// Update auth state after sign in
export function updateAuthState(userData: User, sessionData: Session) {
  user.set(userData)
  session.set(sessionData)
}

// Clear auth state after sign out
export function clearAuthState() {
  user.set(null)
  session.set(null)
}