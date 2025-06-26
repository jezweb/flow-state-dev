import { expect, test } from '@playwright/test'

test('home page has expected h1', async ({ page }) => {
	await page.goto('/')
	await expect(page.locator('h1')).toContainText('SvelteKit app')
})

test('counter increments when clicked', async ({ page }) => {
	await page.goto('/')
	const button = page.locator('button')
	
	await expect(button).toContainText('Clicks: 0')
	await button.click()
	await expect(button).toContainText('Clicks: 1')
})

test('about page has expected text', async ({ page }) => {
	await page.goto('/about')
	await expect(page.locator('h1')).toContainText('About this app')
})