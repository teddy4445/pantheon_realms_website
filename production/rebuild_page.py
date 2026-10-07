from pathlib import Path
import re,json,html
R=Path(__file__).resolve().parents[1]
s=(R/'production/index.html').read_text(encoding='utf-8')
data=json.loads((R/'game-data.js').read_text(encoding='utf-8').split('window.REALMS_DATA = ')[1].rsplit(';',1)[0])
def replace_section(marker,replacement):
 global s
 s=re.sub(r'<section '+marker+r'.*?</section>',lambda m:replacement,s,count=1,flags=re.S)
s=s.replace('<script src="./script.js" defer>','<link rel="stylesheet" href="./refresh.css">\n<script src="./game-data.js" defer></script>\n<script src="./city.js" defer></script>\n<script src="./script.js" defer>')
s=s.replace('./images/social-preview.webp','./images/new/hero-six-realms.png')
s=re.sub(r'<img class="hero-art".*?/>','<img class="hero-art" src="./images/new/hero-six-realms.png" alt="Six mounted champions overlook a shared world of snowy peaks, sacred forests, ancient cities and desert kingdoms" fetchpriority="high" width="1672" height="941">',s,flags=re.S)
s=s.replace('THE GREEK REALM','SIX PANTHEONS. ONE WORLD.').replace('<a href="#battle">Battle</a>','<a href="#origin">Story</a>\n<a href="#cities">Cities</a>\n<a href="#battle">Battle</a>')
names=['explore-celtic','build-egyptian','choose-japanese','conquer-norse'];i=iter(names)
def pillar(m):
 name=next(i);block=m[0];block=re.sub(r'<img .*?/>',f'<img src="./images/new/feature-{name}.png" alt="" loading="lazy" width="1086" height="1448">',block,count=1,flags=re.S)
 return re.sub(r'<span class="chapter">.*?</span>','',block,flags=re.S)
s=re.sub(r'<article class="pillar">.*?</article>',pillar,s,flags=re.S)
descriptions={
'greek':'Stand beneath the gaze of Olympus. Disciplined champions, soaring griffins and thunder-forged giants turn courage into legend.',
'norse':'Follow the northern road through frost and fire. Gather an unyielding host of warriors, wild beasts and ancient powers.',
'egyptian':'Raise your realm beside the golden river. Sacred beasts and timeless guardians answer the sun’s call.',
'japanese':'Enter misted mountains and sacred groves, where warriors and spirits share a world of beauty, balance and formidable power.',
'celtic':'Follow the old paths through living forests and forgotten stone circles. The wild places have their own champions.',
'mesoamerican':'Above a sea of jungle, stepped temples reach toward the sun. Call forth a radiant host of spirits, guardians and living myth.'}
def faction(p,index):
 figures=''.join(f'<figure><img src="{x["image"]}" alt="{html.escape(x["name"])}" width="96" height="96" loading="lazy"><figcaption>{html.escape(x["name"])}</figcaption></figure>' for x in p['creatures'])
 g=p['patron']
 return f'''<div id="pantheon-panel" role="tabpanel" aria-labelledby="tab-{index}" tabindex="0" class="faction-panel">
<img class="faction-art" src="./images/{p['id']}-1920.webp" alt="{p['name']} realm landscape" loading="lazy" width="1672" height="941"><div class="faction-shade"></div>
<div class="faction-copy"><p class="eyebrow">{html.escape(p['epithet'])}</p><h3>{p['name']}</h3><p>{descriptions[p['id']]}</p><p class="roster-label">Your seven creature families</p><div class="faction-creatures">{figures}</div></div>
<aside class="patron-card" aria-label="{html.escape(g['name'])}, patron god"><img src="{g['image']}" alt="{html.escape(g['name'])}" width="256" height="256" loading="lazy"><div><p class="eyebrow">Patron god</p><h4>{html.escape(g['name'])}</h4><p>{html.escape(g['domain'])}</p><blockquote>“{html.escape(g['quote'])}”</blockquote></div></aside></div>'''
s=re.sub(r'<template id="faction-\d+">.*?</template>','',s,flags=re.S)
start=s.index('<div id="pantheon-panel"');end=s.index('</section>',start)
s=s[:start]+faction(data[0],0)+'\n'+s[end:]
s=s.replace('</body>','\n'+''.join(f'<template id="faction-{i}">{faction(p,i)}</template>' for i,p in enumerate(data))+'\n</body>')
origin='''<section id="origin" class="section origin-section">
<div class="origin-heading"><div class="section-head"><p class="eyebrow">The dawn of the realms</p><h2>Before the first crown,<br>there were the gods.</h2></div><p class="lede">At the meeting of six divine powers, a mortal world opens before them. Mountains rise. Sacred fires awaken. And beneath every promise of peace lies a different vision of who should rule.</p></div>
<figure class="origin-art"><img src="./images/new/origin-council.png" alt="The six patron gods gather around a golden map of the mortal realms" loading="lazy" width="1672" height="941"></figure>
<div class="origin-chapters"><article><span aria-hidden="true">✦</span><h3>A world between gods</h3><p>From the halls of Olympus to the deep green places of the old world, six pantheons cast their influence across the same horizon.</p></article><article><span aria-hidden="true">✦</span><h3>A promise. A price.</h3><p>Divine favor offers a path to greatness. Your allegiance shapes the powers you call upon—and the army that answers.</p></article><article><span aria-hidden="true">✦</span><h3>The next age is yours</h3><p>The gods may set the stage. A mortal hero must walk the road, raise the cities and decide how the legend ends.</p></article></div>
</section>'''
replace_section('class="section creatures-section"',origin)
s=re.sub(r'(<section id="battle" class="battle-section">)\s*<img.*?/>',r'\1\n<img src="./images/new/battle-legends.png" alt="Mythological armies clash across an ancient causeway as a spell arcs over their formations" loading="lazy" width="1672" height="941">',s,flags=re.S)
s=re.sub(r'<span class="battle-label">.*?</span>','',s,flags=re.S)
options=''.join(f'<option value="{p["id"]}">{p["name"]}</option>' for p in data)
city=f'''<section id="cities" class="section city-section">
<div class="city-heading"><div class="section-head"><p class="eyebrow">Build the heart of your realm</p><h2>From a first foundation<br>to a seat of the gods.</h2><p class="lede">Watch a town become a capital. Halls rise, defenses strengthen and creature dwellings evolve—one decision at a time.</p></div><label class="city-select-label">Choose your realm<select id="city-pantheon">{options}</select></label></div>
<div class="city-layout"><div class="city-stage" id="city-stage" role="img" aria-label="Greek town development"><div class="city-backgrounds"></div><div class="city-buildings"></div><div class="city-atmosphere" aria-hidden="true"></div><div class="city-corner" aria-hidden="true">✦</div></div>
<div class="city-panel"><p class="eyebrow">A realm taking shape</p><h3 id="city-stage-name">Village</h3><p id="city-description">A place to begin. A future to build.</p><div class="city-milestones" aria-label="Town development stage">{''.join(f'<button type="button" data-city-level="{i}" aria-pressed="{str(i==1).lower()}"><span>{label}</span><small>Hall level {i}</small></button>' for i,label in enumerate(['Village','Town','City','Capital'],1))}</div><p class="city-build-label">Latest construction</p><p id="city-event">The first foundation</p><div class="city-playback"><button id="city-play" type="button" aria-pressed="false">Play development</button><button id="city-replay" type="button" aria-label="Replay city development">↺</button></div><label class="city-timeline-label" for="city-timeline">Development timeline <span id="city-progress">0 / 33</span></label><input id="city-timeline" type="range" min="0" max="33" value="0"><p class="city-detail">Real town art. The game’s building order, upgrades and four town-hall stages, brought together in a time-lapse.</p></div></div><noscript><p>Enable JavaScript to explore the animated town showcase.</p><img src="./images/game/town.greek.background.l4.webp" alt="Greek capital landscape" width="1448" height="1086"></noscript></section>'''
replace_section('class="section town-section"',city)
s=s.replace('<p class="lede">Actual screens from development build 0.11.0. Art and balance continue to evolve.</p>','').replace('<span class="small-caps">A WINDOW INTO YOUR NEXT CAMPAIGN</span>','')
screens=[('town-greek','Greek capital','A city worthy of Olympus'),('adventure','Adventure map','A thousand roads to legend'),('battle','Tactical battle','When legends collide'),('town-egyptian','Egyptian capital','An empire beneath the sun'),('hero','Hero & army','The power behind your banner'),('town-japanese','Japanese capital','Where the spirits gather'),('town-norse','Norse capital','Built to endure the winter'),('recruitment','Creature recruitment','Summon your next legend')]
gallery='<div class="gallery">'+''.join(f'<button class="gallery-item image-button" aria-label="Enlarge {html.escape(label)} screenshot"><div class="gallery-image"><img src="./images/screens-current/{name}.jpg" alt="{html.escape(label)} in the current game" loading="lazy" width="1600" height="1000"><span aria-hidden="true">↗</span></div><span class="gallery-meta"><span><small>{html.escape(label)}</small><strong>{title}</strong></span></span></button>' for name,label,title in screens)+'</div>'
gstart=s.index('<div class="gallery">');gend=s.index('</section>',gstart)
s=s[:gstart]+gallery+'\n'+s[gend:]
s=s.replace('srcSet=','srcset=').replace('fetchPriority=','fetchpriority=')
(R/'index.html').write_text(s,encoding='utf-8')
print('Updated hero, 4 pillars, 42-creature panels, 6 patrons, story, battle, city and gallery.')
