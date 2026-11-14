import assert from 'node:assert/strict';
import {availableDiceSlots,placeDiceSets,emptyBar} from '../lib/dice.ts';
import {DEFAULT,parseChord,harmonicPlan} from '../lib/harmony.ts';
const rolled=['C','Dm','Em','F','G7','Am','Bdim','Cmaj7'].map(name=>parseChord(name)!);
for(let count=1;count<=8;count++){
 const next=placeDiceSets([],rolled.slice(0,count),DEFAULT);
 assert.equal(next.length,count);
 assert.deepEqual(next.map(c=>[c.root,c.quality]),rolled.slice(0,count).map(c=>[c.root,c.quality]));
 assert.ok(next.every(c=>c.locked));
}
const existing=[rolled[4],emptyBar(),rolled[6],emptyBar()];
const snapshot=structuredClone(existing);
const filled=placeDiceSets(existing,rolled.slice(0,3),DEFAULT);
assert.deepEqual(existing,snapshot);
assert.deepEqual(filled.filter((_,i)=>[0,2].includes(i)),[existing[0],existing[2]]);
assert.deepEqual([filled[1],filled[3],filled[4]].map(c=>c.root),rolled.slice(0,3).map(c=>c.root));
assert.deepEqual(availableDiceSlots(existing).slice(0,4),[1,3,4,5]);
const nearlyFull=Array.from({length:15},()=>rolled[0]);
assert.equal(placeDiceSets(nearlyFull,rolled.slice(0,2),DEFAULT),nearlyFull);
assert.equal(placeDiceSets(nearlyFull,rolled.slice(0,1),DEFAULT).length,16);
assert.equal(placeDiceSets(existing,[],DEFAULT),existing);
assert.equal(placeDiceSets(existing,[emptyBar()],DEFAULT),existing);
const settings={...DEFAULT,count:4,modulation:'Up a whole step'};
const modulated=placeDiceSets([],rolled,settings),plan=harmonicPlan({...settings,count:8},8);
assert.deepEqual(modulated.map(c=>[c.key,c.mode]),plan.map(s=>[s.key,s.mode]));
console.log('Dice sets: 1–8 results, ordered gap filling, immutability, full-batch capacity, locking, and modulation passed.');
