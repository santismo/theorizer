import assert from 'node:assert/strict';
import {CHORD_FACES,rollFace,placeChord,emptyBar,tensionChange} from '../lib/dice.ts';
import {DEFAULT,QUALITIES,parseChord,voice,pitchClasses,makeMidi,generate} from '../lib/harmony.ts';
import {newSong,addSongSection,normalizeSong,sectionContext} from '../lib/song.ts';
import {guitarFingerings} from '../lib/guitar.ts';
assert.equal(CHORD_FACES.length,20);assert.ok(CHORD_FACES.every(q=>QUALITIES[q]));
assert.equal(new Set(Array.from({length:12},(_,i)=>rollFace(12,()=>(i+.5)/12))).size,12);
assert.equal(new Set(Array.from({length:20},(_,i)=>rollFace(20,()=>(i+.5)/20))).size,20);
const settings={...DEFAULT,key:0,mode:'Major',count:4},c=parseChord('G7')!;
const before=[parseChord('Cmaj7')!],snapshot=structuredClone(before);
const result=placeChord(before,c,3,settings);
assert.deepEqual(before,snapshot);assert.equal(result.length,4);assert.ok(result[1].empty&&result[2].empty);assert.equal(result[3].quality,'7');assert.equal(result[3].key,0);assert.ok(result[3].locked);
const repeated=placeChord(result,result[3],1,settings);assert.deepEqual(repeated[1],repeated[3]);assert.notEqual(repeated[1],repeated[3]);assert.deepEqual(result[3],repeated[3]);
assert.equal(placeChord(result,c,0,settings),result,'Occupied bars must never be overwritten');assert.equal(placeChord(result,c,16,settings),result);assert.equal(placeChord(result,c,-1,settings),result);
const modulated=placeChord([],c,3,{...settings,modulation:'Up a whole step'});assert.equal(modulated[3].key,2);
assert.ok(tensionChange(parseChord('C')!,c,0,'Major').delta!<0);assert.ok(tensionChange(c,parseChord('C')!,0,'Major').delta!>0);
const empty=emptyBar();assert.deepEqual(voice(empty),[]);assert.deepEqual(pitchClasses(empty),[]);assert.deepEqual(guitarFingerings(empty),[]);
let song=newSong();song.sections[0].chords=result;assert.deepEqual(normalizeSong(JSON.parse(JSON.stringify(song)))!.sections[0].chords,result);song=addSongSection(song);assert.equal(sectionContext(song)!.chords.length,2);assert.ok(!sectionContext(song)!.previous?.empty);
const generated=generate(settings,result,.45);assert.ok(generated.every(c=>!c.empty));assert.equal(generated[3].quality,'7');
const single=generate(settings,result,.42,2);assert.ok(single[1].empty);assert.ok(!single[2].empty);assert.deepEqual(single[3],result[3]);
// Parse MIDI to verify empty slots consume full bars without sounding a dummy C chord.
const midi=makeMidi([empty,c,empty,c],80);let offset=22,tick=0;const ons:number[]=[];
function vl(){let n=0,b;do{b=midi[offset++];n=(n<<7)|(b&127)}while(b&128);return n}
while(offset<midi.length){tick+=vl();const status=midi[offset++];if(status===255){offset++;const length=vl();offset+=length}else if((status&240)===192){offset++}else{const note=midi[offset++],velocity=midi[offset++];if((status&240)===144&&velocity>0)ons.push(tick)}}
assert.equal(ons[0],1920);assert.ok(ons.includes(5760));assert.equal(tick,7680);
console.log('Dice distribution, locked placement, immutable repeats, occupied-bar protection, destination keys, tension/release, empty-bar persistence, generator compatibility, and timed MIDI rests passed.');
