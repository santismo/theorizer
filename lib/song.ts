import {DEFAULT,GENRES,QUALITIES,type Chord,type Settings,type HarmonicContext} from './harmony.ts';
export const RELATIONSHIPS=['Related variation','Similar movement','Similar chord colors','Chorus lift','Related contrast','Independent'];
export type Section={id:string;name:string;settings:Settings;chords:Chord[];referenceId:string;relationship:string};
export type Song={name:string;sections:Section[];activeId:string;generationNote?:string};
export function newSong():Song{return {name:'Untitled',activeId:'A',sections:[{id:'A',name:'Progression A',chords:[],settings:{...DEFAULT,count:1,instrument:'Plucked guitar'},referenceId:'',relationship:'Related variation'}]}}
export function addSongSection(song:Song):Song{
 if(song.sections.length>=8)return song;const current=song.sections.find(x=>x.id===song.activeId)||song.sections[0];
 const id='ABCDEFGH'.split('').find(id=>!song.sections.some(x=>x.id===id))!;
 const section:Section={id,name:`Progression ${id}`,settings:{...current.settings,count:Math.max(1,current.chords.length||current.settings.count),modulation:'None'},chords:[],referenceId:'earlier',relationship:'Related variation'};
 return {...song,activeId:id,sections:[...song.sections,section]};
}
export function sectionContext(song:Song):HarmonicContext|undefined{
 const index=song.sections.findIndex(x=>x.id===song.activeId),section=song.sections[index];if(!section||section.relationship==='Independent'||!section.referenceId)return;
 const sources=(section.referenceId==='earlier'?song.sections.slice(0,index):song.sections.filter(x=>x.id===section.referenceId&&x.id!==section.id)).filter(x=>x.chords.some(c=>!c.empty));
 if(!sources.length)return;
 return {chords:sources.flatMap(x=>x.chords.filter(c=>!c.empty).map(c=>({...c,key:c.key??x.settings.key,mode:c.mode??x.settings.mode}))),key:sources[0].settings.key,mode:sources[0].settings.mode,strategy:section.relationship,previous:song.sections.slice(0,index).filter(x=>x.chords.some(c=>!c.empty)).at(-1)?.chords.filter(c=>!c.empty).at(-1),sourceNames:sources.map(x=>x.name).join(' + ')};
}
export function normalizeSong(value:unknown):Song|null{
 const song=value as Song;if(!song||!Array.isArray(song.sections)||!song.sections.length||song.sections.length>8)return null;
 if(new Set(song.sections.map(x=>x.id)).size!==song.sections.length)return null;
 if(song.sections.some(x=>!x||typeof x.id!=='string'||!GENRES[x.settings?.genre]||!Array.isArray(x.chords)||x.chords.length>16||x.chords.some(c=>!Number.isInteger(c.root)||c.root<0||c.root>11||!QUALITIES[c.quality])))return null;
 return {generationNote:typeof song.generationNote==='string'?song.generationNote:undefined,name:typeof song.name==='string'?song.name:'Untitled',activeId:song.sections.some(x=>x.id===song.activeId)?song.activeId:song.sections[0].id,sections:song.sections.map(x=>({...x,name:x.name||`Progression ${x.id}`,settings:{...DEFAULT,...x.settings},referenceId:x.referenceId||'',relationship:RELATIONSHIPS.includes(x.relationship)?x.relationship:'Related variation'}))};
}
export function restoreSaved(item:{name:string;settings:Settings;chords:Chord[];song?:Song}):Song{
 return normalizeSong(item.song)||normalizeSong({name:item.name,activeId:'A',sections:[{id:'A',name:'Progression A',settings:item.settings,chords:item.chords,referenceId:'',relationship:'Related variation'}]})||newSong();
}
