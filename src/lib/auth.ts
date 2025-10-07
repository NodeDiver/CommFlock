import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";
import bcrypt from "bcrypt";
import { logger } from "@/lib/logger";

/**
 * NextAuth configuration options for CommFlock authentication
 *
 * Supports credentials-based authentication with username/email and password.
 * Includes backwards compatibility for legacy users without passwords.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      /**
       * Validates user credentials and returns user object or null
       *
       * Handles three scenarios:
       * 1. User not found → returns null
       * 2. Legacy user without password → allows sign-in (backwards compatibility)
       * 3. User with password → verifies password with bcrypt
       *
       * @param credentials - Username and password from sign-in form
       * @returns User object with id, username, email or null if invalid
       */
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          // Find existing user by username
          const user = await db.user.findUnique({
            where: { username: credentials.username },
          });

          if (!user) {
            // User doesn't exist, return null (sign-up should be handled separately)
            return null;
          }

          // BACKWARDS COMPATIBILITY: Handle legacy users without passwords
          // This allows users created before password feature to still sign in
          // TODO: Prompt these users to set a password in their profile
          if (!user.hashedPassword) {
            logger.warn("Legacy user sign-in without password", {
              username: user.username,
            });
            return {
              id: user.id,
              username: user.username,
              email: user.email,
              // Note: Could add a flag here to show "Set Password" prompt in UI
              // requiresPasswordSetup: true
            };
          }

          // Verify password for users with passwords
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.hashedPassword,
          );
          if (!isValidPassword) {
            return null; // Invalid password
          }

          return {
            id: user.id,
            username: user.username,
            email: user.email,
          };
        } catch (error) {
          logger.error("Authentication error", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    /**
     * JWT callback - Adds custom user data to the JWT token
     *
     * @param token - The JWT token being created/updated
     * @param user - User object (only present on sign-in)
     * @returns Updated token with user id and username
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    /**
     * Session callback - Adds JWT token data to the session object
     *
     * @param session - The session object being sent to the client
     * @param token - The JWT token with custom user data
     * @returns Updated session with user id and username
     */
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
};
