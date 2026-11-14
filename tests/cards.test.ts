import assert from 'node:assert/strict';
import {chooseCard,cardConnectionWeight,stepCard,cardSwipeDirection} from '../lib/card-selection.ts';
import {DICE_PALETTES} from '../lib/dice-selection.ts';
import {parseChord,type Chord} from '../lib/harmony.ts';
const previous=parseChord('G7')!;
for(const qualities of Object.values(DICE_PALETTES)){
 const count=new Set(qualities).size*12,outcomes=new Set<string>();
 for(let i=0;i<count;i++){
  const chord=chooseCard({qualities,randomness:100,previous,random:()=>(i+.5)/count});
  outcomes.add(`${chord.root}:${chord.quality}`);
 }
 assert.equal(outcomes.size,count,'Pure random must be uniform across unique chords, not repeated die faces.');
}
let connected=0,random=0;
for(let i=0;i<1000;i++){
 const draw=()=>(i+.5)/1000;
 const a=chooseCard({qualities:DICE_PALETTES.Classic,randomness:0,previous,random:draw});
 const b=chooseCard({qualities:DICE_PALETTES.Classic,randomness:100,previous,random:draw});
 connected+=cardConnectionWeight(a,previous);random+=cardConnectionWeight(b,previous);
 for(const amount of [0,35,100]){
  const args={qualities:DICE_PALETTES.Extended,randomness:amount,random:draw};
  assert.deepEqual(chooseCard({...args,previous:{...previous,key:0,mode:'Major'}}),chooseCard({...args,previous:{...previous,key:6,mode:'Locrian'}}),'Changing key/mode metadata must never affect cards.');
  assert.deepEqual(chooseCard({...args,previous:undefined}),chooseCard({...args,previous:{root:0,quality:'',empty:true}}));
 }
}
assert.ok(connected>random*1.7,'Connected must favor audibly closer chord relationships.');
for(let root=0;root<12;root++){
 const c:Chord={root,quality:'m7'};
 const shifted:Chord={root:(root+5)%12,quality:c.quality};
 assert.ok(Math.abs(cardConnectionWeight(c,previous)-cardConnectionWeight(shifted,{...previous,root:(previous.root+5)%12}))<1e-10,'Relationships must be invariant under transposition.');
}
const first={cards:[parseChord('C')!],index:0};let draws=0;
const draw=()=>{draws++;return parseChord('F')!};
assert.equal(stepCard(first,'back',draw),first);
const second=stepCard(first,'next',draw),back=stepCard(second,'back',draw),forward=stepCard(back,'next',draw);
assert.equal(draws,1);assert.equal(forward.cards,second.cards);assert.deepEqual(forward,second);assert.equal(first.cards.length,1);
assert.equal(cardSwipeDirection(-80,12,400),'next');assert.equal(cardSwipeDirection(80,12,400),'back');
assert.equal(cardSwipeDirection(-30,2,40),'next');assert.equal(cardSwipeDirection(-20,120,100),null);assert.equal(cardSwipeDirection(4,3,15),null);assert.equal(cardSwipeDirection(30,0,500),null);
console.log('Cards passed: uniform random, relationship strength, key/scale independence, transposition, preserved history, and swipe thresholds.');

// The visible upcoming card is consumed verbatim; changing controls rewrites only the future.
const {withCardPreview,replaceCardPreview,takeCardBatch}=await import('../lib/card-selection.ts');
const {placeChordBatch,placeDiceSets,emptyBar}=await import('../lib/dice.ts');
const {DEFAULT}=await import('../lib/harmony.ts');
let calls=0;
const chain=(previous:Chord)=>{calls++;return {root:(previous.root+5)%12,quality:'m7'}};
const previewed=withCardPreview(first,chain);
assert.equal(calls,1);assert.equal(withCardPreview(previewed,chain),previewed);assert.equal(calls,1);
const advanced=withCardPreview(stepCard(previewed,'next',chain),chain);
assert.equal(advanced.cards[advanced.index],previewed.cards[1]);assert.equal(calls,2);
const backWithPreview=stepCard(advanced,'back',chain);
const rewritten=replaceCardPreview(backWithPreview,(previous,exclude)=>chooseCard({qualities:DICE_PALETTES.Classic,randomness:100,previous,exclude,random:()=>.5}));
assert.deepEqual(rewritten.cards[0],first.cards[0]);assert.equal(rewritten.cards.length,2);
assert.notDeepEqual(rewritten.cards[1],backWithPreview.cards[1]);
assert.equal(backWithPreview.cards.length,3,'Changing the preview must not mutate prior history.');
for(let count=1;count<=16;count++){
 const batch=takeCardBatch(previewed,count,chain);
 assert.equal(batch.chords.length,count);assert.equal(batch.chords[0],previewed.cards[0]);
 if(count>1)assert.equal(batch.chords[1],previewed.cards[1]);
 assert.equal(batch.history.index,count-1);assert.ok(batch.history.cards[count]);
 const kept=placeChordBatch([],batch.chords,DEFAULT);
 assert.equal(kept.length,count);assert.ok(kept.every(c=>c.locked));
 assert.deepEqual(kept.map(c=>[c.root,c.quality]),batch.chords.map(c=>[c.root,c.quality]));
}
const batch16=takeCardBatch(previewed,16,chain).chords;
const occupied=[parseChord('G7')!,emptyBar(),parseChord('C')!];
const filled=placeChordBatch(occupied,batch16.slice(0,3),DEFAULT);
assert.deepEqual(filled[0],occupied[0]);assert.deepEqual(filled[2],occupied[2]);assert.equal(filled.length,5);
assert.deepEqual([filled[1],filled[3],filled[4]].map(c=>c.root),batch16.slice(0,3).map(c=>c.root));
assert.equal(placeChordBatch(occupied,batch16,DEFAULT),occupied,'An overflowing batch must not partially save.');
assert.equal(placeDiceSets([],batch16,DEFAULT).length,0,'Dice mode retains its 8-set limit.');
assert.throws(()=>takeCardBatch(previewed,17,chain));
console.log('Card previews and 1–16 chord batches passed: exact preview consumption, branching, ordered fills, capacity and Dice compatibility.');
