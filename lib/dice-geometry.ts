// Small convex-polyhedron renderer primitives. No WebGL dependency or network assets.
export type Vec3=[number,number,number];
export type Quat=[number,number,number,number];
export type DieFace={vertices:Vec3[];center:Vec3;normal:Vec3;right:Vec3;up:Vec3};
export const add=(a:Vec3,b:Vec3):Vec3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
export const scale=(a:Vec3,s:number):Vec3=>[a[0]*s,a[1]*s,a[2]*s];
export const dot=(a:Vec3,b:Vec3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
export const cross=(a:Vec3,b:Vec3):Vec3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const unit=(v:Vec3):Vec3=>scale(v,1/(Math.hypot(...v)||1));
export function multiply(a:Quat,b:Quat):Quat{return [a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1],a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0],a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3],a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]]}
export function axisAngle(axis:Vec3,angle:number):Quat{const v=scale(unit(axis),Math.sin(angle/2));return [...v,Math.cos(angle/2)]}
export function rotate(v:Vec3,q:Quat):Vec3{const t=scale(cross([q[0],q[1],q[2]],v),2);return add(v,add(scale(t,q[3]),cross([q[0],q[1],q[2]],t)))}
export function slerp(a:Quat,b:Quat,t:number):Quat{
 let d=a.reduce((n,v,i)=>n+v*b[i],0),end=b;if(d<0){end=b.map(n=>-n) as Quat;d=-d}
 let q:Quat;if(d>.9995)q=a.map((v,i)=>v+(end[i]-v)*t) as Quat;else{const theta=Math.acos(Math.min(1,d)),s=Math.sin(theta);q=a.map((v,i)=>(v*Math.sin((1-t)*theta)+end[i]*Math.sin(t*theta))/s) as Quat}
 const length=Math.hypot(...q);return q.map(v=>v/length) as Quat;
}
function face(vertices:Vec3[]):DieFace{
 const center=scale(vertices.reduce(add,[0,0,0]),1/vertices.length),normal=unit(center),up=unit(add(vertices[0],scale(center,-1))),right=unit(cross(up,normal));
 const sorted=[...vertices].sort((a,b)=>Math.atan2(dot(a,up),dot(a,right))-Math.atan2(dot(b,up),dot(b,right)));
 return {vertices:sorted,center,normal,right,up};
}
function icosahedron(){
 const phi=(1+Math.sqrt(5))/2,vertices:Vec3[]=[];
 for(const a of [-1,1])for(const b of [-phi,phi])vertices.push(unit([0,a,b]),unit([a,b,0]),unit([b,0,a]));
 const edge=Math.min(...vertices.flatMap((a,i)=>vertices.slice(i+1).map(b=>Math.hypot(...add(a,scale(b,-1))))));
 const near=(a:Vec3,b:Vec3)=>Math.abs(Math.hypot(...add(a,scale(b,-1)))-edge)<1e-6;
 const faces:DieFace[]=[];
 for(let i=0;i<vertices.length;i++)for(let j=i+1;j<vertices.length;j++)for(let k=j+1;k<vertices.length;k++)if(near(vertices[i],vertices[j])&&near(vertices[j],vertices[k])&&near(vertices[k],vertices[i]))faces.push(face([vertices[i],vertices[j],vertices[k]]));
 return {vertices,faces};
}
const ico=icosahedron();
export const D20=ico.faces;
export const D12=ico.vertices.map(vertex=>face(ico.faces.filter(f=>f.vertices.some(v=>Math.hypot(...add(v,scale(vertex,-1)))<1e-6)).map(f=>unit(f.center))));
/** Orient a selected face toward the camera and its label upright, with a slight table tilt. */
export function landingOrientation(face:DieFace):Quat{
 const r=face.right,u=face.up,n=face.normal,m=[r[0],r[1],r[2],u[0],u[1],u[2],n[0],n[1],n[2]];
 const trace=m[0]+m[4]+m[8];let q:Quat;
 if(trace>0){const s=Math.sqrt(trace+1)*2;q=[(m[7]-m[5])/s,(m[2]-m[6])/s,(m[3]-m[1])/s,s/4]}
 else if(m[0]>m[4]&&m[0]>m[8]){const s=Math.sqrt(1+m[0]-m[4]-m[8])*2;q=[s/4,(m[1]+m[3])/s,(m[2]+m[6])/s,(m[7]-m[5])/s]}
 else if(m[4]>m[8]){const s=Math.sqrt(1+m[4]-m[0]-m[8])*2;q=[(m[1]+m[3])/s,s/4,(m[5]+m[7])/s,(m[2]-m[6])/s]}
 else{const s=Math.sqrt(1+m[8]-m[0]-m[4])*2;q=[(m[2]+m[6])/s,(m[5]+m[7])/s,s/4,(m[3]-m[1])/s]}
 return multiply(axisAngle([1,1,0],.18),q);
}
export function project(v:Vec3):[number,number]{const p=80*4/(4-v[2]);return [120+v[0]*p,124-v[1]*p]}
/** Pick one frontmost face, including a deterministic winner at an edge-on tie. */
export function frontFaceIndex(mesh:DieFace[],q:Quat):number{
 let best=0,depth=-Infinity;
 mesh.forEach((face,index)=>{const z=rotate(face.normal,q)[2];if(z>depth){best=index;depth=z}});
 return best;
}
export type RollGesture={dx:number;dy:number;speed:number};
export function classifyGesture(distance:number,speed:number):'tap'|'nudge'|'roll'{return distance<7?'tap':distance>48||(distance>16&&speed>.55)?'roll':'nudge'}
export const ROLL_DURATION=1650;
export const QUICK_ROLL_DURATION=720;
export function rollDuration(gesture?:RollGesture){return gesture?ROLL_DURATION+Math.min(250,Math.max(0,gesture.speed)*120):QUICK_ROLL_DURATION}
export type RollPlan={start:Quat;target:Quat;axis:Vec3;turns:number;drift:number;side:number;duration:number};
export function createRollPlan(start:Quat,face:DieFace,gesture?:RollGesture,random:()=>number=Math.random):RollPlan{
 const speed=gesture?.speed??.6;
 return {start,target:landingOrientation(face),axis:unit([gesture?.dy?gesture.dy/40:.5+random(),gesture?.dx?gesture.dx/40:1+random(),.3+random()]),turns:Math.PI*(gesture?5+random()*3:3+random()),drift:Math.min(24,12+speed*9),side:gesture?.dx?Math.sign(gesture.dx):random()<.5?-1:1,duration:rollDuration(gesture)};
}
/** Ballistic bounces plus damped rolling/rocking; exact landing always matches the result. */
export function rollPose(plan:RollPlan,elapsed:number){
 const t=Math.max(0,Math.min(1,elapsed/plan.duration));
 const endFlight=.66,flight=Math.min(1,t/endFlight),spin=plan.turns*(1-Math.pow(1-flight,2));
 const free=multiply(axisAngle(plan.axis,spin),plan.start),terminal=multiply(axisAngle(plan.axis,plan.turns),plan.start);
 let q=free,height=0;
 const bounces=[[0,.33,32],[.33,.53,12],[.53,.66,4]];
 for(const [start,end,peak] of bounces)if(t>=start&&t<end){const u=(t-start)/(end-start);height=4*peak*u*(1-u)}
 if(t>=endFlight){const u=(t-endFlight)/(1-endFlight),ease=1-Math.pow(1-u,3);q=slerp(terminal,plan.target,ease);q=multiply(axisAngle([1,0,1],Math.sin(u*Math.PI*5)*.12*(1-u)**2),q)}
 const x=plan.side*plan.drift*Math.sin(Math.PI*t)*(1-t*.6),y=Math.sin(t*Math.PI*2)*3*(1-t);
 return {q:t===1?plan.target:q,x,y,height,done:t===1};
}
