"""The tape-deck UI, driven by real clicks and keys."""

import re

import pytest

from conftest import ROOT, open_page

SHOTS = ROOT / ".superpowers" / "screens"


def playing(page, timeout=60000):
    page.wait_for_function("PB.player.state.playing && !PB.player.state.busy", timeout=timeout)


def test_deck_renders_all_controls(page):
    assert page.locator(".tape").count() == 10
    assert page.locator(".pad").count() == 18
    assert page.locator(".mixtape").count() == 5
    assert page.errors == []


def test_click_pad_plays(page):
    page.click(".pad[data-mood=rainy]")
    page.wait_for_function("document.querySelector('#nowTitle').textContent.includes('RAINY')", timeout=60000)
    playing(page)
    assert page.get_attribute("#play", "aria-pressed") == "true"
    assert page.get_attribute(".pad[data-mood=rainy]", "aria-pressed") == "true"


def test_keys_drive_the_deck(page):
    page.locator("body").click(position={"x": 5, "y": 5})
    page.keyboard.press("2")
    assert page.get_attribute(".tape[data-style=lofi]", "aria-pressed") == "true"
    before = page.evaluate("PB.player.state.mi")
    page.keyboard.press("ArrowRight")
    assert page.evaluate("PB.player.state.mi") == (before + 1) % 18
    page.keyboard.press("v")
    assert page.get_attribute("#viewScope", "aria-pressed") == "true"
    page.keyboard.press("l")
    assert page.get_attribute("[data-layer=calm]", "aria-pressed") == "true"
    page.keyboard.press("Escape")
    assert page.evaluate("PB.player.state.playing") is False


def test_copy_and_reset(page):
    page.context.grant_permissions(["clipboard-read", "clipboard-write"])
    page.click(".pad[data-mood=gentle]")
    playing(page)
    page.wait_for_timeout(3000)
    page.click("#play")  # stop
    page.wait_for_function("document.querySelectorAll('#plays li').length>0")
    page.click("#copyPlays")
    page.wait_for_function("document.querySelector('#copyPlays').textContent.includes('Copied')")
    assert page.evaluate("navigator.clipboard.readText()").startswith("Pocket Band — my plays")
    page.once("dialog", lambda d: d.accept())
    page.click("#resetPlays")
    page.wait_for_function("document.querySelectorAll('#plays li').length===0")


def test_wav_button_downloads(page):
    with page.expect_download(timeout=60000) as dl:
        page.click("#wav")
    assert re.fullmatch(r"pocket-band_\w+_\w+_\d+bpm\.wav", dl.value.suggested_filename)


def test_works_when_storage_throws(browser):
    block = ("Object.defineProperty(window,'localStorage',{configurable:true,"
             "get(){throw new Error('storage blocked')}});")
    page = open_page(browser, init_script=block)
    page.click(".pad[data-mood=lively]")
    playing(page)
    page.click("#fav")
    assert page.get_attribute("#fav", "aria-pressed") == "true"
    assert [e for e in page.errors if "storage blocked" not in e] == []
    page.context.close()


@pytest.mark.parametrize("w,h", [(1280, 800), (390, 844)])
def test_no_horizontal_scroll(browser, w, h):
    page = open_page(browser, viewport={"width": w, "height": h})
    page.wait_for_timeout(600)
    assert page.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth")
    SHOTS.mkdir(parents=True, exist_ok=True)
    page.screenshot(path=str(SHOTS / f"deck-{w}.png"), full_page=True)
    page.context.close()
