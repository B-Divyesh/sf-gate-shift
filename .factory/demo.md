# Demo sandbox

Open `https://gate-shift.sociobot.in/demo` or select **Try it with sample
data** on the first screen.

The sample is the guided **First signal** practice board. It starts with six
visible symbol-marked tokens, linked gate states, an undo control, and a finite
move budget. It is playable immediately with touch, mouse, or keyboard.

Demo progress is stored only under the `demo:gate-shift:*` local-storage
namespace. Regular game progress uses `gate-shift:*`; demo mode never reads or
writes it. The persistent demo banner has **Reset demo**, which discards only
the demo namespace, and **Start for real**, which returns to the regular game.
