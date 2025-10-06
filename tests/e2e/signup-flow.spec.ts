import { test, expect } from '@playwright/test'

test.describe('User Signup Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en')
  })

  test('should complete full signup flow', async ({ page }) => {
    // Click sign up button
    await page.click('text=Create Account')

    // Fill signup form
    const username = `testuser_${Date.now()}`
    await page.fill('input[name="username"]', username)
    await page.fill('input[name="email"]', `${username}@example.com`)
    await page.fill('input[name="password"]', 'password123')
    await page.fill('input[name="confirmPassword"]', 'password123')

    // Submit form
    await page.click('button[type="submit"]')

    // Should redirect to discover page
    await expect(page).toHaveURL(/\/en\/discover/)

    // Should show success indication (user is logged in)
    await expect(page.locator('text=Sign Out')).toBeVisible()
  })

  test('should show error for duplicate username', async ({ page }) => {
    await page.goto('/en/sign-up')

    // Try to sign up with username that exists
    await page.fill('input[name="username"]', 'demo')
    await page.fill('input[name="password"]', 'password123')
    await page.fill('input[name="confirmPassword"]', 'password123')

    await page.click('button[type="submit"]')

    // Should show error
    await expect(page.locator('text=already taken')).toBeVisible()
  })

  test('should validate password mismatch', async ({ page }) => {
    await page.goto('/en/sign-up')

    await page.fill('input[name="username"]', 'newuser')
    await page.fill('input[name="password"]', 'password123')
    await page.fill('input[name="confirmPassword"]', 'differentpassword')

    await page.click('button[type="submit"]')

    // Should show mismatch error
    await expect(page.locator('text=do not match')).toBeVisible()
  })

  test('should validate password length', async ({ page }) => {
    await page.goto('/en/sign-up')

    await page.fill('input[name="username"]', 'newuser')
    await page.fill('input[name="password"]', '12345') // Too short
    await page.fill('input[name="confirmPassword"]', '12345')

    await page.click('button[type="submit"]')

    // Should show length error
    await expect(page.locator('text=at least 6 characters')).toBeVisible()
  })

  test('should accept optional Lightning address', async ({ page }) => {
    await page.goto('/en/sign-up')

    const username = `lightninguser_${Date.now()}`
    await page.fill('input[name="username"]', username)
    await page.fill('input[name="password"]', 'password123')
    await page.fill('input[name="confirmPassword"]', 'password123')
    await page.fill('input[name="lightningAddress"]', 'user@getalby.com')

    await page.click('button[type="submit"]')

    // Should succeed
    await expect(page).toHaveURL(/\/en\/discover/)
  })

  test('should validate invalid Lightning address', async ({ page }) => {
    await page.goto('/en/sign-up')

    await page.fill('input[name="username"]', 'newuser')
    await page.fill('input[name="password"]', 'password123')
    await page.fill('input[name="confirmPassword"]', 'password123')
    await page.fill('input[name="lightningAddress"]', 'invalid-format')

    await page.click('button[type="submit"]')

    // Should show validation error
    await expect(page.locator('text=Lightning address')).toBeVisible()
  })

  test('should navigate between sign-in and sign-up', async ({ page }) => {
    await page.goto('/en/sign-in')

    // Click "Create a new account here" link
    await page.click('text=Create a new account here')

    // Should be on sign-up page
    await expect(page).toHaveURL(/\/en\/sign-up/)

    // Click "Sign in here" link
    await page.click('text=Sign in here')

    // Should be back on sign-in page
    await expect(page).toHaveURL(/\/en\/sign-in/)
  })

  test('should work in Spanish locale', async ({ page }) => {
    await page.goto('/es/sign-up')

    // Verify Spanish locale is active
    await expect(page).toHaveURL(/\/es\//)

    // Fill form and submit
    const username = `testuser_es_${Date.now()}`
    await page.fill('input[name="username"]', username)
    await page.fill('input[name="password"]', 'password123')
    await page.fill('input[name="confirmPassword"]', 'password123')

    await page.click('button[type="submit"]')

    // Should redirect to Spanish discover page
    await expect(page).toHaveURL(/\/es\/discover/)
  })
})
