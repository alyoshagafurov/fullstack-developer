// End-to-end checks of the owner's admin through both doors — ALY OS (Bearer
// session) and the Telegram panel (signed initData) — against a running site
// with a TEST database. Never point this at production: it writes records.
//
//   ALY_TEST_BASE=http://127.0.0.1:3000 ALY_TEST_EMAIL=… ALY_TEST_PASSWORD=… \
//   ALY_TEST_BOT_TOKEN=… ALY_TEST_ADMIN_ID=… node --test tests/admin-api.test.mjs
//
// Expects the seed in the test database: leads l1 (NEW) and l3, review r1
// (unpublished). Skips itself when the variables are not set.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac, randomUUID } from 'node:crypto';

const base = process.env.ALY_TEST_BASE;
const skip = !base || !process.env.ALY_TEST_EMAIL ? 'ALY_TEST_* not set' : false;

let token = '';
async function mobile(command, payload = {}, auth = token) {
  const res = await fetch(`${base}/api/mobile/v1/admin`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(auth ? { authorization: `Bearer ${auth}` } : {}) },
    body: JSON.stringify({ command, payload }),
  });
  return { status: res.status, body: await res.json() };
}

function initData() {
  const user = JSON.stringify({ id: Number(process.env.ALY_TEST_ADMIN_ID), first_name: 'Owner' });
  const params = new URLSearchParams({ auth_date: String(Math.floor(Date.now() / 1000)), user });
  const check = [...params.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, v]) => `${k}=${v}`).join('\n');
  const secret = createHmac('sha256', 'WebAppData').update(process.env.ALY_TEST_BOT_TOKEN).digest();
  params.set('hash', createHmac('sha256', secret).update(check).digest('hex'));
  return params.toString();
}
async function mini(command, payload = {}) {
  const res = await fetch(`${base}/api/mini/admin`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ initData: initData(), command, payload }),
  });
  return { status: res.status, body: await res.json() };
}
const page = async (path) => (await fetch(`${base}${path}`, { cache: 'no-store' })).text();

test('admin through ALY OS and the Telegram panel', { skip }, async (t) => {
  const login = await fetch(`${base}/api/mobile/v1/session`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: process.env.ALY_TEST_EMAIL, password: process.env.ALY_TEST_PASSWORD, device: 'admin-api test' }),
  });
  assert.equal(login.status, 200);
  token = (await login.json()).token;

  await t.test('refuses without a session and with a forged one', async () => {
    assert.equal((await mobile('overview', {}, '')).status, 401);
    assert.equal((await mobile('overview', {}, 'f'.repeat(64))).status, 401);
    const forged = await fetch(`${base}/api/mini/admin`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ initData: 'user=%7B%22id%22%3A1%7D&auth_date=1&hash=' + '0'.repeat(64), command: 'overview' }),
    });
    assert.equal(forged.status, 401);
    assert.equal((await mobile('no-such-command')).status, 400);
  });

  await t.test('a lead moved and noted in ALY OS is seen the same in the Mini App', async () => {
    // Start from a new lead whatever an earlier run left behind.
    assert.equal((await mobile('lead:status', { id: 'l1', to: 'new' })).status, 200);
    const list = await mobile('leads', { status: 'new' });
    assert.ok(list.body.data.rows.some((r) => r.id === 'l1'));
    assert.equal((await mobile('lead:status', { id: 'l1', to: 'work' })).status, 200);
    const note = `заметка ${randomUUID().slice(0, 8)}`;
    assert.equal((await mobile('lead:note', { id: 'l1', body: note })).status, 200);
    const seen = await mini('lead', { id: 'l1' });
    assert.equal(seen.status, 200);
    assert.equal(seen.body.data.status, 'IN_PROGRESS');
    assert.ok(seen.body.data.notes.some((n) => n.body === note));
    assert.equal(seen.body.data.trackingToken, undefined);
    // …and the other way round.
    assert.equal((await mini('lead:status', { id: 'l1', to: 'done' })).status, 200);
    assert.equal((await mobile('lead', { id: 'l1' })).body.data.status, 'COMPLETED');
  });

  await t.test('deal and payments: money as strings, a retried payment saved once', async () => {
    assert.equal((await mobile('lead:deal', { id: 'l3', amount: '12000,50', currency: 'TJS' })).status, 200);
    const operationID = randomUUID();
    const pay = { leadId: 'l3', operationID, amount: '2500', currency: 'TJS', received: true, note: 'тест' };
    assert.equal((await mobile('payment:add', pay)).status, 200);
    assert.equal((await mobile('payment:add', pay)).status, 200);
    const lead = (await mobile('lead', { id: 'l3' })).body.data;
    assert.equal(lead.dealAmount, '12000.50');
    assert.equal(lead.payments.filter((p) => p.id === operationID).length, 1);
    assert.equal(lead.payments.find((p) => p.id === operationID).amount, '2500.00');
    const reused = await mobile('payment:add', { ...pay, amount: '9999' });
    assert.equal(reused.status, 422);
    assert.equal((await mobile('payment:received', { id: operationID, received: false })).status, 200);
    assert.equal((await mobile('payment:received', { id: operationID, received: false })).status, 200);
    assert.equal((await mobile('lead', { id: 'l3' })).body.data.payments.find((p) => p.id === operationID).paidAt, null);
  });

  await t.test('income, expense and task are saved once on retry and seen by the Mini App', async () => {
    const day = new Date().toISOString().slice(0, 10);
    const income = { operationID: randomUUID(), amount: '1500', currency: 'TJS', day, note: 'тест доход' };
    await mobile('income:add', income);
    await mobile('income:add', income);
    const incomeRows = (await mini('money')).body.data.rows.filter((r) => r.id === income.operationID);
    assert.equal(incomeRows.length, 1);

    const expense = { operationID: randomUUID(), title: 'Хостинг', amount: '120', currency: 'USD', day };
    assert.equal((await mobile('expense:add', expense)).status, 200);
    assert.equal((await mobile('expense:add', expense)).status, 200);
    const expenses = (await mobile('expenses')).body.data.filter((r) => r.id === expense.operationID);
    assert.equal(expenses.length, 1);
    assert.equal(expenses[0].amount, '120.00');

    const task = { operationID: randomUUID(), title: 'Созвон с клиентом', dayFrom: day, startHour: 15, endHour: 16, leadMinutes: 30 };
    assert.equal((await mobile('task:add', task)).status, 200);
    assert.equal((await mobile('task:add', task)).status, 200);
    assert.equal((await mini('tasks')).body.data.rows.filter((r) => r.id === task.operationID).length, 1);
  });

  await t.test('a price, a case and a review reach the public site', async () => {
    const price = `от ${1000 + Math.floor(Math.random() * 8000)} сомони`;
    const rows = (await mobile('prices')).body.data.map((r) => ({ slug: r.slug, price: r.price, duration: r.duration, note: r.note, hidden: r.hidden }));
    rows.find((r) => r.slug === 'landing').price = price;
    assert.equal((await mobile('prices:save', { rows })).status, 200);
    assert.match(await page('/ru/prices'), new RegExp(price.split(' ')[1]));

    const title = `Тест-кейс ${randomUUID().slice(0, 6)}`;
    const operationID = randomUUID();
    const draft = { operationID, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'test-case', title, result: 'Результат.', published: false, en: { title: 'Test case EN' } };
    draft.slug = `test-${operationID.slice(0, 8)}`;
    assert.equal((await mobile('case:save', draft)).status, 200);
    assert.equal((await mobile('case:save', draft)).status, 200);
    const cases = (await mobile('cases')).body.data.filter((c) => c.id === operationID);
    assert.equal(cases.length, 1);
    assert.equal(cases[0].hasEnglish, true);
    assert.doesNotMatch(await page('/ru/work'), new RegExp(title));
    assert.equal((await mobile('case:published', { id: operationID, published: true })).status, 200);
    assert.equal((await mobile('case:published', { id: operationID, published: true })).status, 200);
    assert.match(await page('/ru/work'), new RegExp(title));
    assert.match(await page(`/en/work/${draft.slug}`), /Test case EN/);

    assert.equal((await mobile('review:published', { id: 'r1', published: true })).status, 200);
    assert.equal((await mobile('review:published', { id: 'r1', published: true })).status, 200);
    const reviews = (await mini('reviews')).body.data;
    assert.equal(reviews.find((r) => r.id === 'r1').published, true);
    assert.match(await page('/ru/reviews'), /Тестовый отзыв/);

    // Cleanup so the test can run again.
    await mobile('case:delete', { id: operationID });
    await mobile('review:published', { id: 'r1', published: false });
  });

  await t.test('account and bot: refused without proof or confirmation', async () => {
    assert.equal((await mobile('account:password', { current: 'wrong-password', next: 'a-new-password-123' })).status, 422);
    assert.equal((await mobile('bot:webhook', {})).status, 400);
    const status = (await mobile('bot:status')).body.data;
    assert.equal(typeof status.token, 'boolean');
    assert.equal(JSON.stringify(status).includes(process.env.ALY_TEST_BOT_TOKEN), false);
  });
});
