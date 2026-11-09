import {SCALES,QUALITIES,chordName,chordToneName,noteName,pitchClasses,roman,type Chord} from './harmony.ts';
export type Connection={technique:string;detail:string;from:string;to:string};
const mod=(n:number)=>(n%12+12)%12;
function triad(c:Chord){const q=QUALITIES[c.quality]||[];return q.includes(7)?q.includes(4)?'major':q.includes(3)?'minor':null:null}
function fits(c:Chord,key:number,mode:string){const scale=(SCALES[mode]||SCALES.Major).map(n=>mod(n+key));return pitchClasses(c).every(n=>scale.includes(n))}
/** A possible reading / practical bridge, not proof that two chords establish a new key.
 * Common-tone and pivot approaches follow Open Music Theory's modulation framework:
 * https://viva.pressbooks.pub/openmusictheory/chapter/reinterpreting-augmented-sixth-chords/
 * Prioritize audible voice connections; only suggest a tonicizing dominant for major/minor targets.
 */
export function chordConnection(previous:Chord|undefined,current:Chord|undefined,key:number,mode:string):Connection|null{
 if(!previous||!current||previous.empty||current.empty)return null;
 const from=chordName(previous),to=chordName(current),p=pitchClasses(previous),c=pitchClasses(current),shared=p.filter(n=>c.includes(n));
 const result=(technique:string,detail:string):Connection=>({technique,detail,from,to});
 const step=mod(current.root-previous.root),oldKey=previous.key??key,oldMode=previous.mode??mode;
 const a=triad(previous),b=triad(current),oldIntervals=QUALITIES[previous.quality]||[];
 const sameNotes=p.length===c.length&&p.every(n=>c.includes(n));
 const common=shared.slice(0,2).map(n=>chordToneName(current,n)).join(' and ');
 if(sameNotes)return result((previous.bass??previous.root)!==(current.bass??current.root)?'Bass change':'Repeat',sameNotes&&(previous.bass??previous.root)!==(current.bass??current.root)?'Keep the upper notes; move the bass.':'Keep the harmony; change the rhythm or voicing.');
 if(step===0&&a&&b&&a!==b)return result('Parallel color',`Keep the root and fifth; ${b==='minor'?'lower':'raise'} the third a semitone.`);
 const dominant=oldIntervals.includes(4)&&oldIntervals.includes(10);
 if(step===5&&(dominant||(a==='major'&&!oldIntervals.includes(11)))&&b)return result('Dominant resolution',`${from} pulls into ${to}; move ${chordToneName(previous,mod(previous.root+4))} up to ${chordToneName(current,current.root)}.`);
 if(step===1&&oldIntervals.includes(3)&&oldIntervals.includes(6)&&b)return result('Leading-tone resolution',`Lift ${chordToneName(previous,previous.root)} a semitone into ${chordToneName(current,current.root)}.`);
 if(step===11&&dominant&&b)return result('Tritone substitution',`${from} can replace the dominant; let the bass fall a semitone.`);
 const targetMode=b==='minor'?'Minor':'Major';
 const explicitKeyChange=current.key!==undefined&&(current.key!==oldKey||(current.mode??mode)!==oldMode);
 // The prior chord really must be diatonic to both tonal areas to call it a pivot.
 if(b&&oldKey!==current.root&&fits(previous,oldKey,oldMode)&&fits(previous,current.root,targetMode)&&(!fits(current,oldKey,oldMode)||(explicitKeyChange&&current.root===current.key))){
  const dominantName=chordName({root:mod(current.root+7),quality:'7',key:current.root,mode:targetMode});
  return result('Pivot chord',`${from} fits both keys; try ${dominantName} → ${to} to establish the new home.`);
 }
 if(fits(previous,oldKey,oldMode)&&fits(current,oldKey,oldMode))return result('In-key movement',`${roman(previous,oldKey,oldMode)} → ${roman(current,oldKey,oldMode)} in ${noteName(oldKey,oldKey,oldMode)} ${oldMode.toLowerCase()}.`);
 if(a&&b&&a===b&&[3,4,8,9].includes(step)&&shared.length)return result('Chromatic mediant',`Hold ${common}; move the other voices to the new chord.`);
 if(previous.quality===current.quality&&[1,11].includes(step))return result('Chromatic slide',`Slide the upper chord ${step===1?'up':'down'} a semitone.`);
 if(step===7&&a&&b)return result(a==='minor'?'Minor-plagal color':'Plagal color',`Treat ${from} as ${a==='minor'?'iv':'IV'} leading into ${to}.`);
 if(shared.length)return result('Common-tone bridge',`Hold ${common} through the change; move the other voices by the shortest path.`);
 if(b){const dominantName=chordName({root:mod(current.root+7),quality:'7',key:current.root,mode:targetMode});return result('Dominant bridge',`Try ${dominantName} before ${to} to make the arrival feel prepared.`)}
 // Suspended, augmented, diminished and power chords are not automatically tonic arrivals.
 const pairs=p.flatMap(n=>c.map(m=>({n,m,d:Math.min(mod(m-n),mod(n-m))}))).sort((x,y)=>x.d-y.d);
 const nearest=pairs[0];
 if(nearest&&nearest.d<=2)return result('Voice-leading bridge',`Move ${chordToneName(previous,nearest.n)} to ${chordToneName(current,nearest.m)}; keep the other voices close.`);
 return result('Direct shift','Use a short pause, then land on the new chord with the same rhythm.');
}
export function previousSoundingChord(chords:Chord[],index:number,priorSection?:Chord){return chords.slice(0,Math.max(0,index)).filter(c=>!c.empty).at(-1)||(priorSection?.empty?undefined:priorSection)}
