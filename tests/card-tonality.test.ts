import assert from 'node:assert/strict';
import {chooseTonalCard,inferTonalCenters,tonalMemory,tonalFit,tonalDistance,type TonalCenter} from '../lib/card-tonality.ts';
import {DICE_PALETTES} from '../lib/dice-selection.ts';
import {parseChord,type Chord} from '../lib/harmony.ts';
import {withCardPreview,takeCardBatch,replaceCardPreview} from '../lib/card-selection.ts';
const parse=(s:string)=>s.split(' ').map(c=>parseChord(c)!);
const seed=(start:number)=>{let value=start;return ()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296}};
assert.deepEqual(inferTonalCenters([]),[]);
for(const [text,key,mode] of [['C F Dm G7 C',0,'Major'],['Am Dm E7 Am',9,'Minor'],['Dm Gm A7 Dm',2,'Minor'],['F Bb Gm C7 F',5,'Major']] as const){
 const top=inferTonalCenters(parse(text))[0];assert.equal(top.key,key);assert.equal(top.mode,mode);
}
const context=parse('C F Dm G7 C');
const metadataChanged=context.map(c=>({...c,key:6,mode:'Phrygian'}));
assert.deepEqual(inferTonalCenters(context),inferTonalCenters(metadataChanged));
for(const amount of [0,35,100])assert.deepEqual(chooseTonalCard({qualities:DICE_PALETTES.Classic,amount,history:context,random:seed(42)}),chooseTonalCard({qualities:DICE_PALETTES.Classic,amount,history:metadataChanged,random:seed(42)}));
for(const qualities of Object.values(DICE_PALETTES)){
 const history=context.slice(),rnd=seed(123);const center:TonalCenter={key:0,mode:'Major'};
 for(let i=0;i<60;i++){
  const c=chooseTonalCard({qualities,amount:0,history,random:rnd});history.push(c);
  assert.deepEqual(c.tonal.center,center);assert.equal(c.tonal.target,undefined);assert.equal(tonalFit(c,center),1);assert.ok(qualities.includes(c.quality as never));
 }
}
function simulate(amount:number){
 let arrivals=0,distance=0,plans=0;
 for(let s=1;s<=16;s++){
  const history=context.slice(),rnd=seed(s);
  for(let i=0;i<60;i++){
   const old=tonalMemory(history.at(-1));
   const c=chooseTonalCard({qualities:DICE_PALETTES.Classic,amount,history,random:rnd});history.push(c);
   assert.ok(DICE_PALETTES.Classic.includes(c.quality));
   if(c.tonal.target&&!old?.target){plans++;distance+=tonalDistance(c.tonal.center,c.tonal.target)}
   if(old?.target&&old.pending.length===1){arrivals++;assert.deepEqual(c.tonal.center,old.target);assert.equal(c.root,old.target.key);assert.equal(c.tonal.target,undefined)}
   else if(old?.pending.length){assert.equal(c.root,old.pending[0].root);assert.equal(c.quality,old.pending[0].quality)}
  }
 }
 return {arrivals,plans,averageDistance:distance/Math.max(1,plans)};
}
const near=simulate(25),far=simulate(100);
assert.ok(far.arrivals>near.arrivals*1.4);assert.ok(far.averageDistance>near.averageDistance+1);
const rnd=seed(37),draw=(previous:Chord,trail:Chord[])=>chooseTonalCard({qualities:DICE_PALETTES.Extended,amount:100,history:[...context,...trail],random:rnd});
const history=withCardPreview({cards:[context.at(-1)!],index:0},draw),preview=history.cards[1];
const batch=takeCardBatch(history,16,draw);
assert.equal(batch.chords[1],preview);assert.equal(batch.chords.length,16);assert.ok(batch.history.cards[16]);
const branch=replaceCardPreview(batch.history,(previous,exclude,trail)=>chooseTonalCard({qualities:DICE_PALETTES.Altered,amount:0,history:[...context,...trail],exclude,random:seed(3)}));
assert.equal(branch.cards[branch.index],batch.history.cards[batch.history.index]);
assert.equal(tonalMemory(branch.cards.at(-1))?.target,undefined);
assert.ok(DICE_PALETTES.Altered.includes(branch.cards.at(-1)!.quality as never));
// A palette without triadic tonics still has a bounded, valid fallback.
assert.equal(chooseTonalCard({qualities:['sus2'],amount:100,history:context,random:()=>0}).quality,'sus2');
console.log('Tonal cards passed: key inference, ambiguity ranking, settings independence, stable home, planned arrivals, distance/frequency control, preview/batch consistency, palette changes.',{near,far});
