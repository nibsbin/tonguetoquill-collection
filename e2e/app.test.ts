import { expect, test } from '@playwright/test';

test.describe('Tonguetoquill Web App', () => {
	test('should load the home page', async ({ page }) => {
		await page.goto('/');

		// Wait for the app to load (loading indicator should disappear)
		await expect(page.getByText('Loading...')).toBeHidden({ timeout: 10000 });
	});

	test('should render sidebar', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByText('Loading...')).toBeHidden({ timeout: 10000 });

		// Check for sidebar elements
		const newDocButton = page.getByRole('button', { name: /New Document/i });
		await expect(newDocButton).toBeVisible();
	});

	test('should show no document selected state', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByText('Loading...')).toBeHidden({ timeout: 10000 });

		// Should show "No Document Selected" when no document is active
		await expect(page.getByText('No Document Selected')).toBeVisible();
	});

	test('should render top menu', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByText('Loading...')).toBeHidden({ timeout: 10000 });

		// Check for download button in top menu
		const downloadButton = page.getByRole('button', { name: /Download/i });
		await expect(downloadButton).toBeVisible();
	});

	test('should have skip to main content link for accessibility', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByText('Loading...')).toBeHidden({ timeout: 10000 });

		// Check for skip link
		const skipLink = page.getByText('Skip to main content');
		await expect(skipLink).toBeAttached();
	});
});
