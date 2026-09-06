#!/usr/bin/env bash
set -euo pipefail

check_port="${VERIFY_PORT:-4174}"
check_url="${1:-http://127.0.0.1:${check_port}}"
check_log="/tmp/gate-shift-verify.log"

if [[ "$check_url" == "http://127.0.0.1:${check_port}" ]]; then
  npm run dev -- --host 127.0.0.1 --port "$check_port" >"$check_log" 2>&1 &
  check_pid=$!
  trap 'kill "$check_pid" 2>/dev/null || true' EXIT
  for _ in $(seq 1 40); do
    if curl --fail --silent "$check_url" >/dev/null; then break; fi
    sleep 0.25
  done
fi

node --input-type=module - "$check_url" <<'NODE'
import { chromium } from 'playwright';

const url = process.argv[2];
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text());
});
await page.goto(url, { waitUntil: 'networkidle' });
const title = await page.title();
const lang = await page.locator('html').getAttribute('lang');
const mainCount = await page.locator('main').count();
const h1Count = await page.locator('h1').count();
const missingAlt = await page.locator('img:not([alt])').count();
await browser.close();

if (!title || lang !== 'en' || mainCount !== 1 || h1Count !== 1 || missingAlt !== 0 || errors.length) {
  console.error(JSON.stringify({ title, lang, mainCount, h1Count, missingAlt, consoleErrors: errors }));
  process.exit(1);
}
console.log(JSON.stringify({ title, lang, mainCount, h1Count, missingAlt, consoleErrors: 0 }));
NODE
