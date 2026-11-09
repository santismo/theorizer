import assert from 'node:assert/strict';
import {DEFAULT,GENRES,generate,parseChord,chordName,pitchClasses,voice,makeMidi,QUALITIES} from '../lib/harmony.ts';
let cases=0;
for(const [genre,styles] of Object.entries(GENRES))for(const p of styles)for(const count of [1,4,8,12,16]){
 const s={...DEFAULT,genre,style:p.name,mode:p.mode,color:p.color,count};const cs=generate(s,[],.42);assert.equal(cs.length,count);for(const c of cs){assert.ok(QUALITIES[c.quality]);assert.ok(c.root>=0&&c.root<12);assert.ok(voice(c).every(n=>n>=24&&n<=100));}cases++;
}
for(const text of ['F#m9','Bb7','C/E','Dbmaj9/F','G7b9','Abm11','Cmaj7#11','Bdim7','Dm7b5']){const c=parseChord(text)!;assert.ok(c,text);assert.equal(chordName(c),text);}
for(const bad of ['Hello','Cwat','H7','C/','C7/XYZ',''])assert.equal(parseChord(bad),null);
const a=parseChord('F#m9')!,b=parseChord('Bb7/D')!;const original=generate(DEFAULT,[],.5);original[2]=a;original[6]=b;
for(let i=1;i<25;i++){const out=generate(DEFAULT,original,i/30);assert.equal(chordName(out[2]),chordName(a));assert.equal(chordName(out[6]),chordName(b));assert.deepEqual(pitchClasses(out[2]),pitchClasses(a));assert.deepEqual(pitchClasses(out[6]),pitchClasses(b));assert.ok(out[2].locked&&out[6].locked)}
const isolated=generate(DEFAULT,original,.3,4);original.forEach((c,i)=>{if(i!==4)assert.deepEqual(c,isolated[i])});
const modulated=generate({...DEFAULT,modulation:'Up a whole step'},[],.4);modulated.slice(4).forEach(c=>assert.equal(c.key,4));
const midi=makeMidi(original,82);assert.equal(new TextDecoder().decode(midi.slice(0,4)),'MThd');assert.equal(new TextDecoder().decode(midi.slice(14,18)),'MTrk');const len=(midi[18]<<24)|(midi[19]<<16)|(midi[20]<<8)|midi[21];assert.equal(len,midi.length-22);
const simple=generate({...DEFAULT,color:0},[],.5);assert.ok(simple.every(c=>pitchClasses(c).length<=3));
console.log(`${cases} genre/style/length cases passed; chord parsing, locked anchors, isolated replacement, modulation, voicings, and MIDI structure passed. ${Object.values(GENRES).flat().length} styles.`);
