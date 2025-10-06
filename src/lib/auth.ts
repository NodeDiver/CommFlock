import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from './db'
import bcrypt from 'bcrypt'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        try {
          // Find existing user by username
          const user = await db.user.findUnique({
            where: { username: credentials.username },
          })

          if (!user) {
            // User doesn't exist, return null (sign-up should be handled separately)
            return null
          }

          // BACKWARDS COMPATIBILITY: Handle legacy users without passwords
          // This allows users created before password feature to still sign in
          // TODO: Prompt these users to set a password in their profile
          if (!user.hashedPassword) {
            console.warn(`Legacy user sign-in (no password): ${user.username}`)
            return {
              id: user.id,
              username: user.username,
              email: user.email,
              // Note: Could add a flag here to show "Set Password" prompt in UI
              // requiresPasswordSetup: true
            }
          }

          // Verify password for users with passwords
          const isValidPassword = await bcrypt.compare(credentials.password, user.hashedPassword)
          if (!isValidPassword) {
            return null // Invalid password
          }

          return {
            id: user.id,
            username: user.username,
            email: user.email,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.username = token.username as string
      }
      return session
    },
  },
  pages: {
    signIn: '/sign-in',
  },
}
