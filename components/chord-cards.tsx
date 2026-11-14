'use client';
import {useEffect,useRef,useState,type PointerEvent} from 'react';
import {ArrowUpRight,Folder,Play,Plus,Save,Settings2,Undo2,X} from 'lucide-react';
import {KeptChords} from '@/components/kept-chords';
import {availableDiceSlots} from '@/lib/dice';
import {DICE_PALETTES,type DicePalette} from '@/lib/dice-selection';
import {chooseCard,stepCard,cardSwipeDirection,withCardPreview,replaceCardPreview,takeCardBatch,type CardHistory} from '@/lib/card-selection';
import {chooseLogicChord,LOGIC_OPTIONS,type ChordLogic} from '@/lib/chord-logic';
import {inferTonalCenters,tonalMemory,centerName} from '@/lib/card-tonality';
import {previousSoundingChord} from '@/lib/chord-connection';
import {chordName,type Chord,type Settings} from '@/lib/harmony';

type CardLogic=ChordLogic;
export type CardSession={history:CardHistory;palette:DicePalette;randomness:number;addCount?:number;logic?:CardLogic;modulation?:number;movement?:number};
type Props={initialSession?:CardSession;onSessionChange:(session:CardSession)=>void;settings:Settings;chords:Chord[];previousSectionChord?:Chord;onAudition:(c:Chord)=>void;onAddMany:(chords:Chord[])=>void;onStop:()=>void;onInspect:(i:number)=>void;onChordPlay:(i:number)=>void;onReroll:(i:number,c:Chord)=>void;onRepeat:(i:number)=>void;onMove:(from:number,to:number)=>void;onRemove:(i:number)=>void;onEdit:(i:number)=>void;onCompose:()=>void;onDice:()=>void;onSave:()=>void;onLibrary:()=>void;onUndo:()=>void;canUndo:boolean;name:string;onName:(name:string)=>void;onSettings:(patch:Partial<Settings>)=>void;onExport:()=>void};
export function ChordCards({initialSession,onSessionChange,settings,chords,previousSectionChord,onAudition,onAddMany,onStop,onInspect,onChordPlay,onReroll,onRepeat,onMove,onRemove,onEdit,onCompose,onDice,onSave,onLibrary,onUndo,canUndo,name,onName,onSettings,onExport}:Props){
 const [palette,setPalette]=useState<DicePalette>(initialSession?.palette??'Classic'),[randomness,setRandomness]=useState(initialSession?.randomness??35),[settingsOpen,setSettingsOpen]=useState(false),[actions,setActions]=useState<number|null>(null);
 const [logic,setLogic]=useState<CardLogic>(initialSession?.logic??'connection'),[modulation,setModulation]=useState(initialSession?.modulation??35),[movement,setMovement]=useState(initialSession?.movement??35);
 const [addCount,setAddCount]=useState(initialSession?.addCount??1);
 const [history,setHistory]=useState<CardHistory>(()=>{
  const qualities=DICE_PALETTES[initialSession?.palette??'Classic'],randomness=initialSession?.randomness??35;
  const prior=initialSession?.history??{cards:[chooseCard({qualities,randomness,previous:previousSoundingChord(chords,availableDiceSlots(chords)[0]??chords.length,previousSectionChord)})],index:0};
  return withCardPreview(prior,(_,trail)=>chooseLogicChord({logic:initialSession?.logic??'connection',qualities,amount:initialSession?.logic==='tonal'?initialSession.modulation??35:initialSession?.logic==='voice'?initialSession.movement??35:randomness,history:[...chords,...trail]}));
 });
 const [phase,setPhase]=useState('idle'),[offset,setOffset]=useState(0),[dragging,setDragging]=useState(false);
 const gesture=useRef<{id:number;x:number;y:number;t:number;horizontal:boolean}|null>(null),suppressClick=useRef(false),transitioning=useRef(false),timers=useRef<ReturnType<typeof setTimeout>[]>([]),panel=useRef<HTMLDivElement>(null);
 const current=history.cards[history.index],previousCard=history.cards[history.index-1],nextCard=history.cards[history.index+1],busy=phase!=='idle',slots=availableDiceSlots(chords),destination=slots[0]??-1;
 useEffect(()=>()=>timers.current.forEach(clearTimeout),[]);
 useEffect(()=>{onSessionChange({history,palette,randomness,addCount,logic,modulation,movement})},[history,palette,randomness,addCount,logic,modulation,movement]);
 useEffect(()=>{
  if(!settingsOpen&&actions===null)return;
  const before=document.activeElement as HTMLElement|null;panel.current?.querySelector<HTMLButtonElement>('button')?.focus();
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){setSettingsOpen(false);setActions(null)}if(e.key==='Tab'){const nodes=Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not([disabled]),input,select,summary')||[]).filter(n=>n.getClientRects().length),first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}};
  document.addEventListener('keydown',key);return()=>{document.removeEventListener('keydown',key);before?.focus()};
 },[settingsOpen,actions]);
 const amount=logic==='tonal'?modulation:logic==='voice'?movement:randomness;
 const estimates=inferTonalCenters([...chords,...history.cards.slice(0,history.index+1)]);
 const tonal=tonalMemory(current);
 function drawCard(previous:Chord,trail:Chord[],exclude?:Chord,nextAmount=amount,nextPalette=palette,nextLogic=logic){
  return chooseLogicChord({logic:nextLogic,qualities:DICE_PALETTES[nextPalette],amount:nextAmount,history:[...chords,...trail],exclude});
 }
 function navigate(direction:'next'|'back'){
  if(transitioning.current||(direction==='back'&&history.index===0)){setOffset(0);return}
  onStop();transitioning.current=true;setOffset(0);setDragging(false);
  const draw=(previous:Chord,trail:Chord[])=>drawCard(previous,trail);
  const next=withCardPreview(stepCard(history,direction,draw),draw);
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){setHistory(next);transitioning.current=false;return}
  setPhase(`exit-${direction}`);
  timers.current=[setTimeout(()=>{setHistory(next);setPhase(`enter-${direction}`);timers.current=[setTimeout(()=>{setPhase('idle');transitioning.current=false},190)]},140)];
 }
 function updateSelection(value:number,nextPalette=palette,nextLogic=logic){
  if(transitioning.current)return;
  if(nextLogic==='tonal')setModulation(value);else if(nextLogic==='voice')setMovement(value);else setRandomness(value);setPalette(nextPalette);setLogic(nextLogic);
  setHistory(old=>replaceCardPreview(old,(previous,exclude,trail)=>drawCard(previous,trail,exclude,value,nextPalette,nextLogic)));
 }
 function keepBatch(){
  if(transitioning.current||slots.length<addCount)return;
  const batch=takeCardBatch(history,addCount,(previous,trail)=>drawCard(previous,trail));
  onAddMany(batch.chords);setHistory(batch.history);
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
    {previousCard&&<button className="card-preview card-preview-previous" disabled={busy} onClick={()=>navigate('back')} aria-label={`Previous card: ${chordName(previousCard)}`}><span>{chordName(previousCard)}</span></button>}
    <button className="card-preview card-preview-next" disabled={busy} onClick={()=>navigate('next')} aria-label={`Next card: ${chordName(nextCard)}`}><span>{chordName(nextCard)}</span></button>
    <button className={`harmony-card ${phase} ${dragging?'is-dragging':''}`} style={{transform:phase==='idle'?`translateX(${offset}px) rotateY(${offset*.14}deg) rotateZ(${offset*.025}deg)`:undefined}} aria-label={`Play ${chordName(current)}, card ${history.index+1}`} onPointerDown={start} onPointerMove={move} onPointerUp={finish} onPointerCancel={cancel} onLostPointerCapture={cancel} onContextMenu={e=>e.preventDefault()} onKeyDown={e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();navigate(e.key==='ArrowLeft'?'back':'next')}}} onClick={e=>{if(suppressClick.current&&e.detail!==0){suppressClick.current=false;return}if(!transitioning.current)onAudition(current)}}>
     <span className="card-corner"><span>θ</span></span>
     <span className="card-symbol">{chordName(current)}</span>
     <span className="card-foot"><Play size={18}/></span>
    </button>
   </div>
   <span className="sr-only" aria-live="polite">{phase.startsWith('exit')?'':`Card ${history.index+1}: ${chordName(current)}. Next: ${chordName(nextCard)}`}</span>
  </section>
  <section className="studio-controls" aria-label="Card controls">
   <div className="studio-actions"><button className="studio-icon studio-play" disabled={busy} onClick={()=>onAudition(current)} aria-label="Play current card"><Play size={20} fill="currentColor"/></button><div className="card-batch-controls"><button className="studio-icon" disabled={busy||slots.length<addCount} onClick={keepBatch} aria-label={`Add ${addCount} ${addCount===1?'chord':'chords'}`} title={`Add ${addCount} ${addCount===1?'chord':'chords'}`}><Plus size={24}/></button><select value={addCount} disabled={busy} onChange={e=>setAddCount(Number(e.target.value))} aria-label="Number of chords to add">{Array.from({length:16},(_,i)=><option value={i+1} key={i+1}>{i+1}</option>)}</select></div></div>
   <label className="connection-slider"><span>{logic==='tonal'?'Similar':logic==='voice'?'Smooth':'Connected'}</span><input type="range" min="0" max="100" value={amount} disabled={busy} onChange={e=>updateSelection(Number(e.target.value))} aria-label={logic==='tonal'?'Similar to modulated':logic==='voice'?'Smooth to angular':'Connected to random'} aria-valuetext={logic==='tonal'?`${amount}% modulation`:logic==='voice'?`${amount}% angular`:amount===100?'Pure random':amount===0?'Strongly connected':`${amount}% random`}/><span>{logic==='tonal'?'Modulated':logic==='voice'?'Angular':'Random'}</span></label>
   {slots.length<addCount&&<p className="dice-capacity" role="status">{slots.length?`${slots.length} empty ${slots.length===1?'bar remains':'bars remain'}. Choose fewer chords or free up bars.`:'Section full (16 chords). Remove a chord or start another section in the composer.'}</p>}
  </section>
  <KeptChords appearance="cards" chords={chords} onPlay={onChordPlay} onEdit={onEdit} onOptions={setActions} onMove={onMove} onDragStart={onStop}/>
  {(settingsOpen||actions!==null)&&<div className="studio-settings-backdrop" onClick={()=>{setSettingsOpen(false);setActions(null)}}><div ref={panel} className={settingsOpen?'studio-settings':'chord-action-sheet'} role="dialog" aria-modal="true" aria-label={settingsOpen?'Card settings':'Chord options'} onClick={e=>e.stopPropagation()}>
   <div className="studio-settings-heading"><h2>{settingsOpen?'Settings':chords[actions!]?chordName(chords[actions!]):'Chord'}</h2><button className="studio-icon" aria-label="Close settings" onClick={()=>{setSettingsOpen(false);setActions(null)}}><X size={19}/></button></div>
   {settingsOpen?<><label>Card logic<select value={logic} disabled={busy} onChange={e=>{const next=e.target.value as CardLogic;updateSelection(next==='tonal'?modulation:next==='voice'?movement:randomness,palette,next)}}>{LOGIC_OPTIONS.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select></label><label>Chord palette<select value={palette} disabled={busy} onChange={e=>updateSelection(amount,e.target.value as DicePalette)}>{Object.keys(DICE_PALETTES).map(p=><option key={p}>{p}</option>)}</select></label><label>Sound<select value={settings.instrument} onChange={e=>onSettings({instrument:e.target.value})}>{['Plucked guitar','Electric piano','Soft piano','Warm pad'].map(m=><option key={m}>{m}</option>)}</select></label>
    {logic==='connection'?<p className="card-settings-note">Connected follows the current card’s notes and movement. Random gives every chord in the palette an equal chance. Composer key, scale and genre settings do not affect card generation.</p>:logic==='voice'?<p className="card-settings-note">Smooth favors small movements between voices. Angular favors chords that need larger changes. Each choice carries a playable voicing into audition and MIDI. Composer key and scale settings do not steer this mode.</p>:<><p className="card-settings-note">Similar stays around an inferred tonal center. Modulated visits other centers more often and travels farther, using shared chords and dominant-to-tonic arrivals. Centers are inferred from your chords, not the composer’s key settings.</p><div className="card-tonal-context"><span>{tonal?'Current center':'Estimated center'}</span><strong>{tonal?centerName(tonal.center):estimates[0]?centerName(estimates[0]):'Listening…'}</strong>{tonal?.target&&<small>Moving toward {centerName(tonal.target)}</small>}<small>Other possibilities: {estimates.filter(c=>!tonal||c.key!==tonal.center.key||c.mode!==tonal.center.mode).slice(tonal?0:1,tonal?2:3).map(centerName).join(' · ')}</small></div></>}
    <details><summary>Progression & files</summary><label>Name<input maxLength={60} value={name} onChange={e=>onName(e.target.value)}/></label><div className="studio-file-actions"><button onClick={onSave}><Save size={15}/> Save</button><button onClick={()=>{setSettingsOpen(false);onLibrary()}}><Folder size={15}/> Open</button><button onClick={onExport}>MIDI</button></div><button className="open-composer" onClick={openComposer}>Full composer · sections & more <ArrowUpRight size={15}/></button></details>
    <details><summary>Cards & gestures</summary><p>Swipe left for the next card; swipe right to revisit earlier cards. The small cards show your previous and next chords. Changing the slider or palette redraws the next card while preserving the current card and everything behind it. Tap the main card to hear it. Choose 1–16 beside + to keep that many chords, starting with the main card and following the next preview. The batch is added in order and can be undone in one step.</p><p>Tap a small card or use keyboard arrows to browse, too. Tap a saved chord to hear it; use ••• for options or hold and drag to reorder.</p></details></>:chords[actions!]&&[['Details',()=>onInspect(actions!)],['Edit',()=>onEdit(actions!)],['Reroll',()=>onReroll(actions!,chooseLogicChord({logic,qualities:DICE_PALETTES[palette],amount,history:[...(previousSectionChord?[previousSectionChord]:[]),...chords.slice(0,actions!)]}))],['Repeat',()=>onRepeat(actions!)],['Remove',()=>onRemove(actions!)]].map(([label,action])=><button key={label as string} disabled={label==='Repeat'&&destination<0} onClick={()=>{(action as ()=>void)();setActions(null)}}>{label as string}</button>)}
  </div></div>}
 </main>;
}
