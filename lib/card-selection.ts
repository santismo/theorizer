import {pitchClasses,type Chord} from './harmony.ts';

const distance=(a:number,b:number)=>Math.min((a-b+12)%12,(b-a+12)%12);
/** Connection follows the actual chord tones, with no key, scale, or genre input. */
export function cardConnectionWeight(chord:Chord,previous?:Chord){
 if(!previous||previous.empty)return 1;
 const tones=pitchClasses(chord),before=pitchClasses(previous);
 const travel=(tones.reduce((sum,n)=>sum+Math.min(...before.map(p=>distance(n,p))),0)/tones.length+before.reduce((sum,n)=>sum+Math.min(...tones.map(p=>distance(n,p))),0)/before.length)/2;
 const shared=tones.filter(n=>before.includes(n)).length/Math.max(tones.length,before.length);
 const step=(chord.root-previous.root+12)%12;
 let score=shared*2.5-travel*1.5;
 if(step===5)score+=.8;
 if(step===7)score+=.3;
 if([1,2,10,11].includes(step))score+=.2;
 if(chord.root===previous.root&&chord.quality===previous.quality)score-=2;
 return Math.exp(score);
}
export function chooseCard({qualities,randomness,previous,exclude,random=Math.random}:{qualities:readonly string[];randomness:number;previous?:Chord;exclude?:Chord;random?:()=>number}):Chord{
 const unique=[...new Set(qualities)];
 if(!unique.length)throw new Error('A card palette needs at least one chord quality.');
 const candidates=Array.from({length:12},(_,root)=>unique.map(quality=>({root,quality}))).flat().filter(c=>!exclude||c.root!==exclude.root||c.quality!==exclude.quality);
 const weights=candidates.map(c=>cardConnectionWeight(c,previous)),total=weights.reduce((a,b)=>a+b,0),blend=Math.max(0,Math.min(100,randomness))/100;
 let draw=Math.max(0,Math.min(1,random()));
 for(let i=0;i<candidates.length;i++){draw-=(1-blend)*weights[i]/total+blend/candidates.length;if(draw<0)return candidates[i]}
 return candidates.at(-1)!;
}
export type CardHistory={cards:Chord[];index:number};
/** Revisiting a card does not redraw it or destroy the forward trail. */
export function stepCard(history:CardHistory,direction:'next'|'back',draw:(previous:Chord)=>Chord):CardHistory{
 if(direction==='back')return history.index>0?{...history,index:history.index-1}:history;
 if(history.index<history.cards.length-1)return {...history,index:history.index+1};
 const next=draw(history.cards[history.index]);
 return {cards:[...history.cards,next],index:history.index+1};
}

export function cardSwipeDirection(dx:number,dy:number,elapsed:number):'next'|'back'|null{
 if(Math.abs(dx)<=Math.abs(dy))return null;
 if(Math.abs(dx)>52||(Math.abs(dx)>18&&Math.abs(dx)/Math.max(1,elapsed)>.45))return dx<0?'next':'back';
 return null;
}

/** Keep one concrete upcoming card; navigation consumes exactly what is previewed. */
export function withCardPreview(history:CardHistory,draw:(previous:Chord)=>Chord):CardHistory{
 if(history.cards[history.index+1])return history;
 return {...history,cards:[...history.cards,draw(history.cards[history.index])]};
}
/** Changing the controls branches from the current card, preserving the entire past. */
export function replaceCardPreview(history:CardHistory,draw:(previous:Chord,oldPreview?:Chord)=>Chord):CardHistory{
 return {...history,cards:[...history.cards.slice(0,history.index+1),draw(history.cards[history.index],history.cards[history.index+1])]};
}
/** A batch starts with the visible card, follows its preview, and leaves a new preview ready. */
export function takeCardBatch(history:CardHistory,count:number,draw:(previous:Chord)=>Chord):{chords:Chord[];history:CardHistory}{
 if(!Number.isInteger(count)||count<1||count>16)throw new Error('Choose 1–16 chords.');
 let next=history;
 const chords=[next.cards[next.index]];
 for(let i=1;i<count;i++){next=stepCard(next,'next',draw);chords.push(next.cards[next.index])}
 return {chords,history:withCardPreview(next,draw)};
}
