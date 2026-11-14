import {chooseCard} from './card-selection.ts';
import {chooseTonalCard} from './card-tonality.ts';
import {voice,type Chord} from './harmony.ts';
export type ChordLogic='connection'|'tonal'|'voice';
export type LogicSettings={logic:ChordLogic;randomness:number;modulation:number;movement:number};
export const DEFAULT_LOGIC:LogicSettings={logic:'tonal',randomness:35,modulation:35,movement:35};
export const LOGIC_OPTIONS=[{value:'connection',label:'Connection'},{value:'tonal',label:'Tonal movement'},{value:'voice',label:'Voice movement'}] as const;
export const logicLabels=(logic:ChordLogic)=>logic==='tonal'?['Similar','Modulated']:logic==='voice'?['Smooth','Angular']:['Connected','Random'];
export const logicAmount=(settings:LogicSettings)=>settings.logic==='tonal'?settings.modulation:settings.logic==='voice'?settings.movement:settings.randomness;
type Choice={logic:ChordLogic;amount:number;qualities:readonly string[];history:Chord[];fixedRoot?:number;fixedQuality?:string;exclude?:Chord;random?:()=>number};
/** Ordered voice matching, allowing voices to enter/leave with a finite cost. */
export function voiceTravel(from:number[],to:number[]){
 if(!from.length||!to.length)return 0;
 const a=from.slice(1).sort((a,b)=>a-b),b=to.slice(1).sort((a,b)=>a-b);
 const dp=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));
 for(let i=0;i<=a.length;i++)dp[i][0]=i*5;
 for(let j=0;j<=b.length;j++)dp[0][j]=j*5;
 for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)dp[i][j]=Math.min(dp[i-1][j-1]+Math.abs(a[i-1]-b[j-1]),dp[i-1][j]+5,dp[i][j-1]+5);
 return dp[a.length][b.length]/Math.max(1,a.length,b.length)+Math.abs(from[0]-to[0])*.15;
}
function nearestVoicing(chord:Chord,previous:number[]){
 const base=voice(chord),upper=base.slice(1).sort((a,b)=>a-b),variants:number[][]=[];
 for(let turn=0;turn<upper.length;turn++){
  const inversion=[...upper.slice(turn),...upper.slice(0,turn).map(n=>n+12)];
  for(const shift of [-24,-12,0,12]){
   const notes=inversion.map(n=>n+shift);if(notes[0]<48||notes.at(-1)!>84)continue;
   for(const octave of [-12,0,12]){const bass=base[0]+octave;if(bass>=28&&bass<=52&&bass<notes[0])variants.push([bass,...notes])}
  }
 }
 return variants.sort((a,b)=>voiceTravel(previous,a)-voiceTravel(previous,b))[0]||base;
}
export function chooseVoiceCard({amount,qualities,history,fixedRoot,fixedQuality,exclude,random=Math.random}:Omit<Choice,'logic'>):Chord{
 const previous=history.filter(c=>!c.empty).at(-1),before=previous?voice(previous):[];
 let choices=Array.from({length:12},(_,root)=>[...new Set(qualities)].map(quality=>({root,quality}))).flat().filter(c=>(fixedRoot===undefined||c.root===fixedRoot)&&(fixedQuality===undefined||c.quality===fixedQuality));
 const other=choices.filter(c=>!exclude||c.root!==exclude.root||c.quality!==exclude.quality);if(other.length)choices=other;
 if(!choices.length)throw new Error('No chord matches this palette and held dice.');
 const candidates=choices.map(c=>{const voicing=before.length?nearestVoicing(c,before):voice(c);return {chord:{...c,voicing},distance:voiceTravel(before,voicing)}});
 const direction=Math.max(0,Math.min(100,amount))/100;
 const weights=candidates.map(c=>Math.exp((direction*3.6-2)*c.distance-(previous&&previous.root===c.chord.root&&previous.quality===c.chord.quality?1.5:0)));
 const sum=weights.reduce((a,b)=>a+b,0);let draw=Math.max(0,Math.min(.99999999,random()))*sum;
 for(let i=0;i<candidates.length;i++){draw-=weights[i];if(draw<0)return candidates[i].chord}return candidates.at(-1)!.chord;
}
export function chooseLogicChord(options:Choice):Chord{
 if(options.logic==='tonal')return chooseTonalCard(options);
 if(options.logic==='voice')return chooseVoiceCard(options);
 return chooseCard({...options,randomness:options.amount,previous:options.history.filter(c=>!c.empty).at(-1)});
}
export function chooseLogicDice({faces,fixedFace,...options}:Omit<Choice,'qualities'|'fixedQuality'>&{faces:readonly string[];fixedFace?:number}){
 const chord=chooseLogicChord({...options,qualities:faces,fixedQuality:fixedFace===undefined?undefined:faces[fixedFace]});
 const matches=faces.map((quality,i)=>quality===chord.quality?i:-1).filter(i=>i>=0);
 const face=fixedFace??matches[Math.min(matches.length-1,Math.floor((options.random??Math.random)()*matches.length))];
 return {chord,root:chord.root,face};
}
