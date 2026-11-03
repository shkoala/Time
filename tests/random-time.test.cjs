const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const html=fs.readFileSync(path.resolve(__dirname,'..','index.html'),'utf8');
const script=html.match(/<script id="time-math">([\s\S]*?)<\/script>/)[1];
const context={};vm.createContext(context);
vm.runInContext(script+'\nthis.math=TimeMath;',context);
const {math}=context;
let checked=0;
function checkPool(current,mode){
  const minuteMarks=mode==='quarters'?[0,15,30,45]:Array.from({length:60},(_,i)=>i);
  const expected=[];
  for(let h=0;h<12;h++)for(const m of minuteMarks){const total=h*60+m;if(total!==math.normalize(current))expected.push(total);}
  const actual=new Set(),step=mode==='quarters'?15:1;
  for(let i=0;i<expected.length;i++){
    const value=math.randomTime(current,step,()=>(i+.5)/expected.length);
    assert(value>=0&&value<720,'Time must stay within the twelve-hour clock');
    assert.notEqual(value,math.normalize(current),'New time must differ from the current time');
    assert(minuteMarks.includes(value%60),'Minute must belong to the selected range');
    actual.add(value);checked++;
  }
  assert.deepEqual([...actual].sort((a,b)=>a-b),expected,'Every allowed time must be available');
  for(const random of [0,1-Number.EPSILON])assert(expected.includes(math.randomTime(current,step,()=>random)));
}
for(let current=0;current<720;current++)checkPool(current,'quarters');
for(const current of [0,1,14,15,16,59,60,61,585,719,-1,735])checkPool(current,'any');
console.log(`PASS: ${checked} random selections; all hours with minutes 00/15/30/45, off-grid starts, all 720 possible clock times, and no immediate repeats.`);
