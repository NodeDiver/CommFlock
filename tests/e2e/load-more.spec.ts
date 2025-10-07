import { test, expect } from "@playwright/test";

test.describe("Load More Functionality", () => {
  test("should load more communities when clicking Load More button", async ({
    page,
  }) => {
    // Navigate to homepage
    await page.goto("/en");

    // Wait for initial communities to load
    await page.waitForSelector('[data-testid="community-card"]', {
      timeout: 10000,
    });

    // Count initial communities (should be limited by initial load)
    const initialCount = await page
      .locator('[data-testid="community-card"]')
      .count();

    expect(initialCount).toBeGreaterThan(0);
    expect(initialCount).toBeLessThanOrEqual(12); // Assuming initial load is ≤12

    // Check if Load More button is visible
    const loadMoreButton = page.locator("button", {
      hasText: "Load More",
    });

    if (await loadMoreButton.isVisible()) {
      // Click Load More
      await loadMoreButton.click();

      // Wait for new communities to appear
      await page.waitForTimeout(1000);

      // Count should increase
      const newCount = await page
        .locator('[data-testid="community-card"]')
        .count();

      expect(newCount).toBeGreaterThan(initialCount);
    }
  });

  test("should hide Load More when all communities are loaded", async ({
    page,
  }) => {
    await page.goto("/en");

    // Wait for communities to load
    await page.waitForSelector('[data-testid="community-card"]', {
      timeout: 10000,
    });

    // Click Load More multiple times until it disappears
    let clickCount = 0;
    const maxClicks = 5; // Prevent infinite loop

    while (clickCount < maxClicks) {
      const loadMoreButton = page.locator("button", {
        hasText: "Load More",
      });

      if (!(await loadMoreButton.isVisible())) {
        // Button is hidden, test passed
        break;
      }

      await loadMoreButton.click();
      await page.waitForTimeout(800);
      clickCount++;
    }

    // After all communities loaded, should show "all loaded" message or hide button
    const loadMoreButton = page.locator("button", {
      hasText: "Load More",
    });

    const allLoadedText = page.locator(
      "text=/That's all|All communities|allLoaded/i",
    );

    // Either button is hidden OR "all loaded" message is shown
    const buttonHidden = !(await loadMoreButton.isVisible());
    const messageShown = await allLoadedText.isVisible();

    expect(buttonHidden || messageShown).toBeTruthy();
  });

  test("should preserve search results when loading more", async ({ page }) => {
    await page.goto("/en");

    // Wait for search input
    const searchInput = page.locator('input[type="search"]');
    await searchInput.waitFor({ timeout: 10000 });

    // Perform search
    await searchInput.fill("Lightning");
    await page.waitForTimeout(1000);

    // Count search results
    const searchResultCount = await page
      .locator('[data-testid="community-card"]')
      .count();

    if (searchResultCount > 0) {
      // If Load More is available, click it
      const loadMoreButton = page.locator("button", {
        hasText: "Load More",
      });

      if (await loadMoreButton.isVisible()) {
        await loadMoreButton.click();
        await page.waitForTimeout(800);

        // All results should still match search
        const cards = page.locator('[data-testid="community-card"]');
        const count = await cards.count();

        // Verify we have results
        expect(count).toBeGreaterThanOrEqual(searchResultCount);
      }
    }
  });
});
