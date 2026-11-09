import assert from 'node:assert/strict';
import {randomSong,complexityLabel} from '../lib/random-song.ts';
import {QUALITIES,parseChord,chordName,harmonicPlan} from '../lib/harmony.ts';
import {normalizeSong} from '../lib/song.ts';
const metrics=(song:ReturnType<typeof randomSong>)=>{const chords=song.sections.flatMap(p=>p.chords);return {sections:song.sections.length,chords:chords.length,tones:chords.reduce((n,c)=>n+new Set(QUALITIES[c.quality].map(x=>x%12)).size,0)/chords.length,altered:chords.filter(c=>/#|b9|mMaj/.test(c.quality)).length/chords.length,inversions:chords.filter(c=>c.bass!==undefined).length/chords.length,modulations:song.sections.reduce((n,s)=>n+harmonicPlan(s.settings,s.chords.length).filter(x=>x.role==='arrival').length,0),odd:song.sections.filter(s=>s.chords.length%2===1).length,keys:new Set(chords.map(c=>c.key)).size};};
const low:ReturnType<typeof metrics>[]=[],middle:ReturnType<typeof metrics>[]=[],high:ReturnType<typeof metrics>[]=[];
for(let i=1;i<=16;i++){
 const seed=i/23;const a=randomSong('Single style',seed,0),b=randomSong('Single style',seed,50),c=randomSong('Single style',seed,100);
 assert.equal(a.sections.length,4);assert.equal(c.sections.length,8);assert.ok(normalizeSong(c));assert.equal(metrics(a).modulations,0);assert.equal(metrics(a).inversions,0);assert.ok(metrics(a).tones<=4);assert.ok(metrics(c).tones>=4.4);assert.ok(metrics(c).altered>=.2);assert.ok(metrics(c).inversions>.08);assert.ok(metrics(c).modulations===16);assert.ok(metrics(c).odd>=4);assert.ok(metrics(c).keys>=4);assert.ok(metrics(c).chords>metrics(a).chords);
 for(const section of c.sections)for(const chord of section.chords){assert.ok(QUALITIES[chord.quality]);assert.ok(parseChord(chordName(chord)),chordName(chord));assert.ok(chord.root>=0&&chord.root<12);}
 low.push(metrics(a));middle.push(metrics(b));high.push(metrics(c));
}
const average=(rows:typeof low)=>Object.fromEntries(Object.keys(rows[0]).map(key=>[key,Number((rows.reduce((n,r)=>n+r[key as keyof typeof r],0)/rows.length).toFixed(2))]));
assert.deepEqual(randomSong('Style blend',.2,100),randomSong('Style blend',.2,100));
assert.equal(randomSong('Single style',.3,-10).generationNote,randomSong('Single style',.3,0).generationNote);assert.equal(randomSong('Simple',.3,100).sections.length,8,'Slider must override legacy Simple preset');
console.log('16 seeded comparisons passed: low is restrained; max is dense, chromatic, modulating, and structurally complex.');console.log(JSON.stringify({low:average(low),middle:average(middle),maximum:average(high)}));
