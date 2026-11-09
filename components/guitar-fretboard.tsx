'use client';
import {type Fingering} from '@/lib/guitar';
export function GuitarFretboard({shape,name}:{shape:Fingering;name:string}){
 const x=(s:number)=>40+s*30,y=(f:number)=>45+(f-shape.start+.5)*32;
 return <div className="fretboard-wrap"><svg viewBox="0 0 235 220" role="img" aria-label={`${name} guitar fingering, low E to high E: ${shape.frets.map(f=>f<0?'muted':f===0?'open':`fret ${f}`).join(', ')}. Finger numbers: ${shape.fingers.join(', ')}.`}>
 {Array.from({length:5},(_,i)=><g key={i}><line x1="40" x2="190" y1={45+i*32} y2={45+i*32} stroke={i===0&&shape.start===1?'#c7c7c7':'#535353'} strokeWidth={i===0&&shape.start===1?4:1}/>{i<4&&<text x="23" y={66+i*32} textAnchor="middle" className="fret-number">{shape.start+i}</text>}</g>)}
 {shape.frets.map((f,i)=><g key={i}><line x1={x(i)} x2={x(i)} y1="45" y2="173" stroke="#7b7b7b" strokeWidth={1.7-i*.18}/><text x={x(i)} y="30" textAnchor="middle" className="string-status">{f<0?'×':f===0?'○':''}</text><text x={x(i)} y="198" textAnchor="middle" className="string-name">{['E','A','D','G','B','e'][i]}</text></g>)}
 {shape.barre&&<line x1={x(shape.barre.from)} x2={x(shape.barre.to)} y1={y(shape.barre.fret)} y2={y(shape.barre.fret)} stroke="#c2c2c2" strokeWidth="18" strokeLinecap="round"/>}
 {shape.frets.map((f,i)=>f>0&&<g key={i}><circle cx={x(i)} cy={y(f)} r="10" fill="#d8d8d8"/><text x={x(i)} y={y(f)+3.5} textAnchor="middle" className="finger-number">{shape.fingers[i]}</text></g>)}
 </svg><div className="fingering-legend"><span>1 index · 2 middle · 3 ring · 4 pinky</span><span>○ open · × mute · E A D G B e</span>{shape.omittedFifth&&<span className="omission-note">Perfect fifth omitted for a playable voicing.</span>}</div></div>
}
