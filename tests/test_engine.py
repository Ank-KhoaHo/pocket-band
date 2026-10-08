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


ORDER = ["gentle", "quiet", "dreamy", "rainy", "theme", "lively", "playful", "stroll", "warm",
         "mystery", "melancholy", "spooky", "adventure", "tense", "epic", "triumph", "rush", "chase"]
NEW_MOODS = ["rainy", "playful", "spooky", "adventure", "triumph", "rush", "chase"]


def test_eighteen_moods_in_order(page):
    assert page.evaluate("PB.MOODS.map(m=>m.id)") == ORDER
    groups = page.evaluate("PB.MOODS.map(m=>m.grp)")
    assert groups == ["Calm"] * 4 + ["Bright"] * 5 + ["Moody"] * 3 + ["Bold"] * 4 + ["Fast"] * 2


def test_fast_moods_above_200_in_every_style(page):
    rows = page.evaluate("PB.STYLES.map(s=>[s.id,PB.bpmOf(s,PB.MOODS[PB.moodIndex.rush]),"
                         "PB.bpmOf(s,PB.MOODS[PB.moodIndex.chase])])")
    for sid, rush, chase in rows:
        assert rush > 200 and chase > 200, sid


def test_new_moods_render_in_existing_styles(page):
    for sid in ["folk", "lofi", "orch", "chip"]:
        for s in render_stats(page, sid, NEW_MOODS):
            assert ok(s), s


def test_rain_is_in_rainy_only(page):
    assert page.evaluate("PB.getLoop(0,PB.moodIndex.rainy).then(r=>r.ev.some(e=>e.k==='rain'))")
    assert not page.evaluate("PB.getLoop(0,PB.moodIndex.quiet).then(r=>r.ev.some(e=>e.k==='rain'))")


def test_playful_notes_are_shorter_than_lively(page):
    js = ("Promise.all([PB.getLoop(0,PB.moodIndex.lively),PB.getLoop(0,PB.moodIndex.playful)]).then(rs=>"
          "rs.map(r=>{const n=r.ev.filter(e=>e.c==='call');return n.reduce((a,e)=>a+e.d,0)/n.length/r.spb}))")
    lively, playful = page.evaluate(js)
    assert playful < lively * 0.6


WAV_JS = """(async()=>{const r=await PB.getLoop(0,PB.moodIndex.gentle),ab=PB.encodeWav(r.buf),v=new DataView(ab);
  const s=(o,n)=>String.fromCharCode(...new Uint8Array(ab,o,n));
  const d0=r.buf.getChannelData(0),d1=r.buf.getChannelData(1),L=r.buf.length;
  return {riff:s(0,4),wave:s(8,4),fmt:s(12,4),format:v.getUint16(20,true),ch:v.getUint16(22,true),rate:v.getUint32(24,true),
    bits:v.getUint16(34,true),data:s(36,4),size:v.getUint32(40,true),bytes:ab.byteLength,L:L,
    seam:Math.max(Math.abs(d0[L-1]-d0[0]),Math.abs(d1[L-1]-d1[0])),
    name:PB.wavName(PB.STYLES[0],PB.MOODS[PB.moodIndex.gentle],r.bpm)}})()"""


def test_wav_is_a_valid_seamless_16_bit_stereo_file(page):
    w = page.evaluate(WAV_JS)
    assert (w["riff"], w["wave"], w["fmt"], w["data"]) == ("RIFF", "WAVE", "fmt ", "data")
    assert (w["format"], w["ch"], w["rate"], w["bits"]) == (1, 2, 44100, 16)
    assert w["size"] == w["L"] * 4 and w["bytes"] == 44 + w["L"] * 4
    assert w["seam"] < 0.02
    assert w["name"] == "pocket-band_folk_gentle_84bpm.wav"


LAYER_JS = """(async()=>{const st=await PB.getStems(0,PB.moodIndex.lively),out={};
  for(const l of ['calm','build','tense']){const b=await PB.mixLayer(st,l),ch=[b.getChannelData(0),b.getChannelData(1)];
    let e=0,hf=0;const d=ch[0];for(let i=1;i<d.length;i++){e+=d[i]*d[i];hf+=(d[i]-d[i-1])**2}
    out[l]={lufs:PB.lufs(ch,PB.SR),len:b.length,hf:hf/e}}
  out.L=st.base.length;return out})()"""


def test_layer_mixes_are_matched_and_tense_is_darker(page):
    m = page.evaluate(LAYER_JS)
    for layer in ("calm", "build", "tense"):
        assert abs(m[layer]["lufs"] + 24) <= 0.2, (layer, m[layer])
        assert m[layer]["len"] == m["L"]
    assert m["tense"]["hf"] < m["build"]["hf"]
