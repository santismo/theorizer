'use client';
import {useEffect,useRef,useState,type PointerEvent} from 'react';
import {createPortal} from 'react-dom';
import {Plus,MoreHorizontal} from 'lucide-react';
import {chordName,type Chord} from '@/lib/harmony';
import {nearestChordGridSlot} from '@/lib/chord-order';

type Props={appearance?:'tiles'|'cards';chords:Chord[];onPlay:(index:number)=>void;onEdit:(index:number)=>void;onOptions:(index:number)=>void;onMove:(from:number,to:number)=>void;onDragStart:()=>void};
type Drag={from:number;to:number;pointerId:number;startX:number;startY:number;x:number;y:number;offsetX:number;offsetY:number;width:number;height:number;active:boolean;handle:HTMLButtonElement};
type Preview={from:number;to:number;left:number;top:number;width:number};

export function KeptChords({appearance='tiles',chords,onPlay,onEdit,onOptions,onMove,onDragStart}:Props){
 const strip=useRef<HTMLDivElement>(null),drag=useRef<Drag|null>(null),hold=useRef<ReturnType<typeof setTimeout>|null>(null),frame=useRef(0),suppressClick=useRef(false);
 const [preview,setPreview]=useState<Preview|null>(null),[announcement,setAnnouncement]=useState('');
 function clearTimer(){if(hold.current!==null){clearTimeout(hold.current);hold.current=null}}
 function clear(){
  clearTimer();cancelAnimationFrame(frame.current);const d=drag.current;drag.current=null;setPreview(null);
  if(d?.handle.hasPointerCapture(d.pointerId))d.handle.releasePointerCapture(d.pointerId);
 }
 useEffect(()=>{const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'&&drag.current){suppressClick.current=true;clear();setAnnouncement('Move cancelled.')}};window.addEventListener('keydown',escape);return()=>{window.removeEventListener('keydown',escape);clearTimer();cancelAnimationFrame(frame.current)}},[]);
 // Cancel a pending gesture if Undo, loading, or editing replaces the progression.
 useEffect(()=>{clear()},[chords]);
 function update(){
  const d=drag.current,list=strip.current;if(!d?.active||!list)return;
  const bounds=list.getBoundingClientRect();
  const slots=Array.from(list.querySelectorAll<HTMLElement>('[data-reorder-slot]'));
  const centers=slots.map(node=>({x:bounds.left+node.offsetLeft+node.offsetWidth/2,y:bounds.top+node.offsetTop+node.offsetHeight/2}));
  d.to=nearestChordGridSlot(centers,d.x-d.offsetX+d.width/2,d.y-d.offsetY+d.height/2);
  setPreview({from:d.from,to:d.to,left:d.x-d.offsetX,top:d.y-d.offsetY,width:d.width});
 }
 function tick(){
  const d=drag.current,list=strip.current;if(!d?.active||!list)return;
  const edge=60;
  const speed=d.y<edge?-Math.min(12,(edge-d.y)*.25):d.y>window.innerHeight-edge?Math.min(12,(d.y-window.innerHeight+edge)*.25):0;
  if(speed)window.scrollBy(0,speed);
  update();
  frame.current=requestAnimationFrame(tick);
 }
 function activate(){const d=drag.current;if(!d||d.active)return;clearTimer();d.active=true;suppressClick.current=true;onDragStart();setAnnouncement(`Moving ${chordName(chords[d.from])}. Drag to another position, then release.`);update();frame.current=requestAnimationFrame(tick)}
 function start(e:PointerEvent<HTMLButtonElement>,index:number){
  if(e.button!==0||!e.isPrimary||drag.current)return;
  suppressClick.current=false;e.currentTarget.setPointerCapture(e.pointerId);
  const rect=e.currentTarget.parentElement!.getBoundingClientRect();
  drag.current={from:index,to:index,pointerId:e.pointerId,startX:e.clientX,startY:e.clientY,x:e.clientX,y:e.clientY,offsetX:e.clientX-rect.left,offsetY:e.clientY-rect.top,width:rect.width,height:rect.height,active:false,handle:e.currentTarget};
  hold.current=setTimeout(activate,250);
 }
 function move(e:PointerEvent<HTMLButtonElement>){const d=drag.current;if(!d||e.pointerId!==d.pointerId)return;d.x=e.clientX;d.y=e.clientY;if(Math.hypot(d.x-d.startX,d.y-d.startY)>8)activate();if(d.active){e.preventDefault();update()}}
 function finish(e:PointerEvent<HTMLButtonElement>){
  const d=drag.current;if(!d||e.pointerId!==d.pointerId)return;
  move(e);const {from,to,active}=d;clear();
  if(active&&to>=0&&from!==to){onMove(from,to);setAnnouncement(`${chordName(chords[from])} moved to bar ${to+1}.`);requestAnimationFrame(()=>strip.current?.querySelector<HTMLButtonElement>(`[data-move-handle="${to}"]`)?.focus({preventScroll:true}))}
 }
 function cancel(){if(!drag.current)return;suppressClick.current=true;clear();setAnnouncement('Move cancelled.')}
 function shift(index:number){
  if(!preview||index===preview.from)return undefined;
  const slots=strip.current?.querySelectorAll<HTMLElement>('[data-reorder-slot]');if(!slots)return undefined;
  const target=preview.from<preview.to&&index>preview.from&&index<=preview.to?index-1:preview.from>preview.to&&index>=preview.to&&index<preview.from?index+1:index;
  return `translate(${slots[target].offsetLeft-slots[index].offsetLeft}px,${slots[target].offsetTop-slots[index].offsetTop}px)`;
 }
 const destination=preview&&strip.current?.querySelectorAll<HTMLElement>('[data-reorder-slot]')[preview.to];
 return <section className={`kept-chords ${appearance==='cards'?'card-kept':''}`} aria-label="Kept chords">
  <div className={`kept-scroll ${preview?'is-reordering':''}`} ref={strip}>
   {chords.map((c,i)=>c.empty?<button key={i} className="kept-chord vacant reorder-slot" data-reorder-slot={i} data-empty-slot={i} style={{transform:shift(i)}} aria-label={`Add chord to bar ${i+1}`} onClick={()=>onEdit(i)}><Plus size={15}/></button>:<div key={i} data-reorder-slot={i} className={`kept-tile reorder-slot ${preview?.from===i?'drag-source':''}`} style={{transform:shift(i)}}>
    <button className="kept-chord" aria-label={`Play ${chordName(c)}, bar ${i+1}`} onClick={()=>onPlay(i)}><span>{chordName(c)}</span></button>
    <button className="kept-more" data-move-handle={i} aria-label={`Options for ${chordName(c)}, bar ${i+1}; hold and drag to move`} title="Tap for options · hold and drag to move · arrow keys to move" onContextMenu={e=>e.preventDefault()} onPointerDown={e=>start(e,i)} onPointerMove={move} onPointerUp={finish} onPointerCancel={cancel} onLostPointerCapture={cancel} onKeyDown={e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const to=i+({ArrowLeft:-1,ArrowRight:1,ArrowUp:-4,ArrowDown:4}[e.key]??0);if(to>=0&&to<chords.length){onMove(i,to);setAnnouncement(`${chordName(c)} moved to bar ${to+1}.`);requestAnimationFrame(()=>strip.current?.querySelector<HTMLButtonElement>(`[data-move-handle="${to}"]`)?.focus())}}else if(e.key==='Enter'||e.key===' ')suppressClick.current=false}} onClick={()=>{if(suppressClick.current){suppressClick.current=false;return}onOptions(i)}}><MoreHorizontal size={15}/></button>
   </div>)}
   {chords.length<16&&<button className="kept-chord vacant" data-empty-slot={chords.length} onClick={()=>onEdit(chords.length)} aria-label="Add an exact chord"><Plus size={16}/></button>}
   {preview&&destination&&<div className="chord-drop-position" aria-hidden="true" style={{left:destination.offsetLeft,top:destination.offsetTop,width:destination.offsetWidth,height:destination.offsetHeight}}/>}
  </div>
  <span className="reorder-announcement" role="status">{announcement}</span>
  {preview&&chords[preview.from]&&createPortal(<div className={`kept-tile kept-drag-ghost ${appearance==='cards'?'card-kept':''}`} aria-hidden="true" style={{left:preview.left,top:preview.top,width:preview.width}}><div className="kept-chord">{chordName(chords[preview.from])}</div><div className="kept-more"><MoreHorizontal size={15}/></div></div>,document.body)}
 </section>;
}
