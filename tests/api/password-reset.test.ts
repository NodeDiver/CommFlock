import { describe, it, expect, beforeEach } from "vitest";
import { testDb, createTestUser, cleanDatabase } from "../helpers/test-db";
import bcrypt from "bcrypt";

describe("Password Reset API", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe("POST /api/auth/forgot-password", () => {
    it("should create password reset token for existing user", async () => {
      const user = await createTestUser({
        username: "testuser",
        email: "test@example.com",
      });

      const response = await fetch(
        "http://localhost:3000/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "test@example.com" }),
        },
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.message).toContain("sent");

      // Verify token was created in database
      const updatedUser = await testDb.user.findUnique({
        where: { id: user.id },
      });

      expect(updatedUser?.passwordResetToken).toBeDefined();
      expect(updatedUser?.passwordResetTokenExpiry).toBeDefined();

      // Token should expire in the future
      const expiryDate = updatedUser?.passwordResetTokenExpiry;
      expect(expiryDate).toBeDefined();
      expect(expiryDate!.getTime()).toBeGreaterThan(Date.now());
    });

    it("should return success even for non-existent email (security)", async () => {
      const response = await fetch(
        "http://localhost:3000/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "nonexistent@example.com" }),
        },
      );

      // Should return 200 to prevent email enumeration
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.message).toContain("sent");
    });

    it("should reject invalid email format", async () => {
      const response = await fetch(
        "http://localhost:3000/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "invalid-email" }),
        },
      );

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it("should reject missing email", async () => {
      const response = await fetch(
        "http://localhost:3000/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        },
      );

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toBeDefined();
    });
  });

  describe("POST /api/auth/reset-password", () => {
    it("should reset password with valid token", async () => {
      // Create user with reset token
      const resetToken = "valid-reset-token-" + Math.random();
      const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

      const user = await testDb.user.create({
        data: {
          username: "testuser",
          email: "test@example.com",
          passwordResetToken: resetToken,
          passwordResetTokenExpiry: tokenExpiry,
        },
      });

      const newPassword = "newpassword123";

      const response = await fetch(
        "http://localhost:3000/api/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: resetToken,
            password: newPassword,
          }),
        },
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.message).toContain("reset");

      // Verify password was updated in database
      const updatedUser = await testDb.user.findUnique({
        where: { id: user.id },
      });

      expect(updatedUser?.hashedPassword).toBeDefined();

      // Verify new password works
      const isValid = await bcrypt.compare(
        newPassword,
        updatedUser!.hashedPassword!,
      );
      expect(isValid).toBe(true);

      // Verify token was cleared
      expect(updatedUser?.passwordResetToken).toBeNull();
      expect(updatedUser?.passwordResetTokenExpiry).toBeNull();
    });

    it("should reject expired token", async () => {
      const resetToken = "expired-token-" + Math.random();
      const tokenExpiry = new Date(Date.now() - 3600000); // 1 hour ago (expired)

      await testDb.user.create({
        data: {
          username: "testuser",
          email: "test@example.com",
          passwordResetToken: resetToken,
          passwordResetTokenExpiry: tokenExpiry,
        },
      });

      const response = await fetch(
        "http://localhost:3000/api/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: resetToken,
            password: "newpassword123",
          }),
        },
      );

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain("expired");
    });

    it("should reject invalid token", async () => {
      await createTestUser({
        username: "testuser",
        email: "test@example.com",
      });

      const response = await fetch(
        "http://localhost:3000/api/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: "invalid-token",
            password: "newpassword123",
          }),
        },
      );

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain("Invalid");
    });

    it("should reject password shorter than 6 characters", async () => {
      const resetToken = "valid-token-" + Math.random();
      const tokenExpiry = new Date(Date.now() + 3600000);

      await testDb.user.create({
        data: {
          username: "testuser",
          email: "test@example.com",
          passwordResetToken: resetToken,
          passwordResetTokenExpiry: tokenExpiry,
        },
      });

      const response = await fetch(
        "http://localhost:3000/api/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: resetToken,
            password: "12345", // Too short
          }),
        },
      );

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain("6 characters");
    });

    it("should reject missing token", async () => {
      const response = await fetch(
        "http://localhost:3000/api/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            password: "newpassword123",
          }),
        },
      );

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it("should reject missing password", async () => {
      const response = await fetch(
        "http://localhost:3000/api/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: "some-token",
          }),
        },
      );

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toBeDefined();
    });
  });

  describe("Password Reset Token Security", () => {
    it("should generate unique tokens for each request", async () => {
      const user = await createTestUser({
        email: "test@example.com",
      });

      // Request first token
      await fetch("http://localhost:3000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.com" }),
      });

      const user1 = await testDb.user.findUnique({
        where: { id: user.id },
      });
      const token1 = user1?.passwordResetToken;

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Request second token
      await fetch("http://localhost:3000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.com" }),
      });

      const user2 = await testDb.user.findUnique({
        where: { id: user.id },
      });
      const token2 = user2?.passwordResetToken;

      // Tokens should be different
      expect(token1).not.toBe(token2);
    });

    it("should invalidate old token when new one is requested", async () => {
      const user = await createTestUser({
        email: "test@example.com",
      });

      // Request first token
      await fetch("http://localhost:3000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.com" }),
      });

      const user1 = await testDb.user.findUnique({
        where: { id: user.id },
      });
      const oldToken = user1?.passwordResetToken ?? "";

      // Request new token (should invalidate old one)
      await fetch("http://localhost:3000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.com" }),
      });

      // Try to use old token
      const response = await fetch(
        "http://localhost:3000/api/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: oldToken,
            password: "newpassword123",
          }),
        },
      );

      // Should fail because token was replaced
      expect(response.status).toBe(400);
    });
  });
});
