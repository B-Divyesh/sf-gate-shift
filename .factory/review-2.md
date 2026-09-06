# Review 2 — Rotate rings to guide tokens through gates

Date: 2026-09-06  
Live URL: <https://gate-shift.sociobot.in>  
Implementation candidate: `472f8cca5b863a62186b851414a6a4d9b2d8a74e`  
Documentation head reviewed: `6980674cfb703be41ea888f080e263800fa531f0`  
Verdict: **PASS**  
Finding count: **0**  
Untested public claim count: **0**

## Verdict

**PASS.** Gate Shift has zero findings at every severity and zero untested
public claims. No product code was modified during this review.

The candidate is `472f8cc`. The later documentation head changes reports and
evidence only; `src/`, `public/`, tests, package files, and the entry document
are identical. A fresh clean GitHub checkout at `6980674` was used for the
local checks after `npm ci`. The candidate build exactly matches the live
assets:

- `index-DAFWFK5I.js` SHA-256:
  `46826fb6e81eb0607452f5c05cff9b62802c1fe88196e5fa6b75c782ba63b029`
- `style-BoTSxxXH.css` SHA-256:
  `e4e86943a6e52c66f3110e5046131b0c910c0b05a03325d322103b436f132c4c`

## Job, audience, and first action

- Job: rotate rings to guide tokens through gates.
- Audience: logic-puzzle players who want a short finished board, not an
  endless loop.
- First action: **Try it with sample data**. It opens a guided practice board
  in one click.

A fresh 1280×720 desktop browser showed the job title, audience, action,
action explanation, all three facts, Board 1, and its six playable rings
without scrolling. Their measured bottoms were 316, 391, 462, 448, 562, 200,
and 458 CSS pixels respectively. A fresh 393×727 Pixel 5 view showed the
facts through 440 pixels and the playable board beginning at 454 pixels.
The game is therefore on the first screen, not behind a menu wall.

Visual inspection: [desktop first screen](review-2-evidence/live-desktop-first-screen.png).

## Demo and playable runs

On fresh desktop and phone clients, the first-screen action opened `/demo` and
immediately displayed the populated six-token, fixed-gate, finite-budget
board. The persistent label read **Demo — sample data, nothing is saved**.
On desktop, a short-route turn changed the budget from 10 to 9; **Reset demo**
restored 10. The changed state existed only in `demo:gate-shift:run`; the
regular-run key remained absent. The browser test separately confirmed that a
regular-data sentinel is unchanged and that leaving demo removes the banner.

Fresh desktop and Pixel 5 demo clients selected Board 3 and repeatedly used
the displayed safe move, visible route preview, and apply controls. Both
reached the actual completion screen, **All six tokens reached their gates**,
with **You used 8 of 12 moves** and replay actions. A separate fresh desktop
Board 1 run used all 10 moves, reached **The move budget is used**, and
**Undo last move** returned it to active play with one move left.

Evidence: [desktop win](review-2-evidence/live-desktop-win.png),
[desktop loss](review-2-evidence/live-desktop-loss.png), and
[phone win](review-2-evidence/live-phone-win.png).

## Claims and clean checks

All 20 declared `test` commands in `.factory/claims.json` were run separately
and unchanged after clean `npm ci`. Every command passed. Each ID has one
exact tagged test, and a live-page/README copy review found no unlisted public
claim.

| Claim IDs | Result |
| --- | --- |
| `demo-isolated`, `route-preview`, `route-effects`, `solvable-authored-boards`, `daily-seed` | Pass |
| `reaches-end-screen`, `restart-resets`, `undo-no-penalty`, `settings-persist`, `progress-stays` | Pass |
| `local-only-game-data`, `no-accounts-analytics-ads`, `three-free-boards`, `one-time-offer`, `controls-work` | Pass |
| `safe-move-hint`, `symbol-cues`, `hidden-tab-pauses`, `finite-one-player`, `60-fps-phone` | Pass |

| Check | Result |
| --- | --- |
| `npm ci` | Pass; 164 packages installed; audit reported zero vulnerabilities |
| `npm test` | Pass; 6/6 deterministic engine tests |
| `npm run test:browser` | Pass; 42 passed; 2 intentional cross-profile skips |
| `npm run build` | Pass; produced `dist/` |
| Built assets | Pass; JavaScript 8,867 gzip bytes; CSS 3,959 gzip bytes |
| `npm audit --audit-level=high` | Pass; zero vulnerabilities |
| `npm run verify:url -- https://gate-shift.sociobot.in` | Pass; title, language, main, h1, alt, and zero console errors |
| `npm run test:lighthouse` | Pass; 95 performance, 100 accessibility, 100 best practices, 100 SEO |
| Fresh live Lighthouse | Pass; 100 performance, 100 accessibility, 100 best practices, 100 SEO |

The full browser suite covers normal play, invalid saved-state recovery,
boundary loss, undo/restart recovery, pointer/touch/swipe/keyboard controls,
focus retention, settings persistence, hidden-tab pause/resume, phone touch
targets, 200% text flow, reduced motion, history, and route titles.

## Accessibility, privacy, routes, and performance

Fresh live axe scans of `/`, `/demo`, `/privacy`, `/terms`, and `/not-a-board`
had zero violations, including zero serious or critical violations. Each had
one main landmark and one h1 with an appropriate route title. The reduced-
motion phone context produced a `0.00001s` ring transition duration.

Normal live demo play made requests only to `https://gate-shift.sociobot.in`,
set no cookies, and generated no console or page errors. The Privacy page and
claims correctly state that game data stays in browser storage; there are no
accounts, analytics, advertising, tracking cookies, third-party scripts, or
checkout claims. The public offer is honest: 20 authored boards cost **$8
once**, with no subscription, ads, or move sales; the 17 paid boards remain
locked and purchase is explicitly unavailable while registration is pending.

All same-origin navigation links on the live product routes returned HTTP 200.
A deliberately missing PNG returned a designed Gate Shift page with HTTP 404,
title **Page not found — Gate Shift**, and a **Play Gate Shift** recovery link;
this expected 404 is not a defect. Live headers include CSP,
Strict-Transport-Security, Referrer-Policy, Permissions-Policy, and `nosniff`.

The live Pixel 5 profile, throttled 4×, measured 60.29 fps over two seconds,
above the published 55 fps acceptance floor. The product advertises no
multiplayer, backend, tenant, room, database, health, rate-limit, offline, or
update service. It is explicitly a static local-first one-player game, so
backend isolation/restart/429 checks and independent multiplayer-client checks
do not apply.

## Earlier findings

| Finding | Current disposition |
| --- | --- |
| V1-01 designed deployment 404 and headers | Fixed: live security headers are present and a missing asset receives the designed HTTP 404 with recovery link. |
| V1-02 touch targets | Fixed: phone browser check passed; visible links and buttons meet 44 CSS pixels. |
| V1-03 keyboard focus | Fixed: aggregate browser check passed through preview/apply and Settings focus return. |
| V1-04 route preview | Fixed: both routes preview visible state without using a move. |
| V1-05 authored-board proof | Fixed: solver claim passed for 20 distinct states within budget with the recorded difficulty curve. |
| V1-06 untested public claims | Fixed: 20 declared commands and exact tagged checks passed separately; no unlisted claim remains. |
| V1-07 phone first-screen facts | Fixed: facts end at 440 in the 727-pixel phone viewport; playable board starts at 454. |
| V1-08 public offer metadata | Fixed: the public $8 one-time offer is complete and honestly pending; no private billing data was inspected or recorded. |
| V1-09 dependency audit | Fixed: fresh `npm audit --audit-level=high` found zero vulnerabilities. |
| R1-01 desktop first-screen content below fold | Fixed: all required copy, action, facts, and visible rings are inside the fresh 1280×720 viewport. |

## Remaining external dependency

Billing registration is an operator dependency, not a product finding. The
game does not claim checkout, activation, or entitlement success, and the free
sample remains usable.
