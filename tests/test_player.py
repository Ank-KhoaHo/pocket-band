"""PB.player: playback, play modes, layers, mixtapes, favourites, plays and saved settings."""

from conftest import open_page

WAIT_PLAYING = "PB.player.state.playing && !PB.player.state.busy"


def wait_playing(page, timeout=60000):
    page.wait_for_function(WAIT_PLAYING, timeout=timeout)


def mood(page, mid):
    return page.evaluate(f"PB.moodIndex['{mid}']")


def test_select_plays_and_reports(page):
    page.evaluate(f"PB.player.select(0,{mood(page, 'lively')})")
    wait_playing(page)
    now = page.evaluate("({bpm:PB.player.now().loop.bpm,want:PB.bpmOf(PB.STYLES[0],PB.MOODS[PB.moodIndex.lively])})")
    assert now["bpm"] == now["want"]
    assert page.errors == []


def test_play_through_advances_on_the_boundary(page):
    lively = mood(page, "lively")
    page.evaluate(f"PB.player.setMode('next');PB.player.setReps(1);PB.player.select(0,{lively})")
    wait_playing(page)
    page.evaluate("PB.player._skipToEnd(1)")
    page.wait_for_function(f"PB.player.state.mi==={lively + 1} && PB.player.state.playing && !PB.player.state.busy",
                           timeout=60000)


def test_play_all_wraps_to_next_style(page):
    last = page.evaluate("PB.MOODS.length-1")
    page.evaluate(f"PB.player.setMode('all');PB.player.select(0,{last})")
    wait_playing(page)
    assert page.evaluate("PB.player.state.next") == {"si": 1, "mi": 0}


def test_rapid_selection_plays_only_the_last(page):
    page.evaluate("""(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));
      PB.player.select(0,PB.moodIndex.gentle);await w(20);PB.player.select(1,PB.moodIndex.quiet);await w(20);
      PB.player.select(2,PB.moodIndex.warm)})()""")
    wait_playing(page)
    page.wait_for_timeout(1500)
    st = page.evaluate("PB.player.state")
    assert (st["si"], st["mi"]) == (2, mood(page, "warm"))
    assert page.evaluate("PB.player._activeSources()") == 1


def test_layer_survives_selection(page):
    page.evaluate("PB.player.setLayer('tense');PB.player.select(0,PB.moodIndex.theme)")
    wait_playing(page)
    page.evaluate("PB.player.select(1,PB.moodIndex.lively)")
    page.wait_for_function("PB.player.state.si===1 && PB.player.state.playing && !PB.player.state.busy", timeout=60000)
    page.wait_for_timeout(500)
    assert page.evaluate("PB.player.state.layer") == "tense"
    assert page.evaluate("!!PB.player.now().loop.hb")


def test_download_without_playing(page):
    r = page.evaluate("""(async()=>{const d=await PB.player.download(),l=await PB.getLoop(PB.player.state.si,PB.player.state.mi);
      return {name:d.name,bytes:d.bytes,want:44+l.buf.length*4}})()""")
    assert r["name"].startswith("pocket-band_") and r["name"].endswith("bpm.wav")
    assert r["bytes"] == r["want"]


def test_favourites_and_plays_persist(browser):
    page = open_page(browser)
    page.evaluate("PB.player.select(1,PB.moodIndex.rainy)")
    wait_playing(page)
    page.evaluate("PB.player.toggleFav()")
    page.wait_for_timeout(3000)
    page.reload()
    page.wait_for_function("window.PB && PB.ready === true")
    assert page.evaluate("PB.player.isFav(1,PB.moodIndex.rainy)")
    plays = page.evaluate("PB.player.plays()")
    assert plays[0]["style"] == "lofi" and plays[0]["mood"] == "rainy" and plays[0]["seconds"] >= 2
    assert page.evaluate("PB.player.playsText()").startswith("Pocket Band — my plays")
    page.evaluate("PB.player.resetPlays()")
    assert page.evaluate("PB.player.plays()") == []
    page.context.close()


def test_old_and_broken_prefs_load(browser):
    seed = ("localStorage.setItem('pocket-band-mood','heroic');localStorage.setItem('pocket-band-style','3');"
            "localStorage.setItem('pocket-band-plays','{bad');localStorage.setItem('pocket-band-favs','nope');"
            "localStorage.setItem('pocket-band-reps','7');localStorage.setItem('pocket-band-layer','loud')")
    page = open_page(browser, init_script=seed)
    st = page.evaluate("({s:PB.STYLES[PB.player.state.si].id,m:PB.MOODS[PB.player.state.mi].id,"
                       "reps:PB.player.state.reps,layer:PB.player.state.layer})")
    assert st == {"s": "chip", "m": "triumph", "reps": 2, "layer": "full"}
    assert page.evaluate("PB.player.plays()") == []
    assert page.errors == []
    page.context.close()


def test_mixtape_plays_and_stops(page):
    page.evaluate("PB.player.playMixtape('dark')")
    page.wait_for_function("PB.player.mixtapeNow()!==null", timeout=120000)
    names = page.evaluate("PB.player.mixtapeNow().segs.map(s=>s.nm)")
    assert names[-1] == "Triumph"
    page.evaluate("PB.player.stopMixtape()")
    assert page.evaluate("PB.player.mixtapeNow()") is None
    assert page.evaluate("PB.player.state.mixtape") is None
