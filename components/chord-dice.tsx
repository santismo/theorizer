'use client';
import {useState,useRef,useEffect} from 'react';
import {Play,Plus,RefreshCw,Settings2,X,Undo2,Save,Folder,ArrowUpRight,Lock} from 'lucide-react';
import {KeptChords} from '@/components/kept-chords';
import {PhysicalDie,type DieRoll} from '@/components/physical-die';
import {chooseLogicDice,logicLabels,logicAmount,LOGIC_OPTIONS,type LogicSettings,type ChordLogic} from '@/lib/chord-logic';
import {DICE_PALETTES,initialPositions,scatterDice,type DicePalette} from '@/lib/dice-selection';
import {availableDiceSlots} from '@/lib/dice';
import {rollDuration,type RollGesture} from '@/lib/dice-geometry';
import {chordName,noteName,type Chord,type Settings} from '@/lib/harmony';

type Props={logicSettings:LogicSettings;onLogicSettings:(value:LogicSettings)=>void;settings:Settings;chords:Chord[];sectionId:string;previousSectionChord?:Chord;onAudition:(c:Chord)=>void;onNote:(root:number)=>void;onAddMany:(chords:Chord[])=>void;onRollStart:()=>void;onInspect:(index:number)=>void;onChordPlay:(index:number)=>void;onReroll:(index:number,replacement?:Chord)=>void;onRepeat:(index:number)=>void;onMove:(from:number,to:number)=>void;onRemove:(index:number)=>void;onEdit:(index:number)=>void;onCompose:()=>void;onCards:()=>void;onSave:()=>void;onLibrary:()=>void;onUndo:()=>void;canUndo:boolean;name:string;onName:(name:string)=>void;onSettings:(patch:Partial<Settings>)=>void;onExport:()=>void};
export function ChordDice({logicSettings,onLogicSettings,settings,chords,sectionId,previousSectionChord,onAudition,onNote,onAddMany,onRollStart,onInspect,onChordPlay,onReroll,onRepeat,onMove,onRemove,onEdit,onCompose,onCards,onSave,onLibrary,onUndo,canUndo,name,onName,onSettings,onExport}:Props){
 const [values,setValues]=useState<(number|null)[]>(Array(32).fill(null)),[requests,setRequests]=useState<(DieRoll|null)[]>(Array(32).fill(null)),[held,setHeld]=useState<boolean[]>(Array(32).fill(false)),[rolling,setRolling]=useState<boolean[]>(Array(32).fill(false));
 const [setCount,setSetCount]=useState(1),[selectedSet,setSelectedSet]=useState(0),[selectedDice,setSelectedDice]=useState<number[]>(Array(8).fill(1)),[extra,setExtra]=useState(1),[palette,setPalette]=useState<DicePalette>('Classic'),[settingsOpen,setSettingsOpen]=useState(false),[positions,setPositions]=useState(()=>Array.from({length:8},()=>initialPositions(4)).flat());
 const [rollChords,setRollChords]=useState<(Chord|null)[]>(Array(32).fill(null));
 const {logic}=logicSettings,amount=logicAmount(logicSettings),labels=logicLabels(logic);
 function setAmount(value:number){onLogicSettings({...logicSettings,[logic==='tonal'?'modulation':logic==='voice'?'movement':'randomness']:value})}
 const [actions,setActions]=useState<number|null>(null);
 const actionPanel=useRef<HTMLDivElement>(null);
 const sequence=useRef(0),activeRoll=useRef<number[]>(Array(32).fill(0)),gear=useRef<HTMLButtonElement>(null),panel=useRef<HTMLDivElement>(null);
 const busy=rolling.some(Boolean),faces=DICE_PALETTES[palette],slots=availableDiceSlots(chords),destination=slots[0]??-1;
 const results=Array.from({length:setCount},(_,set):Chord|null=>{const pitch=values[set*4],die=set*4+selectedDice[set],face=values[die],stored=rollChords[die];return pitch===null||face===null?null:stored?.root===pitch&&stored.quality===faces[face]?stored:{root:pitch,quality:faces[face]}});
 const stageFor=(set:number)=>({key:results[set]?.key??0,mode:results[set]?.mode??'Major'});
 const pitch=values[selectedSet*4],result=results[selectedSet],stage=stageFor(selectedSet);
 const pitchLabels=Array.from({length:12},(_,n)=>noteName(n,stage.key,stage.mode)),chordLabels=faces.map(q=>q===''?'maj':q==='m'?'min':q);
 const visibleDice=Array.from({length:setCount},(_,set)=>Array.from({length:extra+1},(_,i)=>set*4+i)).flat();
 const canKeep=results.every(Boolean)&&slots.length>=setCount;
 useEffect(()=>{if(!settingsOpen)return;const before=document.activeElement as HTMLElement|null;panel.current?.querySelector<HTMLButtonElement>('button')?.focus();function key(e:KeyboardEvent){if(e.key==='Escape')setSettingsOpen(false);if(e.key!=='Tab')return;const nodes=Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not([disabled]),input,select,summary')||[]).filter(n=>n.getClientRects().length);const first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}document.addEventListener('keydown',key);return()=>{document.removeEventListener('keydown',key);before?.focus()}},[settingsOpen]);
 useEffect(()=>{if(actions===null)return;const before=document.activeElement as HTMLElement|null;actionPanel.current?.querySelector<HTMLButtonElement>('button')?.focus();const key=(e:KeyboardEvent)=>{if(e.key==='Escape')setActions(null);if(e.key==='Tab'){const nodes=Array.from(actionPanel.current?.querySelectorAll<HTMLButtonElement>('button:not([disabled])')||[]),first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}};document.addEventListener('keydown',key);return()=>{document.removeEventListener('keydown',key);before?.focus()}},[actions]);
 function roll(which:number|'all',gesture?:RollGesture){
  if(activeRoll.current.some(Boolean))return;
  const moving=visibleDice.filter(i=>(which==='all'||i===which)&&!held[i]);if(!moving.length)return;
  onRollStart();const next=requests.slice(),pending=values.slice(),selection=selectedDice.slice(),metadata=rollChords.slice();
  if(which!=='all'){const set=Math.floor(which/4);setSelectedSet(set);if(which%4)selection[set]=which%4;setSelectedDice(selection)}
  const working=chords.slice();
  for(let set=0;set<setCount;set++){
   const base=set*4,focus=base+selection[set],index=slots[set]??working.length;
   const history=[...(previousSectionChord?[previousSectionChord]:[]),...working.slice(0,index)];
   if(moving.some(i=>Math.floor(i/4)===set)){
    const chosen=chooseLogicDice({logic,amount,faces,history,fixedRoot:moving.includes(base)?undefined:pending[base]??undefined,fixedFace:moving.includes(focus)?undefined:pending[focus]??undefined});
    metadata[focus]=chosen.chord;
    for(const i of moving.filter(i=>Math.floor(i/4)===set)){
     const candidate=i===base||i===focus?chosen:chooseLogicDice({logic,amount,faces,history,fixedRoot:chosen.root});
     const value=i===base?candidate.root:candidate.face;
     if(i!==base)metadata[i]=candidate.chord;
     const id=++sequence.current;activeRoll.current[i]=id;next[i]={id,face:value,gesture};pending[i]=value;
    }
   }
   if(pending[base]!==null&&pending[focus]!==null){const root=pending[base]!,quality=faces[pending[focus]!],stored=metadata[focus];working[index]=stored?.root===root&&stored.quality===quality?stored:{root,quality}}
  }
  setRollChords(metadata);setRequests(next);setRolling(r=>r.map((v,i)=>moving.includes(i)||v));
  setPositions(old=>{const next=old.slice();for(let set=0;set<setCount;set++){const base=set*4,localMoving=moving.filter(i=>Math.floor(i/4)===set).map(i=>i-base);if(localMoving.length)next.splice(base,extra+1,...scatterDice(old.slice(base,base+extra+1),localMoving,Math.random,gesture?.dx,gesture?.dy))}return next});
 }
 function settle(index:number,value:number,id:number){if(activeRoll.current[index]!==id)return;activeRoll.current[index]=0;setValues(v=>v.map((old,i)=>i===index?value:old));setRolling(r=>r.map((old,i)=>i===index?false:old))}
 function listen(){if(pitch===null||busy)return;if(result)onAudition(result);else onNote(pitch)}
 function changePalette(next:DicePalette){setPalette(next);setRollChords(Array(32).fill(null));setValues(v=>v.map((x,i)=>i%4?null:x));setHeld(h=>h.map((x,i)=>i%4?false:x));setRequests(r=>r.map((x,i)=>i%4?null:x))}
 function changeSetCount(count:number){setRequests(Array(32).fill(null));setSetCount(count);setSelectedSet(i=>Math.min(i,count-1))}
 function openComposer(){setSettingsOpen(false);onCompose()}
 return <main className="dice-studio">
 <header className="studio-header"><button className="studio-brand" onClick={openComposer} aria-label="Open full composer" title="Full composer">θ</button><nav className="studio-mode-tabs" aria-label="Creative mode"><button aria-current="page">Dice</button><button disabled={busy} onClick={onCards}>Cards</button></nav><div><button className="studio-icon" disabled={!canUndo||busy} onClick={onUndo} aria-label="Undo" title="Undo"><Undo2 size={18}/></button><button ref={gear} className="studio-icon" onClick={()=>setSettingsOpen(true)} aria-label="Dice settings" title="Settings"><Settings2 size={19}/></button></div></header>
 <label className="dice-set-count"><span>Dice sets</span><select value={setCount} disabled={busy} onChange={e=>changeSetCount(Number(e.target.value))} aria-label="Number of dice sets">{Array.from({length:8},(_,i)=><option key={i+1} value={i+1}>{i+1}</option>)}</select></label>
 <div className={`dice-set-grid ${setCount>1?'multiple-sets':''}`}>
 {Array.from({length:setCount},(_,set)=>{const base=set*4,local=stageFor(set),labels=Array.from({length:12},(_,n)=>noteName(n,local.key,local.mode));return <section className={`dice-set ${selectedSet===set?'selected-set':''}`} key={set} aria-label={`Dice set ${set+1}`}>
 {setCount>1&&<div className="dice-set-heading"><span>{set+1}</span><button disabled={busy||!results[set]} onClick={()=>{setSelectedSet(set);if(results[set])onAudition(results[set]!)}} aria-label={`Play dice set ${set+1}`}>{busy?'…':results[set]?chordName(results[set]!):'—'}<Play size={12}/></button></div>}
 <div className="rolling-arena" aria-label={`Rolling area for set ${set+1}`} aria-busy={busy}>
 {Array.from({length:extra+1},(_,die)=>{const i=base+die;return <div className={`arena-die ${held[i]?'is-held':''}`} key={`${i}-${die?palette:'pitch'}`} style={{transitionDuration:`${rollDuration(requests[i]?.gesture)}ms`,left:`${positions[i].x*100}%`,top:`${positions[i].y*100}%`}}><PhysicalDie monochrome kind={die===0?'pitch':'chord'} labels={die===0?labels:chordLabels} valueIndex={values[i]} request={requests[i]} locked={held[i]} disabled={busy} onRoll={gesture=>roll(i,gesture)} onSettled={(value,id)=>settle(i,value,id)}/>{held[i]&&<button className="arena-unlock" aria-label={`Release die ${die+1} in set ${set+1}`} onClick={()=>setHeld(h=>h.map((v,j)=>j===i?false:v))}><Lock size={11}/></button>}</div>})}
 </div>
 {extra>1&&values[base]!==null&&<div className="candidate-choices" aria-label={`Choose a chord die for set ${set+1}`}>{Array.from({length:extra},(_,j)=>j+1).map(die=>values[base+die]!==null&&<button key={die} disabled={busy} aria-pressed={selectedDice[set]===die} onClick={()=>{setSelectedSet(set);setSelectedDice(old=>old.map((v,i)=>i===set?die:v))}}>{chordName({root:values[base]!,quality:faces[values[base+die]!],key:local.key,mode:local.mode})}</button>)}</div>}
 </section>})}
 </div>
 <section className="studio-controls" aria-label="Dice result and controls">{setCount===1&&<div className="studio-result" aria-live="polite">{busy?'…':result?chordName(result):pitch!==null?pitchLabels[pitch]:'—'}</div>}
 <div className="studio-actions"><button className="studio-icon" disabled={busy||visibleDice.every(i=>held[i])} onClick={()=>roll('all')} aria-label="Roll all unheld dice" title="Roll all sets"><RefreshCw size={21}/></button><button className="studio-icon studio-play" disabled={pitch===null||busy} onClick={listen} aria-label="Play rolled chord" title="Play selected set"><Play size={20} fill="currentColor"/></button><button className={`studio-icon ${setCount>1?'add-all-sets':''}`} disabled={!canKeep||busy} onClick={()=>{if(canKeep)onAddMany(results as Chord[])}} aria-label={setCount>1?`Add all ${setCount} rolled chords`:'Keep rolled chord'} title={setCount>1?'Add all rolled chords':'Keep chord'}><Plus size={23}/>{setCount>1&&<span>Add all</span>}</button></div>
 {slots.length<setCount&&<p className="dice-capacity" role="status">{slots.length?`Only ${slots.length} empty ${slots.length===1?'bar remains':'bars remain'}. Choose fewer sets or free up bars.`:'Section full (16 chords). Remove a chord or start another section in the composer.'}</p>}
 <label className="connection-slider"><span>{labels[0]}</span><input type="range" min="0" max="100" value={amount} disabled={busy} onChange={e=>setAmount(Number(e.target.value))} aria-label={`${labels[0]} to ${labels[1].toLowerCase()}`} aria-valuetext={`${amount}% ${labels[1].toLowerCase()}`}/><span>{labels[1]}</span></label></section>
 <KeptChords key={sectionId} chords={chords} onPlay={onChordPlay} onEdit={onEdit} onOptions={setActions} onMove={onMove} onDragStart={onRollStart}/>
 {actions!==null&&chords[actions]&&<div className="studio-settings-backdrop" onClick={()=>setActions(null)}><div className="chord-action-sheet" ref={actionPanel} role="dialog" aria-modal="true" aria-label="Chord options" onClick={e=>e.stopPropagation()}><div className="studio-settings-heading"><h2>{chordName(chords[actions])}</h2><button className="studio-icon" aria-label="Close chord options" onClick={()=>setActions(null)}><X size={18}/></button></div>{[['Details',()=>onInspect(actions)],['Edit',()=>onEdit(actions)],['Reroll',()=>{const choice=chooseLogicDice({logic,amount,faces,history:[...(previousSectionChord?[previousSectionChord]:[]),...chords.slice(0,actions)]});onReroll(actions,choice.chord)}],['Repeat',()=>onRepeat(actions)],['Remove',()=>onRemove(actions)]].map(([label,action])=><button key={label as string} disabled={label==='Repeat'&&destination<0} onClick={()=>{setActions(null);(action as ()=>void)()}}>{label as string}</button>)}</div></div>}
 {settingsOpen&&<div className="studio-settings-backdrop" onClick={()=>setSettingsOpen(false)}><div className="studio-settings" ref={panel} role="dialog" aria-modal="true" aria-label="Dice settings" onClick={e=>e.stopPropagation()}><div className="studio-settings-heading"><h2>Settings</h2><button className="studio-icon" onClick={()=>setSettingsOpen(false)} aria-label="Close dice settings"><X size={20}/></button></div>
 <label>Dice logic<select value={logic} disabled={busy} onChange={e=>onLogicSettings({...logicSettings,logic:e.target.value as ChordLogic})}>{LOGIC_OPTIONS.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
 <p className="card-settings-note">{logic==='connection'?'Connected follows the preceding chords. Random gives every chord in the palette an equal chance.':logic==='tonal'?'Similar stays around an inferred tonal center. Modulated moves between centers using shared chords and dominant-to-tonic arrivals.':'Smooth favors smaller movements between voices. Angular favors chords requiring larger changes. Voicings carry through to playback and MIDI.'} Each set follows earlier sets in the roll. Composer key and scale settings do not steer these modes.</p>
 <label>Chord dice per set<select value={extra} disabled={busy} onChange={e=>{const n=Number(e.target.value);setExtra(n);setSelectedDice(old=>old.map(i=>Math.min(i,n)));setPositions(Array.from({length:8},()=>initialPositions(4)).flat())}}><option value={1}>1</option><option value={2}>2</option><option value={3}>3</option></select></label><label>Chord palette<select value={palette} disabled={busy} onChange={e=>changePalette(e.target.value as DicePalette)}>{Object.keys(DICE_PALETTES).map(p=><option key={p}>{p}</option>)}</select></label>
 <div className="studio-holds">{visibleDice.map(i=><button key={i} disabled={values[i]===null||busy} aria-pressed={held[i]} onClick={()=>setHeld(h=>h.map((v,j)=>j===i?!v:v))}><Lock size={12}/>{setCount>1?`${Math.floor(i/4)+1} · `:''}{i%4===0?'Hold note':`Hold chord ${i%4}`}</button>)}</div>
 <label>Sound<select value={settings.instrument} onChange={e=>onSettings({instrument:e.target.value})}>{['Plucked guitar','Electric piano','Soft piano','Warm pad'].map(m=><option key={m}>{m}</option>)}</select></label>
 <details><summary>Progression & files</summary><label>Name<input maxLength={60} value={name} onChange={e=>onName(e.target.value)}/></label><div className="studio-file-actions"><button onClick={onSave}><Save size={15}/> Save</button><button onClick={()=>{setSettingsOpen(false);onLibrary()}}><Folder size={15}/> Open</button><button onClick={onExport}>MIDI</button></div><button className="open-composer" onClick={openComposer}>Full composer · sections & more <ArrowUpRight size={15}/></button></details>
 <details><summary>Faces & gestures</summary><p>Tap a die to reroll it. Push gently to nudge; flick to throw. Choose 1–8 dice sets. Roll turns all unheld dice; + keeps one chord per set in order. Tap a set’s chord name to hear it. With extra chord dice, choose one result per set. Tap a kept tile to play it; tap ••• for details and editing, or hold and drag it to move the chord left or right.</p><p>Your chosen logic follows the preceding chords, including earlier sets in the same roll. Held dice keep their selected faces in every logic mode.</p><p>{pitchLabels.join(' · ')}</p><p>{faces.map(q=>q||'maj').join(' · ')}</p></details>
 </div></div>}
 </main>;
}
