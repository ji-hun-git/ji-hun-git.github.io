"""Exercise the library's real navigation, filtering, localization and dialog behavior."""
import argparse
import json
import re
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
from run_browser import serve, ROOT, BOOKSHELF

parser = argparse.ArgumentParser()
parser.add_argument('--screenshots', type=Path)
args = parser.parse_args()
if args.screenshots:
    args.screenshots.mkdir(parents=True, exist_ok=True)
port, shutdown = serve(ROOT)
base = f'http://127.0.0.1:{port}'
results = []
try:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for width, height in [(1440,1000),(390,844),(320,740),(768,1024),(1920,1080)]:
            page = browser.new_page(viewport={'width':width,'height':height})
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(base + BOOKSHELF, wait_until='networkidle')
            expect(page.locator('.catalog-row')).to_have_count(37)
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'Horizontal overflow'
            if args.screenshots:
                page.screenshot(path=str(args.screenshots / f'library-{width}.png'), animations='disabled')
            page.locator('[data-filter="project"]').click()
            expect(page.locator('.catalog-row')).to_have_count(6)
            page.locator('[data-filter="publication"]').click()
            expect(page.locator('.catalog-row')).to_have_count(21)
            page.locator('[data-filter="award"]').click()
            expect(page.locator('.catalog-row')).to_have_count(10)
            search = page.get_by_role('searchbox')
            search.fill('nonexistent-query-abc')
            expect(page.locator('.catalog-empty')).to_be_visible()
            page.get_by_role('button', name='Clear filters', exact=True).click()
            expect(page.locator('.catalog-row')).to_have_count(37)
            search.fill('GAIA')
            assert page.locator('.catalog-row').count() >= 3
            search.fill('')
            opener=page.locator('.catalog-volume[data-pl-book="inclusive-game-ai"]')
            opener.click()
            expect(page.locator('dialog')).to_be_visible()
            expect(page.locator('#catalog-reader-title')).to_contain_text('GAIA')
            assert page.locator('dialog').evaluate('(el)=>el.matches(":modal")'), 'Not a modal dialog'
            for _ in range(20):
                page.keyboard.press('Tab')
                assert page.evaluate('document.activeElement.closest("dialog") !== null'), 'Focus escaped dialog'
            page.locator('.catalog-reader-body').evaluate('(el)=>el.scrollTop=0')
            if args.screenshots:
                page.screenshot(path=str(args.screenshots / f'reader-{width}.png'), animations='disabled')
            page.get_by_role('button',name='Close work',exact=True).click()
            expect(page.locator('dialog')).not_to_be_visible()
            expect(opener).to_be_focused()
            expect(page).not_to_have_url(re.compile('work='))
            page.locator('#langToggle').click()
            expect(page.locator('html')).to_have_attribute('lang','ko')
            expect(page.locator('.catalog-statement')).to_contain_text('사람들이 어디서 막히는지')
            page.locator('[data-filter="project"]').click()
            expect(page.locator('.catalog-row')).to_have_count(6)
            if args.screenshots:
                page.evaluate('scrollTo(0,0)')
                page.screenshot(path=str(args.screenshots / f'korean-{width}.png'), animations='disabled')
            page.locator('.catalog-volume[data-pl-book="data-quality-engine"]').click()
            expect(page.locator('#catalog-reader-title')).to_contain_text('DQM')
            page.get_by_role('button',name='영어로 읽기',exact=True).click()
            expect(page.locator('html')).to_have_attribute('lang','en')
            page.keyboard.press('Escape')
            expect(page.locator('dialog')).not_to_be_visible()
            expect(page.locator('.catalog-volume[data-pl-book="data-quality-engine"]')).to_be_focused()
            page.locator('#ttsToggle').click()
            expect(page.locator('.book-title').first).to_have_css('writing-mode','horizontal-tb')
            page.locator('.catalog-volume').first.click()
            assert page.locator('dialog').evaluate('(el)=>el.getAnimations().length===0'), 'Reader mode animated'
            page.keyboard.press('Escape')
            page.locator('#ttsToggle').click()
            assert not errors, errors
            results.append({'viewport':width,'records':37,'filters':'pass','language':'pass','dialog':'pass','errors':errors})
            page.close()
        page=browser.new_page(viewport={'width':1280,'height':800}, reduced_motion='reduce')
        page.goto(base+'/?work=gaia-design-principles',wait_until='networkidle')
        expect(page.locator('dialog')).to_be_visible()
        expect(page.locator('#catalog-reader-title')).to_contain_text('Design principles')
        page.get_by_role('button',name='Next work',exact=True).click()
        page.get_by_role('button',name='Previous work',exact=True).click()
        expect(page.locator('#catalog-reader-title')).to_contain_text('Design principles')
        page.keyboard.press('Escape')
        expect(page.locator('dialog')).not_to_be_visible()
        expect(page).not_to_have_url(re.compile('work='))
        page.locator('.catalog-volume[data-pl-book="data-quality-engine"]').click()
        page.go_back()
        expect(page.locator('dialog')).not_to_be_visible()
        page.go_forward()
        expect(page.locator('dialog')).to_be_visible()
        page.get_by_role('button',name='Read in Korean',exact=True).click()
        page.get_by_role('link',name='전체 이력서에서 보기',exact=True).click()
        expect(page.locator('#cv-work-data-quality-engine')).to_be_visible()
        expect(page.locator('html')).to_have_attribute('lang','ko')
        page.locator('.library-return').click()
        expect(page.locator('html')).to_have_attribute('lang','ko')
        page.locator('#langToggle').click()
        slugs=page.locator('.catalog-record').evaluate_all('(els)=>els.map(el=>el.dataset.plBook)')
        for slug in slugs:
            page.locator(f'.catalog-record[data-pl-book="{slug}"]').click()
            expect(page.locator('#catalog-reader-title')).not_to_be_empty()
            assert page.locator('.catalog-reader-section').count() >= 4, slug
            assert page.locator('.catalog-reader-body').evaluate('(el)=>el.scrollWidth <= el.clientWidth'), slug
            assert page.locator('dialog').evaluate('(el)=>el.getAnimations().length===0'), 'Reduced motion animated'
            page.keyboard.press('Escape')
            expect(page).not_to_have_url(re.compile('work='))
        results.append({'deepLinks':'pass','reducedMotion':'pass','history':'pass','cvLink':'pass'})
        results.append({'recordDetails':len(slugs),'keyboardFocus':'pass','readerMode':'pass'})
        page=browser.new_page(viewport={'width':1280,'height':800})
        page.goto(base+BOOKSHELF,wait_until='networkidle')
        page.locator('[data-pl-book="inclusive-game-ai"]').click()
        page.go_back()
        page.go_forward()
        expect(page.locator('dialog')).to_be_visible()
        expect(page.locator('#catalog-reader-title')).to_contain_text('GAIA')
        for key in ['ArrowRight','ArrowRight','ArrowLeft','ArrowLeft']:
            page.keyboard.press(key)
        expect(page.locator('#catalog-reader-title')).to_contain_text('GAIA')
        page.locator('dialog').evaluate('(el)=>Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{})))')
        assert page.locator('.catalog-reader-body').evaluate('(el)=>getComputedStyle(el).opacity==="1"')
        page.keyboard.press('Escape')
        expect(page.locator('dialog')).not_to_be_visible()
        results.append({'interruptedTransitions':'pass','rapidRecordNavigation':'pass'})
        browser.close()
    print(json.dumps(results,indent=2))
finally:
    shutdown()
