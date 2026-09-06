# Review 4 — Rotate rings to guide tokens through gates

- Date: 2026-09-06
- Live URL: <https://gate-shift.sociobot.in>
- Implementation candidate: `515899a533e8519d1b7016eced5b764dcb4d6370`
- Documentation head reviewed: `9a2904d0f1ee827d8d6ec512c9e42816ab6572f6`
- Verdict: **PASS**
- Finding count: **0**
- Untested public claim count: **0**

## Verdict

**PASS.** Gate Shift has zero findings at every severity and zero untested public claims. No product code was modified during this review.

The supplied in-repository verification report was read in full. The separate `factory-evidence/gate-shift-verify-4/qa-report.md` path named in the work order was not present in this worker filesystem, so it was not treated as new evidence. This review independently repeated the required clean-checkout and live-product checks below.

The clean candidate build and the live deployment have the same assets:

- `index-siD4A8Dl.js` SHA-256: `f8ecd97179a0acc953355a42d388cd4383c27c50f3781d284d04627fe7558adc`
- `style-BoTSxxXH.css` SHA-256: `e4e86943a6e52c66f3110e5046131b0c910c0b05a03325d322103b436f132c4c`

## Job, audience, and first action

- Job: rotate rings to guide tokens through gates.
- Audience: logic-puzzle players who want a short finished board instead of an endless loop.
- First action: **Try it with sample data**. It opens a guided practice board in one click.

Fresh browser clients showed the title, audience, action, three facts, and the game itself before scrolling. At 1280×720, their bottom or start positions were 316, 391, 462, 562, 200, and 458 CSS pixels for the title, audience, action, facts, board heading, and first ring. At Pixel 5 393×727, the facts ended at 440 pixels and the playable board started at 454.

Evidence: [desktop first screen](review-4-evidence/live-desktop-first-screen.png) and [phone first screen](review-4-evidence/live-phone-first-screen.png).

## Demo and game runs

The first-screen action entered `/demo` and immediately displayed a populated six-token board, fixed gates, controls, and a 10-move budget. Its persistent banner said **Demo — sample data, nothing is saved**. A short route changed the budget from 10 to 9; **Reset demo** restored 10. After **Start for real**, the complete `demo:gate-shift:*` namespace was absent, a regular-data sentinel was unchanged, and no regular run was created.

Fresh desktop and phone runs used visible safe-move prompts and real controls to reach **All six tokens reached their gates**. A separate fresh desktop run used all 10 moves and reached **The move budget is used**. This verifies a real finite win, loss, and recovery path, not a mock result.

Evidence: [desktop win](review-4-evidence/live-desktop-win.png), [desktop loss](review-4-evidence/live-desktop-loss.png), and [phone win](review-4-evidence/live-phone-win.png).

## Claims and clean checkout

A fresh GitHub clone at `9a2904d` received `npm ci`. Every one of the 20 commands in `.factory/claims.json` then ran separately and unchanged. All passed. The manifest has 20 claims, each with exactly one matching `@claim:<id>` test tag; there are no untested declared claims.

| Claim IDs | Result |
| --- | --- |
| `demo-isolated`, `route-preview`, `route-effects`, `solvable-authored-boards`, `daily-seed` | Pass |
| `reaches-end-screen`, `restart-resets`, `undo-no-penalty`, `settings-persist`, `progress-stays` | Pass |
| `local-only-game-data`, `no-accounts-analytics-ads`, `three-free-boards`, `one-time-offer`, `controls-work` | Pass |
| `safe-move-hint`, `symbol-cues`, `hidden-tab-pauses`, `finite-one-player`, `60-fps-phone` | Pass |

| Check | Result |
| --- | --- |
| `npm ci` | Pass: 164 packages; zero vulnerabilities |
| `npm test` | Pass: 6 deterministic engine tests |
| `npm run test:browser` | Pass: 42 passed; 2 expected cross-profile skips |
| `npm run build` | Pass: `dist/` produced; JS 8,926 gzip bytes; CSS 3,959 gzip bytes |
| `npm audit --audit-level=high` | Pass: zero vulnerabilities |
| `npm run verify:url -- https://gate-shift.sociobot.in` | Pass: title, language, main, h1, alt text, and console check |
| `npm run test:lighthouse` | Pass: 99 performance; 100 accessibility; 100 best practices; 100 SEO |

## Accessibility, privacy, routes, and performance

- Live axe checks found zero serious or critical issues on `/`, `/demo`, `/privacy`, `/terms`, and `/not-a-board`. Each route had one h1, one main landmark, and its correct title.
- Fresh normal play made requests only to `https://gate-shift.sociobot.in`, created no cookies, and produced no console errors. The public offer is clear: 20 authored boards for **$8 once**, no subscription, ads, or move sales, with purchase unavailable while registration is pending.
- In a live reduced-motion context, ring transition duration was `0.00001s`. The full browser suite also passed keyboard, focus, invalid-storage recovery, 200% text, and phone touch-target checks.
- A missing scoped PNG returned the designed recovery page with HTTP 404. This deliberate 404 is expected and is not a defect. Live headers included CSP, HSTS, `nosniff`, Referrer-Policy, and Permissions-Policy. `robots.txt` and `sitemap.xml` list the public routes.
- A live Pixel 5 profile under 4× CPU throttling measured **60.15 FPS** over two seconds, above the product's 55-FPS test floor.

Gate Shift is an explicitly one-player, local-first static game. It advertises no multiplayer, backend, room, tenant, database, health, rate-limit, offline, or update service. The backend isolation, restart, 429, and independent-client multiplayer checks therefore do not apply. An AI feature would not improve the authored logic-puzzle job, so the missed-leverage check found no gap.

## Earlier finding disposition

| Finding | Current disposition |
| --- | --- |
| V1-01 deployment config and designed 404 | Fixed: live headers and designed HTTP 404 pass |
| V1-02 small touch targets | Fixed: phone browser tests pass |
| V1-03 keyboard focus | Fixed: controls, settings, skip link, and history tests pass |
| V1-04 route previews | Fixed: both previews remain move-free until applied |
| V1-05 duplicate or weak paid boards | Fixed: solver proves 20 distinct budgeted states |
| V1-06 incomplete claim coverage | Fixed: 20 exact commands and unique tags pass |
| V1-07 phone first-screen facts | Fixed: facts end at 440 in the 727-pixel viewport |
| V1-08 public billing metadata | Fixed: only public status metadata is disclosed |
| V1-09 dependency advisories | Fixed: clean install and audit report zero vulnerabilities |
| R1-01 desktop first-screen content | Fixed: required copy, action, facts, and live rings fit at 1280×720 |
| R3-01 demo state retained on exit | Fixed: exit clears the entire demo namespace and clean re-entry passes |
| R3-02 README session length | Fixed: README states the intended 4–10-minute board length |

## Remaining external dependency

Billing registration remains pending. This is accurately disclosed, and no checkout, activation, or entitlement-success claim is made. The free sample continues to work.
