/** Move one existing bar to a final index, preserving every chord and empty bar. */
export function moveChord<T>(chords:T[],from:number,to:number):T[]{
 if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<0||from>=chords.length||to>=chords.length||from===to)return chords;
 const next=chords.slice(),[chord]=next.splice(from,1);
 next.splice(to,0,chord);
 return next;
}

/** Choose a final slot from its untransformed center, clamped at either end. */
export function nearestChordSlot(centers:number[],x:number):number{
 let nearest=-1,distance=Infinity;
 centers.forEach((center,i)=>{const d=Math.abs(center-x);if(d<distance){distance=d;nearest=i}});
 return nearest;
}

/** Find the nearest untransformed tile in a wrapped grid. */
export function nearestChordGridSlot(centers:{x:number;y:number}[],x:number,y:number):number{
 let nearest=-1,distance=Infinity;
 centers.forEach((center,i)=>{const d=(center.x-x)**2+(center.y-y)**2;if(d<distance){distance=d;nearest=i}});
 return nearest;
}
