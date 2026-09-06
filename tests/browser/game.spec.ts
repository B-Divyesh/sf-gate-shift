import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { authoredLevels, solveWithin } from '../../src/game';

test('the first screen names the play and shows the live board on desktop and phone', async ({ page }, testInfo) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  await page.goto('/');
  await expect(page).toHaveTitle('Gate Shift — rotate rings through gates');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Rotate rings to guide tokens through gates');
  await expect(page.getByRole('button', { name: 'Try it with sample data' })).toBeVisible();
  await expect(page.locator('.ring')).toHaveCount(6);
  await expect(page.getByText('Full set: $8 once')).toBeVisible();
  await page.waitForTimeout(250);
  expect(consoleErrors).toEqual([]);
  await testInfo.attach('first-screen', { body: await page.screenshot(), contentType: 'image/png' });
});

test('@claim:demo-isolated opens sample play in one click, labels it, and resets only demo storage', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByLabel('Demo mode')).toContainText('Demo — sample run, nothing is saved to your game.');
  const before = await page.locator('.run-stats strong').first().textContent();
  await page.getByRole('button', { name: 'Take short route' }).click();
  const after = await page.locator('.run-stats strong').first().textContent();
  expect(after).not.toBe(before);
  const storage = await page.evaluate(() => ({
    demo: localStorage.getItem('demo:gate-shift:run'),
    real: localStorage.getItem('gate-shift:run'),
  }));
  expect(storage.demo).toContain('movesLeft');
  expect(storage.real).toBeNull();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('.run-stats strong').first()).toHaveText(before ?? '');
  const afterReset = await page.evaluate(() => localStorage.getItem('gate-shift:run'));
  expect(afterReset).toBeNull();
});

test('@claim:reaches-end-screen completes a real scripted board through the UI', async ({ page }, testInfo) => {
  const level = authoredLevels[2];
  const solution = solveWithin(level.start, level.budget);
  expect(solution).not.toBeNull();
  await page.goto('/demo');
  await page.locator('[data-level="board-3"]').click();
  for (const move of solution!.moves) {
    await page.locator(`[data-ring="${move.ring}"]`).click();
    await page.locator(`[data-action="${move.direction}"]`).click();
  }
  await expect(page.getByRole('heading', { name: 'All six tokens reached their gates' })).toBeVisible();
  await expect(page.getByText(/You used \d+ of \d+ moves/)).toBeVisible();
  await testInfo.attach('completed-run', { body: await page.screenshot(), contentType: 'image/png' });
});

test('@claim:restart-resets returns a changed run to its original move budget', async ({ page }) => {
  await page.goto('/demo');
  const original = await page.locator('.run-stats strong').first().textContent();
  await page.getByRole('button', { name: 'Take long route' }).click();
  await expect(page.locator('.run-stats strong').first()).not.toHaveText(original ?? '');
  await page.getByRole('button', { name: 'Restart board' }).click();
  await expect(page.locator('.run-stats strong').first()).toHaveText(original ?? '');
  await expect(page.getByText('Board restarted.')).toBeVisible();
});

test('@claim:settings-persist saves an accessibility setting and keyboard controls change a run', async ({ page }) => {
  await page.goto('/demo');
  const original = await page.locator('.run-stats strong').first().textContent();
  await page.locator('main').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.run-stats strong').first()).not.toHaveText(original ?? '');
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByLabel('Use calm motion').check();
  await page.reload();
  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page.getByLabel('Use calm motion')).toBeChecked();
});

test('@claim:progress-stays keeps an active board in its own browser storage', async ({ page }) => {
  await page.goto('/demo');
  const startingMoves = await page.locator('.run-stats strong').first().textContent();
  await page.getByRole('button', { name: 'Take short route' }).click();
  const changedMoves = await page.locator('.run-stats strong').first().textContent();
  expect(changedMoves).not.toBe(startingMoves);
  await page.reload();
  await expect(page.locator('.run-stats strong').first()).toHaveText(changedMoves ?? '');
});

test('@claim:local-only-game-data makes no cross-origin requests during a demo run', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('http://127.0.0.1:4173/demo');
  await page.getByRole('button', { name: 'Take short route' }).click();
  await page.getByRole('button', { name: 'Show next safe move' }).click();
  expect(requests.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
  await context.close();
});

test('@claim:three-free-boards makes the tutorial and two boards playable without a purchase', async ({ page }) => {
  await page.goto('/');
  for (const id of ['board-1', 'board-2', 'board-3']) {
    await expect(page.locator(`[data-level="${id}"]`)).toBeEnabled();
  }
  await expect(page.locator('[data-level="board-4"]')).toBeDisabled();
});

test('@claim:one-time-offer states the complete offer and does not present a fake checkout', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '20 authored boards for $8 once' })).toBeVisible();
  await expect(page.getByText('No subscription, ads, or move sales.')).toBeVisible();
  await expect(page.getByText('Purchase is unavailable while registration is pending.')).toBeVisible();
  await expect(page.getByRole('link', { name: /checkout|buy|purchase/i })).toHaveCount(0);
});

test('@claim:60-fps-phone measures the visual loop on the Pixel 5 test profile', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'The frame measurement uses the phone profile.');
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.goto('/demo');
  const fps = await page.evaluate(async () => new Promise<number>((resolve) => {
    let frames = 0;
    const started = performance.now();
    const sample = (now: number): void => {
      frames += 1;
      if (now - started >= 2_000) resolve((frames * 1_000) / (now - started));
      else requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  }));
  expect(fps).toBeGreaterThanOrEqual(55);
});

test('privacy, terms, unknown routes, and paid status have useful route titles and recovery', async ({ page }) => {
  await page.goto('/privacy');
  await expect(page).toHaveTitle('Privacy — Gate Shift');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Privacy for Gate Shift players');
  await page.goto('/terms');
  await expect(page).toHaveTitle('Terms — Gate Shift');
  await expect(page.getByText('The complete set is offered as a one-time $8 purchase')).toBeVisible();
  await page.goto('/not-a-board');
  await expect(page).toHaveTitle('Page not found — Gate Shift');
  await expect(page.getByRole('link', { name: 'Play Gate Shift' })).toBeVisible();
  await page.goto('/');
  await expect(page.getByText('Purchase is unavailable while registration is pending.')).toBeVisible();
});

test('has no serious or critical accessibility violations on playable and legal routes', async ({ page }) => {
  for (const path of ['/', '/demo', '/privacy', '/terms', '/not-a-board']) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''));
    expect(serious, path).toEqual([]);
  }
});
