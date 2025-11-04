import { expect, test } from '@playwright/test';

test('home page loads successfully', async ({ page }) => {
	await page.goto('/');

	// Wait for the app to load (loading indicator should disappear)
	await expect(page.getByText('Loading...')).toBeHidden({ timeout: 10000 });

	// Verify the app is interactive
	await expect(page.getByRole('button', { name: /New Document/i })).toBeVisible();
});
