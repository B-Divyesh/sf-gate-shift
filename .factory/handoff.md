# Gate Shift repair 2 handoff

- Date: 2026-09-06
- Work order: `gate-shift-repair-2`
- Live URL: <https://gate-shift.sociobot.in>
- Live implementation SHA: `90c212baeeff94fd6f413d5b5c889add5ace509c`
- QA-only commit after the deployed bundle: `52704422a6ea2db2370ba62feadc2ef131d7046f`

The implementation repairs every finding in
[`verification-1.md`](verification-1.md). Gate Shift is a deterministic,
one-player browser puzzle for players who want a finite logic board. The first
screen says what to play, who it is for, and starts the isolated sample in one
click. It also shows the three public facts and the playable board on a 390 px
phone without scrolling.

## What changed

- Added an explicit long/short route preview. It shows the projected ring and
  linked-gate states without using a move, then asks the player to apply or
  cancel it.
- Replaced repeated/easy board states with 20 unique authored states. Exact
  solution lengths rise from 6 to 24 moves; later budgets leave one or two
  spare moves. Every board is solver-checked.
- Preserved focus across board renders, moved focus into and back out of
  settings, retained arrow-key operation on ring controls, and made visible
  phone actions at least 44 by 44 CSS pixels.
- Kept the game, facts, title, audience, and sample action together on the
  phone's first screen.
- Added one outcome-based tagged test for each of 20 public claims. Tests cover
  real state changes, end screens, recovery, stored state, request traffic,
  paid locks, controls, symbol cues, pausing, and measured frame rate.
- Put the deployment configuration in `dist/`. It now supplies CSP,
  Permissions-Policy, immutable hashed-asset caching, and a branded HTTP 404
  for missing files.
- Updated Vite and Vitest. The clean install reports no known vulnerabilities.
- Kept the researched offer intact: three free boards and 17 paid boards for
  **$8 USD once**. No subscription or pretend checkout was added.
- Updated the plain-word copy audit, design record, demo notes, README, legal
  routes, metadata, scoped asset names, and build validation.

The existing hand-authored SVG and CSS ring system remains the visual source.
It is original, product-specific, smaller than a generated bitmap, and clearer
for the game state; no generated image was needed for this repair.

## Verification 1 disposition

| Finding | Result | Evidence |
| --- | --- | --- |
| V1-01 deployment config absent | Fixed | Config is in `dist`; live security/cache headers pass; missing PNG returns the branded 404 with HTTP 404. |
| V1-02 small touch targets | Fixed | Phone outcome test measures every visible link and button at 44 px or larger. |
| V1-03 lost keyboard focus | Fixed | Browser test checks preview/apply focus and settings entry/return focus. |
| V1-04 no rotation preview | Fixed | Preview test checks both projections, no move use, and the applied state. |
| V1-05 weak/duplicate paid boards | Fixed | Unit test checks 20 unique starts, exact 6–24 move difficulty, budgets, and solver results. |
| V1-06 eight untested claims | Fixed | All public claims are represented by 20 unique IDs and exactly one tagged outcome test each. |
| V1-07 phone facts below game | Fixed | Phone first-screen test checks facts and game before the viewport cutoff. |
| V1-08 billing metadata absent | Fixed | Public metadata is at `/work/.evidence/billing-offer.json`; it contains no credential. |
| V1-09 vulnerable toolchain | Fixed | Vite 7.3.6, Vitest 3.2.7, and `npm audit` report zero vulnerabilities. |

## Clean setup and automated checks

The final pushed QA revision was cloned from GitHub into
`/tmp/gate-shift-final.HfV2Om`. From that clean clone:

```sh
npm ci
npm test
npm run build
```

- `npm ci`: 164 packages installed; zero vulnerabilities.
- `npm test`: 6 deterministic engine tests passed.
- `npm run build`: passed and produced `dist/`, including the deploy config and
  designed 404. JavaScript is 8,867 bytes gzip; CSS is 3,954 bytes gzip.
- Every one of the 20 `test` commands in `.factory/claims.json` was then run
  separately. All 20 commands passed.
- A final aggregate `npm run test:browser` passed 42 checks with two intended
  project skips. It covered desktop and Pixel 5 profiles, serious/critical axe
  scans, 200% text sizing, reduced motion, invalid-storage recovery, legal and
  unknown routes, keyboard focus, touch size, and deterministic win/loss runs.
- The phone frame test ran alone with 4x CPU throttling and met the unchanged
  55 FPS acceptance floor for the stated 60 FPS visual loop.
- `npm audit --audit-level=high`: zero vulnerabilities.

Run the same checks with:

```sh
npm ci
npm test
npm run test:browser
npm run build
npm audit --audit-level=high
```

## Live deployment and browser evidence

The static bundle from implementation `90c212b` was deployed to the existing
one-product Static Web App. Final deployment ID:
`65cd4fad-c0d4-4735-8efa-50228a88658a`. The final hashed script is
`/assets/index-DAFWFK5I.js`.

Cold HTTPS verification found:

- root HTTP 200; title, `lang=en`, one main, one h1, alt text, and zero console
  errors pass `npm run verify:url -- https://gate-shift.sociobot.in`;
- CSP and Permissions-Policy are present;
- the hashed script uses `public, max-age=31536000, immutable`;
- a random missing PNG returns HTTP 404 and the title
  `Page not found — Gate Shift`;
- fresh desktop and phone clients entered the one-click sample, kept its
  persistent label, previewed without spending a move, and retained focus;
- hints drove Board 3 to a real win on desktop and phone; Board 1 reached a
  real loss, and restart/undo recovery worked;
- only same-origin requests were observed and both clients logged zero console
  errors;
- mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; LCP 0.9 s, CLS 0, total blocking time 50 ms.

Screenshots are in [`repair-2-evidence`](repair-2-evidence/): desktop and
phone first screens, desktop route preview, desktop win/loss, and phone win.

## Offer and remaining dependency

Billing registration remains an external operator dependency. The live page
accurately describes the complete $8 USD one-time offer and keeps Boards 4–20
locked. It does not display checkout, claim activation, or claim entitlement.
The operator metadata at `/work/.evidence/billing-offer.json` records the exact
origin, price evidence, paid deliverables, and the currently unavailable
license-validation path. The free three-board game and demo work without it.

There is no backend, account, multiplayer mode, shared state, or public offline
promise, so SQLite, room persistence, restart persistence, health, and 429
checks do not apply. A conservative service worker caches the same-origin shell
but is not marketed as guaranteed offline support.

The catalog description is 83 characters, starts with a verb, and is identical
in `.factory/catalog-description.txt` and
`/work/.evidence/catalog-description.txt`.
