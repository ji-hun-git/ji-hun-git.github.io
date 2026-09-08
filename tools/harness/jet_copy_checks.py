"""Bilingual content integrity and KF-21 interaction regression coverage."""
import argparse
import json
import re
import subprocess
from datetime import datetime, timedelta, timezone
from pathlib import Path

from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright, expect
from run_browser import ROOT, serve

parser = argparse.ArgumentParser()
parser.add_argument('--screenshots', type=Path)
args = parser.parse_args()
if args.screenshots:
    args.screenshots.mkdir(parents=True, exist_ok=True)

# Published titles, author lists, roles, and source links are not editorial copy.
baseline = subprocess.check_output(['git', 'show', '2654b89:index.html'], cwd=ROOT).decode('utf-8')
old = BeautifulSoup(baseline, 'html.parser')
new = BeautifulSoup((ROOT / 'index.html').read_text(encoding='utf-8'), 'html.parser')
normalize = lambda el: ' '.join(el.get_text(' ', strip=True).split())
for selector in ['.paper-title', '.pub-role', '.venue', '#education .item', '#patents .item']:
    assert [normalize(e) for e in old.select(selector)] == [normalize(e) for e in new.select(selector)], selector
assert {a['href'] for a in old.select('a[href]')} <= {a['href'] for a in new.select('a[href]')}
assert len(new.select('.item')) == 43
for before, after in zip(old.select('#pubItems .item-desc'), new.select('#pubItems .item-desc')):
    assert normalize(before) == normalize(after), 'Citation changed'
solo = normalize(new.select_one('#awards .item'))
assert 'Solo' in solo and '개인 참가' in solo and '혼자' in solo
assert not re.search(r'\bteams?\b|3팀|25개 팀', solo, re.I)
assert len(new.select('.pub-value [lang="en"]')) == 21
assert len(new.select('.pub-value [lang="ko"]')) == 21

PRESERVE = "const get=HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext=function(type,options){return get.call(this,type,type==='webgl2'?{...options,preserveDrawingBuffer:true}:options)}"
PIXELS = '''canvas => {
  const gl=canvas.getContext('webgl2'), w=gl.drawingBufferWidth, h=gl.drawingBufferHeight;
  const data=new Uint8Array(w*h*4); gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,data);
  let count=0,left=w,right=0,top=h,bottom=0; const colors=new Set();
  for(let y=0;y<h;y+=2)for(let x=0;x<w;x+=2){const i=(y*w+x)*4;
    if(data[i+3]<180)continue; count++;left=Math.min(left,x);right=Math.max(right,x);
    top=Math.min(top,y);bottom=Math.max(bottom,y);colors.add([data[i]>>3,data[i+1]>>3,data[i+2]>>3].join(','));}
  return {count,left,right,top,bottom,colors:colors.size,w,h};
}'''
port, shutdown = serve(ROOT)
base = f'http://127.0.0.1:{port}'
results = []

def freeze(page):
    page.clock.install()
    page.clock.pause_at(datetime.now(timezone.utc) + timedelta(seconds=1))

def flight_frames(page, name):
    canvas = page.locator('.kf21-flyby')
    expect(canvas).to_have_count(1)
    page.clock.run_for(550)
    first = canvas.evaluate(PIXELS)
    assert first['count'] > 180 and first['colors'] > 15, first
    if args.screenshots: page.screenshot(path=str(args.screenshots / f'jet-{name}-first.png'))
    page.clock.run_for(150)
    second = canvas.evaluate(PIXELS)
    assert second['left'] > first['left'] + 30, (first, second)
    assert second['right'] < second['w'] and second['top'] > 0 and second['bottom'] < second['h'], second
    if args.screenshots: page.screenshot(path=str(args.screenshots / f'jet-{name}-second.png'))
    page.clock.run_for(900)
    expect(canvas).to_have_count(0)
    results.append({'case': name, 'first': first, 'second': second})

try:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for width in [320, 390, 1440]:
            context = browser.new_context(viewport={'width': width, 'height': 844 if width < 760 else 1000}, is_mobile=width < 760, has_touch=width < 760, device_scale_factor=2)
            context.add_init_script(PRESERVE)
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            if width < 760:
                page.goto(base + '/?work=camouflage-effectiveness&lang=ko', wait_until='networkidle')
                expect(page.locator('#catalog-reader-title')).to_contain_text('KF-21')
                freeze(page)
                replay = page.get_by_role('button', name='비행 애니메이션 재생')
                replay.tap()
                page.clock.run_for(20)
                expect(page.locator('.kf21-flyby')).to_have_count(1)
                flight_frames(page, f'phone-{width}-ko')
                assert page.locator('.catalog-reader-controls > button').evaluate_all('els=>els.filter(e=>e.checkVisibility()).every(e=>e.scrollWidth<=e.clientWidth && e.clientHeight<=44)'), 'Toolbar label wrapped'
                expect(page.locator('#work-detail')).to_be_visible()
                assert page.locator('.catalog-reader-body').evaluate('(el)=>el.scrollWidth<=el.clientWidth')
                replay.tap()
                page.clock.run_for(40)
                page.get_by_role('button', name='작업 닫기').tap()
                expect(page.locator('.kf21-flyby')).to_have_count(0)
            else:
                page.goto(base, wait_until='networkidle')
                book = page.locator('[data-pl-book="camouflage-effectiveness"]')
                book.scroll_into_view_if_needed()
                freeze(page)
                book.hover(force=True)
                page.clock.run_for(200)
                flight_frames(page, 'desktop')
                page.mouse.move(10, 10)
                book.hover(force=True)
                page.clock.run_for(300)
                expect(page.locator('.kf21-flyby')).to_have_count(0)
                page.clock.run_for(7500)
                page.mouse.move(10, 10)
                book.hover(force=True)
                page.mouse.move(10, 10)
                page.clock.run_for(300)
                expect(page.locator('.kf21-flyby')).to_have_count(0)
                page.keyboard.press('Tab')
                book.focus()
                page.clock.run_for(200)
                expect(page.locator('.kf21-flyby')).to_have_count(1)
                page.keyboard.press('Enter')
                expect(page.locator('.kf21-flyby')).to_have_count(0)
                page.keyboard.press('Escape')
            assert not errors, errors
            context.close()

        context = browser.new_context(reduced_motion='reduce')
        page = context.new_page()
        page.goto(base, wait_until='networkidle')
        book = page.locator('[data-pl-book="camouflage-effectiveness"]')
        book.hover()
        page.wait_for_timeout(300)
        assert not page.evaluate('performance.getEntriesByType("resource").some(r=>r.name.includes("jet-flyby"))')
        book.click()
        expect(page.locator('#catalog-reader-title')).to_be_visible()
        expect(page.locator('[data-pl-action="flyby"]')).not_to_be_visible()
        context.close()

        context = browser.new_context()
        context.add_init_script("const get=HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext=function(type,...args){return type.includes('webgl')?null:get.call(this,type,...args)}")
        page = context.new_page()
        page.goto(base + '/?work=camouflage-effectiveness', wait_until='networkidle')
        page.get_by_role('button', name='Replay flyby').click()
        page.wait_for_timeout(500)
        expect(page.locator('.kf21-flyby')).to_have_count(0)
        expect(page.locator('#catalog-reader-title')).to_be_visible()
        context.close()
        browser.close()
    print(json.dumps({'content': 'pass', 'motion': results, 'cooldown_keyboard_touch_reduced_webgl': 'pass'}, indent=2))
finally:
    shutdown()
