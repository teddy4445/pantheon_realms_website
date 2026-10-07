import {GameDriver} from '@pr/testing';
import {createEnvelope,serializeEnvelope} from '@pr/session';
import {quoteConstruction,axialNeighbors,quoteMovement} from '@pr/rules';
import {writeFileSync} from 'node:fs';
const out=process.env.CAPTURE_OUT!;
const save=(d:GameDriver,name:string)=>writeFileSync(`${out}/${name}.prsave.json`,serializeEnvelope(createEnvelope(d.catalog,{match:d.state,campaign:null},{id:'manual-1',kind:'manual',name,savedAt:new Date().toISOString()})));
const sequences:any={};
for(const pid of ['greek','norse','egyptian','japanese','celtic','mesoamerican']){
 const mid=pid==='greek'?'skirmish_twin_harbors':`skirmish_twin_harbors_${pid}_vs_greek`;
 const d=GameDriver.mission(mid,{matchId:`landing-city-${pid}`});
 const owner=d.state.activePlayerId;const town=Object.values(d.state.towns).find(t=>t.ownerId===owner)!;
 const archetype=d.catalog.townArchetypes[town.archetypeId];
 d.state.players[owner].wallet={gold:1000000,wood:100000,stone:100000,crystal:100000,favor:100000};
 town.buildings={};town.buildUsedDay=null;
 const steps:any[]=[{name:'The first foundation',buildings:{},hallLevel:1,day:1}];
 const phases=[
 [['civic_hall',1],['tavern',1],['fortifications',1],['dwelling_t1',1]],
 [['resource_depot',1],['marketplace',1],['workshop',1],['civic_hall',2],['pantheon_temple',1],['mage_guild',1],['dwelling_t2',1],['dwelling_t3',1],['dwelling_t4',1]],
 [['fortifications',2],['civic_hall',3],['pantheon_temple',2],['mage_guild',2],['dwelling_t5',1],['dwelling_t6',1],['watchtower',1],['training_academy',1],['artifact_merchant',1]],
 [['mage_guild',3],['fortifications',3],['dwelling_t7',1],['civic_hall',4],...[1,2,3,4,5,6,7].map(n=>[`dwelling_t${n}`,2])]
 ];
 const pending=phases.flat().map(([s,l])=>archetype.slots.find(x=>x.id===s)?.chain[Number(l)-1]).filter(Boolean) as string[];
 while(pending.length){
  const t=d.state.towns[town.id]; d.state.day=steps.length; t.buildUsedDay=null;
  const at=pending.findIndex(id=>quoteConstruction(d.catalog,d.state,owner,t.id,id).legal);
  if(at<0)throw new Error(pid+' blocked '+pending.map(id=>id+':'+quoteConstruction(d.catalog,d.state,owner,t.id,id).reason).join('; '));
  const id=pending.splice(at,1)[0];const b=d.catalog.buildings[id];
  d.do({kind:'BuildStructure',townId:t.id,buildingId:id});
  steps.push({name:b.name,changedSlot:b.slotId,buildingId:id,level:b.level,buildings:{...d.state.towns[t.id].buildings},hallLevel:Math.max(1,d.state.towns[t.id].buildings.civic_hall??1),day:d.state.day});
 }
 sequences[pid]={archetypeId:archetype.id,steps,method:'Every build accepted by current quoteConstruction and GameDriver; one build per display day; showcase wallet and starting skirmish covenants.'};
 for(const fog of Object.values(d.state.fog))fog.explored=fog.explored.map(()=>1);
 const h=Object.values(d.state.heroes).find(h=>h.ownerId===owner)!;
 h.army.slots=Object.values(d.catalog.creatures).filter(c=>c.pantheonId===pid&&c.form==='upgraded').sort((a,b)=>a.tier-b.tier).map((c,i)=>({stackId:`show-${pid}-${i}`,creatureId:c.id,count:Math.max(3,40-i*5)}));
 save(d,'city-'+pid);
}
writeFileSync(`${out}/city-sequences.json`,JSON.stringify(sequences,null,2));
const d=GameDriver.mission('skirmish_twin_harbors',{matchId:'landing-battle-current'});
const h=d.state.heroes.alexios!, rival=d.state.heroes.rival_odysseus!;
for(const fog of Object.values(d.state.fog))fog.explored=fog.explored.map(()=>1);
const army=(form:string)=>Object.values(d.catalog.creatures).filter(c=>c.pantheonId==='greek'&&c.form===form).sort((a,b)=>a.tier-b.tier).map((c,i)=>({stackId:`${form}-${i}`,creatureId:c.id,count:Math.max(2,20-i*3)}));
h.army.slots=army('base');rival.army.slots=army('upgraded');h.movementPoints=2000;rival.position={q:12,r:8};
for(const n of axialNeighbors(rival.position)){h.position=n;const q=quoteMovement(d.catalog,d.state,h.id,rival.position);if(q.reachable&&q.path.length===1)break;}
d.do({kind:'MoveHero',heroId:h.id,destination:rival.position,confirmEncounter:true});if(!d.state.battle)throw Error('Battle missing');save(d,'battle');
console.log('Validated city sequences and saves for six pantheons; battle save ready.');
