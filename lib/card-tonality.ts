import {pitchClasses,type Chord} from './harmony.ts';
import {cardConnectionWeight} from './card-selection.ts';

// Read old saved chords without letting their former center/route steer new draws.
export function tonalMemory(chord?:Chord):{center:{key:number;mode:string}}|undefined{return (chord as Chord&{tonal?:{center:{key:number;mode:string}}}|undefined)?.tonal}
const mod=(n:number)=>(n%12+12)%12;
const keyScales=Array.from({length:12},(_,root)=>[
 [0,2,4,5,7,9,11], // Major
 [0,2,3,5,7,8,10], // Natural minor
 [0,2,3,5,7,8,11], // Harmonic minor, including fully diminished sevenths
].map(scale=>scale.map(n=>mod(n+root)))).flat();
const keyDistances=keyScales.map(a=>keyScales.map(b=>7-a.filter(n=>b.includes(n)).length));
const contexts=new Map<string,number[]>(),distances=new Map<string,number>();
const identity=(chord:Chord)=>`${mod(chord.root)}:${chord.quality}`;
/** All equally plausible key collections for this chord, never a chosen home key. */
function possibleKeys(chord:Chord){
 const id=identity(chord),cached=contexts.get(id);if(cached)return cached;
 const notes=pitchClasses(chord),fits=keyScales.map(scale=>notes.filter(n=>scale.includes(n)).length),best=Math.max(...fits);
 const keys=fits.flatMap((fit,i)=>fit===best?[i]:[]);contexts.set(id,keys);return keys;
}
/** Minimum key-collection change required between two chords' possible contexts. */
export function chordKeyDistance(a:Chord,b:Chord){
 const id=[identity(a),identity(b)].sort().join('|'),cached=distances.get(id);if(cached!==undefined)return cached;
 const before=possibleKeys(a),after=possibleKeys(b);
 const distance=Math.min(...before.flatMap(i=>after.map(j=>keyDistances[i][j])));
 distances.set(id,distance);return distance;
}
export function chooseTonalCard({qualities,amount,history,exclude,fixedRoot,fixedQuality,random=Math.random}:{qualities:readonly string[];amount:number;history:Chord[];exclude?:Chord;fixedRoot?:number;fixedQuality?:string;random?:()=>number}):Chord{
 let candidates=Array.from({length:12},(_,root)=>[...new Set(qualities)].map(quality=>({root,quality}))).flat().filter(c=>(fixedRoot===undefined||c.root===fixedRoot)&&(fixedQuality===undefined||c.quality===fixedQuality));
 if(!candidates.length)throw new Error('No chord matches this palette and held dice.');
 const allowed=candidates.filter(c=>!exclude||c.root!==exclude.root||c.quality!==exclude.quality);if(allowed.length)candidates=allowed;
 const previous=history.filter(c=>!c.empty).at(-1),depth=Math.max(0,Math.min(100,amount))/100;
 // Every step starts from the current chord. No remembered center, cadence queue or dwell period.
 // The right side both takes distant steps more often and favors larger key changes.
 const distant=!!previous&&random()<.97*Math.pow(depth,1.2);
 const weights=candidates.map(c=>{
  if(!previous)return 1;
  const distance=chordKeyDistance(previous,c),repeat=c.root===previous.root&&c.quality===previous.quality;
  const relation=Math.pow(cardConnectionWeight(c,previous),.12);
  return (repeat?.12:1)*relation*(distant?Math.exp((1+depth*3)*distance):Math.exp(-3.5*distance));
 });
 let draw=Math.max(0,Math.min(.999999999,random()))*weights.reduce((a,b)=>a+b,0);
 for(let i=0;i<candidates.length;i++){draw-=weights[i];if(draw<0)return candidates[i]}
 return candidates.at(-1)!;
}
