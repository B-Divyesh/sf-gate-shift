#!/usr/bin/env bash
set -euo pipefail

lighthouse_port="${LIGHTHOUSE_PORT:-4175}"
lighthouse_url="http://127.0.0.1:${lighthouse_port}"
lighthouse_log="/tmp/gate-shift-lighthouse.log"
lighthouse_output="/tmp/gate-shift-lighthouse.json"
lighthouse_browser="$(find /opt/pw-browsers -type f -path '*chromium-[0-9]*/*' -name chrome | head -n 1)"

if [[ -z "$lighthouse_browser" ]]; then
  echo "A local Chromium executable is required for Lighthouse." >&2
  exit 1
fi

npm run build >/dev/null
setsid npm run preview -- --host 127.0.0.1 --port "$lighthouse_port" >"$lighthouse_log" 2>&1 &
lighthouse_pid=$!
trap 'kill -- -"$lighthouse_pid" 2>/dev/null || true' EXIT

for _ in $(seq 1 40); do
  if curl --fail --silent "$lighthouse_url" >/dev/null; then break; fi
  sleep 0.25
done

CHROME_PATH="$lighthouse_browser" node_modules/.bin/lighthouse "$lighthouse_url" \
  --chrome-flags="--headless=new --no-sandbox --disable-dev-shm-usage" \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=json --output-path="$lighthouse_output" --quiet

node --input-type=module - "$lighthouse_output" <<'NODE'
import { readFile } from 'node:fs/promises';

const report = JSON.parse(await readFile(process.argv[2], 'utf8'));
const categories = report.categories;
const result = {
  performance: Math.round(categories.performance.score * 100),
  accessibility: Math.round(categories.accessibility.score * 100),
  bestPractices: Math.round(categories['best-practices'].score * 100),
  seo: Math.round(categories.seo.score * 100),
};
console.log(JSON.stringify(result));
if (result.performance < 90 || result.accessibility < 95) process.exit(1);
NODE
