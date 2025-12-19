import { test, expect } from '@playwright/test'

test.describe('Neural Terra vertical slice', () => {
  test('runs Suez-like scenario and shows simulation results', async ({ page }) => {
    await page.goto('/')

    // Basic shell is visible
    await expect(page.getByRole('heading', { name: 'Neural Terra' })).toBeVisible()
    await expect(page.getByText('Earth Mode')).toBeVisible()

    // Open the scenarios drawer
    await page.getByRole('button', { name: 'Scenarios' }).click()

    // Click on the Suez Canal Disruption scenario
    await page.getByText('Suez Canal Disruption').click()

    // Wait for simulation results card to appear (either real backend or fallback)
    const results = page.getByTestId('simulation-results')
    await expect(results).toBeVisible({ timeout: 15000 })

    // We should see at least one KPI line rendered
    await expect(results.getByText('Global Trade Impact')).toBeVisible()
  })
})
