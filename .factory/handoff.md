# Gate Shift verification 4 handoff

- Date: 2026-09-06
- Work order: `gate-shift-verify-4`
- Implementation candidate: `515899a533e8519d1b7016eced5b764dcb4d6370`
- Documentation head reviewed: `9fc7223a4ae7de9bd934012e555db09c8d003dd9`
- Live URL: <https://gate-shift.sociobot.in>
- Verdict: **PASS**
- Findings: **0**
- Untested public claims: **0**

## What was done

Gate Shift received a fresh independent verification. No product code was
changed. The live game was opened in new desktop and Pixel 5 clients, the
one-click sample was reset and discarded, and clean sample re-entry preserved
regular storage. Fresh runs reached real win and loss screens and exercised
undo and restart recovery.

Every declared claim command ran separately after a clean install. Unit,
browser, build, audit, URL, accessibility, privacy, route, metadata, link,
Lighthouse, reduced-motion, 200% text, touch-target, keyboard, focus, history,
daily-board, and live asset-identity checks passed.

The full report is [.factory/verification-4.md](verification-4.md). Fresh
screenshots are in `.factory/verification-4-evidence/`.

## Key verification results

- `npm test`: 6/6 passed.
- All 20 claim commands: passed separately.
- `npm run test:browser`: 42 passed, 2 expected cross-profile skips.
- `npm run build`: passed; 8,926 gzip bytes JS and 3,959 gzip bytes CSS.
- `npm audit --audit-level=high`: zero vulnerabilities.
- Live Lighthouse: 100 performance, 100 accessibility, 100 best practices,
  and 100 SEO; 846 ms LCP, zero CLS, 67 ms total blocking time.
- Live Pixel 5 at 4× CPU throttle: 60.23 FPS.
- Live requests during play: same-origin GETs only; zero cookies and zero
  console or page errors.
- Live and candidate JavaScript and CSS SHA-256 values match exactly.

## Evidence

- `sf-gate-shift-verification-4-live-desktop-first-screen.png`
- `sf-gate-shift-verification-4-live-desktop-demo.png`
- `sf-gate-shift-verification-4-live-desktop-demo-preview.png`
- `sf-gate-shift-verification-4-live-desktop-win.png`
- `sf-gate-shift-verification-4-live-desktop-loss.png`
- `sf-gate-shift-verification-4-live-phone-first-screen.png`
- `sf-gate-shift-verification-4-live-phone-win.png`
- `sf-gate-shift-verification-4-live-http-404.png`

## Remaining external dependency

Billing registration remains pending. The complete public offer is still
accurately disclosed as 20 authored boards for **$8 once**, with three free
boards, 17 paid boards, and no subscription. No checkout, activation, or
entitlement-success claim is made.
