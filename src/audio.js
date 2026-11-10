// AUDIO TIDAL TALES: 100% file mp3 dari public/audio (tanpa suara sintetis).
// Semua efek di-decode di awal lalu dimainkan dengan fade masuk/keluar sangat cepat (anti klik, tanpa jeda).
let ac,master,sfxG,ambG,musG,reelG,duckG,priG,started=false,scene='game',mood='clear',tod='siang',depth=0,curKey=null,on={sound:true,music:true};
const BASE=((import.meta.env&&import.meta.env.BASE_URL)||'/')+'audio/',EXT='.mp3';
const VOL={music:.6,amb:.5,sfx:1,reel:.5};
const FI=.012,FO=.06;            // fade masuk / keluar efek (detik)
const XF=.18;                    // crossfade musik & ambience (detik): cepat, tidak ada jeda
// nama efek di kode -> nama file persis di public/audio
const SFX={cast:'cast',splash:'splash',hook:null,ok:'ok',fail:'fail',miss:'miss',escape:'escape',level:'level-up',thunder:'thunder',meteor:'meteor-jatuh',mut:null};
const CATCH=['catch-cammon-rare','catch-cammon-rare','catch-cammon-rare','catch-epic','catch-legend','catch-mytic','catch-secret'];
const SECRET_OK='secret-berhasil-dapat';
// suara penting (catch & secret): dinormalkan ke puncak penuh lalu dikuatkan, lewat bus sendiri + limiter => lantang
const PRI={'catch-cammon-rare':2.4,'catch-epic':2.4,'catch-legend':2,'catch-mytic':2,'catch-secret':2,[SECRET_OK]:2.4},PK={};
const SG={thunder:.3,'meteor-jatuh':.6};
const DUCK={'catch-cammon-rare':.3,'catch-epic':.25,'catch-legend':.2,'catch-mytic':.18,'catch-secret':.12,[SECRET_OK]:.12}; // musik & ambience mengecil sebentar saat suara penting bunyi
const MUSIC=['main','rain-music','storm','meteor','omen','fight','ride','aquarium'];
const AMB=['waves','rain','wind','night','under'];
const bad={},SB={},AB={},TR={};let live=[];
function ctx(){if(ac)return ac;const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;ac=new C();
 const cp=ac.createDynamicsCompressor();cp.threshold.value=-18;cp.knee.value=18;cp.ratio.value=4;cp.attack.value=.003;cp.release.value=.15;
 master=ac.createGain();master.gain.value=.95;master.connect(cp);cp.connect(ac.destination);
 duckG=ac.createGain();duckG.connect(master);sfxG=ac.createGain();sfxG.connect(master);ambG=ac.createGain();ambG.connect(duckG);musG=ac.createGain();musG.gain.value=0;musG.connect(duckG);
 reelG=ac.createGain();reelG.gain.value=0;reelG.connect(master);
 const lim=ac.createDynamicsCompressor();lim.threshold.value=-4;lim.knee.value=0;lim.ratio.value=20;lim.attack.value=.001;lim.release.value=.12;priG=ac.createGain();priG.connect(lim);lim.connect(ac.destination);return ac}
function fetchBuf(n){return fetch(BASE+n+EXT).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()}).then(b=>new Promise((ok,no)=>{const p=ac.decodeAudioData(b,ok,no);if(p&&p.catch)p.catch(no)}))}
function loadAssets(){
 const sfxNames=[...new Set([...Object.values(SFX).filter(Boolean),...CATCH,SECRET_OK])];
 sfxNames.forEach(n=>fetchBuf(n).then(b=>{SB[n]=b;if(PRI[n]){let m=0;for(let c=0;c<b.numberOfChannels;c++){const d=b.getChannelData(c);for(let i=0;i<d.length;i++){const x=Math.abs(d[i]);if(x>m)m=x}}PK[n]=Math.min(20,.98/Math.max(m,.02))}}).catch(()=>{}));
 // ambience + suara reel (loop) via buffer agar mulus
 const loop=(n,dest,store)=>fetchBuf(n).then(b=>{const s=ac.createBufferSource(),g=ac.createGain();s.buffer=b;s.loop=true;g.gain.value=0;s.connect(g);g.connect(dest);s.start();store[n]=g;applyVol()}).catch(()=>{});
 setTimeout(()=>{AMB.forEach(n=>loop(n,ambG,AB));loop('fishing-reel',reelG,AB)},500)}
// efek: masuk cepat, keluar cepat. Efek lama yang masih bunyi lain ikut di-fade supaya tidak numpuk/ada jeda
function play(n,vol=1,delay=0,fadeOthers=false){const b=SB[n];if(!b)return false;const T=ac.currentTime+delay,s=ac.createBufferSource(),g=ac.createGain(),d=b.duration;
 s.buffer=b;const pri=PRI[n]!==undefined,v=pri?vol*PK[n]*PRI[n]:vol*(SG[n]??1)*VOL.sfx;g.gain.setValueAtTime(0,T);g.gain.linearRampToValueAtTime(v,T+FI);
 const fo=Math.min(FO,d*.3);g.gain.setValueAtTime(v,Math.max(T+FI,T+d-fo));g.gain.linearRampToValueAtTime(0,T+d);
 if(fadeOthers)live.forEach(o=>{try{o.g.gain.cancelScheduledValues(T);o.g.gain.setValueAtTime(o.g.gain.value,T);o.g.gain.linearRampToValueAtTime(0,T+FO);o.s.stop(T+FO+.01)}catch{}});
 if(DUCK[n]!==undefined){const dg=duckG.gain;dg.cancelScheduledValues(T);dg.setTargetAtTime(DUCK[n],T,.03);dg.setTargetAtTime(1,T+d*.85,.25)}
 s.connect(g);g.connect(pri?priG:sfxG);s.start(T);s.stop(T+d+.02);const o={s,g};live.push(o);s.onended=()=>{live=live.filter(x=>x!==o)};return true}
export function sfx(n,a=0){try{sfx_(n,a)}catch(e){console.warn('sfx',e)}}
function sfx_(n,a){if(!on.sound||!ctx())return;
 if(n==='catch'){const k=CATCH[Math.max(0,Math.min(6,a))];play(k,1,0,true);return}
 if(n==='secretok'){play(SECRET_OK,1,0,true);return}
 const f=SFX[n];if(f)play(f)}
function applyVol(){if(!started)return;const T=ac.currentTime;
 for(const k in TR)TR[k].g.gain.setTargetAtTime(TR[k].k===curKey&&on.music?1:0,T,XF);
 musG.gain.setTargetAtTime(on.music?VOL.music:0,T,XF);applyAmb()}
// ambience berlapis mengikuti cuaca, waktu, kedalaman, scene
function applyAmb(){if(!started)return;const T=ac.currentTime,u=depth>.8||scene==='aqua',w={rain:.55,storm:.7,omen:.2,meteor:.3}[mood]||0,wd={storm:.6,omen:.4,rain:.2,meteor:.25}[mood]||.08;
 const tg={waves:u?0:.55,rain:u?w*.25:w,wind:u?0:wd,night:(tod==='malam'&&!u)?.4:0,under:u?(scene==='aqua'?.35:.6):0};
 for(const k of AMB)if(AB[k])AB[k].gain.setTargetAtTime(on.sound?(tg[k]||0)*VOL.amb*2:0,T,XF);
 if(AB['fishing-reel'])AB['fishing-reel'].gain.setTargetAtTime(on.sound&&scene==='fight'?VOL.reel:0,T,.08)}
// musik latar: pilih berkas sesuai scene/cuaca
function want(){const L=[];if(scene==='ride')L.push('ride');else if(scene==='aqua')L.push('aquarium');if(mood==='omen')L.push('omen');if(scene==='fight')L.push('fight');
 if(mood==='rain')L.push('rain-music');else if(mood==='storm'||mood==='meteor')L.push(mood);L.push('main');return L.find(k=>MUSIC.includes(k)&&!bad[k])||null}
function trk(k){let t=TR[k];if(t)return t;const el=new Audio();el.loop=true;el.preload='auto';el.src=BASE+k+EXT;const g=ac.createGain();g.gain.value=0;ac.createMediaElementSource(el).connect(g);g.connect(musG);
 el.addEventListener('error',()=>{bad[k]=true;if(curKey===k){curKey=null;retarget()}});return TR[k]={el,g,k}}
function retarget(){if(!started)return;const k=on.music?want():null,T=ac.currentTime;if(k===curKey)return;
 const old=curKey&&TR[curKey];if(old){old.g.gain.cancelScheduledValues(T);old.g.gain.setTargetAtTime(0,T,XF);setTimeout(()=>{if(curKey!==old.k)old.el.pause()},1500)}
 curKey=k;if(k){const t=trk(k);t.el.play().catch(()=>{});t.g.gain.cancelScheduledValues(T)}applyVol()}
export function unlock(){if(!ctx())return;if(ac.state==='suspended')ac.resume();if(!started){started=true;loadAssets();applyVol();retarget()}}
export function setMood(m){mood=m;applyVol();retarget()}
export function setOpt(o){on.sound=o.sound!==false;on.music=o.music!==false;applyVol();retarget()}
export function setScene(sc){if(sc===scene)return;scene=sc;retarget();applyAmb()}
export function leaveFight(){if(scene==='fight')setScene('game')}
export function setTod(t){if(t===tod)return;tod=t;applyAmb()}
export function setDepth(d){if((d>.8)===(depth>.8)){depth=d;return}depth=d;applyAmb()}
if(typeof document!=='undefined')document.addEventListener('visibilitychange',()=>{if(!ac)return;if(document.hidden)ac.suspend();else if(started)ac.resume()});
