"""Exercise every simulation renderer, the reduced-motion, error and no-JS states,
and the behaviour the Simulations page promises in its copy."""
import argparse
import json
import re
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
from run_browser import ROOT,serve
from static_checks import bookshelf_enabled
parser=argparse.ArgumentParser()
parser.add_argument('--screenshots',type=Path)
args=parser.parse_args()
if args.screenshots:args.screenshots.mkdir(parents=True,exist_ok=True)
port,shutdown=serve(ROOT)
base=f'http://127.0.0.1:{port}'
results=[]
checks={}

# Counts requestAnimationFrame callbacks, to prove that switching simulations
# never leaves an old loop running and that Pause really stops the loop.
RAF_PROBE='''(()=>{const raf=window.requestAnimationFrame.bind(window);window.__raf=0;
window.requestAnimationFrame=(cb)=>raf((t)=>{window.__raf++;cb(t);});})();'''
# Layout-shift total for the page load (FP-01).
CLS_PROBE='''(()=>{window.__cls=0;try{new PerformanceObserver((l)=>{for(const e of l.getEntries())
if(!e.hadRecentInput)window.__cls+=e.value;}).observe({type:'layout-shift',buffered:true});}catch(e){}})();'''
PIXELS='''c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;const colors=new Set();
for(let i=0;i<d.length;i+=160)colors.add(d.slice(i,i+4).join(','));return colors.size;}'''

def page_errors(page,sink):
    page.on('pageerror',lambda error:sink.append(str(error)))
    # Console errors include Subresource Integrity failures for KaTeX. The site
    # icons are produced by another step and may be absent in a partial tree.
    def console(msg):
        if msg.type!='error':return
        url=(msg.location or {}).get('url','')
        if re.search(r'(favicon|apple-touch-icon)',url):return
        sink.append('console: '+msg.text)
    page.on('console',console)

def select(page,ident):
    page.locator(f'[data-project-id="{ident}"]').click()
    expect(page.locator('#simulationCanvas')).to_have_attribute('data-ready','true')
    expect(page.locator('#simulationCanvas')).to_have_attribute('aria-busy','false')

def raf_rate(page,ms=1000):
    before=page.evaluate('window.__raf')
    page.wait_for_timeout(ms)
    return page.evaluate('window.__raf')-before

def log_lines(page):
    return page.locator('#simulationLog li').evaluate_all('els=>els.map(e=>e.textContent)')

try:
    with sync_playwright() as p:
        browser=p.chromium.launch()
        page=browser.new_page(viewport={'width':1440,'height':1000})
        page.add_init_script(RAF_PROBE)
        errors=[]
        page_errors(page,errors)
        page.goto(base+'/laboratory.html',wait_until='networkidle')
        expect(page.locator('#simulationCanvas')).to_have_attribute('data-ready','true')
        initial_modules=page.evaluate('performance.getEntriesByType("resource").filter(r=>r.name.includes("/simulations/")).length')
        assert initial_modules < 6,initial_modules
        # The first load writes the route, and the equations render (KaTeX with SRI).
        assert page.evaluate('location.hash')=='#behavior-prompt-gridworld',page.evaluate('location.hash')
        expect(page.locator('.equation .katex').first).to_be_visible()
        assert page.locator('.math-fallback').count()==0
        ids=page.locator('[data-project-id]').evaluate_all('(els)=>els.map(el=>el.dataset.projectId)')
        assert len(ids)==28,len(ids)
        for ident in ids:
            select(page,ident)
            canvas=page.locator('#simulationCanvas')
            page.wait_for_timeout(300)
            colors=canvas.evaluate(PIXELS)
            assert colors>4,(ident,colors)
            if '3d' in ident or ident=='nbody-gravity-3d':
                first=canvas.screenshot()
                page.wait_for_timeout(200)
                assert first!=canvas.screenshot(),(ident,'not moving')
            # Exactly one mode is pressed, and every slider shows the model's value.
            pressed=page.locator('[data-variation][aria-pressed="true"]').count()
            assert pressed==1,(ident,'pressed modes',pressed)
            outputs=page.locator('.control-row output').evaluate_all('els=>els.map(e=>e.textContent.trim())')
            assert len(outputs)==4 and all(outputs),(ident,outputs)
            # One loop per running simulation, none left behind by the last one.
            rate=raf_rate(page,700)
            assert rate<=60,(ident,'raf callbacks in 0.7 s',rate)
            # Pause stops the loop; Reset while paused still leaves a drawn frame.
            page.locator('[data-control="pause"]').click()
            expect(page.locator('[data-control="pause"]')).to_have_text('Run')
            assert page.locator('[data-control="pause"]').get_attribute('aria-pressed') is None
            page.locator('[data-control="reset"]').click()
            page.wait_for_timeout(150)
            paused=raf_rate(page,400)
            assert paused<=2,(ident,'raf while paused',paused)
            after=canvas.evaluate(PIXELS)
            assert after>4,(ident,'blank after pause and reset',after)
            page.locator('[data-control="pause"]').click()
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),ident
            results.append({'simulation':ident,'pixelColors':colors,'mounted':'pass'})

        # Behaviour the copy states.
        select(page,'lunar-lander')
        page.wait_for_timeout(7000)
        landed=int(page.locator('#metricEnergy').inner_text().rstrip('%'))
        assert landed>0,('lunar lander never lands',landed)
        checks['lunarLanderSuccessPct']=landed
        select(page,'breakout-ai')
        page.wait_for_timeout(8000)
        bricks=int(page.locator('#metricEnergy').inner_text())
        assert bricks>0,('breakout clears no bricks',bricks)
        checks['breakoutBricks']=bricks
        select(page,'frozen-lake')
        page.wait_for_timeout(500)
        slip=page.locator('#turbulenceValue').inner_text()
        solved=[line for line in log_lines(page) if 'Value iteration solved' in line]
        assert solved and f'slip {slip}' in solved[0],(slip,solved)
        checks['frozenLakeSlipReadout']=slip
        select(page,'double-pendulum')
        page.locator('[data-variation="pair"]').click()
        assert any('· 2 double pendulums' in line for line in log_lines(page)),log_lines(page)
        select(page,'connect-four')
        expect(page.locator('[data-variation="medium"]')).to_have_attribute('aria-pressed','true')
        assert any('depth 4 vs. 4' in line for line in log_lines(page)),log_lines(page)

        # Keyboard: choosing a simulation keeps focus on its catalog entry, and
        # the single-key shortcuts only act inside the catalog.
        link=page.locator('[data-project-id="plinko"]')
        link.focus()
        page.keyboard.press('Enter')
        expect(page.locator('#simulationCanvas')).to_have_attribute('data-ready','true')
        assert page.evaluate('document.activeElement.dataset.projectId')=='plinko'
        page.locator('#seedControl').focus()
        page.keyboard.press('j')
        assert page.evaluate('location.hash')=='#plinko',page.evaluate('location.hash')

        # An unknown route falls back to Fig. 01 and says so; the skip link is not a route.
        page.goto(base+'/laboratory.html#no-such-simulation',wait_until='networkidle')
        expect(page.locator('.viewport-notice')).to_contain_text('not in the list')
        assert page.evaluate('location.hash')=='#behavior-prompt-gridworld'
        skip=browser.new_page(viewport={'width':1440,'height':1000})
        page_errors(skip,errors)
        skip.goto(base+'/laboratory.html#plinko',wait_until='networkidle')
        expect(skip.locator('#simulationCanvas')).to_have_attribute('data-ready','true')
        skip.keyboard.press('Tab')
        expect(skip.locator('.skip-link')).to_be_focused()
        skip.keyboard.press('Enter')
        skip.wait_for_timeout(300)
        assert skip.locator('.viewport-notice').count()==0
        expect(skip.locator('#viewport-title')).to_have_text('Plinko (Galton Board)')
        skip.close()

        page.goto(base+'/404.html')
        page.goto(base+'/laboratory.html',wait_until='networkidle')
        for width in [375,390,430,768,1024,1440,1920]:
            page.set_viewport_size({'width':width,'height':844 if width<760 else 1000})
            page.locator('[data-project-id="behavior-prompt-gridworld"]').click()
            expect(page.locator('#simulationCanvas')).to_have_attribute('data-ready','true')
            page.wait_for_timeout(250)
            page.evaluate('scrollTo({top:0,behavior:"instant"})')
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),width
            # The figure comes first on narrow screens, with its controls right below it.
            if width<=860:
                stage=page.locator('.viewport-stage').bounding_box()
                panel=page.locator('#controlMount').bounding_box()
                assert stage['y']<400,(width,'figure starts at',stage['y'])
                assert panel['y']<stage['y']+stage['height']+400,(width,'controls start at',panel['y'])
            if args.screenshots:page.screenshot(path=str(args.screenshots/f'lab-{width}.png'))
        page.set_viewport_size({'width':1200,'height':630})
        page.goto(base+'/laboratory.html',wait_until='networkidle')
        expect(page.locator('#simulationCanvas')).to_have_attribute('data-ready','true')
        if args.screenshots:page.screenshot(path=str(args.screenshots/'simulations-og.png'))
        page.goto(base+'/404.html')
        expect(page.locator('h1')).to_contain_text('page')
        page.goto(base+'/interactive.html')
        # The old portfolio URL redirects to the site root: the bookshelf when it
        # is switched on, the CV while it is off.
        if bookshelf_enabled():
            expect(page.locator('.catalog-row')).to_have_count(37)
        else:
            expect(page.locator('#cv-start')).to_be_visible()
            expect(page.locator('#pubItems .cv-paper-heading')).to_have_count(21)
            expect(page.locator('.catalog-row')).to_have_count(0)

        # Reduced motion: every simulation starts paused on a drawn frame and says why.
        reduced=browser.new_context(viewport={'width':1440,'height':1000},reduced_motion='reduce')
        rpage=reduced.new_page()
        page_errors(rpage,errors)
        rpage.goto(base+'/laboratory.html',wait_until='networkidle')
        for ident in ids:
            select(rpage,ident)
            expect(rpage.locator('[data-control="pause"]')).to_have_text('Run')
            expect(rpage.locator('#viewport-note')).to_be_visible()
            colors=rpage.locator('#simulationCanvas').evaluate(PIXELS)
            assert colors>4,(ident,'blank under reduced motion',colors)
        reduced.close()

        # No JavaScript: the count is already right and the page says what is missing.
        nojs=browser.new_context(java_script_enabled=False)
        npage=nojs.new_page()
        npage.goto(base+'/laboratory.html')
        expect(npage.locator('#metricProjects')).to_have_text('28')
        expect(npage.locator('.noscript-note')).to_be_visible()
        nojs.close()

        # Layout shift while the page builds itself (FP-01).
        for label,viewport,mobile in [('desktop',{'width':1440,'height':900},False),('phone',{'width':390,'height':844},True)]:
            ctx=browser.new_context(viewport=viewport,is_mobile=mobile,has_touch=mobile)
            cpage=ctx.new_page()
            cpage.add_init_script(CLS_PROBE)
            cpage.goto(base+'/laboratory.html',wait_until='networkidle')
            expect(cpage.locator('#simulationCanvas')).to_have_attribute('data-ready','true')
            cpage.wait_for_timeout(1500)
            cls=cpage.evaluate('window.__cls')
            checks[f'cls_{label}']=round(cls,3)
            assert cls<0.1,(label,'CLS',cls)
            ctx.close()

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
    print(json.dumps({'initialSimulationRequests':initial_modules,'renderers':results,'behaviour':checks,'routeChecks':'pass','errors':errors},indent=2))
finally:shutdown()
