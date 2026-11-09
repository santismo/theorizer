import assert from 'node:assert/strict';
import {chooseDice,DICE_PALETTES,connectionWeight,initialPositions,scatterDice} from '../lib/dice-selection.ts';
import {QUALITIES,parseChord,DEFAULT,pitchClasses,SCALES} from '../lib/harmony.ts';
const settings={...DEFAULT,key:0,mode:'Major'},previous=parseChord('G7')!;
for(const faces of Object.values(DICE_PALETTES)){assert.equal(faces.length,20);assert.ok(faces.every(q=>QUALITIES[q]));const outcomes=new Set<string>();for(let i=0;i<240;i++){const c=chooseDice({faces,randomness:100,settings,previous,random:()=>(i+.5)/240});outcomes.add(`${c.root}:${c.face}`)}assert.equal(outcomes.size,240,'Pure random must cover each root/face pair equally');}
let connected=0,random=0,outConnected=0,outRandom=0;
for(let i=0;i<2000;i++){const rnd=()=>(i+.5)/2000;for(const amount of [0,100]){const c=chooseDice({faces:DICE_PALETTES.Classic,randomness:amount,previous,settings,random:rnd});const quality=DICE_PALETTES.Classic[c.face],weight=connectionWeight(c.root,quality,previous,settings),outside=pitchClasses({root:c.root,quality}).filter(n=>!SCALES.Major.includes(n)).length;if(amount===0){connected+=weight;outConnected+=outside}else{random+=weight;outRandom+=outside}}}
assert.ok(connected>random*2,'Connected must materially favor stronger relationships');assert.ok(outConnected<outRandom*.5,'Connected favors the chosen key');
for(const amount of [0,35,100]){const c=chooseDice({faces:DICE_PALETTES.Extended,randomness:amount,settings,previous,fixedRoot:6,fixedFace:4});assert.equal(c.root,6);assert.equal(c.face,4);}
for(let count=2;count<=4;count++){let positions=initialPositions(count);for(let i=0;i<100;i++){const moving=i%2?Array.from({length:count},(_,j)=>j):[0],before=structuredClone(positions);positions=scatterDice(positions,moving);assert.equal(new Set(positions.map(p=>p.slot)).size,count);assert.ok(positions.every(p=>p.x>=.22&&p.x<=.78&&p.y>=.25&&p.y<=.75));for(let j=0;j<count;j++)if(!moving.includes(j))assert.deepEqual(positions[j],before[j]);}}
console.log('All 3 palettes, 720 equiprobable random outcomes, stronger connected choices, held faces, bounded arena destinations and stationary held dice passed.');
