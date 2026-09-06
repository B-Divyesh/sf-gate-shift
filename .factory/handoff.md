# Gate Shift repair 4 handoff

- Date: 2026-09-06
- Work order: `gate-shift-repair-4`
- Implementation and documentation verification SHA: `515899a533e8519d1b7016eced5b764dcb4d6370`
- This handoff is a later report-only commit.
- Live URL: <https://gate-shift.sociobot.in>

## What changed

**Start for real** now clears every `demo:gate-shift:*` key before entering the
regular game. **Reset demo** uses the same namespace-wide cleanup. This fixes
the prior retained sample run and settings while preserving all regular game
storage.

The `@claim:demo-isolated` browser regression now proves this full outcome:
it starts a changed sample, resets it, changes it again, exits to the regular
game, requires the complete demo namespace to be empty, then re-enters a
clean 10-move sample. It also checks a regular-data sentinel stays unchanged.

README now states the researched design target: each board is designed for a
4–10 minute session. This is an intended session length, not a measured
runtime promise. Demo and privacy documentation now state that Start for real
discards sample storage.

The public one-time offer metadata was written to
`/work/.evidence/billing-offer.json`, and the verb-first catalog description
was copied to `/work/.evidence/catalog-description.txt`. Neither file includes
credentials or private billing data.

## Verification

From a clean dependency install (`npm ci`, 164 packages, zero
vulnerabilities), all checks passed:

| Check | Result |
| --- | --- |
| `npm test` | Pass: 6 deterministic engine tests |
| Each of 20 `.factory/claims.json` commands | Pass separately |
| `npm run test:browser` | Pass: 42 tests; 2 intentional cross-profile skips |
| `npm run build` | Pass; `dist/` produced; JS 8,926 gzip bytes; CSS 3,959 gzip bytes |
| `npm audit --audit-level=high` | Pass: zero vulnerabilities |
| `npm run verify:url` | Pass: title, `lang`, one main, one h1, alt text, no console errors |
| `npm run test:lighthouse` | Pass: 100 performance, 100 accessibility, 100 best practices, 100 SEO |
| `npm run verify:url -- https://gate-shift.sociobot.in` | Pass |
| Fresh live Lighthouse | Pass: 100 performance, 100 accessibility, 100 best practices, 100 SEO |

The static artifact was deployed with the product-scoped factory helper after
the build passed. The deployed JavaScript is the candidate bundle
`index-siD4A8Dl.js`; its SHA-256 is
`f8ecd97179a0acc953355a42d388cd4383c27c50f3781d284d04627fe7558adc`, matching
`dist/`. The unchanged deployed CSS hash is
`e4e86943a6e52c66f3110e5046131b0c910c0b05a03325d322103b436f132c4c`.

Fresh HTTPS browser checks used separate desktop and Pixel 5 contexts:

- Desktop first screen showed the job **Rotate rings to guide tokens through
  gates**, its logic-puzzle audience, **Try it with sample data**, all three
  facts, and playable rings without scrolling.
- The one-click desktop sample showed its persistent label, six-token board,
  route preview, and 10-move budget. After a real move, **Start for real**
  left zero `demo:gate-shift:*` keys, left the regular sentinel unchanged, and
  a later `/demo` visit began clean at 10 moves.
- Visible safe moves reached the actual desktop completion screen in 6 of 10
  moves. A separate 10-move live run reached the loss panel, and undo restored
  one move. The phone run reached the same real completion screen.
- Live axe scans on `/`, `/demo`, `/privacy`, `/terms`, and `/not-a-board`
  had zero serious or critical violations. Normal demo play made same-origin
  requests only and set zero cookies.
- Route titles and h1s passed on all five routes. Four HTTP navigation links
  returned 200; the skip link is an in-page `#main` anchor. A missing scoped
  PNG returned the designed Gate Shift page with HTTP 404 and a recovery link.
- A live Pixel 5 profile under 4× CPU throttling measured 60.27 fps over two
  seconds, above the 55 fps claim threshold.

Current evidence is in `.factory/repair-4-evidence/`:

- `live-desktop-first-screen.png`
- `live-desktop-demo.png`
- `live-desktop-win.png`
- `live-desktop-loss.png`
- `live-phone-first-screen.png`
- `live-phone-win.png`
- `live-http-404.png`

## Earlier finding disposition

| Finding | Current disposition |
| --- | --- |
| V1-01 deployment config and designed 404 | Fixed; built and live config contain CSP, Permissions-Policy, immutable assets, and designed HTTP 404. |
| V1-02 small touch targets | Fixed; phone suite passes target measurements. |
| V1-03 keyboard focus | Fixed; browser suite passes preview and settings focus paths. |
| V1-04 missing route previews | Fixed; both previews remain move-free until applied. |
| V1-05 duplicate/weak paid boards | Fixed; unit solver proves 20 distinct, budgeted authored starts. |
| V1-06 incomplete claim coverage | Fixed; 20 exact tagged claim commands passed separately. |
| V1-07 phone first-screen facts | Fixed; facts and live board are in the fresh phone viewport. |
| V1-08 public billing metadata | Fixed; public status-only metadata exists at the required evidence path. |
| V1-09 development advisories | Fixed; current audit has zero vulnerabilities. |
| R1-01 desktop first-screen content below fold | Fixed; fresh 1280×720 check passes. |
| R3-01 demo state persisted after Start for real | Fixed; live namespace cleanup and clean re-entry were verified. |
| R3-02 README session length omitted | Fixed; README states the 4–10 minute design target. |

## Remaining external dependency

Billing registration is still pending. The free three boards work, while the
complete 20-board set remains accurately advertised as **$8 once** with no
subscription, ads, or move sales. No checkout, activation, or entitlement
success is claimed or tested.
