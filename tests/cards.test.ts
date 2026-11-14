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
