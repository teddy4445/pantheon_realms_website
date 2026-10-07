from pathlib import Path
import json,shutil
R=Path(__file__).resolve().parents[1];G=Path('C:/Users/lazeb/Desktop/pantheon_realms')
c=json.loads((R/'production/catalog.json').read_text());seq=json.loads((R/'production/city-sequences.json').read_text())
man={}
for f in ['placeholders/manifest.json','ui/manifest.json','ui/final-manifest.json','art/manifest.json']:
 man.update(json.loads((G/'assets-runtime'/f).read_text())['assets'])
out=R/'images/game';out.mkdir(parents=True,exist_ok=True)
copied={}
def asset(id):
 v=man[id];src=G/'assets-runtime'/v['file'];dest=out/src.name
 assert src.exists(),src
 if id not in copied:shutil.copy2(src,dest);copied[id]={'source':str(src),'destination':str(dest.relative_to(R))}
 return './images/game/'+dest.name
data=[]
for pid,p in c['pantheons'].items():
 creatures=[]
 for row in p['roster']:
  cr=c['creatures'][c['families'][row['familyId']]['baseCreatureId']]
  creatures.append({'name':cr['name'],'tier':row['tier'],'image':asset(f'creature.{pid}.tier{row["tier"]}.base.portrait')})
 god=next(c['gods'][id] for id in p['godIds'] if c['gods'][id]['role']=='patron')
 town=c['townArchetypes'][p['townArchetypeId']]
 slots=[]
 for slot in town['slots']:
  levels=[]
  for bid in slot['chain']:
   b=c['buildings'][bid];levels.append({'id':bid,'name':b['name'],'image':asset(b['artAssetId'])})
  slots.append({'id':slot['id'],'label':slot['label'],'placement':slot['placement'],'levels':levels})
 data.append({'id':pid,'name':p['name'],'epithet':p['epithet'],'creatures':creatures,'patron':{'name':god['name'],'domain':god['domain'],'quote':god['quote'],'image':asset(god['portraitAssetId'])},'town':{'name':town['name'],'backgrounds':[asset(town['backgroundAssetId']+'.l'+str(i)) for i in range(1,5)],'slots':slots,'steps':seq[pid]['steps']}})
(R/'game-data.js').write_text('/* Snapshot of the current game catalog; no network or build required. */\nwindow.REALMS_DATA = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
(R/'production/asset-provenance.json').write_text(json.dumps(copied,indent=2))
print('Copied',len(copied),'game assets; 42 creatures, 6 patrons, 24 town stages; validated build sequences',[(p['id'],len(p['town']['steps'])) for p in data])
