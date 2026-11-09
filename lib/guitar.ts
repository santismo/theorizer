import {QUALITIES, type Chord} from './harmony.ts';
export const TUNING=[40,45,50,55,59,64];
export type Fingering={frets:number[];fingers:number[];notes:number[];start:number;barre:{fret:number;from:number;to:number}|null;omittedFifth:boolean;score:number};
const pc=(n:number)=>(n%12+12)%12;
const cache=new Map<string,Fingering[]>();
const familiar:Record<string,number[]>={
 '0:':[-1,3,2,0,1,0],'2:':[-1,-1,0,2,3,2],'4:':[0,2,2,1,0,0],'5:':[1,3,3,2,1,1],'7:':[3,2,0,0,0,3],'9:':[-1,0,2,2,2,0],
 '9:m':[-1,0,2,2,1,0],'2:m':[-1,-1,0,2,3,1],'4:m':[0,2,2,0,0,0],'11:m':[-1,2,4,4,3,2],
 '0:maj7':[-1,3,2,0,0,0],'0:7':[-1,3,2,3,1,0],'2:7':[-1,-1,0,2,1,2],'4:7':[0,2,0,1,0,0],'7:7':[3,2,0,0,0,1],'9:7':[-1,0,2,0,2,0],
 '9:m7':[-1,0,2,0,1,0],'2:m7':[-1,-1,0,2,1,1],'4:m7':[0,2,0,0,0,0]
};
/** Compact standard-tuning shapes: at most four fretting fingers and a four-fret span.
 * Rich chords may omit only an unaltered fifth. All other named tones are required. */
export function guitarFingerings(c:Chord):Fingering[]{
 if(c.empty)return [];
 const id=`${c.root}:${c.quality}:${c.bass??c.root}`;if(cache.has(id))return cache.get(id)!;
 const intervals=QUALITIES[c.quality],tones=[...new Set(intervals.map(n=>pc(c.root+n)))],bass=pc(c.bass??c.root);
 const allowed=new Set([...tones,bass]),canOmit=tones.length>=4&&intervals.includes(7),required=tones.filter(n=>!(canOmit&&n===pc(c.root+7)));
 const solutions:Fingering[]=[];const seen=new Set<string>();
 for(let start=1;start<=12;start++){
  const options=TUNING.map(open=>[-1,...(allowed.has(pc(open))?[0]:[]),...Array.from({length:4},(_,i)=>start+i).filter(f=>allowed.has(pc(open+f)))]);
  const search=(frets:number[])=>{
   if(frets.length<6){for(const f of options[frets.length])search([...frets,f]);return}
   const key=frets.join(',');if(seen.has(key))return;seen.add(key);
   const notes=frets.flatMap((f,i)=>f>=0?[TUNING[i]+f]:[]);if(notes.length<Math.min(3,tones.length)||pc(Math.min(...notes))!==bass)return;
   const pcs=new Set(notes.map(pc));if(required.some(n=>!pcs.has(n)))return;
   const pressed=frets.filter(f=>f>0),minimum=pressed.length?Math.min(...pressed):0,maximum=pressed.length?Math.max(...pressed):0;
   if(maximum-minimum>3)return;
   // One index-finger barre may cross only strings fretted at or above it.
   const base=frets.flatMap((f,i)=>f===minimum&&f>0?[i]:[]);let barre:Fingering['barre']=null;
   if(base.length>1){const from=base[0],to=base.at(-1)!;if(frets.slice(from,to+1).every(f=>f>=minimum))barre={fret:minimum,from,to};}
   const groups: number[][]=[];if(barre)groups.push(base);
   frets.forEach((f,i)=>{if(f>0&&!(barre&&base.includes(i)))groups.push([i])});
   groups.sort((a,b)=>frets[a[0]]-frets[b[0]]||a[0]-b[0]);if(groups.length>4)return;
   const fingers=frets.map(()=>0);groups.forEach((group,i)=>group.forEach(string=>fingers[string]=i+1));
   const first=frets.findIndex(f=>f>=0),last=frets.findLastIndex(f=>f>=0);const interiorMutes=frets.slice(first,last+1).filter(f=>f<0).length;
   const omittedFifth=tones.some(n=>!pcs.has(n));
   const score=minimum*.8+(maximum-minimum)*1.1+groups.length*.55+interiorMutes*4+(barre?1:0)+(omittedFifth?2.8:0)-notes.length*.65-frets.filter(f=>f===0).length*.45;
   solutions.push({frets,fingers,notes,start:maximum<=4?1:Math.max(1,minimum),barre,omittedFifth,score});
  };search([]);
 }
 const preferred=(c.bass===undefined||c.bass===c.root)?familiar[`${c.root}:${c.quality}`]:undefined;if(preferred){const match=solutions.find(shape=>shape.frets.every((f,i)=>f===preferred[i]));if(match)match.score-=100;}
 solutions.sort((a,b)=>a.score-b.score);const best=solutions.slice(0,8);cache.set(id,best);return best;
}
