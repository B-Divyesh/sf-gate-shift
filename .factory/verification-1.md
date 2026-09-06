# Gate Shift independent verification 1

Date: 2026-09-06  
Live URL: <https://gate-shift.sociobot.in>  
Implementation candidate: `f080a3889efbeadd544b80e7cbbf6821e9145ac1`  
Documentation head reviewed: `70c00f482a29fdb576269ba45ace955358644328`  
Verdict: **FAIL**  
Finding count: **9**  
Untested public claim count: **8**

## Verdict

Gate Shift is playable and the tested win, loss, reset, recovery, privacy, and
performance paths work. It does not pass this verification because nine
findings remain. Three affect the non-negotiable accessibility and deployment
contracts. The missing rotation preview and weak paid-board difficulty curve
also leave the researched product scope incomplete.

No product code was changed during this verification.

## First-screen assessment before scrolling

- Job: rotate six rings to guide marked tokens through gates.
- Audience: logic-puzzle players who want a short board with a definite end.
- First action: **Try it with sample data**, which opens `/demo` in one click.
- The playable board begins in the first viewport on desktop and phone. On the
  Pixel 5 profile its top was at 408 CSS px in a 727 CSS px viewport.
- The phone layout does not keep the three required price/privacy/storage facts
  on the first screen; they follow the full game panel. This is finding V1-07.

Evidence: [desktop first screen](verification-1-evidence/desktop-first-screen.png)
and [phone first screen](verification-1-evidence/phone-first-screen.png).

## Findings

### V1-01 — Major — Static deployment configuration is not in the artifact or live runtime

`npm run build` does not copy `staticwebapp.config.json` into `dist/`. The live
responses therefore omit the configured Content-Security-Policy and
Permissions-Policy. Hashed assets also receive `max-age=30`, not the configured
immutable caching policy.

The missing configuration breaks the required HTTP 404 treatment. A deliberate
request for `/missing-asset.png` returns HTTP 404, but it shows the generic
Azure Static Web Apps page rather than Gate Shift's designed 404. That response
loads styles and a favicon from Microsoft CDN origins. The extensionless SPA
path `/not-a-board` shows the product recovery design but returns HTTP 200.

Evidence:

- Clean `dist/` contains no `staticwebapp.config.json`.
- Live root headers include HSTS, Referrer-Policy, and nosniff, but not CSP or
  Permissions-Policy.
- `/missing-asset.png`: HTTP 404, title `Azure Static Web Apps - 404: Not
  found`, and three external stylesheet/favicon URLs.
- [generic live HTTP 404](verification-1-evidence/live-generic-http-404.png)

### V1-02 — Major — Mobile touch targets are below 44 px

The phone demo has eight visible links or actions below the required 44 px
height. Header links measure 20–30 px high, **Reset demo** and **Start for
real** measure 35 px, and footer links measure 21 px. The main game controls
meet the target size, but the page does not meet the attached accessibility
baseline.

### V1-03 — Major — Keyboard focus is discarded after common actions

Activating **Take short route** with Space or opening **Settings** with Enter
re-renders the app and moves focus to `<body>`. Opening Settings does not move
focus into the new panel or retain it on the Settings control. A keyboard user
must restart tab navigation from the skip link. The skip link and ordinary
focus outline themselves pass.

### V1-04 — Major — The required rotation preview is absent

The researched smallest useful product says every rotation can be previewed
before choosing a route. The live game can apply a route or show one solver
hint, but it cannot preview either route's resulting ring and gate state. This
is missing acceptance scope, not an unadvertised enhancement.

### V1-05 — Major — The paid-board difficulty record does not match the game

`.factory/design.md` says later boards add longer sequences and tighter
budgets. Independent solver measurements show the opposite after Board 3:

| Board | Minimum solution | Budget |
| --- | ---: | ---: |
| 1 | 12 | 16 |
| 3 | 18 | 19 |
| 6 | 8 | 22 |
| 7 | 6 | 25 |
| 8 | 4 | 26 |
| 20 | 8 | 26 |

Boards 17 and 18 also have the same logical start state
`300230:000000`; only their visual layout differs. The solver claim proves
that all 20 entries are solvable, but it does not prove the recorded difficulty
curve or distinct paid puzzle content. This matters because the public $8 offer
promises 17 additional authored boards.

### V1-06 — Major — Eight public claims lack compliant claim entries and exact tagged tests

All 11 declared claim commands pass. The live UI, Privacy page, and README also
make these eight distinct public claims without corresponding entries and exact
`@claim:<id>` tests in `.factory/claims.json`:

1. Touch, swipe, mouse, and the complete keyboard control set work.
2. Short and long routes change rings and gates as described.
3. Undo restores a move without penalty.
4. Hiding the tab pauses the active board.
5. High-contrast symbols remove token color as an extra cue.
6. **Show next safe move** returns a move that remains solvable.
7. The product uses no analytics, accounts, advertising, third-party scripts,
   or server-side profiles.
8. An intended board session lasts 4–10 minutes.

Some have incidental unit or browser coverage, but none has the required exact
claim entry and tagged sandbox command. They are counted as eight untested
public claims under the attached claims contract.

### V1-07 — Minor — The three required facts are not on the phone first screen

At 393 px wide, responsive ordering puts the facts list after the entire live
game. The job, audience, first action, and part of the board are visible before
scrolling, but the three short facts required by the plain-words first-screen
shape are not.

### V1-08 — Minor — The handoff's public offer metadata file is absent

The handoff names `/work/.evidence/billing-offer.json`, but that file was not
present at verification start. The live page itself correctly states **$8
once**, 20 boards, 17 additional paid boards, no subscription, and billing
registration pending. No checkout or entitlement success is claimed.

### V1-09 — Minor — Documented clean setup reports high and critical development advisories

`npm ci` succeeds but reports one high and one critical development dependency
vulnerability. They affect Vite 7.1.11 and Vitest 3.2.4; patched versions are
available without a major upgrade. `npm audit --omit=dev` reports zero
production vulnerabilities, so the deployed static runtime is not affected by
these two advisories.

## Declared claim results

Every command was run individually from the clean clone at documentation SHA
`70c00f4` after `npm ci`.

| Claim | Result | Observable evidence |
| --- | --- | --- |
| `demo-isolated` | Pass | One-click `/demo`, persistent label, separate `demo:gate-shift:*` storage, reset, and unchanged real sentinel |
| `solvable-authored-boards` | Pass | Solver found a route within budget for all 20 entries |
| `daily-seed` | Pass | Same UTC date produced the same solvable board |
| `reaches-end-screen` | Pass | Board 3 reached the real win panel on desktop and phone |
| `restart-resets` | Pass | Restart restored the original budget |
| `settings-persist` | Pass | Calm-motion state survived reload |
| `progress-stays` | Pass | Move count survived same-context reload |
| `local-only-game-data` | Pass | Only `https://gate-shift.sociobot.in` received requests |
| `three-free-boards` | Pass | Boards 1–3 enabled; Board 4 disabled |
| `one-time-offer` | Pass | $8 once, 20 boards, no subscription, pending billing, no checkout link |
| `60-fps-phone` | Pass | Live Pixel 5 profile with 4× CPU throttling measured 60.36 fps |

Declared claim failures: **0**. Untested/unlisted public claims: **8**.

## End-to-end game runs

### Win

In fresh live desktop and phone contexts, Board 3 was selected and its solver
route was applied through the visible ring and route controls. It completed in
18 of 19 moves. The end panel received focus, displayed the run summary, and
offered replay and the next free board. Replay restored 19 moves.

Evidence: [desktop win](verification-1-evidence/desktop-win-end-screen.png) and
[phone win](verification-1-evidence/phone-win-end-screen.png).

### Loss and recovery

In the live desktop demo, 16 long-route actions exhausted Board 1's move
budget. The loss panel offered replay and undo. **Undo last move** returned the
run to active play with one move remaining.

Evidence: [desktop loss](verification-1-evidence/desktop-loss-end-screen.png).

## Functional and boundary checks

| Area | Result |
| --- | --- |
| One-click sample | Pass; realistic six-token board loaded immediately |
| Persistent demo label | Pass on desktop and phone |
| Reset and isolation | Pass; demo reset did not change regular storage |
| Normal pointer controls | Pass |
| Keyboard arrows, U, and R | Pass; focus retention fails separately in V1-03 |
| Win, loss, replay, undo | Pass |
| Settings persistence | Pass |
| Invalid stored JSON | Pass; clean Board 1 recovery |
| Reduced motion | Pass; Pixel context enabled calm mode |
| 200% text size | Pass at 393 px; no horizontal overflow |
| Offline after a first visit | Exploratory pass; no public offline claim exists |
| Privacy requests | Pass; only same-origin requests observed |
| Multiplayer | Not advertised and not present, matching the v1 non-goal |
| Billing | Pending status is honest; no checkout or entitlement flow claimed |
| `/privacy`, `/terms` | Pass; route-specific titles, one h1, and useful content |
| SPA unknown route | Product-styled recovery works; HTTP status/config fails under V1-01 |
| Broken asset HTTP 404 | HTTP 404 is deliberate, but the required product design is absent under V1-01 |
| Internal and external links | Pass; checked targets returned expected responses |
| Console/page errors | Pass; zero in live desktop and phone flows |

## Accessibility, privacy, and performance

- Live axe scans found zero violations on `/`, `/privacy`, `/terms`, and the
  SPA not-found route. Axe does not cover the target-size and focus-retention
  failures in V1-02 and V1-03.
- `npm run verify:url -- https://gate-shift.sociobot.in` passed: title,
  `lang=en`, one main, one h1, no missing image alt, and zero console errors.
- Live Lighthouse: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; LCP 0.9 s, CLS 0, TBT 40 ms.
- Local Lighthouse rerun: 95/100/100/100. The performance gate still passes.
- Built output: 8.04 KB gzip JavaScript and 3.82 KB gzip CSS.
- Live JavaScript and CSS SHA-256 values exactly match the clean candidate
  build's hashed assets.
- No third-party request occurred during the normal live game flow.

## Clean setup and command results

Clean clone: `/tmp/gate-shift-verify-1.wOUK3P` at `70c00f4`.

| Command | Result |
| --- | --- |
| `npm ci` | Pass; development audit warning recorded as V1-09 |
| `npm test` | Pass; 7/7 unit tests |
| `npm run build` | Pass; `dist/` produced |
| `npm run test:browser` | Pass; 23 passed, 1 expected desktop skip |
| Every command in `.factory/claims.json` | Pass individually |
| `npm run verify:url` | Pass locally |
| `npm run verify:url -- https://gate-shift.sociobot.in` | Pass live |
| `npm run test:lighthouse` | Pass; 95/100/100/100 |
| Live Lighthouse | Pass; 100/100/100/100 |
| `npm audit --omit=dev` | Pass; zero production vulnerabilities |
| Full `npm audit` | Warning; V1-09 |

## Earlier findings and stated gaps

No earlier review or verification report exists in repository history. The
implementation handoff's stated gaps were checked as follows:

- DNS/HTTPS cold check: **resolved**. The live root now returns HTTPS 200.
- Billing registration: **still pending and accurately disclosed**. The lack
  of checkout is expected, not a failed checkout finding.
- Offline behavior: **not promised**. An exploratory post-visit offline reload
  of `/demo` worked, but no acceptance credit depends on it.
- Post-deploy desktop/phone check: **completed in this verification**.

## Required disposition

The product remains **FAIL** until every finding is resolved and all eight
public claims have compliant entries and exact sandbox tests. A later
verification must rerun the live desktop and phone paths because V1-01 through
V1-07 affect runtime behavior or acceptance scope.
