import assert from 'node:assert/strict';
import {chooseLogicChord,chooseLogicDice,voiceTravel,type ChordLogic} from '../lib/chord-logic.ts';
import {DICE_PALETTES} from '../lib/dice-selection.ts';
import {parseChord,voice,pitchClasses,type Chord} from '../lib/harmony.ts';
import {placeDiceSets} from '../lib/dice.ts';
import {DEFAULT} from '../lib/harmony.ts';
const seed=(start:number)=>{let v=start;return ()=>{v=(Math.imul(v,1664525)+1013904223)>>>0;return v/4294967296}};
const context='C F Dm G7 C'.split(' ').map(c=>parseChord(c)!);
const faces=DICE_PALETTES.Classic;
for(const logic of ['connection','tonal','voice'] as ChordLogic[]){
 for(const amount of [0,50,100]){
  const args={logic,amount,history:context};
  const card=chooseLogicChord({...args,qualities:faces,random:seed(22)}),dice=chooseLogicDice({...args,faces,random:seed(22)});
  assert.deepEqual(dice.chord,card);assert.equal(faces[dice.face],card.quality);
  const altered=context.map(c=>({...c,key:6,mode:'Phrygian'}));
  assert.deepEqual(chooseLogicChord({...args,qualities:faces,history:altered,random:seed(22)}),card);
  for(const fixedRoot of [0,6,11])for(const fixedFace of [0,3,5]){
   const held=chooseLogicDice({...args,faces,fixedRoot,fixedFace,random:seed(22)});
   assert.equal(held.root,fixedRoot);assert.equal(held.face,fixedFace);assert.equal(held.chord.quality,faces[fixedFace]);
  }
 }
}
function movement(amount:number){
 const random=seed(96);let total=0;
 for(let i=0;i<400;i++){
  const chord=chooseLogicChord({logic:'voice',amount,qualities:faces,history:context,random});
  assert.deepEqual(voice(chord),chord.voicing);
  assert.ok(chord.voicing!.every(n=>n>=28&&n<=84&&pitchClasses(chord).includes(n%12)));
  assert.ok(pitchClasses(chord).every(pc=>chord.voicing!.some(n=>n%12===pc)));
  total+=voiceTravel(voice(context.at(-1)!),voice(chord));
 }
 return total/400;
}
const smooth=movement(0),angular=movement(100);assert.ok(angular>smooth+1,`${smooth} vs ${angular}`);
const history:Chord[]=context.slice(),rolled:Chord[]=[];
for(let i=0;i<8;i++){const c=chooseLogicDice({logic:'voice',amount:0,faces,history,random:seed(i+1)}).chord;history.push(c);rolled.push(c)}
const saved=placeDiceSets([],rolled,DEFAULT);assert.equal(saved.length,8);
for(let i=0;i<8;i++)assert.deepEqual(voice(saved[i]),rolled[i].voicing);
const restored=JSON.parse(JSON.stringify(saved));assert.deepEqual(restored.map(voice),saved.map(voice));
assert.notDeepEqual(voice({...context[0],voicing:[60,61]}),[60,61]);
console.log('Shared chord logic passed: card/dice parity, held faces, composer independence, valid saved voicings, slider separation.',{smooth,angular});
