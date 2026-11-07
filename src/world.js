import * as THREE from 'three';
import {makeFish,animateFish,RC} from './fish3d.js';
const V=(x,y,z)=>new THREE.Vector3(x,y,z),C=c=>new THREE.Color(c),PZ=1.6;
const SKY=[['#a9d6e5','#5b7f4a'],['#b8c7cf','#6f7d52'],['#b9c79a','#3e4f2c'],['#8fd3dc','#d8c48a'],['#1d2a4a','#262e44']];
const WAT=['#2f7f9e','#4a7a86','#5a6b3c','#1f93a8','#14224a'],NAMES=['Willow Lake','Misty River','Mangrove Marsh','Coral Bay','Abyssal Trench'];
const H=V(.15,2.3,.4),cl=(v,a,b)=>Math.max(a,Math.min(b,v));
export class World{
 constructor(cv){
  this.cv=cv;this.t=0;this.shake=0;this.low=false;this.fish=[];this.ix=0;this.cs=V(0,-1,0);
  this.r=new THREE.WebGLRenderer({canvas:cv,antialias:true});this.r.setPixelRatio(Math.min(devicePixelRatio||1,2));
  const s=this.s=new THREE.Scene();this.cam=new THREE.PerspectiveCamera(52,1,.1,160);
  this.hemi=new THREE.HemisphereLight('#ffffff','#445566',1);this.sun=new THREE.DirectionalLight('#ffffff',2);this.sun.position.set(-6,10,6);s.add(this.hemi,this.sun);
  const wg=new THREE.PlaneGeometry(140,140,70,70);wg.rotateX(-Math.PI/2);this.wp=wg.attributes.position;this.wb=Float32Array.from(this.wp.array);
  this.water=new THREE.Mesh(wg,new THREE.MeshStandardMaterial({color:'#2f7f9e',roughness:.2,metalness:.1,flatShading:true,transparent:true,opacity:.86}));s.add(this.water);
  const bed=new THREE.Mesh(new THREE.PlaneGeometry(140,140).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:'#1b3a4a',roughness:1}));bed.position.y=-5;s.add(bed);
  this.moon=new THREE.Mesh(new THREE.SphereGeometry(3,16,12),new THREE.MeshBasicMaterial({color:'#f3f0dc',fog:false}));this.moon.position.set(-22,26,-70);s.add(this.moon);
  const mm=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.8,flatShading:true,...o}),wood=mm('#7a5a3a');
  const add=(g,m,x,y,z,p=s)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);p.add(o);return o};
  for(let i=0;i<9;i++)add(new THREE.BoxGeometry(4,.08,.48),mm(i%2?'#7a5a3a':'#86643f'),0,.52,.2+i*.5);
  for(const x of[-1.9,1.9])add(new THREE.BoxGeometry(.14,.14,4.6),mm('#4c3823'),x,.42,2.2);
  for(const x of[-1.8,1.8])for(const z of[.2,2.2,4.2])add(new THREE.CylinderGeometry(.12,.12,3,6),mm('#4c3823'),x,-.9,z);
  for(const x of[-1.9,1.9]){for(const z of[.4,1.6,2.8,4])add(new THREE.BoxGeometry(.08,.7,.08),mm('#5a3d24'),x,.9,z);add(new THREE.BoxGeometry(.06,.06,3.7),mm('#5a3d24'),x,1.25,2.2)}
  add(new THREE.CylinderGeometry(.05,.06,1.7,6),mm('#2a2018'),-1.9,1.45,.4);add(new THREE.SphereGeometry(.13,8,6),new THREE.MeshBasicMaterial({color:'#ffd98a'}),-1.9,2.4,.4);
  this.lantern=new THREE.PointLight('#ffcf80',0,10);this.lantern.position.set(-1.9,2.4,.4);s.add(this.lantern);
  add(new THREE.CylinderGeometry(.2,.16,.3,8),mm('#b8543a'),-1.3,.8,1.2);add(new THREE.BoxGeometry(.5,.25,.3),mm('#2f6f7a'),1.2,.7,2.6);add(new THREE.TorusGeometry(.18,.05,5,10).rotateX(Math.PI/2),mm('#c9b27a'),1.3,.6,.9);
  const P=this.pl=new THREE.Group();P.position.set(0,.6,PZ);s.add(P);
  const jk=mm('#2f6f7a'),pn=mm('#3b4252'),sk=mm('#e0b48a'),bt=mm('#2a2018');
  const limb=(a,b,r,m)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r*.9,1,7),m);P.add(o);this.setLimb(o,a,b);return o};
  for(const x of[-.12,.12]){limb(V(x,.55,0),V(x,.06,0),.1,pn);add(new THREE.BoxGeometry(.18,.12,.3),bt,x,.06,-.04,P)}
  add(new THREE.CylinderGeometry(.27,.31,.75,8),jk,0,.92,0,P);add(new THREE.BoxGeometry(.42,.55,.24),mm('#8a5a2a'),0,.95,.28,P);add(new THREE.CylinderGeometry(.09,.09,.5,8).rotateZ(Math.PI/2),mm('#c2582f'),0,1.3,.28,P);
  add(new THREE.SphereGeometry(.2,12,10),sk,0,1.45,0,P);add(new THREE.CylinderGeometry(.34,.34,.04,12),mm('#e9a23b'),0,1.56,0,P);add(new THREE.CylinderGeometry(.2,.22,.17,12),mm('#e9a23b'),0,1.65,0,P);add(new THREE.CylinderGeometry(.225,.225,.05,12),mm('#2f4858'),0,1.58,0,P);
  for(const x of[-.07,.07])add(new THREE.SphereGeometry(.025,6,5),mm('#101a2b'),x,1.45,-.18,P);
  this.armR=limb(V(.3,1.2,0),V(.3,1,-.2),.075,jk);this.armL=limb(V(-.3,1.2,0),V(0,1,-.3),.075,jk);
  this.rod=new THREE.Group();this.rod.position.set(.3,.92,-.3);P.add(this.rod);this.ra=-1;this.bd=0;
  this.rm=mm('#8a6a44');let par=this.rod;this.segs=[];
  add(new THREE.CylinderGeometry(.045,.045,.42,8).translate(0,-.21,0),mm('#d9b98a'),0,0,0,this.rod);
  for(let i=0;i<3;i++){const g=new THREE.CylinderGeometry(.014-i*.003,.03-i*.007,1,6);g.translate(0,.5,0);const m=new THREE.Mesh(g,this.rm);m.position.y=i?1:0;par.add(m);this.segs.push(m);par=m;add(new THREE.TorusGeometry(.035,.007,5,10).rotateX(Math.PI/2),mm('#c0c8d0'),0,.55,.04,m)}
  this.tipO=new THREE.Object3D();this.tipO.position.y=1;par.add(this.tipO);this.tp=V(0,2,0);
  const rl=add(new THREE.CylinderGeometry(.07,.07,.07,10).rotateZ(Math.PI/2),mm('#9aa5b1'),.08,.3,0,this.segs[0]);
  this.handle=new THREE.Group();this.handle.position.set(.06,0,0);rl.add(this.handle);add(new THREE.BoxGeometry(.03,.14,.03),mm('#e9a23b'),.04,.07,0,this.handle);add(new THREE.SphereGeometry(.03,6,5),mm('#d1493f'),.04,.14,0,this.handle);
  const hR=new THREE.Object3D();hR.position.set(0,.05,0);this.rod.add(hR);const hL=new THREE.Object3D();hL.position.set(0,.6,0);this.rod.add(hL);
  add(new THREE.SphereGeometry(.06,8,6),sk,0,.05,0,this.rod);add(new THREE.SphereGeometry(.06,8,6),sk,0,.6,0,this.rod);
  this.arms=[[this.armR,hR,V(.3,1.2,0)],[this.armL,hL,V(-.3,1.2,0)]];
  const bob=this.bob=new THREE.Group();bob.add(new THREE.Mesh(new THREE.SphereGeometry(.13,10,6,0,6.283,0,1.5708),mm('#d1493f')),new THREE.Mesh(new THREE.SphereGeometry(.13,10,6,0,6.283,1.5708,1.5708),mm('#eef2f7')));
  const stick=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,.3,5),mm('#d1493f'));stick.position.y=.2;bob.add(stick);s.add(bob);this.bp=V(0,0,0);
  const N=24;this.lg=new THREE.BufferGeometry();this.lg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(N*3),3));this.lm=new THREE.LineBasicMaterial({color:'#ffffff'});this.line=new THREE.Line(this.lg,this.lm);this.line.frustumCulled=false;s.add(this.line);
  this.pt=[];const pg=new THREE.BoxGeometry(.07,.07,.07);for(let i=0;i<140;i++){const m=new THREE.Mesh(pg,new THREE.MeshBasicMaterial({color:'#fff'}));m.visible=false;m.userData={v:V(0,0,0),l:0};s.add(m);this.pt.push(m)}
  this.rg=[];const rgeo=new THREE.RingGeometry(.92,1,40).rotateX(-Math.PI/2);for(let i=0;i<28;i++){const m=new THREE.Mesh(rgeo,new THREE.MeshBasicMaterial({color:'#fff',transparent:true,side:THREE.DoubleSide,depthWrite:false}));m.visible=false;m.userData={l:0,sp:1,mx:2};s.add(m);this.rg.push(m)}
  this.beam=new THREE.Mesh(new THREE.CylinderGeometry(.45,.45,16,16,1,true),new THREE.MeshBasicMaterial({color:'#e9c24b',transparent:true,opacity:.28,depthWrite:false,side:THREE.DoubleSide}));this.beam.position.set(H.x,H.y+6,H.z);this.beam.visible=false;s.add(this.beam);
  this.vortex=new THREE.Group();[1,1.7,2.4].forEach((r,i)=>{const t=new THREE.Mesh(new THREE.TorusGeometry(r,.06,6,32).rotateX(Math.PI/2),new THREE.MeshBasicMaterial({color:i%2?'#2bb5c9':'#c2308a'}));this.vortex.add(t)});this.vortex.visible=false;s.add(this.vortex);
  this.cc=V(1.1,2.3,5.4);this.cl=V(0,.8,-6);this.initFx()}
 setLimb(o,a,b){const d=V(0,0,0).subVectors(b,a),l=d.length()||.001;o.position.copy(a).addScaledVector(d,.5);o.scale.set(1,l,1);o.quaternion.setFromUnitVectors(V(0,1,0),d.normalize())}
 initFx(){const s=this.s;this.wx='clear';this.wamp=1;this.flash=0;this.lt=3;this.bt=0;this.mtT=0;this.rrT=0;
  this.sunD=new THREE.Mesh(new THREE.SphereGeometry(4,16,12),new THREE.MeshBasicMaterial({color:'#ffe9a8',fog:false}));this.sunD.position.set(30,30,-75);s.add(this.sunD);
  const sp=[];for(let i=0;i<240;i++){const th=Math.random()*6.283,ph=Math.acos(Math.random()*.85+.1);sp.push(90*Math.sin(ph)*Math.cos(th),90*Math.cos(ph),-90*Math.sin(ph)*Math.sin(th))}
  this.stars=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(sp,3)),new THREE.PointsMaterial({color:'#ffffff',size:2.2,sizeAttenuation:false,fog:false}));this.stars.visible=false;s.add(this.stars);
  const fp=[];for(let i=0;i<45;i++)fp.push((Math.random()<.5?-1:1)*(5+Math.random()*10),.4+Math.random()*2,1-Math.random()*14);this.ffb=Float32Array.from(fp);
  this.ff=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(fp.slice(),3)),new THREE.PointsMaterial({color:'#e9e27a',size:.12}));this.ff.visible=false;this.ff.frustumCulled=false;s.add(this.ff);
  this.rd=Array.from({length:520},()=>({x:(Math.random()-.5)*26,y:Math.random()*14,z:3-Math.random()*36,s:12+Math.random()*8}));
  this.rain=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(new Float32Array(520*6),3)),new THREE.LineBasicMaterial({color:'#bcd2e8',transparent:true,opacity:.5}));this.rain.frustumCulled=false;this.rain.visible=false;s.add(this.rain);
  this.bolt=new THREE.Group();const bg=new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(new Float32Array(36),3));for(const dx of[-.05,0,.05]){const l=new THREE.Line(bg,new THREE.LineBasicMaterial({color:'#eef4ff'}));l.position.x=dx;l.frustumCulled=false;this.bolt.add(l)}this.bolt.visible=false;s.add(this.bolt);
  this.mt=[];for(let i=0;i<5;i++){const g=new THREE.Group();g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(.6,0),new THREE.MeshStandardMaterial({color:'#5b4032',emissive:'#ff7a2a',emissiveIntensity:1,flatShading:true})));const tl=new THREE.Mesh(new THREE.ConeGeometry(.5,6,6),new THREE.MeshBasicMaterial({color:'#ff9a3a',transparent:true,opacity:.55,depthWrite:false}));tl.position.y=3;g.add(tl);g.visible=false;g.userData={l:0,a:V(0,0,0),b:V(0,0,0),d:2};s.add(g);this.mt.push(g)}
  this.orb=new THREE.Group();for(let i=0;i<8;i++)this.orb.add(new THREE.Mesh(new THREE.SphereGeometry(.07,6,5),new THREE.MeshBasicMaterial({color:'#ffffff'})));this.orb.visible=false;s.add(this.orb)}
 zAt(cd){return PZ-cd-.2}
 setTod(tod){this.tod=tod;this.applyEnv()}
 setWeather(w){this.wx=w;this.applyEnv()}
 applyEnv(){const tod=this.tod||'siang',wx=this.wx||'clear',n=tod==='malam',L=this.loc||0,c=C(SKY[L][0]);
  if(tod==='senja')c.lerp(C('#e8885a'),.45);if(n)c.lerp(C('#0b1530'),.78);
  if(wx==='rain')c.lerp(C('#6b7785'),.5);if(wx==='storm')c.lerp(C('#2c3440'),.78);if(wx==='meteor')c.lerp(C('#070d22'),.8);
  const dark=n||wx==='meteor';
  this.base={hi:dark?.6:wx==='storm'?.55:wx==='rain'?.8:1,si:dark?.7:wx==='storm'?.6:wx==='rain'?1.2:tod==='senja'?1.7:2.2};
  this.s.background=c;this.s.fog=new THREE.Fog(c,wx==='storm'?12:wx==='rain'?20:28,wx==='storm'?60:95);
  this.hemi.intensity=this.base.hi;this.sun.intensity=this.base.si;this.sun.color.set(dark?'#7f9bdc':tod==='senja'?'#ffb36b':wx==='storm'?'#9aa8bc':'#ffffff');
  this.moon.visible=dark;this.sunD.visible=!dark&&wx==='clear';this.stars.visible=dark;
  this.water.material.color.set(WAT[L]).multiplyScalar(dark?.6:wx==='storm'?.55:1);
  (this.cl3||[]).forEach(g=>g.visible=!dark&&L!==4);this.ff.visible=(tod!=='siang'||n)&&L<4&&wx!=='storm';
  this.lantern.intensity=dark||tod==='senja'||wx==='storm'?1.6:0;this.rain.visible=wx==='rain'||wx==='storm';this.wamp=wx==='storm'?2.4:wx==='rain'?1.3:1}
 build(i){
  this.loc=i;if(this.env)this.s.remove(this.env);const E=this.env=new THREE.Group();this.s.add(E);
  let sd=i*977+13;const Rn=()=>(sd=sd*16807%2147483647)/2147483647;
  const mm=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.9,flatShading:true,...o});
  const add=(g,m,x,y,z,sc=1,p=E)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.scale.setScalar(sc);p.add(o);return o};
  const ico=new THREE.IcosahedronGeometry(1,1),cone=new THREE.ConeGeometry(1,2.4,6),trk=new THREE.CylinderGeometry(.12,.18,1,5),oct=new THREE.OctahedronGeometry(1,0);
  const bank=SKY[i][1],leaf=['#3f7d3a','#4a7a3a','#556b2f','#3f9e6e','#1d2a4a'][i];
  for(let k=0;k<16;k++){const s=5+Rn()*8,o=add(ico,mm(bank),-70+k*9+Rn()*4,-1+s*.2,-52-Rn()*10,s);o.scale.y=s*.55}
  if(i<4){for(const sx of[-1,1])add(new THREE.BoxGeometry(18,1.4,90),mm(bank),sx*24,-.1,-30);
   for(let k=0;k<26;k++){const x=(Rn()<.5?-1:1)*(15+Rn()*14),z=3-Rn()*60;
    if(i===3){add(trk,mm('#8a6a44'),x,2,z,3.5).rotation.z=(Rn()-.5)*.4;add(ico,mm('#3f9e6e'),x,3.9,z,1.2).scale.y=.45}
    else{add(trk,mm('#5a3d24'),x,1.4,z,2);add(cone,mm(leaf),x,3.5,z,1+Rn()*.7)}}}
  else{for(let k=0;k<22;k++){const o=add(oct,mm('#2bb5c9',{emissive:'#2bb5c9',emissiveIntensity:.8}),(Rn()-.5)*70,-2+Rn()*3,-6-Rn()*45,.6+Rn()*1.2);o.scale.y*=2+Rn()*3}}
  this.plk=null;if(i===4){const pos=[];for(let k=0;k<160;k++)pos.push((Rn()-.5)*50,-4+Rn()*5,1-Rn()*40);const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));this.plk=new THREE.Points(pg,new THREE.PointsMaterial({color:'#6ff0ff',size:.14}));E.add(this.plk)}
  const cc=['#e46a6a','#e9a23b','#c2308a','#2bb5c9'];
  for(let k=0;k<22;k++){const x=(Rn()-.5)*40,z=-3-Rn()*28;if(i===3)add(cone,mm(cc[k%4]),x,-4.2,z,.5+Rn()*.9);else add(ico,mm('#2a3a44'),x,-4.8,z,.4+Rn()*1.1)}
  this.cl3=[];for(let k=0;k<6;k++){const g=new THREE.Group();for(let j=0;j<3;j++)add(ico,mm('#ffffff',{roughness:1}),j*2.2-2.2,Rn(),0,2+Rn()*1.2,g);g.position.set(-50+k*20,28+Rn()*8,-50-Rn()*20);E.add(g);this.cl3.push(g)}
  if(i<4){const rc=mm(i===3?'#c9b27a':'#6f8f3a');
   for(let k=0;k<40;k++){const x=(Rn()<.5?-1:1)*(9+Rn()*5),z=2-Rn()*16;add(new THREE.ConeGeometry(.05,1.2+Rn()*.8,4),rc,x,.5,z).rotation.z=(Rn()-.5)*.3}
   for(let k=0;k<10;k++)add(ico,mm('#6b7078'),(Rn()<.5?-1:1)*(9+Rn()*6),.1,1-Rn()*14,.3+Rn()*.6).scale.y*=.6}
  if(i===0){for(let k=0;k<14;k++){const x=(Rn()-.5)*10,z=-1-Rn()*10;add(new THREE.CylinderGeometry(.35,.35,.03,10),mm('#3f8f4a'),x,.03,z);if(k%3===0)add(new THREE.SphereGeometry(.1,6,5),mm('#e68fb0'),x,.1,z)}
   add(new THREE.BoxGeometry(1.2,.35,3.2),mm('#8a5a2a'),-7.5,.05,-4).rotation.y=.5}
  this.amb=[];const pool=this.fish.filter(f=>f.hab.some(x=>x.n===NAMES[i]&&x.c!=='event'));
  for(let k=0;k<Math.min(8,pool.length*2);k++){const m=makeFish(pool[k%pool.length]);m.scale.setScalar(.45+Rn()*.4);E.add(m);this.amb.push({m,cx:(Rn()-.5)*14,cz:-5-Rn()*14,r:2+Rn()*4,sp:.25+Rn()*.3,y:-1.6-Rn()*2.4,ph:Rn()*6,d:Rn()<.5?1:-1})}
  this.setTod(this.tod||'siang')}
 ringAt(v,col='#fff',mx=2,sp=1.5){const m=this.rg.find(x=>!x.visible);if(!m)return;m.visible=true;m.material.color.set(col);m.position.copy(v);m.userData={l:1,sp,mx};m.scale.setScalar(.1)}
 ring(cd,col,mx=1.8){this.ringAt(V(0,.05,this.zAt(cd)),col,mx)}
 burstAt(v,col,n,up=4,spread=1){if(this.low)n=Math.ceil(n/4);for(let i=0;i<n;i++){const m=this.pt.find(x=>!x.visible);if(!m)return;m.visible=true;m.position.copy(v);m.material.color.set(col);m.userData.v.set((Math.random()-.5)*spread*2,up*(.4+Math.random()),(Math.random()-.5)*spread*2);m.userData.l=.8+Math.random()*.8;m.scale.setScalar(.6+Math.random()*1.2)}}
 splash(cd,n=14){this.burstAt(V(0,.1,this.zAt(cd)),'#dfeaf2',n,4,.9)}
 mkFish(f){if(this.fm)this.s.remove(this.fm);const m=makeFish(f,false,f.mut);m.userData.mut=f.mut;m.rotation.order='YZX';this.fL=cl(.35+Math.cbrt(f.weight)*.4,.4,3.6);m.scale.setScalar(this.fL);this.s.add(m);this.fm=m;this.fk=f.id+f.sc;this.py0=undefined}
 catchFx(f,ix){const w=this.fm?this.fm.position:V(0,-1,0),mu=f.mut,col=mu?mu.c:RC[f.rarity];this.cs.copy(w);this.ix=ix;this.mu=mu;this.hf=false;
  this.burstAt(V(w.x,.1,w.z),ix||mu?col:'#dfeaf2',10+ix*10+(mu?20:0),5+ix,1.5);this.ringAt(V(w.x,.05,w.z),col,3+ix,1.5);if(ix>=3||mu)this.ringAt(V(w.x,.05,w.z),col,6+ix,1);
  this.orb.children.forEach(o=>o.material.color.set(col));
  if(ix===5||(mu&&mu.orb)){this.vortex.visible=true;this.vortex.position.set(w.x,.1,w.z)}}
 holdFx(){const ix=this.ix,mu=this.mu,col=mu?mu.c:RC[Object.keys(RC)[ix]];this.burstAt(H,col,14+ix*14+(mu?30:0),2.5,3);
  if(ix>=3||mu){this.ringAt(V(H.x,H.y-.4,H.z),col,2.5,1.3);this.ringAt(V(H.x,H.y,H.z),col,3.5,.9)}
  if(ix>=4||mu)this.beam.visible=true;this.beam.material.color.set(mu?mu.c:'#e9c24b');if(ix===5||(mu&&mu.orb))this.burstAt(H,'#2bb5c9',50,3,3.5)}
 frame(dt,G,S,rod,tod){
  const cv=this.cv,w=cv.clientWidth||1,h=cv.clientHeight||1;
  if(w!==this.w||h!==this.h){this.w=w;this.h=h;this.r.setSize(w,h,false);this.cam.aspect=w/h;this.cam.fov=w/h<1?74:52;this.cam.updateProjectionMatrix()}
  if(S.loc!==this.loc)this.build(S.loc);if(tod!==this.tod)this.setTod(tod);
  this.low=!S.opt.fx;const t=(this.t+=dt),st=G.st,por=this.cam.aspect<1;
  const a=this.wp.array,b=this.wb;for(let i=0;i<a.length;i+=3){const x=b[i],z=b[i+2];a[i+1]=(Math.sin(x*.45+t*1.3)*.07+Math.cos(z*.38+t*1.0)*.07+Math.sin((x+z)*.2+t*.6)*.05)*(this.wamp||1)}this.wp.needsUpdate=true;
  this.rm.color.set({Starter:'#8a6a44',Common:'#5f9a4a',Rare:'#243a5c',Epic:'#2a6fa8',Legendary:'#14181f'}[rod.tier]||'#8a6a44');this.rm.emissive.set(rod.tier==='Legendary'?'#2bb5c9':'#000000');this.rm.emissiveIntensity=.6;
  let ta=-1;if(st==='charge')ta=.1+G.pw/100*.5;else if(st==='cast')ta=-1.35+Math.min(1,G.t/.7)*.35;else if(st==='fight')ta=-.95+G.pump*.45;
  this.ra+=(ta-this.ra)*Math.min(1,14*dt);this.rod.rotation.x=this.ra;
  const tb=st==='fight'?G.ten*.0055:st==='bite'?.1:.03;this.bd+=(tb-this.bd)*Math.min(1,10*dt);this.segs.forEach((m,i)=>m.rotation.x=-this.bd*(.6+i*.3));
  this.handle.rotation.x+=(G.reel&&st==='fight'?16:0)*dt;this.rod.updateMatrixWorld(true);this.tipO.getWorldPosition(this.tp);
  const tp=this.tp,bz=this.zAt(G.cd||6),bp=this.bp;
  if(st==='cast'){const k=Math.min(1,G.t/.7);bp.set(tp.x*(1-k),tp.y*(1-k)+.1*k+Math.sin(k*Math.PI)*3.2,tp.z+(bz-tp.z)*k)}
  else if(st==='wait'||st==='bite')bp.set(Math.sin(t*.7)*.05,.02+Math.sin(t*2.2)*.02-(st==='bite'?.14+Math.sin(t*30)*.03:0),bz);
  else bp.set(tp.x,tp.y-1,tp.z);
  const inF=st==='fight'||st==='catch'||st==='result';this.bob.visible=!inF;this.bob.position.copy(bp);
  if(G.f&&(!this.fm||this.fk!==G.f.id+G.f.sc))this.mkFish(G.f);
  if(!G.f&&this.fm){this.s.remove(this.fm);this.fm=null;this.fk=null}
  let end=bp;
  if(this.fm){const fm=this.fm,L=this.fL;let px=bp.x,py=-.8-L*.3,pz=bz,sp=.4,yaw=Math.PI/2+Math.sin(t*20)*.3,pitch=0;
   if(st==='fight'){const k=G.dist/100,sur=G.surge>0,pr=sur?1-G.surge/.8:0,sn=Math.sin(pr*Math.PI);
    px=Math.sin(t*1.6)*1.3*k+(sur?sn*1.6*(Math.sin(this.fk.length*3+Math.floor(t))>0?1:-1)*k:0);pz=tp.z+(bz-tp.z)*k;
    py=-1-L*.35-(sur&&!G.jumper?sn*.8:0)+(sur&&G.jumper?sn*(1.2+L):0);sp=(.3+.7*G.sta/100)*(sur?1.4:1);yaw=Math.PI/2+Math.sin(t*2)*.5+(sur?Math.sin(t*14)*.4:0);
    if(this.py0!==undefined)pitch=cl((py-this.py0)/Math.max(dt,.008)*.12,-.7,.7)}
   else if(inF){const p=Math.min(1,G.ct/G.cdur),e=1-Math.pow(1-p,3),c0=this.cs,Lc=Math.min(L,1.3);
    px=c0.x+(H.x-c0.x)*e;pz=c0.z+(H.z-c0.z)*e;py=c0.y+(H.y-c0.y)*e+Math.sin(p*Math.PI)*1.6+(p>=1?Math.sin(t*2)*.06:0);
    yaw=Math.PI/2+e*6.283+Math.sin(t*.8)*.4;pitch=.35*e;sp=.7;fm.scale.setScalar(L+(Lc-L)*e);if(p>=.55&&!this.hf){this.hf=true;this.holdFx()}}
   if(this.py0!==undefined&&(this.py0<0)!==(py<0))this.burstAt(V(px,.1,pz),'#dfeaf2',16,4.5,1);
   this.py0=py;fm.position.set(px,py,pz);fm.rotation.y=yaw;fm.rotation.z=pitch;animateFish(fm,t,sp);
   if(inF){const q=fm.scale.x*.5;end=this.mo||(this.mo=V(0,0,0));end.set(px+Math.cos(yaw)*q,py,pz-Math.sin(yaw)*q)}}
  const la=this.lg.attributes.position,N=la.count,len=tp.distanceTo(end),taut=st==='fight'?G.ten/100:0,sag=(1-taut)*(.15+len*.035),hot=st==='fight'&&G.ten>85;
  this.lm.color.set(hot?'#ff6b5f':'#ffffff');
  for(let i=0;i<N;i++){const u=i/(N-1),j=hot?Math.sin(t*80+i)*.03:0;la.setXYZ(i,tp.x+(end.x-tp.x)*u+j,tp.y+(end.y-tp.y)*u-Math.sin(u*Math.PI)*sag,tp.z+(end.z-tp.z)*u)}la.needsUpdate=true;
  if(st==='idle'||st==='charge'){this.beam.visible=this.vortex.visible=false}
  this.vortex.children.forEach((m,i)=>m.rotation.y=t*(i+1)*1.5);this.vortex.rotation.y=t;
  const base=por?V(.9,2.2,4.3):V(.75,1.8,3.3),look=V(.1,1,-5);
  if(st==='charge')look.z=-5-G.pw*.05;
  if(st==='fight'&&this.fm){look.set(this.fm.position.x*.4,.2,(PZ+this.fm.position.z)/2-2)}
  if((st==='catch'||st==='result')&&this.ix>=2){const k=Math.sin(Math.min(1,G.ct/G.cdur)*Math.PI*.5);base.lerp(V(H.x+.6,H.y-.1,H.z+2.2),k*.6);look.lerp(H,k)}
  this.cc.lerp(base,Math.min(1,4*dt));this.cl.lerp(look,Math.min(1,4*dt));this.cam.position.copy(this.cc);
  if(this.wx==='storm'){this.cam.position.x+=Math.sin(t*1.3)*.04;this.cam.position.y+=Math.sin(t*1.9)*.03}
  if(this.shake>0){this.shake-=dt;this.cam.position.x+=(Math.random()-.5)*.14*(this.shake/.5);this.cam.position.y+=(Math.random()-.5)*.14*(this.shake/.5)}
  this.cam.lookAt(this.cl);
  for(const m of this.pt)if(m.visible){const d=m.userData;d.l-=dt;d.v.y-=9*dt;m.position.addScaledVector(d.v,dt);if(d.l<=0||m.position.y<-.3)m.visible=false}
  for(const m of this.rg)if(m.visible){const d=m.userData;d.l-=dt*d.sp*.5;m.scale.setScalar(.1+(1-d.l)*d.mx);m.material.opacity=Math.max(0,d.l);if(d.l<=0)m.visible=false}
  for(const o of this.amb||[]){const an=o.ph+t*o.sp*o.d;o.m.position.set(o.cx+Math.cos(an)*o.r,o.y,o.cz+Math.sin(an)*o.r*.6);o.m.rotation.y=Math.atan2(-Math.cos(an)*.6*o.d,-Math.sin(an)*o.d);animateFish(o.m,t+o.ph,.4)}
  for(const g of this.cl3||[]){g.position.x+=dt*.6;if(g.position.x>70)g.position.x=-70}
  if(this.plk)this.plk.rotation.y=t*.03;
  this.flash=Math.max(0,(this.flash||0)-dt*5);if(this.base){this.hemi.intensity=this.base.hi+this.flash*1.2;this.sun.intensity=this.base.si+this.flash*3}
  const wx=this.wx||'clear';
  if(this.rain.visible){const p=this.rain.geometry.attributes.position.array,sm=wx==='storm',wd=sm?.35:.12;this.rrT-=dt;if(this.rrT<=0){this.rrT=.07;this.ringAt(V((Math.random()-.5)*18,.03,3-Math.random()*22),'#dfeaf2',.5,3)}
   this.rd.forEach((d,i)=>{d.y-=d.s*dt*(sm?1.4:1);d.x+=wd*d.s*dt;if(d.y<0){d.y=14;d.x=(Math.random()-.5)*26-3;d.z=3-Math.random()*36}const o=i*6;p[o]=d.x;p[o+1]=d.y;p[o+2]=d.z;p[o+3]=d.x-wd*.6;p[o+4]=d.y+.8;p[o+5]=d.z});this.rain.geometry.attributes.position.needsUpdate=true}
  if(wx==='storm'){this.lt-=dt;if(this.lt<=0){this.lt=3+Math.random()*6;const x0=(Math.random()-.5)*40,z0=-18-Math.random()*25,bq=this.bolt.children[0].geometry.attributes.position;let bx=x0;for(let i=0;i<12;i++){bx+=(Math.random()-.5)*3;bq.setXYZ(i,bx,34-i*3.1,z0)}bq.needsUpdate=true;this.bolt.visible=true;this.bt=.2;this.flash=1;this.onThunder&&this.onThunder()}
   if(this.bt>0){this.bt-=dt;if(this.bt<=.1&&this.bt>.08)this.flash=.7;if(this.bt<=0)this.bolt.visible=false}}else this.bolt.visible=false;
  if(wx==='meteor'){this.mtT-=dt;if(this.mtT<=0){this.mtT=.7+Math.random()*1.5;const m0=this.mt.find(x=>!x.visible);if(m0){const d=m0.userData;d.a.set((Math.random()-.5)*60,52,-30-Math.random()*25);d.b.set((Math.random()-.5)*26,0,-6-Math.random()*22);d.l=0;d.d=1.6+Math.random()*.8;m0.visible=true}}}
  for(const m1 of this.mt)if(m1.visible){const d=m1.userData;d.l+=dt/d.d;m1.position.lerpVectors(d.a,d.b,Math.min(1,d.l));m1.quaternion.setFromUnitVectors(V(0,1,0),V(0,0,0).subVectors(d.a,d.b).normalize());
   if(d.l>=1){m1.visible=false;this.burstAt(d.b,'#ff9a3a',34,7,2.6);this.burstAt(d.b,'#ffd27a',16,9,1.2);this.ringAt(V(d.b.x,.05,d.b.z),'#ff9a3a',9,.8);this.flash=.6;this.onMeteor&&this.onMeteor()}}
  if(this.ff.visible){const a2=this.ff.geometry.attributes.position.array;for(let i=0;i<a2.length;i+=3){a2[i]=this.ffb[i]+Math.cos(t*.6+i)*.5;a2[i+1]=this.ffb[i+1]+Math.sin(t*.8+i)*.4}this.ff.geometry.attributes.position.needsUpdate=true}
  const mu=this.fm&&this.fm.userData.mut,show=!!mu&&(st==='catch'||st==='result');this.orb.visible=show;
  if(show){const p=this.fm.position;this.orb.children.forEach((o,k)=>{const an=t*2+k*.785;o.position.set(p.x+Math.cos(an)*(.7+Math.sin(t*3+k)*.12),p.y+Math.sin(t*2+k)*.3,p.z+Math.sin(an)*.7)})}
  {const hw=V(0,0,0);for(const [arm,hand,shl] of this.arms){hand.getWorldPosition(hw);this.pl.worldToLocal(hw);this.setLimb(arm,shl,hw)}}
  this.r.render(this.s,this.cam)}
}
