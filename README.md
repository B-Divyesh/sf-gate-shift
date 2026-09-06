# Gate Shift

Gate Shift is a one-player browser logic puzzle for players who want a short,
finite board instead of an endless loop. Rotate six token rings through fixed
gates, plan linked gate reversals, use undo without penalty, and finish before
the move budget ends. An intended board session is 4–10 minutes.

Live: <https://gate-shift.sociobot.in>

## Who it is for

It is for players looking for an original, tactile browser puzzle rather than a
word, merge, match-three, or infinite retention game. It is not multiplayer,
has no social ranking, and has no endless mode.

## Play

Open the game and select a ring. Take the short clockwise route to turn it and
reverse its linked gate, or take the long counterclockwise route to turn it
without a reversal. Clear all six gates before the listed move budget runs out.

- Touch/mouse: tap a ring, then choose a route. Swipe right or left on a ring
  to take the short or long route.
- Keyboard: Up/Down selects a ring; Left/Right takes a long/short route; `U`
  undoes; `R` restarts.
- The game pauses when the tab is hidden. Progress and settings stay in local
  browser storage when it is available.

The free core includes the tutorial and two further authored boards. The
complete set contains 20 authored boards for **$8 once**; it adds 17 boards and
does not include a subscription, ads, or move sales. Billing registration is
currently pending, so no purchase flow is shown or claimed to work.

## Demo

Use **Try it with sample data** or open `/demo`. It starts a guided `First
signal` board in a separate `demo:gate-shift:*` browser-storage namespace.
The visible demo banner offers **Reset demo** and **Start for real**. See
[.factory/demo.md](.factory/demo.md) for the sandbox contract.

## Develop

Prerequisite: Node.js 20 or newer.

```sh
npm install
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
run independently from a clean checkout after `npm install`.

## Deploy

`npm run build` writes the static site to `dist/`. The repository includes
`staticwebapp.config.json` for static deployment: SPA navigation fallback,
security headers, a separate 404 page, and immutable static assets. Deployment
is handled by the factory; do not add credentials or payment-provider keys to
this repository.

## Privacy and legal pages

The game has no analytics, accounts, third-party scripts, or server-side game
profiles. Read the deployed [/privacy](/privacy) and [/terms](/terms) pages for
details. Local browser storage can be removed through browser site-data
controls.

## Product records

- Research brief: [.factory/brief.json](.factory/brief.json)
- Design system and asset provenance: [.factory/design.md](.factory/design.md)
- Demo isolation: [.factory/demo.md](.factory/demo.md)
- Claims and sandbox commands: [.factory/claims.json](.factory/claims.json)
- License: [MIT](LICENSE)
