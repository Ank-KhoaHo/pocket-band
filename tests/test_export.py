"""scripts/export_html.py: the whole player as one self-contained HTML file."""

import re
import subprocess
import sys

from conftest import ROOT, open_page, render_stats

OUT = ROOT / "dist" / "test-export" / "pocket-band.html"


def export():
    subprocess.run([sys.executable, str(ROOT / "scripts" / "export_html.py"), str(OUT)], check=True)
    return OUT.read_text(encoding="utf-8")


def test_export_inlines_every_local_file():
    html = export()
    assert not re.search(r"<script[^>]*\bsrc=", html), "a <script src> was left in"
    assert 'href="deck.css"' not in html
    assert html.count("<script>") == 14  # engine, instruments, 10 styles, player, deck
    assert "fonts.googleapis.com" in html  # the one external link, on purpose


def test_exported_file_plays_on_its_own(browser):
    export()
    page = open_page(browser, url=OUT.as_uri())
    assert page.locator(".tape").count() == 10 and page.locator(".pad").count() == 18
    s = render_stats(page, "folk", ["lively"])[0]
    assert not s["nan"] and not s["silent"] and abs(s["lufs"] + 24) <= 0.2
    assert page.errors == []
    page.context.close()
