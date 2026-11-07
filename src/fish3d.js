import * as THREE from 'three';
export const RN=['Common','Uncommon','Rare','Epic','Legendary','Mythic'];
export const RC={Common:'#7d8996',Uncommon:'#3f9e6e',Rare:'#3b73c9',Epic:'#7b4fb8',Legendary:'#c99512',Mythic:'#c2308a'};
const COLS=[['merah','#c0392b'],['oranye','#e07b39'],['emas','#d9a521'],['safir','#2a4fa8'],['biru','#3b73c9'],['hijau','#4a9a6a'],['cokelat','#7a5230'],['abu','#7b8794'],['perak','#b8c2cc'],['putih','#e8e4d8'],['cyan','#2bb5c9'],['kristal','#9ad7e6'],['zaitun','#7a8a3a'],['transparan','#a7c9d9'],['indigo','#3a3f7a'],['navy','#1f3a6e'],['galaksi','#2d2a6e']];
const ACC=['#eef2f7','#1b2433','#e9a23b','#2bb5c9'];
const hash=s=>[...s].reduce((a,c)=>a*31+c.charCodeAt(0)>>>0,7);
export const colorOf=f=>{const s=f.visual_brief.toLowerCase();return(COLS.find(c=>s.includes(c[0]))||[0,'#6b7b8c'])[1]};

export const MUT={albino:{n:'Albino',col:'#f1ece0',em:'#ffffff',ei:.15,eye:'#d1493f',m:1.6,c:'#c9c2ae'},emas:{n:'Emas',col:'#e0b020',em:'#e0b020',ei:.55,m:2.2,c:'#e0b020'},neon:{n:'Neon',col:'#2fd9b5',em:'#2fd9b5',ei:.9,m:2.8,c:'#1fb894'},bayangan:{n:'Bayangan',col:'#1c1c2a',em:'#7b4fb8',ei:.5,eye:'#ff4fb0',m:3.2,c:'#7b4fb8'},kosmik:{n:'Kosmik',col:'#33258a',em:'#c2308a',ei:.7,m:6,c:'#c2308a',orb:true}};
const prof=t=>t<0?.25+.75*Math.pow(Math.max(0,1+t),.8):1-.3*t*t;
const shp=(pts,rx=false)=>{const s=new THREE.Shape();pts.forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));s.closePath();const g=new THREE.ShapeGeometry(s);if(rx)g.rotateX(Math.PI/2);return g};
const bodyGeo=seg=>{const g=new THREE.SphereGeometry(1,seg[0],seg[1]),p=g.attributes.position;for(let i=0;i<p.count;i++){const k=prof(p.getX(i));p.setY(i,p.getY(i)*k);p.setZ(i,p.getZ(i)*k)}return g};
export function makeFish(f,dark=false,mut=null){
 const g=new THREE.Group(),sh=hash(f.id),n=f.name.toLowerCase(),br=f.visual_brief.toLowerCase(),rar=RN.indexOf(f.rarity),glow=!dark&&(rar>=3||!!mut),tr=/kaca|kristal/.test(n);
 const col=dark?'#1b2433':mut?mut.col:colorOf(f),acc=dark?'#1b2433':ACC[sh%4],fin=dark?'#1b2433':new THREE.Color(col).multiplyScalar(.82);
 const mt=(c,e=0)=>new THREE.MeshStandardMaterial({color:c,roughness:.5,metalness:.1,flatShading:true,side:THREE.DoubleSide,transparent:tr&&!dark,opacity:tr&&!dark?.7:1,emissive:mut?mut.em:glow?RC[f.rarity]:'#000000',emissiveIntensity:mut?(e?mut.ei:0):glow?e:0});
 const kind=/manta/.test(n)?'ray':/gurita/.test(n)?'octo':/belut|sidat|naga|leviathan/.test(n)?'eel':/paus/.test(n)?'whale':/hiu/.test(n)?'shark':/marlin|barracuda|tuna|toman|belida|arwana/.test(n)?'torp':/lele|patin|gabus/.test(n)?'cat':'fish';
 const D={fish:[.5,.21,.1],torp:[.5,.13,.09],eel:[.5,.05,.05],ray:[.32,.04,.3],octo:[.22,.22,.22],whale:[.5,.2,.17],shark:[.5,.14,.12],cat:[.5,.13,.14]}[kind];
 const sp=(w=10,hh=7)=>new THREE.SphereGeometry(1,w,hh),seg=/kristal/.test(n)?[5,4]:[12,9];
 const add=(geo,m,x,y,z,sx=1,sy=1,sz=1,p=g)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);p.add(o);return o};
 const u=g.userData={tails:[],fins:[],fr:.7,fa:.25},sy=kind==='fish'||kind==='cat'?D[1]/.2:Math.max(.35,D[1]/.13*.9),sc=pts=>pts.map(p=>[p[0],p[1]*sy]);
 add(kind==='octo'||kind==='ray'?sp(...seg):bodyGeo(seg),mt(col,.3),0,0,0,...D);
 const T=(pts,ax='y',rx=false)=>{const p=new THREE.Group();p.position.set(-D[0]*.9,0,0);g.add(p);add(shp(pts,rx),mt(sh%3?fin:acc,.3),0,0,0,1,1,1,p);u.tails.push({p,ph:0,ax})};
 const dors=(pts,x=0)=>add(shp(pts),mt(fin,.3),x,D[1]*.8,0);
 const pect=(pts,pf=1)=>{for(const s of[1,-1]){const q=new THREE.Group();q.position.set(D[0]*.28,-D[1]*.35,s*D[2]*.8);g.add(q);add(shp(pts,true),mt(fin,.3),0,0,0,pf,1,s*pf,q);u.fins.push(q)}};
 if(!dark&&kind!=='octo'&&kind!=='ray'){
  add(sp(10,6),mt('#e6ebf0'),.04,-D[1]*.55,0,D[0]*.7,D[1]*.5,D[2]*.85);
  add(new THREE.BoxGeometry(.015,.012,D[2]*1.1),mt('#1b2433'),D[0]*.93,-D[1]*.25,0);
  const band=(xs,c)=>xs.forEach(x=>{const k=prof(x/D[0]);add(new THREE.TorusGeometry(1,.07,5,16).rotateY(Math.PI/2),mt(c),x,0,0,1,D[1]*k*1.02,D[2]*k*1.02)});
  if(/pita/.test(br))band([-.18,.05,.27],'#eef2f7');if(/loreng/.test(br))band([-.25,-.08,.1,.28],'#2a2018');
  if(/pola|awan|bekas/.test(br))for(let k=0;k<4;k++){const x=-.28+k*.17;add(sp(6,5),mt(acc,.2),x,D[1]*prof(x/D[0])*.8,(k%2?1:-1)*D[2]*.35,.09,.03,.06)}}
 if(kind!=='ray'){const er=Math.min(.05,D[2]*.5);for(const z of[1,-1]){add(sp(6,5),mt(dark?col:'#ffffff'),D[0]*.64,D[1]*.28,z*D[2]*.74,er,er,er);if(!dark)add(sp(6,5),mt(mut&&mut.eye?mut.eye:'#101a2b'),D[0]*.68,D[1]*.28,z*D[2]*.84,er*.55,er*.55,er*.55)}}
 if(kind==='octo'){for(let k=0;k<6;k++){const p=new THREE.Group();p.position.set(-D[0]*.5,-D[1]*.4,(k-2.5)*.07);g.add(p);add(new THREE.ConeGeometry(.04,.5,5).rotateZ(Math.PI/2),mt(col,.2),-.25,0,0,1,1,1,p);u.tails.push({p,ph:k,ax:'y'})}}
 else if(kind==='ray'){add(new THREE.ConeGeometry(.03,.7,4).rotateZ(Math.PI/2),mt(col),-.55,0,0);for(const s of[1,-1]){const p=new THREE.Group();p.position.set(0,0,s*.12);g.add(p);add(sp(),mt(col,.3),0,0,s*.2,.3,.025,.28,p);add(sp(6,5),mt(acc,.9),0,0,s*.46,.04,.04,.04,p);u.fins.push(p)}u.fr=0;u.fa=.5}
 else if(kind==='eel'){T([[0,0],[-.22,.06],[-.34,0],[-.22,-.06]]);const w=/naga|leviathan/.test(n)?2.2:1;dors([[-.42,0],[-.36,.07*w],[.3,.07*w],[.4,0]])}
 else if(kind==='whale'){T([[0,0],[-.18,.3],[-.3,.22],[-.2,0],[-.3,-.22],[-.18,-.3]],'z',true);dors([[-.1,0],[-.02,.12],[.08,0]]);pect([[0,0],[-.3,0],[-.2,.3]])}
 else if(kind==='shark'){T(sc([[0,0],[-.22,.3],[-.17,0],[-.2,-.14]]));dors([[-.14,0],[0,.32],[.12,0]]);pect([[0,0],[-.24,0],[-.14,.26]])}
 else if(kind==='torp'){T(sc([[0,0],[-.24,.24],[-.16,0],[-.24,-.24]]));
  dors(/marlin/.test(n)?[[-.3,0],[-.2,.3],[.1,.26],[.15,0]]:/arwana/.test(n)?[[-.35,0],[-.3,.08],[.1,.08],[.15,0]]:[[-.12,0],[-.02,.2],[.08,.17],[.14,0]]);pect([[0,0],[-.16,0],[-.1,.14]]);
  if(/marlin/.test(n))add(new THREE.ConeGeometry(.025,.55,5).rotateZ(-Math.PI/2).translate(.27,0,0),mt('#2a3040'),D[0]*.95,0,0);
  if(/arwana|belida/.test(n))for(const z of[1,-1])add(new THREE.ConeGeometry(.01,.2,4).rotateZ(-Math.PI/2).translate(.1,0,0),mt('#1b2433'),D[0]*.9,-D[1]*.3,z*.03)}
 else if(kind==='cat'){T(sc([[0,0],[-.1,.17],[-.24,.12],[-.24,-.12],[-.1,-.17]]));dors([[-.1,0],[-.02,.12],[.08,0]],.1);pect([[0,0],[-.16,0],[-.1,.12]]);
  for(const s of[1,-1])for(const k of[0,1]){const w=add(new THREE.ConeGeometry(.01,.34,4).rotateZ(-Math.PI/2).translate(.17,0,0),mt('#1b2433'),D[0]*.9,-D[1]*.2,s*.06*(k+1));w.rotation.y=s*(.35+.25*k)}}
 else{T(sc(sh%2?[[0,0],[-.22,.2],[-.15,0],[-.22,-.2]]:[[0,0],[-.1,.17],[-.23,.12],[-.23,-.12],[-.1,-.17]]));
  dors([[-.18,0],[-.08,.2],[.02,.18],[.1,0]]);pect([[0,0],[-.16,0],[-.1,.14]],/lion/.test(n)?2:1);add(shp(sc([[-.18,0],[-.1,-.12],[-.02,0]])),mt(fin,.3),-.05,-D[1]*.8,0);
  if(/lion/.test(n))for(let k=-4;k<=4;k++){const s=add(new THREE.ConeGeometry(.012,.4,4).translate(0,.2,0),mt(k%2?'#eef2f7':'#2a2018'),-.05+k*.025,D[1]*.8,0);s.rotation.z=k*.2}
  if(/parrot/.test(n))add(new THREE.BoxGeometry(.06,.05,.1),mt('#eef2f7'),D[0]*.97,-D[1]*.1,0)}
 if(/angler/.test(n)){add(new THREE.ConeGeometry(.01,.3,4),mt('#222a3a'),D[0]*.4,D[1]+.12,0).rotation.z=-.5;add(sp(8,6),new THREE.MeshBasicMaterial({color:'#6ff0ff'}),D[0]*.4+.12,D[1]+.27,0,.05,.05,.05)}
 return g}
export function animateFish(g,t,sp=.5){const u=g.userData;u.tails.forEach(o=>o.p.rotation[o.ax||'y']=Math.sin(t*(4+sp*9)+o.ph)*(.22+sp*.3));u.fins.forEach((p,i)=>p.rotation.x=(i?-1:1)*(u.fr+Math.sin(t*3+i)*u.fa))}

let tr_,ts,tc;const cache={};
export function thumb(f,dark=false){
 const k=f.id+dark;if(cache[k])return cache[k];
 if(!tr_){tr_=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});tr_.setSize(240,120);ts=new THREE.Scene();ts.add(new THREE.HemisphereLight('#ffffff','#667788',1.6));const d=new THREE.DirectionalLight('#ffffff',2);d.position.set(1,2,3);ts.add(d);tc=new THREE.PerspectiveCamera(30,2,.1,20);tc.position.set(.1,.25,2.5);tc.lookAt(0,0,0)}
 const m=makeFish(f,dark);m.rotation.y=-.45;ts.add(m);tr_.render(ts,tc);const url=tr_.domElement.toDataURL();ts.remove(m);return cache[k]=url}

let vr,vs,vc,vm,vraf=0;
export function startViewer(f){stopViewer();
 if(!vr){vr=new THREE.WebGLRenderer({antialias:true,alpha:true});vr.setPixelRatio(Math.min(devicePixelRatio||1,2));vr.setSize(300,150);vs=new THREE.Scene();vs.add(new THREE.HemisphereLight('#ffffff','#667788',1.6));const d=new THREE.DirectionalLight('#ffffff',2);d.position.set(1,2,3);vs.add(d);vc=new THREE.PerspectiveCamera(30,2,.1,20);vc.position.set(0,.2,2.6);vc.lookAt(0,0,0);vr.domElement.style.cssText='width:100%;height:auto;display:block'}
 vm=makeFish(f,false,f.mut);vs.add(vm);const t0=performance.now();
 const tick=()=>{const t=(performance.now()-t0)/1000;vm.rotation.y=Math.sin(t*.8)*.7-.3;vm.position.y=Math.sin(t*1.6)*.04;vm.rotation.z=Math.sin(t*1.1)*.05;animateFish(vm,t,.45);vr.render(vs,vc);vraf=requestAnimationFrame(tick)};tick();return vr.domElement}
export function stopViewer(){cancelAnimationFrame(vraf);if(vm&&vs){vs.remove(vm);vm=null}}
