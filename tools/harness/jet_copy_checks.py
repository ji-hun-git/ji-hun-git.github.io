"""Bilingual content integrity and KF-21 interaction regression coverage."""
import argparse
import json
import re
import subprocess
from datetime import datetime, timedelta, timezone
from pathlib import Path

from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright, expect
from run_browser import ROOT, serve, BOOKSHELF, open_all_sections

parser = argparse.ArgumentParser()
parser.add_argument('--screenshots', type=Path)
args = parser.parse_args()
if args.screenshots:
    args.screenshots.mkdir(parents=True, exist_ok=True)
# The pages' Content-Security-Policy has no 'unsafe-eval': a wait_for_function
# predicate must be a function (a bare expression is eval()ed in the page).
FLYBY_SHOWN = '() => document.querySelectorAll(".kf21-flyby").length > 0'

# Published titles, author lists, roles, and source links are not editorial copy.
baseline = subprocess.check_output(['git', 'show', '2654b89:index.html'], cwd=ROOT).decode('utf-8')
old = BeautifulSoup(baseline, 'html.parser')
new = BeautifulSoup((ROOT / 'index.html').read_text(encoding='utf-8'), 'html.parser')
normalize = lambda el: ' '.join(el.get_text(' ', strip=True).split())
for selector in ['.paper-title', '.pub-role', '.venue', '#patents .item']:
    assert [normalize(e) for e in old.select(selector)] == [normalize(e) for e in new.select(selector)], selector
# Education is pinned to the owner's own CV (supplied 2026-09-30), which dated
# each degree and corrected two of them (B.Eng. dual degrees, not "B.A.";
# undergraduate studies at Ateneo, not a degree). Exact text, both languages:
# (title EN, title KO, meta EN, meta KO) per entry, in page order.
KAIST_EN, KAIST_KO = 'Korea Advanced Institute of Science and Technology (KAIST)', '한국과학기술원 (KAIST)'
EDUCATION = [
    (KAIST_EN, KAIST_KO,
     '2026 – present | Ph.D. Student, Graduate School of Culture Technology',
     '2026 ~ 현재 | 문화기술대학원 박사과정'),
    (KAIST_EN, KAIST_KO,
     '2024 – 2026 | M.S. in Culture Technology | Advisor: Prof. Young Yim Doh',
     '2024 ~ 2026 | 문화기술학 석사 | 지도교수 도영임'),
    ('Handong Global University', '한동대학교',
     '2018 – 2024 | B.Eng. in ICT Convergence and B.Eng. in Product Design (dual degrees)',
     '2018 ~ 2024 | ICT융합 공학사, 제품디자인 공학사(복수 학위)'),
    ('Ateneo de Manila University', '아테네오 데 마닐라 대학교',
     '2016 – 2017 | Undergraduate studies in Applied Chemistry with Materials Science and Management',
     # 재학 (enrolled), not 수학: beside a subject, 수학 reads as mathematics.
     '2016 ~ 2017 | 응용화학(재료과학·경영 연계) 학부 과정 재학'),
]
education = new.select('#education .item')
assert len(education) == len(EDUCATION), '#education .item count'
for item, expected in zip(education, EDUCATION):
    title_en, title_ko, meta_en, meta_ko = expected
    assert normalize(item.select_one('.item-title [lang="en"]')) == title_en, (title_en, 'title')
    assert normalize(item.select_one('.item-title [lang="ko"]')) == title_ko, (title_ko, 'title')
    assert normalize(item.select_one('.item-meta [lang="en"]')) == meta_en, (title_en, 'meta')
    assert normalize(item.select_one('.item-meta [lang="ko"]')) == meta_ko, (title_ko, 'meta')
    assert normalize(item) == ' '.join(expected), ('#education .item', title_en)
assert {a['href'] for a in old.select('a[href]')} <= {a['href'] for a in new.select('a[href]')}
assert len(new.select('.item')) == 43
for before, after in zip(old.select('#pubItems .item-desc'), new.select('#pubItems .item-desc')):
    assert normalize(before) == normalize(after), 'Citation changed'
solo = normalize(new.select_one('#awards .item'))
assert 'Solo' in solo and '개인 참가' in solo and '혼자' in solo
assert not re.search(r'\bteams?\b|3팀|25개 팀', solo, re.I)
assert len(new.select('.pub-value [lang="en"]')) == 21
assert len(new.select('.pub-value [lang="ko"]')) == 21

NO_WEBGL = "const get=HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext=function(type,...args){return type.includes('webgl')?null:get.call(this,type,...args)}"
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
                page.goto(base + BOOKSHELF, wait_until='networkidle')
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

        # The CV: while the bookshelf is off, site.js flies the jet from the
        # KF-21 entry itself, loading jet-flyby.js on the first hover only.
        context = browser.new_context(viewport={'width': 1440, 'height': 1000}, device_scale_factor=2)
        context.add_init_script(PRESERVE)
        page = context.new_page()
        errors, requested = [], []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('request', lambda r: requested.append(r.url))
        page.goto(base + '/', wait_until='networkidle')
        assert page.evaluate('document.documentElement.dataset.bookshelf') == 'off'
        # The CV opens folded: the KF-21 entry is in R&D, opened as a reader would.
        open_all_sections(page)
        entry = page.locator('#cv-work-camouflage-effectiveness')
        entry.scroll_into_view_if_needed()
        assert not [u for u in requested if 'jet-flyby' in u], 'flyby loaded before any interaction'
        freeze(page)
        entry.hover()
        page.clock.run_for(200)
        flight_frames(page, 'cv-hover')
        page.mouse.move(10, 10)
        entry.hover()  # within the 7 s cooldown
        page.clock.run_for(300)
        expect(page.locator('.kf21-flyby')).to_have_count(0)
        page.clock.run_for(7500)
        page.mouse.move(10, 10)
        entry.hover()
        page.mouse.move(10, 10)  # left before take-off (180 ms)
        page.clock.run_for(300)
        expect(page.locator('.kf21-flyby')).to_have_count(0)
        page.keyboard.press('Tab')
        entry.focus()  # keyboard focus, without a Tab stop of its own
        page.clock.run_for(200)
        expect(page.locator('.kf21-flyby')).to_have_count(1)
        page.keyboard.press('Escape')
        expect(page.locator('.kf21-flyby')).to_have_count(0)
        shelf = [u for u in requested if '/assets/project-library/' in u]
        assert shelf and all('jet-flyby.js' in u for u in shelf), shelf
        assert not errors, errors
        context.close()

        # A mouse resting still while the page scrolls the entry under it does
        # not start the flyby; moving the mouse over the entry does.
        context = browser.new_context(viewport={'width': 1440, 'height': 1000})
        page = context.new_page()
        errors, requested = [], []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('request', lambda r: requested.append(r.url))
        page.goto(base + '/', wait_until='networkidle')
        open_all_sections(page)
        page.mouse.move(720, 500)
        page.evaluate('''() => {
          const box = document.querySelector('#cv-work-camouflage-effectiveness').getBoundingClientRect();
          scrollBy({ top: box.top + box.height / 2 - 500, behavior: 'instant' });
        }''')
        page.wait_for_function('() => document.querySelector("#cv-work-camouflage-effectiveness").matches(":hover")')
        page.wait_for_timeout(600)
        assert not [u for u in requested if 'jet-flyby' in u], 'the flyby started under a resting pointer'
        expect(page.locator('.kf21-flyby')).to_have_count(0)
        page.mouse.move(726, 506)
        page.wait_for_function(FLYBY_SHOWN)
        assert not errors, errors
        context.close()

        context = browser.new_context(reduced_motion='reduce')
        page = context.new_page()
        page.goto(base + '/', wait_until='networkidle')
        open_all_sections(page)
        entry = page.locator('#cv-work-camouflage-effectiveness')
        entry.hover()
        page.keyboard.press('Tab')
        entry.focus()
        page.wait_for_timeout(400)
        assert not page.evaluate('performance.getEntriesByType("resource").some(r=>r.name.includes("jet-flyby"))')
        expect(page.locator('.kf21-flyby')).to_have_count(0)
        context.close()

        context = browser.new_context()
        context.add_init_script(NO_WEBGL)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(base + '/', wait_until='networkidle')
        open_all_sections(page)
        page.locator('#cv-work-camouflage-effectiveness').hover()
        page.wait_for_timeout(800)
        expect(page.locator('.kf21-flyby')).to_have_count(0)
        assert not errors, errors
        context.close()

        # With the bookshelf on, library.js flies from the CV entry and site.js
        # stays out of it: one jet, not two.
        context = browser.new_context(viewport={'width': 1440, 'height': 1000})
        page = context.new_page()
        page.goto(base + BOOKSHELF, wait_until='networkidle')
        page.goto(base + '/?view=cv', wait_until='networkidle')
        assert page.evaluate('[document.documentElement.dataset.bookshelf, document.documentElement.dataset.view]') == ['on', 'cv']
        open_all_sections(page)
        page.locator('#cv-work-camouflage-effectiveness').hover()
        page.wait_for_function(FLYBY_SHOWN)
        page.wait_for_timeout(150)
        assert page.locator('.kf21-flyby').count() == 1, 'the flyby fired twice'
        context.close()

        context = browser.new_context(reduced_motion='reduce')
        page = context.new_page()
        page.goto(base + BOOKSHELF, wait_until='networkidle')
        book = page.locator('[data-pl-book="camouflage-effectiveness"]')
        book.hover()
        page.wait_for_timeout(300)
        assert not page.evaluate('performance.getEntriesByType("resource").some(r=>r.name.includes("jet-flyby"))')
        book.click()
        expect(page.locator('#catalog-reader-title')).to_be_visible()
        expect(page.locator('[data-pl-action="flyby"]')).not_to_be_visible()
        context.close()

        context = browser.new_context()
        context.add_init_script(NO_WEBGL)
        page = context.new_page()
        page.goto(base + '/?work=camouflage-effectiveness', wait_until='networkidle')
        page.get_by_role('button', name='Replay flyby').click()
        page.wait_for_timeout(500)
        expect(page.locator('.kf21-flyby')).to_have_count(0)
        expect(page.locator('#catalog-reader-title')).to_be_visible()
        context.close()
        browser.close()
    print(json.dumps({'content': 'pass', 'motion': results, 'cooldown_keyboard_touch_reduced_webgl': 'pass',
                      'cv_hover_focus_cooldown_reduced_webgl_single': 'pass'}, indent=2))
finally:
    shutdown()
