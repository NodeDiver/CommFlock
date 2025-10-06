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

          // User exists, verify password
          if (!user.hashedPassword) {
            return null // User exists but has no password (invalid state)
          }
          
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
    signUp: '/sign-up',
  },
}
