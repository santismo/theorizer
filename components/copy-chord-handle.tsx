'use client';
import {useRef,useState,type PointerEvent} from 'react';
import {createPortal} from 'react-dom';
import {Copy} from 'lucide-react';
export function CopyChordHandle({name,onCopy,onPick}:{name:string;onCopy:(index:number)=>void;onPick:()=>void}){
 const [ghost,setGhost]=useState<{x:number;y:number}|null>(null);
 const drag=useRef<{x:number;y:number;moved:boolean;target:HTMLElement|null}|null>(null),suppress=useRef(false);
 function clear(){drag.current?.target?.classList.remove('drop-ready');drag.current=null;setGhost(null)}
 function move(e:PointerEvent<HTMLButtonElement>){const d=drag.current;if(!d)return;if(Math.hypot(e.clientX-d.x,e.clientY-d.y)>8)d.moved=true;if(!d.moved)return;setGhost({x:e.clientX,y:e.clientY});if(e.clientY>window.innerHeight-75)window.scrollBy(0,12);else if(e.clientY<75)window.scrollBy(0,-12);const target=document.elementFromPoint(e.clientX,e.clientY)?.closest<HTMLElement>('[data-empty-slot]')||null;if(target!==d.target){d.target?.classList.remove('drop-ready');target?.classList.add('drop-ready');d.target=target;}}
 return <><button className="card-icon copy-handle" aria-label={`Copy ${name} to an empty bar`} title="Drag to copy, or tap then choose an empty bar" onPointerDown={e=>{if(e.button!==0)return;e.currentTarget.setPointerCapture(e.pointerId);drag.current={x:e.clientX,y:e.clientY,moved:false,target:null};suppress.current=false}} onPointerMove={move} onPointerUp={e=>{move(e);const d=drag.current;if(d?.moved){suppress.current=true;if(d.target)onCopy(Number(d.target.dataset.emptySlot));}clear()}} onPointerCancel={clear} onLostPointerCapture={clear} onClick={()=>{if(suppress.current){suppress.current=false;return}onPick()}}><Copy size={14}/></button>{ghost&&createPortal(<div className="drag-chord-ghost" style={{left:ghost.x,top:ghost.y}} aria-hidden="true"><Copy size={14}/>{name}</div>,document.body)}</>
}
