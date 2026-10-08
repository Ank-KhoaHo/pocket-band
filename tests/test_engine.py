"""The sound engine: moods, tempi, rendering, loudness."""

from conftest import render_stats


def ok(s):
    return (not s["nan"] and not s["silent"]
            and abs(s["lufs"] - (-24.0)) <= 0.2 and s["peak"] < -1.0)


def test_page_loads_without_errors(page):
    assert page.evaluate("PB.STYLES.map(s=>s.id)")[:4] == ["folk", "lofi", "orch", "chip"]
    assert len(page.evaluate("PB.MOODS")) >= 12
    assert page.errors == []


def test_existing_loops_still_render(page):
    stats = render_stats(page, "folk", ["gentle", "tense"]) + render_stats(page, "chip", ["epic"])
    for s in stats:
        assert ok(s), s
