'use client';
import {Chord,chordName,tension} from '@/lib/harmony';
export function HarmonicContour({chords,selected,keyCenter,mode,onSelect}:{chords:Chord[];selected:number;keyCenter:number;mode:string;onSelect:(c:Chord,i:number)=>void}){
 const levels=chords.map(c=>c.empty?null:tension(c,c.key??keyCenter,c.mode??mode)),x=(i:number)=>chords.length===1?300:i*600/(chords.length-1),y=(i:number)=>100-(levels[i]??0)*.8;
 const previous=chords.slice(0,selected).filter(c=>!c.empty).at(-1),current=chords[selected];
 const delta=current&&!current.empty&&previous?tension(current,current.key??keyCenter,current.mode??mode)-tension(previous,current.key??keyCenter,current.mode??mode):null;
 const description=!chords.length?'Add a chord to begin your harmonic contour.':current?.empty?'Empty bar · silent until you add a chord':delta===null?'Starting point':delta>2?'Tension builds from the previous chord':delta< -2?'Tension eases from the previous chord':'Similar tension to the previous chord';
 return <section className="journey"><div className="panel-heading"><span>HARMONIC CONTOUR</span><span className="subtle">relative harmonic tension</span></div>
 <div className="contour-area"><div className="contour-axis"><span>↑ More tension</span><span>↓ Less tension<br/>More settled</span></div><div className="curve">
 <svg viewBox="0 0 600 100" preserveAspectRatio="none" role="img" aria-label="Harmonic contour. Higher points indicate more tension; lower points indicate release. Gaps are empty bars.">{[20,55,90].map(row=><line key={row} x1="0" x2="600" y1={row} y2={row} stroke="#343434" strokeDasharray="3 5"/>)}
 {chords.map((c,i)=>i>0&&!c.empty&&!chords[i-1].empty?<line key={`line-${i}`} x1={x(i-1)} y1={y(i-1)} x2={x(i)} y2={y(i)} stroke="#b7b7b7" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>:null)}
 {chords.map((c,i)=>!c.empty&&<circle key={i} cx={x(i)} cy={y(i)} r={selected===i?4:2.5} fill={selected===i?'#d9d9d9':'#747474'}><title>{`Bar ${i+1}: ${chordName(c)}. Relative tension ${levels[i]}/100.`}</title></circle>)}
 </svg><div className={'curve-bars '+(chords.length===1?'single-point':'')}>{chords.map((c,i)=><button key={i} onClick={()=>onSelect(c,i)} aria-label={`Inspect bar ${i+1}, ${c.empty?'empty':'tension '+levels[i]}`} aria-current={selected===i?'true':undefined} className={selected===i?'active':''}>{i+1}</button>)}</div></div></div>
 <div className="contour-reading"><span>{chords.length?`Bar ${selected+1} · ${chordName(current||chords[0])}`:'Your harmonic journey'}</span><p>{description}</p></div>
 <p className="contour-explanation">Rising = tension builds. Falling = tension eases toward release. An estimate of harmonic color and stability. Empty bars leave gaps in the curve.</p></section>
}
