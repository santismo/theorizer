export type Chord = {voicing?:number[];root:number; quality:string; bass?:number; locked?:boolean; spelling?:string; key?:number; mode?:string;transition?:string;empty?:boolean};
export type Settings = {genre:string;style:string;key:number;mode:string;count:number;color:number;movement:string;modulation:string;ending:string;tempo:number;instrument:string;swing:number;modulationApproach?:string;modulationTargetKey?:number;modulationTargetMode?:string;modulationAt?:number;modulationReturn?:boolean;modulationReturnAt?:number};
export const NOTES=['C','Db','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
export const SHARPS=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
export const QUALITIES:Record<string,number[]>={'':[0,4,7],m:[0,3,7],'5':[0,7],dim:[0,3,6],aug:[0,4,8],sus2:[0,2,7],sus4:[0,5,7],'6':[0,4,7,9],m6:[0,3,7,9],'7':[0,4,7,10],maj7:[0,4,7,11],m7:[0,3,7,10],mMaj7:[0,3,7,11],m7b5:[0,3,6,10],dim7:[0,3,6,9],'9':[0,4,7,10,14],maj9:[0,4,7,11,14],m9:[0,3,7,10,14],add9:[0,4,7,14],madd9:[0,3,7,14],'11':[0,7,10,14,17],m11:[0,3,7,10,14,17],'13':[0,4,7,10,14,21],maj13:[0,4,7,11,14,21],m13:[0,3,7,10,14,21],'7b9':[0,4,7,10,13],'7#9':[0,4,7,10,15],'7#11':[0,4,7,10,18],'maj7#11':[0,4,7,11,18],'7sus4':[0,5,7,10],'9sus4':[0,5,7,10,14],'7b9#11':[0,4,7,10,13,18],'13b9':[0,4,7,10,13,21],'maj9#11':[0,4,7,11,14,18],'mMaj9':[0,3,7,11,14],'7#5#9':[0,4,8,10,15]};
const mod=(n:number)=>((n%12)+12)%12;
export const SCALES:Record<string,number[]>={Major:[0,2,4,5,7,9,11],Minor:[0,2,3,5,7,8,10],Dorian:[0,2,3,5,7,9,10],Mixolydian:[0,2,4,5,7,9,10],Lydian:[0,2,4,6,7,9,11],Phrygian:[0,1,3,5,7,8,10]};
type Profile={name:string;family:string;mode:string;color:number;patterns:number[][];description:string};
const P=(name:string,family:string,mode:string,color:number,patterns:number[][],description:string):Profile=>({name,family,mode,color,patterns,description});
export const GENRES:Record<string,Profile[]>={
'Jazz':[P('Standards','jazz','Major',60,[[1,4,6,2,5,1],[2,5,1,6],[1,6,2,5]],'Functional harmony, ii–V movement, and warm seventh chords.'),P('Bebop','jazz','Major',80,[[3,6,2,5,1],[1,6,2,5],[2,5,1,4]],'Fast harmonic motion, secondary dominants, and altered tension.'),P('Modal jazz','modal','Dorian',65,[[1,1,4,1],[1,2,1,4]],'Room to breathe: sustained modes and open-ended vamps.'),P('Cool jazz','jazz','Major',45,[[1,3,2,5],[2,5,1,4]],'Gentle extensions with spacious, connected harmony.'),P('Jazz fusion','fusion','Dorian',85,[[1,4,2,5],[1,6,4,2]],'Modal colors, extended chords, and unexpected root movement.'),P('Gypsy jazz','jazz','Minor',45,[[1,4,5,1],[1,6,2,5]],'Minor sixth colors and strong dominant resolutions.')],
'R&B / Soul':[P('Neo-soul','soul','Minor',85,[[4,5,3,6],[2,5,1,6],[1,4,7,3]],'Lush ninths, close voice leading, and softly shifting harmony.'),P('Classic soul','soul','Major',50,[[1,6,4,5],[1,3,4,4],[2,5,1,6]],'Warm sevenths, gospel roots, and familiar cadences.'),P('Contemporary R&B','soul','Minor',75,[[6,4,1,5],[1,7,6,5],[4,3,6,1]],'Intimate minor loops with suspended and extended colors.'),P('Gospel','gospel','Major',75,[[1,3,4,2,5,1],[6,2,5,1],[4,1,2,5]],'Rich passing harmony, plagal movement, and strong resolutions.'),P('Quiet storm','soul','Major',80,[[4,3,2,5],[1,6,2,5]],'Silky major ninths and slowly resolving tension.')],
'Pop':[P('Modern pop','pop','Major',15,[[1,5,6,4],[6,4,1,5],[1,4,6,5]],'Clear triads and memorable, singable cycles.'),P('Indie pop','indie','Major',40,[[4,1,5,6],[1,3,4,4],[6,5,4,1]],'Bittersweet colors, added notes, and off-center loops.'),P('Dream pop','ambient','Lydian',60,[[1,2,6,4],[4,1,3,6]],'Floating added-note chords and blurred resolutions.'),P('Synth-pop','pop','Minor',30,[[1,6,3,7],[6,7,1,1]],'Minor-key cycles with bright relative-major lift.'),P('Art pop','fusion','Major',65,[[1,3,6,4],[4,2,6,5]],'Unexpected turns and colorful harmony with a melodic center.')],
'Rock':[P('Classic rock','rock','Mixolydian',10,[[1,7,4,1],[1,4,5,4]],'Bold roots, major chords, and flat-seventh movement.'),P('Alternative rock','rock','Minor',20,[[1,6,3,7],[1,4,6,5]],'Minor-key energy, borrowed colors, and direct movement.'),P('Progressive rock','fusion','Minor',60,[[1,3,6,2,5],[1,7,4,6]],'Longer harmonic journeys with modal and chromatic detours.'),P('Post-rock','ambient','Major',45,[[1,5,6,4],[4,1,6,5]],'Wide, suspended harmony with slowly evolving tension.'),P('Punk rock','power','Major',0,[[1,4,5,1],[1,5,6,4]],'Direct power chords and driving, economical changes.'),P('Shoegaze','ambient','Major',55,[[1,3,4,6],[6,4,1,5]],'Dense added notes and dreamy harmonic repetition.')],
'Metal':[P('Heavy metal','power','Minor',0,[[1,6,7,1],[1,4,6,5]],'Dark power-chord cycles and forceful root motion.'),P('Progressive metal','power','Phrygian',35,[[1,2,6,5],[1,4,2,7]],'Angular roots, flat-second tension, and extended cycles.'),P('Doom metal','power','Minor',10,[[1,1,6,5],[1,4,2,1]],'Slow, weighty movement around a dark tonal center.'),P('Black metal','power','Minor',15,[[1,6,4,7],[1,2,6,7]],'Minor and modal root patterns with unresolved energy.')],
'Blues':[P('12-bar blues','blues','Major',35,[[1,1,1,1,4,4,1,1,5,4,1,5]],'Dominant I, IV, and V; choose 12 chords for a full blues form.'),P('Jazz blues','bluesjazz','Major',70,[[1,4,1,1,4,4,1,6,2,5,1,5]],'A blues foundation with jazz turnarounds and added color.'),P('Minor blues','minorblues','Minor',40,[[1,1,1,1,4,4,1,1,6,5,1,5]],'Minor tonic and subdominant with a strong dominant return.'),P('Blues rock','blues','Major',15,[[1,4,1,5],[1,1,4,5]],'Raw dominant harmony and compact blues movement.')],
'Funk':[P('Classic funk','funk','Mixolydian',65,[[1,1,4,1],[1,4,1,5]],'Dominant ninths and economical, groove-centered vamps.'),P('Jazz funk','fusion','Dorian',85,[[1,4,2,5],[1,1,4,7]],'Extended modal chords and colorful connecting movement.'),P('Disco','funk','Minor',60,[[1,4,7,3],[6,2,5,1]],'Flowing cycles and warm sevenths with forward momentum.')],
'Electronic':[P('House','electronic','Minor',45,[[1,6,3,7],[1,4,6,7]],'Repeatable minor loops and smooth seventh-chord colors.'),P('Deep house','soul','Minor',80,[[1,4,7,3],[6,4,1,5]],'Warm, extended chords and soulful repeating cycles.'),P('Techno','modal','Phrygian',15,[[1,1,2,1],[1,4,1,2]],'Sparse modal tension built around a persistent center.'),P('Trance','electronic','Minor',35,[[1,6,3,7],[6,7,1,5]],'Emotional minor cycles and ascending harmonic lift.'),P('Drum & bass','electronic','Minor',65,[[1,6,4,7],[4,1,3,7]],'Moody extended harmony and compact looping forms.'),P('Downtempo','ambient','Dorian',70,[[1,4,1,7],[1,3,6,4]],'Soft modal colors and unhurried movement.')],
'Hip-hop':[P('Lo-fi','soul','Major',80,[[2,5,1,6],[4,3,2,5]],'Mellow jazz colors, close voicings, and small repeating cycles.'),P('Boom bap','soul','Minor',60,[[1,4,1,5],[1,6,4,5]],'Minor seventh textures with sample-like harmonic repetition.'),P('Trap','electronic','Minor',10,[[1,6,1,5],[1,2,1,7]],'Sparse minor harmony and dark, repetitive root movement.'),P('Jazz rap','jazz','Minor',80,[[2,5,1,6],[1,4,7,3]],'Jazz-derived progressions and rich chord extensions.')],
'Folk / Country':[P('Acoustic folk','folk','Major',10,[[1,4,1,5],[1,6,4,5]],'Open, direct harmony that leaves room for a melody.'),P('Indie folk','indie','Major',35,[[6,4,1,5],[1,3,4,1]],'Gentle added-note color and reflective movement.'),P('Country','folk','Major',5,[[1,4,5,1],[1,6,4,5]],'Strong tonic, subdominant, and dominant relationships.'),P('Bluegrass','folk','Major',5,[[1,4,1,5],[1,6,2,5]],'Traditional cadences and brisk circle-of-fifths movement.'),P('Americana','folk','Mixolydian',20,[[1,7,4,1],[1,4,6,5]],'Roots harmony with blues and modal inflections.')],
'Latin / Brazilian':[P('Bossa nova','bossa','Major',75,[[1,6,2,5],[2,5,1,4],[3,6,2,5]],'Major sevenths, minor ninths, and connected ii–V movement.'),P('Samba','bossa','Major',60,[[1,6,2,5],[1,4,3,6,2,5]],'Bright functional harmony and flowing dominant chains.'),P('Bolero','latin','Minor',55,[[1,4,5,1],[1,7,3,5]],'Expressive minor harmony with clear dominant resolutions.'),P('Salsa','latin','Minor',45,[[1,4,5,1],[2,5,1,1]],'Compact harmonic cycles and strong minor-key cadences.'),P('Flamenco-inspired','flamenco','Minor',15,[[1,7,6,5]],'Andalusian descending movement toward a major dominant.')],
'Classical':[P('Common practice','classical','Major',15,[[1,4,2,5,1],[1,6,4,5],[1,3,6,2,5,1]],'Functional harmonic phrases and clear cadential direction.'),P('Romantic','classical','Minor',55,[[1,6,4,2,5,1],[1,3,6,4,5]],'Expressive minor harmony, borrowed chords, and chromatic color.'),P('Impressionist','ambient','Lydian',85,[[1,2,3,2],[1,6,4,2]],'Extended color, modal movement, and softened cadences.'),P('Minimalist','modal','Major',30,[[1,1,4,4],[1,2,1,6]],'Repetition, small changes, and sustained tonal centers.')],
'Cinematic':[P('Emotional score','cinematic','Minor',40,[[1,6,3,7],[6,4,1,5]],'Broad minor-to-major movement and gentle harmonic lift.'),P('Epic score','cinematic','Minor',30,[[1,6,3,7],[1,4,6,5]],'Strong root movement and wide, dramatic voicings.'),P('Suspense','dark','Phrygian',70,[[1,2,1,6],[1,4,2,1]],'Flat-second friction and unresolved, darker colors.'),P('Wonder','ambient','Lydian',75,[[1,2,6,4],[1,3,4,2]],'Luminous major harmony and the floating raised fourth.')],
'Ambient':[P('Atmospheric','ambient','Lydian',70,[[1,2,1,6],[1,4,6,2]],'Open added notes, modal ambiguity, and gentle movement.'),P('Dark ambient','dark','Phrygian',65,[[1,2,6,1],[1,4,2,1]],'Darker sustained textures with sparse harmonic shifts.'),P('New age','ambient','Major',40,[[1,5,6,4],[1,2,4,1]],'Consonant added notes and calm, circular harmony.')],
'Reggae / Ska':[P('Roots reggae','reggae','Major',15,[[1,4,1,5],[1,6,4,5]],'Simple, grounded tonal cycles and clear major harmony.'),P('Dub','modal','Minor',35,[[1,4,1,1],[1,7,4,1]],'Spacious minor vamps and minimal harmonic movement.'),P('Ska','reggae','Major',15,[[1,4,5,1],[1,6,2,5]],'Bright major cycles and decisive turnarounds.')],
};
export const DEFAULT:Settings={genre:'R&B / Soul',style:'Neo-soul',key:2,mode:'Minor',count:8,color:80,movement:'Smooth',modulation:'None',ending:'Loop',tempo:82,instrument:'Electric piano',swing:0};
export const profile=(s:Settings)=>GENRES[s.genre]?.find(x=>x.name===s.style)||GENRES.Jazz[0];
export function noteName(n:number,key=0,mode='Major'){
 const tonic=NOTES[mod(key)],letters=['C','D','E','F','G','A','B'],natural=[0,2,4,5,7,9,11],start=letters.indexOf(tonic[0]),scale=SCALES[mode]||SCALES.Major;
 const degree=scale.indexOf(mod(n-key));
 if(degree>=0){const idx=(start+degree)%7;let delta=mod(n-natural[idx]);if(delta>6)delta-=12;if(Math.abs(delta)<=1)return letters[idx]+(delta>0?'#'.repeat(delta):'b'.repeat(-delta));}
 const relativeMajor=mod(key+({Minor:3,Dorian:10,Mixolydian:5,Lydian:7,Phrygian:8}[mode]||0));
 return ([2,4,6,7,9,11].includes(relativeMajor)?SHARPS:NOTES)[mod(n)]
}
export function chordName(c:Chord){if(c.empty)return "Empty";return c.spelling||noteName(c.root,c.key,c.mode)+(c.quality||'')+(c.bass!==undefined?'/'+noteName(c.bass,c.key,c.mode):'')}
export function parseChord(raw:string):Chord|null{
 const str=raw.trim().replace(/♯/g,'#').replace(/♭/g,'b').replace(/Δ/g,'maj').replace(/ø7?/g,'m7b5').replace(/°/g,'dim').replace(/−/g,'m');
 const m=str.match(/^([A-Ga-g])([#b]?)([^/]*)(?:\/([A-Ga-g])([#b]?))?$/);if(!m)return null;
 const pc=(l:string,a:string)=>mod(({C:0,D:2,E:4,F:5,G:7,A:9,B:11}[l.toUpperCase()]??0)+(a==='#'?1:a==='b'?-1:0));
 const aliases:Record<string,string>={M:'',maj:'',min:'m','-':'m',M7:'maj7',M9:'maj9',min7:'m7',min9:'m9','+':'aug',sus:'sus4','7alt':'7#9'};
 let q=m[3].replace(/\s/g,'');q=aliases[q]??q;if(!QUALITIES[q])return null;
 return {root:pc(m[1],m[2]),quality:q,...(m[4]?{bass:pc(m[4],m[5])}:{}),spelling:m[1].toUpperCase()+m[2]+q+(m[4]?'/'+m[4].toUpperCase()+m[5]:''),locked:true};
}
export function pitchClasses(c:Chord){if(c.empty)return [];return [...new Set([...(QUALITIES[c.quality]||QUALITIES['']).map(n=>mod(n+c.root)),...(c.bass!==undefined?[c.bass]:[])])]}
export function roman(c:Chord,key:number,mode:string){
 if(c.empty)return '—';
 const scale=SCALES[mode]||SCALES.Major,letters=['C','D','E','F','G','A','B'];
 const spelled=c.spelling||noteName(c.root,key,mode),tonic=NOTES[mod(key)][0];const idx=(letters.indexOf(spelled[0])-letters.indexOf(tonic)+7)%7;
 let delta=mod(c.root-key-scale[idx]);if(delta>6)delta-=12;const pre=delta<0?'♭'.repeat(Math.abs(delta)):delta>0?'♯'.repeat(delta):'';
 let r=['I','II','III','IV','V','VI','VII'][idx];if((c.quality.startsWith('m')&&!c.quality.startsWith('maj'))||c.quality.startsWith('dim'))r=r.toLowerCase();
 return pre+r+(c.quality.startsWith('dim')?'°'+c.quality.slice(3):c.quality==='m7b5'?'ø7':c.quality.replace(/^maj/,'Δ').replace(/^m/,''));
}
export function tension(c:Chord,key:number,mode:string){if(c.empty)return 0;const scale=(SCALES[mode]||SCALES.Major).map(n=>mod(n+key));const outside=pitchClasses(c).filter(n=>!scale.includes(n)).length;const root=mod(c.root-key);return Math.min(96,14+(root===0?0:root===7?42:root===2?30:20)+outside*11+(QUALITIES[c.quality].length-3)*6)}
function baseChord(deg:number,key:number,mode:string,color:number,family:string):Chord{
 const scale=SCALES[mode]||SCALES.Major,idx=deg-1,root=mod(key+scale[idx]);const interval=(step:number)=>mod(scale[(idx+step)%7]-scale[idx]);let q=interval(2)===3?(interval(4)===6?'dim':'m'):'';
 if(family==='power')q='5';
 else if(['blues','bluesjazz','funk'].includes(family)&&[1,4,5].includes(deg))q=color>60?'9':'7';
 else if(deg===5&&['Minor','Phrygian'].includes(mode)&&!['modal','ambient','dark','electronic'].includes(family))q=color>70?'7b9':color>25?'7':'';
 else if(color>30){q=q==='dim'?'m7b5':q==='m'?(color>65?'m9':'m7'):(interval(6)===10?(color>70?'9':'7'):(color>65?'maj9':'maj7'));}
 else if(color>18&&q==='')q='add9';
 if(family==='ambient'&&q==='m')q='madd9';
 return {root,quality:q,key,mode};
}
function distance(a:Chord,b:Chord){if(a.empty||b.empty)return 0;const x=pitchClasses(a),y=pitchClasses(b);return x.reduce((s,n)=>s+Math.min(...y.map(k=>Math.min(mod(n-k),mod(k-n)))),0)/x.length}
function connection(a:Chord,b:Chord,s:Settings){if(a.empty||b.empty)return 0;const delta=mod(b.root-a.root);let score=-distance(a,b)*(s.movement==='Smooth'?0.65:0.18);if(delta===5)score+=['jazz','bossa','classical','gospel'].includes(profile(s).family)?2.6:1.2;if(delta===0)score-=1.6;if([2,10].includes(delta))score+=s.movement==='Stepwise'?2.6:.3;if([3,4,8,9].includes(delta))score+=s.movement==='Adventurous'?1.6:.1;if(s.movement==='Fifths'&&[5,7].includes(delta))score+=2.5;return score;}
export type HarmonicContext={chords:Chord[];key:number;mode:string;strategy:string;previous?:Chord;sourceNames?:string};
export const MODULATION_DESTINATIONS=['None','Relative key','Parallel mode','Dominant key','Subdominant key','Up a semitone','Up a whole step','Down a whole step','Mediant up a minor third','Mediant up a major third','Mediant down a minor third','Custom key'];
export const MODULATION_APPROACHES=['Auto by genre','Direct shift','Common-chord pivot','Common-tone bridge','Secondary dominant','ii–V approach','Tritone approach','Diminished approach'];
export type HarmonicStage={key:number;mode:string;role:string;label?:string;targetKey?:number;targetMode?:string;fromKey?:number;fromMode?:string};
export function modulationTarget(s:Settings){
 let key=s.key,mode=s.mode;
 const offsets:Record<string,number>={'Dominant key':7,'Subdominant key':5,'Up a semitone':1,'Up a whole step':2,'Down a whole step':10,'Mediant up a minor third':3,'Mediant up a major third':4,'Mediant down a minor third':9};
 if(s.modulation==='Relative key'){key=mod(s.key+(s.mode==='Major'?9:({Minor:3,Dorian:10,Mixolydian:5,Lydian:7,Phrygian:8}[s.mode]??3)));mode=s.mode==='Major'?'Minor':'Major';}
 else if(s.modulation==='Parallel mode')mode=s.mode==='Major'?'Minor':'Major';
 else if(s.modulation==='Custom key')key=s.modulationTargetKey??s.key;
 else key=mod(s.key+(offsets[s.modulation]??0));
 if(s.modulationTargetMode&&s.modulationTargetMode!=='Auto')mode=s.modulationTargetMode;
 return {key,mode};
}
export function resolvedApproach(s:Settings){
 if(s.modulationApproach&&s.modulationApproach!=='Auto by genre')return s.modulationApproach;
 const family=profile(s).family;
 if(['jazz','bossa','bluesjazz','gospel'].includes(family))return 'ii–V approach';
 if(['soul','latin','minorblues'].includes(family))return 'Secondary dominant';
 if(['ambient','modal','dark'].includes(family))return 'Common-tone bridge';
 if(['classical','folk','indie'].includes(family))return 'Common-chord pivot';
 return 'Direct shift';
}
export function harmonicPlan(s:Settings,count:number):HarmonicStage[]{
 const stages:HarmonicStage[]=Array.from({length:count},()=>({key:s.key,mode:s.mode,role:'home'}));if(s.modulation==='None'||count<2)return stages;
 const dest=modulationTarget(s);if(dest.key===s.key&&dest.mode===s.mode)return stages;
 const at=Math.min(count-1,Math.max(1,s.modulationAt?s.modulationAt-1:Math.ceil(count/2)));
 const back=s.modulationReturn&&at<count-1?Math.min(count-1,Math.max(at+1,s.modulationReturnAt?s.modulationReturnAt-1:Math.ceil(count*.8))):count;
 for(let i=at;i<back;i++)stages[i]={...dest,role:'destination'};
 const approach=resolvedApproach(s);
 function transition(arrival:number,to:{key:number;mode:string},from:{key:number;mode:string},floor:number){
  const targetName=noteName(to.key,to.key,to.mode)+' '+to.mode.toLowerCase();stages[arrival]={...to,role:'arrival',label:`Arrive: ${targetName}`};
  const slot=(index:number,role:string,label:string)=>{if(index>=floor)stages[index]={...from,role,label,targetKey:to.key,targetMode:to.mode,fromKey:from.key,fromMode:from.mode}};
  if(approach==='ii–V approach'){slot(arrival-2,'predominant',`ii → ${targetName}`);slot(arrival-1,'dominant',`V → ${targetName}`)}
  else if(approach==='Secondary dominant')slot(arrival-1,'dominant',`V → ${targetName}`);
  else if(approach==='Tritone approach')slot(arrival-1,'tritone',`Sub V → ${targetName}`);
  else if(approach==='Diminished approach')slot(arrival-1,'diminished',`Leading-tone °7 → ${targetName}`);
  else if(approach==='Common-chord pivot')slot(arrival-1,'pivot',`Pivot → ${targetName}`);
  else if(approach==='Common-tone bridge')slot(arrival-1,'common-tone',`Shared tone → ${targetName}`);
 }
 transition(at,dest,{key:s.key,mode:s.mode},0);
 if(back<count)transition(back,{key:s.key,mode:s.mode},dest,at+1);
 return stages;
}
function transitionPool(stage:HarmonicStage,s:Settings,family:string):Chord[]|null{
 const color=s.color,key=stage.key,mode=stage.mode,tk=stage.targetKey??key,tm=stage.targetMode??mode;
 const annotate=(c:Chord)=>({...c,key,mode,transition:stage.label});
 if(stage.role==='arrival')return [annotate(baseChord(1,key,mode,color,family))];
 if(stage.role==='dominant')return [annotate({root:mod(tk+7),quality:color>70&&tm==='Minor'?'7b9':color>65?'9':'7'})];
 if(stage.role==='predominant')return [annotate({root:mod(tk+2),quality:tm==='Minor'?'m7b5':color>65?'m9':'m7'})];
 if(stage.role==='tritone')return [annotate({root:mod(tk+1),quality:color>65?'7#11':'7'})];
 if(stage.role==='diminished')return [annotate({root:mod(tk+11),quality:'dim7'})];
 if(stage.role==='pivot'||stage.role==='common-tone'){
  const from=(SCALES[mode]||SCALES.Major).map(n=>mod(n+key)),to=(SCALES[tm]||SCALES.Major).map(n=>mod(n+tk));
  const home=baseChord(1,key,mode,0,family),arrival=baseChord(1,tk,tm,0,family);
  const all=Array.from({length:7},(_,i)=>baseChord(i+1,key,mode,Math.min(color,30),family));
  const pivot=all.filter(c=>pitchClasses(c).every(n=>from.includes(n)&&to.includes(n)));
  if(stage.role==='pivot'&&pivot.length)return pivot.map(annotate);
  // When two scales have no common triad, retain a tone shared by both tonal centers.
  const shared=pitchClasses(home).filter(n=>pitchClasses(arrival).includes(n));
  const bridge=all.filter(c=>pitchClasses(c).some(n=>shared.includes(n)));
  if(bridge.length)return bridge.map(c=>({...annotate(c),transition:`Shared tone → ${noteName(tk,tk,tm)} ${tm.toLowerCase()}`}));
  // Remote targets without a common tonic tone are approached by their dominant.
  return [{...annotate({root:mod(tk+7),quality:'7'}),transition:`V → ${noteName(tk,tk,tm)} ${tm.toLowerCase()}`}];
 }
 return null;
}
export function contextFit(c:Chord,previous:Chord|undefined,index:number,count:number,context:HarmonicContext):number{
 const refs=context.chords.filter(c=>!c.empty);if(!refs.length||context.strategy==='Independent')return 0;
 const ownKey=c.key??context.key,ownMode=c.mode??context.mode;
 const relative=mod(c.root-ownKey),freq=refs.filter(r=>mod(r.root-(r.key??context.key))===relative).length/refs.length;
 const color=refs.filter(r=>r.quality===c.quality).length/refs.length;
 const position=Math.min(refs.length-1,Math.floor(index*refs.length/count)),sample=refs[position];
 const sampleRoot=mod(sample.root-(sample.key??context.key));
 let movement=0;
 if(previous&&refs.length>1){const step=mod(c.root-previous.root),steps=refs.slice(1).map((r,i)=>mod(r.root-refs[i].root));movement=steps.filter(n=>n===step).length/steps.length;if(position>0&&step===steps[position-1])movement+=.6;}
 const targetTension=tension(sample,sample.key??context.key,sample.mode??context.mode),level=tension(c,ownKey,ownMode);
 const arc=1-Math.min(1,Math.abs(level-targetTension)/65);
 let score=freq*2.1+color*1.8+movement*1.7+arc*.8;
 if(context.strategy==='Similar movement')score+=movement*4+(relative===sampleRoot?1.7:0);
 if(context.strategy==='Similar chord colors')score+=color*4+(c.quality===sample.quality?1.5:0);
 if(context.strategy==='Chorus lift'){score+=(!c.quality.startsWith('m')||c.quality.startsWith('maj'))?1.2:0;if([0,5].includes(relative))score+=1.6;if(index===count-1&&relative===0)score+=2.5;}
 if(context.strategy==='Related contrast')score=score*.45+(relative!==sampleRoot?1.8:-1.5)+(c.quality!==sample.quality ? .6 : -.5);
 if(context.strategy==='Related variation'&&relative===sampleRoot&&c.quality===sample.quality)score-=.8;
 return score;
}
export function generate(s:Settings,existing:Chord[],seed=Math.random(),only?:number,context?:HarmonicContext):Chord[]{
 let state=Math.floor(seed*2147483646)+1;const rand=()=>{state=state*16807%2147483647;return(state-1)/2147483646};
 if(context?.strategy==='Independent')context=undefined;
 const p=profile(s),pattern=p.patterns[Math.floor(rand()*p.patterns.length)];
 const count=Math.max(1,Math.min(16,Math.round(s.count)));const fixed=(i:number)=>existing[i]&&((!existing[i].empty&&existing[i].locked)||(only!==undefined&&i!==only));
 const plan=harmonicPlan(s,count);
 let beam:{chords:Chord[];score:number}[]=[{chords:[],score:0}];
 for(let i=0;i<count;i++){
  const stage=plan[i],{key,mode}=stage;
  const target=pattern[i%pattern.length];let pool:Chord[]=fixed(i)?[{...existing[i],...(only===undefined?{key,mode,transition:undefined}:{})}]:Array.from({length:7},(_,j)=>baseChord(j+1,key,mode,s.color,p.family));
  if(!fixed(i)&&s.color>55&&!['power','blues','minorblues','modal'].includes(p.family)){
   pool.push({root:mod(key+5),quality:'m6',key,mode},{root:mod(key+10),quality:'maj7',key,mode});
   if(['jazz','bossa','soul','gospel','fusion','classical','bluesjazz'].includes(p.family))for(const deg of [2,5,6])pool.push({root:mod(key+SCALES[mode][deg-1]+7),quality:s.color>80?'7b9':'7',key,mode});
  }
  const isBlues=['blues','bluesjazz','minorblues'].includes(p.family);if(isBlues&&!fixed(i))pool=[baseChord(target,key,mode,s.color,p.family)];
  if(context&&!fixed(i)&&!['power','blues','minorblues'].includes(p.family)){
   const related=context.chords.filter(c=>!c.empty).map(c=>({root:mod(key+c.root-(c.key??context.key)),quality:c.quality,key,mode}));
   pool.push(...related.filter((c,j)=>related.findIndex(x=>x.root===c.root&&x.quality===c.quality)===j));
  }
  const approachPool=transitionPool(stage,s,p.family);if(approachPool&&!fixed(i))pool=approachPool;
  pool=pool.filter((c,j)=>pool.findIndex(x=>x.root===c.root&&x.quality===c.quality&&x.bass===c.bass)===j);

  const options:typeof beam=[];
  for(const b of beam)for(const c of pool){let score=b.score;const targetRoot=mod(key+SCALES[mode][target-1]);score+=c.root===targetRoot?3.2:0;score+=rand()*2.6;
   const prev=b.chords.at(-1);if(prev)score+=connection(prev,c,s);
   if(i===0&&c.root===key)score+=.7;
   if(context){score+=contextFit(c,prev,i,count,context);if(i===0&&context.previous)score+=connection(context.previous,c,s)*1.4;}
   if(existing[i]&&!fixed(i)){const near=existing[(i+count-1)%count];if(near)score-=distance(near,c)*.12;}
   for(let f=i+1;f<count;f++){if(fixed(f)){score+=connection(c,existing[f],s)*.3/(f-i);break}}
   if(i===count-1){if(s.ending==='Resolve')score+=c.root===key?8:-3;else if(s.ending==='Open')score+=c.root===mod(key+7)?5:0;else if(b.chords[0])score+=connection(c,b.chords[0],s)*1.8;}
   if(b.chords.length>1&&b.chords.at(-1)?.root===c.root&&b.chords.at(-2)?.root===c.root&&!isBlues)score-=5;
   options.push({chords:[...b.chords,c],score});}
  beam=options.sort((a,b)=>b.score-a.score).slice(0,16);
 }
 return beam[0].chords;
}
export function voice(c:Chord,previous:number[]=[]):number[]{
 if(c.empty)return [];
 if(c.voicing?.length&&c.voicing.every(n=>Number.isInteger(n)&&n>=24&&n<=88&&pitchClasses(c).includes(n%12))&&pitchClasses(c).every(pc=>c.voicing!.some(n=>n%12===pc)))return [...c.voicing];
 const tones=QUALITIES[c.quality]||QUALITIES[''];const bass=36+(c.bass??c.root);let upper=tones.map(n=>48+c.root+n);while(upper[0]>59)upper=upper.map(n=>n-12);
 const variants=[upper];for(let i=1;i<tones.length;i++){const last=variants.at(-1)!;variants.push([...last.slice(1),last[0]+12].sort((a,b)=>a-b));}
 const chosen=variants.filter(v=>v.at(-1)!<=88).sort((a,b)=>{const cost=(v:number[])=>previous.length?v.reduce((sum,n)=>sum+Math.min(...previous.slice(1).map(p=>Math.abs(p-n))),0):Math.abs(v.reduce((x,y)=>x+y,0)/v.length-64);return cost(a)-cost(b)})[0]||upper;
 return [bass,...chosen];
}
export function makeMidi(chords:Chord[],tempo:number,sections:{start:number;tempo:number;label:string}[]=[]){
 const data:number[]=[];const vl=(v:number)=>{let b=[v&127];while(v>>=7)b.unshift((v&127)|128);return b};const event=(delta:number,...v:number[])=>data.push(...vl(delta),...v);const micros=Math.round(60000000/tempo);event(0,255,81,3,(micros>>16)&255,(micros>>8)&255,micros&255);event(0,192,4);let prev:number[]=[];
 for(const [index,c] of chords.entries()){const section=sections.find(s=>s.start===index);if(section){const t=Math.round(60000000/section.tempo);event(0,255,81,3,(t>>16)&255,(t>>8)&255,t&255);const label=Array.from(new TextEncoder().encode(section.label));event(0,255,6,...vl(label.length),...label);}if(c.empty){event(1920,255,1,0);continue}const notes=voice(c,prev);prev=notes;notes.forEach(n=>event(0,144,n,80));notes.forEach((n,i)=>event(i===0?1920:0,128,n,0))}event(0,255,47,0);const len=data.length;return new Uint8Array([77,84,104,100,0,0,0,6,0,0,0,1,1,224,77,84,114,107,(len>>>24)&255,(len>>>16)&255,(len>>>8)&255,len&255,...data]);
}

/** Spell chord tones by their role in the chord, including chromatic thirds and alterations. */
export function chordToneName(c:Chord,pitch:number){
 const rootName=c.spelling?.match(/^[A-G][#b]?/)?.[0]||noteName(c.root,c.key,c.mode);
 const letters=['C','D','E','F','G','A','B'],naturals=[0,2,4,5,7,9,11];
 const interval=QUALITIES[c.quality].find(n=>mod(c.root+n)===mod(pitch));
 if(interval===undefined)return c.spelling?.split('/')[1]||noteName(pitch,c.key,c.mode);
 let degree=({0:0,2:1,3:2,4:2,5:3,6:4,7:4,8:4,9:5,10:6,11:6,13:1,14:1,15:1,17:3,18:3,21:5} as Record<number,number>)[interval]??0;
 if(c.quality==='dim7'&&interval===9)degree=6;
 const letterIndex=(letters.indexOf(rootName[0])+degree)%7;let accidental=mod(pitch-naturals[letterIndex]);if(accidental>6)accidental-=12;
 return letters[letterIndex]+(accidental<0?'b'.repeat(-accidental):'#'.repeat(accidental));
}
