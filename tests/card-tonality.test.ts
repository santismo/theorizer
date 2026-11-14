import assert from 'node:assert/strict';
import {chooseTonalCard,chordKeyDistance} from '../lib/card-tonality.ts';
import {DICE_PALETTES} from '../lib/dice-selection.ts';
import {parseChord,type Chord} from '../lib/harmony.ts';
import {withCardPreview,takeCardBatch,replaceCardPreview} from '../lib/card-selection.ts';
const seed=(start:number)=>{let v=start;return ()=>{v=(Math.imul(v,1664525)+1013904223)>>>0;return v/4294967296}};
const c=parseChord('Cmaj7')!;
assert.deepEqual([...new Set(DICE_PALETTES.Simple)],['m7','7','maj7','dim7']);
for(const quality of new Set(DICE_PALETTES.Simple))assert.equal(DICE_PALETTES.Simple.filter(q=>q===quality).length,5);
assert.equal(chordKeyDistance(c,parseChord('Dm7')!),0);
assert.ok(chordKeyDistance(c,parseChord('F#maj7')!)>0);
for(let root=0;root<12;root++)assert.equal(chordKeyDistance({root,quality:'maj7'},{root:(root+6)%12,quality:'maj7'}),chordKeyDistance(c,parseChord('F#maj7')!));
function simulate(amount:number){let distance=0,far=0;const roots=new Set<number>(),random=seed(92),history:Chord[]=[c];for(let i=0;i<1500;i++){const chord=chooseTonalCard({qualities:DICE_PALETTES.Simple,amount,history,random});const d=chordKeyDistance(history.at(-1)!,chord);distance+=d;if(d>0)far++;roots.add(chord.root);history.push(chord);assert.ok(DICE_PALETTES.Simple.includes(chord.quality));assert.equal('tonal' in chord,false)}return {distance:distance/1500,frequency:far/1500,roots:roots.size}}
const low=simulate(0),middle=simulate(50),high=simulate(100);
assert.ok(low.distance<middle.distance&&middle.distance<high.distance);assert.ok(high.distance>low.distance+1);assert.ok(high.frequency>middle.frequency&&middle.frequency>low.frequency);assert.ok(low.roots>=10,'Even low settings must be able to drift, without a fixed home');
for(const qualities of Object.values(DICE_PALETTES))for(const amount of [0,35,100]){
 const history=[parseChord('F#m7')!,c],args={qualities,amount,history,random:seed(16)};
 const next=chooseTonalCard(args);
 assert.deepEqual(next,chooseTonalCard({...args,history:[{...c,key:6,mode:'Phrygian',tonal:{center:{key:6,mode:'Minor'},pending:[{root:1,quality:'m'}]}} as Chord],random:seed(16)}),'Old centers and earlier history must not anchor the next draw');
 assert.ok(qualities.includes(next.quality as never));
 const held=chooseTonalCard({...args,fixedRoot:6,fixedQuality:qualities[0],exclude:{root:6,quality:qualities[0]}});assert.equal(held.root,6);assert.equal(held.quality,qualities[0]);
}
const draw=(_:Chord,trail:Chord[])=>chooseTonalCard({qualities:DICE_PALETTES.Simple,amount:100,history:trail,random:seed(trail.length)});
const history=withCardPreview({cards:[c],index:0},draw),batch=takeCardBatch(history,16,draw);
assert.equal(batch.chords[1],history.cards[1]);assert.equal(batch.chords.length,16);
const changed=replaceCardPreview(batch.history,(previous,exclude,trail)=>chooseTonalCard({qualities:DICE_PALETTES.Simple,amount:0,history:trail,exclude,random:seed(8)}));
assert.equal(changed.cards[changed.index],batch.history.cards[batch.history.index]);assert.notDeepEqual(changed.cards.at(-1),batch.history.cards.at(-1));
console.log('Adjacent-key movement: independent of center/history metadata, low-setting drift, increasing distance and frequency, held dice, Simple palette, preview/batch consistency.',{low,middle,high});
