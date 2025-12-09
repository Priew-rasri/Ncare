import { test, expect } from '@playwright/test';

test.describe('POS System - Critical Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.click('text=ภก. สมชาย (Owner)');
    await expect(page.getByText('Dashboard')).toBeVisible();

    // Navigate to POS
    await page.click('text=POS');
    await expect(page.getByText('Point of Sale')).toBeVisible();
  });

  test('should open shift before starting sales', async ({ page }) => {
    // Check if shift modal appears
    const hasShiftModal = await page.getByText('Start Shift').isVisible().catch(() => false);

    if (hasShiftModal) {
      // Open shift with starting cash
      await page.fill('input[type="number"]', '1000');
      await page.click('button:has-text("Start Shift")');

      // Verify shift is open
      await expect(page.getByText(/Active Shift/i)).toBeVisible();
    }
  });

  test('should search and add product to cart', async ({ page }) => {
    // Ensure shift is open (skip if already open)
    const shiftButton = await page.getByText('Open Shift').isVisible().catch(() => false);
    if (shiftButton) {
      await page.click('text=Open Shift');
      await page.fill('input[type="number"]', '1000');
      await page.click('button:has-text("Start")');
    }

    // Search for product
    await page.fill('input[placeholder*="Search"]', 'Sara');
    await page.waitForTimeout(500); // Wait for search results

    // Click on product to add
    await page.click('text=Sara (Paracetamol 500mg)');

    // Verify cart has item
    await expect(page.getByText('Sara')).toBeVisible();
  });

  test('should complete cash payment', async ({ page }) => {
    // Open shift if needed
    const shiftButton = await page.getByText('Open Shift').isVisible().catch(() => false);
    if (shiftButton) {
      await page.click('text=Open Shift');
      await page.fill('input[type="number"]', '1000');
      await page.click('button:has-text("Start")');
    }

    // Add product to cart
    await page.fill('input[placeholder*="Search"]', 'Sara');
    await page.waitForTimeout(500);
    await page.click('text=Sara (Paracetamol 500mg)');

    // Click Pay Cash button
    await page.click('text=💵 Pay Cash');

    // Enter tendered amount
    await page.fill('input[placeholder*="Tendered"]', '100');

    // Confirm payment
    await page.click('button:has-text("Complete Sale")');

    // Should show receipt
    await expect(page.getByText('Payment Successful')).toBeVisible();
  });

  test('should handle customer points', async ({ page }) => {
    // Open shift
    const shiftButton = await page.getByText('Open Shift').isVisible().catch(() => false);
    if (shiftButton) {
      await page.click('text=Open Shift');
      await page.fill('input[type="number"]', '1000');
      await page.click('button:has-text("Start")');
    }

    // Select customer
    await page.click('text=Customer');
    await page.click('text=คุณสมชาย ใจดี');

    // Add product
    await page.fill('input[placeholder*="Search"]', 'Sara');
    await page.waitForTimeout(500);
    await page.click('text=Sara (Paracetamol 500mg)');

    // Should show customer info with points
    await expect(page.getByText(/Points:/i)).toBeVisible();
  });

  test('should hold and resume bill', async ({ page }) => {
    // Open shift
    const shiftButton = await page.getByText('Open Shift').isVisible().catch(() => false);
    if (shiftButton) {
      await page.click('text=Open Shift');
      await page.fill('input[type="number"]', '1000');
      await page.click('button:has-text("Start")');
    }

    // Add product
    await page.fill('input[placeholder*="Search"]', 'Sara');
    await page.waitForTimeout(500);
    await page.click('text=Sara (Paracetamol 500mg)');

    // Hold bill
    await page.click('text=⏸ Hold');
    await page.click('button:has-text("Hold")');

    // Cart should be empty
    await expect(page.getByText('Empty Cart')).toBeVisible();

    // Resume bill
    await page.click('text=Held Bills');
    await page.click('button:has-text("Resume")').first();

    // Cart should have the product again
    await expect(page.getByText('Sara')).toBeVisible();
  });

  test('should detect drug allergies', async ({ page }) => {
    // Open shift
    const shiftButton = await page.getByText('Open Shift').isVisible().catch(() => false);
    if (shiftButton) {
      await page.click('text=Open Shift');
      await page.fill('input[type="number"]', '1000');
      await page.click('button:has-text("Start")');
    }

    // Select customer with known allergies (คุณสมชาย has Penicillin allergy)
    await page.click('text=Customer');
    await page.click('text=คุณสมชาย ใจดี');

    // Try to add Amoxicillin (Penicillin-based)
    await page.fill('input[placeholder*="Search"]', 'Amoxy');
    await page.waitForTimeout(500);
    await page.click('text=Amoxy (Amoxicillin 500mg)');

    // Should show allergy warning
    await expect(page.getByText(/Allergy Alert/i)).toBeVisible();
  });
});
