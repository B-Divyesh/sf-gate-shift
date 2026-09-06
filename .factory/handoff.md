# Gate Shift review 3 handoff

- Date: 2026-09-06
- Work order: `gate-shift-review-3`
- Verdict: **FAIL** — 2 findings; 0 untested public claims
- Implementation reviewed: `472f8cca5b863a62186b851414a6a4d9b2d8a74e`
- Documentation head reviewed: `594f4660788a45d1a8d5896ca7216615df162ffa`
- Live URL: <https://gate-shift.sociobot.in>

## What was done

No product code changed. A fresh clean clone at `594f466` was installed with
`npm ci`. All 20 declared claim commands ran separately, and the aggregate
unit/browser suites, build, audit, URL verifier, and local/live Lighthouse
checks passed. The candidate build hashes exactly match the live JavaScript
and CSS.

Fresh 1280×720 desktop and Pixel 5 contexts exercised the first screen,
one-click sample, route previews, reset and namespace isolation, daily mode,
keyboard/touch/swipe input, persistence, pause/resume, invalid-state recovery,
settings, reduced motion, 200% text, a deterministic win, finite loss and undo,
legal routes, history, links, accessibility, privacy requests, security
headers, the designed HTTP 404, and throttled frame rate.

The detailed results and evidence are in `.factory/review-3.md` and
`.factory/review-3-evidence/`.

## Findings to repair

1. **R3-01 major:** **Start for real** leaves the completed demo run and demo
   settings in `demo:gate-shift:*`. Discard that namespace on exit, and extend
   `@claim:demo-isolated` through exit and clean re-entry.
2. **R3-02 minor:** state the intended 4–10 minute level length in README. Add
   a measured claim only if the duration is presented as measured behavior.

## How to verify

```sh
npm ci
npm test
npm run test:browser
npm run build
npm audit --audit-level=high
npm run verify:url -- https://gate-shift.sociobot.in
npm run test:lighthouse
```

Also run each command in `.factory/claims.json` separately. For R3-01, start a
fresh demo, make a move, select **Start for real**, verify every
`demo:gate-shift:*` key is absent, then reopen `/demo` and confirm a clean
10-move sample. Recheck both live client sizes after deployment.

## External status

Billing registration remains pending and is accurately disclosed. Public
status-only offer metadata is written to
`/work/.evidence/billing-offer.json`. No credential, checkout, activation, or
entitlement result was inspected or recorded. The static one-player product
has no backend or multiplayer system to verify.
