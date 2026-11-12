// Tidal Tales - Adaptive Graphics
// Empat profil (LOW / MEDIUM / HIGH / ULTRA) + mode AUTO. Modul ini TIDAK menyentuh gameplay:
// ia hanya menyimpan profil, mendeteksi perangkat, dan memutuskan naik/turun tier atas permintaan World.frame()
// (blok adaptive DPR / lowAuto yang sudah ada tetap menjadi satu-satunya pemantau FPS).
export const TIERS=['low','medium','high','ultra'];
export const TIER_LABEL={low:'LOW',medium:'MEDIUM',high:'HIGH',ultra:'ULTRA'};
// dpr: batas pixel ratio | aa: antialias saat renderer dibuat | part: pengali partikel | shadow: 0 mati, 1 = 1024 PCF, 2 = 2048 lembut
// caustic/rays: kekuatan efek cahaya air | deco: level dekorasi lingkungan | birds: jumlah burung | sway: ayunan vegetasi
// water: 0 air standar, 1 fresnel+kilau, 2 + busa | waterHz: laju update gelombang CPU | fish: detail geometri ikan (0..3)
// aura: cahaya model ikan langka | scales: sisik prosedural | rain: porsi garis hujan | amb: ikan ambient | trail: wake/bubble ikan | cine: efek sinematik tambahan
export const PROF={
 low:   {dpr:1.15,aa:1,part:.5, shadow:0,caustic:0, rays:0, deco:0,birds:0,sway:0, water:0,waterHz:20,fish:0,aura:0,scales:0,rain:.45,amb:3,trail:0,cine:0},
 medium:{dpr:1.5, aa:1,part:1,  shadow:0,caustic:.6,rays:.55,deco:1,birds:2,sway:.8,water:1,waterHz:30,fish:1,aura:1,scales:0,rain:.75,amb:5,trail:1,cine:1},
 high:  {dpr:1.75,aa:1,part:1.25,shadow:1,caustic:1, rays:1, deco:2,birds:4,sway:1, water:2,waterHz:45,fish:2,aura:1,scales:1,rain:1, amb:6,trail:1,cine:1},
 ultra: {dpr:2,   aa:1,part:1.6, shadow:2,caustic:1.35,rays:1.3,deco:3,birds:6,sway:1.15,water:2,waterHz:60,fish:3,aura:1,scales:1,rain:1,amb:8,trail:1,cine:1}};
const LS='tidal_tales_gq'; // kunci terpisah: tidak menyentuh data simpanan pemain
const rd=()=>{try{return JSON.parse(localStorage.getItem(LS))||{}}catch{return{}}};
const wr=o=>{try{localStorage.setItem(LS,JSON.stringify(o))}catch{}};
const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const isMobile=()=>{const ua=navigator.userAgent||'';return/Android|iPhone|iPad|iPod|Mobile/i.test(ua)||(navigator.maxTouchPoints>1&&/Macintosh/.test(ua))};
function gpuName(){try{const c=document.createElement('canvas'),g=c.getContext('webgl')||c.getContext('experimental-webgl');if(!g)return'';const e=g.getExtension('WEBGL_debug_renderer_info'),n=e?String(g.getParameter(e.UNMASKED_RENDERER_WEBGL)||''):'';const l=g.getExtension('WEBGL_lose_context');l&&l.loseContext();return n}catch{return''}}
// Skor perangkat sederhana -> tier awal. Hanya titik awal: tier akhir ditentukan FPS aktual.
export function detectScore(env){
 const{mobile,mem,cores,gpu}=env;let s=mobile?1.5:2.6;
 if(mem)s+=mem>=8?1:mem>=6?.5:mem<=3?-1:mem<=4?-.25:0;
 s+=cores>=8?.4:cores<=4?-.5:0;
 if(/Adreno\D*(7\d\d|8\d\d)|Mali-G(7[1-9]|[89]\d)|Immortalis|Xclipse|Apple (A1[5-9]|A[2-9]\d|M\d)/i.test(gpu))s+=1;
 else if(/Adreno\D*([2-5]\d\d)|Mali-(4|T)|Mali-G(3\d|5[12])|PowerVR|SGX|Vivante/i.test(gpu))s-=1;
 if(!mobile&&/NVIDIA|GeForce|RTX|GTX|Radeon (RX|Pro)|Arc/i.test(gpu))s+=.8;
 if(/SwiftShader|llvmpipe|Software|Basic Render/i.test(gpu))s=0;
 return s}
export const scoreTier=s=>TIERS[s<1.2?0:s<2.2?1:s<3.3?2:3];
export function detect(){let e={mobile:isMobile(),mem:navigator.deviceMemory||0,cores:navigator.hardwareConcurrency||4,gpu:gpuName()};const m=e.mobile;let t=scoreTier(detectScore(e));if(m&&t==='ultra')t='high';return{tier:t,mobile:m,gpu:e.gpu}}
export class Quality{
 // urlMode: 'low'|'medium'|'high'|'ultra' dari ?gq= (untuk uji); selain itu AUTO
 constructor(urlMode){const d=this.dev=detect(),sv=rd(),um=TIERS.includes(urlMode)?urlMode:null;
  this.url=!!um;this.mode=um||'auto';this.cap=d.mobile?2:3; // di HP, AUTO tidak naik ke ULTRA sendiri (panas/baterai); ULTRA tetap bisa dipilih manual
  const st=um||(TIERS.includes(sv.tier)?sv.tier:d.tier);this.tier=st;this.ceil=Math.min(this.cap,3);this.ver=0;this.onChange=null;this.log=[]}
 get p(){return PROF[this.tier]}
 get idx(){return TIERS.indexOf(this.tier)}
 get label(){return this.mode==='auto'?'AUTO ('+TIER_LABEL[this.tier]+')':TIER_LABEL[this.tier]}
 save(){if(this.mode==='auto')wr({tier:this.tier})}
 set(t,why){if(t===this.tier)return false;this.tier=t;this.ver++;this.log.push((why||'set')+':'+t);this.save();this.onChange&&this.onChange(this);return true}
 setMode(m){if(this.url)return;if(m==='auto'){this.mode='auto';const sv=rd();this.ceil=this.cap;this.tier=TIERS.includes(sv.tier)?sv.tier:this.dev.tier;this.ver++;this.onChange&&this.onChange(this)}
  else if(TIERS.includes(m)){this.mode=m;this.tier=m;this.ver++;this.onChange&&this.onChange(this)}}
 canDown(){return this.mode==='auto'&&this.idx>0}
 canUp(){return this.mode==='auto'&&this.idx<this.ceil}
 // dipanggil World saat FPS buruk menetap setelah adaptive DPR habis. Tier yang gagal tidak akan dicoba lagi di sesi ini.
 down(){if(!this.canDown())return false;this.ceil=Math.min(this.ceil,this.idx-1);return this.set(TIERS[this.idx-1],'down')}
 up(){if(!this.canUp())return false;return this.set(TIERS[this.idx+1],'up')}
 cycle(){const o=['auto',...TIERS],i=o.indexOf(this.mode==='auto'?'auto':this.tier);this.setMode(o[(i+1)%o.length])}}
export const clampQ=cl;
