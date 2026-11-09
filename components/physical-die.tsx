'use client';
import {useEffect,useRef,useState,useId,type PointerEvent} from 'react';
import {D12,D20,add,scale,dot,rotate,multiply,axisAngle,slerp,project,landingOrientation,createRollPlan,rollPose,classifyGesture,frontFaceIndex,type Quat,type Vec3,type RollGesture} from '@/lib/dice-geometry';
export type DieRoll={id:number;face:number;gesture?:RollGesture};
type Pose={q:Quat;x:number;y:number;height:number};
const clamp=(v:number,n:number)=>Math.max(-n,Math.min(n,v));
export function PhysicalDie({kind,labels,valueIndex,request,locked,disabled,onRoll,onSettled,monochrome=false}:{monochrome?:boolean;kind:'pitch'|'chord';labels:string[];valueIndex:number|null;request:DieRoll|null;locked:boolean;disabled:boolean;onRoll:(gesture?:RollGesture)=>void;onSettled:(face:number,id:number)=>void}){
 const mesh=kind==='pitch'?D12:D20;
 const [pose,setPose]=useState<Pose>(()=>({q:landingOrientation(mesh[valueIndex??0]),x:0,y:0,height:0})),[dragging,setDragging]=useState(false);
 const current=useRef(pose),raf=useRef(0),callback=useRef(onSettled),suppressClick=useRef(false),clipId=useId().replace(/:/g,'');
 callback.current=onSettled;
 const drag=useRef<{startX:number;startY:number;origin:Pose;ratio:number;distance:number;samples:{x:number;y:number;t:number}[]}|null>(null);
 function paint(next:Pose){current.current=next;setPose(next)}
 useEffect(()=>()=>cancelAnimationFrame(raf.current),[]);
 useEffect(()=>{
  if(!request)return;cancelAnimationFrame(raf.current);drag.current=null;setDragging(false);
  const plan=createRollPlan(current.current.q,mesh[request.face],request.gesture),origin=current.current;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){paint({q:plan.target,x:0,y:0,height:0});callback.current(request.face,request.id);return}
  const started=performance.now();
  function frame(now:number){const next=rollPose(plan,now-started),left=Math.max(0,1-(now-started)/plan.duration);paint({...next,x:next.x+origin.x*left,y:next.y+origin.y*left});if(next.done){callback.current(request!.face,request!.id)}else raf.current=requestAnimationFrame(frame)}
  raf.current=requestAnimationFrame(frame);
  return()=>cancelAnimationFrame(raf.current);
 },[request?.id]);
 function settle(target:Pose){
  cancelAnimationFrame(raf.current);const from=current.current;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){paint(target);return}
  const started=performance.now();
  function frame(now:number){const t=Math.min(1,(now-started)/500),ease=t===1?1:1-Math.exp(-6*t)*Math.cos(9*t);paint({q:slerp(from.q,target.q,ease),x:from.x+(target.x-from.x)*ease,y:from.y+(target.y-from.y)*ease,height:0});if(t<1)raf.current=requestAnimationFrame(frame)}raf.current=requestAnimationFrame(frame);
 }
 function pointerDown(e:PointerEvent<HTMLButtonElement>){
  if(e.button!==0||disabled||locked)return;cancelAnimationFrame(raf.current);e.currentTarget.setPointerCapture(e.pointerId);suppressClick.current=false;
  drag.current={startX:e.clientX,startY:e.clientY,origin:current.current,ratio:240/e.currentTarget.getBoundingClientRect().width,distance:0,samples:[{x:e.clientX,y:e.clientY,t:e.timeStamp}]};setDragging(true);
 }
 function pointerMove(e:PointerEvent<HTMLButtonElement>){
  const d=drag.current;if(!d)return;const dx=e.clientX-d.startX,dy=e.clientY-d.startY;d.distance=Math.max(d.distance,Math.hypot(dx,dy));d.samples.push({x:e.clientX,y:e.clientY,t:e.timeStamp});d.samples=d.samples.filter(p=>e.timeStamp-p.t<=100).slice(-5);
  const tilt=multiply(axisAngle([1,0,0],clamp(dy*.012,1.3)),axisAngle([0,1,0],clamp(dx*.012,1.3)));
  paint({q:multiply(tilt,d.origin.q),x:clamp(d.origin.x+dx*d.ratio*.3,25),y:clamp(d.origin.y+dy*d.ratio*.2,14),height:0});
 }
 function release(e:PointerEvent<HTMLButtonElement>){
  const d=drag.current;if(!d)return;pointerMove(e);drag.current=null;setDragging(false);suppressClick.current=true;
  const sample=d.samples[0],last=d.samples.at(-1)!,dt=Math.max(16,last.t-sample.t),speed=Math.hypot(last.x-sample.x,last.y-sample.y)/dt,dx=e.clientX-d.startX,dy=e.clientY-d.startY;
  const gesture=classifyGesture(d.distance,speed);
  if(gesture==='tap')onRoll();
  else if(gesture==='roll')onRoll({dx,dy,speed});
  else settle({q:multiply(axisAngle([0,0,1],clamp(dx*.002,.12)),d.origin.q),x:current.current.x,y:current.current.y,height:0});
 }
 function cancel(){if(!drag.current)return;const origin=drag.current.origin;drag.current=null;setDragging(false);suppressClick.current=true;settle(origin)}
 const highlightedFace=frontFaceIndex(mesh,pose.q);
 const faces=mesh.map((face,index)=>{
  const center=rotate(face.center,pose.q),normal=rotate(face.normal,pose.q),right=rotate(face.right,pose.q),up=rotate(face.up,pose.q);
  const vertices=face.vertices.map(v=>project(rotate(v,pose.q))),p=project(center),r=project(add(center,scale(right,.01))),d=project(add(center,scale(up,-.01)));
  const light=Math.max(0,dot(normal,[.25,.45,.85])),shade=Math.round(105+145*Math.min(1,light));
  return {index,center,normal,vertices,shade,visible:dot(normal,add([0,0,4],scale(center,-1)))>0,matrix:[(r[0]-p[0])*100,(r[1]-p[1])*100,(d[0]-p[0])*100,(d[1]-p[1])*100,p[0],p[1]]};
 }).filter(f=>f.visible).sort((a,b)=>a.center[2]-b.center[2]);
 return <button className={`physical-die ${dragging?'dragging':''} ${disabled?'tumbling':''} ${locked?'held':''}`} disabled={disabled||locked} aria-label={`${locked?'Held':disabled?'Rolling':'Reroll'} ${kind} die${valueIndex===null?'':`: ${labels[valueIndex]}`}`} title={locked?'Release the lock to roll':'Tap to reroll · drag to nudge · flick to throw'} onContextMenu={e=>e.preventDefault()} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={release} onPointerCancel={cancel} onLostPointerCapture={cancel} onClick={e=>{if(suppressClick.current&&e.detail!==0){suppressClick.current=false;return}onRoll()}}>
 <svg viewBox="0 0 240 250" aria-hidden="true"><defs><radialGradient id={`${clipId}-shadow`}><stop offset="0" stopColor="#000" stopOpacity=".6"/><stop offset="1" stopColor="#000" stopOpacity="0"/></radialGradient></defs>
 <ellipse cx={120+pose.x} cy={217+pose.y*.3} rx={78-pose.height*.55} ry={15-pose.height*.1} fill={`url(#${clipId}-shadow)`} opacity={1-pose.height/70}/>
 <g transform={`translate(${pose.x} ${pose.y-pose.height})`}>
 {faces.map(f=><g key={f.index}><polygon points={f.vertices.map(p=>p.join(',')).join(' ')} fill={monochrome?(f.index===highlightedFace?'#fff':'#000'):`rgb(${f.shade},${f.shade},${f.shade})`} stroke={monochrome?'#fff':'#aaa'} strokeWidth="1.6" strokeLinejoin="round"/><polygon points={f.vertices.map(p=>p.join(',')).join(' ')} fill="none" stroke="#fff" strokeOpacity=".28" strokeWidth=".6" strokeLinejoin="round"/><clipPath id={`${clipId}-face-${f.index}`}><polygon points={f.vertices.map(p=>p.join(',')).join(' ')}/></clipPath><g clipPath={`url(#${clipId}-face-${f.index})`}><text transform={`matrix(${f.matrix.join(' ')})`} textAnchor="middle" dominantBaseline="central" fontFamily="Arial, sans-serif" fontWeight="600" fontSize={kind==='pitch'?.31:labels[f.index].length>3?.18:.23} fill={monochrome?(f.index===highlightedFace?'#000':'#fff'):f.shade<150?'#f5f5f5':'#191919'}>{labels[f.index]}</text></g></g>)}
 </g></svg>
 </button>;
}
