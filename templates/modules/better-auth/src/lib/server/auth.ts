import { betterAuth } from 'better-auth'
import { emailPassword } from 'better-auth/providers'
import Database from 'better-sqlite3'

const db = new Database(process.env.DATABASE_URL || 'file:./dev.db')

export const auth = betterAuth({
  database: db,
  session: {
    strategy: 'jwt',
    expiresIn: 60 * 60 * 24 * 7 // 7 days
  },
  providers: [
    emailPassword({
      enabled: true,
      requireEmailVerification: false
    })
  ],
  callbacks: {
    onRequest: async ({ request, user }) => {
      // Add custom request logic here
      console.log('Auth request:', request.method, request.url)
    },
    onResponse: async ({ response, user }) => {
      // Add custom response logic here
    }
  }
})

export type Auth = typeof auth