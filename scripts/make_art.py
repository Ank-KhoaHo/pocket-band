"""Make pocket-band's pictures: from art/icon.svg, and from a real render of the player.

    python scripts/make_art.py                  write the pictures into art/
    python scripts/make_art.py --options DIR    write every option into DIR, for choosing

What it writes:

    art/icon-512.png    the icon, 512 px square, for a page or a store that wants a bitmap
    art/banner.png      the README's opening picture, 1920 x 600 (960 x 300 at 2x)
    art/cover.png       the link card, 1280 x 640: GitHub's social preview size

and the icon, copied into src/index.html as its favicon, so the one-file player carries it.

THE PLAYER IN THE PICTURES IS A REAL RENDER: src/index.html opened in Chromium, a cassette
picked and a loop playing, then captured. Nothing is drawn to look like the player.

It needs Playwright (requirements-dev.txt), and the network for the page's fonts.
"""

from __future__ import annotations

import argparse
import re
import sys
import tempfile
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "art"
ICON = ART / "icon.svg"
INDEX = ROOT / "src" / "index.html"

# The cassette shown playing in every picture, by its key on the deck (1 to 0), and its mood.
CASSETTE_KEY = "7"
MOOD = "lively"
PLAY_SECONDS = 8

# The claim each picture carries: the player's own tagline, said once more plainly.
NAME = "pocket-band"
CLAIM = "All sound made in code"
DETAIL = "A tape-deck music player. No audio files, nothing to install."

FONTS = ("https://fonts.googleapis.com/css2?family=Michroma&family=Barlow:wght@400;600"
         "&display=swap")

# Two looks for the banner and the cover: the deck's dark case, or its paper label.
LOOKS = {
    "deck": {"ground": "#2b2620", "name": "#f4ead6", "text": "#d6c9b0", "accent": "#ffb347"},
    "paper": {"ground": "#f4ead6", "name": "#2b2620", "text": "#5a4f42", "accent": "#ff6a3d"},
}
LOOK = "deck"

_ICON_LINK_RE = re.compile(r'<link rel="icon" href="[^"]*">')


def favicon_href(svg: str) -> str:
    """The icon as a data URI a <link rel="icon"> can carry: the one-file player has no folder."""
    return "data:image/svg+xml," + urllib.parse.quote(" ".join(svg.split()), safe=" =:/',.-")   # never " or #: one ends the attribute, one the URL


def with_favicon(html: str, svg: str) -> str:
    """The page with its icon link pointing at this icon. Exactly one icon link must exist."""
    found = _ICON_LINK_RE.findall(html)
    if len(found) != 1:
        raise SystemExit(f"make_art: src/index.html has {len(found)} icon links; it needs exactly one")
    return _ICON_LINK_RE.sub(lambda _: f'<link rel="icon" href="{favicon_href(svg)}">', html)


def _composed(look: dict, icon_uri: str, deck_uri: str, width: int, height: int, big: bool) -> str:
    """A page of exactly width x height: the icon, the name and the claim, beside the player."""
    scale = 1.6 if big else 1.0
    return f"""<!doctype html><html><head><meta charset="utf-8">
<link href="{FONTS}" rel="stylesheet"><style>
html,body{{margin:0;width:{width}px;height:{height}px;overflow:hidden;background:{look['ground']}}}
.wrap{{display:flex;height:100%;align-items:center}}
.words{{flex:0 0 {int(width * 0.40)}px;padding-left:{int(40 * scale)}px;box-sizing:border-box}}
.icon{{width:{int(72 * scale)}px;height:{int(72 * scale)}px;display:block;margin-bottom:{int(18 * scale)}px}}
.name{{font:{int(30 * scale)}px Michroma,sans-serif;color:{look['name']};letter-spacing:.02em}}
.claim{{font:600 {int(19 * scale)}px Barlow,sans-serif;color:{look['accent']};margin-top:{int(10 * scale)}px}}
.detail{{font:400 {int(15 * scale)}px Barlow,sans-serif;color:{look['text']};margin-top:{int(6 * scale)}px;
  max-width:{int(width * 0.36)}px;line-height:1.35}}
.shot{{flex:1;height:100%;display:flex;align-items:center;justify-content:center;padding-right:{int(24 * scale)}px}}
.shot img{{max-height:{int(height * 0.86)}px;max-width:100%;border-radius:{int(10 * scale)}px;
  box-shadow:0 {int(8 * scale)}px {int(28 * scale)}px rgba(0,0,0,.45)}}
</style></head><body><div class="wrap">
<div class="words"><img class="icon" src="{icon_uri}" alt="">
<div class="name">{NAME}</div><div class="claim">{CLAIM}</div><div class="detail">{DETAIL}</div></div>
<div class="shot"><img src="{deck_uri}" alt=""></div></div></body></html>"""


def _launch(playwright):
    args = ["--autoplay-policy=no-user-gesture-required"]
    try:
        return playwright.chromium.launch(channel="chrome", args=args)
    except Exception:
        return playwright.chromium.launch(args=args)


def _capture_player(browser, out: Path) -> None:
    """Open the real player, pick a cassette, play a loop, and capture the whole unit."""
    page = browser.new_page(viewport={"width": 1280, "height": 900}, device_scale_factor=2)
    page.goto(INDEX.as_uri())
    page.wait_for_function("window.PB && PB.ready === true", timeout=15000)
    page.locator("body").click(position={"x": 5, "y": 5})
    page.keyboard.press(CASSETTE_KEY)
    page.click(f".pad[data-mood={MOOD}]")         # picking a mood plays it
    page.wait_for_function("PB.player && PB.player.state.playing === true", timeout=60000)
    page.wait_for_timeout(PLAY_SECONDS * 1000)
    page.locator("main.unit").screenshot(path=str(out))
    page.close()


def _shoot(browser, html: str, width: int, height: int, scale: int, out: Path, folder: Path,
           transparent: bool = False) -> None:
    page_file = folder / f"{out.stem}.html"
    page_file.write_text(html, encoding="utf-8", newline="\n")
    page = browser.new_page(viewport={"width": width, "height": height}, device_scale_factor=scale)
    page.goto(page_file.as_uri())
    page.evaluate("document.fonts.ready.then(() => true)")
    page.wait_for_timeout(500)
    page.screenshot(path=str(out), omit_background=transparent)   # an icon keeps its round corners
    page.close()


def make(out_dir: Path, looks: list[str], icons: list[Path]) -> list[Path]:
    """Write the pictures into out_dir; return their paths."""
    from playwright.sync_api import sync_playwright

    out_dir.mkdir(parents=True, exist_ok=True)
    written: list[Path] = []
    with tempfile.TemporaryDirectory() as scratch, sync_playwright() as playwright:
        folder = Path(scratch)
        browser = _launch(playwright)
        try:
            deck = folder / "player.png"
            _capture_player(browser, deck)
            for icon in icons:
                tag = "" if len(icons) == 1 else f"-{icon.stem}"
                icon_uri = icon.resolve().as_uri()
                square = out_dir / f"icon-512{tag}.png"
                _shoot(browser, f'<html><body style="margin:0"><img src="{icon_uri}" width="512" height="512">'
                                f'</body></html>', 512, 512, 1, square, folder, transparent=True)
                written.append(square)
                for look in looks:
                    suffix = tag + ("" if len(looks) == 1 else f"-{look}")
                    banner = out_dir / f"banner{suffix}.png"
                    cover = out_dir / f"cover{suffix}.png"
                    _shoot(browser, _composed(LOOKS[look], icon_uri, deck.as_uri(), 960, 300, False),
                           960, 300, 2, banner, folder)
                    _shoot(browser, _composed(LOOKS[look], icon_uri, deck.as_uri(), 1280, 640, True),
                           1280, 640, 1, cover, folder)
                    written += [banner, cover]
        finally:
            browser.close()
    return written


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Make the icon's bitmap, the banner and the cover.")
    parser.add_argument("--options", metavar="DIR",
                        help="write every look, for each icon given with --icon, into DIR; change nothing in the repo")
    parser.add_argument("--icon", action="append", default=[], help="an icon SVG to try (with --options)")
    args = parser.parse_args(argv)

    if args.options:
        icons = [Path(p) for p in args.icon] or [ICON]
        for path in make(Path(args.options), list(LOOKS), icons):
            print(path)
        return 0

    svg = ICON.read_text(encoding="utf-8")
    INDEX.write_text(with_favicon(INDEX.read_text(encoding="utf-8"), svg), encoding="utf-8", newline="\n")
    for path in make(ART, [LOOK], [ICON]):
        print(path.relative_to(ROOT).as_posix())
    return 0


if __name__ == "__main__":
    sys.exit(main())
