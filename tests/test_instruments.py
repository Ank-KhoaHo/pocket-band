"""The new instruments: each one sounds, stays finite, and falls silent after its note."""

import pytest

from conftest import play_one

NOTE_INSTRUMENTS = ["NYLON", "LUTE", "KOTO", "PIANO", "SUPERSAW", "SAWARP", "W:recorder",
                    "W:shakuhachi", "W:mutetrumpet", "W:analogbrass", "M:bowl", "M:templebell"]
DRUMS = ["ride", "frame", "surdo", "taiko", "gsnare"]
LONG = {"M:bowl": 12.0, "M:templebell": 12.0}


@pytest.mark.parametrize("name", NOTE_INSTRUMENTS + ["D:" + d for d in DRUMS])
def test_instrument_sounds_and_stops(page, name):
    r = play_one(page, name, midi=60, dur=1.0, secs=LONG.get(name, 4.0))
    assert r["finite"], r
    assert r["peakDb"] > -40, r
    assert r["tailDb"] < r["peakDb"] - 40, r


@pytest.mark.parametrize("name", ["T:wind_tex", "T:drone"])
def test_texture_sounds(page, name):
    r = play_one(page, name, midi=38, dur=1.0, secs=4.0)
    assert r["finite"] and r["peakDb"] > -50, r


def test_textures_are_registered_with_the_engine(page):
    assert page.evaluate("['wind_tex','drone','rain'].every(k=>typeof PB.ns[k]==='function')")
