const { chromium } = require('C:/Users/Sheng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');

const staleSave = {
  version: 1, area: 0, stage: 0,
  team: [{ id: 'pikachu', level: 8, hp: 70, max: 70, bond: 10, xp: 0 }],
  box: [], seen: ['pikachu'], caught: ['pikachu'],
  money: 1200, balls: 15, potions: 5, berries: 8, coins: 100,
  badges: 0, fished: 0, safari: 0, battles: 0, petWins: 0, steps: 0,
  starter: true
};

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe'
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(save => localStorage.setItem('pokemon-echoes-v1', JSON.stringify(save)), staleSave);
  await page.goto('http://127.0.0.1:4188');
  await page.waitForFunction(() => window.echoDiagnostics?.().ready);

  await page.locator('#track').click();
  await page.waitForFunction(() => {
    const state = echoDiagnostics();
    const professor = state.entities.find(entity => entity.id === 'prof');
    return professor && Math.hypot(professor.x - state.position.x, professor.z - state.position.z) < 2.8;
  });
  await page.keyboard.press('e');
  await page.getByRole('button', { name: '选择一位新的同行伙伴' }).click();

  assert.equal(await page.locator('[data-starter]').count(), 3);
  assert.equal(await page.locator('[data-starter="charmander"]').textContent(), '选择小火龙');
  await page.locator('[data-starter="charmander"]').click();

  const state = await page.evaluate(() => ({
    diagnostics: echoDiagnostics(),
    save: JSON.parse(localStorage.getItem('pokemon-echoes-v1'))
  }));
  assert.equal(state.diagnostics.stage, 1);
  assert.equal(state.save.starter, true);
  assert.equal(state.diagnostics.team.filter(mon => mon.id === 'charmander').length, 1);
  assert.equal(state.diagnostics.team.length, 2);
  assert.deepEqual(errors, []);
  console.log('PASS stale starter flag repaired and Charmander received exactly once');
  await browser.close();
})().catch(error => {
  console.error(error);
  process.exit(1);
});
