# Gate Shift review 1

Date: 2026-09-06  
Live URL: <https://gate-shift.sociobot.in>  
Implementation candidate: `90c212baeeff94fd6f413d5b5c889add5ace509c`  
Documentation head reviewed: `23a1cc78281120492a5ac848de241b77894af30f`  
Verdict: **FAIL**  
Finding count: **1**  
Untested public claim count: **0**

## Verdict

Gate Shift does not pass this strict review. The desktop first screen fails the
required plain-words shape: it does not show the audience, first action, or
three facts before scrolling at the standard 1280 by 720 desktop viewport.

All 20 declared claim commands passed separately from a fresh checkout, and
the game, demo, accessibility, privacy, legal, route, build, and performance
checks otherwise passed. No product code was changed during review.

## First screen before scrolling

- Job: rotate rings to guide tokens through gates.
- Audience: logic-puzzle players who want a short finished board, not an
  endless loop.
- First action: **Try it with sample data**, which opens a guided practice
  board in one click.

The live phone view meets this shape: the headline, audience, action,
explanation, all three facts, and the beginning of the playable board are in
the 393 by 727 viewport. The fresh desktop view does not. Its headline is 501
CSS pixels tall (top 165, bottom 665) in a 720-pixel viewport. The audience
starts at 681 and ends at 741, the action starts at 763, and the facts start
at 867. Thus the action and facts are unavailable without scrolling, despite
the game panel beginning at 137.

Evidence: [desktop first screen](review-1-evidence/desktop-first-screen.png)
and [phone first screen](review-1-evidence/phone-first-screen.png).

## Findings

### R1-01 — Major — Desktop first screen hides the required first action and facts

At a fresh 1280 by 720 desktop browser viewport, the oversized six-line h1
pushes the audience sentence below the fold and puts **Try it with sample
data**, its explanation, and all three required facts below the fold. The
first screen must explain the job, audience, and what to do first before a
visitor scrolls. This is an accessibility and conversion-path issue, not a
deliberate content omission: the content is present but inaccessible in the
first screen's visual hierarchy.

Repair by reducing the desktop headline/layout footprint or changing the
desktop hero layout so the audience, primary sample action, and facts fit in a
720-pixel viewport while retaining visible game content. Add a viewport-bound
desktop assertion; the existing test only checks that these elements exist,
so it did not catch their off-screen placement.

## Demo sandbox and playable runs

The fresh desktop and phone clients each used the first-screen sample action.
It navigated to `/demo` and showed the persistent label **Demo — sample data,
nothing is saved**. The sample began with six marked tokens, fixed gates,
finite moves, preview controls, and reset. A route preview stated that no
move was used, and reset returned the starting 10-move budget.

Fresh desktop and phone clients selected Board 3 and followed visible safe
move prompts through route previews and applications. Both reached the real
completion panel: **All six tokens reached their gates**, with the summary
**You used 8 of 12 moves** and replay actions. A fresh desktop Board 1 run
spent all 10 moves, reached **The move budget is used**, then recovered through
**Undo last move** with one move remaining.

Evidence: [desktop win](review-1-evidence/desktop-win.png), [phone
win](review-1-evidence/phone-win.png), and [desktop loss recovery](review-1-evidence/desktop-loss-recovery.png).

## Declared claims

From a fresh GitHub checkout at `23a1cc7`, after `npm ci`, every command in
`.factory/claims.json` was executed separately and unchanged. All 20 passed;
the phone-only frame-rate command has its expected desktop project skip and a
passing phone execution. Each claim still has one exact `@claim:<id>` test.

| Claim IDs | Result |
| --- | --- |
| `demo-isolated`, `route-preview`, `route-effects`, `solvable-authored-boards`, `daily-seed` | Pass |
| `reaches-end-screen`, `restart-resets`, `undo-no-penalty`, `settings-persist`, `progress-stays` | Pass |
| `local-only-game-data`, `no-accounts-analytics-ads`, `three-free-boards`, `one-time-offer`, `controls-work` | Pass |
| `safe-move-hint`, `symbol-cues`, `hidden-tab-pauses`, `finite-one-player`, `60-fps-phone` | Pass |

Declared claim failures: **0**. Untested or unlisted public claims: **0**.

## Quality and live checks

| Check | Result |
| --- | --- |
| `npm test` | Pass: 6/6 deterministic engine tests |
| `npm run test:browser` | Pass in the fresh checkout: 42 passed, 2 intended project skips |
| `npm run build` | Pass; produced `dist/`, including deployment config and designed 404 |
| Built size | Pass: JavaScript 8,867 gzip bytes; CSS 3,954 gzip bytes |
| `npm audit --audit-level=high` | Pass: zero vulnerabilities |
| `npm run verify:url -- https://gate-shift.sociobot.in` | Pass: title, `lang`, main, h1, alt, and console |
| Live axe scan | Pass: no violations, including no serious/critical violations, on `/`, `/demo`, `/privacy`, `/terms`, and an HTTP-404 asset path |
| `npm run test:lighthouse` | Pass: 98 performance, 100 accessibility, 100 best practices, 100 SEO |
| Live request and privacy smoke check | Pass: no console/page errors or cookies; only the product origin was requested during the inspected flow |
| Routes | Pass: `/`, `/demo`, `/privacy`, and `/terms` return 200 with route titles; a missing scoped PNG returns the designed Gate Shift page with HTTP 404 |

The live asset hashes match the clean build, establishing that the deployed
runtime corresponds to the implementation candidate:

- `index-DAFWFK5I.js`: `46826fb6e81eb0607452f5c05cff9b62802c1fe88196e5fa6b75c782ba63b029`
- `style-BYbrIib-.css`: `95c6b41fcdf6b3cd6422413a030aa69bf93e4696bd9328446988b650876aaa09`

There is no backend, account, room, multiplayer, API, SQLite, or health/rate
limit surface. Backend tenant, restart, health, and 429 checks do not apply.
The game explicitly remains one-player, consistent with the brief.

## Earlier finding disposition

All nine items in `verification-1.md` remain fixed in the current candidate:

| Earlier finding | Disposition |
| --- | --- |
| V1-01 deployment config and designed static 404 | Fixed: live CSP and Permissions-Policy are present; missing PNG returns the designed HTTP 404 |
| V1-02 touch targets | Fixed: phone target test passes across demo and legal pages |
| V1-03 keyboard focus | Fixed: browser focus test passes through previews and Settings |
| V1-04 route preview | Fixed: both route previews work without spending a move |
| V1-05 paid-board distinctness and curve | Fixed: solver claim proves 20 unique starts and the 6–24 move curve |
| V1-06 untested public claims | Fixed: 20 declared, uniquely tagged claim checks all pass |
| V1-07 phone first-screen facts | Fixed: phone facts finish at 437 in the 727-pixel viewport |
| V1-08 public offer metadata | Fixed in the previously recorded status-only operator output; the public $8 one-time offer is accurate and contains no checkout claim |
| V1-09 vulnerable toolchain | Fixed: fresh `npm audit --audit-level=high` reports zero vulnerabilities |

R1-01 is a separate desktop regression/coverage gap. The same first-screen
contract now passes on phone but not on desktop.

## Remaining external dependency

Billing registration remains outside the repository. This is not a review
finding: the live page accurately offers **20 authored boards for $8 once**,
keeps the 17 paid boards locked, states that purchase is unavailable while
registration is pending, and does not claim checkout, activation, or
entitlement success.
