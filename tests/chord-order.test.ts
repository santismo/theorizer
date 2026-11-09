import assert from 'node:assert/strict';
import {moveChord,nearestChordSlot,nearestChordGridSlot} from '../lib/chord-order.ts';

const chords=[{root:0,quality:'maj7',locked:true,key:0,mode:'Major'},{root:2,quality:'m7'},{root:0,quality:'',empty:true},{root:7,quality:'7',bass:11}];
for(let from=0;from<chords.length;from++)for(let to=0;to<chords.length;to++){
 const snapshot=structuredClone(chords),next=moveChord(chords,from,to);
 assert.deepEqual(chords,snapshot,'Dragging never mutates the Undo snapshot');
 assert.equal(next.length,chords.length,'No bars are added or lost');
 assert.equal(next[to],chords[from],'Chosen chord lands in the requested position');
 assert.deepEqual(next.filter((_,i)=>i!==to),chords.filter((_,i)=>i!==from),'Other bars retain their relative order');
 assert.deepEqual(moveChord(next,to,from),chords,'Moving back restores the order and all chord metadata');
}
for(const [from,to] of [[-1,0],[0,-1],[0,4],[4,0],[NaN,0],[0,1.5],[1,1]])assert.equal(moveChord(chords,from,to),chords,'Invalid or unchanged drops are no-ops');
assert.equal(nearestChordSlot([],10),-1);
const centers=[30,96,162,228];
assert.equal(nearestChordSlot(centers,-100),0);assert.equal(nearestChordSlot(centers,600),3);
assert.equal(nearestChordSlot(centers,130),2);assert.equal(nearestChordSlot(centers,128),1);
assert.equal(nearestChordSlot(centers.map(x=>x-100),62),2,'Scrolled targets use viewport coordinates');
console.log('All reorder directions, empty bars, chord metadata, Undo-safe data, invalid drops, and scrolled target positions passed.');

const grid=Array.from({length:12},(_,i)=>({x:30+(i%4)*80,y:40+Math.floor(i/4)*90}));
assert.equal(nearestChordGridSlot([],0,0),-1);
for(let i=0;i<grid.length;i++)assert.equal(nearestChordGridSlot(grid,grid[i].x+8,grid[i].y-6),i,'Rows and columns resolve to the correct tile');
assert.equal(nearestChordGridSlot(grid,30,130),4,'Dragging vertically reaches the next row');
assert.equal(nearestChordGridSlot(grid,270,220),11,'Dragging diagonally reaches the last row');
assert.equal(nearestChordGridSlot(grid.map(p=>({...p,y:p.y-100})),110,120),9,'Page scrolling preserves the drop target');
console.log('Wrapped four-column grid targets and vertical scrolling passed.');
