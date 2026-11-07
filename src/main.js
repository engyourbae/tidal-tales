import Papa from 'papaparse';
import './style.css';
const $=s=>document.querySelector(s),KEY='tidal_tales_v1';
const RN=['Common','Uncommon','Rare','Epic','Legendary','Mythic'];
const RC={Common:'#7d8996',Uncommon:'#3f9e6e',Rare:'#3b73c9',Epic:'#7b4fb8',Legendary:'#c99512',Mythic:'#c2308a'};
const RW={Common:55,Uncommon:25,Rare:13,Epic:5,Legendary:1.7,Mythic:.3};
const LOCS=[{n:'Willow Lake',lv:1,sky:'#a9d6e5',wat:'#2f7f9e',bank:'#5b7f4a'},{n:'Misty River',lv:3,sky:'#c3cfd4',wat:'#4a7a86',bank:'#6f7d52'},{n:'Mangrove Marsh',lv:6,sky:'#b9c79a',wat:'#5a6b3c',bank:'#3e4f2c'},{n:'Coral Bay',lv:10,sky:'#8fd3dc',wat:'#1f93a8',bank:'#d8c48a'},{n:'Abyssal Trench',lv:15,sky:'#2b3a5c',wat:'#101c3a',bank:'#262e44'}];
const TODS=['siang','senja','malam'],COLS=[['merah','#c0392b'],['oranye','#e07b39'],['emas','#d9a521'],['safir','#2a4fa8'],['biru','#3b73c9'],['hijau','#4a9a6a'],['cokelat','#7a5230'],['abu','#7b8794'],['perak','#b8c2cc'],['putih','#e8e4d8'],['cyan','#2bb5c9'],['kristal','#9ad7e6'],['zaitun','#7a8a3a'],['transparan','#a7c9d9'],['indigo','#3a3f7a'],['navy','#1f3a6e'],['galaksi','#2d2a6e']];
const ACC=['#eef2f7','#1b2433','#e9a23b','#2bb5c9'];
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
const colorOf=f=>{const s=f.visual_brief.toLowerCase();return(COLS.find(c=>s.includes(c[0]))||[0,'#6b7b8c'])[1]};
function drawFish(c,f,x,y,L,a=0,dark=false){
 const sh=hash(f.id),slim=/belut|sidat|barracuda|marlin|belida|naga|leviathan/i.test(f.name),hh=L*(slim?.12:.22),col=dark?'#1b2433':colorOf(f),tw=hh*(.8+sh%3*.15);
 c.save();c.translate(x,y);c.rotate(a);c.fillStyle=col;
 c.beginPath();c.moveTo(-L*.38,0);c.lineTo(-L*.62,-tw);c.lineTo(-L*.62,tw);c.closePath();c.fill();
 c.beginPath();c.moveTo(-L*.12,-hh*.8);c.lineTo(L*.02,-hh*1.6);c.lineTo(L*.16,-hh*.8);c.closePath();c.fill();
 c.beginPath();c.ellipse(0,0,L*.45,hh,0,0,7);c.fill();
 if(!dark){c.fillStyle=ACC[sh%4];c.globalAlpha=.8;c.fillRect(-L*.08,-hh*.85,L*.07,hh*1.7);if(sh%2)c.fillRect(L*.12,-hh*.6,L*.04,hh*1.2);c.globalAlpha=1;
  c.fillStyle='#fff';c.beginPath();c.arc(L*.3,-hh*.2,Math.max(2,hh*.28),0,7);c.fill();c.fillStyle='#101a2b';c.beginPath();c.arc(L*.31,-hh*.2,Math.max(1,hh*.14),0,7);c.fill();
  if(RN.indexOf(f.rarity)>=3){c.strokeStyle=RC[f.rarity];c.lineWidth=2;c.beginPath();c.ellipse(0,0,L*.45,hh,0,0,7);c.stroke()}}
 c.restore()}
const fishLen=w=>cl(34+Math.cbrt(w)*20,34,130);

/* ===== game state ===== */
const G={st:'idle',pw:0,pd:1,t:0,cx:0,bt:0,bw:1,f:null,ten:0,sta:100,dist:100,over:0,surge:0,sn:2,pump:0,reel:false,shake:0,rip:[],par:[],msgT:0,time:0,bait:null,pull:20};
const cv=$('#cv'),c=cv.getContext('2d'),M=$('#modal'),busy=()=>!M.hidden;
const say=(t,s=2)=>{const m=$('#msg');m.textContent=t;m.hidden=!t;G.msgT=s};
const tip=()=>({x:320,y:240+(G.st==='fight'?G.ten*.35:0)});
const reset=()=>{G.st='idle';G.f=null;G.reel=false};

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
 tod=TODS[Math.floor(Math.random()*3)];G.cx=cl(340+60+G.pw*(2+R().cast_power*.03),380,900);G.st='cast';G.t=0;beep(300,.15,'sawtooth');save()}
function strike(){
 if(G.st==='wait'){say('Terlalu cepat!');reset();return}
 if(G.st!=='bite')return;
 const ctl=R().control,ideal=G.t/G.bw>.08&&G.t/G.bw<.75,diff=RN.indexOf(G.f.rarity)*6+Math.min(10,G.f.weight/4),ch=cl(40+ctl*.25+HK().hook_bonus-diff+(ideal?15:-25),5,95);
 if(Math.random()*100<ch){G.st='fight';G.ten=20;G.sta=100;G.dist=100;G.over=0;G.surge=0;G.sn=rnd(1.5,3);G.pump=0;
  const r=G.f.weight/(LN().strength_kg*1.2),agg=/cepat|lincah|meledak|sangat|agresif|lompatan|ekstrem|kuat|boss|event/i.test(G.f.behavior)?1.3:1;
  G.pull=cl((12+30*Math.min(r,2))*agg,10,85);G.rip.push({x:G.cx,r:4,a:1});beep(700,.12);say('TERKAIT! TAHAN REEL',1.2)}
 else{say('Strike meleset. Ikan lepas.');beep(150,.2);reset()}}
function pump(){if(G.st!=='fight'||G.pump>0||G.sta>55)return;G.ten=Math.min(100,G.ten+18);G.dist-=7;G.sta-=6;G.pump=1;beep(500,.06)}
const burst=(x,y,col,n)=>{if(!S.opt.fx)n=Math.ceil(n/4);for(let i=0;i<n;i++)G.par.push({x,y,vx:rnd(-160,160),vy:rnd(-260,-40),l:rnd(.5,1.1),c:col,s:rnd(3,7)})};

function update(dt){
 G.time+=dt;
 if(G.msgT>0&&(G.msgT-=dt)<=0)$('#msg').hidden=true;
 if(G.st==='charge'){G.pw+=G.pd*110*dt;if(G.pw>=100||G.pw<=0){G.pd*=-1;G.pw=cl(G.pw,0,100)}}
 else if(G.st==='cast'){G.t+=dt;if(G.t>=.7){G.st='wait';G.t=0;G.bt=rnd(2,6)*(G.bait?.7:1);burst(G.cx,330,'#dfeaf2',14);G.rip.push({x:G.cx,r:4,a:1});beep(220,.1,'triangle')}}
 else if(G.st==='wait'){G.t+=dt;if(G.t>=G.bt){G.st='bite';G.t=0;G.bw=1.1+R().control*.012;G.f=pick();for(let i=0;i<3;i++)setTimeout(()=>G.rip.push({x:G.cx,r:4,a:1}),i*180);beep(900,.1);say('IKAN MENGGIGIT! TEKAN STRIKE',G.bw)}}
 else if(G.st==='bite'){G.t+=dt;if(G.t>G.bw){say('Terlambat. Ikan pergi.');reset()}}
 else if(G.st==='fight'){
  const r=R(),rl=RL(),sp=r.reel_speed+rl.reel_speed_bonus;G.pump=Math.max(0,G.pump-dt);G.sn-=dt;
  if(G.surge>0)G.surge-=dt;else if(G.sn<=0){G.surge=.8;G.sn=rnd(2,4);beep(200,.2,'sawtooth')}
  const sg=G.surge>0?1.7:1;
  if(G.reel){G.ten+=(G.pull*.5*sg+10-r.control*.1-rl.drag_bonus*.15)*dt;G.dist-=(8+sp*.25)*dt*(.4+.6*(1-G.sta/100));G.sta-=(6+r.control*.05)*dt}
  else{G.ten-=28*dt;G.dist+=G.pull*.12*dt*(G.sta/100+.3);if(G.surge>0)G.ten+=8*dt}
  G.sta=Math.max(0,G.sta-2*dt);G.ten=cl(G.ten,0,100);
  if(G.ten>85&&Math.floor(G.time*6)%2===0)beep(1000,.03);
  G.over=G.ten>=100?G.over+dt:0;
  if(G.over>=1.2){S.stats.broke++;save();say('SENAR PUTUS!',2.5);beep(100,.4,'sawtooth');reset()}
  else if(G.dist>=130){say('Ikan kabur.');reset()}
  else if(G.dist<=0)finish()}
 G.rip.forEach(o=>{o.r+=40*dt;o.a-=.9*dt});G.rip=G.rip.filter(o=>o.a>0);
 G.par.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=500*dt;p.l-=dt});G.par=G.par.filter(p=>p.l>0);
 if(G.shake>0)G.shake-=dt;
 hud()}

function finish(){
 const f=G.f,val=Math.max(1,Math.round(f.v*Math.pow(f.weight/f.w,.7))),isNew=!S.dex[f.id],d=S.dex[f.id]||(S.dex[f.id]={n:0,best:0}),rec=f.weight>d.best;
 d.n++;if(rec)d.best=f.weight;S.stats.caught++;S.xp+=Math.round(5+f.v/10)+(isNew?30:0);
 let up=false;while(S.xp>=S.lv*120){S.xp-=S.lv*120;S.lv++;up=true}
 const ix=RN.indexOf(f.rarity);burst(560,300,RC[f.rarity],10+ix*14);beep(500+ix*120,.25,'triangle');
 if(ix>=4&&S.opt.shake)G.shake=.5;G.st='result';G.reel=false;save();
 const catchObj={id:f.id,w:f.weight,len:f.len,val,r:f.rarity},b=h('div');
 const mini=h('canvas');mini.width=260;mini.height=110;drawFish(mini.getContext('2d'),f,140,55,Math.min(200,f.len*1.6+60));
 b.append(mini,h('div','big',f.name),h('div','',`<span class="tag" style="background:${RC[f.rarity]}">${f.rarity.toUpperCase()}</span> ${isNew?'<b>SPESIES BARU</b> ':''}${rec&&!isNew?'<b>REKOR BERAT</b>':''}`),
  h('div','row',`<span>Panjang ${f.len} cm</span><span>Berat ${f.weight} kg</span><span>Nilai ${val} koin</span>`),up?h('div','',`<b>LEVEL NAIK: ${S.lv}</b>`):h('span'));
 const bs=h('div','btns');
 bs.append(btn('JUAL',()=>{S.coins+=val;save();closeM();reset()}),btn('SIMPAN',()=>{S.inv.push(catchObj);save();closeM();reset()}),btn('LEPAS',()=>{S.xp+=2;save();closeM();reset()}));
 b.append(bs);modal('Tangkapan',b)}

/* ===== UI ===== */
function modal(t,b){M.innerHTML='';const p=h('div','panel');p.append(h('h2','',t),b);M.append(p);M.hidden=false}
const closeM=()=>{M.hidden=true;M.innerHTML=''};
const tabsBar=(names,cur,fn)=>{const t=h('div','tabs');names.forEach(n=>t.append(btn(n[1],()=>fn(n[0]),n[0]===cur?'on':'')));return t};
function home(){const b=h('div'),s=h('div','btns');
 b.append(h('p','',`Level ${S.lv} | ${S.coins} koin | Tertangkap ${S.stats.caught} | Senar putus ${S.stats.broke}`));
 s.append(btn('MAIN',closeM),btn('LOKASI',locs),btn('KOLEKSI',dex),btn('TOKO',()=>shop('rods')),btn('PENGATURAN',opts));b.append(s);modal('Tidal Tales: Fishing Adventure',b)}
function locs(){const b=h('div');LOCS.forEach((l,i)=>{const r=h('div','row',`<span><b>${l.n}</b><small>Buka di level ${l.lv}</small></span>`);r.append(btn(S.loc===i?'DIPILIH':S.lv>=l.lv?'PILIH':'TERKUNCI',()=>{S.loc=i;save();closeM()},S.loc===i?'on':''));r.lastChild.disabled=S.lv<l.lv;b.append(r)});b.append(btn('KEMBALI',home));modal('Pilih Lokasi',b)}
function dex(){const b=h('div'),g=h('div','grid'),n=Object.keys(S.dex).length;b.append(h('p','',`Ditemukan ${n} / ${FISH.length}`));
 FISH.forEach(f=>{const d=S.dex[f.id],cd=h('div','card'),m=h('canvas');m.width=130;m.height=60;drawFish(m.getContext('2d'),f,70,30,90,0,!d);cd.append(m);
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
 const f1=$('#f1'),f2=$('#f2'),f3=$('#f3');
 if(G.st==='bite'){$('#gl1').textContent='WAKTU STRIKE';f1.style.width=(100-G.t/G.bw*100)+'%';f1.className=''}else{$('#gl1').textContent='POWER LEMPAR';f1.style.width=(G.st==='charge'?G.pw:0)+'%';f1.className=G.pw>80?'warn':''}
 f2.style.width=G.ten+'%';f2.className=G.ten>85?'bad':G.ten>65?'warn':'';f3.style.width=(G.st==='fight'?G.sta:0)+'%';
 const s=G.st;$('#bCast').hidden=!(s==='idle'||s==='charge');$('#bStrike').hidden=!(s==='wait'||s==='bite');$('#bReel').hidden=$('#bPump').hidden=s!=='fight'}
function draw(){
 const L=LOCS[S.loc],W=960,H=540,t=tip();c.save();
 if(G.shake>0)c.translate(rnd(-5,5),rnd(-5,5));
 c.fillStyle=L.sky;c.fillRect(0,0,W,250);c.fillStyle=L.wat;c.fillRect(0,250,W,H-250);
 c.fillStyle=L.bank;c.fillRect(0,236,W,16);
 c.strokeStyle='#ffffff30';c.lineWidth=2;for(let i=0;i<14;i++){const y=270+i*20,x=(i*137+G.time*18*(i%2?1:-1))%W;c.beginPath();c.moveTo((x+W)%W,y);c.lineTo((x+W)%W+40,y);c.stroke()}
 if(tod!=='siang'){c.fillStyle=tod==='malam'?'#0a1e4a73':'#c85a2833';c.fillRect(0,0,W,H)}
 if(G.st==='fight'||G.st==='bite'){}
 c.fillStyle='#6b4f33';c.fillRect(0,340,270,18);c.fillStyle='#4c3823';[20,120,230].forEach(x=>c.fillRect(x,358,12,90));
 c.fillStyle='#2f4858';c.fillRect(135,282,28,58);c.fillStyle='#e0b48a';c.beginPath();c.arc(149,270,13,0,7);c.fill();c.fillStyle='#e9a23b';c.fillRect(134,256,30,8);
 c.strokeStyle='#3a2a1a';c.lineWidth=5;c.beginPath();c.moveTo(165,310);c.quadraticCurveTo(240,270,t.x,t.y);c.stroke();
 let bx=t.x,by=335;
 if(G.st==='cast'){const k=G.t/.7;bx=t.x+(G.cx-t.x)*k;by=t.y+(335-t.y)*k-Math.sin(k*Math.PI)*90}
 else if(['wait','bite'].includes(G.st)){bx=G.cx;by=335+(G.st==='bite'?9:Math.sin(G.time*2)*2)}
 else if(G.st==='fight'){bx=t.x+(G.cx-t.x)*G.dist/100;by=335}
 else if(G.st==='charge'){bx=t.x;by=t.y+50}
 G.rip.forEach(o=>{c.strokeStyle=`rgba(255,255,255,${Math.max(0,o.a)})`;c.lineWidth=2;c.beginPath();c.ellipse(o.x,338,o.r,o.r*.3,0,0,7);c.stroke()});
 let ex=bx,ey=by;
 if(G.st==='fight'&&G.f){const fx=bx+25,fy=by+55+Math.sin(G.time*5)*(G.surge>0?18:6),sz=fishLen(G.f.weight);drawFish(c,G.f,fx,fy,sz,G.surge>0?-.3:Math.sin(G.time*4)*.1);ex=fx+sz*.4;ey=fy}
 c.strokeStyle='#ffffffcc';c.lineWidth=G.ten>85?3:1.5;c.beginPath();c.moveTo(t.x,t.y);c.lineTo(ex+(G.ten>85?Math.sin(G.time*60)*2:0),ey);c.stroke();
 if(G.st!=='fight'){c.fillStyle='#d1493f';c.beginPath();c.arc(bx,by,8,Math.PI,0);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(bx,by,8,0,Math.PI);c.fill()}
 G.par.forEach(p=>{c.fillStyle=p.c;c.globalAlpha=Math.min(1,p.l*2);c.fillRect(p.x,p.y,p.s,p.s)});c.globalAlpha=1;c.restore()}

let last=0;function loop(ts){const dt=Math.min(.05,(ts-last)/1000||0);last=ts;if(!busy()||G.st==='result')update(dt);draw();requestAnimationFrame(loop)}
const press=(e,fn)=>{e.addEventListener('pointerdown',ev=>{ev.preventDefault();fn(true)});['pointerup','pointerleave','pointercancel'].forEach(n=>e.addEventListener(n,()=>fn(false)))};
press($('#bCast'),d=>d?startCharge():doCast());press($('#bReel'),d=>{G.reel=d&&G.st==='fight'});
$('#bStrike').onclick=strike;$('#bPump').onclick=pump;$('#menuBtn').onclick=()=>{if(G.st==='idle')home()};
addEventListener('keydown',e=>{if(e.repeat||busy())return;if(e.code==='Space'){e.preventDefault();G.st==='idle'?startCharge():G.st==='fight'?G.reel=true:strike()}if(e.code==='KeyP')pump()});
addEventListener('keyup',e=>{if(e.code==='Space'){G.st==='charge'?doCast():G.reel=false}});

(async()=>{
 const [csv,gear]=await Promise.all([fetch(import.meta.env.BASE_URL+'data/fish_catalog.csv').then(r=>r.text()),fetch(import.meta.env.BASE_URL+'data/gear_catalog.json').then(r=>r.json())]);
 FISH=parseFish(csv);GEAR=gear;S=load();hud();home();requestAnimationFrame(loop)})();

if('serviceWorker' in navigator&&import.meta.env.PROD)addEventListener('load',()=>navigator.serviceWorker.register(import.meta.env.BASE_URL+'sw.js').catch(()=>{}));
