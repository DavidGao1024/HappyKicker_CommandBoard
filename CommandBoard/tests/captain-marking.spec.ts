import { test, expect } from '@playwright/test'

test.describe('Captain Marking Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should set captain via PlayerEditDialog', async ({ page }) => {
    // Click first home team player (white circle)
    const homePlayer = page.locator('[data-team="home"]').first()
    await homePlayer.click()

    // Wait for dialog to appear
    await expect(page.locator('.dialog-overlay')).toBeVisible()

    // Fill in name
    await page.locator('input[type="text"]').first().fill('张三')

    // Click captain switch
    await page.locator('.switch').click()

    // Confirm
    await page.locator('.btn-confirm').click()

    // Verify captain mark appears
    await expect(page.getByText('张三 (C)')).toBeVisible()
  })

  test('should enforce captain mutual exclusion', async ({ page }) => {
    // Set first player as captain
    const firstPlayer = page.locator('[data-team="home"]').first()
    await firstPlayer.click()
    await page.locator('input[type="text"]').first().fill('张三')
    await page.locator('.switch').click()
    await page.locator('.btn-confirm').click()
    await expect(page.getByText('张三 (C)')).toBeVisible()

    // Set second player as captain
    const secondPlayer = page.locator('[data-team="home"]').nth(1)
    await secondPlayer.click()
    await page.locator('input[type="text"]').first().fill('李四')
    await page.locator('.switch').click()
    await page.locator('.btn-confirm').click()

    // Verify only second player has captain mark
    await expect(page.getByText('李四 (C)')).toBeVisible()
    await expect(page.getByText('张三 (C)')).not.toBeVisible()
    await expect(page.getByText('张三', { exact: false })).toBeVisible() // Name still there, just no (C)
  })

  test('should remove captain mark when unchecked', async ({ page }) => {
    // Set player as captain
    const player = page.locator('[data-team="home"]').first()
    await player.click()
    await page.locator('input[type="text"]').first().fill('王五')
    await page.locator('.switch').click()
    await page.locator('.btn-confirm').click()
    await expect(page.getByText('王五 (C)')).toBeVisible()

    // Remove captain mark
    await player.click()
    await page.locator('.switch').click()
    await page.locator('.btn-confirm').click()

    // Verify captain mark removed
    await expect(page.getByText('王五 (C)')).not.toBeVisible()
    await expect(page.getByText('王五', { exact: false })).toBeVisible()
  })

  test('should set captain via RosterEditDialog', async ({ page }) => {
    // Open roster edit dialog
    await page.locator('button:has-text("编辑球员")').click()
    await expect(page.locator('.roster-dialog')).toBeVisible()

    // Click first home player input to open dropdown
    const firstInput = page.locator('.roster-team').first().locator('.roster-name').first()
    await firstInput.click()

    // Select a player from dropdown
    await page.locator('.roster-dropdown-item').first().click()

    // Click captain switch for first home player
    const firstCaptainSwitch = page.locator('.roster-team').first().locator('.switch').first()
    await firstCaptainSwitch.click()

    // Confirm
    await page.locator('.roster-dialog .btn-confirm').click()

    // Verify captain mark appears - check for any text containing (C) in home team
    const homePlayerTexts = await page.locator('[data-team="home"] text').allTextContents()
    const hasCaptainMark = homePlayerTexts.some(text => text.includes('(C)'))
    expect(hasCaptainMark).toBe(true)
  })

  test('should support captain for both teams independently', async ({ page }) => {
    // Set home team captain
    const homePlayer = page.locator('[data-team="home"]').first()
    await homePlayer.click()
    await page.locator('input[type="text"]').first().fill('主队长')
    await page.locator('.switch').click()
    await page.locator('.btn-confirm').click()

    // Set away team captain
    const awayPlayer = page.locator('[data-team="away"]').first()
    await awayPlayer.click()
    await page.locator('input[type="text"]').first().fill('客队长')
    await page.locator('.switch').click()
    await page.locator('.btn-confirm').click()

    // Verify both captains exist
    await expect(page.getByText('主队长 (C)')).toBeVisible()
    await expect(page.getByText('客队长 (C)')).toBeVisible()
  })

  test('should support undo/redo for captain changes', async ({ page }) => {
    // Set captain
    const player = page.locator('[data-team="home"]').first()
    await player.click()
    await page.locator('input[type="text"]').first().fill('赵六')
    await page.locator('.switch').click()
    await page.locator('.btn-confirm').click()
    await expect(page.getByText('赵六 (C)')).toBeVisible()

    // Undo
    await page.locator('button[title="撤销"]').click()
    await expect(page.getByText('赵六 (C)')).not.toBeVisible()

    // Redo
    await page.locator('button[title="重做"]').click()
    await expect(page.getByText('赵六 (C)')).toBeVisible()
  })

  test('should preserve captain mark after formation change', async ({ page }) => {
    // Set captain
    const player = page.locator('[data-team="home"]').first()
    await player.click()
    await page.locator('input[type="text"]').first().fill('孙七')
    await page.locator('.switch').click()
    await page.locator('.btn-confirm').click()
    await expect(page.getByText('孙七 (C)')).toBeVisible()

    // Change formation
    await page.locator('select').first().selectOption({ index: 1 })

    // Verify captain mark still exists
    await expect(page.getByText('孙七 (C)')).toBeVisible()
  })

  test('should clear captain mark on reset', async ({ page }) => {
    // Set captain
    const player = page.locator('[data-team="home"]').first()
    await player.click()
    await page.locator('input[type="text"]').first().fill('周八')
    await page.locator('.switch').click()
    await page.locator('.btn-confirm').click()
    await expect(page.getByText('周八 (C)')).toBeVisible()

    // Reset all
    await page.locator('button:has-text("重置")').click()

    // Verify captain mark cleared
    await expect(page.getByText('周八 (C)')).not.toBeVisible()
  })
})
