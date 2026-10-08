"""Every new style plays every mood: not silent, no NaN, loudness-matched, and fast moods above 200 BPM."""

import pytest

from conftest import render_stats
from test_engine import ORDER, ok

NEW_STYLES = ["ambient", "jazz", "synthwave", "tavern", "bossa", "zen"]
ARRS = {"gentle", "quiet", "theme", "lively", "stroll", "warm", "tense", "epic"}


@pytest.mark.parametrize("sid", NEW_STYLES)
def test_style_plays_every_mood(page, sid):
    stats = render_stats(page, sid, ORDER)
    for s in stats:
        assert ok(s), s
        assert s["events"] >= 16, s
    assert stats[ORDER.index("rush")]["bpm"] > 200 and stats[ORDER.index("chase")]["bpm"] > 200
    assert len({round(s["bpm"]) for s in stats}) >= 8
    assert page.errors == []


@pytest.mark.parametrize("sid", NEW_STYLES)
def test_style_metadata(page, sid):
    s = page.evaluate(f"(()=>{{const s=PB.STYLES[PB.styleIndex['{sid}']];"
                      "return {label:s.label,short:s.short,stripe:s.stripe,bpm:s.bpm,fast:s.fast}})()")
    assert s["label"] and s["short"] and s["stripe"].startswith("#")
    assert set(s["bpm"]) == ARRS
    assert s["fast"]["rush"] > 200 and s["fast"]["chase"] > 200


def test_snap_penta(page):
    assert page.evaluate("[PB.snapPenta(65,0,false),PB.snapPenta(66,0,false),PB.snapPenta(64,0,true)]") == [64, 67, 63]


def test_zen_stays_pentatonic(page):
    bad = page.evaluate("""(async()=>{const si=PB.styleIndex.zen,out=[];
      for(const id of ['gentle','spooky','epic']){const mi=PB.moodIndex[id],C=PB.MOODS[mi],r=await PB.getLoop(si,mi);
        const minor=['aeo','harm','dor','phr'].includes(C.mode),set=minor?[0,3,5,7,10]:[0,2,4,7,9];
        r.ev.forEach(e=>{if(e.m!=null&&!set.includes(((e.m-C.key)%12+12)%12))out.push([id,e.c,e.m])})}
      return out})()""")
    assert bad == []
