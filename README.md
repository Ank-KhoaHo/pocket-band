# pocket-band

A music player whose every tune is composed in code, in the browser, with the Web Audio API.

## What this is

A music player that looks like a tape deck. Every note is composed and synthesised in the
browser by the Web Audio API: no audio files, no samples, nothing to install. Plucked strings,
pianos, mallets, winds, synths and drums are all made in code, then mixed with a generated
reverb. Use it as background music, or to pick loops for a game.

## Play it

**Play it online:** <https://ank-khoaho.github.io/pocket-band/> — or download
`pocket-band.html` from the [latest release](https://github.com/Ank-KhoaHo/pocket-band/releases/latest)
and open it: it is the whole player in one file.

To run it from a clone, open [`src/index.html`](src/index.html) in a browser, pick a cassette and a mood, and press
**Play**. The only thing it fetches is its fonts.

- **10 cassettes (styles):** folk, lo-fi, orchestra, chiptune, ambient, jazz café, synthwave,
  tavern, bossa and zen.
- **18 moods** in 5 groups: Calm, Bright, Moody, Bold and Fast. Each is the same 16-bar tune in
  its own key, mode, tempo and band. **Rush** and **Chase** run above 200 BPM.
- **Play modes:** Repeat, Through (every mood of a cassette), All (every mood, then the next
  cassette), Shuffle — changing after 1, 2 or 4 loops, on the loop's end.
- **Layers:** Full, or the loop split into parts — Calm, Build, Tense — that change on the beat.
- **⤓ WAV:** download the loop you hear as a seamless 16-bit stereo WAV, ready for a game.
- **Mixtapes:** 5 sets of moods played back to back, each change on a bar line.
- **♥ and My plays:** mark favourites; your most-played loops are counted in your browser only.

Keys: `1`-`0` cassette · `←` `→` mood · `Space` play/stop · `N` next · `M` play mode ·
`L` layers · `V` roll/scope · `F` favourite · `D` download · `Esc` stop.

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
