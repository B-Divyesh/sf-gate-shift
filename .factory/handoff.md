# Gate Shift repair 3 handoff

- Date: 2026-09-06
- Work order: `gate-shift-repair-3`
- Implementation: `472f8cca5b863a62186b851414a6a4d9b2d8a74e`
- Previous documentation head: `6415aae02f56ede0eb88ca3ecd10695e344d44c8`
- Live URL: <https://gate-shift.sociobot.in>

## What changed

The desktop first screen now has a wider copy column, a smaller three-line
title, and top-aligned copy beside the live board. At 1280×720, the title,
audience, sample action and explanation, all three facts, the game heading,
and the first playable ring fit before scrolling. The title remains **Rotate
rings to guide tokens through gates**.

The browser suite now measures that exact desktop outcome. It checks real
element bounds at 1280×720 instead of checking only that the content exists.
The phone first-screen check remains in place.

Fresh candidate evidence is in
[`repair-3-evidence`](repair-3-evidence/): desktop and phone first screens,
an actual Board 3 win, and a Board 1 loss. The one-click sample was entered,
labelled, reset, and kept separate from regular browser storage during the
claim tests.

## Verification

Fresh GitHub clone at implementation `472f8cc`:

```sh
npm ci
```

installed 164 packages with zero audit vulnerabilities. All 20 commands in
`.factory/claims.json` then passed separately, with status-only logs stored in
the verification environment. The full local checks also passed:

```sh
npm test
npm run test:browser
npm run build
npm audit --audit-level=high
npm run verify:url
npm run test:lighthouse
```

Results: 6 unit tests passed; 42 browser tests passed with 2 intended project
skips; build output includes the static deployment config and designed HTTP
404; audit found zero vulnerabilities; URL structure and console check passed;
Lighthouse scored 98 performance, 100 accessibility, 100 best practices, and
100 SEO. Built gzip sizes are 8,867 bytes JavaScript and 3,959 bytes CSS.

The desktop browser measurement recorded these bottom edges in the 720-pixel
viewport: title 316, audience 391, sample action 462, action explanation 448,
facts 562, game heading 200, and first ring 458. The real Board 3 run reached
the completion panel in 8 of 12 moves. Board 1 exhausted its 10 moves and
reached the loss panel.

## Earlier finding disposition

- R1-01 desktop first-screen content below the fold: fixed by the layout
  change and viewport-bound outcome test.
- V1-01 through V1-09 remain fixed: deployment configuration and designed
  404, 44-pixel touch targets, keyboard focus, previews, 20 unique solvable
  boards, complete claim coverage, phone facts, public offer metadata, and
  dependency audit all remain covered by the passing suites.

## Delivery and known external dependency

Implementation `472f8cc` was pushed to `main` for static deployment. The
factory owns the deployment runtime; no infrastructure configuration was
changed. The public complete-set offer remains **$8 USD once** for all 20
authored boards, with the 17 additional boards locked while billing
registration is pending. Public status-only metadata is at
`/work/.evidence/billing-offer.json`. There is no checkout, entitlement, or
activation claim. The copied catalog description is at
`/work/.evidence/catalog-description.txt`.

The game is static and one-player, so backend, tenant, SQLite, health, and
rate-limit checks do not apply. Multiplayer is not advertised. No paid
deliverable was removed or made free.
