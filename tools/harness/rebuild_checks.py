"""Responsive route and content regression checks for the bookshelf and CV."""
import argparse
import json
from io import BytesIO
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
from pypdf import PdfReader
from run_browser import ROOT, serve, BOOKSHELF
from static_checks import bookshelf_enabled

parser=argparse.ArgumentParser()
parser.add_argument('--screenshots',type=Path)
args=parser.parse_args()
if args.screenshots: args.screenshots.mkdir(exist_ok=True,parents=True)
port,shutdown=serve(ROOT)
base=f'http://127.0.0.1:{port}'
# The CV visitors get, per language: the site root (English) and /ko.html
# (Korean) while the bookshelf is switched off, ?view=cv on each when it is on.
public_cv={lang:page+('?view=cv' if bookshelf_enabled() else '') for lang,page in (('en','/'),('ko','/ko.html'))}
results=[]

def check_cv(page,width,lang,shots=False):
    expect(page.locator('#cv-start')).to_be_visible()
    expect(page.locator('html')).to_have_attribute('lang',lang)
    expect(page.locator('#projects .items>.item')).to_have_count(6)
    expect(page.locator('#awards .items>.item')).to_have_count(10)
    expect(page.locator('#pubItems .item')).to_have_count(21)
    expect(page.locator('#pubItems .cv-paper-heading')).to_have_count(21)
    expect(page.locator('.caps')).not_to_have_attribute('open','')
    page.locator('.caps > summary').click()
    expect(page.locator('.caps-row').first).to_be_visible()
    page.locator('.caps > summary').click()
    assert page.locator('#projects').inner_text().count('NYU\nNYU') == 0
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'),(width,lang,'cv overflow')
    if shots: page.screenshot(path=str(args.screenshots/f'cv-{width}-{lang}.png'),animations='disabled')
    page.locator('.mobile-nav a[href="#publications"]').click()
    page.locator('#pubFilter button[data-year="2026"]').click()
    assert page.locator('#pubItems .item:visible').count()<21
    expect(page.locator('.pub-group:visible')).to_have_count(1)
    expect(page.locator('.mobile-nav a[href="#publications"]')).to_have_attribute('aria-current','location')
    assert page.locator('.cv-paper-heading').evaluate_all('els=>els.every(el=>el.scrollWidth<=el.clientWidth+1)'),(width,lang,'publication title overflow')
    page.emulate_media(media='print')
    expect(page.locator('#pubItems .item:visible')).to_have_count(21)
    if shots and width==1440 and lang=='en':page.pdf(path=str(args.screenshots/'cv-print.pdf'),format='A4',print_background=True)
    page.emulate_media(media='screen')

try:
    with sync_playwright() as p:
        browser=p.chromium.launch()
        for width in [375,390,430,768,1024,1440,1920]:
            page=browser.new_page(viewport={'width':width,'height':900 if width>760 else 844})
            cv_page=browser.new_page(viewport={'width':width,'height':900 if width>760 else 844})
            errors=[]
            page.on('pageerror',lambda error:errors.append(str(error)))
            cv_page.on('pageerror',lambda error:errors.append(str(error)))
            for lang in ['en','ko']:
                page.goto(base+BOOKSHELF+('&lang=ko' if lang=='ko' else ''),wait_until='networkidle')
                expect(page.locator('.catalog-row')).to_have_count(37)
                expect(page.locator('.bookshelf')).to_have_count(3)
                expect(page.locator('#work-library img')).to_have_count(0)
                expect(page.locator('.catalog-cv-entry > *')).to_have_count(1)
                expect(page.locator('.catalog-cv-link')).to_have_text('See the full CV ↗' if lang == 'en' else '전체 이력서 보기 ↗')
                assert 'Always curious' not in page.locator('#work-library').inner_text()
                if lang == 'en':
                    expect(page.locator('.catalog-statement')).to_have_text('I build and research interactive systems around humans and AI.')
                else:
                    expect(page.locator('.book-title').first).to_have_css('text-orientation', 'upright')
                assert page.locator('.catalog-face-out').count() > 0
                assert page.locator('.catalog-face-out').evaluate_all('''(books) => books.every(book => {
                    const title = book.querySelector('.book-title');
                    const year = book.querySelector('.book-year');
                    return title.scrollWidth <= title.clientWidth + 1 && title.getBoundingClientRect().bottom <= year.getBoundingClientRect().top + 1;
                })'''), (width, lang, 'cover text fit')
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (width,lang,'shelf overflow')
                if args.screenshots: page.screenshot(path=str(args.screenshots/f'shelf-{width}-{lang}.png'),animations='disabled')
                book=page.locator('[data-pl-book="inclusive-game-ai"]')
                book.click()
                expect(page.locator('#work-detail')).to_be_visible()
                expect(page.locator('#catalog-reader-title')).to_contain_text('GAIA')
                expect(page.locator('.book-flight-canvas')).to_have_count(0, timeout=10000)
                expect(page.locator('#catalog-reader-title')).to_be_visible()
                assert page.locator('.catalog-reader-body').evaluate('(el)=>el.scrollWidth<=el.clientWidth'),(width,lang,'reader overflow')
                if args.screenshots: page.screenshot(path=str(args.screenshots/f'book-{width}-{lang}.png'),animations='disabled')
                page.keyboard.press('Escape')
                expect(page.locator('#work-detail')).not_to_be_visible()
                expect(book).to_be_focused()
                # The CV as the bookshelf's Full CV link opens it...
                page.locator('.cv-link').click()
                check_cv(page,width,lang)
                # ...and as visitors reach it directly.
                cv_page.goto(base+public_cv[lang],wait_until='networkidle')
                check_cv(cv_page,width,lang,shots=bool(args.screenshots))
            assert not errors,errors
            results.append({'width':width,'shelf':'pass','cv':'pass','publicCv':list(public_cv.values()),'languages':2,'print':'pass'})
            page.close()
            cv_page.close()
        # On paper the links cannot be clicked: the printed CV spells out the
        # email address and profile URLs, and it stays within 11 A4 pages.
        for lang,path in public_cv.items():
            pdf_page=browser.new_page(viewport={'width':1440,'height':900})
            pdf_page.goto(base+path,wait_until='networkidle')
            pdf_page.emulate_media(media='print')
            reader=PdfReader(BytesIO(pdf_page.pdf(format='A4',print_background=True)))
            flat=''.join(''.join(p.extract_text() or '' for p in reader.pages).split())
            for want in ('chaejihun@kaist.ac.kr','linkedin.com/in/jihun-chae-15457756','github.com/ji-hun-git',
                         'scholar.google.com/citations?user=OjxItRUAAAAJ','orcid.org/0009-0005-7425-3806'):
                assert want in flat,(lang,'printed CV lacks',want)
            assert len(reader.pages)<=11,(lang,'printed CV has %d A4 pages'%len(reader.pages))
            results.append({'print':lang,'a4Pages':len(reader.pages),'contacts':'pass'})
            pdf_page.close()
        browser.close()
    print(json.dumps(results,indent=2))
finally: shutdown()
