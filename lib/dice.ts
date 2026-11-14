import {harmonicPlan, tension, type Chord, type Settings} from './harmony.ts';
// Our own 20-face palette: familiar harmonies recur, with occasional color.
export const CHORD_FACES=['','','','','m','m','m','m','7','7','maj7','maj7','m7','m7','sus2','sus4','6','add9','dim','aug'];
export const qualityLabel=(q:string)=>q===''?'Major':q==='m'?'Minor':q;
export function rollFace(sides:number,random:()=>number=Math.random){return Math.min(sides-1,Math.max(0,Math.floor(random()*sides)))}
export function emptyBar():Chord{return {root:0,quality:'',empty:true}}
export function placeChord(chords:Chord[],chord:Chord,index:number,settings:Settings):Chord[]{
 if(chord.empty||!Number.isInteger(index)||index<0||index>=16||(chords[index]&&!chords[index].empty))return chords;
 const next=chords.map(c=>({...c}));while(next.length<=index)next.push(emptyBar());
 const stage=harmonicPlan(settings,Math.max(settings.count,next.length))[index];
 const {empty,transition,key,mode,...notes}=chord;
 next[index]={...notes,key:stage.key,mode:stage.mode,locked:true};return next;
}
export function tensionChange(chord:Chord,previous:Chord|undefined,key:number,mode:string){
 const level=tension(chord,key,mode),before=previous&&!previous.empty?tension(previous,key,mode):null;
 return {level,delta:before===null?null:level-before};
}

/** Fill existing empty bars first, then append within the section limit. */
export function availableDiceSlots(chords:Chord[]):number[]{
 return Array.from({length:16},(_,i)=>i).filter(i=>!chords[i]||chords[i].empty);
}
/** Keep a whole roll atomically; never overwrite chords or silently truncate a set. */
export function placeDiceSets(chords:Chord[],rolled:Chord[],settings:Settings):Chord[]{
 const slots=availableDiceSlots(chords);
 if(!rolled.length||rolled.length>8||rolled.length>slots.length||rolled.some(c=>c.empty))return chords;
 const finalSettings={...settings,count:Math.max(settings.count,slots[rolled.length-1]+1)};
 return rolled.reduce((next,chord,i)=>placeChord(next,chord,slots[i],finalSettings),chords);
}
