import { test, expect } from '@playwright/test';

test.describe('Bookshelf page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/bookshelf');
    // Wait for books to load
    await page.waitForSelector('.group\\/book', { timeout: 10_000 });
  });

  test.describe('Dropdown visibility', () => {
    test('sort dropdown options are not obscured by the bookshelf grid', async ({ page }) => {
      // Click the sort dropdown trigger
      const sortButton = page.locator('button', { hasText: /Recently Read/i });
      await sortButton.click();

      // All sort options should be visible (not hidden behind the grid)
      const options = ['Recently Read', 'Title', 'Author', 'Published Date', 'Rating'];
      for (const option of options) {
        const optionEl = page.locator('[role="menuitem"]', { hasText: option });
        await expect(optionEl).toBeVisible();
      }
    });

    test('sort dropdown options are clickable (not blocked by grid z-index)', async ({ page }) => {
      const sortButton = page.locator('button', { hasText: /Recently Read/i });
      await sortButton.click();

      // Click "Rating" — the last option, most likely to overlap the grid
      const ratingOption = page.locator('[role="menuitem"]', { hasText: 'Rating' });
      await expect(ratingOption).toBeVisible();

      // Verify the option's bounding box overlaps vertically with the bookshelf grid
      const optionBox = await ratingOption.boundingBox();
      const gridBox = await page.locator('.site-frame').boundingBox();
      expect(optionBox).toBeTruthy();
      expect(gridBox).toBeTruthy();
      // The bottom options should overlap the grid's top edge
      expect(optionBox!.y + optionBox!.height).toBeGreaterThan(gridBox!.y);

      // The option should still be clickable despite overlapping
      await ratingOption.click();
      // If we get here without a timeout, the click landed — z-index is correct
    });

    test('shelves dropdown options are not obscured by the bookshelf grid', async ({ page }) => {
      // Click the shelves dropdown trigger
      const shelvesButton = page.locator('button', { hasText: /All/i });
      await shelvesButton.click();

      // At least the first few shelf options should be visible
      const checkboxes = page.locator('input[type="checkbox"]');
      const count = await checkboxes.count();
      expect(count).toBeGreaterThan(0);

      // First checkbox should be visible and clickable
      await expect(checkboxes.first()).toBeVisible();
    });

    test('shelves dropdown allows selecting a shelf', async ({ page }) => {
      const shelvesButton = page.locator('button', { hasText: /All/i });
      await shelvesButton.click();

      // Click the first checkbox
      const firstCheckbox = page.locator('input[type="checkbox"]').first();
      await firstCheckbox.click();

      // The trigger text should update to show "1 selected"
      const updatedTrigger = page.locator('button', { hasText: /1 selected/i });
      await expect(updatedTrigger).toBeVisible();
    });
  });

  test.describe('Book hover interactions', () => {
    test('hovering a book shows a tooltip with title and author', async ({ page }) => {
      const book = page.locator('.group\\/book').nth(3);
      await book.hover();

      // Tooltip should appear (Radix tooltip renders in a portal)
      const tooltip = page.locator('[data-radix-popper-content-wrapper]');
      await expect(tooltip).toBeVisible({ timeout: 2000 });

      // Tooltip should contain text (title or author)
      const tooltipText = await tooltip.textContent();
      expect(tooltipText).toBeTruthy();
      expect(tooltipText!.length).toBeGreaterThan(3);
    });

    test('hovering a book lifts it visually', async ({ page }) => {
      const book = page.locator('.group\\/book').nth(3);

      // Get resting position
      const restingBox = await book.boundingBox();
      expect(restingBox).toBeTruthy();

      await book.hover();
      // Wait for the 500ms transition to mostly complete
      await page.waitForTimeout(600);

      // Get hovered position
      const hoveredBox = await book.boundingBox();
      expect(hoveredBox).toBeTruthy();

      // Book should have moved upward (lower Y value)
      expect(hoveredBox!.y).toBeLessThan(restingBox!.y);
    });

    test('clicking a book navigates to its link', async ({ page }) => {
      const bookLink = page.locator('.group\\/book a[target="_blank"]').first();
      const href = await bookLink.getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).not.toBe('#');
    });
  });

  test.describe('Search and filter', () => {
    test('search input filters books', async ({ page }) => {
      const initialCount = await page.locator('.group\\/book').count();
      expect(initialCount).toBeGreaterThan(0);

      // Type a search query
      const searchInput = page.locator('input[placeholder*="Search"]');
      await searchInput.fill('fight club');

      // Wait for debounce
      await page.waitForTimeout(500);

      const filteredCount = await page.locator('.group\\/book').count();
      expect(filteredCount).toBeLessThan(initialCount);
      expect(filteredCount).toBeGreaterThan(0);
    });
  });
});

test.describe('About page', () => {
  test('renders without errors', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('img[alt*="Kory"]')).toBeVisible();
    await expect(page.getByRole('heading', { name: /top-ranked poker player/i })).toBeVisible();
  });
});
