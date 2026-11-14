'use client';
import {useEffect,useRef,useState,type PointerEvent} from 'react';
import {ArrowUpRight,ChevronLeft,ChevronRight,Folder,Play,Plus,Save,Settings2,Undo2,X} from 'lucide-react';
import {KeptChords} from '@/components/kept-chords';
import {availableDiceSlots} from '@/lib/dice';
import {DICE_PALETTES,type DicePalette} from '@/lib/dice-selection';
import {chooseCard,stepCard,cardSwipeDirection,type CardHistory} from '@/lib/card-selection';
import {previousSoundingChord} from '@/lib/chord-connection';
import {chordName,chordToneName,pitchClasses,type Chord,type Settings} from '@/lib/harmony';

export type CardSession={history:CardHistory;palette:DicePalette;randomness:number};
type Props={initialSession?:CardSession;onSessionChange:(session:CardSession)=>void;settings:Settings;chords:Chord[];previousSectionChord?:Chord;onAudition:(c:Chord)=>void;onAdd:(c:Chord)=>void;onStop:()=>void;onInspect:(i:number)=>void;onChordPlay:(i:number)=>void;onReroll:(i:number,c:Chord)=>void;onRepeat:(i:number)=>void;onMove:(from:number,to:number)=>void;onRemove:(i:number)=>void;onEdit:(i:number)=>void;onCompose:()=>void;onDice:()=>void;onSave:()=>void;onLibrary:()=>void;onUndo:()=>void;canUndo:boolean;name:string;onName:(name:string)=>void;onSettings:(patch:Partial<Settings>)=>void;onExport:()=>void};
export function ChordCards({initialSession,onSessionChange,settings,chords,previousSectionChord,onAudition,onAdd,onStop,onInspect,onChordPlay,onReroll,onRepeat,onMove,onRemove,onEdit,onCompose,onDice,onSave,onLibrary,onUndo,canUndo,name,onName,onSettings,onExport}:Props){
 const [palette,setPalette]=useState<DicePalette>(initialSession?.palette??'Classic'),[randomness,setRandomness]=useState(initialSession?.randomness??35),[settingsOpen,setSettingsOpen]=useState(false),[actions,setActions]=useState<number|null>(null);
 const [history,setHistory]=useState<CardHistory>(()=>initialSession?.history??({cards:[chooseCard({qualities:DICE_PALETTES.Classic,randomness:35,previous:previousSoundingChord(chords,availableDiceSlots(chords)[0]??chords.length,previousSectionChord)})],index:0}));
 const [phase,setPhase]=useState('idle'),[offset,setOffset]=useState(0),[dragging,setDragging]=useState(false);
 const gesture=useRef<{id:number;x:number;y:number;t:number;horizontal:boolean}|null>(null),suppressClick=useRef(false),transitioning=useRef(false),timers=useRef<ReturnType<typeof setTimeout>[]>([]),panel=useRef<HTMLDivElement>(null);
 const current=history.cards[history.index],busy=phase!=='idle',destination=availableDiceSlots(chords)[0]??-1;
 useEffect(()=>()=>timers.current.forEach(clearTimeout),[]);
 useEffect(()=>{onSessionChange({history,palette,randomness})},[history,palette,randomness]);
 useEffect(()=>{
  if(!settingsOpen&&actions===null)return;
  const before=document.activeElement as HTMLElement|null;panel.current?.querySelector<HTMLButtonElement>('button')?.focus();
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){setSettingsOpen(false);setActions(null)}if(e.key==='Tab'){const nodes=Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not([disabled]),input,select,summary')||[]).filter(n=>n.getClientRects().length),first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}};
  document.addEventListener('keydown',key);return()=>{document.removeEventListener('keydown',key);before?.focus()};
 },[settingsOpen,actions]);
 function navigate(direction:'next'|'back'){
  if(transitioning.current||(direction==='back'&&history.index===0)){setOffset(0);return}
  onStop();transitioning.current=true;setOffset(0);setDragging(false);
  const next=stepCard(history,direction,previous=>chooseCard({qualities:DICE_PALETTES[palette],randomness,previous}));
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){setHistory(next);transitioning.current=false;return}
  setPhase(`exit-${direction}`);
  timers.current=[setTimeout(()=>{setHistory(next);setPhase(`enter-${direction}`);timers.current=[setTimeout(()=>{setPhase('idle');transitioning.current=false},190)]},140)];
 }
 function start(e:PointerEvent<HTMLButtonElement>){if(e.button!==0||transitioning.current)return;suppressClick.current=false;gesture.current={id:e.pointerId,x:e.clientX,y:e.clientY,t:e.timeStamp,horizontal:false};e.currentTarget.setPointerCapture(e.pointerId)}
 function move(e:PointerEvent<HTMLButtonElement>){const g=gesture.current;if(!g||g.id!==e.pointerId)return;const dx=e.clientX-g.x,dy=e.clientY-g.y;if(!g.horizontal){if(Math.abs(dy)>12&&Math.abs(dy)>Math.abs(dx)){suppressClick.current=true;gesture.current=null;return}if(Math.abs(dx)<8||Math.abs(dx)<Math.abs(dy))return;g.horizontal=true;setDragging(true)}suppressClick.current=true;setOffset(Math.max(-160,Math.min(160,dx*(dx>0&&history.index===0?.2:1))))}
 function finish(e:PointerEvent<HTMLButtonElement>){const g=gesture.current;if(!g||g.id!==e.pointerId)return;gesture.current=null;setDragging(false);const direction=cardSwipeDirection(e.clientX-g.x,e.clientY-g.y,e.timeStamp-g.t);if(direction){suppressClick.current=true;navigate(direction)}else setOffset(0)}
 function cancel(){gesture.current=null;setDragging(false);setOffset(0)}
 function openComposer(){setSettingsOpen(false);onCompose()}
 return <main className="dice-studio card-studio">
  <header className="studio-header"><button className="studio-brand" onClick={openComposer} aria-label="Open full composer">θ</button><nav className="studio-mode-tabs" aria-label="Creative mode"><button onClick={onDice}>Dice</button><button aria-current="page">Cards</button></nav><div><button className="studio-icon" disabled={!canUndo||busy} onClick={onUndo} aria-label="Undo saved chord"><Undo2 size={18}/></button><button className="studio-icon" onClick={()=>setSettingsOpen(true)} aria-label="Card settings"><Settings2 size={19}/></button></div></header>
  <section className="card-wheel" aria-label="Chord cards">
   <div className="card-wheel-window">
    <button className={`harmony-card ${phase} ${dragging?'is-dragging':''}`} style={{transform:phase==='idle'?`translateX(${offset}px) rotateY(${offset*.14}deg) rotateZ(${offset*.025}deg)`:undefined}} aria-label={`Play ${chordName(current)}, card ${history.index+1}`} aria-describedby="card-swipe-help" onPointerDown={start} onPointerMove={move} onPointerUp={finish} onPointerCancel={cancel} onLostPointerCapture={cancel} onContextMenu={e=>e.preventDefault()} onKeyDown={e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();navigate(e.key==='ArrowLeft'?'back':'next')}}} onClick={e=>{if(suppressClick.current&&e.detail!==0){suppressClick.current=false;return}if(!transitioning.current)onAudition(current)}}>
     <span className="card-corner"><span>θ</span><span>{String(history.index+1).padStart(2,'0')}</span></span>
     <span className="card-symbol">{chordName(current)}</span>
     <span className="card-tones">{pitchClasses(current).map(n=>chordToneName(current,n)).join(' · ')}</span>
     <span className="card-foot"><span>Tap to listen</span><Play size={15}/></span>
    </button>
   </div>
   <p id="card-swipe-help" className="card-swipe-help">Swipe left to explore · right to go back</p>
   <span className="sr-only" aria-live="polite">{phase.startsWith('exit')?'':`Card ${history.index+1} of ${history.cards.length}: ${chordName(current)}`}</span>
  </section>
  <section className="studio-controls" aria-label="Card controls">
   <div className="card-navigation"><button disabled={history.index===0||busy} onClick={()=>navigate('back')} aria-label="Previous card"><ChevronLeft size={19}/><span>Back</span></button><span>{history.index+1}<small> / {history.cards.length}</small></span><button disabled={busy} onClick={()=>navigate('next')} aria-label={history.index<history.cards.length-1?'Next card in history':'Generate next chord card'}><span>{history.index<history.cards.length-1?'Next':'New chord'}</span><ChevronRight size={19}/></button></div>
   <div className="studio-actions"><button className="studio-icon studio-play" disabled={busy} onClick={()=>onAudition(current)} aria-label="Play current card"><Play size={20} fill="currentColor"/></button><button className="studio-icon" disabled={busy||destination<0} onClick={()=>onAdd(current)} aria-label="Keep current chord" title="Keep chord"><Plus size={24}/></button></div>
   <label className="connection-slider"><span>Connected</span><input type="range" min="0" max="100" value={randomness} onChange={e=>setRandomness(Number(e.target.value))} aria-label="Connected to random" aria-valuetext={randomness===100?'Pure random':randomness===0?'Strongly connected':`${randomness}% random`}/><span>Random</span></label>
   {destination<0&&<p className="dice-capacity">Section full (16 chords). Remove a chord or start another section in the composer.</p>}
  </section>
  <KeptChords chords={chords} onPlay={onChordPlay} onEdit={onEdit} onOptions={setActions} onMove={onMove} onDragStart={onStop}/>
  {(settingsOpen||actions!==null)&&<div className="studio-settings-backdrop" onClick={()=>{setSettingsOpen(false);setActions(null)}}><div ref={panel} className={settingsOpen?'studio-settings':'chord-action-sheet'} role="dialog" aria-modal="true" aria-label={settingsOpen?'Card settings':'Chord options'} onClick={e=>e.stopPropagation()}>
   <div className="studio-settings-heading"><h2>{settingsOpen?'Settings':chords[actions!]?chordName(chords[actions!]):'Chord'}</h2><button className="studio-icon" aria-label="Close settings" onClick={()=>{setSettingsOpen(false);setActions(null)}}><X size={19}/></button></div>
   {settingsOpen?<><label>Chord palette<select value={palette} onChange={e=>setPalette(e.target.value as DicePalette)}>{Object.keys(DICE_PALETTES).map(p=><option key={p}>{p}</option>)}</select></label><label>Sound<select value={settings.instrument} onChange={e=>onSettings({instrument:e.target.value})}>{['Plucked guitar','Electric piano','Soft piano','Warm pad'].map(m=><option key={m}>{m}</option>)}</select></label>
    <p className="card-settings-note">Connected follows the current card’s notes and movement. Random gives every chord in the palette an equal chance. Key, scale and genre settings do not affect card generation.</p>
    <details><summary>Progression & files</summary><label>Name<input maxLength={60} value={name} onChange={e=>onName(e.target.value)}/></label><div className="studio-file-actions"><button onClick={onSave}><Save size={15}/> Save</button><button onClick={()=>{setSettingsOpen(false);onLibrary()}}><Folder size={15}/> Open</button><button onClick={onExport}>MIDI</button></div><button className="open-composer" onClick={openComposer}>Full composer · sections & more <ArrowUpRight size={15}/></button></details>
    <details><summary>Cards & gestures</summary><p>Swipe left for the next card; swipe right to revisit earlier cards. At the end of your trail, the next swipe draws a new chord. Your earlier cards stay the same when you change the slider or palette. Tap a card to hear it. + keeps it in your progression below.</p><p>Use the arrow buttons or keyboard arrows to browse, too. Tap a saved chord to hear it; use ••• for options or hold and drag to reorder.</p></details></>:chords[actions!]&&[['Details',()=>onInspect(actions!)],['Edit',()=>onEdit(actions!)],['Reroll',()=>onReroll(actions!,chooseCard({qualities:DICE_PALETTES[palette],randomness,previous:previousSoundingChord(chords,actions!,previousSectionChord)}))],['Repeat',()=>onRepeat(actions!)],['Remove',()=>onRemove(actions!)]].map(([label,action])=><button key={label as string} disabled={label==='Repeat'&&destination<0} onClick={()=>{(action as ()=>void)();setActions(null)}}>{label as string}</button>)}
  </div></div>}
 </main>;
}
