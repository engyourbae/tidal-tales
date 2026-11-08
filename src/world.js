import * as THREE from 'three';
import {makeFish,animateFish,RC,RN,colorOf} from './fish3d.js';
import {Rooms} from './rooms.js';
const V=(x,y,z)=>new THREE.Vector3(x,y,z),C=c=>new THREE.Color(c),PZ=1.6;
const SKY=[['#a9d6e5','#5b7f4a'],['#b8c7cf','#6f7d52'],['#b9c79a','#3e4f2c'],['#8fd3dc','#d8c48a'],['#1d2a4a','#262e44']];
const WAT=['#2f7f9e','#4a7a86','#5a6b3c','#1f93a8','#14224a'],NAMES=['Willow Lake','Misty River','Mangrove Marsh','Coral Bay','Abyssal Trench'];
const H=V(0,1.4,PZ+.55),cl=(v,a,b)=>Math.max(a,Math.min(b,v));
export class World{
 constructor(cv){
  this.cv=cv;this.t=0;this.shake=0;this.low=false;this.fish=[];this.ix=0;this.cs=V(0,-1,0);
  this.r=new THREE.WebGLRenderer({canvas:cv,antialias:true});this.r.setPixelRatio(Math.min(devicePixelRatio||1,2));
  const s=this.s=new THREE.Scene();this.cam=new THREE.PerspectiveCamera(52,1,.1,160);
  this.hemi=new THREE.HemisphereLight('#ffffff','#445566',1);this.sun=new THREE.DirectionalLight('#ffffff',2);this.sun.position.set(-6,10,6);s.add(this.hemi,this.sun);
  const wg=new THREE.PlaneGeometry(140,140,70,70);wg.rotateX(-Math.PI/2);this.wp=wg.attributes.position;wg.setAttribute('color',new THREE.BufferAttribute(new Float32Array(wg.attributes.position.count*3).fill(1),3));this.wc=wg.attributes.color;this.wb=Float32Array.from(this.wp.array);
  this.water=new THREE.Mesh(wg,new THREE.MeshStandardMaterial({color:'#2f7f9e',roughness:.2,metalness:.1,flatShading:true,vertexColors:true,transparent:true,opacity:.86}));s.add(this.water);
  this.dome=new THREE.Mesh(new THREE.SphereGeometry(112,24,16),new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide,fog:false,depthWrite:false}));this.dome.position.set(0,-6,-10);this.dome.renderOrder=-10;this.dome.geometry.setAttribute('color',new THREE.BufferAttribute(new Float32Array(this.dome.geometry.attributes.position.count*3),3));s.add(this.dome);
  const bed=new THREE.Mesh(new THREE.PlaneGeometry(140,140).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:'#1b3a4a',roughness:1}));bed.position.y=-5;s.add(bed);
  this.moon=new THREE.Mesh(new THREE.SphereGeometry(3,16,12),new THREE.MeshBasicMaterial({color:'#f3f0dc',fog:false}));this.moon.position.set(-22,26,-70);s.add(this.moon);
  const mm=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.8,flatShading:true,...o}),wood=mm('#7a5a3a');
  const add=(g,m,x,y,z,p=s)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);p.add(o);return o};
  for(let i=0;i<9;i++)add(new THREE.BoxGeometry(6.6,.08,.48),mm(i%2?'#7a5a3a':'#86643f'),0,.52,.2+i*.5);
  for(const x of[-3.1,3.1])add(new THREE.BoxGeometry(.14,.14,4.6),mm('#4c3823'),x,.42,2.2);
  for(const x of[-3,0,3])for(const z of[.2,2.2,4.2])add(new THREE.CylinderGeometry(.12,.12,3,6),mm('#4c3823'),x,-.9,z);
  for(const x of[-3.1,3.1]){for(const z of[.4,1.6,2.8,4])add(new THREE.BoxGeometry(.08,.7,.08),mm('#5a3d24'),x,.9,z);add(new THREE.BoxGeometry(.06,.06,3.7),mm('#5a3d24'),x,1.25,2.2)}
  add(new THREE.CylinderGeometry(.05,.06,1.7,6),mm('#2a2018'),-3.1,1.45,.4);add(new THREE.SphereGeometry(.13,8,6),new THREE.MeshBasicMaterial({color:'#ffd98a'}),-3.1,2.4,.4);
  this.lantern=new THREE.PointLight('#ffcf80',0,10);this.lantern.position.set(-3.1,2.4,.4);s.add(this.lantern);
  add(new THREE.CylinderGeometry(.2,.16,.3,8),mm('#b8543a'),-1.3,.8,1.2);add(new THREE.BoxGeometry(.5,.25,.3),mm('#2f6f7a'),1.2,.7,2.6);add(new THREE.TorusGeometry(.18,.05,5,10).rotateX(Math.PI/2),mm('#c9b27a'),1.3,.6,.9);
  const P=this.pl=new THREE.Group();P.position.set(0,.6,PZ);s.add(P);
  const jk=mm('#2f6f7a'),pn=mm('#3b4252'),sk=mm('#e0b48a'),bt=mm('#2a2018');
  this.legs=[];for(const x of[-.12,.12]){const lg=new THREE.Group();lg.position.set(x,.55,0);P.add(lg);add(new THREE.CylinderGeometry(.1,.09,.5,7).translate(0,-.25,0),pn,0,0,0,lg);add(new THREE.BoxGeometry(.18,.12,.3),bt,0,-.5,-.04,lg);this.legs.push(lg)}
  const TB=this.tb=new THREE.Group();TB.position.set(0,.55,0);P.add(TB);
  add(new THREE.CylinderGeometry(.27,.31,.75,8),jk,0,.37,0,TB);add(new THREE.BoxGeometry(.42,.55,.24),mm('#8a5a2a'),0,.4,.28,TB);add(new THREE.CylinderGeometry(.09,.09,.5,8).rotateZ(Math.PI/2),mm('#c2582f'),0,.75,.28,TB);
  const HD=this.head=new THREE.Group();HD.position.set(0,.88,0);TB.add(HD);
  add(new THREE.SphereGeometry(.2,12,10),sk,0,.02,0,HD);add(new THREE.CylinderGeometry(.34,.34,.04,12),mm('#e9a23b'),0,.13,0,HD);add(new THREE.CylinderGeometry(.2,.22,.17,12),mm('#e9a23b'),0,.22,0,HD);add(new THREE.CylinderGeometry(.225,.225,.05,12),mm('#2f4858'),0,.15,0,HD);
  for(const x of[-.07,.07])add(new THREE.SphereGeometry(.025,6,5),mm('#101a2b'),x,.02,-.18,HD);
  const shR=new THREE.Object3D(),shL=new THREE.Object3D();shR.position.set(.3,.65,0);shL.position.set(-.3,.65,0);TB.add(shR,shL);
  this.hands=[0,1].map(()=>{const o=new THREE.Mesh(new THREE.SphereGeometry(.06,8,6),sk);s.add(o);return o});
  const jl=()=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(.075,.065,1,7),jk);s.add(o);return o};
  this.arms=[{up:jl(),lo:jl(),sh:shR,sg:1},{up:jl(),lo:jl(),sh:shL,sg:-1}];
  this.rod=new THREE.Group();this.rod.position.set(.3,.37,-.3);TB.add(this.rod);this.ra=-1;this.bd=0;
  this.rm=mm('#8a6a44');let par=this.rod;this.segs=[];this.lan=[];
  add(new THREE.CylinderGeometry(.045,.045,.42,8).translate(0,-.21,0),mm('#d9b98a'),0,0,0,this.rod);
  for(let i=0;i<3;i++){const g=new THREE.CylinderGeometry(.014-i*.003,.03-i*.007,1,6);g.translate(0,.5,0);const m=new THREE.Mesh(g,this.rm);m.position.y=i?1:0;par.add(m);this.segs.push(m);par=m;add(new THREE.TorusGeometry(.035,.007,5,10).rotateX(Math.PI/2),mm('#c0c8d0'),0,.55,.04,m);const an=new THREE.Object3D();an.position.set(0,.55,.04);m.add(an);this.lan.push(an)}
  this.tipO=new THREE.Object3D();this.tipO.position.y=1;par.add(this.tipO);this.tp=V(0,2,0);
  const RLG=new THREE.Group();RLG.position.set(0,.3,-.03);this.segs[0].add(RLG);const sv=mm('#9aa5b1',{metalness:.6,roughness:.35}),dk=mm('#2f3a46',{metalness:.4});
  add(new THREE.BoxGeometry(.05,.14,.04),dk,0,0,0,RLG);add(new THREE.CylinderGeometry(.012,.012,.1,6).rotateX(Math.PI/2),sv,0,0,-.05,RLG);
  const BD=new THREE.Group();BD.position.set(0,.01,-.11);RLG.add(BD);
  add(new THREE.SphereGeometry(1,12,9),sv,0,0,0,BD).scale.set(.055,.08,.05);
  add(new THREE.CylinderGeometry(.045,.045,.012,12).rotateZ(Math.PI/2),dk,.05,0,0,BD);add(new THREE.CylinderGeometry(.045,.045,.012,12).rotateZ(Math.PI/2),dk,-.05,0,0,BD);
  const SP=new THREE.Group();SP.position.set(0,.075,0);BD.add(SP);
  add(new THREE.LatheGeometry([[0,0],[.068,0],[.068,.012],[.046,.022],[.046,.052],[.062,.062],[.062,.072],[0,.072]].map(p=>new THREE.Vector2(p[0],p[1])),18),mm('#e9a23b',{metalness:.5,roughness:.4}),0,0,0,SP);
  add(new THREE.CylinderGeometry(.049,.049,.03,14),mm('#eef2f7',{roughness:1}),0,.037,0,SP);add(new THREE.CylinderGeometry(.02,.02,.012,8),dk,0,.078,0,SP);
  this.sAn=new THREE.Object3D();this.sAn.position.set(.05,.04,0);SP.add(this.sAn);
  this.rotor=new THREE.Group();this.rotor.position.set(0,.008,0);BD.add(this.rotor);
  add(new THREE.CylinderGeometry(.075,.072,.02,16),dk,0,0,0,this.rotor);add(new THREE.TorusGeometry(.078,.005,4,14,Math.PI),sv,0,.01,0,this.rotor);add(new THREE.SphereGeometry(.009,6,5),sv,0,.088,0,this.rotor);
  this.rAn=new THREE.Object3D();this.rAn.position.set(0,.088,0);this.rotor.add(this.rAn);
  this.handle=new THREE.Group();this.handle.position.set(.066,0,0);BD.add(this.handle);
  add(new THREE.CylinderGeometry(.006,.006,.11,5).translate(0,.055,0),sv,0,0,0,this.handle);add(new THREE.SphereGeometry(.016,8,6),mm('#d1493f'),.012,.11,0,this.handle);
  this.hRo=new THREE.Object3D();this.hRo.position.set(0,.05,0);this.rod.add(this.hRo);this.hLo=new THREE.Object3D();this.hLo.position.set(0,.6,0);this.rod.add(this.hLo);
  const bob=this.bob=new THREE.Group();bob.add(new THREE.Mesh(new THREE.SphereGeometry(.13,10,6,0,6.283,0,1.5708),mm('#d1493f')),new THREE.Mesh(new THREE.SphereGeometry(.13,10,6,0,6.283,1.5708,1.5708),mm('#eef2f7')));
  const stick=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,.3,5),mm('#d1493f'));stick.position.y=.2;bob.add(stick);s.add(bob);this.bp=V(0,0,0);
  const N=30;this.lg=new THREE.BufferGeometry();this.lg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(N*3),3));this.lm=new THREE.LineBasicMaterial({color:'#ffffff'});this.line=new THREE.Line(this.lg,this.lm);this.line.frustumCulled=false;s.add(this.line);
  this.pt=[];const pg=new THREE.BoxGeometry(.07,.07,.07);for(let i=0;i<140;i++){const m=new THREE.Mesh(pg,new THREE.MeshBasicMaterial({color:'#fff'}));m.visible=false;m.userData={v:V(0,0,0),l:0};s.add(m);this.pt.push(m)}
  this.rg=[];const rgeo=new THREE.RingGeometry(.92,1,40).rotateX(-Math.PI/2);for(let i=0;i<28;i++){const m=new THREE.Mesh(rgeo,new THREE.MeshBasicMaterial({color:'#fff',transparent:true,side:THREE.DoubleSide,depthWrite:false}));m.visible=false;m.userData={l:0,sp:1,mx:2};s.add(m);this.rg.push(m)}
  this.beam=new THREE.Mesh(new THREE.CylinderGeometry(.45,.45,16,16,1,true),new THREE.MeshBasicMaterial({color:'#e9c24b',transparent:true,opacity:.28,depthWrite:false,side:THREE.DoubleSide}));this.beam.position.set(H.x,H.y+6,H.z);this.beam.visible=false;s.add(this.beam);
  this.vortex=new THREE.Group();[1,1.7,2.4].forEach((r,i)=>{const t=new THREE.Mesh(new THREE.TorusGeometry(r,.06,6,32).rotateX(Math.PI/2),new THREE.MeshBasicMaterial({color:i%2?'#2bb5c9':'#c2308a'}));this.vortex.add(t)});this.vortex.visible=false;s.add(this.vortex);
  this.inp={x:0,y:0,boost:false};this.cc=V(1.1,2.3,5.4);this.cl=V(0,.8,-6);this.initFx()}
 setLimb(o,a,b,th=1){const d=V(0,0,0).subVectors(b,a),l=d.length()||.001;o.position.copy(a).addScaledVector(d,.5);o.scale.set(th,l,th);o.quaternion.setFromUnitVectors(V(0,1,0),d.normalize())}
 initFx(){const s=this.s;this.wx='clear';this.wamp=1;this.flash=0;this.lt=3;this.bt=0;this.mtT=0;this.rrT=0;
  this.sunD=new THREE.Mesh(new THREE.SphereGeometry(4,16,12),new THREE.MeshBasicMaterial({color:'#ffe9a8',fog:false}));this.sunD.position.set(30,30,-75);s.add(this.sunD);
  const sp=[];for(let i=0;i<240;i++){const th=Math.random()*6.283,ph=Math.acos(Math.random()*.85+.1);sp.push(90*Math.sin(ph)*Math.cos(th),90*Math.cos(ph),-90*Math.sin(ph)*Math.sin(th))}
  this.stars=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(sp,3)),new THREE.PointsMaterial({color:'#ffffff',size:2.2,sizeAttenuation:false,fog:false}));this.stars.visible=false;s.add(this.stars);
  const fp=[];for(let i=0;i<45;i++)fp.push((Math.random()<.5?-1:1)*(5+Math.random()*10),.4+Math.random()*2,1-Math.random()*14);this.ffb=Float32Array.from(fp);
  this.ff=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(fp.slice(),3)),new THREE.PointsMaterial({color:'#e9e27a',size:.12}));this.ff.visible=false;this.ff.frustumCulled=false;s.add(this.ff);
  this.rd=Array.from({length:520},()=>({x:(Math.random()-.5)*26,y:Math.random()*14,z:3-Math.random()*36,s:12+Math.random()*8}));
  this.rain=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(new Float32Array(520*6),3)),new THREE.LineBasicMaterial({color:'#bcd2e8',transparent:true,opacity:.5}));this.rain.frustumCulled=false;this.rain.visible=false;s.add(this.rain);
  this.bolts=[0,1,2].map(()=>{const g=new THREE.Group(),bg=new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(new Float32Array(36),3));for(const dx of[-.06,0,.06]){const l=new THREE.Line(bg,new THREE.LineBasicMaterial({color:'#eef4ff'}));l.position.x=dx;l.frustumCulled=false;g.add(l)}g.visible=false;g.userData={l:0};s.add(g);return g});this.bi=0;
  this.mt=[];for(let i=0;i<4;i++){const g=new THREE.Group(),core=new THREE.Mesh(new THREE.IcosahedronGeometry(.55,0),new THREE.MeshStandardMaterial({color:'#5b4032',emissive:'#ff7a2a',emissiveIntensity:1,flatShading:true})),
   f1=new THREE.Mesh(new THREE.ConeGeometry(.5,2.4,6),new THREE.MeshBasicMaterial({color:'#ff7a2a',transparent:true,opacity:.85,depthWrite:false})),f2=new THREE.Mesh(new THREE.ConeGeometry(.28,1.6,6),new THREE.MeshBasicMaterial({color:'#ffd27a',transparent:true,opacity:.9,depthWrite:false})),tl=new THREE.Mesh(new THREE.ConeGeometry(.45,7,6),new THREE.MeshBasicMaterial({color:'#ff9a3a',transparent:true,opacity:.28,depthWrite:false}));
   f1.position.y=1.4;f2.position.y=1;tl.position.y=4.2;g.add(core,f1,f2,tl);g.visible=false;g.userData={l:0,a:V(0,0,0),b:V(0,0,0),d:2,core,f1,f2,tl};s.add(g);this.mt.push(g)}
  this.orb=new THREE.Group();for(let i=0;i<8;i++)this.orb.add(new THREE.Mesh(new THREE.SphereGeometry(.07,6,5),new THREE.MeshBasicMaterial({color:'#ffffff'})));this.orb.visible=false;s.add(this.orb);this.spin=0;this.sm=[];const sg=new THREE.IcosahedronGeometry(1,0);for(let i=0;i<70;i++){const m=new THREE.Mesh(sg,new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.5,depthWrite:false}));m.visible=false;m.userData={l:0,d:1,v:V(0,0,0),s:.3};s.add(m);this.sm.push(m)}}
 animChar(dt,G,st,t){const P=this.pl,tb=this.tb,hd=this.head,tap=G.tapP||0,k=Math.min(1,dt*8),hold=st==='catch'||st==='result'||st==='flex'||!!this.rd,sw=G.swT>0&&st==='fight',br=Math.sin(t*1.8);
  let lx=0,lz=0,hy=Math.sin(t*.5)*.35,hx=Math.sin(t*.9)*.05,by=0;
  if(st==='charge'){lx=.12+G.pw/100*.22;hy=0;hx=.05}
  else if(st==='cast'){lx=-.3+Math.min(1,G.t/.7)*.3;hy=0;hx=-.1}
  else if(st==='wait'){hy=Math.sin(t*.4)*.12;hx=.12;lx=.02}
  else if(st==='bite'){lx=-.1;hx=-.08;hy=0;by=Math.abs(Math.sin(t*14))*.03}
  else if(st==='fight'){const d=G.swDir;lx=.2-tap*.18+(sw&&d==='U'?-.12:sw&&d==='D'?.14:0);lz=sw?(d==='L'?-.2:d==='R'?.2:0):Math.sin(t*3)*.03;hy=0;hx=.05;by=-tap*.03}
  else if(hold){lx=-.1;hy=Math.sin(t*1.1)*.18;hx=-.12;by=Math.abs(Math.sin(t*2.2))*.025}
  tb.rotation.x+=(lx+br*.015-tb.rotation.x)*k;tb.rotation.z+=(lz-tb.rotation.z)*k;tb.scale.y=1+br*.012;
  hd.rotation.y+=(hy-hd.rotation.y)*k;hd.rotation.x+=(hx-hd.rotation.x)*k;
  P.position.y=.6+by+br*.006;P.rotation.z=Math.sin(t*.6)*.025;
  const sp=st==='fight'?.14:.05;this.legs.forEach((l,i)=>{l.rotation.z+=((i?1:-1)*sp-l.rotation.z)*k;l.rotation.x=Math.sin(t*.6+i)*.03});
  P.rotation.y+=((hold?Math.PI:0)-P.rotation.y)*Math.min(1,dt*6);
  this.spin+=(G.spinV||0)*dt;this.handle.rotation.x=this.spin;this.rotor.rotation.y=this.spin*1.8;
  this.rod.rotation.x=this.ra+tap*.08;this.rod.rotation.z=Math.sin(t*.7)*.01+(st==='fight'?Math.sin(t*28)*.012*tap:0);this.rod.visible=!hold}
 updArms(hold){const P=this.pl,ps=P.scale.x,sw=V(0,0,0),tg=V(0,0,0),q=new THREE.Quaternion();P.getWorldQuaternion(q);
  this.arms.forEach((a,i)=>{a.sh.getWorldPosition(sw);
   if(this.rideH)tg.copy(this.rideH[i]);else if(hold&&this.hp){const sd=sw.x>=P.position.x?1:-1;tg.set(this.hp.x+.42*sd,this.hp.y-.1,this.hp.z-.03)}else(i?this.hLo:this.hRo).getWorldPosition(tg);
   const d=V(0,0,0).subVectors(tg,sw),l=d.length(),mx=.95*ps;if(l>mx)tg.copy(sw).addScaledVector(d,mx/l);
   const el=sw.clone().add(tg).multiplyScalar(.5).add(V(1,0,0).applyQuaternion(q).multiplyScalar(a.sg*.13*ps)).add(V(0,-.1*ps,0));
   this.setLimb(a.up,sw,el,ps);this.setLimb(a.lo,el,tg,ps);this.hands[i].position.copy(tg);this.hands[i].scale.setScalar(ps)})}
 smoke(v,col='#ffffff',n=1,size=1){if(this.low&&Math.random()<.6)return;for(let i=0;i<n;i++){const m=this.sm.find(x=>!x.visible);if(!m)return;m.visible=true;m.position.copy(v).add(V((Math.random()-.5)*.12,0,(Math.random()-.5)*.12));m.material.color.set(col);const d=m.userData;d.l=0;d.d=1.3+Math.random()*.8;d.v.set((Math.random()-.5)*.12,.35+Math.random()*.3,(Math.random()-.5)*.12);d.s=size*(.05+Math.random()*.05);d.o=.3;m.scale.setScalar(d.s)}}
 updSmoke(dt){for(const m of this.sm)if(m.visible){const d=m.userData;d.l+=dt/d.d;if(d.l>=1){m.visible=false;continue}m.position.addScaledVector(d.v,dt);m.scale.setScalar(d.s*(1+d.l*2.2));m.material.opacity=d.o*(1-d.l)*Math.min(1,d.l*6);m.rotation.y+=dt*.6}}
 rodAura(dt,G,rod,hold){if(hold)return;const col={Rare:'#3b73c9',Epic:'#7b4fb8',Legendary:'#2bb5c9'}[rod.tier],fr=(G.en||0)>=66;if(!col&&!fr)return;this.auT=(this.auT||0)-dt;if(this.auT>0)return;this.auT=fr?.07:col?.22:.3;
  const c=fr?'#e9a23b':col,p=this.tp.clone().lerp(this.rod.getWorldPosition(V(0,0,0)),Math.random()*.9);this.smoke(p,c,1,.6);if(Math.random()<.4)this.burstAt(p,c,1,1.3,.15)}
 setMode(m){this.mode=m;this.dome.visible=m!=='aqua'&&m!=='room';if(m==='aqua'){this.ensureTank();this.s.background=C('#0b1220');this.s.fog=null;this.hemi.intensity=.7;this.sun.intensity=.5;this.sun.color.set('#cfe4ff')}else this.applyEnv()}
 ensureTank(){if(this.tank)return;const s=this.s,T=this.tank=new THREE.Group();T.position.set(300,0,0);s.add(T);this.af=[];this.pls=[];this.bb=[];
  const W=this.TW=26,H=this.TH=10,D=this.TD=10,Y0=this.TY=1.2,TOP=Y0+H;this.azm=1;this.sel=-1;
  const mm=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.8,flatShading:true,...o}),add=(g,m,x,y,z,p=T)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);p.add(o);return o},Bx=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
  add(Bx(90,.4,60),mm('#1d2330'),0,-.2,0);add(Bx(90,40,.4),mm('#141b2c'),0,20,-16);
  for(let k=-3;k<=3;k++)add(Bx(.5,24,.3),mm('#1c2540'),k*10,12,-15.8);
  add(Bx(W+1,1,D+1),mm('#3a2a1a'),0,.5,0);add(Bx(W+1.4,.2,D+1.4),mm('#1b2433'),0,1.1,0);
  add(Bx(W,.6,D),mm('#d8c48a'),0,Y0+.3,0);
  add(Bx(W,H,D),mm('#bfe8f2',{transparent:true,opacity:.07,depthWrite:false}),0,Y0+H/2,0);add(Bx(W-.1,H-.2,D-.1),mm('#2f8fb0',{transparent:true,opacity:.2,depthWrite:false}),0,Y0+H/2-.1,0);
  for(const x of[-W/2,W/2])for(const z of[-D/2,D/2])add(Bx(.25,H,.25),mm('#0f1520'),x,Y0+H/2,z);
  add(Bx(W+.4,.25,D+.4),mm('#0f1520'),0,TOP+.1,0);add(Bx(W-2,.1,.6),mm('#ffffff',{emissive:'#cfeaff',emissiveIntensity:1}),0,TOP-.05,0);
  for(const x of[-8,0,8]){const pl=new THREE.PointLight('#cfeaff',1.3,22);pl.position.set(x,TOP-.8,1);T.add(pl)}
  const R=((sd)=>()=>(sd=sd*16807%2147483647)/2147483647)(77),ico=new THREE.IcosahedronGeometry(1,1),cone=new THREE.ConeGeometry(1,2.4,6),sph=new THREE.SphereGeometry(1,6,5);
  for(let k=0;k<26;k++){const x=-W/2+1+R()*(W-2),z=-D/2+.8+R()*(D*.55),g=new THREE.Group();g.position.set(x,Y0+.6,z);T.add(g);const n=4+Math.floor(R()*5);for(let j=0;j<n;j++)add(sph,mm(j%2?'#3f9e6e':'#4a7a3a'),0,j*.32,0,g).scale.set(.14,.22,.14);this.pls.push(g)}
  for(let k=0;k<14;k++){const o=add(ico,mm('#6b7078'),-W/2+1+R()*(W-2),Y0+.7,-D/2+1+R()*(D-2));o.scale.set(.4+R()*.8,.3+R()*.5,.4+R()*.8)}
  ['#e46a6a','#e9a23b','#c2308a','#2bb5c9'].forEach((c,k)=>{for(let j=0;j<2;j++)add(cone,mm(c),-W/2+3+k*6+j*1.8,Y0+1.2,-D/2+1.2+R()*2).scale.setScalar(.35+R()*.45)});
  add(Bx(1.6,.9,1.1),mm('#7a4a1a'),W/2-3,Y0+.9,D/2-2.4);add(Bx(1.7,.35,1.2),mm('#a4723a'),W/2-3,Y0+1.5,D/2-2.4);
  for(let k=0;k<60;k++){const b=add(new THREE.SphereGeometry(.05,6,5),new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.5}),0,0,0);b.userData={s:Math.random(),bx:[-9,-2,6,10][k%4]+(Math.random()-.5)*.6,bz:-2+Math.random()*3,y:Y0+.8+Math.random()*H};this.bb.push(b)}
  // penggaris ukuran: 1 unit = 60 cm
  const lab=(txt,x,y,z,sc=1.1)=>{const c=document.createElement('canvas');c.width=128;c.height=48;const g=c.getContext('2d');g.font='bold 30px system-ui';g.fillStyle='#fff';g.textAlign='center';g.fillText(txt,64,34);const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false}));sp.scale.set(sc*2.2,sc*.82,1);sp.position.set(x,y,z);T.add(sp)};
  const ms=100/60;add(Bx(W-1,.08,.08),mm('#ffffff',{emissive:'#ffffff',emissiveIntensity:.6}),0,Y0+.62,D/2+.05);
  for(let m=0;m*ms<=W-1;m++){const x=-W/2+.5+m*ms;add(Bx(.07,m%5?.28:.5,.07),mm('#ffffff',{emissive:'#ffffff',emissiveIntensity:.6}),x,Y0+.62+(m%5?.14:.25),D/2+.05);if(m%2===0||m<6)lab(m+' m',x,Y0+1.35,D/2+.1,.7)}
  add(Bx(.08,H-1,.08),mm('#ffffff',{emissive:'#ffffff',emissiveIntensity:.6}),-W/2-.2,Y0+H/2,D/2+.05);
  for(let m=0;m*ms<H-1.2;m++){add(Bx(.4,.07,.07),mm('#ffffff',{emissive:'#ffffff',emissiveIntensity:.6}),-W/2-.2,Y0+.6+m*ms,D/2+.05);lab(m+' m',-W/2-1.1,Y0+.6+m*ms,D/2+.1,.7)}
  this.selRing=new THREE.Mesh(new THREE.TorusGeometry(1,.035,6,36),new THREE.MeshBasicMaterial({color:'#ffe08a',transparent:true,opacity:.9,depthWrite:false}));this.selRing.visible=false;T.add(this.selRing)}
 aqLen(f){return cl((f.len||30)/60,.22,7.5)}
 aqFish(list){this.ensureTank();(this.af||[]).forEach(o=>this.tank.remove(o.m));this.sel=-1;this.selRing.visible=false;
  const W=this.TW,H=this.TH,D=this.TD,Y0=this.TY;
  this.af=list.map((f,i)=>{const m=makeFish(f,false,f.mut),L=this.aqLen(f);m.scale.setScalar(L);m.rotation.order='YZX';
   m.position.set((Math.random()-.5)*(W-3-L),Y0+1.6+L*.2+Math.random()*(H-3.4-L*.4),(Math.random()-.5)*(D-2.4-L*.4));this.tank.add(m);return{m,L,v:V(0,0,0),tg:V(0,3,0),tm:0,sp:.4,ph:Math.random()*6,glow:!!f.mut||RN.indexOf(f.rarity)>=3,mu:f.mut,f,i}})}
 aqPick(nx,ny){if(!this.af||!this.af.length)return -1;const rc=this.rc=this.rc||new THREE.Raycaster();rc.setFromCamera({x:nx,y:ny},this.cam);const hit=rc.intersectObjects(this.af.map(o=>o.m),true);if(!hit.length)return -1;let o=hit[0].object;while(o&&!this.af.some(a=>a.m===o))o=o.parent;return o?this.af.findIndex(a=>a.m===o):-1}
 aqSelect(i){this.sel=i}
 frameAqua(dt,t){const T=this.tank,por=this.cam.aspect<1,ang=this.ang,W=this.TW,H=this.TH,D=this.TD,Y0=this.TY,TOP=Y0+H,af=this.af;
  for(const o of af){const L=o.L,hx=W/2-.8-L*.55,hz=Math.max(.3,D/2-.8-L*.3),y0=Y0+1.1+L*.18,y1=TOP-.9-L*.18;o.tm-=dt;
   if(o.tm<=0){o.tm=2.5+Math.random()*4.5;o.tg.set((Math.random()*2-1)*Math.max(.5,hx),y0+Math.random()*Math.max(.2,y1-y0),(Math.random()*2-1)*hz);o.sp=(.28+Math.random()*.45)*(.7+Math.sqrt(L)*.45)}
   const d=V(0,0,0).subVectors(o.tg,o.m.position),dl=d.length();if(dl>.05)d.multiplyScalar(1/dl);
   for(const q of af){if(q===o)continue;const dx=o.m.position.x-q.m.position.x,dy=o.m.position.y-q.m.position.y,dz=o.m.position.z-q.m.position.z,r=(o.L+q.L)*.5,dd=dx*dx+dy*dy+dz*dz;if(dd<r*r&&dd>.0001){const k=(1-Math.sqrt(dd)/r)*1.4/Math.sqrt(dd);d.x+=dx*k;d.y+=dy*k*.6;d.z+=dz*k}}
   o.v.lerp(d.normalize().multiplyScalar(o.sp),Math.min(1,1.2*dt));o.m.position.addScaledVector(o.v,dt);
   const p=o.m.position;p.x=cl(p.x,-hx-.3,hx+.3);p.y=cl(p.y,y0,y1);p.z=cl(p.z,-hz,hz);
   const sp=o.v.length();if(sp>.03){o.m.rotation.y+=ang(o.m.rotation.y,Math.atan2(-o.v.z,o.v.x))*Math.min(1,3*dt);o.m.rotation.z+=(Math.asin(cl(o.v.y/sp,-1,1))*.8-o.m.rotation.z)*Math.min(1,3*dt)}
   animateFish(o.m,t+o.ph,.2+sp*1.2/Math.sqrt(L));if(o.glow)o.m.userData.mats.forEach(m=>{m.emissiveIntensity=m.userData.e0*(1+.5*Math.sin(t*3+o.ph))});
   if(o.mu&&Math.random()<dt*3)this.smoke(o.m.position.clone().add(T.position),o.mu.c,1,.5*Math.min(2,L))}
  this.pls.forEach((g,i)=>g.rotation.z=Math.sin(t*.8+i)*.1);
  this.bb.forEach(b=>{const u=b.userData;u.y+=dt*(.6+u.s);if(u.y>TOP-.2){u.y=Y0+.8;u.s=Math.random()}b.position.set(u.bx+Math.sin(t*3+u.s*9)*.08,u.y,u.bz)});
  const sel=this.sel>=0?af[this.sel]:null;this.selRing.visible=!!sel;if(sel){this.selRing.position.copy(sel.m.position);this.selRing.scale.setScalar(sel.L*.75+.4);this.selRing.rotation.set(Math.PI/2,0,0);this.selRing.material.opacity=.55+.35*Math.sin(t*5)}
  const tf=Math.tan(this.cam.fov*Math.PI/360),fitH=(H+2.2)/2/tf,fitW=(W+1.5)/2/(tf*this.cam.aspect),fit=por?Math.max(fitH,fitW*.5):Math.max(fitH,fitW),dist=(fit+D*.5)*(this.azm||1),azd=this.azd||0;
  const cx=por?azd*(W*.36):0,az=por?Math.sin(t*.15)*.12:Math.sin(t*.15)*.2+azd;
  this.cam.position.set(300+cx+Math.sin(az)*dist,Y0+H*.5+1.2+Math.sin(t*.3)*.1,Math.cos(az)*dist);this.cam.lookAt(300+cx,Y0+H*.45,0);
  if(this.onAqLabel){if(sel){const v=sel.m.position.clone().add(T.position);v.y+=sel.L*.35+.3;v.project(this.cam);this.onAqLabel(v.x*.5+.5,(1-v.y)*.5,v.z<1,sel.i)}else this.onAqLabel(0,0,false,-1)}
  this.updSmoke(dt);this.r.render(this.s,this.cam)}
 startFlex(f,ix){this.ix=ix;this.mu=f.mut;this.hf=false;this.fyaw=0;this.shot=-1;this.cs.set(0,1.4,PZ+.55)}
 snap(){this.r.render(this.s,this.cam);return this.cv.toDataURL('image/png')}
 setRoom(type,d){this.mode='room';this.dome.visible=false;this.s.background=new THREE.Color('#10192b');this.s.fog=null;this.hemi.intensity=.9;this.sun.intensity=.9;this.sun.color.set('#ffffff');(this.rooms=this.rooms||new Rooms(this)).show(type,d)}
 roomTab(tab){if(this.mode==='room'&&this.rooms&&this.rooms.type==='shop'){this.rooms.tab=tab;return true}return false}
 roomDex(f,dark){if(this.rooms)this.rooms.dexFish(f,dark)}
 setOmen(col,meteor){this.omenCol=col;this.omenMeteor=!!meteor;this.wx='omen';this.applyEnv()}
 zap(col){const b=this.bolts[this.bi=(this.bi+1)%this.bolts.length];b.children.forEach(l=>l.material.color.set(col));const x0=(Math.random()-.5)*36,z0=-12-Math.random()*28,q=b.children[0].geometry.attributes.position;let bx=x0;
  for(let i=0;i<12;i++){bx+=(Math.random()-.5)*3;q.setXYZ(i,bx,34-i*3.1,z0)}q.needsUpdate=true;b.visible=true;b.userData.l=.22;this.flash=1;this.flashCol=col;this.burstAt(V(bx,.1,z0),col,14,5,1.5);this.ringAt(V(bx,.05,z0),col,5,1.4);this.onThunder&&this.onThunder()}
 zAt(cd){return Math.min(-.6,this.pl.position.z-cd-.2)}
 setTod(tod){this.tod=tod;this.applyEnv()}
 setWeather(w){this.wx=w;this.applyEnv()}
 paintSky(c,n,wx,om){const d=this.dome,pa=d.geometry.attributes.position,ca=d.geometry.attributes.color,top=c.clone().lerp(C(n||wx==='meteor'||om?'#02040c':wx==='storm'?'#1a2230':wx==='rain'?'#44566e':'#2b66b5'),n||om?.65:.5),hz=c.clone().lerp(C('#ffffff'),n||om||wx==='storm'?0:.12),o=C('#000');for(let i=0;i<pa.count;i++){const y=pa.getY(i)/112,k=Math.pow(Math.max(0,y),.55);o.copy(hz).lerp(top,k);ca.setXYZ(i,o.r,o.g,o.b)}ca.needsUpdate=true;d.visible=true}
 applyEnv(){if(this.mode==='aqua'||this.mode==='room')return;const tod=this.tod||'siang',wx=this.wx||'clear',n=tod==='malam',L=this.loc||0,c=C(SKY[L][0]);
  if(tod==='senja')c.lerp(C('#e8885a'),.45);if(n)c.lerp(C('#0b1530'),.78);
  if(wx==='rain')c.lerp(C('#6b7785'),.5);if(wx==='storm')c.lerp(C('#2c3440'),.78);if(wx==='meteor')c.lerp(C('#070d22'),.8);
  const om=wx==='omen';if(om){c.lerp(C('#1a0a18'),.9);if(this.omenCol)c.lerp(C(this.omenCol),.12)}
  const dark=n||wx==='meteor'||om,sc=om?(this.omenCol||'#b03a5a'):dark?'#7f9bdc':tod==='senja'?'#ffb36b':wx==='storm'?'#9aa8bc':'#ffffff';
  this.base={hi:dark?.6:wx==='storm'?.55:wx==='rain'?.8:1,si:om?.5:dark?.7:wx==='storm'?.6:wx==='rain'?1.2:tod==='senja'?1.7:2.2,sc};
  this.paintSky(c,n,wx,om);this.s.background=c;this.s.fog=new THREE.Fog(c,om?8:wx==='storm'?12:wx==='rain'?20:28,om?48:wx==='storm'?60:95);
  this.hemi.intensity=this.base.hi;this.sun.intensity=this.base.si;this.sun.color.set(sc);
  this.moon.visible=dark;this.moon.material.color.set(om?(this.omenCol||'#c0392b'):'#f3f0dc');this.sunD.visible=!dark&&wx==='clear';this.stars.visible=dark;
  this.water.material.color.set(WAT[L]).multiplyScalar(dark?.6:wx==='storm'?.55:1).lerp(C('#5a1a2a'),om?.45:0);
  (this.cl3||[]).forEach(g=>g.visible=!dark&&L!==4);this.ff.visible=(tod!=='siang'||n)&&L<4&&wx!=='storm'&&!om;
  this.lantern.intensity=dark||tod==='senja'||wx==='storm'?1.6:0;this.rain.visible=wx==='rain'||wx==='storm';this.wamp=om?2:wx==='storm'?2.4:wx==='rain'?1.3:1}
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
 wave(x,z,t){return(Math.sin(x*.45+t*1.3)*.07+Math.cos(z*.38+t*1.0)*.07+Math.sin((x+z)*.2+t*.6)*.05)*(this.wamp||1)}
 ang(a,b){return Math.atan2(Math.sin(b-a),Math.cos(b-a))}
 moveStep(dt,G,t,st){const P=this.pl,i=this.inp||{x:0,y:0};
  if(this.rd){this.rideStep(dt,G,t);return}
  this.rideH=null;P.scale.setScalar(1);const m=Math.hypot(i.x,i.y);let walking=false;
  if(st==='idle'&&m>.12){const k=Math.min(1,m),sp=3.1*k;P.position.x=cl(P.position.x+i.x/m*sp*dt,-2.7,2.7);P.position.z=cl(P.position.z+i.y/m*sp*dt,.9,4.1);this.hd=Math.atan2(-i.x/m,-i.y/m);this.wk=(this.wk||0)+dt*(6+sp*1.2);walking=true}
  else if(st!=='idle')this.hd=0;
  if(st==='idle'){this.hdc=(this.hdc||0)+this.ang(this.hdc||0,this.hd||0)*Math.min(1,dt*10);P.rotation.y=this.hdc}else this.hdc=P.rotation.y;
  if(walking){const w=this.wk;this.legs.forEach((l,k)=>{l.rotation.x=Math.sin(w+k*Math.PI)*.55});P.position.y+=Math.abs(Math.sin(w))*.05;this.tb.rotation.x-=.05}
  this.walking=walking}
 ensureItems(){if(this.itm)return;const g=this.itm=new THREE.Group();g.visible=false;this.s.add(g);this.items=[];
  const sg=new THREE.SphereGeometry(1,10,8),og=new THREE.OctahedronGeometry(1,0);
  for(let k=0;k<24;k++){const o=new THREE.Group(),core=new THREE.Mesh(sg,new THREE.MeshBasicMaterial({color:'#fff'})),halo=new THREE.Mesh(sg,new THREE.MeshBasicMaterial({color:'#fff',transparent:true,opacity:.22,depthWrite:false})),oc=new THREE.Mesh(og,new THREE.MeshBasicMaterial({color:'#7ff3ff'}));
   halo.scale.setScalar(1.9);o.add(core,halo,oc);o.userData={core,halo,oc,k:'p',ph:Math.random()*6,x:0,z:0};g.add(o);this.items.push(o);this.spawnItem(o,true)}}
 spawnItem(o,far){const d=o.userData,r=Math.random(),R=this.rd;d.k=r<.72?'p':r<.94?'g':'c';
  const col={p:'#f4f7ff',g:'#ffd24a',c:'#5ff0ff'}[d.k],sz={p:.22,g:.32,c:.3}[d.k];d.core.material.color.set(col);d.halo.material.color.set(col);d.core.visible=d.k!=='c';d.oc.visible=d.k==='c';d.sz=sz;d.core.scale.setScalar(sz);d.halo.scale.setScalar(sz*2.3);d.oc.scale.setScalar(sz*1.1);
  let x,z,n=0;do{x=(Math.random()-.5)*25;z=-4-Math.random()*42;n++}while(R&&!far&&Math.hypot(x-R.x,z-R.z)<10&&n<8);d.x=x;d.z=z}
 startRide(f){if(this.rd)return null;const m=makeFish(f,false,f.mut);m.rotation.order='YZX';const L=cl(1.7+Math.cbrt(f.weight)*.45,1.9,4.4);m.scale.setScalar(L);this.s.add(m);
  const ix=RN.indexOf(f.rarity),P=this.pl,x0=cl(P.position.x,-2.4,2.4),z0=-1.7-L*.35,D1=m.children[0]?m.children[0].scale.y:.2;
  this.rd={m,L,f,x:x0,z:z0,vx:0,vz:0,yaw:Math.PI/2,roll:0,ph:'mount',t:0,from:P.position.clone(),to:null,stam:100,exh:false,boost:false,top:Math.max(.12,D1)*L,ps:.5,fx:0,fz:-1,
   spd:rideSpeed(f),dist:0,rt:0,sink:0,auto:null,spray:0};
  this.dur=.7+Math.hypot(x0-P.position.x,z0-P.position.z)*.08;this.ensureItems();this.itm.visible=true;this.rideH=[V(0,0,0),V(0,0,0)];this.fk=0;return this.rd}
 stopRide(){const R=this.rd;if(!R||R.ph==='dis'||R.ph==='mount')return;R.ph='dis';R.t=0;R.from=this.pl.position.clone();R.to=V(cl(R.x,-2.4,2.4),.6,1.3);R.auto=null}
 goHome(){const R=this.rd;if(R&&R.ph==='ride')R.auto={x:cl(R.x,-2,2),z:-2.2}}
 rideStep(dt,G,t){const R=this.rd,P=this.pl,m=R.m,L=R.L,i=this.inp||{x:0,y:0,boost:false};R.t+=dt;
  const fy=this.wave(R.x,R.z,t)-.06*L+Math.sin(t*2.6)*.03;
  const seat=(o)=>{const fx=R.fx,fz=R.fz;o.set(R.x+fx*L*.05,fy+R.top-.27+.03,R.z+fz*L*.05)};
  if(R.ph==='ride'||R.ph==='dis'){
   let ix=i.x,iy=i.y,mg=Math.hypot(ix,iy);
   if(R.ph==='dis'){ix=iy=mg=0}
   else if(R.auto){if(mg>.25)R.auto=null;else{const dx=R.auto.x-R.x,dz=R.auto.z-R.z,dl=Math.hypot(dx,dz);if(dl<1.3){this.stopRide();ix=iy=mg=0}else{ix=dx/dl;iy=dz/dl;mg=1}}}
   const want=R.ph==='ride'&&i.boost&&!R.exh&&R.stam>0&&mg>.1;R.boost=want;
   if(want){R.stam=Math.max(0,R.stam-30*dt);if(R.stam<=0)R.exh=true}else{R.stam=Math.min(100,R.stam+(mg>.1?12:22)*dt);if(R.exh&&R.stam>=30)R.exh=false}
   const tv=mg>.05?Math.min(1,mg)*R.spd*(want?1.9:1):0,tx=mg>.05?ix/mg*tv:0,tz=mg>.05?iy/mg*tv:0,k=Math.min(1,dt*(2.4-L*.18));
   R.vx+=(tx-R.vx)*k;R.vz+=(tz-R.vz)*k;R.x+=R.vx*dt;R.z+=R.vz*dt;
   if(R.x>13.5){R.x=13.5;R.vx=Math.min(0,R.vx)}if(R.x<-13.5){R.x=-13.5;R.vx=Math.max(0,R.vx)}if(R.z<-47){R.z=-47;R.vz=Math.max(0,R.vz)}if(R.z>-1.2&&R.ph==='ride'){R.z=-1.2;R.vz=Math.min(0,R.vz)}
   const sp=Math.hypot(R.vx,R.vz);R.dist+=sp*dt;let ty=R.yaw;if(sp>.4)ty=Math.atan2(-R.vz,R.vx);const da=this.ang(R.yaw,ty);R.yaw+=da*Math.min(1,dt*(4.2-L*.35));
   R.roll+=(cl(-da*.7,-.45,.45)-R.roll)*Math.min(1,dt*5);R.fx=Math.cos(R.yaw);R.fz=-Math.sin(R.yaw);R.sp=sp;
   R.spray-=dt;if(sp>1.2&&R.spray<=0){R.spray=want?.05:.16;const bx=R.x-R.fx*L*.45,bz=R.z-R.fz*L*.45;this.burstAt(V(bx,.05,bz),want?'#ffffff':'#dfeaf2',want?3:1,1.6+sp*.15,.5);if(Math.random()<.4)this.ringAt(V(bx,.04,bz),'#dfeaf2',1.2+L*.4,1.6)}
   // item pickup + magnet
   for(const o of this.items){const d=o.userData,dx=d.x-R.x,dz=d.z-R.z,dl=Math.hypot(dx,dz);if(dl<4&&R.ph==='ride'){d.x-=dx/dl*dt*(4-dl)*2.2;d.z-=dz/dl*dt*(4-dl)*2.2}
    if(R.ph==='ride'&&dl<.9+L*.45){const col={p:'#f4f7ff',g:'#ffd24a',c:'#5ff0ff'}[d.k];this.burstAt(V(d.x,.5,d.z),col,14,4,1.2);this.ringAt(V(d.x,.05,d.z),col,2.4,1.6);this.onItem&&this.onItem(d.k);this.spawnItem(o)}}
  }
  if(R.ph==='mount'||R.ph==='dis'){const dur=R.ph==='mount'?this.dur:.9,p=Math.min(1,R.t/dur),e=p*p*(3-2*p),a=R.ph==='mount'?R.from:R.from,sp_=V(0,0,0);
   if(R.ph==='mount'){seat(sp_);P.position.lerpVectors(a,sp_,e);P.scale.setScalar(1+(R.ps-1)*e);const hh=Math.sin(p*Math.PI)*(1.2+L*.2);P.position.y+=hh;
    if(p>=1){R.ph='ride';R.t=0;this.burstAt(V(R.x,.1,R.z),'#dfeaf2',22,5,1.4);this.ringAt(V(R.x,.05,R.z),'#ffffff',4,1.4);this.onRide&&this.onRide('mounted')}}
   else{P.position.lerpVectors(a,R.to,e);P.scale.setScalar(R.ps+(1-R.ps)*e);P.position.y+=Math.sin(p*Math.PI)*1.4;R.sink+=dt;
    if(p>=1){P.position.copy(R.to);P.scale.setScalar(1);this.hdc=0;this.hd=0;this.endRide();return}}}
  else seat(P.position);
  if(R.ph==='dis'){R.x+=R.fx*dt*1.2;R.z+=R.fz*dt*1.2;m.scale.setScalar(Math.max(.01,L*(1-Math.min(1,R.sink/.95))))}
  m.position.set(R.x,fy-(R.ph==='ride'||R.ph==='mount'?0:R.sink*.6),R.z);m.rotation.y=R.yaw;m.rotation.x=R.roll;m.rotation.z=R.boost?.1:Math.sin(t*2)*.03;
  animateFish(m,t,.25+Math.min(1,(R.sp||0)/10)*.9);
  if(m.userData.mats&&(R.f.mut||RN.indexOf(R.f.rarity)>=3))m.userData.mats.forEach(q=>{q.emissiveIntensity=q.userData.e0*(1+.5*Math.sin(t*4))});
  if(R.f.mut&&Math.random()<dt*10)this.smoke(V(R.x-R.fx*L*.4,fy+.2,R.z-R.fz*L*.4),R.f.mut.c,1,.6);
  // pose
  const ps=P.scale.x,sp1=Math.min(1,(R.sp||0)/10);P.rotation.y=Math.atan2(-R.fx,-R.fz);
  this.tb.rotation.x=-.1-sp1*.28-(R.boost?.12:0);this.tb.rotation.z=R.roll*.6;this.head.rotation.x=.1+sp1*.2;this.head.rotation.y=0;
  this.legs.forEach((l,k)=>{l.rotation.x=1.1;l.rotation.z=(k?1:-1)*(.4+Math.sin(t*3+k)*.04)});
  const fx=R.fx,fz=R.fz,sx=-fz,sz=fx;this.rideH.forEach((h,k)=>{const sg=k?-1:1;h.set(R.x+fx*(L*.05+.32*ps/.5*.5)+sx*sg*.17*ps/.5*.5,fy+R.top+.08,R.z+fz*(L*.05+.32*ps/.5*.5)+sz*sg*.17*ps/.5*.5)});
  // items anim
  if(this.itm){for(const o of this.items){const d=o.userData;o.position.set(d.x,.45+Math.sin(t*2+d.ph)*.15+this.wave(d.x,d.z,t),d.z);d.oc.rotation.y=t*2;d.halo.material.opacity=.18+.1*Math.sin(t*4+d.ph)}}
  }
 endRide(){const R=this.rd;if(!R)return;this.s.remove(R.m);this.rd=null;this.rideH=null;this.itm.visible=false;this.pl.scale.setScalar(1);this.cam.fov=this.cam.aspect<1?74:52;this.cam.updateProjectionMatrix();this.onRide&&this.onRide('end')}
 rideCam(base,look,dt){const R=this.rd;if(!R)return;const L=R.L,por=this.cam.aspect<1;
  base.set(R.x*.85,3.4+L*.55+(por?1.6:0),R.z+6.2+L*.9+(por?2.5:0));look.set(R.x,.3+L*.15,R.z-3.2);
  const kk=((R.boost?9:0)-(this.fk||0))*Math.min(1,dt*4);this.fk=(this.fk||0)+kk;const fv=(por?74:52)+this.fk;if(Math.abs(this.cam.fov-fv)>.05){this.cam.fov=fv;this.cam.updateProjectionMatrix()}}
 ringAt(v,col='#fff',mx=2,sp=1.5){const m=this.rg.find(x=>!x.visible);if(!m)return;m.visible=true;m.material.color.set(col);m.position.copy(v);m.userData={l:1,sp,mx};m.scale.setScalar(.1)}
 ring(cd,col,mx=1.8){this.ringAt(V(this.pl.position.x,.05,this.zAt(cd)),col,mx)}
 burstAt(v,col,n,up=4,spread=1){if(this.low)n=Math.ceil(n/4);for(let i=0;i<n;i++){const m=this.pt.find(x=>!x.visible);if(!m)return;m.visible=true;m.position.copy(v);m.material.color.set(col);m.userData.v.set((Math.random()-.5)*spread*2,up*(.4+Math.random()),(Math.random()-.5)*spread*2);m.userData.l=.8+Math.random()*.8;m.scale.setScalar(.6+Math.random()*1.2)}}
 splash(cd,n=14){this.burstAt(V(this.pl.position.x,.1,this.zAt(cd)),'#dfeaf2',n,4,.9)}
 mkFish(f){if(this.fm)this.s.remove(this.fm);const m=makeFish(f,false,f.mut);m.userData.mut=f.mut;m.rotation.order='YZX';this.fL=cl(.35+Math.cbrt(f.weight)*.4,.4,3.6);m.scale.setScalar(this.fL);this.s.add(m);this.fm=m;this.fk=f.id+f.sc;this.mcol=f.mut?f.mut.c:colorOf(f);this.py0=undefined}
 catchFx(f,ix){const w=this.fm?this.fm.position:V(0,-1,0),mu=f.mut,col=mu?mu.c:RC[f.rarity];this.cs.copy(w);this.fyaw=0;this.shot=-1;this.ix=ix;this.mu=mu;this.hf=false;
  this.burstAt(V(w.x,.1,w.z),ix||mu?col:'#dfeaf2',10+ix*10+(mu?20:0),5+ix,1.5);this.ringAt(V(w.x,.05,w.z),col,3+ix,1.5);if(ix>=3||mu)this.ringAt(V(w.x,.05,w.z),col,6+ix,1);
  this.orb.children.forEach(o=>o.material.color.set(col));this.smoke(V(w.x,.2,w.z),col,3,1);
  if(ix===5||(mu&&mu.orb)){this.vortex.visible=true;this.vortex.position.set(w.x,.1,w.z)}}
 holdFx(){const ix=this.ix,mu=this.mu,col=mu?mu.c:RC[Object.keys(RC)[ix]];this.burstAt(H,col,14+ix*14+(mu?30:0),2.5,3);this.smoke(V(H.x,H.y,H.z),col,4,1);
  if(ix>=3||mu){this.ringAt(V(H.x,H.y-.4,H.z),col,2.5,1.3);this.ringAt(V(H.x,H.y,H.z),col,3.5,.9)}
  if(ix>=4||mu)this.beam.visible=true;this.beam.material.color.set(mu?mu.c:'#e9c24b');if(ix===5||(mu&&mu.orb))this.burstAt(H,'#2bb5c9',50,3,3.5)}
 frame(dt,G,S,rod,tod){
  const cv=this.cv,w=cv.clientWidth||1,h=cv.clientHeight||1;
  if(w!==this.w||h!==this.h){this.w=w;this.h=h;this.r.setSize(w,h,false);this.cam.aspect=w/h;this.cam.fov=w/h<1?74:52;this.cam.updateProjectionMatrix()}
  const vo=this.mode==='aqua'||this.mode==='room';if(vo)this.cam.setViewOffset(w,h,0,Math.round(h*(this.mode==='aqua'?.12:.2)),w,h);else if(this._vo)this.cam.clearViewOffset();this._vo=vo;
  if(S.loc!==this.loc)this.build(S.loc);if(tod!==this.tod)this.setTod(tod);
  this.low=!S.opt.fx;const t=(this.t+=dt),st=G.st,por=this.cam.aspect<1;if(this.mode==='aqua'){this.frameAqua(dt,t);return}if(this.mode==='room'){this.rooms.frame(dt,t);this.updSmoke(dt);this.r.render(this.s,this.cam);return}
  const a=this.wp.array,b=this.wb;for(let i=0;i<a.length;i+=3){const x=b[i],z=b[i+2];a[i+1]=(Math.sin(x*.45+t*1.3)*.07+Math.cos(z*.38+t*1.0)*.07+Math.sin((x+z)*.2+t*.6)*.05)*(this.wamp||1);const cc=Math.min(1,.82+a[i+1]*1.7+Math.max(0,Math.sin(x*.9-t*1.7+z*.6))*.06),ci=(i/3)*3,ca=this.wc.array;ca[ci]=ca[ci+1]=cc;ca[ci+2]=Math.min(1,cc+.04)}this.wp.needsUpdate=true;this.wc.needsUpdate=true;
  this.rm.color.set({Starter:'#8a6a44',Common:'#5f9a4a',Rare:'#243a5c',Epic:'#2a6fa8',Legendary:'#14181f'}[rod.tier]||'#8a6a44');this.rm.emissive.set(rod.tier==='Legendary'?'#2bb5c9':'#000000');this.rm.emissiveIntensity=.6;
  let ta=-1;if(st==='charge')ta=.1+G.pw/100*.5;else if(st==='cast')ta=-1.35+Math.min(1,G.t/.7)*.35;else if(st==='fight')ta=-.95+G.pump*.45;
  this.ra+=(ta-this.ra)*Math.min(1,14*dt);this.rod.rotation.x=this.ra;
  const tb=st==='fight'?G.ten*.0055:st==='bite'?.1:.03;this.bd+=(tb-this.bd)*Math.min(1,10*dt);this.segs.forEach((m,i)=>m.rotation.x=-this.bd*(.6+i*.3));
  H.set(this.pl.position.x,1.4,this.pl.position.z+.55);this.beam.position.set(H.x,H.y+6,H.z);this.animChar(dt,G,st,t);this.moveStep(dt,G,t,st);this.pl.updateMatrixWorld(true);this.tipO.getWorldPosition(this.tp);
  const tp=this.tp,bz=this.zAt(G.cd||6),bp=this.bp;
  if(st==='cast'){const k=Math.min(1,G.t/.7);bp.set(tp.x+(this.pl.position.x-tp.x)*k,tp.y*(1-k)+.1*k+Math.sin(k*Math.PI)*3.2,tp.z+(bz-tp.z)*k)}
  else if(st==='wait'||st==='bite')bp.set(this.pl.position.x+Math.sin(t*.7)*.05,.02+Math.sin(t*2.2)*.02-(st==='bite'?.14+Math.sin(t*30)*.03:0),bz);
  else bp.set(tp.x,tp.y-1,tp.z);
  const inF=st==='fight'||st==='catch'||st==='result'||st==='flex',holdMode=st==='catch'||st==='result'||st==='flex';this.bob.visible=!inF;this.bob.position.copy(bp);
  if(G.f&&(!this.fm||this.fk!==G.f.id+G.f.sc))this.mkFish(G.f);
  if(!G.f&&this.fm){this.s.remove(this.fm);this.fm=null;this.fk=null}
  let end=bp;
  if(this.fm){const fm=this.fm,L=this.fL;let px=bp.x,py=-.8-L*.3,pz=bz,sp=.4,yaw=Math.PI/2+Math.sin(t*20)*.3,pitch=0;
   if(st==='fight'){const k=G.dist/100,sur=G.surge>0,pr=sur?1-G.surge/.8:0,sn=Math.sin(pr*Math.PI);
    px=this.pl.position.x+Math.sin(t*1.6)*1.3*k+(sur?sn*1.6*(Math.sin(this.fk.length*3+Math.floor(t))>0?1:-1)*k:0);pz=tp.z+(bz-tp.z)*k;
    py=-1-L*.35-(sur&&!G.jumper?sn*.8:0)+(sur&&G.jumper?sn*(1.2+L):0);if(G.swT>0&&G.swDir){px+=G.swDir==='L'?-1.8:G.swDir==='R'?1.8:0;py+=G.swDir==='U'?1.3:G.swDir==='D'?-1:0}sp=(.3+.7*G.sta/100)*(sur?1.4:1)+(G.swT>0?.6:0);yaw=Math.PI/2+Math.sin(t*2)*.5+(sur?Math.sin(t*14)*.4:0);
    if(this.py0!==undefined)pitch=cl((py-this.py0)/Math.max(dt,.008)*.12,-.7,.7)}
   else if(inF){const p=Math.min(1,G.ct/G.cdur),e=1-Math.pow(1-p,3),c0=this.cs,ix=this.ix,F=this.F=this.F||V(0,0,0);F.set(this.pl.position.x,1.15+Math.min(.5,L*.1),this.pl.position.z+.55);
    px=c0.x+(F.x-c0.x)*e;pz=c0.z+(F.z-c0.z)*e;py=c0.y+(F.y-c0.y)*e+Math.sin(p*Math.PI)*(1.8+L*.3)+(p>=1?Math.sin(t*2)*.04:0);
    yaw=e*6.283*(ix>=3||this.mu?2:1)+(p>=1?Math.sin(t*1.2)*.12+(this.fyaw||0):0);pitch=(1-e)*.5+(p>=1?Math.sin(t*1.6)*.05:0);sp=.9;
    fm.scale.setScalar(L);if(p>=.5&&!this.hf){this.hf=true;this.holdFx()}
    if(p>=1&&this.hf){const hi=ix>=4||this.mu,col=this.mu?this.mu.c:RC[Object.keys(RC)[ix]];this.smk=(this.smk||0)-dt;if(this.smk<=0){this.smk=hi?.13:.28;if(ix>=2||this.mu)this.smoke(V(px+(Math.random()-.5)*L*.6,py-.05,pz+.1),col,1,hi?1:.7)}if(ix>=5&&Math.sin(t*2.2)>.985)this.ringAt(V(px,py-.5,pz),col,3,1)}}
   if(this.py0!==undefined&&(this.py0<0)!==(py<0))this.burstAt(V(px,.1,pz),'#dfeaf2',16,4.5,1);
   this.py0=py;fm.position.set(px,py,pz);(this.hp=this.hp||V(0,0,0)).set(px,py,pz);fm.rotation.y=yaw;fm.rotation.z=pitch;animateFish(fm,t,sp);if(inF&&this.hf&&fm.userData.mats)fm.userData.mats.forEach(m=>{m.emissiveIntensity=m.userData.e0*(1+.5*Math.sin(t*4))});
   if(inF){const q=fm.scale.x*.5;end=this.mo||(this.mo=V(0,0,0));end.set(px+Math.cos(yaw)*q,py,pz-Math.sin(yaw)*q)}}
  const la=this.lg.attributes.position,N=la.count,len=tp.distanceTo(end),taut=st==='fight'?Math.min(1,G.ten/100):0,sag=(1-taut)*(.15+len*.035),hot=st==='fight'&&G.ten>85,aw=V(0,0,0),anc=[this.sAn,this.rAn,...this.lan,this.tipO];
  this.lm.color.set(hot?'#ff6b5f':'#ffffff');
  anc.forEach((o,i)=>{o.getWorldPosition(aw);la.setXYZ(i,aw.x,aw.y,aw.z)});
  const K=anc.length;for(let i=K;i<N;i++){const u=(i-K+1)/(N-K),j=hot?Math.sin(t*80+i)*.03:0;la.setXYZ(i,tp.x+(end.x-tp.x)*u+j,tp.y+(end.y-tp.y)*u-Math.sin(u*Math.PI)*sag,tp.z+(end.z-tp.z)*u)}la.needsUpdate=true;this.line.visible=!holdMode;
  if(st==='idle'||st==='charge'){this.beam.visible=this.vortex.visible=false}
  this.vortex.children.forEach((m,i)=>m.rotation.y=t*(i+1)*1.5);this.vortex.rotation.y=t;
  const base=por?V(.9,2.2,4.3):V(.75,1.8,3.3),look=V(.1,1,-5);
  if(st==='charge')look.z=-5-G.pw*.05;
  if(st==='fight'&&this.fm){look.set(this.fm.position.x*.4,.2,(this.pl.position.z+this.fm.position.z)/2-2)}
  {const ox=this.pl.position.x,oz=this.pl.position.z-PZ;base.x+=ox*.85;base.z+=oz;if(st!=='fight'){look.x+=ox*.9;look.z+=oz}}
  if(this.rd){this.bob.visible=false;this.line.visible=false;this.rideCam(base,look,dt)}
  if(holdMode&&this.fm){const L=this.fL,tf=Math.tan(this.cam.fov*Math.PI/360),d=Math.max(3.4,L*1.35*1.15/(2*tf*this.cam.aspect),Math.max(2.4,L*.6+1.7)/(2*tf)),p=st==='catch'?Math.min(1,G.ct/G.cdur):1,hi=this.ix>=3||!!this.mu,th=hi?[.22,.45,.7]:[.4],si=p>=1?th.length:th.filter(x=>p>x).length,hp=this.hp||V(0,1,PZ);
   if(si<th.length){const k=hi?si:0;base.set(...[[hp.x+2.6,Math.max(1.5,hp.y+.5),hp.z+2.6],[hp.x-2.8,Math.max(1.7,hp.y+.8),hp.z+2],[hp.x+1,Math.max(2.2,hp.y+1.5),hp.z+3.4]][k]);look.set(hp.x,hp.y+.1,hp.z);if(si!==this.shot){this.shot=si;this.cc.copy(base);this.cl.copy(look)}}
   else{base.set(this.pl.position.x,1.5+Math.min(.7,L*.12),this.pl.position.z+.55+d);look.set(this.pl.position.x,1.25,this.pl.position.z);this.shot=si}}
  this.cc.lerp(base,Math.min(1,(this.rd?5.5:4)*dt));this.cl.lerp(look,Math.min(1,(this.rd?6:4)*dt));this.cam.position.copy(this.cc);
  if(this.wx==='storm'){this.cam.position.x+=Math.sin(t*1.3)*.04;this.cam.position.y+=Math.sin(t*1.9)*.03}
  if(this.shake>0){this.shake-=dt;this.cam.position.x+=(Math.random()-.5)*.14*(this.shake/.5);this.cam.position.y+=(Math.random()-.5)*.14*(this.shake/.5)}
  this.cam.lookAt(this.cl);
  for(const m of this.pt)if(m.visible){const d=m.userData;d.l-=dt;d.v.y-=9*dt;m.position.addScaledVector(d.v,dt);if(d.l<=0||m.position.y<-.3)m.visible=false}
  for(const m of this.rg)if(m.visible){const d=m.userData;d.l-=dt*d.sp*.5;m.scale.setScalar(.1+(1-d.l)*d.mx);m.material.opacity=Math.max(0,d.l);if(d.l<=0)m.visible=false}
  for(const o of this.amb||[]){const an=o.ph+t*o.sp*o.d;o.m.position.set(o.cx+Math.cos(an)*o.r,o.y,o.cz+Math.sin(an)*o.r*.6);o.m.rotation.y=Math.atan2(-Math.cos(an)*.6*o.d,-Math.sin(an)*o.d);animateFish(o.m,t+o.ph,.4);
   if(o.j>0){o.j-=dt;const p=1-o.j/1.2,y0=o.m.position.y;o.m.position.y=o.y+Math.sin(p*Math.PI)*(1.5-o.y);o.m.rotation.z=Math.cos(p*Math.PI)*.8;const up=o.m.position.y>0;if(up!==!!o.up){o.up=up;this.burstAt(V(o.m.position.x,.1,o.m.position.z),'#dfeaf2',12,4,1);this.ringAt(V(o.m.position.x,.05,o.m.position.z),'#ffffff',2.4,1.5)}}else{o.m.rotation.z=0;if(!this.rd&&Math.random()<dt*.05)o.j=1.2}}
  for(const g of this.cl3||[]){g.position.x+=dt*.6;if(g.position.x>70)g.position.x=-70}
  if(this.plk)this.plk.rotation.y=t*.03;
  this.flash=Math.max(0,(this.flash||0)-dt*5);if(this.base){this.hemi.intensity=this.base.hi+this.flash*1.2;this.sun.intensity=this.base.si+this.flash*3;this.sun.color.set(this.flash>.05&&this.flashCol?this.flashCol:this.base.sc)}
  this.heat=Math.max(0,(this.heat||0)-dt*.2);this.water.material.emissive.set(this.heatCol||'#ff7a2a');this.water.material.emissiveIntensity=this.heat*.4;
  const wx=this.wx||'clear';
  if(this.rain.visible){const p=this.rain.geometry.attributes.position.array,sm=wx==='storm',wd=sm?.35:.12;this.rrT-=dt;if(this.rrT<=0){this.rrT=.07;this.ringAt(V((Math.random()-.5)*18,.03,3-Math.random()*22),'#dfeaf2',.5,3)}
   this.rd.forEach((d,i)=>{d.y-=d.s*dt*(sm?1.4:1);d.x+=wd*d.s*dt;if(d.y<0){d.y=14;d.x=(Math.random()-.5)*26-3;d.z=3-Math.random()*36}const o=i*6;p[o]=d.x;p[o+1]=d.y;p[o+2]=d.z;p[o+3]=d.x-wd*.6;p[o+4]=d.y+.8;p[o+5]=d.z});this.rain.geometry.attributes.position.needsUpdate=true}
  if(wx==='storm'||wx==='omen'){this.lt-=dt;if(this.lt<=0){const om=wx==='omen';this.lt=om?.6+Math.random()*1.4:3+Math.random()*6;this.zap(om?(this.omenCol||'#ff5a7a'):'#eef4ff');if(om&&Math.random()<.5)setTimeout(()=>this.zap(this.omenCol||'#ff5a7a'),150)}}
  for(const b of this.bolts)if(b.visible){b.userData.l-=dt;if(b.userData.l<=0)b.visible=false}
  if(wx!=='storm'&&wx!=='omen')this.bolts.forEach(b=>b.visible=false);
  if(wx==='meteor'||(wx==='omen'&&this.omenMeteor)){this.mtT-=dt;if(this.mtT<=0){this.mtT=.9+Math.random()*1.4;const m0=this.mt.find(x=>!x.visible);if(m0){const d=m0.userData,tf=this.fm&&G.f?this.fm.position:null,col=this.mcol||'#ff7a2a';
    d.b.set(tf?tf.x+(Math.random()-.5)*2.5:(Math.random()-.5)*26,0,tf?tf.z+(Math.random()-.5)*2.5:-6-Math.random()*22);d.a.set(d.b.x+(Math.random()-.5)*30,52,d.b.z-30-Math.random()*15);d.l=0;d.d=1.5+Math.random()*.7;d.col=col;
    d.core.material.emissive.set(col);d.f1.material.color.set(col);d.tl.material.color.set(col);m0.visible=true}}}
  for(const m1 of this.mt)if(m1.visible){const d=m1.userData;d.l+=dt/d.d;m1.position.lerpVectors(d.a,d.b,Math.min(1,d.l));m1.quaternion.setFromUnitVectors(V(0,1,0),V(0,0,0).subVectors(d.a,d.b).normalize());
   const fl=1+Math.sin(t*40+d.d*9)*.18;d.f1.scale.set(fl,1+Math.sin(t*33)*.2,fl);d.f2.scale.set(fl,1+Math.sin(t*47)*.25,fl);
   if(Math.random()<.5)this.burstAt(m1.position,d.col||'#ff7a2a',1,.6,.25);if(Math.random()<.3)this.smoke(m1.position,'#6b5a52',1,1.1);
   if(d.l>=1){m1.visible=false;const c=d.col||'#ff7a2a';this.burstAt(d.b,c,30,7,2.4);this.burstAt(d.b,'#ffd27a',14,8,1.1);this.ringAt(V(d.b.x,.05,d.b.z),c,8,.9);this.ringAt(V(d.b.x,.05,d.b.z),'#ffffff',4,1.4);this.smoke(V(d.b.x,.1,d.b.z),'#dfeaf2',4,1.4);this.heat=1;this.heatCol=c;this.flash=.5;this.flashCol=c;this.onMeteor&&this.onMeteor()}}
  if((this.heat||0)>.1&&Math.random()<dt*6){const tf=this.fm&&G.f?this.fm.position:V(0,0,-10);this.smoke(V(tf.x+(Math.random()-.5)*5,.05,tf.z+(Math.random()-.5)*5),'#dfeaf2',1,1.2)}
  if(this.ff.visible){const a2=this.ff.geometry.attributes.position.array;for(let i=0;i<a2.length;i+=3){a2[i]=this.ffb[i]+Math.cos(t*.6+i)*.5;a2[i+1]=this.ffb[i+1]+Math.sin(t*.8+i)*.4}this.ff.geometry.attributes.position.needsUpdate=true}
  const mu=this.fm&&this.fm.userData.mut,show=!!mu&&(st==='catch'||st==='result');this.orb.visible=show;
  if(show){const p=this.fm.position;this.orb.children.forEach((o,k)=>{const an=t*2+k*.785;o.position.set(p.x+Math.cos(an)*(.7+Math.sin(t*3+k)*.12),p.y+Math.sin(t*2+k)*.3,p.z+Math.sin(an)*.7)})}
  this.updArms(holdMode);this.rodAura(dt,G,rod,holdMode);this.updSmoke(dt);
  if(wx==='omen'){this.mi=(this.mi||0)-dt;if(this.mi<=0){this.mi=.35;this.smoke(V((Math.random()-.5)*14,.1,2-Math.random()*14),'#3a1a2a',1,2.2)}}
  this.r.render(this.s,this.cam)}
}

export const rideSpeed=f=>cl(4.2+RN.indexOf(f.rarity)*.6+(f.mut?1.6:0)-Math.min(1.4,Math.log10(1+f.weight)*.7),3,9.5);
export function setLocData(a){SKY.length=0;WAT.length=0;NAMES.length=0;a.forEach(l=>{SKY.push([l.sky,l.bank]);WAT.push(l.wat);NAMES.push(l.name)})}
