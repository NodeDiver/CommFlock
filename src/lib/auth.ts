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
      },
      async authorize(credentials) {
        if (!credentials?.username) {
          return null
        }

        try {
          // Try to find existing user by username
          let user = await db.user.findUnique({
            where: { username: credentials.username },
          })

          // If user doesn't exist, create new user
          if (!user) {
            user = await db.user.create({
              data: {
                username: credentials.username,
                email: credentials.email || null,
              },
            })
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
