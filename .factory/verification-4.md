# Verification 4 — Rotate rings to guide tokens through gates

- Date: 2026-09-06
- Live URL: <https://gate-shift.sociobot.in>
- Implementation candidate: `515899a533e8519d1b7016eced5b764dcb4d6370`
- Documentation head reviewed: `9fc7223a4ae7de9bd934012e555db09c8d003dd9`
- Verdict: **PASS**
- Finding count: **0**
- Untested public claim count: **0**

## Verdict

**PASS.** Gate Shift has zero findings at every severity and zero untested
public claims. No product code was modified during this verification.

The later documentation commit changes only the previous handoff and repair
evidence. The candidate build and live deployment match byte for byte:

- `index-siD4A8Dl.js` SHA-256:
  `f8ecd97179a0acc953355a42d388cd4383c27c50f3781d284d04627fe7558adc`
- `style-BoTSxxXH.css` SHA-256:
  `e4e86943a6e52c66f3110e5046131b0c910c0b05a03325d322103b436f132c4c`

## Job, audience, and first action

- Job: rotate rings to guide tokens through gates.
- Audience: logic-puzzle players who want a short finished board instead of
  an endless loop.
- First action: **Try it with sample data**. It opens a guided practice board
  in one click.

At 1280×720, the job title, audience, action, explanation, three facts, board
heading, and first ring ended at 316, 391, 462, 448, 562, 200, and 458 CSS
pixels. At 393×727, the facts ended at 440 and the playable board began at
454. The game itself is on the first screen in both fresh clients.

Evidence: [desktop first screen](verification-4-evidence/sf-gate-shift-verification-4-live-desktop-first-screen.png)
and [phone first screen](verification-4-evidence/sf-gate-shift-verification-4-live-phone-first-screen.png).

## Sample and complete runs

The first-screen action entered `/demo` and immediately showed six marked
tokens, fixed gates, route controls, and a 10-move board. The persistent banner
said **Demo — sample data, nothing is saved** and provided **Reset demo** and
**Start for real**.

A preview used no move. Applying it reduced the budget to nine. Reset restored
the exact starting board and 10 moves. After a second changed run, **Start for
real** removed every `demo:gate-shift:*` key, preserved a regular-data sentinel,
and did not create a regular run. Re-entering the sample started from the exact
clean 10-move state.

Fresh desktop and Pixel 5 runs followed visible safe moves to the real end
screen in 6 of 10 moves. A separate desktop run used all 10 moves, reached
**The move budget is used**, restored one move through undo, and returned to
10 through restart.

Evidence: [labelled sample](verification-4-evidence/sf-gate-shift-verification-4-live-desktop-demo.png),
[route preview](verification-4-evidence/sf-gate-shift-verification-4-live-desktop-demo-preview.png),
[desktop win](verification-4-evidence/sf-gate-shift-verification-4-live-desktop-win.png),
[desktop loss](verification-4-evidence/sf-gate-shift-verification-4-live-desktop-loss.png), and
[phone win](verification-4-evidence/sf-gate-shift-verification-4-live-phone-win.png).

## Declared claims

Every `test` command in `.factory/claims.json` ran separately and unchanged
after `npm ci`. All 20 passed. Each claim ID occurs in exactly one tagged test,
and there are no undeclared tags.

| Claim | Result | Observable check |
| --- | --- | --- |
| `demo-isolated` | Pass | Label, reset, namespace-wide exit cleanup, regular sentinel, and clean re-entry |
| `route-preview` | Pass | Both projected routes used no move; applied state matched its preview |
| `route-effects` | Pass | Short route reversed one linked gate; long route changed no gate |
| `solvable-authored-boards` | Pass | 20 distinct authored states solved within their budgets |
| `daily-seed` | Pass | Same UTC date produced the same solvable board |
| `reaches-end-screen` | Pass | Visible controls reached the completion panel on desktop and phone |
| `restart-resets` | Pass | Restart restored the original state and budget |
| `undo-no-penalty` | Pass | Undo restored state and one move without a charge |
| `settings-persist` | Pass | Calm motion survived reload |
| `progress-stays` | Pass | Active progress survived reload |
| `local-only-game-data` | Pass | Game requests were same-origin static GETs only |
| `no-accounts-analytics-ads` | Pass | No account, iframe, cookie, tracker, ad, or cross-origin request |
| `three-free-boards` | Pass | Boards 1–3 enabled; Boards 4–20 locked |
| `one-time-offer` | Pass | 20 boards for $8 once; no subscription or false checkout claim |
| `controls-work` | Pass | Mouse, touch, swipe, arrows, U, and R changed or restored state |
| `safe-move-hint` | Pass | Repeated safe moves completed a real board |
| `symbol-cues` | Pass | Six symbols stayed distinct without token color |
| `hidden-tab-pauses` | Pass | Hidden runtime stopped and resumed from the pause panel |
| `finite-one-player` | Pass | No room or ranking flow; finite loss and recovery occurred |
| `60-fps-phone` | Pass | Live Pixel 5 profile measured 60.23 FPS under 4× CPU throttling |

The live pages and README were cross-checked against the manifest. The
4–10-minute README statement is an intended board length required by the game
contract, not a measured completion-time promise. No public outcome claim is
missing, false, incomplete, or untested.

## Functional, accessibility, privacy, and route checks

- Mouse, touch, swipe, keyboard, preview, apply, undo, restart, pause, resume,
  settings persistence, invalid-storage recovery, and the daily board passed.
- Two fresh clients produced the same daily identifier and board state for
  `daily-GS-20260906`.
- The skip link moved focus to the page heading and bypassed the header.
  Settings focus entered and returned correctly. Back and forward navigation
  restored route titles and heading focus.
- Pixel 5 links and buttons on `/demo`, `/privacy`, and `/terms` were at least
  44×44 CSS pixels. Text at 200% had no horizontal overflow.
- Reduced motion set the calm state. Axe found zero serious or critical issues
  on `/`, `/demo`, `/privacy`, `/terms`, and `/not-a-board`.
- Normal play produced zero console or page errors, zero cookies, and only
  same-origin GET requests. The CSP, HSTS, `nosniff`, Referrer-Policy, and
  Permissions-Policy headers are present.
- Root, demo, privacy, terms, and recovery routes have useful titles, one h1,
  one main landmark, valid heading order, canonical metadata, and working
  same-origin links. `robots.txt` and `sitemap.xml` list the public routes.
- A missing scoped PNG returns the designed Gate Shift recovery page with HTTP
  404. This deliberate 404 is expected, not a defect. Evidence:
  [designed HTTP 404](verification-4-evidence/sf-gate-shift-verification-4-live-http-404.png).

There is no advertised multiplayer, backend, tenant, room, database, health,
rate-limit, offline, or update surface. Those checks do not apply. The explicit
one-player mode matches the brief. An AI feature would not improve the authored
logic-puzzle job, so the missed-leverage check found no gap.

## Performance and clean commands

| Check | Result |
| --- | --- |
| `npm ci` | Pass: 164 packages; zero vulnerabilities |
| `npm test` | Pass: 6 deterministic engine tests |
| Each of 20 claim commands | Pass separately |
| `npm run test:browser` | Pass: 42 tests; 2 expected cross-profile skips |
| `npm run build` | Pass; `dist/` produced; JS 8,926 gzip bytes; CSS 3,959 gzip bytes |
| `npm audit --audit-level=high` | Pass: zero vulnerabilities |
| Local and live `npm run verify:url` | Pass |
| Local Lighthouse | 99 performance; 100 accessibility; 100 best practices; 100 SEO |
| Live Lighthouse | 100 performance; 100 accessibility; 100 best practices; 100 SEO |

Live Lighthouse measured 846 ms LCP, zero CLS, and 67 ms total blocking time.

## Earlier finding disposition

| Finding | Current disposition |
| --- | --- |
| V1-01 deployment config and designed 404 | Fixed: live headers and designed HTTP 404 pass |
| V1-02 small touch targets | Fixed: all inspected phone targets are at least 44×44 CSS pixels |
| V1-03 keyboard focus | Fixed: controls, settings, skip link, and history focus pass |
| V1-04 missing route previews | Fixed: both previews remain move-free until applied |
| V1-05 duplicate or weak paid boards | Fixed: solver proves 20 distinct budgeted states |
| V1-06 incomplete claim coverage | Fixed: 20 exact commands and unique tags pass |
| V1-07 phone first-screen facts | Fixed: facts end at 440 in a 727-pixel viewport |
| V1-08 public billing metadata | Fixed: status-only public offer metadata is emitted without credentials |
| V1-09 dependency advisories | Fixed: clean install and audit report zero vulnerabilities |
| R1-01 desktop first-screen content | Fixed: every required item and live rings fit at 1280×720 |
| R3-01 demo state retained on exit | Fixed: zero demo keys remain and clean re-entry is proven live |
| R3-02 README session length | Fixed: README states the intended 4–10-minute board length |

## Remaining external dependency

Billing registration is still pending. The public offer remains accurate:
three free boards, 20 total boards, 17 added boards for **$8 once**, and no
subscription, ads, move sales, checkout, activation, or entitlement-success
claim.
