import {DEFAULT,GENRES,SCALES,QUALITIES,generate,type Chord,type Settings} from './harmony.ts';
import {sectionContext,type Song,type Section} from './song.ts';
export const RANDOM_MODES=['Surprise me','Single style','Style blend'];
export function complexityLabel(value:number){return value<=20?'Simple':value<=40?'Accessible':value<=60?'Colorful':value<=80?'Advanced':value<95?'Very complex':'Extreme'}
export function complexityDescription(value:number){return value<=20?'Familiar movement, compact forms, triads and basic sevenths.':value<=40?'A little harmonic color, gentle variation, and occasional key changes.':value<=60?'Extended chords, linked variations, and prepared modulations.':value<=80?'More chromatic movement, inversions, remote keys, and evolving sections.':value<95?'Dense extensions, altered dominants, irregular phrase lengths, and frequent key changes.':'Intentionally excessive: eight evolving sections, dense altered chords, slash basses, and remote tonal shifts. Pushes beyond normal genre conventions.'}
const clusters=[['Jazz','R&B / Soul','Funk','Hip-hop','Latin / Brazilian'],['Rock','Metal','Pop','Cinematic'],['Electronic','Ambient','Cinematic','Pop'],['Folk / Country','Pop','Classical','Reggae / Ska'],['Blues','Rock','Funk','R&B / Soul']];
const mod=(n:number)=>(n%12+12)%12;
/** Complexity is independent of style mixing. Its endpoints are deliberately far apart. */
export function randomSong(requested='Surprise me',seed=Math.random(),complexity?:number):Song{
 const supplied=complexity??(requested==='Simple'?15:requested==='Adventurous'?80:50),level=Math.round(Math.max(0,Math.min(100,Number.isFinite(supplied)?supplied:50))),c=level/100;
 let state=Math.floor(seed*2147483646)+1;const rand=()=>{state=state*16807%2147483647;return(state-1)/2147483646};
 const pick=<T,>(list:T[]):T=>list[Math.floor(rand()*list.length)],chance=(n:number)=>rand()<n;
 const mode=requested==='Surprise me'?pick(['Single style','Single style','Style blend']):requested==='Style blend'?'Style blend':'Single style';
 const genre=pick(Object.keys(GENRES)),profile=pick(GENRES[genre]),blending=mode==='Style blend',extreme=level>=95;
 const nearby=[...new Set(clusters.filter(group=>group.includes(genre)).flat())].filter(g=>g!==genre);
 const alternate=blending?pick(level>80?Object.keys(GENRES).filter(g=>g!==genre):nearby.length?nearby:Object.keys(GENRES).filter(g=>g!==genre)):genre;
 const homeKey=Math.floor(rand()*12),homeMode=profile.mode;
 const baseTempo=Math.round((['Ambient','Cinematic'].includes(genre)?55:['Electronic','Metal'].includes(genre)?105:70)+rand()*45);
 const instrument=pick(['Plucked guitar','Plucked guitar','Electric piano','Soft piano','Warm pad']);
 const forms=level<=25?[['Verse','Chorus','Verse 2','Final chorus']]:level<=60?[['Intro','Verse','Chorus','Bridge','Final chorus'],['Verse','Chorus','Bridge','Final chorus','Outro']]:level<85?[['Intro','Verse','Pre-chorus','Chorus','Bridge','Final chorus'],['Intro','Verse','Chorus','Interlude','Bridge','Final chorus','Outro']]:[['Prelude','Theme A','Theme B','Development','Interlude','Bridge','Reprise','Coda']];
 const form=pick(forms),song:Song={name:`${pick(['Midnight','Glass','Velvet','Distant','Silver','Quiet','Electric','Soft'])} ${pick(['current','weather','tides','orbit','signals','bloom','echoes','turns'])}`,sections:[],activeId:'A',generationNote:''};
 let chorus:Section|undefined,verse:Section|undefined,lastKey=homeKey;
 for(const [i,name] of form.entries()){
  const sectionGenre=blending&&(name.includes('horus')||name==='Bridge'||(level>80&&i%2===1))?alternate:genre;
  const style=sectionGenre===genre?profile:pick(GENRES[sectionGenre]);
  const color=Math.max(0,Math.min(100,Math.round(level*.9+style.color*.18+(rand()-.5)*10-5)));
  const isBlues=['12-bar blues','Jazz blues','Minor blues'].includes(style.name);
  const count=isBlues&&level<80?12:level<=20?4:level<=40?pick([4,4,8]):level<=60?pick([4,8,8]):level<85?pick([6,7,8,11,12]):i%2?pick([11,13,15]):pick([12,13,16]);
  const id=String.fromCharCode(65+i);
  const repeat=name==='Final chorus'?chorus:name==='Verse 2'?verse:undefined;
  if(repeat&&level<=55){song.sections.push({...structuredClone(repeat),id,name});continue}
  const key=i>0&&chance(extreme?1:Math.max(0,(level-55)/60))?mod(lastKey+pick([1,3,4,6,8,9,11])):homeKey;
  const modeChoice=level>60&&chance(c*.7)?pick(Object.keys(SCALES)):homeMode;lastKey=key;
  const settings:Settings={...DEFAULT,genre:sectionGenre,style:style.name,key,mode:modeChoice,count,color,tempo:baseTempo,instrument,movement:level<=35?pick(['Smooth','Fifths']):level<75?pick(['Smooth','Fifths','Stepwise','Adventurous']):'Adventurous',ending:i===form.length-1?'Resolve':name==='Pre-chorus'?'Open':level>80?pick(['Open','Open','Resolve']):pick(['Loop','Loop','Resolve']),modulation:'None',modulationAt:0,modulationReturn:false,modulationTargetMode:'Auto'};
  const modulationProbability=level<=20?0:level<=40?.15:level<=60?.4:level<85?.75:1;
  if(chance(modulationProbability)){
   settings.modulation=level<65?pick(['Relative key','Dominant key','Parallel mode']):'Custom key';
   settings.modulationTargetKey=mod(key+pick([1,3,4,6,8,9,11]));
   settings.modulationTargetMode=level>65?pick(Object.keys(SCALES)):'Auto';
   settings.modulationApproach=level<50?'Auto by genre':level<80?pick(['Auto by genre','Common-chord pivot','Common-tone bridge','ii–V approach','Secondary dominant']):pick(['ii–V approach','Tritone approach','Diminished approach']);
   settings.modulationAt=level>=85?Math.max(3,Math.ceil(count/3)):pick([0,Math.max(2,Math.ceil(count*.5)),Math.max(2,Math.ceil(count*.7))]);
   settings.modulationReturn=level>=85||count>=6&&chance(c*.7);settings.modulationReturnAt=level>=85?Math.ceil(count*.78):0;
  }
  const section:Section={id,name,settings,chords:[],referenceId:i?'earlier':'',relationship:i?(level>80?pick(['Related contrast','Related variation']):name.includes('horus')?'Chorus lift':pick(blending?['Similar movement','Similar chord colors','Related variation']:['Related variation','Similar movement','Related contrast'])):'Independent'};
  song.sections.push(section);song.activeId=id;section.chords=generate(settings,[],rand(),undefined,sectionContext(song));
  if(level>60){
   // Reharmonize unplanned interior chords as approaches to their actual next chord.
   // Explicit modulation arrivals/preparations remain intact.
   for(let j=section.chords.length-2;j>=1;j--){const chord=section.chords[j],next=section.chords[j+1];if(chord.transition||next.transition||!chance((level-60)/100))continue;
    const tritone=chance(.5);section.chords[j]={root:mod(next.root+(tritone?1:7)),quality:'7',key:chord.key,mode:chord.mode};
   }
   section.chords=section.chords.map((chord,j)=>{
    let quality=chord.quality;
    if(chance(extreme?1:(level-55)/45)){
     if(quality==='m7b5'||quality==='dim'||quality==='dim7')quality=quality==='dim'?'dim7':quality;
     else if(quality.startsWith('m')&&!quality.startsWith('maj'))quality=pick(level>85?['m11','m13','mMaj9']:['m9','m11']);
     else if(quality.startsWith('7')||['9','11','13'].includes(quality))quality=pick(level>85?['7b9#11','13b9','7#5#9','7#11']:['9','13','7b9','7#9']);
     else quality=pick(level>85?['maj13','maj9#11','maj7#11']:['maj9','maj7#11']);
    }
    const result:Chord={...chord,quality};
    // Keep the bass of explicit ii/V/arrival chords so their advertised function stays clear.
    if(!chord.transition&&chance(extreme?.6:Math.max(0,(level-60)/100))){const tones=QUALITIES[quality].filter(n=>n%12!==0);if(tones.length)result.bass=mod(chord.root+pick(tones));}
    return result;
   });
  }
  if(name==='Chorus')chorus=section;if(name==='Verse')verse=section;
 }
 song.activeId=song.sections.find(x=>x.name==='Verse'||x.name==='Theme A')?.id||'A';
 const styles=[...new Set(song.sections.map(x=>x.settings.style))];song.generationNote=`Complexity ${level}/100 · ${complexityLabel(level)} · ${styles.join(' × ')} · ${song.sections.length} sections. ${extreme?'Dense reharmonization and remote key changes deliberately push beyond genre conventions.':blending?'Shared movement and colors connect the styles.':complexityDescription(level)}`;
 return song;
}
