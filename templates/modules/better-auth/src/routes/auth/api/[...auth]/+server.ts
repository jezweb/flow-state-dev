import { auth } from '$lib/server/auth'
import type { RequestHandler } from './$types'

// Handle all Better Auth API routes
export const GET: RequestHandler = async ({ request }) => {
  return auth.handler(request)
}

export const POST: RequestHandler = async ({ request }) => {
  return auth.handler(request)
}