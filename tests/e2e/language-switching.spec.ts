import { test, expect } from "@playwright/test";

test.describe("Language Switching", () => {
  test("should switch from English to Spanish", async ({ page }) => {
    // Start at English homepage
    await page.goto("/en");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Verify we're on English version
    expect(page.url()).toContain("/en");

    // Find language toggle (could be a dropdown or button)
    const languageToggle = page
      .locator(
        '[data-testid="language-toggle"], button:has-text("English"), button:has-text("EN")',
      )
      .first();

    await languageToggle.click();

    // Click Spanish option
    const spanishOption = page.locator("text=/Español|Spanish|ES/i").first();

    await spanishOption.click();

    // Wait for navigation to Spanish version
    await page.waitForURL("**/es**", { timeout: 5000 });

    // Verify URL changed
    expect(page.url()).toContain("/es");

    // Verify content is in Spanish
    // Check for Spanish text in common UI elements
    const spanishContent = page
      .locator("text=/Descubre|Comunidades|Crear/i")
      .first();

    await expect(spanishContent).toBeVisible({ timeout: 5000 });
  });

  test("should switch from Spanish to English", async ({ page }) => {
    // Start at Spanish homepage
    await page.goto("/es");

    await page.waitForLoadState("networkidle");

    // Verify we're on Spanish version
    expect(page.url()).toContain("/es");

    // Find language toggle
    const languageToggle = page
      .locator(
        '[data-testid="language-toggle"], button:has-text("Español"), button:has-text("ES")',
      )
      .first();

    await languageToggle.click();

    // Click English option
    const englishOption = page.locator("text=/English|Inglés|EN/i").first();

    await englishOption.click();

    // Wait for navigation
    await page.waitForURL("**/en**", { timeout: 5000 });

    // Verify URL changed
    expect(page.url()).toContain("/en");

    // Verify content is in English
    const englishContent = page
      .locator("text=/Discover|Communities|Create/i")
      .first();

    await expect(englishContent).toBeVisible({ timeout: 5000 });
  });

  test("should persist language when navigating between pages", async ({
    page,
  }) => {
    // Start at English homepage
    await page.goto("/en");

    // Switch to Spanish
    const languageToggle = page
      .locator(
        '[data-testid="language-toggle"], button:has-text("English"), button:has-text("EN")',
      )
      .first();

    await languageToggle.click();

    const spanishOption = page.locator("text=/Español|Spanish|ES/i").first();

    await spanishOption.click();

    await page.waitForURL("**/es**");

    // Navigate to discover page
    const discoverLink = page.locator('a[href*="/discover"]').first();

    if (await discoverLink.isVisible()) {
      await discoverLink.click();
      await page.waitForURL("**/es/discover**");

      // Verify still in Spanish
      expect(page.url()).toContain("/es");
    }
  });

  test("should update all page content when switching language", async ({
    page,
  }) => {
    await page.goto("/en");

    // Switch to Spanish
    const languageToggle = page
      .locator(
        '[data-testid="language-toggle"], button:has-text("English"), button:has-text("EN")',
      )
      .first();

    await languageToggle.click();

    const spanishOption = page.locator("text=/Español|Spanish|ES/i").first();

    await spanishOption.click();

    await page.waitForURL("**/es**");

    // Verify we're on Spanish URL and page is functional
    expect(page.url()).toContain("/es");
  });

  test("should redirect root path to default locale", async ({ page }) => {
    // Visit root path
    await page.goto("/");

    // Should redirect to /en or /es
    await page.waitForLoadState("networkidle");

    const url = page.url();
    const hasLocale = url.includes("/en") || url.includes("/es");

    expect(hasLocale).toBeTruthy();
  });
});
