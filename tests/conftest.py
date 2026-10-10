"""Browser fixtures for the player's tests.

The player only exists inside a browser: every sound is rendered by the Web Audio API.
So these tests drive a real headless Chrome through Playwright, opening src/index.html
straight from disk -- the same way a person opens it.
"""

import json
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "src" / "index.html"
ARGS = ["--autoplay-policy=no-user-gesture-required"]


@pytest.fixture(scope="session")
def browser():
    # Imported here, not at the top: the docs-guard CI job installs only pytest and
    # loads this file too, so a top-level import would crash it.
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        try:
            b = p.chromium.launch(channel="chrome", args=ARGS)
        except Exception:
            b = p.chromium.launch(args=ARGS)  # CI: Playwright's own Chromium
        yield b
        b.close()


def open_page(browser, init_script=None, viewport=None, url=None):
    ctx = browser.new_context(viewport=viewport or {"width": 1280, "height": 800},
                              accept_downloads=True)
    if init_script:
        ctx.add_init_script(init_script)
    pg = ctx.new_page()
    pg.errors = []
    pg.on("pageerror", lambda e: pg.errors.append(str(e)))
    pg.on("console", lambda m: pg.errors.append(m.text) if m.type == "error" else None)
    pg.goto(url or INDEX.as_uri())
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


PLAY_ONE_JS = """async ([name, midi, dur, secs]) => {
  const SR = PB.SR, ctx = new OfflineAudioContext(2, Math.ceil(secs * SR), SR);
  const S = {swing: {def: .5}, grid: 8, ir: {sec: .5, damp: .5, pre: .01}, revRet: 0, parts: {}};
  const C = PB.MOODS[PB.moodIndex.gentle], X = PB.makeX(ctx, S, C, 480, 'all', 7), I = PB.inst;
  const out = X.out('t'), n = {m: midi, t: .05, d: dur, v: .8, out: out};
  const [kind, arg] = name.includes(':') ? name.split(':') : [null, name];
  if (kind === 'W') I.W(arg)(X, n, {});
  else if (kind === 'M') I.M(arg)(X, n, {});
  else if (kind === 'D') I.drum(X, arg, .05, .9, out, {});
  else if (kind === 'T') { if (arg === 'drone') I.drone(X, 't', midi); else I[arg](X, 't') }
  else I[arg](X, n, {});
  const buf = await ctx.startRendering(), d = buf.getChannelData(0);
  let pk = 0, tail = 0, finite = true;
  const t0 = d.length - Math.round(.2 * SR);
  for (let i = 0; i < d.length; i++) { const a = Math.abs(d[i]); if (!isFinite(a)) finite = false;
    if (a > pk) pk = a; if (i >= t0 && a > tail) tail = a }
  return {finite: finite, peakDb: 20 * Math.log10(pk + 1e-12), tailDb: 20 * Math.log10(tail + 1e-12)} }"""


def play_one(page, name, midi=60, dur=1.0, secs=4.0):
    """Render one note (or one drum hit, or a texture) of an instrument, alone, and measure it."""
    return page.evaluate(PLAY_ONE_JS, [name, midi, dur, secs])


def js(page, expr):
    return page.evaluate(expr)


def dump(obj):
    return json.dumps(obj, indent=1)
