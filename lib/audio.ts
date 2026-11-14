import {voice,type Chord} from './harmony.ts';

type SoundGroup={output:GainNode;oscillators:Set<OscillatorNode>};
export const CHORD_RELEASE_SECONDS=.03;
export class Instrument{
 context:AudioContext|null=null;
 master:GainNode|null=null;
 nodes:OscillatorNode[]=[];
 private sounds=new Set<SoundGroup>();
 async ready(){
  if(!this.context){
   this.context=new(window.AudioContext||(window as any).webkitAudioContext)();
   this.master=this.context.createGain();this.master.gain.value=.55;
   const compressor=this.context.createDynamicsCompressor();this.master.connect(compressor);compressor.connect(this.context.destination);
  }
  if(this.context.state!=='running')await this.context.resume();
 }
 play(c:Chord,duration=1.7,instrument='Electric piano',prev:number[]=[],when?:number,notesOverride?:number[]){
  if(!this.context||!this.master)return [];
  if(c.empty){this.stop();return prev;}
  const ctx=this.context,start=when??ctx.currentTime,notes=notesOverride||voice(c,prev);
  if(!notes.length)return notes;
  // One release envelope per chord preserves every partial's attack/decay while fading it out.
  const output=ctx.createGain();output.gain.value=1;output.connect(this.master);
  const sound:SoundGroup={output,oscillators:new Set()};this.sounds.add(sound);
  notes.forEach((m,i)=>{
   const freq=440*Math.pow(2,(m-69)/12);
   const partials=instrument==='Plucked guitar'?[1,.4,.16,.07]:instrument==='Soft piano'?[1,.32,.13,.06]:instrument==='Warm pad'?[1,.13,.06]:[1,.26,.08];
   partials.forEach((amp,j)=>{
    const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine';
    osc.frequency.value=freq*(instrument==='Plucked guitar'?j+1:j===2?4:j+1);
    const t=start+(instrument==='Plucked guitar'?i*.018:instrument==='Soft piano'?i*.009:0),attack=instrument==='Warm pad'?.15:.012,level=amp*.19/Math.sqrt(notes.length);
    gain.gain.setValueAtTime(0,t);
    gain.gain.linearRampToValueAtTime(level,t+attack);
    gain.gain.exponentialRampToValueAtTime(level*(instrument==='Warm pad'?.65:.16),t+Math.max(.2,duration*.8));
    gain.gain.exponentialRampToValueAtTime(.0001,t+duration+.3);
    gain.gain.linearRampToValueAtTime(0,t+duration+.38);
    osc.connect(gain);gain.connect(output);osc.start(t);osc.stop(t+duration+.4);
    this.nodes.push(osc);sound.oscillators.add(osc);
    osc.onended=()=>{
     this.nodes=this.nodes.filter(n=>n!==osc);sound.oscillators.delete(osc);osc.disconnect();gain.disconnect();
     if(!sound.oscillators.size){this.sounds.delete(sound);output.disconnect()}
    };
   });
  });
  return notes;
 }
 stop(){
  if(!this.context)return;
  const now=this.context.currentTime,end=now+CHORD_RELEASE_SECONDS;
  for(const sound of this.sounds){
   // This bus has constant unity gain until its first release. Removing it from the active
   // set prevents another rapid tap from restarting the fade or raising its volume again.
   sound.output.gain.setValueAtTime(1,now);
   sound.output.gain.linearRampToValueAtTime(0,end);
   for(const osc of sound.oscillators){try{osc.stop(end+.005)}catch{}}
  }
  this.sounds.clear();
 }
}
