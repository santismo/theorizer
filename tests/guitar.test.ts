import assert from 'node:assert/strict';
import {guitarFingerings,TUNING} from '../lib/guitar.ts';
import {QUALITIES,parseChord,DEFAULT,generate,chordName} from '../lib/harmony.ts';
const pc=(n:number)=>(n%12+12)%12;let count=0,withShapes=0;
for(const quality of Object.keys(QUALITIES))for(let root=0;root<12;root++){
 const c={root,quality};const shapes=guitarFingerings(c);count++;if(shapes.length)withShapes++;
 for(const shape of shapes){const notes=shape.frets.flatMap((f,i)=>f<0?[]:[TUNING[i]+f]);assert.deepEqual(notes,shape.notes);assert.equal(pc(Math.min(...notes)),root);const tones=QUALITIES[quality].map(n=>pc(root+n));assert.ok(notes.every(n=>tones.includes(pc(n))));const missing=tones.filter(n=>!notes.some(note=>pc(note)===n));assert.ok(missing.every(n=>n===pc(root+7)));assert.equal(shape.omittedFifth,missing.length>0);assert.ok(shape.fingers.every(f=>f>=0&&f<=4));const pressed=shape.frets.filter(f=>f>0);assert.ok(!pressed.length||Math.max(...pressed)-Math.min(...pressed)<=3);if(shape.barre)assert.ok(shape.frets.slice(shape.barre.from,shape.barre.to+1).every(f=>f>=shape.barre!.fret));}
}
for(const name of ['C','G','D','E','A','Am','Dm','Em','F','Bm','Cmaj7','Dm9','G7','F#m9/C#','C/E','C/Bb']){const c=parseChord(name)!;const shapes=guitarFingerings(c);assert.ok(shapes.length,`No shape for ${name}`);assert.equal(pc(Math.min(...shapes[0].notes)),c.bass??c.root);}
let cs=[] as ReturnType<typeof generate>;
for(let i=0;i<16;i++){const previous=structuredClone(cs);cs=generate({...DEFAULT,count:i+1},cs,.45,i);assert.equal(cs.length,i+1);previous.forEach((c,j)=>assert.deepEqual(cs[j],c));}
console.log(`${count} chord types checked, ${withShapes} have compact fingerings; shape pitch, bass, span, fingers, barre and fifth omissions verified. All 16 incremental append lengths preserve existing chords.`);
console.log(['C','D','F','Dm9','C/E'].map(n=>[n,guitarFingerings(parseChord(n)!)[0]?.frets]));
