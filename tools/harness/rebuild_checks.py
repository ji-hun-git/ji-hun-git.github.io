"""Responsive route and content regression checks for the bookshelf and CV."""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
from run_browser import ROOT, serve

parser=argparse.ArgumentParser()
parser.add_argument('--screenshots',type=Path)
args=parser.parse_args()
if args.screenshots: args.screenshots.mkdir(exist_ok=True,parents=True)
port,shutdown=serve(ROOT)
base=f'http://127.0.0.1:{port}'
results=[]
try:
    with sync_playwright() as p:
        browser=p.chromium.launch()
        for width in [375,390,430,768,1024,1440,1920]:
            page=browser.new_page(viewport={'width':width,'height':900 if width>760 else 844})
            errors=[]
            page.on('pageerror',lambda error:errors.append(str(error)))
            for lang in ['en','ko']:
                page.goto(base+('/?lang=ko' if lang=='ko' else '/'),wait_until='networkidle')
                expect(page.locator('.catalog-row')).to_have_count(37)
                expect(page.locator('.bookshelf')).to_have_count(3)
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (width,lang,'shelf overflow')
                if args.screenshots: page.screenshot(path=str(args.screenshots/f'shelf-{width}-{lang}.png'),animations='disabled')
                book=page.locator('[data-pl-book="inclusive-game-ai"]')
                book.click()
                expect(page.locator('#work-detail')).to_be_visible()
                expect(page.locator('#catalog-reader-title')).to_contain_text('GAIA')
                assert page.locator('.catalog-reader-body').evaluate('(el)=>el.scrollWidth<=el.clientWidth'),(width,lang,'reader overflow')
                if args.screenshots: page.screenshot(path=str(args.screenshots/f'book-{width}-{lang}.png'),animations='disabled')
                page.keyboard.press('Escape')
                expect(page.locator('#work-detail')).not_to_be_visible()
                expect(book).to_be_focused()
                page.locator('.cv-link').click()
                expect(page.locator('#cv-start')).to_be_visible()
                expect(page.locator('html')).to_have_attribute('lang',lang)
                expect(page.locator('#projects .items>.item')).to_have_count(6)
                expect(page.locator('#awards .items>.item')).to_have_count(10)
                expect(page.locator('#pubItems .item')).to_have_count(21)
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'),(width,lang,'cv overflow')
                if args.screenshots: page.screenshot(path=str(args.screenshots/f'cv-{width}-{lang}.png'),animations='disabled')
                page.locator('#pubFilter button[data-year="2026"]').click()
                assert page.locator('#pubItems .item:visible').count()<21
                page.emulate_media(media='print')
                expect(page.locator('#pubItems .item:visible')).to_have_count(21)
                if width==1440 and lang=='en' and args.screenshots:page.pdf(path=str(args.screenshots/'cv-print.pdf'),format='A4',print_background=True)
                page.emulate_media(media='screen')
            assert not errors,errors
            results.append({'width':width,'shelf':'pass','cv':'pass','languages':2,'print':'pass'})
            page.close()
        browser.close()
    print(json.dumps(results,indent=2))
finally: shutdown()
