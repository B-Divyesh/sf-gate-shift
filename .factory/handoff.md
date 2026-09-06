# Gate Shift verification 2 handoff

- Date: 2026-09-06
- Work order: `gate-shift-verify-2`
- Verdict: **PASS**
- Findings: **0**
- Untested public claims: **0**
- Live URL: <https://gate-shift.sociobot.in>
- Implementation reviewed: `90c212baeeff94fd6f413d5b5c889add5ace509c`
- Documentation head reviewed: `35844ea2a30d5db8813eb1123d8689a3edf86abf`
- Full report: [`verification-2.md`](verification-2.md)
- Evidence: [`verification-2-evidence`](verification-2-evidence/)

## What was done

This was fresh independent QA. No product code was changed. The live game was
opened in new desktop and Pixel 5 browser contexts. The first screen, isolated
sample, preview, storage separation, reset, keyboard focus, touch sizing,
settings, history, legal routes, designed 404, privacy behavior, reduced
motion, 200% text, offline recovery, deterministic win, finite loss, undo, and
restart were exercised.

Every one of the 20 commands in `.factory/claims.json` was run separately from
a clean GitHub clone. The aggregate suite, build, dependency audit, URL check,
and local/live Lighthouse checks also passed. All nine findings from
`verification-1.md`, including the minor findings, were independently checked
and are resolved.

## Verification summary

```sh
npm ci
npm test
npm run test:browser
npm run build
npm audit --audit-level=high
npm run verify:url -- https://gate-shift.sociobot.in
npm run test:lighthouse
```

- Unit: 6 passed.
- Browser: 42 passed; 2 expected project skips.
- Claims: 20 of 20 commands passed separately.
- Build: JavaScript 8,867 bytes gzip; CSS 3,954 bytes gzip.
- Audit: zero vulnerabilities.
- Live URL check: title/lang/main/h1/alt/console passed.
- Local Lighthouse: 100/100/100/100.
- Live Lighthouse: 100/100/100/100; LCP 852 ms, CLS 0, TBT 46 ms.
- Live throttled Pixel 5 loop: 60.20 fps.
- Live console errors, cookies, and cross-origin game requests: zero.

The deployed JavaScript and CSS exactly match the clean build. Commits after
implementation `90c212b` only change the Playwright execution configuration,
documentation, or evidence, so a new product image is not required.

## Known external dependency

Billing registration is still pending outside this repository. The product is
honest about that state: the complete offer is **20 authored boards for $8 USD
once**, with 3 free and 17 paid boards, no subscription, ads, or move sales.
No checkout or activation success is shown. The free game and isolated sample
work without billing.

There is no backend, account, multiplayer mode, shared state, or public offline
promise. SQLite persistence, tenant isolation, service restart, health, 429,
and room-client checks do not apply.

## Next steps

No product repair is required. The operator may register the already-disclosed
one-time offer later through the approved Sociobot billing API and then run a
separate checkout and entitlement QA cycle before enabling purchase.
