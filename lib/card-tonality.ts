import {pitchClasses,QUALITIES,SCALES,noteName,type Chord} from './harmony.ts';
import {cardConnectionWeight} from './card-selection.ts';

export type TonalCenter={key:number;mode:'Major'|'Minor'};
export type TonalEstimate=TonalCenter&{score:number;confidence:number};
export type TonalMemory={center:TonalCenter;target?:TonalCenter;pending:Chord[];amount:number;settled:number};
export type TonalCard=Chord&{tonal:TonalMemory};
const mod=(n:number)=>(n%12+12)%12;
const same=(a:Chord,b?:Chord)=>!!b&&a.root===b.root&&a.quality===b.quality;
const sameCenter=(a:TonalCenter,b:TonalCenter)=>a.key===b.key&&a.mode===b.mode;
const centers:TonalCenter[]=Array.from({length:12},(_,key)=>(['Major','Minor'] as const).map(mode=>({key,mode}))).flat();
export const centerName=(center:TonalCenter)=>`${noteName(center.key,center.key,center.mode)} ${center.mode.toLowerCase()}`;
export function tonalMemory(chord?:Chord):TonalMemory|undefined{return (chord as TonalCard|undefined)?.tonal}
function scale(center:TonalCenter){return SCALES[center.mode].map(n=>mod(n+center.key))}
function dominant(chord:Chord){const intervals=QUALITIES[chord.quality]||[];return intervals.includes(4)&&intervals.includes(10)}
function tonicQuality(chord:Chord,center:TonalCenter){const intervals=QUALITIES[chord.quality]||[];return chord.root===center.key&&intervals.includes(center.mode==='Minor'?3:4)&&!intervals.includes(center.mode==='Minor'?4:3)&&(!intervals.includes(10)||center.mode==='Minor')}
export function tonalFit(chord:Chord,center:TonalCenter){
 const allowed=scale(center);
 // Functional V and leading-tone chords in minor use its raised seventh.
 if(center.mode==='Minor'&&((mod(chord.root-center.key)===7&&(QUALITIES[chord.quality]||[]).includes(4))||mod(chord.root-center.key)===11))allowed.push(mod(center.key+11));
 const tones=pitchClasses(chord);return tones.length?tones.filter(n=>allowed.includes(n)).length/tones.length:0;
}
/** A short, recency-weighted hypothesis list; no composer key/scale metadata is read. */
export function inferTonalCenters(history:Chord[]):TonalEstimate[]{
 const recent=history.filter(c=>!c.empty).slice(-8);
 if(!recent.length)return [];
 const scored=centers.map(center=>{
  let score=0;
  recent.forEach((chord,i)=>{
   const weight=Math.pow(.78,recent.length-1-i),fit=tonalFit(chord,center),degree=mod(chord.root-center.key);
   score+=weight*((fit-.65)*4+(tonicQuality(chord,center)?1.5:degree===7?.25:0));
   const previous=recent[i-1];
   if(previous&&tonicQuality(chord,center)){
    if(mod(previous.root-center.key)===7&&dominant(previous))score+=weight*4;
    else if(mod(previous.root-center.key)===5)score+=weight*1;
   }
  });
  return {...center,score};
 }).sort((a,b)=>b.score-a.score);
 const total=scored.reduce((sum,c)=>sum+Math.exp((c.score-scored[0].score)/1.3),0);
 return scored.map(c=>({...c,confidence:Math.exp((c.score-scored[0].score)/1.3)/total}));
}
export function tonalDistance(a:TonalCenter,b:TonalCenter){
 const from=scale(a),to=scale(b);return 7-from.filter(n=>to.includes(n)).length+(a.mode!==b.mode?.25:0);
}
function weighted<T>(items:T[],weight:(item:T)=>number,random:()=>number):T{
 const weights=items.map(item=>Math.max(.000001,weight(item))),total=weights.reduce((a,b)=>a+b,0);let draw=Math.min(.999999999,Math.max(0,random()))*total;
 for(let i=0;i<items.length;i++){draw-=weights[i];if(draw<0)return items[i]}return items.at(-1)!;
}
function pool(qualities:readonly string[]):Chord[]{return Array.from({length:12},(_,root)=>[...new Set(qualities)].map(quality=>({root,quality}))).flat()}
function stamp(chord:Chord,tonal:TonalMemory,key=tonal.center):TonalCard{return {...chord,key:key.key,mode:key.mode,tonal}}
function voiceAlternative(planned:Chord,qualities:readonly string[],exclude:Chord|undefined,random:()=>number){
 if(!same(planned,exclude))return planned;
 const tones=QUALITIES[planned.quality]||[],family=dominant(planned)?'dominant':tones.includes(3)?'minor':'major';
 const alternatives=qualities.map(quality=>({root:planned.root,quality})).filter(c=>!same(c,exclude)).filter(c=>{
  const ints=QUALITIES[c.quality]||[];return family==='dominant'?dominant(c):family==='minor'?ints.includes(3):ints.includes(4)&&!ints.includes(10);
 });
 return alternatives.length?weighted(alternatives,c=>cardConnectionWeight(c,planned),random):planned;
}
export function chooseTonalCard({qualities,amount,history,exclude,fixedRoot,fixedQuality,random=Math.random}:{qualities:readonly string[];amount:number;history:Chord[];exclude?:Chord;fixedRoot?:number;fixedQuality?:string;random?:()=>number}):TonalCard{
 const allowedQualities=fixedQuality===undefined?qualities:[fixedQuality];
 const candidates=pool(qualities).filter(c=>(fixedRoot===undefined||c.root===fixedRoot)&&(fixedQuality===undefined||c.quality===fixedQuality));if(!candidates.length)throw new Error('A tonal palette needs chord qualities.');
 const previous=history.filter(c=>!c.empty).at(-1),prior=tonalMemory(previous),depth=Math.max(0,Math.min(100,amount));
 const estimated=inferTonalCenters(history)[0];
 const center:TonalCenter=prior?.center??(estimated?{key:estimated.key,mode:estimated.mode}:{key:previous?.root??0,mode:'Major'});
 if(prior&&prior.amount===depth&&prior.target&&prior.pending.length&&prior.pending.every(c=>qualities.includes(c.quality))&&(fixedRoot===undefined||prior.pending[0].root===fixedRoot)&&(fixedQuality===undefined||prior.pending[0].quality===fixedQuality)){
  const planned=prior.pending[0],pending=prior.pending.slice(1),arrived=pending.length===0;
  return stamp(voiceAlternative(planned,allowedQualities,exclude,random),{center:arrived?prior.target:center,target:arrived?undefined:prior.target,pending,amount:depth,settled:0},prior.target);
 }
 const settled=prior?.settled??2;
 const shouldMove=depth>0&&settled>=1&&random()<.8*Math.pow(depth/100,1.25);
 if(shouldMove){
  // Nearby controls favor shared scales; far-right controls favor remote but purposeful arrivals.
  const wanted=.4+depth/100*4.3;
  const destinations=centers.filter(c=>!sameCenter(c,center)&&candidates.some(chord=>tonicQuality(chord,c)&&tonalFit(chord,c)===1));
  if(!destinations.length){const filtered=candidates.filter(c=>!same(c,exclude)),options=filtered.length?filtered:candidates;const chosen=weighted(options,c=>Math.exp(tonalFit(c,center)*4)*Math.pow(cardConnectionWeight(c,previous),.5),random);return stamp(chosen,{center,pending:[],amount:depth,settled:settled+1})}
  const target=weighted(destinations,c=>Math.exp(-Math.pow(tonalDistance(center,c)-wanted,2)/1.2),random);
  const tonics=candidates.filter(c=>tonicQuality(c,target)&&tonalFit(c,target)===1);
  const arrival=weighted(tonics,c=>1/Math.max(1,pitchClasses(c).length-2),random);
  const dominants=candidates.filter(c=>c.root===mod(target.key+7)&&dominant(c));
  // All built-in palettes offer dominant chords. A custom palette can still arrive directly.
  const approach=dominants.length?weighted(dominants,c=>Math.exp(tonalFit(c,target)*3)*Math.pow(cardConnectionWeight(c,previous),.2),random):undefined;
  const pivots=candidates.filter(c=>tonalFit(c,center)===1&&tonalFit(c,target)===1&&!same(c,previous)&&!same(c,exclude)&&c.root!==target.key);
  const pivot=pivots.length?weighted(pivots,c=>cardConnectionWeight(c,previous),random):undefined;
  const route=[...(pivot?[pivot]:[]),...(approach?[approach]:[]),arrival];
  const [first,...pending]=route;
  const chosen=voiceAlternative(first,allowedQualities,exclude,random);
  return stamp(chosen,{center:pending.length?center:target,target:pending.length?target:undefined,pending,amount:depth,settled:0},pivot?center:target);
 }
 const filtered=candidates.filter(c=>!same(c,exclude)),options=filtered.length?filtered:candidates;
 const bestFit=Math.max(...options.map(c=>tonalFit(c,center)));
 const inKey=options.filter(c=>tonalFit(c,center)>=bestFit-.001);
 const choice=weighted(inKey,c=>Math.pow(cardConnectionWeight(c,previous),.5)*(tonicQuality(c,center)?1.25:1),random);
 return stamp(choice,{center,pending:[],amount:depth,settled:settled+1});
}
