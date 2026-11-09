import assert from 'node:assert/strict';
import {chordConnection,previousSoundingChord} from '../lib/chord-connection.ts';
import {parseChord,QUALITIES,type Chord} from '../lib/harmony.ts';
import {emptyBar} from '../lib/dice.ts';
const chord=(s:string)=>parseChord(s)!;
const explain=(a:string,b:string)=>chordConnection(chord(a),chord(b),0,'Major')!;
assert.equal(explain('G7','C').technique,'Dominant resolution');
assert.match(explain('G7','C').detail,/B up to C/);
assert.equal(explain('Bdim','C').technique,'Leading-tone resolution');
assert.equal(explain('Db7','C').technique,'Tritone substitution');
assert.equal(explain('C','Cm').technique,'Parallel color');
assert.equal(explain('Dm','G').technique,'In-key movement');
assert.equal(explain('C','E').technique,'Chromatic mediant');
assert.match(explain('C','E').detail,/Hold E/);
assert.equal(explain('C','F#m7').technique,'Common-tone bridge');
assert.match(explain('C','F#m7').detail,/Hold E/);
assert.notEqual(explain('Gmaj7','C').technique,'Dominant resolution');
assert.equal(explain('C','C#').technique,'Chromatic slide');
assert.equal(explain('C','F#').technique,'Dominant bridge');
assert.match(explain('C','F#').detail,/C#7 before F#/);
assert.equal(explain('C','C/E').technique,'Bass change');
assert.equal(explain('C','C').technique,'Repeat');
assert.equal(explain('Fm','C').technique,'Minor-plagal color');
const pivot=chordConnection({...chord('Am'),key:0,mode:'Major'},{...chord('G'),key:7,mode:'Major'},7,'Major')!;
assert.equal(pivot.technique,'Pivot chord');assert.match(pivot.detail,/D7 → G/);
assert.equal(chordConnection(undefined,chord('C'),0,'Major'),null);
assert.equal(chordConnection(chord('C'),emptyBar(),0,'Major'),null);
assert.equal(previousSoundingChord([chord('C'),emptyBar(),chord('E')],2)!.root,0);
assert.equal(previousSoundingChord([],0,chord('G'))!.root,7);
// Every supported destination gets a short, valid explanation. Non-tonic chord types
// must not be mislabeled as dominant resolutions or given tonicizing dominants.
let checked=0;
for(const quality of Object.keys(QUALITIES))for(let root=0;root<12;root++){
 const target:Chord={root,quality};const info=chordConnection(chord('C'),target,0,'Major')!;
 assert.ok(info.detail.length<170);assert.ok(!/undefined|NaN/.test(info.detail));
 const intervals=QUALITIES[quality];if(!intervals.includes(7)||!intervals.includes(3)&&!intervals.includes(4))assert.notEqual(info.technique,'Dominant bridge');
 checked++;
}
console.log(`Concise connections verified for ${checked} destinations, plus cadence, pivot, common tone, chromatic, slash-bass and empty-bar cases.`);
