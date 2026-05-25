import { test, expect } from '@playwright/test';

test('captain toggle in roster edit dialog', async ({ page }) => {
  // 监听控制台输出
  const consoleMessages: string[] = [];
  page.on('console', msg => {
    consoleMessages.push(`${msg.type()}: ${msg.text()}`);
  });

  await page.goto('http://localhost:5173');

  // 等待页面加载
  await page.waitForSelector('svg');

  // 点击工具栏的"编辑球员"按钮
  await page.click('text=编辑球员');

  // 等待弹窗出现
  await page.waitForSelector('.roster-dialog');

  // 找到第一个队长开关
  const firstSwitch = page.locator('.switch').first();

  // 检查开关初始状态
  const initialChecked = await firstSwitch.locator('input[type="checkbox"]').isChecked();
  console.log('Initial checked state:', initialChecked);

  // 点击开关
  await firstSwitch.click();

  // 等待一下让状态更新
  await page.waitForTimeout(500);

  // 检查开关是否改变
  const afterChecked = await firstSwitch.locator('input[type="checkbox"]').isChecked();
  console.log('After click checked state:', afterChecked);

  // 输出控制台消息
  console.log('Console messages:', consoleMessages);

  // 验证状态改变
  expect(afterChecked).toBe(!initialChecked);

  // 再点击一次
  await firstSwitch.click();
  await page.waitForTimeout(500);

  const secondClickChecked = await firstSwitch.locator('input[type="checkbox"]').isChecked();
  console.log('After second click:', secondClickChecked);

  // 输出所有控制台消息
  console.log('All console messages:', consoleMessages.join('\n'));
});
