# Gate Shift review 1 handoff

- Date: 2026-09-06
- Work order: `gate-shift-review-1`
- Verdict: **FAIL**
- Findings: **1**
- Untested public claims: **0**
- Live URL: <https://gate-shift.sociobot.in>
- Implementation reviewed: `90c212baeeff94fd6f413d5b5c889add5ace509c`
- Documentation head reviewed: `23a1cc78281120492a5ac848de241b77894af30f`
- Full report: [`review-1.md`](review-1.md)
- Evidence: [`review-1-evidence`](review-1-evidence/)

## What was done

This was an independent strict review. No product code was changed. A fresh
GitHub checkout at `23a1cc7` was installed with `npm ci`; all 20 declared
claim commands were run separately and passed. The unit suite, full browser
suite, production build, audit, live URL check, live route/header checks,
live axe scans, and local Lighthouse check passed.

Fresh desktop and Pixel 5 browser clients entered the real one-click sample,
checked its persistent label, preview, and reset, completed Board 3 through
visible controls, and reached a real loss followed by undo recovery. The
current live assets match the clean candidate build byte for byte.

## Finding

R1-01 is a major desktop first-screen failure. At 1280 by 720, the h1 is 501
pixels tall and pushes the audience, primary **Try it with sample data**
action, and three required facts below the fold. The phone first screen fits
all of this content; desktop does not. The repair must fit the job, audience,
action, facts, and visible game content into the desktop first screen, with a
viewport-bound desktop test to prevent recurrence.

## How to verify after repair

```sh
npm ci
npm test
npm run test:browser
npm run build
npm audit --audit-level=high
npm run verify:url -- https://gate-shift.sociobot.in
npm run test:lighthouse
```

Also rerun every `test` entry in `.factory/claims.json` separately from a
fresh checkout. On a fresh 1280 by 720 desktop browser, verify that the title,
audience, sample action with its explanation, all three facts, and meaningful
game content are visible before scrolling. Then rerun the phone first-screen,
demo/reset, win, loss/recovery, legal, 404, axe, and live privacy checks.

## Known external dependency

Billing registration remains pending outside this repository. This is not the
review failure: the page accurately presents the complete 20-board set at $8
once, keeps the 17 paid boards locked, and does not claim checkout or
activation success. There is no backend, account, multiplayer, or SQLite
surface to verify.
