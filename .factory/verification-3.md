# Gate Shift independent verification 3

Date: 2026-09-06  
Live URL: <https://gate-shift.sociobot.in>  
Implementation candidate: `472f8cca5b863a62186b851414a6a4d9b2d8a74e`  
Documentation head reviewed: `88654df53246334ef74f6ac85ffb010c494cec0e`  
Verdict: **PASS**  
Finding count: **0**  
Untested public claim count: **0**

## Verdict

**PASS.** Gate Shift has zero findings at every severity and zero untested public claims. No product code was changed during this verification.

The deployment delay described in the work order resolved during this check. The fresh HTTPS desktop client loaded `style-BoTSxxXH.css`, not the previous bundle. Its SHA-256 was `e4e86943a6e52c66f3110e5046131b0c910c0b05a03325d322103b436f132c4c`, identical to the clean candidate build. The live JavaScript `index-DAFWFK5I.js` also matched the candidate: `46826fb6e81eb0607452f5c05cff9b62802c1fe88196e5fa6b75c782ba63b029`.

## First screen

- Job: rotate rings to guide tokens through gates.
- Audience: logic-puzzle players who want a short finished board rather than an endless loop.
- First action: **Try it with sample data**; it opens a guided practice board.

In a fresh 1280×720 desktop client, the title bottom was 316, audience 391, sample action 462, action explanation 448, facts 562, game heading 200, and first ring 458 CSS pixels. All are inside the viewport. In a fresh 393×727 Pixel 5 client, the three facts ended at 440 and the playable game began at 454. The game, not a menu wall, is on the first screen.

Evidence: [desktop first screen](verification-3-evidence/live-desktop-first-screen.png) and [phone first screen](verification-3-evidence/live-phone-first-screen.png).

## Demo and complete runs

The desktop first-screen action entered `/demo` in one click. It showed six symbol-marked rings, a finite 10-move board, fixed gates, route controls, and the persistent label **Demo — sample data, nothing is saved**. A short-route move changed the budget from 10 to 9. **Reset demo** restored 10. The separate `demo:gate-shift:run` key was present; regular-run storage stayed absent and a regular-data sentinel remained unchanged.

Fresh desktop and phone clients followed visible safe-move prompts through active play to the actual completion panel, **All six tokens reached their gates**, with **You used 6 of 10 moves**. A separate fresh desktop run used all 10 moves, reached **The move budget is used**, and **Undo last move** restored one move. This is a deterministic finite win, loss, and recovery, not a mock end state.

Evidence: [desktop win](verification-3-evidence/live-desktop-win.png), [desktop loss](verification-3-evidence/live-desktop-loss.png), and [phone win](verification-3-evidence/live-phone-win.png).

## Claims and clean checkout

A fresh GitHub clone at documentation head `88654df` was checked to confirm that its product files equal `472f8cc`; only reports and evidence differ. After `npm ci`, all 20 declared `.factory/claims.json` commands were invoked separately and unchanged. Every command passed:

| Claims | Result |
| --- | --- |
| `demo-isolated`, `route-preview`, `route-effects`, `solvable-authored-boards`, `daily-seed` | Pass |
| `reaches-end-screen`, `restart-resets`, `undo-no-penalty`, `settings-persist`, `progress-stays` | Pass |
| `local-only-game-data`, `no-accounts-analytics-ads`, `three-free-boards`, `one-time-offer`, `controls-work` | Pass |
| `safe-move-hint`, `symbol-cues`, `hidden-tab-pauses`, `finite-one-player`, `60-fps-phone` | Pass |

The full clean checks also passed:

| Command | Result |
| --- | --- |
| `npm test` | Pass: 6/6 deterministic engine tests |
| `npm run test:browser` | Pass: 42 passed; 2 intentional cross-profile skips |
| `npm run build` | Pass: `dist/` produced; JS 8,867 gzip bytes; CSS 3,959 gzip bytes |
| `npm audit --audit-level=high` | Pass: zero vulnerabilities |
| `npm run verify:url -- https://gate-shift.sociobot.in` | Pass: title, language, main, h1, alt, and console |
| `npm run test:lighthouse` | Pass: 99 performance, 100 accessibility, 100 best practices, 100 SEO |
| Fresh live Lighthouse | Pass: 100 performance, 100 accessibility, 100 best practices, 100 SEO |

## Accessibility, routes, privacy, and scope

Fresh live axe scans of `/`, `/demo`, `/privacy`, `/terms`, and `/not-a-board` found zero serious or critical violations. Each had one h1, one main landmark, and the expected route title. Same-origin navigation links returned 200. A missing scoped PNG returned deliberate HTTP 404; it is not a defect. The live CSP, HSTS, Referrer-Policy, Permissions-Policy, and `nosniff` headers were present.

Normal live play made requests only to `https://gate-shift.sociobot.in`, had no console errors, and set no account, analytics, advertising, or tracking path. The throttled Pixel 5 measurement was 60.34 fps over two seconds, passing the published 55 fps floor. Reduced motion was used in that phone client.

This is a static, local-first, one-player game. It advertises no multiplayer, backend, tenant, room, database, health, rate-limit, offline, or update service. Those backend and multiplayer checks therefore do not apply. The public offer accurately states 20 authored boards for **$8 once**, with no subscription, ads, or move sales; purchase remains pending and no checkout, activation, or entitlement success is claimed.

## Earlier findings

| Finding | Current disposition |
| --- | --- |
| V1-01 designed deployment 404 and headers | Fixed: live headers present; scoped missing PNG is deliberate HTTP 404 |
| V1-02 touch targets | Fixed: phone target browser check passed |
| V1-03 keyboard focus | Fixed: aggregate browser focus check passed |
| V1-04 route preview | Fixed: separate preview claim passed without spending a move |
| V1-05 authored-board proof | Fixed: solver claim passed for 20 distinct boards within budget |
| V1-06 claim coverage | Fixed: 20 declared commands all passed separately |
| V1-07 phone first-screen facts | Fixed: facts bottom 440 in a 727-pixel phone viewport |
| V1-08 public offer metadata | Fixed: public $8 one-time offer is complete and accurately pending |
| V1-09 dependency audit | Fixed: fresh audit found zero vulnerabilities |
| R1-01 desktop first-screen content below fold | Fixed: fresh 1280×720 measurements place every required item and playable content in view |

