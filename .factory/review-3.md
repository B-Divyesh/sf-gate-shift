# Review 3 — Rotate rings to guide tokens through gates

Date: 2026-09-06  
Live URL: <https://gate-shift.sociobot.in>  
Implementation candidate: `472f8cca5b863a62186b851414a6a4d9b2d8a74e`  
Documentation head reviewed: `594f4660788a45d1a8d5896ca7216615df162ffa`  
Verdict: **FAIL**  
Finding count: **2**  
Untested public claim count: **0**

## Verdict

**FAIL.** Gate Shift has one major demo-sandbox finding and one minor
documentation finding. No product code was modified during this review.

The playable product, declared claim commands, accessibility checks, offer,
privacy behavior, routes, build, and performance checks otherwise passed. All
public claims were exercised; none remains untested. The demo label's promise
is tested and false on the exit boundary, which is a finding rather than an
untested claim.

The live JavaScript and CSS exactly match the clean build of `472f8cc`:

- `index-DAFWFK5I.js` SHA-256:
  `46826fb6e81eb0607452f5c05cff9b62802c1fe88196e5fa6b75c782ba63b029`
- `style-BoTSxxXH.css` SHA-256:
  `e4e86943a6e52c66f3110e5046131b0c910c0b05a03325d322103b436f132c4c`

Product files are unchanged between `472f8cc` and documentation head
`594f466`; the later commits change reports, evidence, and factory records.

## Findings

### R3-01 — Major — Leaving the demo retains sample state despite the no-save label

The persistent demo banner says **Demo — sample data, nothing is saved**. The
demo sandbox contract also requires leaving demo mode to discard sample data
unless the player explicitly keeps it.

In a fresh live desktop context, the sample started with 10 moves. A visible
safe route completed the board in 6 moves. Selecting **Start for real** removed
the banner and left the regular run key absent, so real data stayed isolated.
However, both `demo:gate-shift:run` and `demo:gate-shift:settings` remained in
browser storage. The retained run had the completed state. Re-entering `/demo`
can therefore restore old sample state instead of starting clean.

**Required repair:** make **Start for real** remove the complete
`demo:gate-shift:*` namespace before entering the regular game, or offer an
explicit one-time transfer choice. Extend `@claim:demo-isolated` to assert that
the demo namespace is absent after leaving and that a later `/demo` entry is a
clean sample.

### R3-02 — Minor — README omits the intended session length

The browser-game contract requires the README to state the intended session
length. The researched product specifies a 4–10 minute level, but the current
README only calls boards short and finite. No `minute` or session-duration
statement appears in the README.

**Required repair:** state the intended 4–10 minute level length in the README.
If the duration is presented as a measured public claim rather than a design
target, add a matching declared claim and measurement.

## Job, audience, and first action before scrolling

- Job: rotate rings to guide tokens through gates.
- Audience: logic-puzzle players who want a short finished board instead of an
  endless loop.
- First action: **Try it with sample data**, which opens a guided practice
  board in one click.

At 1280×720, the title ended at 316 px, audience at 391 px, sample action at
462 px, action explanation at 448 px, facts at 562 px, game heading at 200 px,
and first ring at 458 px. At 393×727, the facts ended at 440 px and the playable
board began at 454 px. The game itself is on the first screen in both views.

Evidence: [desktop first screen](review-3-evidence/sf-gate-shift-review-3-desktop-first-screen.png)
and [phone first screen](review-3-evidence/sf-gate-shift-review-3-phone-first-screen.png).

## Demo and complete game loops

The one-click sample opened `/demo` with six symbol-marked rings, fixed gates,
a 10-move budget, route previews, and the persistent sample banner. A short
preview changed the visible ring and linked gate without spending a move.
Applying it changed the budget to 9. **Reset demo** restored 10 and removed the
demo run and settings keys while leaving a regular-data sentinel unchanged.
R3-01 covers the separate exit boundary.

Fresh desktop and Pixel 5 clients then used only the visible safe-move prompt,
route preview, and apply controls. Both reached the actual completion panel:
**All six tokens reached their gates** and **You used 6 of 10 moves**. A fresh
desktop client spent all 10 moves, reached **The move budget is used**, and
**Undo last move** returned to active play with one move.

The live daily mode opened with a 22-move budget and accepted a safe move. The
free-board selector enabled Boards 1–3, locked Boards 4–20, and exposed no
multiplayer, room, or ranking mode.

Evidence: [demo reset](review-3-evidence/sf-gate-shift-review-3-desktop-demo-reset.png),
[desktop win](review-3-evidence/sf-gate-shift-review-3-desktop-win.png),
[desktop loss](review-3-evidence/sf-gate-shift-review-3-desktop-loss.png), and
[phone win](review-3-evidence/sf-gate-shift-review-3-phone-win.png).

## Declared claims and clean checks

A fresh GitHub clone at `594f466` was installed with `npm ci`. All 20 commands
in `.factory/claims.json` were run separately and unchanged; every command
exited successfully. Every ID occurs in exactly one `@claim:<id>` test.

| Claim IDs | Command result |
| --- | --- |
| `demo-isolated`, `route-preview`, `route-effects`, `solvable-authored-boards`, `daily-seed` | Pass |
| `reaches-end-screen`, `restart-resets`, `undo-no-penalty`, `settings-persist`, `progress-stays` | Pass |
| `local-only-game-data`, `no-accounts-analytics-ads`, `three-free-boards`, `one-time-offer`, `controls-work` | Pass |
| `safe-move-hint`, `symbol-cues`, `hidden-tab-pauses`, `finite-one-player`, `60-fps-phone` | Pass |

The passing `demo-isolated` command does not test demo teardown after **Start
for real**; R3-01 is the resulting incomplete-test and false-boundary finding.
No other unlisted or untested public claim was found.

| Check | Result |
| --- | --- |
| `npm ci` | Pass: 164 packages; zero vulnerabilities |
| `npm test` | Pass: 6/6 deterministic engine tests |
| `npm run test:browser` | Pass: 42 passed; 2 intentional cross-profile skips |
| `npm run build` | Pass: `dist/` produced |
| Built assets | Pass: JavaScript 8,867 gzip bytes; CSS 3,959 gzip bytes |
| `npm audit --audit-level=high` | Pass: zero vulnerabilities |
| `npm run verify:url -- https://gate-shift.sociobot.in` | Pass: title, language, main, h1, alt, and normal-load console checks |
| `npm run test:lighthouse` | Pass: 99 performance, 100 accessibility, 100 best practices, 100 SEO |
| Fresh live Lighthouse | Pass: 100 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 0.8 s, CLS 0, TBT 40 ms |

## Accessibility, recovery, privacy, routes, and performance

Fresh live axe scans of `/`, `/demo`, `/privacy`, `/terms`, and
`/not-a-board` found zero serious or critical violations. Every route had one
`main`, one `h1`, and the expected title. Keyboard arrows, U, R, preview/apply,
settings entry/exit, focus return, and back navigation worked. The focused ring
used a visible 3 px outline. Phone links and buttons met 44 CSS pixels, 200%
text caused no horizontal overflow, and reduced motion produced a near-zero
transition.

Malformed saved JSON recovered to the clean 10-move board. Manual pause and
resume worked. Progress and both accessibility settings survived reload. The
fresh Pixel 5 profile measured 60.34 fps with 4× CPU throttling, above the
declared 55 fps acceptance floor.

Normal live play and legal-route checks made same-origin requests only, set no
cookies, and produced no console or page errors. Security headers include CSP,
HSTS, Referrer-Policy, Permissions-Policy, and `nosniff`. Same-origin links
returned 200. A deliberately missing scoped PNG returned the designed Gate
Shift page with HTTP 404, title **Page not found — Gate Shift**, and a recovery
link. Its expected browser 404 resource message is not a defect.

Evidence: [designed HTTP 404](review-3-evidence/sf-gate-shift-review-3-http-404.png).

The public offer is accurate: 20 authored boards cost **$8 once**, the paid
set adds 17 boards, and there is no subscription, advertising, or move sale.
Purchase is explicitly unavailable while registration is pending. No checkout,
activation, or entitlement success is claimed.

Gate Shift is an intentionally static, local-first, one-player game. It makes
no multiplayer, backend, tenant, room, database, health, 429, or public offline
promise. Independent multiplayer clients and backend persistence checks do not
apply.

## Earlier finding dispositions

| Earlier finding | Current disposition |
| --- | --- |
| V1-01 deployment 404 and headers | Fixed: live headers are present; a scoped missing asset returns the designed HTTP 404. |
| V1-02 touch targets | Fixed: fresh phone measurements found no target below 44×44 CSS px. |
| V1-03 keyboard focus | Fixed: live keyboard actions retained or deliberately moved focus. |
| V1-04 route preview | Fixed: both previews expose ring and gate results without spending a move. |
| V1-05 authored-board proof | Fixed: the solver claim passed for 20 distinct authored states and recorded budgets. |
| V1-06 untested claims | Fixed for the earlier eight claims: all 20 declared commands ran separately. R3-01 is a newly identified exit-boundary gap. |
| V1-07 phone first-screen facts | Fixed: facts end at 440 px and playable content starts at 454 px. |
| V1-08 public offer metadata | Fixed: status-only public metadata records $8 USD once, 20 total boards, 17 paid additions, and pending billing without credentials. |
| V1-09 vulnerable toolchain | Fixed: the clean install and audit report zero vulnerabilities. |
| R1-01 desktop first-screen content below fold | Fixed: all required content and playable rings fit the fresh 1280×720 viewport. |

## Required disposition

The product remains **FAIL** until R3-01 and R3-02 are repaired and the live
demo exit path is reverified. Billing registration remains an accurately
disclosed external dependency and is not a finding.
