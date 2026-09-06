# Gate Shift handoff

## Independent verification 1 — FAIL

Verification date: 2026-09-06. Candidate implementation: `f080a38`.
Documentation reviewed: `70c00f4`. Full report:
[`.factory/verification-1.md`](verification-1.md).

The deployed game is playable: clean unit/browser/build gates pass, all 11
declared claims pass individually, live desktop and phone runs reach real win
and loss panels, and live Lighthouse is 100/100/100/100. Verification still
found nine issues, with eight untested public claims:

- the deployment omits `staticwebapp.config.json`, so live CSP,
  Permissions-Policy, immutable asset caching, and the designed HTTP 404 are
  absent;
- mobile header, demo, and footer targets are below 44 px;
- common actions discard keyboard focus;
- the brief's pre-move rotation preview is missing;
- the recorded paid-board difficulty curve does not match solver results and
  two late boards share one logical start state;
- eight public claims lack compliant claim entries and exact tagged tests;
- the three required facts fall below the full game on phone;
- the named public offer metadata file was absent at verification start; and
- clean setup reports high and critical development-only advisories.

No product code was changed by the verifier. Evidence screenshots are in
`.factory/verification-1-evidence/`.

## Product delivered

Gate Shift is a local-first, one-player browser puzzle. Players rotate six
symbol-marked rings through fixed gates. The short clockwise route reverses a
linked gate; the long counterclockwise route does not. A board ends in a win or
loss at its fixed move budget, and undo restores a turn without penalty.

The first screen states the job, audience, and first action:

- Job: **Rotate rings to guide tokens through gates**.
- Audience: logic-puzzle players who want a short finished board.
- First action: **Try it with sample data**, which opens `/demo` immediately.

The game has 20 authored deterministic boards across arc, ladder, and cluster
layouts, plus one deterministic daily board. Boards 1–3 are free. The complete
set is a public **$8 one-time** offer for 20 boards; billing registration is
pending, so there is deliberately no checkout, activation, or entitlement
claim. Public registration metadata is at
`/work/.evidence/billing-offer.json` and contains no credentials. This was the
builder's recorded location; independent verification did not find the file in
the current evidence directory (V1-08).

## Product behavior

- Touch, swipe, click, and keyboard work. Up/Down selects a ring, Left/Right
  takes long/short routes, `U` undoes, and `R` restarts.
- The app pauses on a hidden tab and saves active progress and settings in
  browser local storage. Demo data uses only `demo:gate-shift:*`; regular data
  uses `gate-shift:*`.
- The demo banner persists, labels the sample run, can reset demo-only storage,
  and can return to the regular game.
- There are no accounts, analytics, third-party requests, social ranking,
  multiplayer, subscriptions, ads, move sales, or endless boards.
- Every board is BFS-proven to have a route within its displayed budget. The
  visual loop uses a clamped 60 Hz timestep and pauses while hidden.

## Builder verification (historical)

These are the builder's pre-deployment results. They are superseded for
acceptance by independent verification 1 above.

Implementation candidate: `f080a38` (`feat: build Gate Shift puzzle game`).
Verification documentation SHA: `12084166ead27afcd2eb5aeb2f90f8225a50ff11`
(`docs: record Gate Shift verification`).

From a separate clean clone at `/tmp/gate-shift-clean.cXLrFj`, after `npm ci`:

- `npm test` passed: 7 deterministic engine tests, including all 20 solver
  proofs and a scripted win.
- `npm run test:browser` passed: 20 desktop/Pixel 5 browser tests. It covers
  entry screen, demo isolation/reset, real UI win end screen, restart,
  keyboard, settings persistence, progress recovery, privacy requests, legal
  routes, 404 recovery, one-time offer status, and axe serious/critical scans.
- `npm run build` passed and produced `dist/`: 8.04 KB gzip JavaScript and
  3.82 KB gzip CSS in the final measured build.
- `npm run verify:url` passed: title, `lang=en`, one main, one h1, no missing
  image alt attributes, and zero console errors.
- `npm run test:lighthouse` passed locally with Performance 100,
  Accessibility 100, Best Practices 100, and SEO 100.
- All commands in `.factory/claims.json` were run individually. The 60-fps
  claim passed under the Pixel 5 profile with 4× CPU throttling, using a
  two-second `requestAnimationFrame` sample and a 55-fps lower margin.
- `npm audit --omit=dev` reported zero production dependency vulnerabilities.

Visual inspection used fresh desktop and Pixel 5 browser contexts. The root
phone screen shows the job, primary sample action, and live board before
scrolling. The demo phone view has its persistent sample banner. A scripted
Board 3 run reached the real completion panel in both desktop and phone tests;
Playwright attached first-screen and end-screen evidence to its report.

## Accessibility and privacy

The product has semantic header/nav/main/footer landmarks, a skip link, one h1
per route, visible focus styles, native labelled checkboxes, live status text,
symbol-plus-color states, and calm-motion and reduced-motion paths. Independent
verification found undersized navigation/demo/footer targets and lost keyboard
focus after re-rendering actions (V1-02 and V1-03).

## Deployment files

The repository contains `staticwebapp.config.json`, but `npm run build` does
not place it in `dist/`, and the configured headers and designed HTTP 404 are
not active live (V1-01). No SQLite or backend is needed because this product
has no shared state.

## Known gaps and next steps

- Resolve all findings in `.factory/verification-1.md`; the current verdict is
  FAIL with nine findings and eight untested public claims.
- Billing registration is the named external dependency. Keep the $8 one-time
  offer and 17 paid-board deliverables, but do not show checkout until the
  factory billing operator provides and tests a real entitlement path.
- No public offline promise is made. A conservative same-origin service worker
  is included for shell caching, but offline behavior is not marketed as a
  guaranteed claim.
- Post-deploy, repeat the fresh HTTPS desktop and phone smoke test and retain
  the deployment SHA in the factory release record.
