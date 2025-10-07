import { describe, it, expect, beforeEach } from "vitest";
import {
  createTestUser,
  createTestCommunity,
  cleanDatabase,
} from "../helpers/test-db";

describe("Communities API Pagination", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe("GET /api/communities with skip/take", () => {
    it("should return array when using skip/take", async () => {
      const user = await createTestUser();

      // Create 15 communities
      for (let i = 0; i < 15; i++) {
        await createTestCommunity(user.id, {
          name: `Community ${i}`,
          slug: `community-${i}`,
          isPublic: true,
        });
      }

      const response = await fetch(
        "http://localhost:3000/api/communities?skip=0&take=10",
      );

      expect(response.status).toBe(200);

      const data = await response.json();

      // Should return array directly (not object)
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(10);
      expect(data[0]).toHaveProperty("name");
      expect(data[0]).toHaveProperty("slug");
    });

    it("should skip correctly with skip parameter", async () => {
      const user = await createTestUser();

      // Create 20 communities
      for (let i = 0; i < 20; i++) {
        await createTestCommunity(user.id, {
          name: `Community ${i}`,
          slug: `community-${i}`,
          isPublic: true,
        });
      }

      // Get first 10
      const response1 = await fetch(
        "http://localhost:3000/api/communities?skip=0&take=10",
      );
      const page1 = await response1.json();

      // Get next 10
      const response2 = await fetch(
        "http://localhost:3000/api/communities?skip=10&take=10",
      );
      const page2 = await response2.json();

      expect(Array.isArray(page1)).toBe(true);
      expect(Array.isArray(page2)).toBe(true);
      expect(page1.length).toBe(10);
      expect(page2.length).toBe(10);

      // Results should be different (ordered by createdAt DESC)
      expect(page1[0].id).not.toBe(page2[0].id);
    });
  });

  describe("GET /api/communities with page/limit", () => {
    it("should return object with pagination metadata", async () => {
      const user = await createTestUser();

      // Create 25 communities
      for (let i = 0; i < 25; i++) {
        await createTestCommunity(user.id, {
          name: `Community ${i}`,
          slug: `community-${i}`,
          isPublic: true,
        });
      }

      const response = await fetch(
        "http://localhost:3000/api/communities?page=1&limit=10",
      );

      expect(response.status).toBe(200);

      const data = await response.json();

      // Should return object with communities and pagination
      expect(data).toHaveProperty("communities");
      expect(data).toHaveProperty("pagination");

      expect(Array.isArray(data.communities)).toBe(true);
      expect(data.communities.length).toBe(10);

      expect(data.pagination).toHaveProperty("page");
      expect(data.pagination).toHaveProperty("limit");
      expect(data.pagination).toHaveProperty("total");
      expect(data.pagination).toHaveProperty("pages");

      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(10);
      expect(data.pagination.total).toBe(25);
      expect(data.pagination.pages).toBe(3);
    });

    it("should return correct page with page parameter", async () => {
      const user = await createTestUser();

      // Create 30 communities
      for (let i = 0; i < 30; i++) {
        await createTestCommunity(user.id, {
          name: `Community ${i}`,
          slug: `community-${i}`,
          isPublic: true,
        });
      }

      // Get page 2
      const response = await fetch(
        "http://localhost:3000/api/communities?page=2&limit=10",
      );

      const data = await response.json();

      expect(data.communities.length).toBe(10);
      expect(data.pagination.page).toBe(2);
      expect(data.pagination.total).toBe(30);
      expect(data.pagination.pages).toBe(3);
    });

    it("should return empty array for page beyond total", async () => {
      const user = await createTestUser();

      // Create 5 communities
      for (let i = 0; i < 5; i++) {
        await createTestCommunity(user.id, {
          name: `Community ${i}`,
          slug: `community-${i}`,
          isPublic: true,
        });
      }

      // Request page 5 (beyond available)
      const response = await fetch(
        "http://localhost:3000/api/communities?page=5&limit=10",
      );

      const data = await response.json();

      expect(data.communities.length).toBe(0);
      expect(data.pagination.total).toBe(5);
      expect(data.pagination.pages).toBe(1);
    });
  });

  describe("GET /api/communities with search", () => {
    it("should filter communities by name", async () => {
      const user = await createTestUser();

      await createTestCommunity(user.id, {
        name: "Bitcoin Developers",
        slug: "bitcoin-devs",
        isPublic: true,
      });

      await createTestCommunity(user.id, {
        name: "Lightning Network",
        slug: "lightning",
        isPublic: true,
      });

      await createTestCommunity(user.id, {
        name: "Ethereum Devs",
        slug: "ethereum",
        isPublic: true,
      });

      const response = await fetch(
        "http://localhost:3000/api/communities?search=bitcoin&skip=0&take=20",
      );

      const data = await response.json();

      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(1);
      expect(data[0].name).toBe("Bitcoin Developers");
    });

    it("should filter communities by slug", async () => {
      const user = await createTestUser();

      await createTestCommunity(user.id, {
        name: "Test Community",
        slug: "lightning-network",
        isPublic: true,
      });

      await createTestCommunity(user.id, {
        name: "Another Community",
        slug: "bitcoin-devs",
        isPublic: true,
      });

      const response = await fetch(
        "http://localhost:3000/api/communities?search=lightning&skip=0&take=20",
      );

      const data = await response.json();

      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(1);
      expect(data[0].slug).toBe("lightning-network");
    });

    it("should be case insensitive", async () => {
      const user = await createTestUser();

      await createTestCommunity(user.id, {
        name: "Bitcoin Developers",
        slug: "bitcoin-devs",
        isPublic: true,
      });

      const response = await fetch(
        "http://localhost:3000/api/communities?search=BITCOIN&skip=0&take=20",
      );

      const data = await response.json();

      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(1);
      expect(data[0].name).toBe("Bitcoin Developers");
    });
  });

  describe("GET /api/communities ordering", () => {
    it("should order communities by createdAt DESC", async () => {
      const user = await createTestUser();

      // Create communities with slight delay
      const community1 = await createTestCommunity(user.id, {
        name: "First Community",
        slug: "first",
        isPublic: true,
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const community2 = await createTestCommunity(user.id, {
        name: "Second Community",
        slug: "second",
        isPublic: true,
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const community3 = await createTestCommunity(user.id, {
        name: "Third Community",
        slug: "third",
        isPublic: true,
      });

      const response = await fetch(
        "http://localhost:3000/api/communities?skip=0&take=10",
      );

      const data = await response.json();

      // Newest first (DESC order)
      expect(data[0].id).toBe(community3.id);
      expect(data[1].id).toBe(community2.id);
      expect(data[2].id).toBe(community1.id);
    });
  });
});
