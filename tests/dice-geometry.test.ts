import assert from 'node:assert/strict';
import {D12,D20,landingOrientation,rotate,dot,project,createRollPlan,rollPose,classifyGesture,frontFaceIndex,rollDuration,type Vec3} from '../lib/dice-geometry.ts';
assert.equal(D12.length,12);assert.equal(D20.length,20);
assert.ok(D12.every(f=>f.vertices.length===5));assert.ok(D20.every(f=>f.vertices.length===3));
const key=(v:Vec3)=>v.map(n=>n.toFixed(6)).join(',');
for(const mesh of [D12,D20]){
 const edges=new Map<string,number>(),vertices=new Set<string>();
 for(const f of mesh){
  assert.ok(Math.abs(Math.hypot(...f.normal)-1)<1e-9);
  assert.ok(Math.abs(dot(f.normal,f.right))<1e-9&&Math.abs(dot(f.normal,f.up))<1e-9);
  const plane=dot(f.center,f.normal);assert.ok(f.vertices.every(v=>Math.abs(dot(v,f.normal)-plane)<1e-8),'Faces must be planar');
  f.vertices.forEach((v,i)=>{vertices.add(key(v));const edge=[key(v),key(f.vertices[(i+1)%f.vertices.length])].sort().join('|');edges.set(edge,(edges.get(edge)||0)+1)});
  const q=landingOrientation(f),n=rotate(f.normal,q),u=rotate(f.up,q),r=rotate(f.right,q);
  assert.ok(n[2]>.98,'Chosen result must face the viewer');assert.ok(u[1]>.98&&r[0]>.98,'Landing text stays upright');
  assert.ok(mesh.filter(other=>rotate(other.normal,q)[2]>.98).length===1,'Only one result face is centered');
  assert.equal(frontFaceIndex(mesh,q),mesh.indexOf(f),'Highlight matches every committed result');
  const plan=createRollPlan(landingOrientation(mesh[0]),f,{dx:32,dy:-10,speed:.9},()=>.42);
  let wasAirborne=false,visibleFaces=new Set<number>();
  for(let time=0;time<=plan.duration;time+=16){const pose=rollPose(plan,time);assert.ok(Math.abs(Math.hypot(...pose.q)-1)<1e-6);assert.ok(Number.isFinite(pose.x+pose.y+pose.height));if(pose.height>1)wasAirborne=true;
   mesh.forEach((face,i)=>{if(rotate(face.normal,pose.q)[2]>.5)visibleFaces.add(i)});
   for(const v of mesh.flatMap(face=>face.vertices)){const [x,y]=project(rotate(v,pose.q));assert.ok(x+pose.x>-5&&x+pose.x<245&&y+pose.y-pose.height>-10&&y+pose.y-pose.height<250,'Dice remain inside the gesture area')}
  }
  assert.ok(wasAirborne);assert.ok(visibleFaces.size>=mesh.length*.6,'A roll exposes many labeled sides');
  const end=rollPose(plan,plan.duration+100);assert.ok(end.done);assert.equal(end.height,0);assert.deepEqual(end.q,plan.target);assert.ok(Math.abs(end.x)<1e-8&&Math.abs(end.y)<1e-8);
 }
 assert.ok([...edges.values()].every(n=>n===2),'Each edge joins exactly two faces');assert.equal(vertices.size-edges.size+mesh.length,2,'Closed convex polyhedron');
}
let overlappingHighlights=0;
for(const mesh of [D12,D20])for(const [index,face] of mesh.entries()){
 const quick=createRollPlan(landingOrientation(mesh[0]),face,undefined,()=>.42);
 const hand=createRollPlan(landingOrientation(mesh[0]),face,{dx:40,dy:10,speed:1},()=>.42);
 assert.ok(quick.duration<800&&quick.duration<hand.duration/2,'Automatic rolls finish in under half the hand-throw time');
 assert.ok(hand.duration>=1650,'Hand throws retain their longer animation');
 assert.equal(quick.duration,rollDuration());assert.equal(hand.duration,rollDuration({dx:40,dy:10,speed:1}),'Arena and tumble use the same timing');
 for(const plan of [quick,hand]){
  for(let time=0;time<plan.duration;time+=16){
   const {q}=rollPose(plan,time),selected=frontFaceIndex(mesh,q);
   assert.equal(mesh.filter((_,i)=>i===selected).length,1,'Exactly one face is highlighted throughout each roll');
   assert.ok(rotate(mesh[selected].normal,q)[2]>.7,'Highlighted face remains in view');
   if(mesh.filter(f=>rotate(f.normal,q)[2]>.8).length>1)overlappingHighlights++;
  }
  const end=rollPose(plan,plan.duration);assert.ok(end.done);assert.equal(frontFaceIndex(mesh,end.q),index);
 }
}
assert.ok(overlappingHighlights>0,'Regression includes orientations that previously highlighted two faces');
assert.ok(rollDuration({dx:0,dy:60,speed:2})>rollDuration({dx:0,dy:60,speed:.1}),'Manual throw speed still affects timing');
assert.equal(classifyGesture(3,0),'tap');assert.equal(classifyGesture(12,.1),'nudge');assert.equal(classifyGesture(25,.2),'nudge');assert.equal(classifyGesture(20,.8),'roll');assert.equal(classifyGesture(65,.1),'roll');
console.log('D12/D20 geometry, all 32 results, single-face highlights across quick/manual rolls, synchronized timing, bounded trajectories, and tap/nudge/flick thresholds passed.');
