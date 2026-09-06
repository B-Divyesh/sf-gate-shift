# Gate Shift independent verification 2

Date: 2026-09-06  
Live URL: <https://gate-shift.sociobot.in>  
Implementation candidate: `90c212baeeff94fd6f413d5b5c889add5ace509c`  
Documentation head reviewed: `35844ea2a30d5db8813eb1123d8689a3edf86abf`  
Verdict: **PASS**  
Finding count: **0**  
Untested public claim count: **0**

## Verdict

Gate Shift passes independent verification with zero findings at every
severity and zero untested public claims. A clean clone passed all 20 declared
claim commands separately, 6 unit tests, 42 applicable browser checks, the
production build, the dependency audit, URL checks, and Lighthouse. Fresh live
desktop and phone clients completed the sample, a deterministic win, a finite
loss, and recovery without console or privacy errors.

No product code was changed during this verification.

## First screen before scrolling

- Job: rotate rings to guide six marked tokens through fixed gates.
- Audience: logic-puzzle players who want a short board with a definite end.
- First action: **Try it with sample data**, which opens the guided practice
  board at `/demo` in one click.
- The title is **Rotate rings to guide tokens through gates**. It names the
  play directly.
- Desktop and Pixel 5 views show the job, audience, action, three facts, and
  playable game before the viewport cutoff. The facts state three free boards,
  browser-local progress, and the complete set's $8 one-time price.

Evidence: [desktop first screen](verification-2-evidence/sf-gate-shift-verification-2-desktop-first-screen.png)
and [phone first screen](verification-2-evidence/sf-gate-shift-verification-2-phone-first-screen.png).

## Findings

None.

## Sample sandbox

The live first-screen action entered `/demo` in one click. The resulting board
contained six marked tokens, fixed gates, a finite move budget, route controls,
and realistic playable state. The persistent banner said **Demo — sample data,
nothing is saved** and exposed **Reset demo** and **Start for real**.

A regular-storage sentinel was set before entering the sample. A preview used
no move, applying it wrote only `demo:gate-shift:run`, and **Reset demo**
restored the original board and budget. The regular run remained absent and
the regular sentinel remained unchanged. The clean-clone claim also left the
sample for the regular game and confirmed that the banner disappeared.

Evidence: [live route preview](verification-2-evidence/sf-gate-shift-verification-2-desktop-preview.png).

## Deterministic complete runs

### Win

Fresh desktop and Pixel 5 clients selected Board 3. Each safe move was obtained
and applied through visible ring and route controls. Both clients cleared all
six gates in 8 of 12 moves and reached the real completion panel with the run
summary, **Play this board again**, and **Play next free board**. Replay reset
the board.

Evidence: [desktop win](verification-2-evidence/sf-gate-shift-verification-2-desktop-win.png)
and [phone win](verification-2-evidence/sf-gate-shift-verification-2-phone-win.png).

### Loss and recovery

A fresh live desktop run selected Board 1 and used all 10 moves. The real loss
panel displayed **The move budget is used**. **Undo last move** returned the
run to active play with one move, and **Restart board** restored all 10 moves.

Evidence: [desktop loss](verification-2-evidence/sf-gate-shift-verification-2-desktop-loss.png).

## Declared claims

All 20 `test` values in `.factory/claims.json` were executed separately and
unchanged from a clean GitHub clone after `npm ci`. Each ID occurs in exactly
one tagged test. No public claim on the live pages or in README lacks a claim
entry.

| Claim | Result | Observable evidence |
| --- | --- | --- |
| `demo-isolated` | Pass | One-click sample, persistent label, reset, exit, and regular-data sentinel isolation |
| `route-preview` | Pass | Long and short projected states used no move; the applied short state matched its preview |
| `route-effects` | Pass | Short route changed one ring and linked gate; long route changed one ring and no gate |
| `solvable-authored-boards` | Pass | 20 unique starts solved within budget; exact shortest lengths rise from 6 to 24 |
| `daily-seed` | Pass | A fixed UTC date produced the same solvable board twice |
| `reaches-end-screen` | Pass | Board 3 reached the completion panel through visible controls on desktop and phone |
| `restart-resets` | Pass | Restart restored original state and budget |
| `undo-no-penalty` | Pass | Undo restored state and one move without a charge |
| `settings-persist` | Pass | Calm motion survived reload in the same browser |
| `progress-stays` | Pass | Active sample progress survived reload |
| `local-only-game-data` | Pass | Sample play and hint requests remained same-origin static GETs |
| `no-accounts-analytics-ads` | Pass | No account controls, iframe, cookie, tracker, ad, or cross-origin request appeared |
| `three-free-boards` | Pass | Boards 1–3 were enabled; Boards 4–20 were locked |
| `one-time-offer` | Pass | $8 once for 20 boards; no subscription, false checkout, or activation claim |
| `controls-work` | Pass | Mouse, tap, swipe, four arrow keys, U, and R changed or restored observable state |
| `safe-move-hint` | Pass | Repeated returned moves completed the real board |
| `symbol-cues` | Pass | Six symbols remained distinct and high-contrast mode removed token color as an extra cue |
| `hidden-tab-pauses` | Pass | Hidden-state runtime stopped and the resumable pause panel appeared |
| `finite-one-player` | Pass | No room/ranking flow; finite loss and undo recovery occurred |
| `60-fps-phone` | Pass | Pixel 5 profile with 4x CPU throttling met the 55 fps acceptance floor |

Declared claim failures: **0**. Untested or unlisted public claims: **0**.

## Earlier finding disposition

| Earlier finding | Current disposition | Independent evidence |
| --- | --- | --- |
| V1-01 deployment config absent | Fixed | Live CSP and Permissions-Policy are present; hashed assets are immutable; a missing PNG returns the branded page with HTTP 404 |
| V1-02 small touch targets | Fixed | Every visible phone link and button measured at least 44 by 44 CSS pixels |
| V1-03 lost keyboard focus | Fixed | Preview/apply retained focus; Settings moved focus inside and returned it on close; history navigation focused the new h1 |
| V1-04 no rotation preview | Fixed | Both routes expose projected ring/gate states without spending a move |
| V1-05 weak or duplicate paid boards | Fixed | Solver test proves 20 unique states, 6–24 move shortest routes, and tighter final budgets |
| V1-06 eight untested claims | Fixed | There are 20 unique IDs and exactly one tagged outcome test for every ID; all pass separately |
| V1-07 phone facts below game | Fixed | All three facts and substantial game content appear in the Pixel 5 first viewport |
| V1-08 billing metadata absent | Fixed | Live public offer is complete; fresh status-only operator metadata was emitted without credentials |
| V1-09 vulnerable toolchain | Fixed | `npm ci` and `npm audit --audit-level=high` report zero vulnerabilities |

## Functional, boundary, and recovery checks

| Area | Result |
| --- | --- |
| Pointer, touch, swipe, keyboard | Pass on the declared desktop and phone paths |
| Preview, apply, undo, restart | Pass with visible state and budget assertions |
| Pause and resume | Pass; hidden-state and manual pause preserve the board |
| Settings | Pass; calm motion and symbol mode persist |
| Invalid saved JSON | Pass; the aggregate clean-clone suite recovered to Board 1 |
| Minimum/maximum content | Pass; all 20 authored states and budgets were solver-checked |
| Daily boundary | Pass for a fixed UTC date with deterministic state and valid solution |
| Browser history | Pass; navigation, back, titles, and h1 focus restored |
| 200% text | Pass at phone width with no horizontal overflow |
| Reduced motion | Pass; the phone context exposed calm mode immediately |
| Offline/update | No public offline or update claim; an exploratory warm `/demo` reload still worked offline |
| Multiplayer | Not advertised or implemented; one-player is explicit and matches the brief's v1 non-goal |
| Backend checks | Not applicable; this is a static local-first game with no tenant, room, API, database, health, or rate-limit surface |
| Billing | Correctly pending; no checkout, entitlement, or activation success is shown |

## Routes, accessibility, privacy, and performance

- `/`, `/demo`, `/privacy`, `/terms`, and the SPA recovery route have useful
  route titles, one h1, one main landmark, and zero serious or critical axe
  violations.
- A missing scoped PNG returns HTTP 404 with the Gate Shift recovery design,
  not a generic host page. This expected 404 is not a defect. Evidence:
  [HTTP 404](verification-2-evidence/sf-gate-shift-verification-2-http-404.png).
- Every same-origin link on the live first page returned HTTP 200. The external
  Param Factory link was identified but not fetched because the work order
  limits network activity to this product.
- Live normal play produced zero console/page errors, zero cookies, and zero
  cross-origin requests.
- `npm run verify:url -- https://gate-shift.sociobot.in` passed title, language,
  main, h1, alt, and console checks.
- Live Lighthouse scored Performance 100, Accessibility 100, Best Practices
  100, and SEO 100. LCP was 852 ms, CLS was 0, and total blocking time was
  46 ms.
- A fresh live Pixel 5 profile with 4x CPU throttling measured 60.20 fps over
  two seconds.
- The build contains 8,867 gzip bytes of JavaScript and 3,954 gzip bytes of
  CSS, below the product budgets.

## Candidate identity and clean commands

The deployed implementation is `90c212b`. Later commits change only
`playwright.config.ts`, documentation, and evidence. The live assets
`/assets/index-DAFWFK5I.js` and `/assets/style-BYbrIib-.css` exactly match the
clean build byte for byte:

- JavaScript SHA-256:
  `46826fb6e81eb0607452f5c05cff9b62802c1fe88196e5fa6b75c782ba63b029`
- CSS SHA-256:
  `95c6b41fcdf6b3cd6422413a030aa69bf93e4696bd9328446988b650876aaa09`

Clean clone: `/work/gate-shift-verify-2.ZR3EWJ` at `35844ea`.

| Command | Result |
| --- | --- |
| `npm ci` | Pass; 164 packages installed, zero vulnerabilities |
| `npm test` | Pass; 6/6 deterministic engine tests |
| Every `.factory/claims.json` command | Pass; all 20 run separately |
| `npm run test:browser` | Pass; 42 passed, 2 intended project skips |
| `npm run build` | Pass; verified `dist/`, security config, designed 404, and size budgets |
| `npm audit --audit-level=high` | Pass; zero vulnerabilities |
| `npm run verify:url -- https://gate-shift.sociobot.in` | Pass |
| `npm run test:lighthouse` | Pass; local 100/100/100/100 |
| Live Lighthouse | Pass; 100/100/100/100 |

## Remaining external dependency

Billing registration remains an operator dependency. This is not a product
finding: the live page states the complete **$8 USD once** offer, keeps the 17
paid boards locked, and accurately says purchase is unavailable. It does not
claim a checkout, entitlement, or activation test passed.
