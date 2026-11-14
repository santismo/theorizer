import {CHORD_FACES} from './dice.ts';
import {SCALES,pitchClasses,type Chord,type Settings} from './harmony.ts';
export const DICE_PALETTES={Simple:Array.from({length:20},(_,i)=>['m7','7','maj7','dim7'][i%4]),Classic:CHORD_FACES,Extended:['maj7','m7','7','maj9','m9','9','6','m6','add9','madd9','sus2','sus4','m11','11','13','maj13','m13','7sus4','9sus4','mMaj7'],Altered:['7b9','7#9','7#11','maj7#11','m7b5','dim7','aug','7b9#11','13b9','maj9#11','mMaj9','7#5#9','7b9','7#9','maj7','m9','9sus4','m11','13','m6']} as const;
export type DicePalette=keyof typeof DICE_PALETTES;
const mod=(n:number)=>(n%12+12)%12;
export function connectionWeight(root:number,quality:string,previous:Chord|undefined,settings:Pick<Settings,'key'|'mode'>){
 const tones=pitchClasses({root,quality}),scale=(SCALES[settings.mode]||SCALES.Major).map(n=>mod(n+settings.key));
 const outside=tones.filter(n=>!scale.includes(n)).length;
 let score=2.4-outside*1.6;
 if(!previous||previous.empty){score+=root===settings.key?2.3:scale.includes(root)?.7:-1;}
 else{const before=pitchClasses(previous),shared=tones.filter(n=>before.includes(n)).length,step=mod(root-previous.root);
 const distance=tones.reduce((sum,n)=>sum+Math.min(...before.map(p=>Math.min(mod(n-p),mod(p-n)))),0)/tones.length;
 score+=shared*.65-distance*.85;if(step===5)score+=1.5;if([2,10].includes(step))score+=.4;if(root===previous.root)score-=.8;if(root===settings.key)score+=.7;
 }
 return Math.exp(Math.max(-8,Math.min(6,score)));
}
/** Connected is context-weighted; 100 is an exact uniform roll across available die faces. */
export function chooseDice({faces,randomness,previous,settings,fixedRoot,fixedFace,random=Math.random}:{faces:readonly string[];randomness:number;previous?:Chord;settings:Pick<Settings,'key'|'mode'>;fixedRoot?:number;fixedFace?:number;random?:()=>number}){
 const roots=fixedRoot===undefined?Array.from({length:12},(_,i)=>i):[fixedRoot],indices=fixedFace===undefined?faces.map((_,i)=>i):[fixedFace];
 const candidates=roots.flatMap(root=>indices.map(face=>({root,face,weight:connectionWeight(root,faces[face],previous,settings)})));
 const blend=Math.max(0,Math.min(1,randomness/100)),total=candidates.reduce((sum,c)=>sum+c.weight,0);
 const weights=candidates.map(c=>(1-blend)*c.weight/total+blend/candidates.length);
 let draw=random();for(let i=0;i<candidates.length;i++){draw-=weights[i];if(draw<0)return {root:candidates[i].root,face:candidates[i].face}}
 const last=candidates.at(-1)!;return {root:last.root,face:last.face};
}
export type ArenaPosition={slot:number;x:number;y:number};
const points=[[.25,.28],[.75,.72],[.75,.28],[.25,.72]];
export function initialPositions(count:number):ArenaPosition[]{return points.slice(0,count).map(([x,y],slot)=>({slot,x,y}))}
export function scatterDice(previous:ArenaPosition[],moving:number[],random:()=>number=Math.random,dx=0,dy=0):ArenaPosition[]{
 const occupied=new Set(previous.filter((_,i)=>!moving.includes(i)).map(p=>p.slot));
 const available=[0,1,2,3].filter(i=>!occupied.has(i)),next=previous.map(p=>({...p}));
 for(const i of moving){const origin=previous[i]||initialPositions(4)[i];
  const scored=available.map(slot=>{const [x,y]=points[slot];return {slot,score:random()*1.5+(slot!==origin.slot ? .4 : 0)+Math.sign(dx)*(x-origin.x)*.8+Math.sign(dy)*(y-origin.y)*.8}}).sort((a,b)=>b.score-a.score);
  const slot=scored[0].slot;available.splice(available.indexOf(slot),1);next[i]={slot,x:points[slot][0]+(random()-.5)*.045,y:points[slot][1]+(random()-.5)*.055};
 }
 return next;
}
