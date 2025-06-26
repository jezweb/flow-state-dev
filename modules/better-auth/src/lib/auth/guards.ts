import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { auth } from '$lib/server/auth'

/**
 * Guard to protect routes that require authentication
 */
export async function requireAuth(event: Parameters<PageServerLoad>[0]) {
  const session = await auth.getSession(event.request)
  
  if (!session?.user) {
    throw redirect(303, '/auth?redirect=' + encodeURIComponent(event.url.pathname))
  }
  
  return session
}

/**
 * Guard to protect routes that should not be accessible when authenticated
 */
export async function requireGuest(event: Parameters<PageServerLoad>[0]) {
  const session = await auth.getSession(event.request)
  
  if (session?.user) {
    throw redirect(303, '/')
  }
  
  return null
}