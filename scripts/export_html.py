"""Export the player as ONE self-contained HTML file.

src/index.html loads deck.css and fourteen script files. This folds each of them into the page,
in the same order, so the result plays from anywhere: GitHub Pages, a Release download, or a file
someone saves to disk. The Google Fonts link is the only thing left external; without a network
the page falls back to system fonts and still plays.

Usage: python scripts/export_html.py [OUTPUT]      (default: dist/pocket-band.html)
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"


def inline(body, tag):
    # A literal "</script" or "</style" inside the inlined code would end the tag early.
    closing = "</" + tag
    if closing in body:
        body = body.replace(closing, "<\\/" + tag)
    return body


def export(out: Path) -> Path:
    html = (SRC / "index.html").read_text(encoding="utf-8")

    def css(m):
        body = (SRC / m.group(1)).read_text(encoding="utf-8")
        return "<style>\n" + inline(body, "style") + "</style>"

    def js(m):
        body = (SRC / m.group(1)).read_text(encoding="utf-8")
        return "<script>\n" + inline(body, "script") + "</script>"

    html, n_css = re.subn(r'<link rel="stylesheet" href="([^":]+)">', css, html)
    html, n_js = re.subn(r'<script src="([^":]+)"></script>', js, html)
    if n_css != 1 or n_js < 1:
        sys.exit(f"export_html: expected 1 stylesheet and some scripts, found {n_css} and {n_js}")
    if re.search(r"<script[^>]*\bsrc=", html):
        sys.exit("export_html: a <script src> survived -- its tag is not in the expected form")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html, encoding="utf-8", newline="\n")
    print(f"export_html: wrote {out} ({len(html.encode('utf-8')) // 1024} KB, {n_js} scripts inlined)")
    return out


if __name__ == "__main__":
    export(Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "dist" / "pocket-band.html")
