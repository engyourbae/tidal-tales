import * as THREE from 'three';
import {makeFish,animateFish,RC} from './fish3d.js';
const V=(x,y,z)=>new THREE.Vector3(x,y,z),C=c=>new THREE.Color(c),PZ=1.6;
const SKY=[['#a9d6e5','#5b7f4a'],['#b8c7cf','#6f7d52'],['#b9c79a','#3e4f2c'],['#8fd3dc','#d8c48a'],['#1d2a4a','#262e44']];
const WAT=['#2f7f9e','#4a7a86','#5a6b3c','#1f93a8','#14224a'],NAMES=['Willow Lake','Misty River','Mangrove Marsh','Coral Bay','Abyssal Trench'];
const H=V(.35,2.5,PZ+1.7),cl=(v,a,b)=>Math.max(a,Math.min(b,v));
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
  add(new THREE.BoxGeometry(4,.2,4.6),wood,0,.5,2.2);
  for(const x of[-1.8,1.8])for(const z of[.2,2.2,4.2])add(new THREE.CylinderGeometry(.12,.12,3,6),mm('#4c3823'),x,-.9,z);
  const P=this.pl=new THREE.Group();P.position.set(0,.6,PZ);s.add(P);
  add(new THREE.CylinderGeometry(.27,.32,.9,8),mm('#2f4858'),0,.55,0,P);add(new THREE.SphereGeometry(.22,10,8),mm('#e0b48a'),0,1.2,0,P);
  add(new THREE.CylinderGeometry(.34,.34,.05,10),mm('#e9a23b'),0,1.34,0,P);add(new THREE.CylinderGeometry(.2,.22,.18,10),mm('#e9a23b'),0,1.43,0,P);
  for(const x of[-.14,.14])add(new THREE.BoxGeometry(.18,.5,.2),mm('#22303c'),x,.1,0,P);
  this.rod=new THREE.Group();this.rod.position.set(.3,.95,-.1);P.add(this.rod);this.ra=-1;this.bd=0;
  this.rm=mm('#8a6a44');let par=this.rod;this.segs=[];
  for(let i=0;i<3;i++){const g=new THREE.CylinderGeometry(.018-i*.004,.03-i*.005,1,6);g.translate(0,.5,0);const m=new THREE.Mesh(g,this.rm);m.position.y=i?1:0;par.add(m);this.segs.push(m);par=m}
  this.tipO=new THREE.Object3D();this.tipO.position.y=1;par.add(this.tipO);this.tp=V(0,2,0);
  this.handle=add(new THREE.BoxGeometry(.2,.05,.05),mm('#e9a23b'),.06,.25,0,this.segs[0]);
  const bob=this.bob=new THREE.Group();bob.add(new THREE.Mesh(new THREE.SphereGeometry(.13,10,6,0,6.283,0,1.5708),mm('#d1493f')),new THREE.Mesh(new THREE.SphereGeometry(.13,10,6,0,6.283,1.5708,1.5708),mm('#eef2f7')));
  const stick=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,.3,5),mm('#d1493f'));stick.position.y=.2;bob.add(stick);s.add(bob);this.bp=V(0,0,0);
  const N=24;this.lg=new THREE.BufferGeometry();this.lg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(N*3),3));this.lm=new THREE.LineBasicMaterial({color:'#ffffff'});this.line=new THREE.Line(this.lg,this.lm);this.line.frustumCulled=false;s.add(this.line);
  this.pt=[];const pg=new THREE.BoxGeometry(.07,.07,.07);for(let i=0;i<140;i++){const m=new THREE.Mesh(pg,new THREE.MeshBasicMaterial({color:'#fff'}));m.visible=false;m.userData={v:V(0,0,0),l:0};s.add(m);this.pt.push(m)}
  this.rg=[];const rgeo=new THREE.RingGeometry(.92,1,40).rotateX(-Math.PI/2);for(let i=0;i<16;i++){const m=new THREE.Mesh(rgeo,new THREE.MeshBasicMaterial({color:'#fff',transparent:true,side:THREE.DoubleSide,depthWrite:false}));m.visible=false;m.userData={l:0,sp:1,mx:2};s.add(m);this.rg.push(m)}
  this.beam=new THREE.Mesh(new THREE.CylinderGeometry(.45,.45,16,16,1,true),new THREE.MeshBasicMaterial({color:'#e9c24b',transparent:true,opacity:.28,depthWrite:false,side:THREE.DoubleSide}));this.beam.position.set(H.x,H.y+6,H.z);this.beam.visible=false;s.add(this.beam);
  this.vortex=new THREE.Group();[1,1.7,2.4].forEach((r,i)=>{const t=new THREE.Mesh(new THREE.TorusGeometry(r,.06,6,32).rotateX(Math.PI/2),new THREE.MeshBasicMaterial({color:i%2?'#2bb5c9':'#c2308a'}));this.vortex.add(t)});this.vortex.visible=false;s.add(this.vortex);
  this.cc=V(1.1,2.3,5.4);this.cl=V(0,.8,-6)}
 zAt(cd){return PZ-cd-.2}
 setTod(tod){this.tod=tod;const c=C(SKY[this.loc||0][0]);if(tod==='senja')c.lerp(C('#e8885a'),.45);if(tod==='malam')c.lerp(C('#0b1530'),.78);
  this.s.background=c;this.s.fog=new THREE.Fog(c,28,95);const n=tod==='malam';
  this.hemi.intensity=n?.6:1;this.sun.intensity=n?.7:tod==='senja'?1.7:2.2;this.sun.color.set(n?'#7f9bdc':tod==='senja'?'#ffb36b':'#ffffff');
  this.moon.visible=n;this.water.material.color.set(WAT[this.loc||0]).multiplyScalar(n?.6:1);(this.cl3||[]).forEach(g=>g.visible=!n&&this.loc!==4)}
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
  this.amb=[];const pool=this.fish.filter(f=>f.hab.some(x=>x.n===NAMES[i]&&x.c!=='event'));
  for(let k=0;k<Math.min(8,pool.length*2);k++){const m=makeFish(pool[k%pool.length]);m.scale.setScalar(.45+Rn()*.4);E.add(m);this.amb.push({m,cx:(Rn()-.5)*14,cz:-5-Rn()*14,r:2+Rn()*4,sp:.25+Rn()*.3,y:-1.6-Rn()*2.4,ph:Rn()*6,d:Rn()<.5?1:-1})}
  this.setTod(this.tod||'siang')}
 ringAt(v,col='#fff',mx=2,sp=1.5){const m=this.rg.find(x=>!x.visible);if(!m)return;m.visible=true;m.material.color.set(col);m.position.copy(v);m.userData={l:1,sp,mx};m.scale.setScalar(.1)}
 ring(cd,col,mx=1.8){this.ringAt(V(0,.05,this.zAt(cd)),col,mx)}
 burstAt(v,col,n,up=4,spread=1){if(this.low)n=Math.ceil(n/4);for(let i=0;i<n;i++){const m=this.pt.find(x=>!x.visible);if(!m)return;m.visible=true;m.position.copy(v);m.material.color.set(col);m.userData.v.set((Math.random()-.5)*spread*2,up*(.4+Math.random()),(Math.random()-.5)*spread*2);m.userData.l=.8+Math.random()*.8;m.scale.setScalar(.6+Math.random()*1.2)}}
 splash(cd,n=14){this.burstAt(V(0,.1,this.zAt(cd)),'#dfeaf2',n,4,.9)}
 mkFish(f){if(this.fm)this.s.remove(this.fm);const m=makeFish(f);m.rotation.order='YZX';this.fL=cl(.35+Math.cbrt(f.weight)*.4,.4,3.6);m.scale.setScalar(this.fL);this.s.add(m);this.fm=m;this.fk=f.id+f.sc;this.py0=undefined}
 catchFx(f,ix){const w=this.fm?this.fm.position:V(0,-1,0);this.cs.copy(w);this.ix=ix;this.hf=false;const col=RC[f.rarity],b=V(w.x,.1,w.z);
  this.burstAt(b,ix?col:'#dfeaf2',10+ix*10,5+ix,1.5);this.ringAt(V(w.x,.05,w.z),col,3+ix,1.5);if(ix>=3)this.ringAt(V(w.x,.05,w.z),col,6+ix,1);
  if(ix===5){this.vortex.visible=true;this.vortex.position.set(w.x,.1,w.z)}}
 holdFx(){const ix=this.ix,col=RC[Object.keys(RC)[ix]];this.burstAt(H,col,14+ix*14,2.5,3);if(ix>=3){this.ringAt(V(H.x,H.y-.4,H.z),col,2.5,1.3);this.ringAt(V(H.x,H.y,H.z),col,3.5,.9)}
  if(ix>=4)this.beam.visible=true;if(ix===5)this.burstAt(H,'#2bb5c9',50,3,3.5)}
 frame(dt,G,S,rod,tod){
  const cv=this.cv,w=cv.clientWidth||1,h=cv.clientHeight||1;
  if(w!==this.w||h!==this.h){this.w=w;this.h=h;this.r.setSize(w,h,false);this.cam.aspect=w/h;this.cam.fov=w/h<1?74:52;this.cam.updateProjectionMatrix()}
  if(S.loc!==this.loc)this.build(S.loc);if(tod!==this.tod)this.setTod(tod);
  this.low=!S.opt.fx;const t=(this.t+=dt),st=G.st,por=this.cam.aspect<1;
  const a=this.wp.array,b=this.wb;for(let i=0;i<a.length;i+=3){const x=b[i],z=b[i+2];a[i+1]=Math.sin(x*.45+t*1.3)*.07+Math.cos(z*.38+t*1.0)*.07+Math.sin((x+z)*.2+t*.6)*.05}this.wp.needsUpdate=true;
  this.rm.color.set({Starter:'#8a6a44',Common:'#5f9a4a',Rare:'#243a5c',Epic:'#2a6fa8',Legendary:'#14181f'}[rod.tier]||'#8a6a44');this.rm.emissive.set(rod.tier==='Legendary'?'#2bb5c9':'#000000');this.rm.emissiveIntensity=.6;
  let ta=-1;if(st==='charge')ta=.1+G.pw/100*.5;else if(st==='cast')ta=-1.35+Math.min(1,G.t/.7)*.35;else if(st==='fight')ta=-.95+G.pump*.45;
  this.ra+=(ta-this.ra)*Math.min(1,14*dt);this.rod.rotation.x=this.ra;
  const tb=st==='fight'?G.ten*.0055:st==='bite'?.1:.03;this.bd+=(tb-this.bd)*Math.min(1,10*dt);this.segs.forEach((m,i)=>m.rotation.x=-this.bd*(.6+i*.3));
  this.handle.rotation.y+=(G.reel&&st==='fight'?16:0)*dt;this.rod.updateMatrixWorld(true);this.tipO.getWorldPosition(this.tp);
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
   else if(inF){const p=Math.min(1,G.ct/G.cdur),e=1-Math.pow(1-p,3),c0=this.cs,Lc=Math.min(L,1.7);
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
  const base=por?V(1.4,3.4,7.4):V(1.1,2.3,5.4),look=V(0,.8,-6);
  if(st==='charge')look.z=-6-G.pw*.05;
  if(st==='fight'&&this.fm){look.set(this.fm.position.x*.4,.2,(PZ+this.fm.position.z)/2-2)}
  if((st==='catch'||st==='result')&&this.ix>=2){const k=Math.sin(Math.min(1,G.ct/G.cdur)*Math.PI*.5);base.lerp(V(H.x+.9,H.y,H.z+2.6),k*.55);look.lerp(H,k)}
  this.cc.lerp(base,Math.min(1,4*dt));this.cl.lerp(look,Math.min(1,4*dt));this.cam.position.copy(this.cc);
  if(this.shake>0){this.shake-=dt;this.cam.position.x+=(Math.random()-.5)*.14*(this.shake/.5);this.cam.position.y+=(Math.random()-.5)*.14*(this.shake/.5)}
  this.cam.lookAt(this.cl);
  for(const m of this.pt)if(m.visible){const d=m.userData;d.l-=dt;d.v.y-=9*dt;m.position.addScaledVector(d.v,dt);if(d.l<=0||m.position.y<-.3)m.visible=false}
  for(const m of this.rg)if(m.visible){const d=m.userData;d.l-=dt*d.sp*.5;m.scale.setScalar(.1+(1-d.l)*d.mx);m.material.opacity=Math.max(0,d.l);if(d.l<=0)m.visible=false}
  for(const o of this.amb||[]){const an=o.ph+t*o.sp*o.d;o.m.position.set(o.cx+Math.cos(an)*o.r,o.y,o.cz+Math.sin(an)*o.r*.6);o.m.rotation.y=Math.atan2(-Math.cos(an)*.6*o.d,-Math.sin(an)*o.d);animateFish(o.m,t+o.ph,.4)}
  for(const g of this.cl3||[]){g.position.x+=dt*.6;if(g.position.x>70)g.position.x=-70}
  if(this.plk)this.plk.rotation.y=t*.03;
  this.r.render(this.s,this.cam)}
}
