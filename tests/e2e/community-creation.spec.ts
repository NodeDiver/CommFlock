import { test, expect } from '@playwright/test'

test.describe('Community Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in first
    await page.goto('/en/sign-in')
    await page.fill('input[name="username"]', 'demo')
    await page.fill('input[name="password"]', 'demo1234')
    await page.click('button[type="submit"]')

    // Wait for redirect
    await page.waitForURL(/\/en\/discover/)
  })

  test('should create a public community', async ({ page }) => {
    // Navigate to create page
    await page.goto('/en/create')

    // Fill community form
    const communityName = `Test Community ${Date.now()}`
    await page.fill('input[name="name"]', communityName)
    await page.fill('input[name="slug"]', `test-${Date.now()}`)
    await page.fill('textarea[name="description"]', 'A test community')

    // Select public and auto-join
    await page.check('input[name="isPublic"]')

    // Submit form
    await page.click('button[type="submit"]')

    // Should redirect to community page
    await expect(page).toHaveURL(/\/en\/test-/)

    // Should show community name
    await expect(page.locator(`text=${communityName}`)).toBeVisible()
  })

  test('should prevent duplicate slug', async ({ page }) => {
    await page.goto('/en/create')

    // Try to use existing slug
    await page.fill('input[name="name"]', 'New Community')
    await page.fill('input[name="slug"]', 'demo-community') // Already exists

    await page.click('button[type="submit"]')

    // Should show error
    await expect(page.locator('text=already taken')).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/en/create')

    // Try to submit without filling required fields
    await page.click('button[type="submit"]')

    // Should show validation errors
    await expect(page.locator('text=required')).toBeVisible()
  })

  test('should create private community', async ({ page }) => {
    await page.goto('/en/create')

    const communityName = `Private Community ${Date.now()}`
    const slug = `private-${Date.now()}`

    await page.fill('input[name="name"]', communityName)
    await page.fill('input[name="slug"]', slug)

    // Uncheck public
    await page.uncheck('input[name="isPublic"]')

    await page.click('button[type="submit"]')

    // Should redirect to community page
    await expect(page).toHaveURL(new RegExp(`/en/${slug}`))

    // Verify private community was created
    await expect(page.locator(`text=${communityName}`)).toBeVisible()
  })

  test('should show owner as member', async ({ page }) => {
    await page.goto('/en/create')

    const slug = `owner-test-${Date.now()}`
    await page.fill('input[name="name"]', 'Owner Test Community')
    await page.fill('input[name="slug"]', slug)

    await page.click('button[type="submit"]')

    // Navigate to dashboard
    await page.goto(`/en/${slug}/dashboard`)

    // Should see user as owner
    await expect(page.locator('text=demo')).toBeVisible()
    await expect(page.locator('text=OWNER')).toBeVisible()
  })
})
