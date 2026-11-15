"""The icon, the banner and the cover: they exist, have their shapes, and are shown where they belong.

Every app here has all three. The icon is the player's favicon; the banner opens the README;
the cover is what a shared link shows. scripts/make_art.py makes the bitmaps, from art/icon.svg
and a real render of the player.
"""

import re
import struct
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import make_art  # noqa: E402

ART = ROOT / "art"
SITE = "https://ank-khoaho.github.io/pocket-band/"


def _png_size(path: Path) -> tuple[int, int]:
    """Width and height from a PNG's header, without an image library."""
    head = path.read_bytes()[:24]
    assert head[:8] == b"\x89PNG\r\n\x1a\n", f"{path.name} is not a PNG"
    return struct.unpack(">II", head[16:24])


def _head(html: str) -> str:
    return html.split("</head>", 1)[0]


def test_the_three_pictures_exist():
    missing = [name for name in ("icon.svg", "icon-512.png", "banner.png", "cover.png") if not (ART / name).is_file()]
    assert missing == [], f"art/ lacks {missing}: run python scripts/make_art.py"


def test_the_icon_is_square():
    svg = (ART / "icon.svg").read_text(encoding="utf-8")
    box = re.search(r'viewBox="0 0 (\d+) (\d+)"', svg)
    assert box and box.group(1) == box.group(2), "art/icon.svg is not square"
    assert _png_size(ART / "icon-512.png") == (512, 512)


def test_the_banner_is_wide_and_the_cover_is_githubs_size():
    width, height = _png_size(ART / "banner.png")
    assert width >= 960 and 2.8 <= width / height <= 3.4, (width, height)
    assert _png_size(ART / "cover.png") == (1280, 640), "GitHub's social preview is 1280 x 640"


def test_the_readme_opens_with_the_banner():
    """The banner is the first thing in the README, above the name. The icon is the player's
    favicon; the README does not repeat it."""
    readme = (ROOT / "README.md").read_text(encoding="utf-8")
    opening = readme.split("\n## ", 1)[0]
    tag = re.search(r'<img src="art/banner\.png"[^>]*>', opening)
    assert tag, "the README does not show art/banner.png before its first section"
    assert opening.lstrip().startswith(tag.group(0)), "the banner is not the first thing in the README"
    alt = re.search(r'alt="([^"]+)"', tag.group(0))
    assert alt and len(alt.group(1).split()) >= 3, "art/banner.png has no alt text a reader can use"


def test_the_player_carries_the_icon_as_its_favicon():
    """The favicon is a copy of art/icon.svg inside the page, so the one-file player has it too.
    A changed icon must be copied again, by make_art.py; this fails until it is."""
    html = (ROOT / "src" / "index.html").read_text(encoding="utf-8")
    links = re.findall(r'<link rel="icon" href="([^"]*)">', html)
    assert links == [make_art.favicon_href((ART / "icon.svg").read_text(encoding="utf-8"))], (
        "src/index.html's favicon is not art/icon.svg: run python scripts/make_art.py"
    )


def test_a_shared_link_shows_the_cover():
    head = _head((ROOT / "src" / "index.html").read_text(encoding="utf-8"))
    for prop, value in (("og:image", SITE + "cover.png"), ("og:url", SITE), ("og:title", None),
                        ("og:description", None)):
        tag = re.search(rf'<meta property="{prop}" content="([^"]+)">', head)
        assert tag, f"src/index.html has no {prop}"
        if value:
            assert tag.group(1) == value, f"{prop} is {tag.group(1)}"
    assert re.search(r'<meta name="twitter:card" content="summary_large_image">', head)


def test_the_site_serves_the_cover_it_names():
    pages = (ROOT / ".github" / "workflows" / "pages.yml").read_text(encoding="utf-8")
    assert re.search(r"^\s*run: cp art/cover\.png site/cover\.png\s*$", pages, re.M), (
        "the page names cover.png on the site, and the pages workflow does not put it there"
    )


def test_the_icon_survives_inside_an_attribute():
    """A raw quote ends the href; a raw # ends the URL. Either cuts the icon short."""
    href = make_art.favicon_href('<svg viewBox="0 0 8 8"><rect fill="#2b2620"/></svg>')
    assert '"' not in href and "#" not in href, href
    page = make_art.with_favicon('<link rel="icon" href="data:,">', '<svg fill="#fff"/>')
    assert make_art.with_favicon(page, "<svg/>").count('rel="icon"') == 1, "the page's icon link broke"


def test_a_page_without_exactly_one_icon_link_is_refused():
    import pytest
    for html in ("<head></head>", '<link rel="icon" href="a"><link rel="icon" href="b">'):
        with pytest.raises(SystemExit):
            make_art.with_favicon(html, "<svg/>")
    assert make_art.with_favicon('<link rel="icon" href="data:,">', "<svg/>") == (
        f'<link rel="icon" href="{make_art.favicon_href("<svg/>")}">')
