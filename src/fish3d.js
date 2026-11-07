import * as THREE from 'three';
export const RN=['Common','Uncommon','Rare','Epic','Legendary','Mythic'];
export const RC={Common:'#7d8996',Uncommon:'#3f9e6e',Rare:'#3b73c9',Epic:'#7b4fb8',Legendary:'#c99512',Mythic:'#c2308a'};
const COLS=[['merah','#c0392b'],['oranye','#e07b39'],['emas','#d9a521'],['safir','#2a4fa8'],['biru','#3b73c9'],['hijau','#4a9a6a'],['cokelat','#7a5230'],['abu','#7b8794'],['perak','#b8c2cc'],['putih','#e8e4d8'],['cyan','#2bb5c9'],['kristal','#9ad7e6'],['zaitun','#7a8a3a'],['transparan','#a7c9d9'],['indigo','#3a3f7a'],['navy','#1f3a6e'],['galaksi','#2d2a6e']];
const ACC=['#eef2f7','#1b2433','#e9a23b','#2bb5c9'];
const hash=s=>[...s].reduce((a,c)=>a*31+c.charCodeAt(0)>>>0,7);
export const colorOf=f=>{const s=f.visual_brief.toLowerCase();return(COLS.find(c=>s.includes(c[0]))||[0,'#6b7b8c'])[1]};

export function makeFish(f,dark=false){
 const g=new THREE.Group(),sh=hash(f.id),n=f.name.toLowerCase(),rar=RN.indexOf(f.rarity),glow=!dark&&rar>=3,tr=/kaca|kristal/.test(n);
 const col=dark?'#1b2433':colorOf(f),acc=dark?'#1b2433':ACC[sh%4];
 const mt=(c,e=0)=>new THREE.MeshStandardMaterial({color:c,roughness:.5,metalness:.1,flatShading:true,side:THREE.DoubleSide,transparent:tr&&!dark,opacity:tr&&!dark?.7:1,emissive:glow?RC[f.rarity]:'#000000',emissiveIntensity:glow?e:0});
 const kind=/manta/.test(n)?'ray':/gurita/.test(n)?'octo':/belut|sidat|naga|leviathan/.test(n)?'eel':/hiu|marlin|barracuda|tuna|toman|belida|gabus|paus/.test(n)?'torp':'fish';
 const D={fish:[.5,.2,.1],torp:[.5,.12,.09],eel:[.5,.05,.05],ray:[.32,.04,.3],octo:[.22,.22,.22]}[kind];
 const seg=/kristal/.test(n)?[5,4]:[10,7],sp=(w=10,hh=7)=>new THREE.SphereGeometry(1,w,hh);
 const add=(geo,m,x,y,z,sx=1,sy=1,sz=1,p=g)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);p.add(o);return o};
 const u=g.userData={tails:[],fins:[],fr:.7,fa:.25};
 add(sp(...seg),mt(col,.3),0,0,0,...D);
 if(!dark&&kind!=='octo'&&kind!=='ray'){add(sp(10,6),mt('#e6ebf0'),0,-D[1]*.5,0,D[0]*.92,D[1]*.55,D[2]*.9);add(sp(8,6),mt(acc,.3),-.04,D[1]*.75,0,D[0]*.5,D[1]*.22,D[2]*.95)}
 if(kind!=='ray')for(const z of[1,-1]){add(sp(6,5),mt(dark?col:'#ffffff'),D[0]*.62,D[1]*.3,z*D[2]*.78,.035,.035,.035);if(!dark)add(sp(6,5),mt('#101a2b'),D[0]*.66,D[1]*.3,z*D[2]*.86,.02,.02,.02)}
 if(kind==='octo'){for(let k=0;k<6;k++){const p=new THREE.Group();p.position.set(-D[0]*.5,-D[1]*.4,(k-2.5)*.07);g.add(p);add(new THREE.ConeGeometry(.04,.5,5).rotateZ(Math.PI/2),mt(col,.2),-.25,0,0,1,1,1,p);u.tails.push({p,ph:k})}}
 else if(kind==='ray'){
  add(new THREE.ConeGeometry(.03,.7,4).rotateZ(Math.PI/2),mt(col),-.55,0,0);
  for(const s of[1,-1]){const p=new THREE.Group();p.position.set(0,0,s*.12);g.add(p);add(sp(),mt(col,.3),0,0,s*.2,.3,.025,.28,p);add(sp(6,5),mt(acc,.9),0,0,s*.46,.04,.04,.04,p);u.fins.push(p)}
  u.fr=0;u.fa=.5}
 else{
  const p=new THREE.Group();p.position.set(-D[0]*.92,0,0);g.add(p);u.tails.push({p,ph:0});
  add(new THREE.ConeGeometry(Math.max(.05,D[1]*1.3),.3,4).rotateZ(Math.PI/2),mt(acc===ACC[1]&&!dark?col:acc,.3),-.14,0,0,1,1,.2,p);
  add(new THREE.ConeGeometry(.08,kind==='torp'?.3:.2,3),mt(col,.3),0,D[1]*.95,0,1,1,.2);
  for(const s of[1,-1]){const q=new THREE.Group();q.position.set(D[0]*.25,-D[1]*.4,s*D[2]*.8);g.add(q);add(new THREE.ConeGeometry(.06,.18,4).rotateZ(Math.PI/2),mt(col,.2),-.07,0,0,1,.3,1.4,q);u.fins.push(q)}}
 if(/angler/.test(n)){add(new THREE.ConeGeometry(.01,.3,4),mt('#222a3a'),D[0]*.4,D[1]+.12,0,1,1,1).rotation.z=-.5;add(sp(8,6),new THREE.MeshBasicMaterial({color:'#6ff0ff'}),D[0]*.4+.12,D[1]+.27,0,.05,.05,.05)}
 return g}
export function animateFish(g,t,sp=.5){const u=g.userData;u.tails.forEach(o=>o.p.rotation.y=Math.sin(t*(4+sp*9)+o.ph)*(.22+sp*.3));u.fins.forEach((p,i)=>p.rotation.x=(i?-1:1)*(u.fr+Math.sin(t*3+i)*u.fa))}

let tr_,ts,tc;const cache={};
export function thumb(f,dark=false){
 const k=f.id+dark;if(cache[k])return cache[k];
 if(!tr_){tr_=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});tr_.setSize(240,120);ts=new THREE.Scene();ts.add(new THREE.HemisphereLight('#ffffff','#667788',1.6));const d=new THREE.DirectionalLight('#ffffff',2);d.position.set(1,2,3);ts.add(d);tc=new THREE.PerspectiveCamera(30,2,.1,20);tc.position.set(.1,.25,2.5);tc.lookAt(0,0,0)}
 const m=makeFish(f,dark);m.rotation.y=-.45;ts.add(m);tr_.render(ts,tc);const url=tr_.domElement.toDataURL();ts.remove(m);return cache[k]=url}
