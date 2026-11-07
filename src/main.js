import Papa from 'papaparse';
import {World} from './world.js';
import {thumb,RN,RC} from './fish3d.js';
import './style.css';
const $=s=>document.querySelector(s),KEY='tidal_tales_v1';
const RW={Common:55,Uncommon:25,Rare:13,Epic:5,Legendary:1.7,Mythic:.3};
const LOCS=[{n:'Willow Lake',lv:1,sky:'#a9d6e5',wat:'#2f7f9e',bank:'#5b7f4a'},{n:'Misty River',lv:3,sky:'#c3cfd4',wat:'#4a7a86',bank:'#6f7d52'},{n:'Mangrove Marsh',lv:6,sky:'#b9c79a',wat:'#5a6b3c',bank:'#3e4f2c'},{n:'Coral Bay',lv:10,sky:'#8fd3dc',wat:'#1f93a8',bank:'#d8c48a'},{n:'Abyssal Trench',lv:15,sky:'#2b3a5c',wat:'#101c3a',bank:'#262e44'}];
const TODS=['siang','senja','malam'];
let FISH=[],GEAR={},S,tod='siang';
const fresh=()=>({coins:50,xp:0,lv:1,rod:'rod_wood',reel:'reel_basic',line:'line_2kg',hook:'hook_small',own:['rod_wood','reel_basic','line_2kg','hook_small'],baits:{bait_worm:20},bait:'bait_worm',loc:0,inv:[],dex:{},stats:{caught:0,broke:0},opt:{shake:true,sound:true,fx:true}});
const load=()=>{try{const d=JSON.parse(localStorage.getItem(KEY));return d?{...fresh(),...d}:fresh()}catch{return fresh()}};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch{}};
const it=(k,id)=>GEAR[k].find(x=>x.id===id),R=()=>it('rods',S.rod),RL=()=>it('reels',S.reel),LN=()=>it('lines',S.line),HK=()=>it('hooks',S.hook);
const cl=(v,a,b)=>Math.max(a,Math.min(b,v)),rnd=(a,b)=>a+Math.random()*(b-a),hash=s=>[...s].reduce((a,c)=>a*31+c.charCodeAt(0)>>>0,7);
const h=(t,c='',x='')=>{const e=document.createElement(t);e.className=c;e.innerHTML=x;return e};
const btn=(t,fn,c='')=>{const b=h('button',c,t);b.onclick=fn;return b};
let ac;const beep=(f,d=.08,ty='square')=>{if(!S.opt.sound)return;try{ac=ac||new AudioContext();const o=ac.createOscillator(),g=ac.createGain();o.type=ty;o.frequency.value=f;g.gain.value=.04;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+d)}catch{}};

function parseFish(txt){return Papa.parse(txt.replace(/^\uFEFF/,''),{header:true,dynamicTyping:true,skipEmptyLines:true}).data.map(f=>({...f,w:f.reference_weight_kg,v:f.base_value,hab:String(f.habitat).split(';').map(s=>{s=s.trim();const m=s.match(/^(.+?)\s*\((.+)\)$/);return{n:m?m[1]:s,c:m?m[2]:null}})}))}

/* ===== game state ===== */
const G={st:'idle',pw:0,pd:1,t:0,cd:6,bt:0,bw:1,f:null,ten:0,sta:100,dist:100,over:0,surge:0,sn:2,pump:0,reel:false,time:0,bait:null,pull:20,ct:0,cdur:1,slow:0,after:null,jumper:false,fx:0,msgT:0};
const cv=$('#cv'),M=$('#modal'),busy=()=>!M.hidden,world=new World(cv);
const say=(t,s=2)=>{const m=$('#msg');m.textContent=t;m.hidden=!t;G.msgT=s};
const reset=()=>{G.st='idle';G.f=null;G.reel=false;G.ten=0;G.sta=100;G.dist=100;G.surge=0;G.ct=0};

function pick(){
 const L=LOCS[S.loc].n,pool=FISH.filter(f=>f.hab.some(x=>x.n===L&&(!x.c||(x.c==='event'?S.bait==='bait_moon'&&Math.random()<.25:x.c===tod))));
 const list=pool.length?pool:FISH.filter(f=>f.hab.some(x=>x.n===L)),b=G.bait?it('baits',G.bait):null,far=1+G.pw/200,ws={};
 list.forEach(f=>{if(ws[f.rarity]===undefined){let w=RW[f.rarity];if(b&&b.attracts.includes(f.rarity)&&b.habitat.includes(L))w*=2.5;if(RN.indexOf(f.rarity)>=2)w*=far;if(f.rarity==='Legendary'&&S.lv<5)w=0;if(f.rarity==='Mythic'&&S.lv<8)w=0;ws[f.rarity]=w}});
 let tot=Object.values(ws).reduce((a,b)=>a+b,0),r=Math.random()*tot,rar=Object.keys(ws)[0];
 for(const k in ws){r-=ws[k];if(r<=0){rar=k;break}}
 const cand=list.filter(f=>f.rarity===rar),f=cand[Math.floor(Math.random()*cand.length)],sc=rnd(.75,1.35);
 return{...f,sc,weight:+(f.w*sc**3).toFixed(2),len:Math.round(25*Math.cbrt(f.w*sc**3)*1.4)}}

function startCharge(){if(G.st!=='idle'||busy())return;G.st='charge';G.pw=0;G.pd=1}
function doCast(){if(G.st!=='charge')return;
 G.bait=null;if(S.bait&&S.baits[S.bait]>0){S.baits[S.bait]--;G.bait=S.bait}else say('Tanpa umpan: peluang ikan langka turun.');
 tod=TODS[Math.floor(Math.random()*3)];G.cd=4+G.pw*(.08+R().cast_power*.0012);G.st='cast';G.t=0;beep(300,.15,'sawtooth');save()}
function strike(){
 if(G.st==='wait'){say('Terlalu cepat!');beep(150,.15);reset();return}
 if(G.st!=='bite')return;
 const ctl=R().control,ideal=G.t/G.bw>.08&&G.t/G.bw<.75,diff=RN.indexOf(G.f.rarity)*6+Math.min(10,G.f.weight/4),ch=cl(40+ctl*.25+HK().hook_bonus-diff+(ideal?15:-25),5,95);
 if(Math.random()*100<ch){G.st='fight';G.ten=20;G.sta=100;G.dist=100;G.over=0;G.surge=0;G.sn=rnd(1.5,3);G.pump=0;
  const r=G.f.weight/(LN().strength_kg*1.2),agg=/cepat|lincah|meledak|sangat|agresif|lompatan|ekstrem|kuat|boss|event/i.test(G.f.behavior)?1.3:1;
  G.pull=cl((12+30*Math.min(r,2))*agg,10,85);G.jumper=/lompat|meledak|lincah|cepat/i.test(G.f.behavior);world.ring(G.cd,'#ffffff',1.2);world.splash(G.cd,10);beep(700,.12);say('TERKAIT! TAHAN REEL',1.2)}
 else{say('Strike meleset. Ikan lepas.');beep(150,.2);reset()}}
function pump(){if(G.st!=='fight'||G.pump>0||G.sta>55)return;G.ten=Math.min(100,G.ten+18);G.dist-=7;G.sta-=6;G.pump=1;beep(500,.06)}

function update(dt){
 G.time+=dt;
 if(G.msgT>0&&(G.msgT-=dt)<=0)$('#msg').hidden=true;
 const s=G.st;
 if(s==='charge'){G.pw+=G.pd*110*dt;if(G.pw>=100||G.pw<=0){G.pd*=-1;G.pw=cl(G.pw,0,100)}}
 else if(s==='cast'){G.t+=dt;if(G.t>=.7){G.st='wait';G.t=0;G.bt=rnd(2,6)*(G.bait?.7:1);world.splash(G.cd,16);world.ring(G.cd,'#dfeaf2',2.2);beep(220,.1,'triangle')}}
 else if(s==='wait'){G.t+=dt;if(Math.floor(G.t*.9)!==Math.floor((G.t-dt)*.9))world.ring(G.cd,'#dfeaf2',.9);
  if(G.t>=G.bt){G.st='bite';G.t=0;G.bw=1.1+R().control*.012;G.f=pick();for(let i=0;i<3;i++)setTimeout(()=>world.ring(G.cd,'#ffffff',1.6),i*180);beep(900,.1);say('IKAN MENGGIGIT! TEKAN STRIKE',G.bw)}}
 else if(s==='bite'){G.t+=dt;if(G.t>G.bw){say('Terlambat. Ikan pergi.');reset()}}
 else if(s==='fight'){
  const r=R(),rl=RL(),sp=r.reel_speed+rl.reel_speed_bonus,ep=G.pull*(.4+.6*G.sta/100);G.pump=Math.max(0,G.pump-dt);G.sn-=dt;
  if(G.surge>0)G.surge-=dt;else if(G.sn<=0){G.surge=.8;G.sn=rnd(2,4);beep(200,.2,'sawtooth')}
  if(G.reel){G.ten+=(ep*.55-r.control*.08-rl.drag_bonus*.1)*dt*2.4;G.dist-=(6+sp*.22)*dt*(.35+.65*(1-G.sta/100));if(G.ten>25&&G.ten<85)G.sta-=(7+r.control*.04)*dt}
  else{G.ten-=7*dt*2.2;G.dist+=ep*.1*dt*(G.sta/100+.3)}
  if(G.surge>0)G.ten+=ep*.6*dt;
  G.sta=Math.max(0,G.sta-1.5*dt);G.ten=cl(G.ten,0,100);
  if(G.ten>85&&Math.floor(G.time*6)%2===0)beep(1000,.03);
  G.over=G.ten>=100?G.over+dt:0;
  if(G.over>=1.2){S.stats.broke++;save();say('SENAR PUTUS!',2.5);beep(100,.4,'sawtooth');world.burstAt(world.bp,'#ffffff',12,3,1);reset()}
  else if(G.dist>=130){say('Ikan kabur.');reset()}
  else if(G.dist<=0){G.dist=0;if(G.sta<=0)finish()}}
 else if(s==='catch'){G.ct+=dt;if(G.ct>=G.cdur){G.st='result';G.after()}}
 hud()}

function finish(){
 const f=G.f,val=Math.max(1,Math.round(f.v*Math.pow(f.weight/f.w,.7))),isNew=!S.dex[f.id],d=S.dex[f.id]||(S.dex[f.id]={n:0,best:0}),rec=f.weight>d.best,ix=RN.indexOf(f.rarity);
 d.n++;if(rec)d.best=f.weight;S.stats.caught++;S.xp+=Math.round(5+f.v/10)+(isNew?30:0);
 let up=false;while(S.xp>=S.lv*120){S.xp-=S.lv*120;S.lv++;up=true}
 G.st='catch';G.ct=0;G.reel=false;G.cdur=[1.2,1.4,1.7,2,2.3,2.7][ix];G.fx=ix;G.slow=ix>=3?.25:0;
 world.catchFx(f,ix);if(ix>=4&&S.opt.shake)world.shake=.5;if(ix===5)$('#cut').classList.add('on');
 beep(500+ix*120,.25,'triangle');save();
 const co={id:f.id,w:f.weight,len:f.len,val,r:f.rarity},done=()=>{closeM();reset();$('#cut').classList.remove('on')};
 G.after=()=>{const b=h('div'),im=h('img');im.src=thumb(f);
  b.append(im,h('div','big',f.name),h('div','',`<span class="tag" style="background:${RC[f.rarity]}">${f.rarity.toUpperCase()}</span> ${isNew?'<b>SPESIES BARU</b> ':''}${rec&&!isNew?'<b>REKOR BERAT</b>':''}`),
   h('div','row',`<span>Panjang ${f.len} cm</span><span>Berat ${f.weight} kg</span><span>Nilai ${val} koin</span>`),up?h('div','',`<b>LEVEL NAIK: ${S.lv}</b>`):h('span'));
  const bs=h('div','btns');bs.append(btn('JUAL',()=>{S.coins+=val;save();done()}),btn('SIMPAN',()=>{S.inv.push(co);save();done()}),btn('LEPAS',()=>{S.xp+=2;save();done()}));b.append(bs);modal('Tangkapan',b,true)}}

/* ===== UI ===== */
function modal(t,b,lite){M.innerHTML='';M.className=lite?'lite':'';const p=h('div','panel');p.append(h('h2','',t),b);M.append(p);M.hidden=false}
const closeM=()=>{M.hidden=true;M.innerHTML=''};
const tabsBar=(names,cur,fn)=>{const t=h('div','tabs');names.forEach(n=>t.append(btn(n[1],()=>fn(n[0]),n[0]===cur?'on':'')));return t};
function home(){const b=h('div'),s=h('div','btns');
 b.append(h('p','',`Level ${S.lv} | ${S.coins} koin | Tertangkap ${S.stats.caught} | Senar putus ${S.stats.broke}`));
 s.append(btn('MAIN',closeM),btn('LOKASI',locs),btn('KOLEKSI',dex),btn('TOKO',()=>shop('rods')),btn('PENGATURAN',opts));b.append(s);modal('Tidal Tales: Fishing Adventure',b)}
function locs(){const b=h('div');LOCS.forEach((l,i)=>{const r=h('div','row',`<span><b>${l.n}</b><small>Buka di level ${l.lv}</small></span>`);r.append(btn(S.loc===i?'DIPILIH':S.lv>=l.lv?'PILIH':'TERKUNCI',()=>{S.loc=i;save();closeM()},S.loc===i?'on':''));r.lastChild.disabled=S.lv<l.lv;b.append(r)});b.append(btn('KEMBALI',home));modal('Pilih Lokasi',b)}
function dex(){const b=h('div'),g=h('div','grid'),n=Object.keys(S.dex).length;b.append(h('p','',`Ditemukan ${n} / ${FISH.length}`));
 FISH.forEach(f=>{const d=S.dex[f.id],cd=h('div','card'),m=h('img');m.src=thumb(f,!d);cd.append(m);
  cd.append(h('div','',d?`<b>${f.name}</b><br><span class="tag" style="background:${RC[f.rarity]}">${f.rarity}</span><br>${f.hab.map(x=>x.n).join(', ')}<br>Rekor ${d.best} kg | x${d.n}`:'<b>???</b>'));g.append(cd)});
 b.append(g,btn('KEMBALI',home));modal('Koleksi',b)}
function opts(){const b=h('div');[['shake','Camera shake'],['sound','Suara'],['fx','Partikel penuh']].forEach(([k,l])=>{const r=h('div','row',`<span>${l}</span>`);r.append(btn(S.opt[k]?'AKTIF':'MATI',()=>{S.opt[k]=!S.opt[k];save();opts()},S.opt[k]?'on':''));b.append(r)});
 b.append(btn('RESET PROGRES',()=>{if(confirm('Hapus semua progres?')){S=fresh();save();home()}}),btn('KEMBALI',home));modal('Pengaturan',b)}
function shop(tab){const b=h('div'),own=id=>S.own.includes(id);
 b.append(h('p','',`Koin: ${S.coins}`),tabsBar([['rods','Joran'],['reels','Reel'],['lines','Senar'],['hooks','Kail'],['baits','Umpan'],['sell','Jual Ikan']],tab,shop));
 const row=(name,info,btns)=>{const r=h('div','row',`<span><b>${name}</b><small>${info}</small></span>`);const w=h('span');btns.forEach(x=>w.append(x));r.append(w);b.append(r)};
 const one={rods:'rod',reels:'reel',lines:'line',hooks:'hook'}[tab];
 if(one)GEAR[tab].forEach(g=>{const info=tab==='rods'?`${g.tier} | Cast ${g.cast_power} Kontrol ${g.control} Kuat ${g.line_strength} Reel ${g.reel_speed} | Lv ${g.unlock_level}`:tab==='reels'?`Reel +${g.reel_speed_bonus} Drag +${g.drag_bonus}`:tab==='lines'?`Batas ${g.strength_kg} kg`:`Bonus hook +${g.hook_bonus} | ${g.fish_size}`;
  const eq=S[one]===g.id,lock=g.unlock_level&&S.lv<g.unlock_level,bt=btn(eq?'DIPAKAI':own(g.id)?'PAKAI':`BELI ${g.price}`,()=>{if(!own(g.id)){if(S.coins<g.price)return say('Koin kurang.');S.coins-=g.price;S.own.push(g.id)}S[one]=g.id;save();shop(tab)},eq?'on':'');bt.disabled=eq||(!own(g.id)&&(lock||S.coins<g.price));row(g.name,info,[bt])});
 if(tab==='baits'){const none=btn(S.bait?'TANPA UMPAN':'DIPILIH',()=>{S.bait=null;save();shop(tab)},S.bait?'':'on');row('Tanpa umpan','Peluang langka normal',[none]);
  GEAR.baits.forEach(g=>{const st=S.baits[g.id]||0;row(g.name,`Menarik ${g.attracts.join('/')} di ${g.habitat.join(', ')} | Stok ${st}`,[btn(`BELI x10 ${g.price*10}`,()=>{if(S.coins<g.price*10)return say('Koin kurang.');S.coins-=g.price*10;S.baits[g.id]=st+10;save();shop(tab)}),btn(S.bait===g.id?'DIPAKAI':'PAKAI',()=>{S.bait=g.id;save();shop(tab)},S.bait===g.id?'on':'')])})}
 if(tab==='sell'){const tot=S.inv.reduce((a,x)=>a+x.val,0);S.inv.forEach((x,i)=>{const f=FISH.find(y=>y.id===x.id);row(f.name,`${x.r} | ${x.len} cm | ${x.w} kg`,[btn(`JUAL ${x.val}`,()=>{S.coins+=x.val;S.inv.splice(i,1);save();shop(tab)})])});
  b.append(S.inv.length?btn(`JUAL SEMUA ${tot}`,()=>{S.coins+=tot;S.inv=[];save();shop(tab)}):h('p','','Tas ikan kosong.'))}
 b.append(btn('KEMBALI',home));modal('Toko',b)}

/* ===== render ===== */
function hud(){
 $('#coins').textContent=`KOIN ${S.coins}`;$('#lvl').textContent=`LV ${S.lv}  XP ${S.xp}/${S.lv*120}`;$('#loc').textContent=`${LOCS[S.loc].n} | ${tod}`;
 const s=G.st,pw=s==='charge',bt=s==='bite',ft=s==='fight';
 $('#gauges').hidden=!(pw||bt||ft);$('#g1').hidden=!(pw||bt);$('#g2').hidden=$('#g3').hidden=!ft;
 const f1=$('#f1'),f2=$('#f2'),f3=$('#f3');
 if(bt){$('#gl1').textContent='WAKTU STRIKE';f1.style.width=(100-G.t/G.bw*100)+'%';f1.className=''}else{$('#gl1').textContent='POWER LEMPAR';f1.style.width=(pw?G.pw:0)+'%';f1.className=G.pw>80?'warn':''}
 $('#gl2').textContent=`TEGANGAN SENAR ${Math.round(G.ten)}%${G.ten>85?' - BAHAYA':''}`;
 f2.style.width=G.ten+'%';f2.className=G.ten>85?'bad':G.ten>65?'warn':'';f3.style.width=(ft?G.sta:0)+'%';
 $('#bCast').hidden=!(s==='idle'||s==='charge');$('#bStrike').hidden=!(s==='wait'||s==='bite');$('#bReel').hidden=$('#bPump').hidden=!ft}

let last=0;function loop(ts){const dt=Math.min(.05,(ts-last)/1000||0);last=ts;if(G.slow>0)G.slow-=dt;const sd=G.slow>0?dt*.3:dt;if(!busy()||G.st==='result')update(sd);world.frame(sd,G,S,R(),tod);requestAnimationFrame(loop)}
const press=(e,fn)=>{e.addEventListener('pointerdown',ev=>{ev.preventDefault();fn(true)});['pointerup','pointerleave','pointercancel'].forEach(n=>e.addEventListener(n,()=>fn(false)))};
press($('#bCast'),d=>d?startCharge():doCast());press($('#bReel'),d=>{G.reel=d&&G.st==='fight'});
$('#bStrike').onclick=strike;$('#bPump').onclick=pump;$('#menuBtn').onclick=()=>{if(G.st==='idle')home()};
addEventListener('keydown',e=>{if(e.repeat||busy())return;if(e.code==='Space'){e.preventDefault();G.st==='idle'?startCharge():G.st==='fight'?G.reel=true:strike()}if(e.code==='KeyP')pump()});
addEventListener('keyup',e=>{if(e.code==='Space'){G.st==='charge'?doCast():G.reel=false}});

(async()=>{
 const [csv,gear]=await Promise.all([fetch(import.meta.env.BASE_URL+'data/fish_catalog.csv').then(r=>r.text()),fetch(import.meta.env.BASE_URL+'data/gear_catalog.json').then(r=>r.json())]);
 FISH=parseFish(csv);world.fish=FISH;GEAR=gear;S=load();hud();home();requestAnimationFrame(loop)})();

if('serviceWorker' in navigator&&import.meta.env.PROD)addEventListener('load',()=>navigator.serviceWorker.register(import.meta.env.BASE_URL+'sw.js').catch(()=>{}));
