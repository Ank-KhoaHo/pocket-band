# pocket-band

A music player whose every tune is composed in code, in the browser, with the Web Audio API.

## What this is

A music player in one web page. Every note is composed and synthesised in the browser by the
Web Audio API: no audio files, no samples, nothing to install. Plucked strings, FM electric
piano, mallets, winds and drums are all made in code, then mixed with a generated reverb.

## Play it

Open [`src/index.html`](src/index.html) in a browser and press **Play**. The only thing it
fetches is the Open Sans font.

- **4 styles:** cozy acoustic folk, lo-fi hop, whimsical orchestral, chiptune-folk.
- **12 moods** in 4 groups (Calm, Bright, Moody, Bold). Each is the same 16-bar tune in its own
  key, mode, tempo and band.
- **Play modes:** Repeat, Play through, Play all, Shuffle; change after 1, 2 or 4 loops.
- **Journeys:** 5 sets of moods played back to back, each change on a bar line.
- **Live layers:** the current mood split into parts — Calm, Build, Tense.

Keys: `1`-`4` style · `←` `→` mood · `Space` play/stop · `N` next · `M` play mode · `Esc` stop.

Each loop takes a few seconds to build the first time it plays. Every loop is matched to the
same loudness (−24 LUFS), so switching never jumps in volume.

## Where things live

| File | What it holds |
|---|---|
| [PUBLIC.md](PUBLIC.md) | why some material is deliberately not published here |
| [CONTRIBUTING.md](CONTRIBUTING.md) | how to build and test it, and what gets rejected |
| [SECURITY.md](SECURITY.md) | how to report a vulnerability, and what is not one |
| [ROADMAP.md](ROADMAP.md) | direction, and the things deliberately not coming |
| [LICENSE](LICENSE) | what you may do with this |

## Status

pocket-band is new. The music and the code are licensed under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/): use, change and share them, even
commercially, as long as you credit **"pocket-band" by Khoa Ho**. See [LICENSE](LICENSE).
