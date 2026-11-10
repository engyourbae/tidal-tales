let ac,master,sfxG,musG,rev,nb,rainG,started=false,nextT=0,stepN=0,barN=0,mel=2,mood='clear',on={sound:true,music:true};
// ===== LAPISAN FILE AUDIO (opsional) =====
// Taruh file di public/audio/music, public/audio/amb, public/audio/sfx. File yang belum ada otomatis diganti suara sintetis bawaan.
const BASE=((import.meta.env&&import.meta.env.BASE_URL)||'/')+'audio/',EXT='.mp3';
const CFG={
 music:['main','rain','storm','meteor','omen','fight','ride','aquarium'], // public/audio/music/<nama>.mp3
 amb:['waves','rain','wind','night','under'],                            // public/audio/amb/<nama>.mp3 (loop mulus)
 sfx:{cast:1,splash:1,bite:1,hook:1,tap:1,prompt:1,ok:1,fail:1,miss:1,escape:1,catch:1,catch_rare:1,mut:1,level:1,thunder:1,meteor:1,ui:1}, // angka = jumlah varian (nama.mp3, nama_2.mp3, ...)
 vol:{music:.6,amb:.5,sfx:1}
};
const SG={tap:.7,ui:.5,thunder:.9}; // penyesuaian volume per efek (default 1)
let scene='game',tod='siang',depth=0,fileMusic=false,curKey=null,ambG,fmG;const bad={},SB={},AB={},TR={};
const SC={clear:[440,523.25,587.33,659.25,783.99,880],storm:[220,261.63,293.66,329.63,392,440],meteor:[523.25,587.33,659.25,783.99,880,1046.5],omen:[293.66,311.13,392,415.3,293.66,311.13]};
const CLR=[[220,261.63,329.63],[174.61,220,261.63],[261.63,329.63,392],[196,246.94,293.66]];
const CH={clear:CLR,rain:CLR,storm:[[220,261.63,329.63],[146.83,174.61,220],[174.61,220,261.63],[164.81,207.65,246.94]],meteor:[[261.63,329.63,392],[196,246.94,293.66],[220,261.63,329.63],[174.61,220,261.63]],omen:[[73.42,77.78,103.83],[73.42,77.78,103.83],[73.42,77.78,103.83],[73.42,77.78,103.83]]};
const BS={clear:[110,87.31,130.81,98],rain:[110,87.31,130.81,98],storm:[110,73.42,87.31,82.41],meteor:[130.81,98,110,87.31],omen:[36.7,36.7,38.9,36.7]};
function ctx(){if(ac)return ac;const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;ac=new C();
 const cp=ac.createDynamicsCompressor();cp.threshold.value=-20;cp.knee.value=18;cp.ratio.value=5;cp.attack.value=.005;cp.release.value=.2;
 master=ac.createGain();master.gain.value=.9;master.connect(cp);cp.connect(ac.destination);
 sfxG=ac.createGain();sfxG.gain.value=.7;sfxG.connect(master);musG=ac.createGain();musG.gain.value=0;musG.connect(master);
 const n=Math.floor(ac.sampleRate*2.6),ir=ac.createBuffer(2,n,ac.sampleRate);for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,3.4)}
 rev=ac.createConvolver();rev.buffer=ir;const rg=ac.createGain();rg.gain.value=.32;rev.connect(rg);rg.connect(master);
 nb=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate);const nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;return ac}
function tone(f,t,d,o={}){const c=ac,g=c.createGain(),os=c.createOscillator();os.type=o.type||'sine';os.frequency.setValueAtTime(f,t);if(o.glide)os.frequency.exponentialRampToValueAtTime(Math.max(20,f*o.glide),t+d*.8);
 const v=o.vol??.2,a=o.a??.006;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+d);
 let n=os;if(o.lp){const fl=c.createBiquadFilter();fl.type='lowpass';fl.frequency.value=o.lp;os.connect(fl);n=fl}n.connect(g);g.connect(o.dest||sfxG);
 if(o.rev){const s=c.createGain();s.gain.value=o.rev;g.connect(s);s.connect(rev)}os.start(t);os.stop(t+d+.05)}
function noise(t,d,o={}){const c=ac,s=c.createBufferSource();s.buffer=nb;s.loop=true;const fl=c.createBiquadFilter();fl.type=o.type||'lowpass';fl.Q.value=o.q||.7;fl.frequency.setValueAtTime(o.f||800,t);if(o.f2)fl.frequency.exponentialRampToValueAtTime(o.f2,t+d);
 const g=c.createGain(),v=o.vol??.2,a=o.a??.01;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(fl);fl.connect(g);g.connect(o.dest||sfxG);s.start(t,Math.random());s.stop(t+d+.05)}
const bell=(f,t,v=.12,d=1.6)=>{tone(f,t,d,{vol:v,rev:.6});tone(f*2.76,t,d*.5,{vol:v*.25,rev:.5});tone(f*5.4,t,d*.25,{vol:v*.1})};
const pluck=(f,t,v=.1,dest)=>{tone(f,t,.7,{type:'triangle',vol:v,lp:2400,rev:.5,dest});tone(f*2,t,.3,{vol:v*.3,dest})};
export function sfx(n,a=0){if(!on.sound||!ctx())return;const hit=playSample(n,a);if(n==='catch'&&a>=3)playSample('catch_rare',0);if(hit)return;const t=ac.currentTime+.01;
 switch(n){
  case 'cast':noise(t,.4,{type:'bandpass',f:500,f2:2600,q:1.2,vol:.14,a:.05});tone(220,t,.3,{glide:2,vol:.05,type:'triangle'});break;
  case 'splash':noise(t,.55,{f:2200,f2:260,vol:.22,a:.01});tone(150,t,.18,{glide:.4,vol:.18});break;
  case 'bite':tone(560,t,.16,{glide:.55,vol:.2,rev:.2});tone(740,t+.13,.16,{glide:.55,vol:.16,rev:.2});break;
  case 'hook':tone(440,t,.14,{glide:2,vol:.18,type:'triangle'});bell(1320,t+.05,.08,.8);noise(t,.08,{type:'highpass',f:3000,vol:.05});break;
  case 'tap':{const sc=[0,2,4,7,9,12,14,16],i=Math.min(7,Math.floor(a*8));pluck(392*Math.pow(2,sc[i]/12),t,.12);noise(t,.03,{type:'highpass',f:4000,vol:.03});break}
  case 'prompt':tone(330,t,.12,{type:'triangle',vol:.14});tone(330,t+.16,.12,{type:'triangle',vol:.14});break;
  case 'ok':bell(784,t,.12,1);bell(1175,t+.08,.1,1.2);break;
  case 'fail':tone(190,t,.28,{glide:.6,type:'triangle',vol:.2,lp:900});noise(t,.2,{f:500,vol:.08});break;
  case 'miss':tone(300,t,.28,{glide:.6,type:'triangle',vol:.14,lp:1200});break;
  case 'escape':tone(392,t,.3,{type:'triangle',vol:.14,lp:1500});tone(294,t+.18,.4,{type:'triangle',vol:.14,lp:1500});break;
  case 'catch':{const P=[523.25,587.33,659.25,783.99,880,1046.5,1174.7],k=3+a;for(let i=0;i<k;i++)bell(P[i%7]*(i>=7?2:1),t+i*.09,.1+a*.012,1.4);if(a>=3)[261.63,329.63,392].forEach(f=>tone(f,t,2.4,{vol:.05,a:.3,lp:900,rev:.5}));if(a>=4)noise(t,1.2,{type:'highpass',f:5000,vol:.04,a:.4});break}
  case 'mut':{for(let i=0;i<7;i++)bell([1046.5,1318.5,1568,1760,2093][i%5],t+i*.11,.07,1.8);tone(55,t,3,{vol:.28,a:.7,rev:.4});noise(t,2.4,{f:200,f2:900,vol:.08,a:.8});break}
  case 'level':[523.25,659.25,783.99,1046.5].forEach((f,i)=>bell(f,t+i*.1,.12,1.4));break;
  case 'thunder':noise(t,2.2,{f:380,f2:70,vol:.55,a:.08,q:.5});tone(48,t,1.8,{vol:.3,a:.1});break;
  case 'ui':tone(1320,t,.04,{type:'triangle',vol:.05});break;
  case 'meteor':noise(t,1,{f:1100,f2:110,vol:.35,a:.03});tone(95,t,.6,{glide:.4,vol:.3});break}}
function sched(){if(!ac||!on.music||fileMusic)return;if(nextT<ac.currentTime)nextT=ac.currentTime+.1;const bd=mood==='omen'?1:mood==='storm'?.9:.8333,e=bd/2;
 while(nextT<ac.currentTime+.6){const m=CH[mood]?mood:'clear',ch=CH[m][barN%4],st=stepN%8;
  if(st===0){ch.forEach(f=>{tone(f,nextT,bd*3.9,{vol:.05,a:.9,lp:m==='storm'?650:m==='omen'?400:1000,dest:musG,rev:.5});tone(f*1.004,nextT,bd*3.9,{type:'triangle',vol:.03,a:1.1,lp:800,dest:musG})});tone(BS[m][barN%4],nextT,bd*1.8,{vol:.1,a:.04,lp:300,dest:musG})}
  if(st===4&&m!=='omen')tone(BS[m][barN%4],nextT,bd*1.4,{vol:.07,a:.04,lp:300,dest:musG});
  if(m==='omen'&&st%4===0){tone(40,nextT,.35,{vol:.2,a:.01,dest:musG});tone(40,nextT+.28,.3,{vol:.14,a:.01,dest:musG})}
  const pr={clear:.42,rain:.3,storm:.22,meteor:.6,omen:.1}[m]||.3;
  if(Math.random()<pr&&st!==7){const s=SC[m]||SC.clear;mel=Math.max(0,Math.min(s.length-1,mel+Math.round((Math.random()-.5)*3)));const f=s[mel];
   if(m==='omen')tone(f,nextT,2.2,{vol:.05,a:.5,lp:900,dest:musG,rev:.6});else{pluck(f,nextT,.065,musG);if(m==='meteor')bell(f*2,nextT,.03,1.6)}}
  nextT+=e;stepN++;if(stepN%8===0)barN++}}
function startAmb(){const s=ac.createBufferSource();s.buffer=nb;s.loop=true;const fl=ac.createBiquadFilter();fl.type='lowpass';fl.frequency.value=520;const g=ac.createGain();g.gain.value=.02;
 const lf=ac.createOscillator();lf.frequency.value=.09;const lg=ac.createGain();lg.gain.value=.014;lf.connect(lg);lg.connect(g.gain);s.connect(fl);fl.connect(g);g.connect(musG);s.start();lf.start();
 rainG=ac.createGain();rainG.gain.value=0;const r=ac.createBufferSource();r.buffer=nb;r.loop=true;const hp=ac.createBiquadFilter();hp.type='highpass';hp.frequency.value=1400;const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=7500;r.connect(hp);hp.connect(lp);lp.connect(rainG);rainG.connect(master);r.start()}
function applyVol(){if(!started)return;const T=ac.currentTime;musG.gain.setTargetAtTime(on.music&&!fileMusic?.26:0,T,.4);fmG.gain.setTargetAtTime(on.music?CFG.vol.music:0,T,.4);rainG.gain.setTargetAtTime(on.sound&&!AB.rain?({rain:.05,storm:.09,omen:.03}[mood]||0):0,T,.6);applyAmb()}
function fetchBuf(path){return fetch(BASE+path+EXT).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()}).then(b=>new Promise((ok,no)=>ac.decodeAudioData(b,ok,no)))}
function loadAssets(){ambG=ac.createGain();ambG.connect(master);fmG=ac.createGain();fmG.gain.value=0;fmG.connect(master);
 Object.entries(CFG.sfx).forEach(([n,c])=>{for(let i=1;i<=c;i++)fetchBuf('sfx/'+n+(i>1?'_'+i:'')).then(b=>(SB[n]=SB[n]||[]).push(b)).catch(()=>{})});
 setTimeout(()=>CFG.amb.forEach(n=>fetchBuf('amb/'+n).then(b=>{const src=ac.createBufferSource(),g=ac.createGain();src.buffer=b;src.loop=true;g.gain.value=0;src.connect(g);g.connect(ambG);src.start();AB[n]=g;applyVol()}).catch(()=>{})),800)}
function playSample(n,a){const L=SB[n];if(!L||!L.length)return false;const src=ac.createBufferSource(),g=ac.createGain();src.buffer=L[Math.floor(Math.random()*L.length)];
 let rate=.96+Math.random()*.08;if(n==='tap'){const sc=[0,2,4,7,9,12,14,16],i=Math.min(7,Math.floor(a*8));rate=Math.pow(2,sc[i]/12)*.9}
 src.playbackRate.value=rate;g.gain.value=(SG[n]===undefined?1:SG[n])*CFG.vol.sfx;src.connect(g);g.connect(sfxG);src.start();return true}
// ambience berlapis: ombak, hujan, angin, malam, bawah air (halus naik-turun mengikuti cuaca, waktu, kedalaman, dan scene)
function applyAmb(){if(!ambG)return;const T=ac.currentTime,u=depth>.8||scene==='aqua',w={rain:.55,storm:.7,omen:.2,meteor:.3}[mood]||0,wd={storm:.6,omen:.4,rain:.2,meteor:.25}[mood]||.08;
 const tg={waves:u?0:.55,rain:u?w*.25:w,wind:u?0:wd,night:(tod==='malam'&&!u)?.4:0,under:u?(scene==='aqua'?.35:.6):0};
 for(const k in AB)AB[k].gain.setTargetAtTime(on.sound?(tg[k]||0)*CFG.vol.amb*2:0,T,.9)}
// musik latar: pilih berkas sesuai scene/cuaca, crossfade halus; kalau berkas tidak ada -> pakai yang berikutnya -> terakhir musik sintetis
function want(){const L=[];if(scene==='ride')L.push('ride');else if(scene==='aqua')L.push('aquarium');if(mood==='omen')L.push('omen');if(scene==='fight')L.push('fight');if(mood==='storm'||mood==='meteor'||mood==='rain')L.push(mood);L.push('main');return L.find(k=>CFG.music.includes(k)&&!bad[k])||null}
function trk(k){let t=TR[k];if(t)return t;const el=new Audio();el.loop=true;el.preload='auto';el.src=BASE+'music/'+k+EXT;const g=ac.createGain();g.gain.value=0;ac.createMediaElementSource(el).connect(g);g.connect(fmG);
 el.addEventListener('error',()=>{bad[k]=true;if(curKey===k){curKey=null;fileMusic=false;retarget()}});el.addEventListener('playing',()=>{if(curKey===k){fileMusic=true;applyVol()}});return TR[k]={el,g,k}}
function retarget(){if(!started)return;const k=on.music?want():null,T=ac.currentTime;if(k===curKey)return;
 if(curKey&&TR[curKey]){const o=TR[curKey];o.g.gain.cancelScheduledValues(T);o.g.gain.setTargetAtTime(0,T,.7);setTimeout(()=>{if(curKey!==o.k)o.el.pause()},3500)}
 curKey=k;fileMusic=false;if(k){const t=trk(k);t.el.play().catch(()=>{});t.g.gain.cancelScheduledValues(T);t.g.gain.setTargetAtTime(1,T,.9)}applyVol()}
export function unlock(){if(!ctx())return;if(ac.state==='suspended')ac.resume();if(!started){started=true;startAmb();loadAssets();nextT=ac.currentTime+.2;setInterval(sched,150);applyVol();retarget()}}
export function setMood(m){mood=m;applyVol();retarget()}
export function setOpt(o){on.sound=o.sound!==false;on.music=o.music!==false;applyVol();retarget()}
export function setScene(sc){if(sc===scene)return;scene=sc;retarget();applyAmb()}
export function leaveFight(){if(scene==='fight')setScene('game')}
export function setTod(t){if(t===tod)return;tod=t;applyAmb()}
export function setDepth(d){if((d>.8)===(depth>.8)){depth=d;return}depth=d;applyAmb()}
if(typeof document!=='undefined')document.addEventListener('visibilitychange',()=>{if(!ac)return;if(document.hidden)ac.suspend();else if(started)ac.resume()});
