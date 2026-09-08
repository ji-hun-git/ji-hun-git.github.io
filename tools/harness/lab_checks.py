"""Exercise every simulation renderer and the on-demand loading failure state."""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
from run_browser import ROOT,serve
parser=argparse.ArgumentParser()
parser.add_argument('--screenshots',type=Path)
args=parser.parse_args()
if args.screenshots:args.screenshots.mkdir(parents=True,exist_ok=True)
port,shutdown=serve(ROOT)
base=f'http://127.0.0.1:{port}'
results=[]
try:
    with sync_playwright() as p:
        browser=p.chromium.launch()
        page=browser.new_page(viewport={'width':1440,'height':1000})
        errors=[]
        page.on('pageerror',lambda error:errors.append(str(error)))
        page.goto(base+'/laboratory.html',wait_until='networkidle')
        expect(page.locator('#simulationCanvas')).to_have_attribute('data-ready','true')
        initial_modules=page.evaluate('performance.getEntriesByType("resource").filter(r=>r.name.includes("/simulations/")).length')
        assert initial_modules < 6,initial_modules
        ids=page.locator('[data-project-id]').evaluate_all('(els)=>els.map(el=>el.dataset.projectId)')
        assert len(ids)==28,len(ids)
        for ident in ids:
            page.locator(f'[data-project-id="{ident}"]').click()
            canvas=page.locator('#simulationCanvas')
            expect(canvas).to_have_attribute('data-ready','true')
            page.wait_for_timeout(300)
            colors=canvas.evaluate('''c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;const colors=new Set();for(let i=0;i<d.length;i+=160)colors.add(d.slice(i,i+4).join(','));return colors.size;}''')
            assert colors>4,(ident,colors)
            if '3d' in ident or ident=='nbody-gravity-3d':
                first=canvas.screenshot()
                page.wait_for_timeout(200)
                assert first!=canvas.screenshot(),(ident,'not moving')
            page.locator('[data-control="pause"]').click()
            page.locator('[data-control="reset"]').click()
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),ident
            results.append({'simulation':ident,'pixelColors':colors,'mounted':'pass'})
        for width in [375,390,430,768,1024,1440,1920]:
            page.set_viewport_size({'width':width,'height':844 if width<760 else 1000})
            page.locator('[data-project-id="behavior-prompt-gridworld"]').click()
            expect(page.locator('#simulationCanvas')).to_have_attribute('data-ready','true')
            page.wait_for_timeout(250)
            page.evaluate('scrollTo({top:0,behavior:"instant"})')
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),width
            if args.screenshots:page.screenshot(path=str(args.screenshots/f'lab-{width}.png'))
        page.set_viewport_size({'width':1200,'height':630})
        page.goto(base+'/laboratory.html',wait_until='networkidle')
        expect(page.locator('#simulationCanvas')).to_have_attribute('data-ready','true')
        if args.screenshots:page.screenshot(path=str(args.screenshots/'simulations-og.png'))
        page.goto(base+'/404.html')
        expect(page.locator('h1')).to_contain_text('page')
        page.goto(base+'/interactive.html')
        expect(page.locator('.catalog-row')).to_have_count(37)
        # A failed lazy module offers a working retry rather than leaving a blank canvas.
        failed=browser.new_page()
        failed.route('**/simulations/gridworld-prompt.js*',lambda route:route.abort())
        failed.goto(base+'/laboratory.html')
        expect(failed.locator('.load-error')).to_be_visible()
        failed.unroute('**/simulations/gridworld-prompt.js*')
        failed.get_by_role('button',name='Try again',exact=True).click()
        expect(failed.locator('#simulationCanvas')).to_have_attribute('data-ready','true')
        assert not errors,errors
        browser.close()
    print(json.dumps({'initialSimulationRequests':initial_modules,'renderers':results,'routeChecks':'pass','errors':errors},indent=2))
finally:shutdown()
