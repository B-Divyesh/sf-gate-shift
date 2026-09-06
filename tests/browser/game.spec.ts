import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { authoredLevels, solveWithin } from '../../src/game';

const routeLabels = {
  clockwise: { preview: 'Preview short route', take: 'Take short route' },
  counterclockwise: { preview: 'Preview long route', take: 'Take long route' },
} as const;

const previewAndTake = async (page: Page, direction: keyof typeof routeLabels): Promise<void> => {
  await page.getByRole('button', { name: routeLabels[direction].preview }).click();
  await expect(page.getByText('Preview only — no move used.')).toBeVisible();
  await page.getByRole('button', { name: routeLabels[direction].take }).click();
};

const movesLeft = (page: Page) => page.locator('.run-stats strong').first();

test('the first screen names the play, states three facts, and shows the game', async ({ page }, testInfo) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  if (testInfo.project.name === 'desktop') await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');
  await expect(page).toHaveTitle('Gate Shift — rotate rings through gates');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Rotate rings to guide tokens through gates');
  await expect(page.getByText('For logic-puzzle players who want a short finished board, not an endless loop.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Try it with sample data' })).toBeVisible();
  await expect(page.locator('.facts li')).toHaveCount(3);
  await expect(page.locator('.ring')).toHaveCount(6);
  if (testInfo.project.name === 'phone') {
    const viewportHeight = page.viewportSize()!.height;
    const factsBox = await page.locator('.facts').boundingBox();
    const boardBox = await page.locator('.first-game').boundingBox();
    expect(factsBox && factsBox.y + factsBox.height).toBeLessThanOrEqual(viewportHeight);
    expect(boardBox?.y).toBeLessThanOrEqual(viewportHeight - 120);
  } else {
    const viewportHeight = page.viewportSize()!.height;
    const firstScreenTargets = [
      page.getByRole('heading', { level: 1 }),
      page.locator('.intro'),
      page.getByRole('button', { name: 'Try it with sample data' }),
      page.locator('.intro-actions span'),
      page.locator('.facts'),
      page.locator('.first-game .game-topline'),
      page.locator('.first-game .ring').first(),
    ];
    for (const target of firstScreenTargets) {
      const box = await target.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.y).toBeGreaterThanOrEqual(0);
      expect(box!.y + box!.height).toBeLessThanOrEqual(viewportHeight);
    }
  }
  await page.waitForTimeout(250);
  expect(consoleErrors).toEqual([]);
  await testInfo.attach('first-screen', { body: await page.screenshot(), contentType: 'image/png' });
});

test('@claim:demo-isolated opens, labels, resets, discards demo storage on exit, and leaves regular storage unchanged', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('gate-shift:sentinel', 'regular-data'));
  await page.getByRole('button', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByLabel('Demo mode')).toContainText('Demo — sample data, nothing is saved');
  const before = await movesLeft(page).textContent();
  const startingState = await page.locator('.ring').evaluateAll((rings) => rings.map((ring) => `${ring.getAttribute('data-angle')}:${ring.getAttribute('data-gate')}`));
  await previewAndTake(page, 'clockwise');
  await expect(movesLeft(page)).not.toHaveText(before ?? '');
  const storage = await page.evaluate(() => ({
    demo: localStorage.getItem('demo:gate-shift:run'),
    regularRun: localStorage.getItem('gate-shift:run'),
    sentinel: localStorage.getItem('gate-shift:sentinel'),
  }));
  expect(storage.demo).toContain('movesLeft');
  expect(storage.regularRun).toBeNull();
  expect(storage.sentinel).toBe('regular-data');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(movesLeft(page)).toHaveText(before ?? '');
  expect(await page.evaluate(() => localStorage.getItem('gate-shift:sentinel'))).toBe('regular-data');
  await previewAndTake(page, 'counterclockwise');
  const demoKeysBeforeExit = await page.evaluate(() => Object.keys(localStorage)
    .filter((key) => key.startsWith('demo:gate-shift:')).sort());
  expect(demoKeysBeforeExit).toEqual(expect.arrayContaining([
    'demo:gate-shift:run',
    'demo:gate-shift:settings',
  ]));
  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByLabel('Demo mode')).toHaveCount(0);
  const afterExit = await page.evaluate(() => ({
    demoKeys: Object.keys(localStorage).filter((key) => key.startsWith('demo:gate-shift:')),
    regularRun: localStorage.getItem('gate-shift:run'),
    sentinel: localStorage.getItem('gate-shift:sentinel'),
  }));
  expect(afterExit.demoKeys).toEqual([]);
  expect(afterExit.regularRun).toBeNull();
  expect(afterExit.sentinel).toBe('regular-data');
  await page.getByRole('button', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(movesLeft(page)).toHaveText(before ?? '');
  expect(await page.locator('.ring').evaluateAll((rings) => rings.map((ring) => `${ring.getAttribute('data-angle')}:${ring.getAttribute('data-gate')}`))).toEqual(startingState);
});

test('@claim:route-preview previews both outcomes without spending a move, then applies the shown state', async ({ page }) => {
  await page.goto('/demo');
  const startingMoves = await movesLeft(page).textContent();
  const startingAngles = await page.locator('.ring').evaluateAll((rings) => rings.map((ring) => ring.getAttribute('data-angle')));
  const startingGates = await page.locator('.ring').evaluateAll((rings) => rings.map((ring) => ring.getAttribute('data-gate')));

  await page.getByRole('button', { name: 'Preview long route' }).click();
  const longAngles = await page.locator('.ring').evaluateAll((rings) => rings.map((ring) => ring.getAttribute('data-angle')));
  const longGates = await page.locator('.ring').evaluateAll((rings) => rings.map((ring) => ring.getAttribute('data-gate')));
  expect(longAngles[0]).not.toBe(startingAngles[0]);
  expect(longGates).toEqual(startingGates);
  await expect(movesLeft(page)).toHaveText(startingMoves ?? '');
  await page.getByRole('button', { name: 'Cancel preview' }).click();
  expect(await page.locator('.ring').evaluateAll((rings) => rings.map((ring) => ring.getAttribute('data-angle')))).toEqual(startingAngles);

  await page.getByRole('button', { name: 'Preview short route' }).click();
  const shortAngles = await page.locator('.ring').evaluateAll((rings) => rings.map((ring) => ring.getAttribute('data-angle')));
  const shortGates = await page.locator('.ring').evaluateAll((rings) => rings.map((ring) => ring.getAttribute('data-gate')));
  expect(shortAngles[0]).not.toBe(startingAngles[0]);
  expect(shortGates[1]).not.toBe(startingGates[1]);
  await page.getByRole('button', { name: 'Take short route' }).click();
  await expect(movesLeft(page)).toHaveText(String(Number(startingMoves) - 1));
  expect(await page.locator('.ring').evaluateAll((rings) => rings.map((ring) => ring.getAttribute('data-angle')))).toEqual(shortAngles);
  expect(await page.locator('.ring').evaluateAll((rings) => rings.map((ring) => ring.getAttribute('data-gate')))).toEqual(shortGates);
});

test('@claim:reaches-end-screen completes a real scripted board through the UI', async ({ page }, testInfo) => {
  const level = authoredLevels[2];
  const solution = solveWithin(level.start, level.budget);
  expect(solution).not.toBeNull();
  await page.goto('/demo');
  await page.locator('[data-level="board-3"]').click();
  for (const move of solution!.moves) {
    await page.locator(`[data-ring="${move.ring}"]`).click();
    await previewAndTake(page, move.direction);
  }
  await expect(page.getByRole('heading', { name: 'All six tokens reached their gates' })).toBeVisible();
  await expect(page.getByText(/You used \d+ of \d+ moves/)).toBeVisible();
  await testInfo.attach('completed-run', { body: await page.screenshot(), contentType: 'image/png' });
});

test('@claim:restart-resets returns a changed run to its original move budget', async ({ page }) => {
  await page.goto('/demo');
  const original = await movesLeft(page).textContent();
  await previewAndTake(page, 'counterclockwise');
  await expect(movesLeft(page)).not.toHaveText(original ?? '');
  await page.getByRole('button', { name: 'Restart board' }).click();
  await expect(movesLeft(page)).toHaveText(original ?? '');
  await expect(page.getByText('Board restarted.')).toBeVisible();
});

test('@claim:undo-no-penalty restores the state and move budget after a turn', async ({ page }) => {
  await page.goto('/demo');
  const originalMoves = await movesLeft(page).textContent();
  const originalState = await page.locator('.ring').evaluateAll((rings) => rings.map((ring) => `${ring.getAttribute('data-angle')}:${ring.getAttribute('data-gate')}`));
  await previewAndTake(page, 'clockwise');
  await page.getByRole('button', { name: 'Undo free move' }).click();
  await expect(movesLeft(page)).toHaveText(originalMoves ?? '');
  expect(await page.locator('.ring').evaluateAll((rings) => rings.map((ring) => `${ring.getAttribute('data-angle')}:${ring.getAttribute('data-gate')}`))).toEqual(originalState);
});

test('@claim:settings-persist saves the calm-motion setting in this browser', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByLabel('Use calm motion').check();
  await page.reload();
  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page.getByLabel('Use calm motion')).toBeChecked();
});

test('@claim:progress-stays keeps an active board in its own browser storage', async ({ page }) => {
  await page.goto('/demo');
  const startingMoves = await movesLeft(page).textContent();
  await previewAndTake(page, 'clockwise');
  const changedMoves = await movesLeft(page).textContent();
  expect(changedMoves).not.toBe(startingMoves);
  await page.reload();
  await expect(movesLeft(page)).toHaveText(changedMoves ?? '');
});

test('@claim:local-only-game-data makes no cross-origin requests during a demo run', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const requests: { url: string; method: string }[] = [];
  page.on('request', (request) => requests.push({ url: request.url(), method: request.method() }));
  await page.goto('http://127.0.0.1:4173/demo');
  await previewAndTake(page, 'clockwise');
  await page.getByRole('button', { name: 'Show next safe move' }).click();
  expect(requests.length).toBeGreaterThan(0);
  expect(requests.every((request) => new URL(request.url).origin === 'http://127.0.0.1:4173')).toBe(true);
  expect(requests.every((request) => request.method === 'GET' && !new URL(request.url).pathname.startsWith('/api/'))).toBe(true);
  await context.close();
});

test('@claim:no-accounts-analytics-ads runs a sample action without sign-in, ads, cookies, or tracking requests', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('http://127.0.0.1:4173/demo');
  await previewAndTake(page, 'counterclockwise');
  await page.goto('http://127.0.0.1:4173/privacy');
  await expect(page.getByRole('textbox')).toHaveCount(0);
  await expect(page.getByRole('link', { name: /sign in|create account/i })).toHaveCount(0);
  await expect(page.locator('iframe')).toHaveCount(0);
  expect(await context.cookies()).toEqual([]);
  expect(requests.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
  expect(requests.some((url) => /analytics|tracking|doubleclick/i.test(url))).toBe(false);
  await context.close();
});

test('@claim:three-free-boards makes three boards playable and keeps the paid 17 locked', async ({ page }) => {
  await page.goto('/');
  for (const id of ['board-1', 'board-2', 'board-3']) await expect(page.locator(`[data-level="${id}"]`)).toBeEnabled();
  for (let number = 4; number <= 20; number += 1) await expect(page.locator(`[data-level="board-${number}"]`)).toBeDisabled();
});

test('@claim:one-time-offer states the full offer and does not present a fake checkout', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '20 authored boards for $8 once' })).toBeVisible();
  await expect(page.getByText('The full set adds 17 boards.')).toBeVisible();
  await expect(page.getByText('No subscription, ads, or move sales.')).toBeVisible();
  await expect(page.getByText('Purchase is unavailable while registration is pending.')).toBeVisible();
  await expect(page.getByRole('link', { name: /checkout|buy|purchase/i })).toHaveCount(0);
});

test('@claim:controls-work changes the board with mouse, touch, swipe, and all documented keys', async ({ page }, testInfo) => {
  await page.goto('/demo');
  const original = await movesLeft(page).textContent();
  if (testInfo.project.name === 'desktop') {
    await page.locator('[data-ring="1"]').click();
    await expect(page.locator('[data-ring="1"]')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('[data-ring="1"]').press('ArrowDown');
    await expect(page.locator('[data-ring="2"]')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('[data-ring="2"]').press('ArrowUp');
    await expect(page.locator('[data-ring="1"]')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('[data-ring="1"]').press('ArrowRight');
    await expect(movesLeft(page)).toHaveText(String(Number(original) - 1));
    await page.locator('[data-ring="1"]').press('u');
    await expect(movesLeft(page)).toHaveText(original ?? '');
    await page.locator('[data-ring="1"]').press('ArrowLeft');
    await page.locator('[data-ring="1"]').press('r');
    await expect(movesLeft(page)).toHaveText(original ?? '');
  } else {
    await page.locator('[data-ring="2"]').tap();
    await expect(page.locator('[data-ring="2"]')).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'Preview long route' }).tap();
    await page.getByRole('button', { name: 'Take long route' }).tap();
    await expect(movesLeft(page)).toHaveText(String(Number(original) - 1));
    await page.getByRole('button', { name: 'Restart board' }).tap();
    const ring = page.locator('[data-ring="0"]');
    const box = (await ring.boundingBox())!;
    await ring.dispatchEvent('pointerdown', { clientX: box.x + 8, clientY: box.y + box.height / 2, pointerType: 'touch', pointerId: 1 });
    await ring.dispatchEvent('pointerup', { clientX: box.x + box.width - 8, clientY: box.y + box.height / 2, pointerType: 'touch', pointerId: 1 });
    await expect(movesLeft(page)).toHaveText(String(Number(original) - 1));
  }
});

test('@claim:safe-move-hint repeatedly returns moves that finish the active board', async ({ page }) => {
  await page.goto('/demo');
  for (let turn = 0; turn < authoredLevels[0].budget; turn += 1) {
    if (await page.getByRole('heading', { name: 'All six tokens reached their gates' }).isVisible()) break;
    await page.getByRole('button', { name: 'Show next safe move' }).click();
    const hint = await page.locator('.hint').textContent();
    const match = hint?.match(/select (North|East|South|West|Upper|Lower) ring, then take the (short|long) route/);
    expect(match).not.toBeNull();
    const ring = ['North', 'East', 'South', 'West', 'Upper', 'Lower'].indexOf(match![1]);
    await page.locator(`[data-ring="${ring}"]`).click();
    await previewAndTake(page, match![2] === 'short' ? 'clockwise' : 'counterclockwise');
  }
  await expect(page.getByRole('heading', { name: 'All six tokens reached their gates' })).toBeVisible();
});

test('@claim:symbol-cues keeps six distinct symbols when token color is removed', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByLabel('Use high-contrast symbols').check();
  const symbols = await page.locator('.token').allTextContents();
  expect(new Set(symbols).size).toBe(6);
  const colors = await page.locator('.token').evaluateAll((tokens) => tokens.map((token) => getComputedStyle(token).backgroundColor));
  expect(new Set(colors).size).toBe(1);
  const labels = await page.locator('.ring').evaluateAll((rings) => rings.map((ring) => ring.getAttribute('aria-label')));
  for (const symbol of symbols) expect(labels.some((label) => label?.includes(symbol))).toBe(true);
});

test('@claim:hidden-tab-pauses stops the loop and leaves a resumable board when the tab is hidden', async ({ page }) => {
  await page.goto('/demo');
  await page.waitForFunction(() => Number(document.querySelector('#app')?.getAttribute('data-runtime-seconds')) >= 1);
  const before = await page.locator('#app').getAttribute('data-runtime-seconds');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForTimeout(1_200);
  const after = await page.locator('#app').getAttribute('data-runtime-seconds');
  expect(after).toBe(before);
  await expect(page.getByRole('heading', { name: 'Your board is safe here' })).toBeVisible();
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.getByRole('button', { name: 'Resume board' }).last().click();
  await expect(page.getByRole('heading', { name: 'Your board is safe here' })).toHaveCount(0);
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

test('keyboard focus stays with changed controls and enters and leaves settings', async ({ page }) => {
  await page.goto('/demo');
  const preview = page.getByRole('button', { name: 'Preview short route' });
  await preview.focus();
  await page.keyboard.press('Space');
  await expect(preview).toBeFocused();
  await page.getByRole('button', { name: 'Take short route' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Preview short route' })).toBeFocused();
  const settings = page.getByRole('button', { name: 'Settings' });
  await settings.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Use calm motion')).toBeFocused();
  await page.getByRole('button', { name: 'Close settings' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Settings' })).toBeFocused();
});

test('all visible links and buttons meet the 44 CSS-pixel touch target on phone', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'Touch target measurements use the phone profile.');
  for (const path of ['/demo', '/privacy', '/terms']) {
    await page.goto(path);
    const small = await page.locator('a:visible, button:visible').evaluateAll((elements) => elements
      .map((element) => {
        const box = element.getBoundingClientRect();
        return { name: element.textContent?.trim(), width: box.width, height: box.height };
      })
      .filter((box) => box.width < 44 || box.height < 44));
    expect(small, path).toEqual([]);
  }
});

test('@claim:finite-one-player reaches a finite loss without any room or ranking flow and recovers cleanly', async ({ page, browser }, testInfo) => {
  await page.goto('/demo');
  await expect(page.getByText(/room code|join room|leaderboard/i)).toHaveCount(0);
  for (let turn = 0; turn < authoredLevels[0].budget; turn += 1) await page.locator('[data-ring="0"]').press('ArrowLeft');
  await expect(page.getByRole('heading', { name: 'The move budget is used' })).toBeVisible();
  await page.getByRole('button', { name: 'Undo last move' }).click();
  await expect(movesLeft(page)).toHaveText('1');
  const recoveryContext = await browser.newContext({ reducedMotion: 'reduce' });
  await recoveryContext.addInitScript(() => {
    if (!sessionStorage.getItem('seeded-invalid-run')) {
      localStorage.setItem('demo:gate-shift:run', '{broken');
      sessionStorage.setItem('seeded-invalid-run', 'true');
    }
  });
  const recoveryPage = await recoveryContext.newPage();
  await recoveryPage.goto('http://127.0.0.1:4173/demo');
  await expect(movesLeft(recoveryPage)).toHaveText(String(authoredLevels[0].budget));
  await expect(recoveryPage.locator('#app')).toHaveAttribute('data-calm', 'true');
  await recoveryPage.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  expect(await recoveryPage.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await testInfo.attach('recovery', { body: await recoveryPage.screenshot({ fullPage: true }), contentType: 'image/png' });
  await recoveryContext.close();
});

test('privacy, terms, and unknown routes have useful titles and recovery', async ({ page }) => {
  await page.goto('/privacy');
  await expect(page).toHaveTitle('Privacy — Gate Shift');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Privacy for Gate Shift players');
  await page.goto('/terms');
  await expect(page).toHaveTitle('Terms — Gate Shift');
  await expect(page.getByText('The complete set is offered as a one-time $8 purchase')).toBeVisible();
  await page.goto('/not-a-board');
  await expect(page).toHaveTitle('Page not found — Gate Shift');
  await expect(page.getByRole('link', { name: 'Play Gate Shift' })).toBeVisible();
});

test('has no serious or critical accessibility violations on playable and legal routes', async ({ page }) => {
  for (const path of ['/', '/demo', '/privacy', '/terms', '/not-a-board']) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''));
    expect(serious, path).toEqual([]);
  }
});
