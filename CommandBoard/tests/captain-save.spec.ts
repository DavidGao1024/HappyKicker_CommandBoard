import { test, expect } from '@playwright/test';

test('captain toggle saves correctly', async ({ page }) => {
  const consoleMessages: string[] = [];
  page.on('console', msg => {
    consoleMessages.push(`${msg.type()}: ${msg.text()}`);
  });

  await page.goto('http://localhost:5173');
  await page.waitForSelector('svg');

  // 打开编辑球员弹窗
  await page.click('text=编辑球员');
  await page.waitForSelector('.roster-dialog');

  // 给第一个球员设置名字
  const firstInput = page.locator('.roster-name').first();
  await firstInput.click();
  await page.waitForSelector('.roster-dropdown-teleport');
  await page.click('.roster-dropdown-item:first-child');

  // 设置第一个球员为队长
  const firstSwitch = page.locator('.switch').first();
  await firstSwitch.click();
  await page.waitForTimeout(300);

  // 检查开关是否打开
  const isChecked = await firstSwitch.locator('input[type="checkbox"]').isChecked();
  console.log('Switch checked before confirm:', isChecked);

  // 点击确定
  await page.click('text=确定');
  await page.waitForTimeout(500);

  // 重新打开弹窗检查是否保存
  await page.click('text=编辑球员');
  await page.waitForSelector('.roster-dialog');

  const firstSwitchAfter = page.locator('.switch').first();
  const isCheckedAfter = await firstSwitchAfter.locator('input[type="checkbox"]').isChecked();
  console.log('Switch checked after reopen:', isCheckedAfter);

  // 检查球员标记上是否有队长标识
  const playerMarkers = await page.locator('[data-team="home"]').all();
  console.log('Found player markers:', playerMarkers.length);

  // 输出所有控制台消息
  console.log('All console messages:', consoleMessages.join('\n'));

  expect(isCheckedAfter).toBe(true);
});
