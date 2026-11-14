import assert from 'node:assert/strict';
import {Instrument,CHORD_RELEASE_SECONDS} from '../lib/audio.ts';
class Param{value=0;events:{kind:string;value:number;time:number}[]=[];setValueAtTime(value:number,time:number){this.events.push({kind:'set',value,time})}linearRampToValueAtTime(value:number,time:number){this.events.push({kind:'linear',value,time})}exponentialRampToValueAtTime(value:number,time:number){this.events.push({kind:'exponential',value,time})}}
class Gain{gain=new Param();disconnected=false;connect(){}disconnect(){this.disconnected=true}}
class Osc{frequency=new Param();type='';onended:(()=>void)|null=null;stops:number[]=[];startTime=0;disconnected=false;connect(){}disconnect(){this.disconnected=true}start(t:number){this.startTime=t}stop(t:number){this.stops.push(t)}}
const gains:Gain[]=[],oscs:Osc[]=[];
const ctx={currentTime:0,createGain(){const node=new Gain();gains.push(node);return node},createOscillator(){const node=new Osc();oscs.push(node);return node}};
const instrument=new Instrument();instrument.context=ctx as unknown as AudioContext;instrument.master=new Gain() as unknown as GainNode;
instrument.play({root:0,quality:'maj7'},1.7,'Plucked guitar');
const first=gains[0],firstOscillators=oscs.slice();ctx.currentTime=.01;instrument.stop();
assert.deepEqual(first.gain.events,[{kind:'set',value:1,time:.01},{kind:'linear',value:0,time:.01+CHORD_RELEASE_SECONDS}]);
for(const osc of firstOscillators)assert.equal(osc.stops.at(-1),.01+CHORD_RELEASE_SECONDS+.005);
// Later taps must never reopen or prolong an earlier release, including unstarted strum notes.
ctx.currentTime=.015;instrument.stop();assert.equal(first.gain.events.length,2);
const nextIndex=gains.length;instrument.play({root:5,quality:'m7'},1.7,'Soft piano');
ctx.currentTime=.02;instrument.stop();assert.equal(first.gain.events.length,2);assert.equal(gains[nextIndex].gain.events.at(-1)?.value,0);
for(const osc of oscs)osc.onended?.();assert.equal(instrument.nodes.length,0);assert.ok(gains.every(n=>n.disconnected));assert.ok(oscs.every(n=>n.disconnected));
console.log('Chord releases passed: short fade, rapid repeated stop, future strum cancellation, independent groups and node cleanup.');
