# Gate Shift design system

## Direction

Gate Shift uses a dark enamel control-panel look. Six rings are the whole game,
so the interface makes them feel like physical route selectors instead of
putting them inside generic cards. The dark field keeps attention on the pale
rings, fixed gate brackets, and symbol-marked tokens. This fits a puzzle about
reversible route planning: each changed ring and gate state can be read at a
glance.

## Tokens

| Token | Value |
| --- | --- |
| Background | `#10242b` deep blue-green field |
| Deep surface | `#07171d` |
| Raised surface | `#1e4149` |
| Main text | `#f6f4e9` warm white |
| Secondary text | `#c6d6d1` |
| Ring | `#f3df9e` pale brass |
| Token / success | `#76d2c4` sea glass |
| Gate warning | `#ffb05a` amber |
| Short-route accent | `#ff7657` coral |
| Focus | `#fff1b0` |

Warm text on the deep field and dark text on coral pass the 4.5:1 text target.
Every token has a distinct symbol (`○ □ △ ◇ ✦ ⬡`) and every gate has a bracket
direction, so color is never required.

## Type, spacing, and shape

The display voice is the local `Trebuchet MS` stack for compact, slightly
mechanical headings. The body uses the local rounded system stack for legible
controls. No font files or font CDNs load. Spacing follows a 4/8 px rhythm.
The game uses circles, brackets, thin grid marks, and offset hard shadows;
information sections use open space rather than repeated feature cards.

## Interaction and motion

Selecting a ring gives it a coral outline. A short clockwise route reverses a
linked gate; the long counterclockwise route does not. Ring/token transitions
use 180 ms transform and color changes. A clamped 60 Hz fixed-step visual loop
is paused when the tab is hidden. The **Use calm motion** setting and
`prefers-reduced-motion` reduce transitions to an instant state. There are no
flashes or looping visual effects.

## Board content and difficulty

Twenty authored boards use three fixed layouts: arc, ladder, and cluster.
Boards 1–3 teach selection, one linked reversal, then a six-gate route. Later
boards add longer mixed sequences and tighter budgets. A daily seed chooses a
deterministic challenge from the same mechanics. Each board is checked by a
breadth-first solver before it is offered; the listed move budget is at least
one valid route. The game is one-player only. It has no endless generator,
social ranking, or multiplayer mode.

## Asset provenance

All visual assets are original, hand-authored SVG and CSS in this repository:
`public/favicon.svg`, `public/apple-touch-icon.svg`, and
`public/social-card.svg`, plus the CSS ring illustrations. No stock art,
generated images, external images, or third-party assets are used. The social
card is a 1200×630 SVG composed from the same ring, gate, and token geometry.
