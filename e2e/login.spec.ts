import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display login page on initial load', async ({ page }) => {
    await page.goto('/');

    // Should show login form
    await expect(page.getByText('Ncare Pharmacy ERP')).toBeVisible();
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/');

    // Select user (assuming mock users)
    await page.click('text=ภก. สมชาย (Owner)');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByText('Dashboard')).toBeVisible();
  });

  test('should display user info after login', async ({ page }) => {
    await page.goto('/');
    await page.click('text=ภก. สมชาย (Owner)');

    // Check if user avatar/name is displayed
    await expect(page.locator('[title="Click to Logout"]')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    await page.goto('/');
    await page.click('text=ภก. สมชาย (Owner)');

    // Wait for dashboard to load
    await expect(page.getByText('Dashboard')).toBeVisible();

    // Click logout
    await page.click('[title="Click to Logout"]');

    // Should return to login page
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
  });
});
