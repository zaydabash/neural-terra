import { test, expect } from '@playwright/test'

test.describe('Neural Terra vertical slice', () => {
  test('runs Suez scenario and shows simulation results', async ({ page }) => {
    await page.goto('/')

    // Basic shell is visible (HUD brand + mission control panel)
    await expect(page.getByText(/NEURAL/).first()).toBeVisible()
    await expect(page.getByText('Mission Control')).toBeVisible()

    // Open the scenarios drawer
    await page.getByRole('button', { name: /Scenarios/ }).click()

    // Run the Suez Canal Disruption scenario
    await page.getByText('Suez Canal Disruption').click()

    // Simulation results card appears (real backend or offline fallback)
    const results = page.getByTestId('simulation-results')
    await expect(results).toBeVisible({ timeout: 15000 })

    // At least one KPI line is rendered
    await expect(results.getByText('Global Trade')).toBeVisible()
  })

  test('switches to Mars and exposes Mars scenarios', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'Mars' }).click()

    // Status bar reflects the Mars console
    await expect(page.getByText('Mars Console')).toBeVisible()

    // Mars-only scenarios are available
    await page.getByRole('button', { name: /Scenarios/ }).click()
    await expect(page.getByText('Oxygen Grid Failure')).toBeVisible()
  })
})
