"""Browser fixtures for the player's tests.

The player only exists inside a browser: every sound is rendered by the Web Audio API.
So these tests drive a real headless Chrome through Playwright, opening src/index.html
straight from disk -- the same way a person opens it.
"""

import json
from pathlib import Path

import pytest
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "src" / "index.html"
ARGS = ["--autoplay-policy=no-user-gesture-required"]


@pytest.fixture(scope="session")
def browser():
    with sync_playwright() as p:
        try:
            b = p.chromium.launch(channel="chrome", args=ARGS)
        except Exception:
            b = p.chromium.launch(args=ARGS)  # CI: Playwright's own Chromium
        yield b
        b.close()


def open_page(browser, init_script=None, viewport=None):
    ctx = browser.new_context(viewport=viewport or {"width": 1280, "height": 800},
                              accept_downloads=True)
    if init_script:
        ctx.add_init_script(init_script)
    pg = ctx.new_page()
    pg.errors = []
    pg.on("pageerror", lambda e: pg.errors.append(str(e)))
    pg.on("console", lambda m: pg.errors.append(m.text) if m.type == "error" else None)
    pg.goto(INDEX.as_uri())
    pg.wait_for_function("window.PB && PB.ready === true", timeout=15000)
    return pg


@pytest.fixture
def page(browser):
    pg = open_page(browser)
    yield pg
    pg.context.close()


RENDER_JS = """async ([sid, moods]) => {
  const si = PB.styleIndex[sid], out = [];
  for (const id of moods) {
    const mi = PB.moodIndex[id], r = await PB.getLoop(si, mi);
    const ch = [r.buf.getChannelData(0), r.buf.getChannelData(1)];
    let nan = false, pk = 0;
    for (const d of ch) for (let i = 0; i < d.length; i++) {
      const a = d[i]; if (!isFinite(a)) { nan = true; break } if (Math.abs(a) > pk) pk = Math.abs(a) }
    const peak = 20 * Math.log10(pk + 1e-12);
    out.push({style: sid, mood: id, bpm: r.bpm, lufs: PB.lufs(ch, PB.SR), peak: peak,
              nan: nan, silent: peak < -60, events: r.ev.length});
  }
  return out }"""


def render_stats(page, style_id, mood_ids):
    """Render each loop and measure it in the page: loudness, peak, NaN, silence, events."""
    return page.evaluate(RENDER_JS, [style_id, list(mood_ids)])


def js(page, expr):
    return page.evaluate(expr)


def dump(obj):
    return json.dumps(obj, indent=1)
