import { requireAuth } from '$lib/auth/guards'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async (event) => {
  const session = await requireAuth(event)
  
  return {
    user: session.user
  }
}