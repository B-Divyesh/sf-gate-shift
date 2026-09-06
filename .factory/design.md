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

On desktop, the first screen uses a 0.9:1.1 copy-to-board split. The title is
capped at 4.3 rem and the copy starts at the top of the live board rather than
centering against its full height. This keeps the job, audience, sample action,
three facts, and visible rings inside a 1280×720 first viewport without hiding
the board behind a landing-page hero.

## Interaction and motion

Selecting a ring gives it a coral outline. Players preview either route before
spending a move. A preview shows the next token and gate positions inside a
pale brass frame. A short clockwise route reverses a linked gate; the long
counterclockwise route does not. Ring/token transitions use 180 ms transform
and color changes. A clamped 60 Hz fixed-step visual loop is paused when the
tab is hidden. The **Use calm motion** setting and
`prefers-reduced-motion` reduce transitions to an instant state. There are no
flashes or looping visual effects.

## Board content and difficulty

Twenty authored boards use three fixed layouts: arc, ladder, and cluster. All
20 logical start states are different. Minimum solutions rise from 6 moves on
Board 1 to 24 on Board 20; Boards 13 and 14 both require 18 moves but use
different states. Early boards allow four spare moves. The last five allow
one. A daily seed chooses a deterministic challenge from the same mechanics.
Six independent breadth-first searches prove each shortest route exactly. The
game is one-player only. It has no endless generator, social ranking, or
multiplayer mode.

## Asset provenance

All visual assets are original, hand-authored SVG and CSS in this repository:
`public/sf-gate-shift-favicon.svg`,
`public/sf-gate-shift-apple-touch-icon.svg`, and
`public/sf-gate-shift-social-card.svg`, plus the CSS ring illustrations. No
stock art, generated images, external images, or third-party assets are used.
The social card is a 1200×630 SVG built from the ring, gate, and token geometry.
