const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').resolve(__dirname,'..','index.html'),'utf8');
const scripts=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(match=>match[1]);
for(const script of scripts)new vm.Script(script);
const context={};vm.createContext(context);
vm.runInContext(scripts.slice(0,3).join('\n')+'\nthis.answer=TimeAnswer;this.language=TimeLanguage;',context);
const {answer,language}=context;
let count=0;
for(let time=0;time<720;time++)for(const lang of ['en','ru'])for(const style of ['traditional','digital']){
  const model=language.describe(time,style,lang);
  assert(answer.isCorrect(model,time,lang),`Rejected model: ${model}`);
  assert(!answer.isCorrect(model,time+1,lang),`Accepted wrong minute: ${model}`);
  assert(!answer.isCorrect(model,time+60,lang),`Accepted wrong hour: ${model}`);
  assert(!answer.isCorrect(model,time,lang==='en'?'ru':'en'),`Accepted wrong language: ${model}`);
  count++;
}
const positives=[
  ['It’s quarter to ten.',585,'en'],["IT IS A QUARTER TO TEN!",585,'en'],
  ['nine forty-five',585,'en'],['nine forty five',585,'en'],['15 minutes to 10',585,'en'],
  ['The time is nine forty-five.',585,'en'],['It\'s 09:45.',585,'en'],
  ['five minutes past nine',545,'en'],['nine oh five',545,'en'],['nine zero five',545,'en'],
  ['half past six',390,'en'],['thirty minutes past six',390,'en'],['a quarter past twelve',15,'en'],
  ["twelve o'clock",0,'en'],['Twelve o clock!',0,'en'],['9:00',540,'en'],
  ['Без четверти десять.',585,'ru'],['СЕЙЧАС БЕЗ ПЯТНАДЦАТИ МИНУТ ДЕСЯТЬ!',585,'ru'],
  ['девять часов сорок пять минут',585,'ru'],['девять сорок пять',585,'ru'],
  ['На часах 09:45.',585,'ru'],['без пятнадцати час',45,'ru'],['без четверти час',45,'ru'],
  ['полдесятого',570,'ru'],['половина десятого',570,'ru'],['четверть десятого',555,'ru'],
  ['двадцать одна минута десятого',561,'ru'],['без двадцати одной минуты десять',579,'ru'],
  ['девять ноль пять',545,'ru'],['девять сорок один',581,'ru'],['девять часов сорок одна минута',581,'ru'],
  ['четыре часа ровно',240,'ru'],['ровно час',60,'ru'],['двенадцать часов',0,'ru']
];
for(const [text,time,lang] of positives)assert(answer.isCorrect(text,time,lang),`Rejected variant: ${text}`);
const negatives=[
  ['',585,'en'],['   ',585,'ru'],['It’s…',585,'en'],['...',585,'ru'],
  ['nine forty-four',585,'en'],['quarter past ten',585,'en'],["nine o'clock",585,'en'],
  ['twenty five past ten',585,'en'],['one minutes past nine',541,'en'],
  ['Без четверти девять.',585,'ru'],['без четверти час',585,'ru'],['половина девятого',570,'ru'],
  ['одна минуты десятого',541,'ru'],['девять часов одна минута',542,'ru'],
  ['9:44',585,'en'],['19:45',585,'en'],['0:45',45,'ru'],['9:75',585,'en'],
  ['quarter to ten',585,'ru'],['без четверти десять',585,'en'],
  ['nine forty-five and ten forty-five',585,'en'],['not quarter to ten',585,'en']
];
for(const [text,time,lang] of negatives)assert(!answer.isCorrect(text,time,lang),`Accepted incorrect answer: ${text}`);
console.log(`PASS: ${count} model answers across all 720 times, both languages/styles; wrong hour/minute/language rejected; ${positives.length} natural variants and ${negatives.length} edge cases.`);
