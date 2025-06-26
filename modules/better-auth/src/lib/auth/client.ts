import { createClient } from '@better-auth/client'
import type { Auth } from '$lib/server/auth'

export const authClient = createClient<Auth>({
  baseURL: import.meta.env.VITE_BETTER_AUTH_URL || 'http://localhost:5173'
})

// Export convenient auth methods
export const signIn = authClient.signIn
export const signUp = authClient.signUp
export const signOut = authClient.signOut
export const getSession = authClient.getSession