import Papa from 'papaparse';
import {World,setLocData,rideSpeed} from './world.js';
import {sfx,unlock,setMood,setOpt} from './audio.js';
import {thumb,startViewer,stopViewer,MUT,RN,RC} from './fish3d.js';
import './style.css';
const $=s=>document.querySelector(s),KEY='tidal_tales_v1';
const RW={Common:55,Uncommon:25,Rare:13,Epic:5,Legendary:1.7,Mythic:.3};
const LOCS=[{n:'Willow Lake',lv:1,sky:'#a9d6e5',wat:'#2f7f9e',bank:'#5b7f4a'},{n:'Misty River',lv:3,sky:'#c3cfd4',wat:'#4a7a86',bank:'#6f7d52'},{n:'Mangrove Marsh',lv:6,sky:'#b9c79a',wat:'#5a6b3c',bank:'#3e4f2c'},{n:'Coral Bay',lv:10,sky:'#8fd3dc',wat:'#1f93a8',bank:'#d8c48a'},{n:'Abyssal Trench',lv:15,sky:'#2b3a5c',wat:'#101c3a',bank:'#262e44'}];
const TODS=['siang','senja','malam'];
let FISH=[],GEAR={},S,tod='siang';
const fresh=()=>({coins:50,gem:0,auto:{until:0,perm:false,on:false,act:'jual'},luck:{until:0},unl:false,xp:0,lv:1,rod:'rod_wood',reel:'reel_basic',line:'line_2kg',hook:'hook_small',own:['rod_wood','reel_basic','line_2kg','hook_small'],baits:{bait_worm:20},bait:'bait_worm',loc:0,inv:[],dex:{},stats:{caught:0,broke:0},opt:{shake:true,sound:true,fx:true,music:true,wx:'acak'}});
const load=()=>{try{const d=JSON.parse(localStorage.getItem(KEY));return d?{...fresh(),...d}:fresh()}catch{return fresh()}};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch{}};
const spend=c=>S.unl||(S.coins>=c&&(S.coins-=c,true));
const it=(k,id)=>GEAR[k].find(x=>x.id===id),R=()=>it('rods',S.rod),RL=()=>it('reels',S.reel),LN=()=>it('lines',S.line),HK=()=>it('hooks',S.hook);
const cl=(v,a,b)=>Math.max(a,Math.min(b,v)),rnd=(a,b)=>a+Math.random()*(b-a),hash=s=>[...s].reduce((a,c)=>a*31+c.charCodeAt(0)>>>0,7);
const h=(t,c='',x='')=>{const e=document.createElement(t);e.className=c;e.innerHTML=x;return e};
const btn=(t,fn,c='')=>{const b=h('button',c,t);b.onclick=fn;return b};
let ac;const beep=(f,d=.08,ty='square')=>{if(!S.opt.sound)return;try{ac=ac||new AudioContext();const o=ac.createOscillator(),g=ac.createGain();o.type=ty;o.frequency.value=f;g.gain.value=.04;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+d)}catch{}};

function parseFish(txt){return Papa.parse(txt.replace(/^\uFEFF/,''),{header:true,dynamicTyping:true,skipEmptyLines:true}).data.map(f=>({...f,w:f.reference_weight_kg,v:f.base_value,hab:String(f.habitat).split(';').map(s=>{s=s.trim();const m=s.match(/^(.+?)\s*\((.+)\)$/);return{n:m?m[1]:s,c:m?m[2]:null}})}))}

/* ===== game state ===== */
const G={st:'idle',pw:0,pd:1,t:0,cd:6,bt:0,bw:1,f:null,ten:0,sta:100,dist:100,over:0,surge:0,sn:2,pump:0,reel:false,time:0,bait:null,pull:20,ct:0,cdur:1,slow:0,after:null,jumper:false,fx:0,msgT:0,wx:'clear',wxT:12,prog:0,en:0,eMax:0,eSum:0,eN:0,swT:0,swMax:1,swDir:null,swM:[],grace:2.5,tapP:0,spinV:0,aq:false,back:null,lastTap:0,fr:false,omenT:0,wxBack:'clear',ft:0};
const cv=$('#cv'),M=$('#modal'),busy=()=>!M.hidden,world=new World(cv);
const say=(t,s=2)=>{const m=$('#msg');m.textContent=t;m.hidden=!t;G.msgT=s};
const reset=()=>{G.st='idle';G.f=null;G.reel=false;G.ten=0;G.sta=100;G.dist=100;G.surge=0;G.ct=0;G.swT=0;G.swDir=null;G.prog=0;G.en=0;if(G.omenT>60)G.omenT=6};

const addXp=n=>{S.xp+=n;let up=false;while(S.xp>=S.lv*120){S.xp-=S.lv*120;S.lv++;up=true}if(up){sfx('level');say('LEVEL NAIK: '+S.lv,2.2)}};
const KEYS={},JOY={x:0,y:0,on:false},RS={coins:0,pearls:0,gems:0,combo:0,ct:0,dist:0,boost:false};
const MW={albino:40,emas:30,neon:20,bayangan:8,kosmik:2};
function rollMut(){const p=Math.min(.6,.05*({rain:1.3,storm:2,meteor:6}[G.wx]||1)*(G.bait==='bait_moon'?1.5:1)*(luckOn()?1.5:1));if(Math.random()>p)return null;const w={...MW};if(G.wx==='meteor')w.kosmik*=15;let r=Math.random()*Object.values(w).reduce((a,b)=>a+b,0);for(const k in w){r-=w[k];if(r<=0)return{k,...MUT[k]}}return{k:'albino',...MUT.albino}}
function pick(){
 const L=LOCS[S.loc].n,pool=FISH.filter(f=>f.hab.some(x=>x.n===L&&(!x.c||(x.c==='event'?S.bait==='bait_moon'&&Math.random()<.25:x.c===tod))));
 const list=pool.length?pool:FISH.filter(f=>f.hab.some(x=>x.n===L)),b=G.bait?it('baits',G.bait):null,far=(1+G.pw/200)*({rain:1.1,storm:1.3,meteor:1.5}[G.wx]||1)*(luckOn()?2.5:1),ws={};
 list.forEach(f=>{if(ws[f.rarity]===undefined){let w=RW[f.rarity];if(b&&b.attracts.includes(f.rarity)&&b.habitat.includes(L))w*=2.5;if(RN.indexOf(f.rarity)>=2)w*=far;if(f.rarity==='Legendary'&&S.lv<5&&!S.unl)w=0;if(f.rarity==='Mythic'&&S.lv<8&&!S.unl)w=0;ws[f.rarity]=w}});
 let tot=Object.values(ws).reduce((a,b)=>a+b,0),r=Math.random()*tot,rar=Object.keys(ws)[0];
 for(const k in ws){r-=ws[k];if(r<=0){rar=k;break}}
 const cand=list.filter(f=>f.rarity===rar),f=cand[Math.floor(Math.random()*cand.length)],sc=rnd(.75,1.35);
 const mut=rollMut(),wt=+(f.w*sc**3*(mut?1.25:1)).toFixed(2);return{...f,sc,mut,weight:wt,len:Math.round(25*Math.cbrt(wt)*1.4)}}

function startCharge(){if(G.st!=='idle'||busy()||G.aq)return;G.st='charge';G.pw=0;G.pd=1}
function doCast(){if(G.st!=='charge')return;
 G.bait=null;if(S.bait&&(S.unl||S.baits[S.bait]>0)){if(!S.unl)S.baits[S.bait]--;G.bait=S.bait}else say('Tanpa umpan: peluang ikan langka turun.');
 tod=TODS[Math.floor(Math.random()*3)];G.cd=4+G.pw*(.08+R().cast_power*.0012);G.st='cast';G.t=0;sfx('cast');save()}
function strike(){
 if(G.st==='wait'){say('Terlalu cepat!');sfx('miss');reset();return}
 if(G.st!=='bite')return;
 const ctl=R().control,ideal=G.t/G.bw>.08&&G.t/G.bw<.75,diff=RN.indexOf(G.f.rarity)*6+Math.min(10,G.f.weight/4),ch=cl(40+ctl*.25+HK().hook_bonus-diff+(ideal?15:-25),5,95);
 if(Math.random()*100<ch){G.st='fight';G.prog=20;G.en=0;G.eMax=0;G.eSum=0;G.eN=0;G.swT=0;G.swDir=null;G.swM=[rnd(32,40),rnd(62,70)];G.grace=2.5;G.surge=0;G.sn=rnd(1.5,3);G.fr=false;G.lastTap=0;G.ft=0;
  const r=G.f.weight/(LN().strength_kg*1.2),agg=/cepat|lincah|meledak|sangat|agresif|lompatan|ekstrem|kuat|boss|event/i.test(G.f.behavior)?1.3:1;
  G.pull=cl((12+30*Math.min(r,2))*agg,10,85);G.jumper=/lompat|meledak|lincah|cepat/i.test(G.f.behavior);G.dist=80;G.sta=80;
  world.ring(G.cd,'#ffffff',1.2);world.splash(G.cd,10);sfx('hook');say('TERKAIT! TAP TAP TAP!',1.4);hookOmen()}
 else{say('Strike meleset. Ikan lepas.');sfx('miss');reset()}}
function tap(auto){
 if(G.st!=='fight'||busy()||G.swT>0)return;
 const now=performance.now(),dtp=(now-G.lastTap)/1000;G.lastTap=now;
 if(!auto){G.en=Math.min(100,G.en+(dtp<.22?9:dtp<.35?5:2.5));G.eMax=Math.max(G.eMax,G.en);G.eSum+=G.en;G.eN++}
 const mult=auto?1:(G.en>=66?2.2:G.en>=33?1.5:1),ratio=G.f.weight/(LN().strength_kg*1.2),sp=R().reel_speed+RL().reel_speed_bonus;
 G.prog=Math.min(100,G.prog+Math.max(1.4,(3.6+R().control*.03+sp*.04)*mult/(1+Math.min(ratio,2)*.35)));
 G.tapP=1;G.spinV=24+G.en*.3;if(G.prog>=100){finish();return}
 if(!auto){if(G.en>=66&&!G.fr){G.fr=true;say('ENERGI PENUH! FRENZY',.9);world.ring(G.cd,'#e9a23b',3)}if(G.en<50)G.fr=false}}
function swipe(dir){
 if(G.st!=='fight'||G.swT<=0)return;
 if(dir===G.swDir){G.prog=Math.min(100,G.prog+10);G.en=Math.min(100,G.en+25);G.eMax=Math.max(G.eMax,G.en);G.swT=0;G.swDir=null;G.tapP=1;sfx('ok');say('MANTAP!',.6);world.burstAt(world.bp,'#e9a23b',16,4,1);if(G.prog>=100)finish()}
 else{G.swT=Math.max(.01,G.swT-.4);sfx('fail')}}
function fight(dt){
 if(G.prog>=100){finish();return}
 const sur=G.surge>0;G.ft+=dt;
 G.en=Math.max(0,G.en-(G.swT>0?0:(8+G.en*.12))*dt);
 G.sn-=dt;if(sur)G.surge-=dt;else if(G.sn<=0&&G.swT<=0){G.surge=.7;G.sn=rnd(2.5,4.5)}
 if(G.swT>0){G.swT-=dt;if(G.swT<=0){G.prog=Math.max(0,G.prog-10);G.en=0;G.swDir=null;sfx('fail');say('Gagal geser! Ikan menarik balik.',1.2)}}
 else{const dec=(3+G.pull*.09)*(sur?1.5:1)*Math.max(.2,1-G.ft/40);G.prog=cl(G.prog-dec*dt,0,100);
  if(G.prog<=0){G.grace-=dt;if(G.grace<=0){say('Ikan kabur.');sfx('escape');reset();return}}else G.grace=2.5}
 if(G.swT<=0&&G.swM.length&&G.prog>=G.swM[0]){G.swM.shift();G.swDir=['L','R','U','D'][Math.floor(Math.random()*4)];G.swT=1.8+rnd(0,.4);G.swMax=G.swT;sfx('prompt')}
 G.ten=cl(25+G.pull*.5+(sur?25:0)+G.tapP*18-G.prog*.15,0,100);G.dist=100-G.prog;G.sta=100-G.prog;
 if(G.prog>=100)finish()}
function pump(){if(G.st!=='fight'||G.pump>0||G.sta>55)return;G.ten=Math.min(100,G.ten+18);G.dist-=7;G.sta-=6;G.pump=1;beep(500,.06)}

const WXN={clear:'cerah',rain:'hujan',storm:'badai',meteor:'hujan meteor',omen:'mencekam'},WXM={rain:'HUJAN TURUN. Ikan lebih aktif.',storm:'BADAI PETIR! Ikan langka lebih sering.',meteor:'HUJAN METEOR! Peluang MUTASI melonjak.',clear:'Cuaca cerah kembali.',omen:'SUASANA MENCEKAM...'};
function setWx(w,say_=true){if(G.wx===w)return;G.wx=w;world.setWeather(w);setMood(w);if(say_&&G.st==='idle')say(WXM[w],3)}
function weather(dt){if(G.omenT>0){G.omenT-=dt;if(G.omenT<=0){const m=S.opt.wx||'acak';setWx(m!=='acak'?m:(G.wxBack||'clear'),false)}return}
 const m=S.opt.wx||'acak';if(m!=='acak'){setWx(m,false);return}G.wxT-=dt;if(G.wxT<=0){G.wxT=rnd(50,90);const r=Math.random()*100;setWx(r<42?'clear':r<66?'rain':r<84?'storm':'meteor')}}
const shade=(hex,k)=>{const n=parseInt(hex.slice(1),16),f=c=>Math.max(0,Math.min(255,Math.round(k>0?c+(255-c)*k:c*(1+k))));return'#'+[16,8,0].map(x=>f((n>>x)&255).toString(16).padStart(2,'0')).join('')};
const lego=(b,c)=>{if(c){const n=parseInt(c.slice(1),16),lum=(.3*(n>>16&255)+.59*(n>>8&255)+.11*(n&255));b.style.setProperty('--c',c);b.style.setProperty('--d',shade(c,-.38));b.style.setProperty('--l',shade(c,.45));b.style.setProperty('--t',lum>150?'#101a2b':'#ffffff')}return b};
const fmtT=ms=>{const t=Math.floor(Math.max(0,ms)/1000);return[Math.floor(t/3600),Math.floor(t%3600/60),t%60].map(x=>String(x).padStart(2,'0')).join(':')};
const luckOn=()=>!!(S.unl?S.luck&&S.luck.until>Date.now():S.luck&&S.luck.until>Date.now()),LUCKS=[{n:'Ramuan Hoki',m:10,c:400},{n:'Jimat Keberuntungan',m:30,c:1000},{n:'Semanggi Emas',m:60,c:1800}];
const autoActive=()=>!!(S.auto&&(S.auto.perm||Date.now()<S.auto.until));
const autoTxt=()=>S.auto&&S.auto.on?(S.auto.perm?' | AUTO PERMANEN':' | AUTO '+fmtT(S.auto.until-Date.now())):'';
let autoT=1,autoTapT=0,autoBite=0,autoSw=0;
function autoTick(dt){
 if(!S.auto||!S.auto.on)return;if(!autoActive()){S.auto.on=false;say('Auto Mancing berakhir.',2);save();return}
 if(G.aq||busy())return;const s=G.st;
 if(s==='idle'){autoT-=dt;if(autoT<=0){autoT=1.2;G.st='charge';G.pw=55+Math.random()*40;doCast();autoBite=0}}
 else if(s==='bite'){autoBite+=dt;if(autoBite>.5){autoBite=0;strike()}}
 else if(s==='fight'){autoTapT-=dt;if(autoTapT<=0){autoTapT=.28;tap(true)}if(G.swT>0){autoSw+=dt;if(autoSw>.9){autoSw=0;swipe(Math.random()<.75?G.swDir:'L')}}else autoSw=0}}
function hookOmen(){const f=G.f;if(!(f.mut||RN.indexOf(f.rarity)>=3))return;const c=f.mut?f.mut.c:RC[f.rarity];if(G.wx!=='omen')G.wxBack=G.wx;G.omenT=9999;G.wx='omen';world.setOmen(c,!!(f.mut&&f.mut.k==='kosmik'));setMood('omen');say('PERTANDA BURUK... IKAN LANGKA!',2.2);sfx('thunder')}
function update(dt){
 G.time+=dt;weather(dt);autoTick(dt);
 if(G.msgT>0&&(G.msgT-=dt)<=0)$('#msg').hidden=true;
 G.tapP=Math.max(0,(G.tapP||0)-dt*5);G.spinV=(G.spinV||0)*Math.max(0,1-dt*4);
 const s=G.st;
 if(s==='charge'){G.pw+=G.pd*110*dt;if(G.pw>=100||G.pw<=0){G.pd*=-1;G.pw=cl(G.pw,0,100)}}
 else if(s==='cast'){G.t+=dt;if(G.t>=.7){G.st='wait';G.t=0;G.bt=rnd(2,6)*(G.bait?.7:1)*({rain:.85,storm:.7,meteor:.8}[G.wx]||1);world.splash(G.cd,16);world.ring(G.cd,'#dfeaf2',2.2);sfx('splash')}}
 else if(s==='wait'){G.t+=dt;if(Math.floor(G.t*.9)!==Math.floor((G.t-dt)*.9))world.ring(G.cd,'#dfeaf2',.9);
  if(G.t>=G.bt){G.st='bite';G.t=0;G.bw=1.1+R().control*.012;G.f=pick();for(let i=0;i<3;i++)setTimeout(()=>world.ring(G.cd,'#ffffff',1.6),i*180);sfx('bite');say('IKAN MENGGIGIT! TEKAN STRIKE',G.bw)}}
 else if(s==='bite'){G.t+=dt;if(G.t>G.bw){say('Terlambat. Ikan pergi.');sfx('miss');reset()}}
 else if(s==='fight')fight(dt);
 else if(s==='catch'){G.ct+=dt;if(G.ct>=G.cdur){G.st='result';G.after()}}
 hud()}

function finish(){
 const f=G.f,mu=f.mut,val=Math.max(1,Math.round(f.v*Math.pow(f.weight/f.w,.7)*(mu?mu.m:1))),isNew=!S.dex[f.id],d=S.dex[f.id]||(S.dex[f.id]={n:0,best:0}),rec=f.weight>d.best,ix=RN.indexOf(f.rarity),auto=!!(S.auto&&S.auto.on&&autoActive());
 const bonus=Math.round(G.eMax*.3+(G.eN?G.eSum/G.eN*.2:0)),eM=Math.round(G.eMax);
 d.n++;if(rec)d.best=f.weight;d.muts=d.muts||[];if(mu&&!d.muts.includes(mu.n))d.muts.push(mu.n);S.stats.caught++;S.xp+=Math.round(5+f.v/10)+(isNew?30:0)+(mu?40:0)+bonus;
 let up=false;while(S.xp>=S.lv*120){S.xp-=S.lv*120;S.lv++;up=true}
 G.st='catch';G.ct=0;G.reel=false;G.cdur=auto?Math.max([3.2,3.5,4,4.6,5.2,6][ix],mu?6:0):Math.max([1.2,1.4,1.7,2,2.3,2.7][ix],mu?2.8:0);G.fx=ix;G.slow=auto?((ix>=2||mu)?.9:.5):((ix>=3||mu)?.25:0);
 world.catchFx(f,ix);if((ix>=4||mu)&&S.opt.shake)world.shake=.5;if(ix>=5||mu)$('#cut').classList.add('on');
 if(mu||ix>=3)G.omenT=20;
 const bn=[];{if(ix>=3)bn.push(`<div class="bn" style="background:${RC[f.rarity]}">${f.rarity.toUpperCase()}</div>`);if(mu){bn.push(`<div class="bn m" style="background:${mu.c}">MUTASI ${mu.n.toUpperCase()}</div>`);bn.push(`<div class="bn m" style="background:#3a1020;animation-delay:.7s">SUASANA MENCEKAM...</div>`)}}
 const B=$('#banner');B.innerHTML=bn.join('');B.hidden=!bn.length;
 {sfx('catch',ix);if(mu)setTimeout(()=>sfx('mut'),250);if(up)setTimeout(()=>sfx('level'),900)}save();
 const co={id:f.id,w:f.weight,len:f.len,val,r:f.rarity,mut:mu?mu.n:'',mk:mu?mu.k:''},done=()=>{stopViewer();closeM();reset();$('#cut').classList.remove('on');B.hidden=true};
 G.after=()=>{const b=h('div');b.append(startViewer(f),h('div','big',f.name),h('div','',`<span class="tag" style="background:${RC[f.rarity]}">${f.rarity.toUpperCase()}</span> ${mu?`<span class="tag" style="background:${mu.c}">MUTASI ${mu.n.toUpperCase()} x${mu.m}</span> `:''}${isNew?'<b>SPESIES BARU</b> ':''}${rec&&!isNew?'<b>REKOR BERAT</b>':''}`),
  h('div','row',`<span>Panjang ${f.len} cm</span><span>Berat ${f.weight} kg</span><span>Nilai ${val} koin</span>`),h('div','',`Bonus energi tap: +${bonus} XP (puncak ${eM}%)`),up?h('div','',`<b>LEVEL NAIK: ${S.lv}</b>`):h('span'));
  const bs=h('div','btns');bs.append(btn('JUAL',()=>{S.coins+=val;save();done()}),btn('SIMPAN',()=>{S.inv.push(co);save();done()}),btn('LEPAS',()=>{S.xp+=2;save();done()}),btn('PAMER',()=>{closeM();G.st='flex';G.back=()=>{G.st='result';G.after()}}));b.append(bs);modal('Tangkapan',b,true)};
 if(auto)G.after=()=>{if(S.inv.length<60)S.inv.push(co);else S.coins+=val;save();autoT=3;done()}}

/* ===== UI ===== */
function modal(t,b,lite){M.innerHTML='';M.className=lite?'lite':'sheet';const p=h('div','panel');p.append(h('h2','',t),b);M.append(p);M.hidden=false;$('#hud').hidden=true;$('#dock').hidden=true}
const closeM=()=>{stopViewer();M.hidden=true;M.innerHTML='';if(world.mode==='room')world.setMode('game')};
const tabsBar=(names,cur,fn)=>{const t=h('div','tabs');names.forEach(n=>t.append(btn(n[1],()=>fn(n[0]),n[0]===cur?'on':'')));return t};
function home(){if(world.mode==='room')world.setMode('game');const b=h('div'),s=h('div','btns');b.append(h('p','',`Level ${S.lv} | ${S.unl?'UNLIMITED':S.coins} koin | ${S.unl?'UNL':S.gem} kristal | ${S.inv.length} ikan di tas`));
 MENUS.filter(m=>m.parent==='home').sort((a,c)=>a.order-c.order).forEach(m=>{const k=lego(btn(m.label,()=>runMenu(m)),m.color);k.title=m.desc||'';s.append(k)});b.append(s);modal('Tidal Tales: Fishing Adventure',b)}
function locs(){world.setRoom('locs',{locs:LOCS,sel:S.loc,lv:S.lv,unl:S.unl});const b=h('div');LOCS.forEach((l,i)=>{const r=h('div','row',`<span><b>${l.n}</b><small>Buka di level ${l.lv}</small></span>`);r.append(btn(S.loc===i?'DIPILIH':(S.unl||S.lv>=l.lv)?'PILIH':'TERKUNCI',()=>{S.loc=i;save();closeM()},S.loc===i?'on':''));r.lastChild.disabled=!S.unl&&S.lv<l.lv;b.append(r)});b.append(btn('KEMBALI',home));modal('Pilih Lokasi',b)}
function dex(){const f0=FISH.find(f=>S.dex[f.id]);world.setRoom('dex',{fish:f0||FISH[0],dark:!f0});const b=h('div'),g=h('div','grid'),n=Object.keys(S.dex).length;b.append(h('p','',`Ditemukan ${n} / ${FISH.length}`));
 FISH.forEach(f=>{const d=S.dex[f.id],cd=h('div','card'),m=h('img');m.src=thumb(f,!d);cd.append(m);cd.onclick=()=>world.roomDex(f,!d);cd.style.cursor='pointer';
  cd.append(h('div','',d?`<b>${f.name}</b><br><span class="tag" style="background:${RC[f.rarity]}">${f.rarity}</span><br>${f.hab.map(x=>x.n).join(', ')}<br>Rekor ${d.best} kg | x${d.n}${d.muts&&d.muts.length?'<br>Mutasi '+d.muts.join(', '):''}`:'<b>???</b>'));g.append(cd)});
 b.append(g,btn('INDEKS MUTASI',dexMut),btn('KEMBALI',home));modal('Koleksi',b)}
function dexMut(){const f0=FISH.find(f=>S.dex[f.id]);world.setRoom('dex',{fish:f0||FISH[0],dark:!f0});const b=h('div');let tot=0,got=0;
 const secs=Object.keys(MUT).map(k=>{const sec=h('div'),g=h('div','grid');let c=0;FISH.forEach(f=>{const d=S.dex[f.id],ok=d&&d.muts&&d.muts.includes(MUT[k].n);tot++;if(ok){got++;c++;const cd=h('div','card'),m=h('img');m.src=thumb(f,false,{k,...MUT[k]});cd.append(m,h('div','',`<b>${f.name}</b><br><span class="tag" style="background:${MUT[k].c}">${MUT[k].n.toUpperCase()}</span>`));g.append(cd)}});
  sec.append(h('h3','',`Mutasi ${MUT[k].n} (${c}/${FISH.length})`),c?g:h('p','','Belum ada.'));return sec});
 b.append(h('p','',`Mutasi ditemukan ${got} / ${tot}`),...secs,btn('KEMBALI',dex));modal('Indeks Mutasi',b)}
function opts(msg=''){world.setRoom('opts',{opt:S.opt});const b=h('div');[['shake','Camera shake'],['sound','Suara'],['fx','Partikel penuh'],['music','Musik latar']].forEach(([k,l])=>{const r=h('div','row',`<span>${l}</span>`);r.append(btn(S.opt[k]?'AKTIF':'MATI',()=>{S.opt[k]=!S.opt[k];setOpt(S.opt);save();opts()},S.opt[k]?'on':''));b.append(r)});
 const WL=['acak','clear','rain','storm','meteor'],wr=h('div','row','<span>Cuaca</span>');wr.append(btn((S.opt.wx||'acak')==='acak'?'ACAK':WXN[S.opt.wx].toUpperCase(),()=>{S.opt.wx=WL[(WL.indexOf(S.opt.wx||'acak')+1)%5];save();opts()}));b.append(wr);
 const cr=h('div','row','<span>Kode redeem</span>'),inp=h('input');inp.placeholder='Masukkan kode';inp.autocapitalize='characters';
 cr.append(inp,btn('PAKAI',()=>{const c=inp.value.trim().toUpperCase();if(c==='ENGGANTENG'){S.unl=true;S.coins=Math.max(S.coins,999999999);save();opts('Kode aktif: koin dan umpan UNLIMITED, semua perlengkapan dan lokasi terbuka.')}else if(c==='RESETENG'){S.unl=false;S.coins=50;S.gem=0;S.baits={bait_worm:20};save();opts('Uang direset ke 50 koin, umpan ke 20 cacing.')}else opts('Kode tidak dikenal.')}));b.append(cr);if(msg)b.append(h('p','',msg));
 b.append(btn('RESET PROGRES',()=>{if(confirm('Hapus semua progres?')){S=fresh();save();home()}}),btn('KEMBALI',home));modal('Pengaturan',b)}
function shop(tab){if(tab==='sell')world.setRoom('bag',{list:S.inv.slice(0,8).map(fishOf)});else if(!world.roomTab(tab))world.setRoom('shop',{tab,gear:GEAR});const b=h('div'),own=id=>S.own.includes(id);
 b.append(h('p','',`Koin: ${S.unl?'UNLIMITED':S.coins} | Kristal: ${S.unl?'UNLIMITED':S.gem}`),tabsBar(shopTabs(),tab,shop));
 const row=(name,info,btns)=>{const r=h('div','row',`<span><b>${name}</b><small>${info}</small></span>`);const w=h('span');btns.forEach(x=>w.append(x));r.append(w);b.append(r)};
 const one={rods:'rod',reels:'reel',lines:'line',hooks:'hook'}[tab];
 if(one)GEAR[tab].forEach(g=>{const info=tab==='rods'?`${g.tier} | Cast ${g.cast_power} Kontrol ${g.control} Kuat ${g.line_strength} Reel ${g.reel_speed} | Lv ${g.unlock_level}`:tab==='reels'?`Reel +${g.reel_speed_bonus} Drag +${g.drag_bonus}`:tab==='lines'?`Batas ${g.strength_kg} kg`:`Bonus hook +${g.hook_bonus} | ${g.fish_size}`;
  const eq=S[one]===g.id,lock=!S.unl&&g.unlock_level&&S.lv<g.unlock_level,bt=btn(eq?'DIPAKAI':own(g.id)?'PAKAI':`BELI ${g.price}`,()=>{if(!own(g.id)){if(!spend(g.price))return alert('Koin kurang.');S.own.push(g.id)}S[one]=g.id;save();shop(tab)},eq?'on':'');bt.disabled=eq||(!own(g.id)&&(lock||(!S.unl&&S.coins<g.price)));row(g.name,info,[bt])});
 if(tab==='baits'){const none=btn(S.bait?'TANPA UMPAN':'DIPILIH',()=>{S.bait=null;save();shop(tab)},S.bait?'':'on');row('Tanpa umpan','Peluang langka normal',[none]);
  GEAR.baits.forEach(g=>{const st=S.baits[g.id]||0;row(g.name,`Menarik ${g.attracts.join('/')} di ${g.habitat.join(', ')} | Stok ${S.unl?'UNLIMITED':st}`,[btn(`BELI x10 ${g.price*10}`,()=>{if(!spend(g.price*10))return alert('Koin kurang.');S.baits[g.id]=st+10;save();shop(tab)}),btn(S.bait===g.id?'DIPAKAI':'PAKAI',()=>{S.bait=g.id;save();shop(tab)},S.bait===g.id?'on':'')])})}
 if(tab==='sell'){const tot=S.inv.reduce((a,x)=>a+x.val,0);S.inv.forEach((x,i)=>{const f=FISH.find(y=>y.id===x.id);row(f.name,`${x.mut?'MUTASI '+x.mut+' | ':''}${x.r} | ${x.len} cm | ${x.w} kg`,[btn('PEGANG',()=>startFlex(x,()=>{reset();shop('sell')})),btn(`JUAL ${x.val}`,()=>{S.coins+=x.val;S.inv.splice(i,1);save();shop(tab)})])});
  b.append(S.inv.length?btn(`JUAL SEMUA ${tot}`,()=>{S.coins+=tot;S.inv=[];save();shop(tab)}):h('p','','Tas ikan kosong.'))}
 if(tab==='luck'){const L=S.luck,left=Math.max(0,L.until-Date.now()),full=left>=3600e3-1000;b.append(h('p','',luckOn()?`Luck aktif, sisa ${fmtT(left)} (maks 1 jam). Ikan langka x2.5, mutasi x1.5.`:'Luck belum aktif. Beli item untuk menambah peluang ikan langka dan mutasi. Waktu menumpuk, maksimal 1 jam.'));
  LUCKS.forEach(p=>{const ok=S.unl||S.coins>=p.c,bt=btn(full?'PENUH 1 JAM':ok?`BELI ${p.c}`:'KOIN KURANG',()=>{if(!spend(p.c))return alert('Koin kurang.');L.until=Math.min(Date.now()+3600e3,Math.max(Date.now(),L.until)+p.m*60e3);save();shop('luck')});bt.disabled=full||!ok;row(p.n,`+${p.m} menit | ${p.c} koin`,[bt])})}
 if(tab==='auto'){const A=S.auto;b.append(h('p','',autoActive()?(A.perm?'Auto Mancing: PERMANEN aktif.':`Auto Mancing aktif, sisa ${fmtT(A.until-Date.now())}`):'Auto belum aktif. Beli paket lalu nyalakan tombol AUTO saat memancing. Auto berjalan selama game terbuka.'));
  AUTOS.forEach(p=>{const perm=Number(p.hours)===0,cost=perm?p.gem_price:p.coin_price,have=perm?S.gem:S.coins,ok=S.unl||have>=cost;
   row(p.name,`${p.desc} | ${cost} ${perm?'Kristal':'koin'}`,[btn(ok?`BELI ${cost}`:(perm?'TOP UP DULU':'KOIN KURANG'),()=>{if(!ok){if(perm)return shop('topup');return alert('Koin kurang.')}
    if(!S.unl){if(perm)S.gem-=cost;else S.coins-=cost}if(perm)S.auto.perm=true;else S.auto.until=Math.max(Date.now(),S.auto.until)+p.hours*3600e3;save();shop('auto')})])});
  row('Hasil Auto','Ikan otomatis masuk Tas dan Akuarium (tas penuh 60: dijual)',[])}
 if(tab==='topup'){b.append(h('p','',`Kristal: ${S.unl?'UNLIMITED':S.gem}. Mode simulasi: belum ada pembayaran sungguhan.`));TOPUPS.forEach(p=>row(p.label,`${p.gems} Kristal | ${p.price_label}`,[btn('TOP UP',()=>{if(confirm(`SIMULASI: tambah ${p.gems} Kristal tanpa pembayaran?`)){S.gem+=Number(p.gems);save();shop('topup')}})]))}
 b.append(btn('KEMBALI',home));modal('Toko',b)}

/* ===== render ===== */
function hud(){
 $('#coins').textContent=`KOIN ${S.unl?'UNL':S.coins}  KRISTAL ${S.unl?'UNL':S.gem}`;$('#lvl').textContent=`LV ${S.lv}  XP ${S.xp}/${S.lv*120}`;$('#loc').textContent=`${LOCS[S.loc].n} | ${tod} | ${WXN[G.wx]}${autoTxt()}${luckOn()?' | LUCK '+fmtT(S.luck.until-Date.now()):''}`;
 const s=G.st,pw=s==='charge',bt=s==='bite',ft=s==='fight';
 $('#gauges').hidden=!(pw||bt||ft);$('#g1').hidden=!(pw||bt);$('#g2').hidden=$('#g3').hidden=!ft;
 const f1=$('#f1'),f2=$('#f2'),f3=$('#f3');
 if(bt){$('#gl1').textContent='WAKTU STRIKE';f1.style.width=(100-G.t/G.bw*100)+'%';f1.className=''}else{$('#gl1').textContent='POWER LEMPAR';f1.style.width=(pw?G.pw:0)+'%';f1.className=G.pw>80?'warn':''}
 $('#gl2').textContent=`PROGRESS TANGKAP ${Math.round(G.prog)}%`;
 f2.style.width=G.prog+'%';f2.className='';f3.style.width=(ft?G.en:0)+'%';f3.className=G.en>=66?'warn':'sta';$('#gl3').textContent=G.en>=66?'ENERGI TAP - FRENZY x2.2':G.en>=33?'ENERGI TAP x1.5':'ENERGI TAP';
 $('#bCast').hidden=!(s==='idle'||s==='charge');$('#bStrike').hidden=!(s==='wait'||s==='bite');$('#bReel').hidden=!ft;const ba=$('#bAuto');ba.hidden=!autoActive()||!!G.aq||s==='flex'||busy()||(ft&&!S.auto.on);ba.textContent=S.auto.on?'AUTO: ON':'AUTO: OFF';ba.classList.toggle('on',!!S.auto.on);
 const sw=$('#swipe');sw.hidden=!(ft&&G.swT>0);if(!sw.hidden){sw.dataset.d=G.swDir;$('#swt').textContent={L:'GESER KIRI',R:'GESER KANAN',U:'GESER ATAS',D:'GESER BAWAH'}[G.swDir];$('#swb').style.width=(G.swT/G.swMax*100)+'%'}
 $('#hud').hidden=!!G.aq||s==='flex'||s==='ride'||busy();
 {const rd=world.rd,ride=s==='ride'&&!busy();$('#joy').hidden=!((s==='idle'||ride)&&!busy()&&!G.aq);$('#rideui').hidden=!ride;
  if(ride&&rd){$('#rst').style.width=rd.stam+'%';$('#rst').className=rd.exh?'bad':rd.stam<30?'warn':'sta';$('#rinfo').textContent=`KOIN +${RS.coins} | MUTIARA ${RS.pearls} | KRISTAL +${RS.gems} | JARAK ${Math.round(RS.dist*.6)} m`;$('#rcombo').textContent=RS.combo>=3?`COMBO x${Math.min(5,1+Math.floor(RS.combo/3))}  (${RS.combo})`:'';$('#bBoost').classList.toggle('on',!!rd.boost);$('#rname').textContent=`${rd.f.name} | ${Math.round(rd.sp||0)} / ${rd.spd.toFixed(1)} kec`}}$('#dock').hidden=!(s==='idle'&&!busy()&&!G.aq);$('#flexui').hidden=s!=='flex'}

function pushInput(dt){let x=JOY.x,y=JOY.y;if(!JOY.on){x=(KEYS.ArrowRight||KEYS.KeyD?1:0)-(KEYS.ArrowLeft||KEYS.KeyA?1:0);y=(KEYS.ArrowDown||KEYS.KeyS?1:0)-(KEYS.ArrowUp||KEYS.KeyW?1:0)}
 world.inp.x=x;world.inp.y=y;world.inp.boost=!!(KEYS.ShiftLeft||KEYS.ShiftRight||(G.st==='ride'&&KEYS.Space)||G.boostBtn);
 if(G.st==='ride'){RS.ct-=dt;if(RS.ct<=0)RS.combo=0;if(world.rd)RS.dist=world.rd.dist}}
let last=0;function loop(ts){const dt=Math.min(.05,(ts-last)/1000||0);last=ts;pushInput(dt);if(G.slow>0)G.slow-=dt;const sd=G.slow>0?dt*.3:dt;if(!busy()||G.st==='result')update(sd);world.frame(sd,G,S,R(),tod);requestAnimationFrame(loop)}
const press=(e,fn)=>{e.addEventListener('pointerdown',ev=>{ev.preventDefault();fn(true)});['pointerup','pointerleave','pointercancel'].forEach(n=>e.addEventListener(n,()=>fn(false)))};
press($('#bCast'),d=>d?startCharge():doCast());
$('#bStrike').onclick=strike;$('#menuBtn').onclick=()=>{if(G.st==='idle')home()};
addEventListener('keydown',e=>{KEYS[e.code]=true;if(e.code==='ShiftLeft'||e.code==='ShiftRight'||/^(Arrow|Key[WASD])/.test(e.code)&&(G.st==='idle'||G.st==='ride'))e.preventDefault()});addEventListener('keyup',e=>{KEYS[e.code]=false});addEventListener('blur',()=>{for(const k in KEYS)KEYS[k]=false});
addEventListener('keydown',e=>{unlock();if(e.repeat||busy())return;if(e.code==='Space'){e.preventDefault();G.st==='idle'?startCharge():G.st==='fight'?tap():strike()}const a={ArrowLeft:'L',ArrowRight:'R',ArrowUp:'U',ArrowDown:'D'}[e.code];if(a){e.preventDefault();swipe(a)}});
addEventListener('keyup',e=>{if(e.code==='Space'){G.st==='charge'?doCast():G.reel=false}});

const csvp=t=>Papa.parse(t.replace(/^\uFEFF/,''),{header:true,dynamicTyping:true,skipEmptyLines:true}).data;
let MENUS=[],AUTOS=[],TOPUPS=[];const ACT={play:()=>closeM(),shop:p=>shop(p||'rods'),dex:()=>dex(),aqua:()=>aqua(),locs:()=>locs(),opts:()=>opts(),home:()=>home()};
const runMenu=m=>{const f=ACT[m.action];if(f)f(m.param)};
const shopTabs=()=>MENUS.filter(m=>m.parent==='shop').sort((a,b)=>a.order-b.order).map(m=>[m.param,m.label]).reduce((a,x,i)=>{a.push(x);if(x[0]==='baits')a.push(['luck','Luck']);return a},[]);
const fishOf=co=>{const b=FISH.find(x=>x.id===co.id),k=co.mk||Object.keys(MUT).find(z=>MUT[z].n===co.mut);return{...b,sc:Math.random(),mut:k?{k,...MUT[k]}:null,weight:co.w,len:co.len}};
function closeAq(){G.aq=false;world.onAqLabel=null;$('#aqlab').hidden=true;world.setMode('game');$('#aqui').hidden=true}
function aqua(){closeM();G.aq=true;const l=S.inv.slice();world.setMode('aqua');world.aqFish(l.map(fishOf));world.azd=0;world.azm=1;let sel=-1;
 const u=$('#aqui');u.hidden=false;u.innerHTML='';u.append(h('b','',`AKUARIUM BESAR | ${S.inv.length} ikan, ukuran asli sesuai penggaris (1 m)`));
 if(!l.length)u.append(h('p','','Kosong. Tekan SIMPAN saat dapat ikan agar muncul di sini.'));
 const act=h('div','btns'),chips=h('div','chips'),cb=[];
 const pick=i=>{sel=i;world.aqSelect(i);cb.forEach((c,k)=>c.classList.toggle('on',k===i));act.innerHTML='';const lab=$('#aqlab');
  if(i<0){lab.hidden=true;return}const x=l[i],f=FISH.find(y=>y.id===x.id);lab.innerHTML=`<b>${f.name}</b>${x.mut?' <span class="tag" style="background:'+(MUT[x.mk||Object.keys(MUT).find(z=>MUT[z].n===x.mut)]||{c:'#888'}).c+'">'+x.mut.toUpperCase()+'</span>':''}<br><span class="tag" style="background:${RC[f.rarity]}">${f.rarity}</span> ${x.len} cm | ${x.w} kg`;
  act.append(btn('PAMER',()=>startFlex(x)),btn('NAIKI IKAN INI',()=>{closeAq();beginRide(x)}),btn('LEPAS PILIHAN',()=>pick(-1)));cb[i]&&cb[i].scrollIntoView&&cb[i].scrollIntoView({block:'nearest',inline:'center'})};
 world.onAqLabel=(nx,ny,vis)=>{const lab=$('#aqlab');if(sel<0||!vis){lab.hidden=true;return}lab.hidden=false;lab.style.left=(nx*100)+'%';lab.style.top=(ny*100)+'%'};
 G.aqPick=pick;
 l.forEach((x,i)=>{const f=FISH.find(y=>y.id===x.id),c=btn(`${f.name}${x.mut?' ['+x.mut+']':''} ${x.len}cm`,()=>pick(sel===i?-1:i));cb.push(c);chips.append(c)});
 const zr=h('div','btns');zr.append(btn('ZOOM +',()=>{world.azm=cl(world.azm*.8,.3,1.4)}),btn('ZOOM -',()=>{world.azm=cl(world.azm*1.25,.3,1.4)}),btn('TUTUP',closeAq));
 u.append(chips,act,h('p','','Tap ikan di dalam akuarium atau di daftar untuk melihat nama dan ukurannya. Geser layar untuk memutar kamera.'),zr)}
function beginRide(co){closeM();const f=fishOf(co);if(world.startRide(f)){G.st='ride';G.f=null;RS.coins=RS.pearls=RS.gems=RS.combo=0;RS.dist=0;RS.ct=0;say(`Naik ${f.name}! Joystick/WASD untuk bergerak, SHIFT/BOOST untuk ngebut.`,3.2);sfx('splash')}}
function rideMenu(){if(G.st!=='idle')return;const b=h('div'),mk=co=>{const f=fishOf(co),m=h('img');m.src=thumb(f,false,f.mut);m.style.cssText='width:84px;flex:none';const r=h('div','row');const inf=h('span','',`<b>${f.name}</b><small>${co.mut?'MUTASI '+co.mut+' | ':''}${f.rarity} | ${f.len} cm | ${f.weight} kg | kecepatan ${rideSpeed(f).toFixed(1)}</small>`);r.append(m,inf,btn('NAIKI',()=>beginRide(co)));return r};
 b.append(h('p','','Pilih ikan dari Tas untuk ditunggangi menjelajah sungai. Ikan besar lebih gagah, ikan langka/mutasi lebih cepat. Kumpulkan mutiara dan kristal untuk koin dan XP!'));
 S.inv.slice(0,40).forEach(co=>b.append(mk(co)));
 if(!S.inv.length){const L=LOCS[S.loc].n,f0=FISH.find(f=>f.rarity==='Common'&&f.hab.some(x=>x.n===L))||FISH[0];b.append(h('p','','Tas kosong. Pakai ikan pinjaman dulu, atau tangkap lalu SIMPAN ikan.'),mk({id:f0.id,w:3,len:Math.round(35*Math.cbrt(3)),mut:''}))}
 b.append(btn('KEMBALI',closeM));modal('Naik Ikan',b)}
function startFlex(co,back){closeM();closeAq();const f=fishOf(co);G.f=f;G.st='flex';G.ct=1;G.cdur=1;G.back=back||(()=>{reset();aqua()});world.startFlex(f,RN.indexOf(f.rarity));sfx('catch',Math.min(3,RN.indexOf(f.rarity)))}
let pd=null;const APP=$('#app');
APP.addEventListener('pointerdown',e=>{unlock();if(e.target.closest('input,#modal,#dock,#aqui,#flexui,#joy,#rideui'))return;pd={x:e.clientX,y:e.clientY,mv:0};if(G.st==='fight'&&G.swT<=0&&!e.target.closest('button'))tap()});
APP.addEventListener('pointermove',e=>{if(!pd)return;const dx=e.clientX-pd.x,dy=e.clientY-pd.y;pd.mv=Math.max(pd.mv||0,Math.hypot(dx,dy));
 if(G.st==='fight'&&G.swT>0){if(Math.hypot(dx,dy)>50){swipe(Math.abs(dx)>Math.abs(dy)?(dx<0?'L':'R'):(dy<0?'U':'D'));pd=null}}
 else if(G.st==='flex')world.fyaw=(world.fyaw||0)+(e.movementX||0)*.012;
 else if(world.mode==='aqua')world.azd=cl((world.azd||0)+(e.movementX||0)*.006,-1.2,1.2)});
APP.addEventListener('pointerup',e=>{if(pd&&world.mode==='aqua'&&G.aq&&(pd.mv||0)<8&&G.aqPick){const r=cv.getBoundingClientRect(),i=world.aqPick((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height*2-1));if(i>=0)G.aqPick(i)}pd=null});
APP.addEventListener('pointercancel',()=>{pd=null});
APP.addEventListener('wheel',e=>{if(world.mode==='aqua')world.azm=cl((world.azm||1)*(1+e.deltaY*.0012),.3,1.4)},{passive:true});
{const J=$('#joy'),K=$('#joyk'),setJ=e=>{const r=J.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,R=r.width/2-8;let dx=e.clientX-cx,dy=e.clientY-cy;const d=Math.hypot(dx,dy);if(d>R){dx*=R/d;dy*=R/d}JOY.x=dx/R;JOY.y=dy/R;K.style.transform=`translate(${dx}px,${dy}px)`};
 J.addEventListener('pointerdown',e=>{e.preventDefault();unlock();J.setPointerCapture(e.pointerId);JOY.on=true;setJ(e)});J.addEventListener('pointermove',e=>{if(JOY.on)setJ(e)});
 const up=()=>{JOY.on=false;JOY.x=JOY.y=0;K.style.transform='translate(0,0)'};['pointerup','pointercancel','lostpointercapture'].forEach(n=>J.addEventListener(n,up))}
{const B=$('#bBoost');B.addEventListener('pointerdown',e=>{e.preventDefault();unlock();G.boostBtn=true});['pointerup','pointerleave','pointercancel'].forEach(n=>B.addEventListener(n,()=>{G.boostBtn=false}))}
$('#bHome').onclick=()=>{world.goHome();say('Berenang pulang ke dermaga...',1.6)};
$('#bReel').addEventListener('pointerdown',e=>{e.preventDefault();unlock();tap()});
$('#bAuto').onclick=()=>{if(G.st==='fight'&&!S.auto.on)return;S.auto.on=!S.auto.on;save();autoT=.5;say(S.auto.on?'Auto Mancing AKTIF':'Auto Mancing mati',1.5)};
$('#bBack').onclick=()=>{const b=G.back;G.back=null;if(b)b()};
$('#bPhoto').onclick=()=>{const a=document.createElement('a');a.href=world.snap();a.download='tidal-tales-pamer.png';a.click()};
(async()=>{
 const T=u=>fetch(import.meta.env.BASE_URL+'data/'+u).then(r=>r.text());
 const [fc,gc,mc,lc,ac,tc]=await Promise.all([T('fish_catalog.csv'),T('gear.csv'),T('menus.csv'),T('locations.csv'),T('autofish.csv'),T('topup.csv')]);
 FISH=parseFish(fc);world.fish=FISH;
 GEAR={};csvp(gc).forEach(r=>{const o={...r};['attracts','habitat'].forEach(k=>{if(o[k]!==undefined)o[k]=(o[k]===null||o[k]==='')?[]:String(o[k]).split(';').map(x=>x.trim())});(GEAR[o.category]=GEAR[o.category]||[]).push(o)});
 MENUS=csvp(mc);AUTOS=csvp(ac);TOPUPS=csvp(tc);LOCS.length=0;csvp(lc).forEach(r=>LOCS.push({n:r.name,lv:r.unlock_level,sky:r.sky,wat:r.water,bank:r.bank}));
 setLocData(LOCS.map(l=>({sky:l.sky,bank:l.bank,wat:l.wat,name:l.n})));
 S=load();S.opt={shake:true,sound:true,fx:true,music:true,wx:'acak',...S.opt};setOpt(S.opt);
 MENUS.filter(m=>String(m.dock)==='1').sort((a,b)=>a.order-b.order).forEach(m=>$('#dock').append(lego(btn(m.label,()=>runMenu(m)),m.color)));
 world.onThunder=()=>{setTimeout(()=>sfx('thunder'),300+Math.random()*700);if(S.opt.shake)world.shake=.25};world.onMeteor=()=>{sfx('meteor');if(S.opt.shake)world.shake=Math.max(world.shake,.15)};
 $('#dock').append(lego(btn('NAIK IKAN',rideMenu),'#2bb5c9'));
 world.onItem=k=>{RS.combo++;RS.ct=4;const mu=Math.min(5,1+Math.floor(RS.combo/3)),base={p:3,g:15,c:0}[k]*mu;if(k==='c'){S.gem++;RS.gems++;addXp(10*mu);say(`KRISTAL +1  (x${mu})`,1)}else{S.coins+=base;RS.coins+=base;if(k==='p')RS.pearls++;addXp(k==='g'?4:1);say(`${k==='g'?'MUTIARA EMAS':'Mutiara'} +${base}`,.7)}sfx('tap',Math.min(1,RS.combo/9))};
 world.onRide=ev=>{if(ev==='mounted')sfx('ok');if(ev==='end'){G.st='idle';S.stats.ride=(S.stats.ride||0)+Math.round(RS.dist*.6);S.stats.pearls=(S.stats.pearls||0)+RS.pearls;save();say(`Turun dari ikan. Jarak ${Math.round(RS.dist*.6)} m | +${RS.coins} koin | ${RS.pearls} mutiara`,3.5)}};
 hud();home();requestAnimationFrame(loop)})();

if('serviceWorker' in navigator&&import.meta.env.PROD)addEventListener('load',()=>navigator.serviceWorker.register(import.meta.env.BASE_URL+'sw.js').catch(()=>{}));
