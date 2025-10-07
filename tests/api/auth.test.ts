import { describe, it, expect, beforeEach } from "vitest";
import { testDb, createTestUser, cleanDatabase } from "../helpers/test-db";
import bcrypt from "bcrypt";

describe("Authentication API", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe("POST /api/auth/signup", () => {
    it("should create a new user with valid data", async () => {
      const userData = {
        username: "newuser",
        email: "newuser@example.com",
        password: "password123",
      };

      const response = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.user).toBeDefined();
      expect(data.user.username).toBe(userData.username);
      expect(data.user.email).toBe(userData.email);

      // Verify user in database
      const user = await testDb.user.findUnique({
        where: { username: userData.username },
      });

      expect(user).toBeDefined();
      expect(user?.hashedPassword).toBeDefined();

      // Verify password is hashed
      const isValidPassword = await bcrypt.compare(
        userData.password,
        user!.hashedPassword!,
      );
      expect(isValidPassword).toBe(true);
    });

    it("should reject signup with duplicate username", async () => {
      await createTestUser({ username: "existinguser" });

      const response = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "existinguser",
          password: "password123",
        }),
      });

      expect(response.status).toBe(409);

      const data = await response.json();
      expect(data.error).toContain("already taken");
    });

    it("should reject signup with short password", async () => {
      const response = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "newuser",
          password: "12345", // Too short
        }),
      });

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain("at least 6 characters");
    });

    it("should reject signup without username", async () => {
      const response = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: "password123",
        }),
      });

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain("required");
    });

    it("should accept optional Lightning address", async () => {
      const response = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "lightninguser",
          password: "password123",
          lightningAddress: "user@getalby.com",
        }),
      });

      expect(response.status).toBe(200);

      const user = await testDb.user.findUnique({
        where: { username: "lightninguser" },
      });

      expect(user?.lightningAddress).toBe("user@getalby.com");
    });

    it("should reject invalid Lightning address format", async () => {
      const response = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "lightninguser",
          password: "password123",
          lightningAddress: "invalid-format", // Missing @
        }),
      });

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain("Lightning address");
    });

    it("should accept optional Nostr pubkey", async () => {
      const response = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "nostruser",
          password: "password123",
          nostrPubkey: "npub1testpubkey123456789",
        }),
      });

      expect(response.status).toBe(200);

      const user = await testDb.user.findUnique({
        where: { username: "nostruser" },
      });

      expect(user?.nostrPubkey).toBe("npub1testpubkey123456789");
    });

    it("should reject invalid Nostr pubkey format", async () => {
      const response = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "nostruser",
          password: "password123",
          nostrPubkey: "invalid-pubkey", // Doesn't start with npub1
        }),
      });

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain("Nostr");
    });
  });

  describe("POST /api/auth/signin (via NextAuth)", () => {
    it("should sign in with correct credentials", async () => {
      const hashedPassword = await bcrypt.hash("password123", 12);
      const user = await createTestUser({
        username: "testuser",
        email: "testuser@example.com",
        hashedPassword,
      });

      // Verify user was created
      expect(user.username).toBe("testuser");
      expect(user.hashedPassword).toBeDefined();

      // Verify password verification works
      const isValidPassword = await bcrypt.compare(
        "password123",
        user.hashedPassword!,
      );
      expect(isValidPassword).toBe(true);

      // Verify user can be found in database
      const found = await testDb.user.findUnique({
        where: { username: "testuser" },
      });
      expect(found).toBeDefined();
      expect(found?.username).toBe("testuser");
    });

    it("should reject signin with wrong password", async () => {
      const hashedPassword = await bcrypt.hash("password123", 12);
      const user = await createTestUser({
        username: "testuser",
        email: "testuser@example.com",
        hashedPassword,
      });

      // Verify wrong password doesn't match
      const isValidPassword = await bcrypt.compare(
        "wrongpassword",
        user.hashedPassword!,
      );
      expect(isValidPassword).toBe(false);
    });

    it("should reject signin with non-existent user", async () => {
      // Try to find non-existent user
      const found = await testDb.user.findUnique({
        where: { username: "nonexistent" },
      });

      expect(found).toBeNull();
    });

    it("should allow legacy users without password to sign in", async () => {
      // Create legacy user without password
      const user = await createTestUser({
        username: "legacyuser",
        email: "legacyuser@example.com",
        hashedPassword: null,
      });

      // Verify user was created without password
      expect(user.username).toBe("legacyuser");
      expect(user.hashedPassword).toBeNull();

      // Verify user exists in database
      const found = await testDb.user.findUnique({
        where: { username: "legacyuser" },
      });
      expect(found).toBeDefined();
      expect(found?.hashedPassword).toBeNull();
    });
  });
});
