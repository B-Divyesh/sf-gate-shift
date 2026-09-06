# Gate Shift

Gate Shift is a one-player browser logic puzzle for players who want a short,
finite board instead of an endless loop. Rotate six token rings through fixed
gates, preview linked gate reversals, use undo without penalty, and finish
before the move budget ends.

Each board is designed to take 4–10 minutes.

Live: <https://gate-shift.sociobot.in>

## Who it is for

It is for players looking for an original, tactile browser puzzle rather than a
word, merge, match-three, or infinite retention game. It is not multiplayer,
has no social ranking, and has no endless mode.

## Play

Open the game and select a ring. Preview the short clockwise route to see its
linked gate reversal. Preview the long counterclockwise route to see the ring
turn with no gate change. Apply either preview, then clear all six gates before
the move budget runs out.

- Touch/mouse: tap a ring, then choose a route. Swipe right or left on a ring
  to take the short or long route.
- Keyboard: Up/Down selects a ring; Left/Right takes a long/short route; `U`
  undoes; `R` restarts.
- The game pauses when the tab is hidden. Progress and settings stay in local
  browser storage when it is available.

The free core includes the tutorial and two further authored boards. The 20
distinct boards have a measured difficulty curve and fixed move budgets. The
complete set costs **$8 once** and adds 17 boards. It has no subscription, ads,
or move sales. Billing registration is pending, so no purchase flow is shown
or claimed to work.

## Demo

Use **Try it with sample data** or open `/demo`. It starts a guided `First
signal` board in a separate `demo:gate-shift:*` browser-storage namespace.
The visible demo banner says that sample data is not saved. It offers **Reset
demo** and **Start for real**, which discards sample storage before returning to
the regular game. See
[.factory/demo.md](.factory/demo.md) for the sandbox contract.

## Develop

Prerequisite: Node.js 20 or newer.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Vite serves the browser game with history
fallback during development.

## Verify

```sh
npm test
npm run test:browser
npm run build
```

`npm test` runs deterministic engine tests. `npm run test:browser` starts a
clean Vite server, plays the demo in desktop and phone Chromium contexts, tests
the published claims, checks routes, and runs axe serious/critical checks.
Each command recorded in [.factory/claims.json](.factory/claims.json) can also
run independently from a clean checkout after `npm ci`.

## Deploy

`npm run build` writes the static site and `staticwebapp.config.json` to
`dist/`. The configuration supplies SPA fallback, security headers, a separate
404 page, and immutable hashed assets. Deployment is handled by the factory.
Do not add credentials or payment-provider keys to this repository.

## Privacy and legal pages

The game has no analytics, accounts, ads, tracking cookies, or third-party
scripts. Read the deployed [/privacy](/privacy) and [/terms](/terms) pages for
details. Local browser storage can be removed through browser site-data controls.

## Product records

- Research brief: [.factory/brief.json](.factory/brief.json)
- Design system and asset provenance: [.factory/design.md](.factory/design.md)
- Demo isolation: [.factory/demo.md](.factory/demo.md)
- Claims and sandbox commands: [.factory/claims.json](.factory/claims.json)
- License: [MIT](LICENSE)
