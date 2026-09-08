"""Verify the Three.js book sequence, touch framing, pixels, and interruption paths."""
import argparse
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
from run_browser import ROOT, serve

parser = argparse.ArgumentParser()
parser.add_argument('--screenshots', type=Path)
parser.add_argument('--interactions-only', action='store_true')
args = parser.parse_args()
if args.screenshots:
    args.screenshots.mkdir(parents=True, exist_ok=True)

PRESERVE_PIXELS = "const get=HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext=function(type,options){return get.call(this,type,type==='webgl2'?{...options,preserveDrawingBuffer:true}:options)}"
PIXELS = '''(canvas) => {
    const gl = canvas.getContext('webgl2');
    const width = gl.drawingBufferWidth, height = gl.drawingBufferHeight;
    const data = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data);
    let count = 0, left = width, right = 0, top = height, bottom = 0;
    const colors = new Set();
    for (let y = 0; y < height; y += 3) for (let x = 0; x < width; x += 3) {
        const i = (y * width + x) * 4;
        if (data[i + 3] < 100) continue;
        count++; left = Math.min(left, x); right = Math.max(right, x);
        top = Math.min(top, y); bottom = Math.max(bottom, y);
        colors.add([data[i]>>3, data[i+1]>>3, data[i+2]>>3].join(','));
    }
    return {count, colors:colors.size, left, right, top, bottom, width, height};
}'''

port, shutdown = serve(ROOT)
base = f'http://127.0.0.1:{port}'
results = []

def ready(page):
    expect(page.locator('#work-detail')).to_be_visible()
    expect(page.locator('#work-detail')).not_to_have_class('catalog-reader book-opening', timeout=10000)
    expect(page.locator('#catalog-reader-title')).to_be_visible()
    expect(page.locator('.book-flight-canvas')).to_have_count(0)
    expect(page.locator('.book-in-flight')).to_have_count(0)

def phase(page, name):
    page.wait_for_function('(name)=>document.querySelector(".book-flight")?.dataset.phase===name', arg=name, timeout=10000)

try:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for width in ([] if args.interactions_only else [375, 390, 430, 768, 1024, 1440, 1920]):
            context = browser.new_context(viewport={'width':width,'height':844 if width < 760 else 1000}, is_mobile=width < 760, has_touch=width < 760, device_scale_factor=2)
            context.add_init_script(PRESERVE_PIXELS)
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(base, wait_until='networkidle')
            page.clock.install()
            page.clock.pause_at(datetime.now(timezone.utc) + timedelta(seconds=1))
            assert not page.evaluate('performance.getEntriesByType("resource").some(r=>r.name.includes("three.module"))'), '3D loaded before book intent'
            book = page.locator('[data-pl-book="inclusive-game-ai"]')
            if width < 760: book.tap(force=True)
            else: book.click(force=True)
            expect(page.locator('.book-flight-canvas')).to_have_count(1,timeout=10000)
            page.clock.run_for(550)
            expect(page.locator('.book-flight')).to_have_attribute('data-phase','turn')
            if args.screenshots: page.screenshot(path=str(args.screenshots/f'book-pull-{width}.png'))
            page.clock.run_for(550)
            expect(page.locator('.book-flight')).to_have_attribute('data-phase','open')
            if args.screenshots: page.screenshot(path=str(args.screenshots/f'book-open-{width}.png'))
            page.clock.run_for(550)
            expect(page.locator('.book-flight')).to_have_attribute('data-phase','flip')
            pixels = page.locator('.book-flight-canvas').evaluate(PIXELS)
            assert pixels['count'] > 200 and pixels['colors'] > 20, pixels
            assert pixels['left'] > 2 and pixels['right'] < pixels['width'] - 2, ('horizontal clipping',width,pixels)
            assert pixels['top'] > 2 and pixels['bottom'] < pixels['height'] - 2, ('vertical clipping',width,pixels)
            if args.screenshots: page.screenshot(path=str(args.screenshots/f'book-flip-{width}.png'))
            page.clock.run_for(1000)
            ready(page)
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'),width
            page.keyboard.press('Escape')
            expect(page.locator('#work-detail')).not_to_be_visible()
            expect(book).to_be_focused()
            assert not errors,errors
            results.append({'width':width,'touch':width<760,'pixels':pixels,'result':'pass'})
            context.close()

        context = browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
        context.add_init_script(PRESERVE_PIXELS)
        page = context.new_page()
        page.goto(base+'/?lang=ko', wait_until='networkidle')
        page.locator('[data-pl-book="inclusive-game-ai"]').tap()
        phase(page, 'turn')
        page.set_viewport_size({'width':844,'height':390})
        phase(page, 'flip')
        pixels = page.locator('.book-flight-canvas').evaluate(PIXELS)
        assert pixels['left'] > 2 and pixels['right'] < pixels['width'] - 2,pixels
        assert pixels['top'] > 2 and pixels['bottom'] < pixels['height'] - 2,pixels
        if args.screenshots: page.screenshot(path=str(args.screenshots/'book-landscape-ko.png'))
        ready(page)
        page.keyboard.press('Escape')
        expect(page.locator('#work-detail')).not_to_be_visible()
        page.set_viewport_size({'width':390,'height':844})
        for mode in ['skip','escape','back','context-loss']:
            book = page.locator('[data-pl-book="inclusive-game-ai"]')
            book.tap()
            expect(page.locator('.book-flight-canvas')).to_have_count(1, timeout=10000)
            expect(page.locator('#work-detail')).to_have_class('catalog-reader book-opening')
            if mode == 'skip':
                page.locator('.book-flight-skip').tap()
                ready(page)
                page.keyboard.press('Escape')
            elif mode == 'escape': page.keyboard.press('Escape')
            elif mode == 'back': page.go_back()
            else:
                page.locator('.book-flight-canvas').evaluate("(canvas)=>canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext()")
                ready(page)
                page.keyboard.press('Escape')
            expect(page.locator('#work-detail')).not_to_be_visible()
            expect(page.locator('.book-in-flight')).to_have_count(0)
            expect(page.locator('.book-flight-canvas')).to_have_count(0)
        context.close()

        for mode in ['reduced','no-webgl','module-failure']:
            context = browser.new_context(reduced_motion='reduce' if mode == 'reduced' else 'no-preference')
            if mode == 'no-webgl':
                context.add_init_script("const get=HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl2'?null:get.call(this,type,...args)}")
            if mode == 'module-failure': context.route('**/book-motion.js*', lambda route: route.abort())
            page = context.new_page()
            page.goto(base,wait_until='networkidle')
            page.locator('[data-pl-book="inclusive-game-ai"]').click()
            ready(page)
            if mode == 'reduced': assert not page.evaluate('performance.getEntriesByType("resource").some(r=>r.name.includes("three.module"))')
            context.close()
        browser.close()
    print(json.dumps({'viewports':results,'interruptions':'pass','rotation':'pass','fallbacks':'pass'},indent=2))
finally:
    shutdown()
