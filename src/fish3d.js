import * as THREE from 'three';
export const RN=['Common','Uncommon','Rare','Epic','Legendary','Mythic','Secret'];
export const TIERC={Common:'#ffffff',Uncommon:'#5be37d',Rare:'#4aa3ff',Epic:'#b06cff',Legendary:'#ffc02e',Mythic:'#ff3b3b',Secret:'#19f0d0'};
export const RC={Common:'#7d8996',Uncommon:'#3f9e6e',Rare:'#3b73c9',Epic:'#7b4fb8',Legendary:'#c99512',Mythic:'#c2308a',Secret:'#19e6c4'};
const COLS=[['ungu','#6552c9'],['toska','#19e0c0'],['merah','#c0392b'],['oranye','#e07b39'],['emas','#d9a521'],['safir','#2a4fa8'],['biru','#3b73c9'],['hijau','#4a9a6a'],['cokelat','#7a5230'],['abu','#7b8794'],['perak','#b8c2cc'],['putih','#e8e4d8'],['cyan','#2bb5c9'],['kristal','#9ad7e6'],['zaitun','#7a8a3a'],['transparan','#a7c9d9'],['indigo','#3a3f7a'],['navy','#1f3a6e'],['galaksi','#2d2a6e']];
const ACC=['#eef2f7','#1b2433','#e9a23b','#2bb5c9'];
const hash=s=>[...s].reduce((a,c)=>a*31+c.charCodeAt(0)>>>0,7);
export const colorOf=f=>{const sp0=f.rarity==='Secret'&&SPEC[f.id];if(sp0&&sp0.c)return sp0.c;const s=f.visual_brief.toLowerCase();return(COLS.find(c=>s.includes(c[0]))||[0,'#6b7b8c'])[1]};

export const MUT={albino:{n:'Albino',col:'#f1ece0',em:'#ffffff',ei:.15,eye:'#d1493f',m:1.6,c:'#c9c2ae'},emas:{n:'Emas',col:'#e0b020',em:'#e0b020',ei:.55,m:2.2,c:'#e0b020'},neon:{n:'Neon',col:'#2fd9b5',em:'#2fd9b5',ei:.9,m:2.8,c:'#1fb894'},bayangan:{n:'Bayangan',col:'#1c1c2a',em:'#7b4fb8',ei:.5,eye:'#ff4fb0',m:3.2,c:'#7b4fb8'},kosmik:{n:'Kosmik',col:'#33258a',em:'#c2308a',ei:.7,m:6,c:'#c2308a',orb:true}};

// ---- Mutasi khas tiap ikan Secret: [idIkan, kunci, nama, warnaBadan, warnaCahaya, kuatCahaya, pengali nilai, warnaTag, opsi] ----
const SIG=[
['fish_49','magma','Magma','#7a1c0a','#ff5a1f',.8,4,'#ff5a1f'],['fish_49','kristal_emas','Kristal Emas','#b8860b','#ffd24a',.7,5,'#ffd24a'],
['fish_50','holo','Holografik','#c9d6ff','#ff8af0',.8,4,'#ff8af0',{orb:true}],['fish_50','prisma_gelap','Prisma Gelap','#1a1030','#7cff6b',.8,4.5,'#7cff6b'],
['fish_51','arwah_merah','Arwah Merah','#ffd0d0','#ff2d55',.8,4,'#ff2d55',{eye:'#ff2d55'}],['fish_51','bulan_pucat','Bulan Pucat','#fff7d6','#ffe27a',.7,3.8,'#ffe27a'],
['fish_52','plasma_ungu','Plasma Ungu','#6a2bd8','#c58cff',.9,4.5,'#b06cff'],['fish_52','badai_biru','Badai Biru','#1c4fd8','#8fd0ff',.9,4,'#4aa3ff'],
['fish_53','supernova','Supernova','#ff7a3a','#ffd24a',.9,5,'#ff9a3a',{orb:true}],['fish_53','lubang_hitam','Lubang Hitam','#07070d','#8a5cff',.7,5.5,'#8a5cff'],
['fish_54','sakura','Sakura','#ffe6f0','#ffb3d1',.5,4,'#ffb3d1'],['fish_54','kunang_emas','Kunang Emas','#f2c94c','#fff08a',.8,4.5,'#f2c94c'],
['fish_55','soda_biru','Soda Biru','#7cc4ff','#bfe3ff',.6,4,'#7cc4ff'],['fish_55','cokelat_manis','Cokelat Manis','#6b3a22','#ff9ac7',.35,4,'#c4733a'],
['fish_56','darah_kaisar','Darah Kaisar','#7a0014','#ff2040',.8,4.5,'#ff2040'],['fish_56','giok_malam','Giok Malam','#0b3d2a','#3dff9a',.8,4.5,'#3dff9a'],
['fish_57','es_biru','Es Biru','#9cd7ff','#d6f0ff',.8,4,'#9cd7ff'],['fish_57','senja_persik','Senja Persik','#ffc2a0','#ff9a6b',.6,4,'#ff9a6b'],
['fish_58','naga_emas','Naga Emas','#e0a410','#ffe27a',.8,5,'#ffcc33'],['fish_58','naga_tinta','Naga Tinta','#0d0d1a','#e8e8ff',.5,5,'#8888cc'],
['fish_59','rubah_salju','Rubah Salju','#f3f6ff','#bcd2ff',.5,4,'#bcd2ff'],['fish_59','rubah_bayangan','Rubah Bayangan','#1b1824','#ff7a3a',.6,4.5,'#ff7a3a'],
['fish_60','selendang_pelangi','Selendang Pelangi','#d9a6ff','#ffa6f0',.7,4.5,'#ffa6f0',{orb:true}],['fish_60','malam_berbintang','Malam Berbintang','#0f1450','#8fb0ff',.8,5,'#8fb0ff',{orb:true}],
['fish_61','lentera_biru','Lentera Biru','#2a64d8','#9cc8ff',.9,4.5,'#6ea8ff'],['fish_61','lentera_merah','Lentera Merah','#b8201c','#ff6a4a',.9,4.5,'#ff6a4a'],
['fish_62','bara_biru','Bara Biru','#101a3a','#4aa8ff',.9,5,'#4aa8ff'],['fish_62','abu_dingin','Abu Dingin','#9aa0aa','#e0e6f0',.3,4,'#b8c0cc'],
['fish_63','emas_murni','Emas Murni','#f0c020','#fff08a',.7,4.5,'#f0c020'],['fish_63','mahkota_darah','Mahkota Darah','#8f0f1f','#ff3050',.7,4.5,'#ff3050'],
['fish_64','kunang_biru','Kunang Biru','#6fa8ff','#bcd8ff',.9,4,'#6fa8ff'],['fish_64','kunang_merah','Kunang Merah','#ff7a7a','#ffb0b0',.9,4,'#ff7a7a'],
['fish_65','tulang_emas','Tulang Emas','#e6c75a','#ffe9a0',.5,4.5,'#e6c75a'],['fish_65','racun_hijau','Racun Hijau','#142a10','#7dff3a',.9,5,'#7dff3a'],
['fish_66','zamrud','Zamrud','#1fa86a','#5affb0',.7,4.5,'#5affb0'],['fish_66','rubi','Rubi','#c4122f','#ff6a8a',.7,4.5,'#ff6a8a'],
['fish_67','aurora_hijau','Aurora Hijau','#2a8f6a','#9affd0',.8,5,'#9affd0',{orb:true}],['fish_67','purnama_emas','Purnama Emas','#fff2c0','#ffe27a',.7,5,'#ffe27a'],
['fish_68','karang_biru','Karang Biru','#3a7bd8','#9cc8ff',.7,4.5,'#6ea8ff'],['fish_68','mahkota_emas','Mahkota Emas','#e0a030','#ffe08a',.8,4.5,'#ffcc55'],
['fish_69','ronin_hitam','Ronin Hitam','#14161f','#ff3b3b',.7,5,'#ff3b3b'],['fish_69','shogun_emas','Shogun Emas','#d9a521','#ffe27a',.8,5,'#ffd24a'],
['fish_70','umpan_merah','Umpan Merah','#2a0a14','#ff3050',.9,5,'#ff3050'],['fish_70','umpan_putih','Umpan Putih','#dfe6f0','#ffffff',.9,4.5,'#e8f0ff'],
['fish_71','raja_emas','Raja Emas','#e6b422','#ffe27a',.9,5,'#ffcc33'],['fish_71','raja_zamrud','Raja Zamrud','#1f9a6a','#7affc0',.9,5,'#7affc0'],
['fish_72','aurora_emas','Aurora Emas','#fff0c8','#ffd86a',.7,5.5,'#ffd86a',{orb:true}],['fish_72','aurora_biru','Aurora Biru','#b8d8ff','#6aa8ff',.8,5.5,'#6aa8ff',{orb:true}],
['fish_73','vampir_albino','Vampir Albino','#f1e6e6','#ff4060',.6,5,'#ff4060',{eye:'#ff2d55'}],['fish_73','vampir_ungu','Vampir Ungu','#3a1060','#c26aff',.8,5,'#c26aff']];
export const SMUT={};
for(const [id,key,n,col,em,ei,m,c,x] of SIG){MUT[key]={n,col,em,ei,m,c,only:id,...(x||{})};(SMUT[id]=SMUT[id]||[]).push(key)}
// ---- Rupa ikan Secret: k=bentuk dasar, c=warna badan, c2=warna aksen/perut, g=warna cahaya, e=warna mata, bl=perut, fin=sirip, ge=kuat cahaya, f=fitur hiasan ----
export const SPEC={
fish_50:{g:'#ff5fd2'},fish_51:{g:'#19f0d0'},fish_52:{g:'#fff27a'},fish_53:{g:'#ff8ad8'},
fish_54:{k:'fish',c:'#ff8fc7',c2:'#fff1a8',g:'#ff9ad5',e:'#7a2a5a',bl:'#ffd9ec',f:['lotus','halo','blush','bigeye']},
fish_55:{k:'puffer',c:'#ffd166',c2:'#c58cff',g:'#ffb347',e:'#4a2a6a',ge:.6,f:['swirl','blush','bigeye']},
fish_56:{k:'cat',c:'#14141c',c2:'#e0102f',g:'#ff2040',e:'#ff2040',bl:'#3a3a4a',fin:'#5a0a18',ge:.5,f:['crown','teeth','glowbands']},
fish_57:{k:'fish',c:'#eef6ff',c2:'#a8d8ff',g:'#9fd8ff',e:'#2a5a9a',bl:'#ffffff',ge:.5,f:['ribbon','bigeye','stripes']},
fish_58:{k:'eel',c:'#d62839',c2:'#ffd166',g:'#ffb347',e:'#ffd166',h:'#fff3d0',bl:'#ffe9a8',ge:.5,f:['horns','whisk','mane']},
fish_59:{k:'fish',c:'#ff9248',c2:'#fff1dc',g:'#ffb070',e:'#3a2010',bl:'#fff1dc',ge:.5,f:['ears','fluff','blush','bigeye']},
fish_60:{k:'ray',c:'#3a3fc4',c2:'#f4f1ff',g:'#9aa4ff',ge:.6,f:['scarf','orbs']},
fish_61:{k:'turtle',c:'#d98e2b',c2:'#8a5a2b',g:'#ffb347',ge:.6,f:['orbs']},
fish_62:{k:'octo',c:'#2a1b1b',c2:'#ff7a2a',g:'#ff5a1f',e:'#ffcc33',ge:.4,f:['cracks','flame']},
fish_63:{k:'fish',c:'#b8643a',c2:'#ffe08a',g:'#ffc84a',e:'#ff5a2a',bl:'#ffe0b0',ge:.5,f:['crown','teeth']},
fish_64:{k:'jelly',c:'#d8f060',c2:'#fffbd0',g:'#e8ff5a',f:['dots']},
fish_65:{k:'cat',c:'#161620',c2:'#f1ecd8',g:'#b24bff',e:'#b24bff',bl:'#2a2a36',fin:'#2a2438',ge:.5,f:['skull','stripes','teeth']},
fish_66:{k:'horse',c:'#2a5bff',c2:'#ff5fb0',g:'#ff8ad0',f:['gems']},
fish_67:{k:'mola',c:'#b9a3ff',c2:'#ffe0ff',g:'#ff9af0',ge:.6,f:['halo','orbs','aurora']},
fish_68:{k:'fish',c:'#ff7a6b',c2:'#fff0e8',g:'#ff9a8a',e:'#3a1a2a',bl:'#fff0e8',ge:.5,f:['coral','blush','bigeye']},
fish_69:{k:'torp',c:'#5b7fa6',c2:'#e0283c',g:'#ff4a4a',e:'#ff4a4a',bl:'#dfe8f2',ge:.5,f:['sail','stripes']},
fish_70:{k:'fish',c:'#0e1830',c2:'#2f6bff',g:'#3a7bff',e:'#8fd0ff',bl:'#1a2850',ge:.5,f:['lure','teeth']},
fish_71:{k:'jelly',c:'#c026d3',c2:'#ffd6ff',g:'#ff6af0',f:['frill','jcrown']},
fish_72:{k:'whale',c:'#9ec8ff',c2:'#ff8ad8',g:'#ff9af0',e:'#3a2a7a',bl:'#e8f0ff',ge:.5,f:['aurora','orbs']},
fish_73:{k:'shark',c:'#5a0b1e',c2:'#2a0610',g:'#ff2d55',e:'#ff2d55',bl:'#d8b8c0',ge:.5,f:['wings','teeth','spikes']}};
export const glowOf=f=>(f.rarity==='Secret'&&SPEC[f.id]&&SPEC[f.id].g)||RC[f.rarity];
const prof=t=>t<0?.25+.75*Math.pow(Math.max(0,1+t),.8):1-.3*t*t;
const shp=(pts,rx=false)=>{const s=new THREE.Shape();pts.forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));s.closePath();const g=new THREE.ShapeGeometry(s);if(rx)g.rotateX(Math.PI/2);return g};
const bodyGeo=seg=>{const g=new THREE.SphereGeometry(1,seg[0],seg[1]),p=g.attributes.position;for(let i=0;i<p.count;i++){const k=prof(p.getX(i));p.setY(i,p.getY(i)*k);p.setZ(i,p.getZ(i)*k)}return g};
export function makeFish(f,dark=false,mut=null){
 const root=new THREE.Group(),g=new THREE.Group(),sh=hash(f.id),n=f.name.toLowerCase(),br=f.visual_brief.toLowerCase(),rar=RN.indexOf(f.rarity),glow=!dark&&(rar>=3||!!mut),tr=/kaca|kristal/.test(n);
 const SP=f.rarity==='Secret'?(SPEC[f.id]||null):null,GL=(SP&&SP.g)||RC[f.rarity],GE=SP&&SP.ge!==undefined?SP.ge:1;
 const col=dark?'#1b2433':mut?mut.col:colorOf(f),acc=dark?'#1b2433':(SP&&SP.c2)||ACC[sh%4],fin=dark?'#1b2433':(SP&&SP.fin&&!mut)?SP.fin:new THREE.Color(col).multiplyScalar(.82);
 const mt=(c,e=0)=>{const m=new THREE.MeshStandardMaterial({color:c,roughness:.5,metalness:.1,flatShading:true,side:THREE.DoubleSide,transparent:tr&&!dark,opacity:tr&&!dark?.7:1,emissive:mut?mut.em:glow?GL:'#000000',emissiveIntensity:mut?(e?mut.ei:0):glow?e*GE:0});m.userData.e0=m.emissiveIntensity;u.mats.push(m);return m};
 const gm=(c,em,ei)=>{const m=new THREE.MeshStandardMaterial({color:c,emissive:dark?'#000000':em,emissiveIntensity:dark?0:ei,roughness:.4,flatShading:true,side:THREE.DoubleSide});m.userData.e0=m.emissiveIntensity;u.mats.push(m);return m},cc=c=>dark?'#1b2433':c;
 const sk=f.rarity==='Secret'&&!/behemoth/.test(n)&&!(SP&&SP.k)?(/kameleon/.test(n)?'prisma':/hantu/.test(n)?'ghost':/petir/.test(n)?'storm':'nebula'):'';
 const kind=(SP&&SP.k)||(/behemoth/.test(n)?'behemoth':/buntal/.test(n)?'puffer':/kuda laut/.test(n)?'horse':/ubur/.test(n)?'jelly':/mola/.test(n)?'mola':/penyu/.test(n)?'turtle':/manta/.test(n)?'ray':/gurita/.test(n)?'octo':/belut|sidat|naga|leviathan/.test(n)?'eel':/paus/.test(n)?'whale':/hiu/.test(n)?'shark':/marlin|barracuda|tuna|toman|belida|arwana/.test(n)?'torp':/lele|patin|gabus/.test(n)?'cat':'fish');
 const D={fish:[.5,.21,.1],torp:[.5,.13,.09],eel:[.5,.05,.05],ray:[.32,.04,.3],octo:[.22,.22,.22],whale:[.5,.2,.17],shark:[.5,.14,.12],cat:[.5,.13,.14],behemoth:[.5,.2,.15],puffer:[.3,.27,.27],horse:[.13,.3,.1],jelly:[.22,.17,.22],mola:[.3,.33,.07],turtle:[.3,.1,.27]}[kind];
 const sp=(w=10,hh=7)=>new THREE.SphereGeometry(1,w,hh),seg=/kristal/.test(n)?[5,4]:kind==='behemoth'?[7,5]:[18,12];
 const add=(geo,m,x,y,z,sx=1,sy=1,sz=1,p=g)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);p.add(o);return o};
 const u=root.userData={tails:[],fins:[],fr:.7,fa:.25,mats:[],kind,dy:D[1],ph:Math.random()*6},sy=kind==='fish'||kind==='cat'?D[1]/.2:Math.max(.35,D[1]/.13*.9),sc=pts=>pts.map(p=>[p[0],p[1]*sy]);
 const pv=new THREE.Group();pv.position.x=D[0]*.42;root.add(pv);g.position.x=-D[0]*.42;pv.add(g);u.body=pv;
 u.chains=[];const UPV=new THREE.Vector3(0,1,0);
 // rantai segmen lentur (tentakel / kumis): tiap ruas meruncing & berputar sedikit demi sedikit -> melengkung dan bergelombang seperti tulang rawan
 const chain=(par,x,y,z,dir,len,r0,r1,n,mat,o={})=>{const base=new THREE.Group();base.position.set(x,y,z);base.quaternion.setFromUnitVectors(UPV,new THREE.Vector3(dir[0],dir[1],dir[2]).normalize());par.add(base);
  const L=len/n,segs=[];let cur=base;
  for(let i=0;i<n;i++){const ra=r0+(r1-r0)*(i/n),rb=r0+(r1-r0)*((i+1)/n),gp=new THREE.Group();if(i>0)gp.position.y=L;gp.rotation.z=o.cz||0;cur.add(gp);
   gp.add(new THREE.Mesh((o.flat?new THREE.BoxGeometry(o.flat*(1-.55*i/n),L*1.12,.006):new THREE.CylinderGeometry(rb,ra,L*1.12,6,1)).translate(0,L*.5,0),mat));segs.push(gp);cur=gp}
  u.chains.push({segs,A:o.A===undefined?.35:o.A,lag:o.lag||.6,w:o.w||1,ph:o.ph||0,cz:o.cz||0,cx:o.cx||0});return base};
 const NS=['puffer','horse','jelly','mola','turtle'].includes(kind),bm=add(kind==='jelly'?new THREE.SphereGeometry(1,12,8,0,6.283,0,1.7):kind==='octo'||kind==='ray'||NS?sp(...seg):bodyGeo(seg),mt(col,.3),0,0,0,...D);u.bm=bm;u.D=D;
 const T=(pts,ax='y',rx=false)=>{const p=new THREE.Group();p.position.set(-D[0]*.9,0,0);g.add(p);add(shp(pts,rx),mt(sh%3?fin:acc,.3),0,0,0,1,1,1,p);u.tails.push({p,ph:0,ax})};
 const dors=(pts,x=0)=>add(shp(pts),mt(fin,.3),x,D[1]*.8,0);
 const pect=(pts,pf=1)=>{for(const s of[1,-1]){const q=new THREE.Group();q.position.set(D[0]*.28,-D[1]*.35,s*D[2]*.8);g.add(q);add(shp(pts,true),mt(fin,.3),0,0,0,pf,1,s*pf,q);u.fins.push(q)}};
 if(!dark&&kind!=='octo'&&kind!=='ray'&&!NS&&kind!=='behemoth'){
  add(sp(10,6),mt((SP&&SP.bl)||'#e6ebf0'),.04,-D[1]*.55,0,D[0]*.7,D[1]*.5,D[2]*.85);
  add(sp(6,5),mt('#1b2433'),D[0]*.972,-D[1]*.16,0,.02,.016,Math.min(.045,D[2]*.42));
  const band=(xs,c)=>xs.forEach(x=>{const k=prof(x/D[0]);add(new THREE.TorusGeometry(1,.07,5,16).rotateY(Math.PI/2),mt(c),x,0,0,1,D[1]*k*1.02,D[2]*k*1.02)});
  if(/pita/.test(br))band([-.18,.05,.27],'#eef2f7');if(/loreng/.test(br))band([-.25,-.08,.1,.28],'#2a2018');
  if(/pola|awan|bekas/.test(br))for(let k=0;k<4;k++){const x=-.28+k*.17;add(sp(6,5),mt(acc,.2),x,D[1]*prof(x/D[0])*.8,(k%2?1:-1)*D[2]*.35,.09,.03,.06)}}
 if(kind!=='ray'&&!['jelly','behemoth','turtle','horse'].includes(kind)){const eyeP=sk?(u.eg=new THREE.Group()):g;if(sk)g.add(eyeP);const er=Math.min(.05,D[2]*.5);for(const z of[1,-1]){add(sp(6,5),mt(dark?col:'#ffffff'),D[0]*.64,D[1]*.28,z*D[2]*.74,er,er,er,eyeP);if(!dark)add(sp(6,5),mt(mut&&mut.eye?mut.eye:(SP&&SP.e)||'#101a2b'),D[0]*.68,D[1]*.28,z*D[2]*.84,er*.55,er*.55,er*.55,eyeP)}}
 if(kind==='behemoth'){const V1=cc('#5b49c8'),V2=cc('#8b78f0'),PK=cc('#c98af0'),CY=cc('#2bf2ff'),BL=cc('#2f9bff');bm.material.color.set(V1);
  add(new THREE.BoxGeometry(.34,.07,.2),mt(V2,.25),D[0]*.86,D[1]*.2,0).rotation.z=.18;add(new THREE.BoxGeometry(.22,.14,.17),gm(cc('#1d0f45'),'#000000',0),D[0]*.84,-D[1]*.1,0);
  const jw=new THREE.Group();jw.position.set(D[0]*.55,-D[1]*.35,0);g.add(jw);add(new THREE.BoxGeometry(.4,.07,.19),mt(PK,.25),.2,-.03,0,1,1,1,jw);for(let k=0;k<4;k++)add(new THREE.ConeGeometry(.018,.07,4),gm(cc('#ffffff'),'#ffffff',.2),.1+k*.07,.04,k%2?.05:-.05,1,1,1,jw);u.jaw=jw;
  for(const z of[1,-1])add(new THREE.OctahedronGeometry(1,0),gm(CY,CY,1.4),D[0]*.5,D[1]*.45,z*D[2]*.82,.05,.08,.05);
  for(let k=0;k<4;k++)for(const z of[1,-1]){const x=-.2+k*.12,m=add(new THREE.BoxGeometry(.2,.014,.014),gm(CY,CY,1.2),x,D[1]*(.1-k*.12),z*D[2]*.97*prof(x/D[0]));m.rotation.z=k%2?.5:-.5;m.rotation.y=z*.25}
  u.spk=[];for(let k=0;k<7;k++){const x=.18-k*.095,h=.2-k*.018,c=add(new THREE.ConeGeometry(.035,h,4),mt(BL,.5),x,D[1]*prof(x/D[0])*.95+h*.4,0);c.rotation.z=.3;u.spk.push(c)}
  T([[0,0],[-.3,.36],[-.2,0],[-.3,-.36]]);pect([[0,0],[-.32,0],[-.2,.28]],1.2);for(const y of[.36,-.36])add(new THREE.ConeGeometry(.03,.14,4).rotateZ(Math.PI/2),mt(BL,.5),-D[0]*.9-.3,y*.8,0);
  u.xf=(tt,t)=>{u.jaw.rotation.z=-(.12+.32*(.5+.5*Math.sin(t*1.7+u.ph)));u.spk.forEach((c,i)=>c.rotation.z=.3+Math.sin(t*3+i*.6)*.12)}}
 else if(kind==='puffer'){bm.material.color.set(cc(col));for(let k=0;k<28;k++){const th=Math.acos(1-2*(k+.5)/28),ph=k*2.399,nx=Math.sin(th)*Math.cos(ph),ny=Math.cos(th),nz=Math.sin(th)*Math.sin(ph),c=add(new THREE.ConeGeometry(.018,.09,4),mt(cc(SP&&SP.c2?SP.c2:'#e9dfc0')),nx*D[0]*1.02,ny*D[1]*1.02,nz*D[2]*1.02);c.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(nx,ny,nz))}
  T([[0,0],[-.14,.12],[-.1,0],[-.14,-.12]]);pect([[0,0],[-.12,0],[-.07,.1]]);add(sp(6,5),mt(cc(SP&&SP.c2?SP.c2:'#f6efd8')),D[0]*.2,-D[1]*.55,0,D[0]*.7,D[1]*.45,D[2]*.8)}
 else if(kind==='horse'){const hc=k=>SP?cc(k%2?SP.c2:col):cc('#'+new THREE.Color().setHSL(k/7,.7,.6).getHexString());
  add(sp(8,6),mt(hc(0),.2),.1,.28,0,.1,.09,.08);add(new THREE.ConeGeometry(.03,.2,5).rotateZ(-Math.PI/2),mt(hc(1)),.27,.27,0);for(const z of[1,-1])add(sp(6,5),gm(cc('#101a2b'),'#000',0),.14,.31,z*.07,.02,.02,.02);
  for(let k=0;k<6;k++){const a=k*.55,x=-.06-Math.sin(a)*.12*(k/5+.4),y=-.28-k*.065+Math.cos(a)*.03;add(sp(6,5),mt(hc(k+1),.2),x,y,0,.07-k*.008,.06-k*.006,.06-k*.006)}
  const fg=new THREE.Group();fg.position.set(-.1,.0,0);g.add(fg);add(shp([[0,.1],[-.13,.0],[0,-.1]]),mt(cc('#ffd8f0'),.3),0,0,0,1,1,1,fg);u.tails.push({p:fg,ph:0,ax:'y'});for(let k=0;k<4;k++)add(new THREE.ConeGeometry(.02,.07,4),mt(hc(k+3)),-.05,.2-k*.1,0).rotation.z=Math.PI/2+.2;
  u.xf=(tt)=>{u.bm.rotation.z=Math.sin(tt*.35)*.12}}
 else if(kind==='jelly'){const bmt=bm.material;bmt.transparent=true;bmt.opacity=.72;bmt.emissive.set(dark?'#000000':col);bmt.emissiveIntensity=dark?0:.4;bmt.userData.e0=bmt.emissiveIntensity;
  {const om=gm(cc(SP?SP.c2:'#e8b8ff'),SP?SP.g:'#c58cff',.6),am_=gm(cc(SP?SP.c:'#ffffff'),SP?SP.g:'#bfe8ff',.5);
   for(let k=0;k<10;k++){const a=k/10*6.283,ca=Math.cos(a),sa=Math.sin(a);chain(g,ca*.15,-.02,sa*.15,[ca*.1,-1,sa*.1],.66,.017,.003,10,om,{A:.5,lag:.5,w:.9,ph:k*.7,cz:0,cx:0})}
   for(let k=0;k<4;k++){const a=k/4*6.283+.4,ca=Math.cos(a),sa=Math.sin(a);chain(g,ca*.05,-.02,sa*.05,[ca*.05,-1,sa*.05],.42,.036,.008,7,am_,{A:.42,lag:.62,w:.75,ph:k*1.3,cz:.06,cx:0})}}
  u.xf=(tt)=>{const q=Math.sin(tt*.9);u.bm.scale.set(D[0]*(1+.1*q),D[1]*(1-.16*q),D[2]*(1+.1*q))}}
 else if(kind==='mola'){bm.material.color.set(cc(col));add(shp([[-.05,0],[-.3,.5],[-.36,.22],[-.2,0]]),mt(fin,.3),0,D[1]*.7,0);add(shp([[-.05,0],[-.3,-.5],[-.36,-.22],[-.2,0]]),mt(fin,.3),0,-D[1]*.7,0);T([[0,0],[-.06,.22],[-.1,0],[-.06,-.22]]);pect([[0,0],[-.12,0],[-.08,.1]])}
 else if(kind==='turtle'){const SH=cc(mut?mut.col:SP?SP.c:'#3f8f5a'),SK=cc(SP&&SP.c2?SP.c2:'#b8cf8a');bm.material.color.set(SH);add(sp(8,6),mt(SK),D[0]*1.02,0,0,.1,.08,.08);add(new THREE.ConeGeometry(.025,.08,4).rotateZ(Math.PI/2),mt(SK),D[0]*1.2,-.01,0);for(const z of[1,-1])add(sp(6,5),gm(cc('#101a2b'),'#000',0),D[0]*1.12,.03,z*.06,.016,.016,.016);
  for(let k=0;k<7;k++){const a=k?(k-1)/6*6.283:0,r=k?.17:0;add(sp(6,5),(SP?gm(cc(SP.g),SP.g,1.1):mt(cc('#a0d6a8'),.2)),Math.cos(a)*r*1.1,D[1]*.9,Math.sin(a)*r*.95,.08,.025,.08)}
  for(const s_ of[1,-1]){const q=new THREE.Group();q.position.set(D[0]*.4,-.02,s_*D[2]*.8);g.add(q);add(sp(8,5),mt(SK),0,0,s_*.15,.07,.015,.17,q);u.fins.push(q);const r=new THREE.Group();r.position.set(-D[0]*.55,-.02,s_*D[2]*.55);g.add(r);add(sp(8,5),mt(SK),0,0,s_*.06,.05,.015,.07,r)}
  add(new THREE.ConeGeometry(.02,.1,4).rotateZ(Math.PI/2),mt(SK),-D[0]*1.05,-.02,0).rotation.z=Math.PI/2*3}
 else if(kind==='octo'){const tm=mt(col,.2),tp=mt(cc('#f3d6c8'),.1);
  for(let k=0;k<8;k++){const a=k/8*6.283+.2,ca=Math.cos(a),sa=Math.sin(a);
   chain(g,ca*.1,-D[1]*.62,sa*.1,[ca*.95-.3,-1,sa*.95],.62,.052,.006,9,tm,{A:.34+(k%3)*.05,lag:.55,w:.85+(k%2)*.15,ph:k*.8,cz:(k%2?1:-1)*.11,cx:.04})}}
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
 if(sk){const CY=cc((SP&&SP.g)||'#19f0d0'),forms={prisma:[[1,1,1],[.85,.25,2.4],[1.6,.5,.5]],ghost:[[1,1,1],[1.5,.6,.7],[2.1,.38,.42]],storm:[[1,1,1],[.8,2.2,2.2],[1.2,.8,.8]],nebula:[[1,1,1],[.7,.3,2.6],[.8,1.5,1.5]]}[sk],wl=[],rg=[],ob=[];
  if(sk==='prisma'||sk==='nebula')for(const s_ of[1,-1]){const w=new THREE.Group();w.position.set(0,0,s_*D[2]*.6);g.add(w);add(sp(),mt(fin,.4),0,0,s_*.25,.34,.02,.3,w);add(sp(6,5),gm(CY,CY,1.4),0,0,s_*.52,.04,.04,.04,w);w.scale.set(.001,.001,.001);wl.push(w)}
  if(sk==='ghost'||sk==='nebula')for(let k=0;k<2;k++){const r=new THREE.Mesh(new THREE.TorusGeometry(1,.018,6,30),gm(CY,CY,1.3));r.scale.setScalar(.34+k*.1);g.add(r);rg.push(r)}
  if(sk!=='storm')for(let k=0;k<(sk==='nebula'?8:5);k++){ob.push(add(new THREE.OctahedronGeometry(1,0),gm(CY,CY,1.6),0,0,0,.035,.035,.035))}
  let wh=null;if(sk==='ghost'){wh=new THREE.Group();g.add(wh);for(const z of[1,-1]){const q=add(new THREE.ConeGeometry(.008,.5,4).rotateZ(-Math.PI/2).translate(.25,0,0),gm(cc('#d8fff6'),CY,.8),D[0]*.95,-.01,z*.04,1,1,1,wh);q.rotation.y=z*.3}for(let k=0;k<6;k++)add(new THREE.ConeGeometry(.03,.14,4),gm(cc('#9ff0e6'),CY,1),.2-k*.08,D[1]*.95+.05,0,1,1,1,wh);wh.scale.setScalar(.001)}
  let arc=null;if(sk==='storm'){const ag=new THREE.BufferGeometry();ag.setAttribute('position',new THREE.BufferAttribute(new Float32Array(26*6),3));arc=new THREE.LineSegments(ag,new THREE.LineBasicMaterial({color:'#c8fbff'}));arc.frustumCulled=false;if(!dark)g.add(arc)}
  if(sk==='nebula')for(let k=0;k<14;k++){const th=Math.random()*6.283,x=(Math.random()-.5)*.7;add(new THREE.OctahedronGeometry(1,0),gm('#ffffff',CY,1.5),x,Math.sin(th)*D[1]*.8*prof(x/.5),Math.cos(th)*D[2]*.8*prof(x/.5),.014,.014,.014)}
  const tri=(m,c)=>sm_(.75,.25,Math.abs(((m-c+1.5)%3+3)%3-1.5));
  u.xf=(tt,t,sp_,dt)=>{u.mp=(u.mp||0)+dt*(.1+sp_*.12);const m=(((u.mp+u.ph*.1)%3)+3)%3;let w0=tri(m,0),w1=tri(m,1),w2=tri(m,2);const sm=w0+w1+w2||1;w0/=sm;w1/=sm;w2/=sm;
   const X=forms[0][0]*w0+forms[1][0]*w1+forms[2][0]*w2,Y=forms[0][1]*w0+forms[1][1]*w1+forms[2][1]*w2,Z=forms[0][2]*w0+forms[1][2]*w1+forms[2][2]*w2;
   u.bm.scale.set(D[0]*X,D[1]*Y,D[2]*Z);if(u.eg)u.eg.scale.set(X,Y,Z);wl.forEach(w=>w.scale.set(.001+w1,.001+w1,.001+w1));
   rg.forEach((r,i)=>{r.rotation.x=t*(1+i*.6)+i;r.rotation.y=t*.7*(i?-1:1);r.scale.setScalar((.34+i*.1)*(1+.15*Math.sin(t*2+i)))});
   ob.forEach((o,i)=>{const a=t*(1.2+i*.07)+i*6.283/ob.length,r=.3+.08*Math.sin(t+i);o.position.set(Math.cos(a)*r*1.2,Math.sin(a*1.3+i)*.1,Math.sin(a)*r)});
   if(wh)wh.scale.setScalar(.001+w2*.9+w1*.4);
   if(sk==='prisma'){const h=(t*.07+u.ph)%1;u.mats.forEach(q=>{q.color.setHSL(h,.75,.52);q.emissive.setHSL(h,.9,.5)})}
   if(sk==='ghost'){const o=.5+.28*Math.sin(t*1.7);u.mats.forEach(q=>{q.transparent=true;q.opacity=o+.2})}
   if(arc){const a=arc.geometry.attributes.position;let j=0;for(let b=0;b<2;b++){let px=-.5,py=0,pz=0;for(let k=0;k<13;k++){const nx=-.5+(k+1)/13,ny=(Math.random()-.5)*.17,nz=(Math.random()-.5)*.17;a.setXYZ(j++,px,py,pz);a.setXYZ(j++,nx,ny,nz);px=nx;py=ny;pz=nz}}a.needsUpdate=true;arc.visible=Math.random()<.85}}}

 if(SP&&SP.f){const F=new Set(SP.f),SG=[1,-1],GW=cc(mut?mut.em:SP.g),P2=cc(SP.c2||'#ffffff'),G1=(c,i=1.2)=>gm(c,GW,i),M1=(c,e=.2)=>mt(c,e),top=x=>D[1]*(NS?Math.sqrt(Math.max(0,1-(x/D[0])**2)):prof(x/D[0])),
   bnd=(xs,m,th=.06)=>xs.forEach(x=>{const k=NS?Math.sqrt(Math.max(0,1-(x/D[0])**2)):prof(x/D[0]);add(new THREE.TorusGeometry(1,th,5,18).rotateY(Math.PI/2),m,x,0,0,1,D[1]*k*1.03,D[2]*k*1.03)}),
   tipOf=(len,n,m,r)=>{const c=u.chains[u.chains.length-1];add(sp(6,5),m,0,len/n,0,r,r,r,c.segs[c.segs.length-1])};
  if(F.has('halo')){const r=add(new THREE.TorusGeometry(.1,.011,6,22),G1(GW,1.4),D[0]*.3,D[1]+.17,0);r.rotation.x=Math.PI/2;for(let k=0;k<3;k++){const a=k*2.094;{const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.03,0),G1(GW,1.8));gem.position.set(Math.cos(a)*.1,Math.sin(a)*.1,0);r.add(gem)}}(u.spin=u.spin||[]).push(r)}
  if(F.has('crown'))for(let k=0;k<5;k++){const a=k/5*6.283,c=add(new THREE.ConeGeometry(.02,.1,4),G1(cc('#ffd54a'),.7),D[0]*.52+Math.cos(a)*.055,top(D[0]*.52)+.07,Math.sin(a)*.055);c.rotation.z=-Math.cos(a)*.25;c.rotation.x=Math.sin(a)*.25}
  if(F.has('horns'))for(const z of SG){const c=add(new THREE.ConeGeometry(.03,.24,5),M1(cc(SP.h||'#f3e6c4')),D[0]*.5,D[1]*.95+.08,z*.06);c.rotation.z=.75;c.rotation.x=z*.35}
  if(F.has('whisk')){const wm=gm(P2,GW,.5);for(const z of SG){chain(g,D[0]*.92,-D[1]*.1,z*.05,[1,-.15,z*.6],.6,.014,.003,9,wm,{A:.5,lag:.5,w:.7,ph:z>0?0:1.4,cz:z*.04});chain(g,D[0]*.85,D[1]*.5,z*.05,[.7,.7,z*.6],.4,.011,.003,7,wm,{A:.45,lag:.55,w:.8,ph:z>0?.6:2})}}
  if(F.has('mane'))for(let k=0;k<9;k++){const x=D[0]*.6-k*D[0]*.2,h=.13-k*.004,c=add(new THREE.ConeGeometry(.03,h,4),G1(P2,.6),x,top(x)+h*.4,0);c.rotation.z=.4}
  if(F.has('ribbon')){const rm=gm(P2,GW,.5);for(let k=0;k<3;k++){const y=(k-1)*.07;chain(g,-D[0]*.9,y,0,[-1,y*2.2,0],.55+(k===1?.1:0),0,0,9,rm,{A:.5,lag:.5,w:.8,ph:k*1.1,flat:.1-Math.abs(k-1)*.025})}
   for(const z of SG)chain(g,D[0]*.1,-D[1]*.7,z*D[2]*.5,[-.4,-1,z*.2],.5,0,0,8,rm,{A:.55,lag:.55,w:.9,ph:z>0?.3:1.7,flat:.07})}
  if(F.has('ears'))for(const z of SG){const e=add(new THREE.ConeGeometry(.05,.15,4),M1(col),D[0]*.4,D[1]*.95+.06,z*.07);e.rotation.z=.25;e.rotation.x=-z*.25;const i2=add(new THREE.ConeGeometry(.028,.1,4),M1(cc('#ffb3c7')),D[0]*.4+.005,D[1]*.95+.05,z*.07+z*.012);i2.rotation.z=.25;i2.rotation.x=-z*.25}
  if(F.has('fluff'))for(let k=-1;k<=1;k++){chain(g,-D[0]*.9,0,0,[-1,k*.55,0],.42,.05,.012,6,M1(col,.3),{A:.45,lag:.5,w:.85,ph:k*1.2});tipOf(.42,6,M1(P2,.3),.06)}
  if(F.has('lotus'))for(let k=-3;k<=3;k++){const x=-.02+k*.07,pt=add(sp(8,6),G1(k%2?P2:col,.4),x,top(x)+.07,0,.035,.11,.02);pt.rotation.z=k*.25}
  if(F.has('blush'))for(const z of SG)add(sp(6,5),M1(cc('#ff6fa0'),.4),D[0]*.52,-D[1]*.08,z*D[2]*.86,.06,.045,.018);
  if(F.has('bigeye'))for(const z of SG){add(sp(8,6),M1('#ffffff'),D[0]*.6,D[1]*.3,z*D[2]*.82,.075,.075,.05);add(sp(6,5),M1(cc(SP.e||'#101a2b')),D[0]*.64,D[1]*.3,z*D[2]*.94,.045,.05,.03);add(sp(5,4),M1('#ffffff'),D[0]*.66,D[1]*.36,z*D[2]*1.0,.014,.014,.014)}
  if(F.has('swirl'))for(const x of[-.18,-.05,.08,.2])bnd([x],M1(P2,.2),.1);
  if(F.has('stripes'))bnd([-.28,-.12,.04,.2],M1(P2,.2));
  if(F.has('glowbands'))bnd([-.3,-.16,-.02,.12,.26],G1(GW,1.1));
  if(F.has('aurora'))[-.32,-.18,-.04,.1,.24].forEach((x,i)=>bnd([x],G1([P2,GW,cc('#b69cff'),cc('#ffb3e6'),cc('#9fd8ff')][i],1),.05));
  if(F.has('lure')){chain(g,D[0]*.35,D[1]*.92,0,[.55,1,0],.42,.014,.007,7,M1(cc('#10131c')),{A:.22,lag:.5,w:.7,cz:-.12});tipOf(.42,7,G1(GW,2.4),.065)}
  if(F.has('teeth'))for(const z of SG)for(let k=0;k<4;k++){const x=D[0]*(.72+k*.07),w=1-k*.12;add(new THREE.ConeGeometry(.011,.055,4),M1('#ffffff'),x,-D[1]*.14,z*D[2]*.3*w).rotation.x=Math.PI;add(new THREE.ConeGeometry(.01,.045,4),M1('#ffffff'),x,-D[1]*.3,z*D[2]*.28*w)}
  if(F.has('skull')){add(sp(8,6),M1(P2),D[0]*.5,D[1]*.35,0,.14,.06,.09);for(const z of SG)add(sp(6,5),gm(cc('#0a0a12'),GW,.9),D[0]*.58,D[1]*.42,z*D[2]*.55,.045,.05,.03)}
  if(F.has('sail'))add(shp([[-.34,0],[-.12,.55],[.18,.34],[.22,0]]),gm(P2,GW,.5),0,D[1]*.7,0);
  if(F.has('wings'))for(const s_ of SG){const q=new THREE.Group();q.position.set(D[0]*.22,-D[1]*.1,s_*D[2]*.8);g.add(q);add(shp([[0,0],[-.1,0],[-.34,.34],[-.24,.08],[-.4,.02],[-.26,-.06],[-.3,-.22],[-.1,-.1]],true),M1(P2,.3),0,0,0,1.4,1,s_*1.4,q);u.fins.push(q)}
  if(F.has('spikes'))for(let k=0;k<8;k++){const x=D[0]*.5-k*D[0]*.2,h=.12,c=add(new THREE.ConeGeometry(.025,h,4),G1(P2,.6),x,top(x)+h*.4,0);c.rotation.z=.35}
  if(F.has('coral')){for(let k=0;k<7;k++){const h=.16+.06*(k%3),c=add(new THREE.ConeGeometry(.02,h,5),M1(P2),D[0]*.35+(k-3)*.05,top(D[0]*.35)+h*.4,(k%2?1:-1)*.03);c.rotation.z=(k-3)*.15;add(sp(5,4),G1(cc('#ff9ab0'),.8),D[0]*.35+(k-3)*.05-(k-3)*.15*h*.5,top(D[0]*.35)+h*.85,(k%2?1:-1)*.03,.022,.022,.022)}}
  if(F.has('cracks'))for(let k=0;k<16;k++){const a=Math.random()*6.283,b=Math.acos(2*Math.random()-1),nx=Math.sin(b)*Math.cos(a),ny=Math.cos(b),nz=Math.sin(b)*Math.sin(a),c=add(sp(5,4),G1(GW,1.8),nx*D[0]*1.01,ny*D[1]*1.01,nz*D[2]*1.01,.05,.01,.012);c.rotation.set(Math.random()*3,Math.random()*3,Math.random()*3)}
  if(F.has('flame')){u.flick=[];for(let k=0;k<5;k++){const c=add(new THREE.ConeGeometry(.04-k*.003,.2+(k%2)*.08,5),G1(k%2?P2:GW,1.6),(k-2)*.07,D[1]*.98+.09,((k%2)?.04:-.04));u.flick.push(c)}}
  if(F.has('gems')){for(let k=0;k<6;k++){const a=k*.55,x=-.06-Math.sin(a)*.12*(k/5+.4),y=-.28-k*.065+Math.cos(a)*.03;add(new THREE.OctahedronGeometry(1,0),G1(P2,1.2),x,y,.06,.028,.028,.028)}add(new THREE.OctahedronGeometry(1,0),G1(P2,1.4),.1,.36,0,.035,.035,.035)}
  if(F.has('scarf')){const sm=gm(P2,GW,.5);for(const z of SG)chain(g,-.05,0,z*.5,[-1,0,z*.3],.9,0,0,10,sm,{A:.45,lag:.5,w:.7,ph:z>0?0:1.5,flat:.1});chain(g,-.5,0,0,[-1,0,0],.7,0,0,9,sm,{A:.4,lag:.5,w:.8,ph:.8,flat:.06})}
  if(F.has('dots')){u.flick=u.flick||[];for(let k=0;k<14;k++){const th=Math.random()*1.3,ph=Math.random()*6.283,c=add(sp(5,4),G1(GW,1.8),Math.sin(th)*Math.cos(ph)*D[0]*.97,Math.cos(th)*D[1]*.97,Math.sin(th)*Math.sin(ph)*D[2]*.97,.02,.02,.02);u.flick.push(c)}}
  if(F.has('frill'))for(let k=0;k<12;k++){const a=k/12*6.283,c=add(new THREE.ConeGeometry(.03,.1,4),G1(P2,.8),Math.cos(a)*.215,-.01,Math.sin(a)*.215);c.rotation.x=Math.PI}
  if(F.has('jcrown')){for(let k=0;k<7;k++){const a=k/7*6.283;add(new THREE.ConeGeometry(.025,.12,4),G1(P2,1),Math.cos(a)*.08,D[1]*.95+.05,Math.sin(a)*.08)}add(new THREE.ConeGeometry(.035,.2,5),G1(P2,1.2),0,D[1]*.95+.1,0)}
  if(F.has('orbs')){u.orbs=[];for(let k=0;k<6;k++)u.orbs.push(add(new THREE.OctahedronGeometry(1,0),G1(GW,1.5),0,0,0,.03,.03,.03));u.orR=Math.max(.35,D[0]*.9)}}
 if(/angler/.test(n)&&!(SP&&SP.f&&SP.f.includes('lure'))){add(new THREE.ConeGeometry(.01,.3,4),mt('#222a3a'),D[0]*.4,D[1]+.12,0).rotation.z=-.5;add(sp(8,6),new THREE.MeshBasicMaterial({color:'#6ff0ff'}),D[0]*.4+.12,D[1]+.27,0,.05,.05,.05)}
 {const wk=/kumis|sungut/.test(br)?(/panjang/.test(br)?1:.5):/lele|patin/.test(n)?.8:0;
  if(wk>0){const wm=mt(cc('#3b2d22'),.1),Ls=.14+.26*wk;
   for(const z of[1,-1]){
    chain(g,D[0]*.9,-D[1]*.06,z*D[2]*.28,[1,-.22,z*.62],Ls,.011,.0025,6,wm,{A:.42,lag:.55,w:.8,ph:z>0?0:1.3,cz:z*.05});
    chain(g,D[0]*.88,-D[1]*.2,z*D[2]*.22,[.7,-.75,z*.5],Ls*.7,.009,.0022,5,wm,{A:.4,lag:.6,w:.9,ph:z>0?.7:2,cz:0});
    if(wk>.7)chain(g,D[0]*.86,-D[1]*.3,z*D[2]*.15,[.45,-1,z*.35],Ls*.55,.008,.002,4,wm,{A:.38,lag:.7,w:1,ph:1.1+z,cz:0})}}}
 {const BD={fish:{A:.085,k:2.3,e0:.1,ep:1.6},torp:{A:.06,k:2,e0:.1,ep:1.6},eel:{A:.12,k:5.2,e0:.35,ep:1.2},shark:{A:.075,k:2.1,e0:.1,ep:1.6},cat:{A:.095,k:2.4,e0:.1,ep:1.6},whale:{A:.05,k:1.8,e0:.1,ep:1.6,ax:'y'},behemoth:{A:.035,k:1.8,e0:.1,ep:1.6}}[kind];
  if(BD&&!sk&&!NS&&kind!=='octo'&&kind!=='ray'&&kind!=='jelly'){const tl=new Set(u.tails.map(o=>o.p)),ps=bm.geometry.attributes.position;
   u.bend={...BD,ax:BD.ax||'z',tg:1.5,bm,base:Float32Array.from(ps.array),parts:g.children.filter(c=>c!==bm&&!(u.orbs&&u.orbs.includes(c))&&!(u.spin&&u.spin.includes(c))).map(c=>({o:c,x:c.position.x,y:c.position.y,z:c.position.z,r:c.rotation.y,rz:c.rotation.z,tail:tl.has(c)}))};
   if(!dark){const ca=new Float32Array(ps.count*3);for(let i=0;i<ps.count;i++){const y=ps.getY(i),q=Math.min(1,Math.max(0,(-y+.9)/1.8)),f=.72+.28*q*q*(3-2*q);ca[i*3]=ca[i*3+1]=ca[i*3+2]=f}
    bm.geometry.setAttribute('color',new THREE.BufferAttribute(ca,3));bm.material.vertexColors=true;bm.material.color.multiplyScalar(1.12)}}}
 return root}
const sm_=(a,b,x)=>{const u=Math.max(0,Math.min(1,(x-a)/(b-a)));return u*u*(3-2*u)};
export function animateFish(g,t,sp0=.5){const u=g.userData,ph=u.ph||0,k=u.kind,dt=Math.min(.1,Math.max(0,t-(u.lt===undefined?t:u.lt)));u.lt=t;
 // kecepatan dihaluskan & fase DIAKUMULASI (dulu t*kecepatan -> fase melompat tiap kecepatan berubah = patah-patah/glitch)
 u.sp=u.sp===undefined?sp0:u.sp+(sp0-u.sp)*Math.min(1,dt*5);const sp=u.sp;
 u.pa=(u.pa||0)+dt*(3.4+sp*7.5);u.pf=(u.pf||0)+dt*(k==='ray'?2.4+sp*2.2:2.6+sp*3);
 const tt=u.pa+ph,B=u.bend;
 if(u.body){const w=k==='eel'?2.1:k==='ray'?.12:k==='whale'?.5:k==='octo'?.15:1,am=(.07+sp*.15)*w*(B?.35:1);
  u.body.rotation.y=Math.sin(tt+(B?1.2:0))*am;u.body.rotation.z=Math.sin(tt*.5+1.3)*.03*(.4+sp)*w;u.body.position.y=Math.sin(tt*.5)*.012*w}
 u.tails.forEach(o=>{o.p.rotation[o.ax||'y']=B?0:Math.sin(tt-1.15-(o.ph||0)*.38)*(.22+sp*.34)});
 u.fins.forEach((p,i)=>p.rotation.x=(i?-1:1)*(u.fr+Math.sin(u.pf+(k==='ray'?0:i*.9+ph))*u.fa*(1+sp*.5)));
 if(B){ // tulang belakang: gelombang merambat dari kepala ke ekor, badan + sirip + ekor mengikuti lengkungannya
  const D=u.D,D0=D[0],lat=B.ax==='z',A=B.A*(.55+.7*sp)*2*D0,off=x=>{const q=x/D0,s=(q+1)/2;return A*(B.e0+(1-B.e0)*Math.pow(Math.max(0,1-s),B.ep))*Math.sin(B.k*q+tt)};
  const pos=B.bm.geometry.attributes.position,b=B.base,sc=lat?D[2]:D[1];
  for(let i=0;i<pos.count;i++){const o=off(b[i*3]*D0)/sc;if(lat)pos.setZ(i,b[i*3+2]+o);else pos.setY(i,b[i*3+1]+o)}pos.needsUpdate=true;
  for(const q of B.parts){const o=q.o,d=off(q.x),th=Math.atan((off(q.x+.012)-off(q.x-.012))/.024);
   if(lat){o.position.z=q.z+d;o.rotation.y=q.tail?-th*B.tg:q.r-th}else{o.position.y=q.y+d;o.rotation.z=q.tail?th*B.tg:q.rz+th}}}
 for(const c of u.chains){const am=c.A*(.55+sp*.8),n=c.segs.length;for(let i=0;i<n;i++){const q=c.segs[i],k=.25+.75*(i+1)/n;q.rotation.z=c.cz+am*k*Math.sin(tt*c.w-i*c.lag+c.ph);q.rotation.x=c.cx+am*.7*k*Math.sin(tt*c.w*.87-i*c.lag+c.ph+1.6)}}
 if(u.spin)for(const o of u.spin)o.rotation.z+=dt*1.6;
 if(u.flick)u.flick.forEach((o,i)=>{o.scale.y=1+.35*Math.sin(u.pa*3.2+i*1.7)});
 if(u.orbs){const R=u.orR,n=u.orbs.length;for(let i=0;i<n;i++){const a=u.pa*.3+i*6.283/n;u.orbs[i].position.set(Math.cos(a)*R*1.1,Math.sin(a*1.4+i)*R*.25,Math.sin(a)*R*.8)}}
 if(u.xf)u.xf(tt,t,sp,dt)}

export function disposeFish(o){o.traverse(c=>{if(c.geometry)c.geometry.dispose();const m=c.material;if(m)(Array.isArray(m)?m:[m]).forEach(x=>x.dispose())})}
let tr_,ts,tc;const cache={};
export function thumb(f,dark=false,mut=null){
 const k=f.id+dark+(mut?mut.k:'');if(cache[k])return cache[k];
 if(!tr_){tr_=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});tr_.setSize(240,120);ts=new THREE.Scene();ts.add(new THREE.HemisphereLight('#ffffff','#667788',1.6));const d=new THREE.DirectionalLight('#ffffff',2);d.position.set(1,2,3);ts.add(d);tc=new THREE.PerspectiveCamera(30,2,.1,20);tc.position.set(.1,.25,2.5);tc.lookAt(0,0,0)}
 const m=makeFish(f,dark,mut);m.rotation.y=-.45;ts.add(m);tr_.render(ts,tc);const url=tr_.domElement.toDataURL();ts.remove(m);disposeFish(m);return cache[k]=url}

let vr,vs,vc,vm,vraf=0;
export function startViewer(f){stopViewer();
 if(!vr){vr=new THREE.WebGLRenderer({antialias:true,alpha:true});vr.setPixelRatio(Math.min(devicePixelRatio||1,2));vr.setSize(300,150);vs=new THREE.Scene();vs.add(new THREE.HemisphereLight('#ffffff','#667788',1.6));const d=new THREE.DirectionalLight('#ffffff',2);d.position.set(1,2,3);vs.add(d);vc=new THREE.PerspectiveCamera(30,2,.1,20);vc.position.set(0,.2,2.6);vc.lookAt(0,0,0);vr.domElement.style.cssText='width:100%;height:auto;display:block'}
 vm=makeFish(f,false,f.mut);vs.add(vm);const t0=performance.now();
 const tick=()=>{const t=(performance.now()-t0)/1000;vm.rotation.y=Math.sin(t*.8)*.7-.3;vm.position.y=Math.sin(t*1.6)*.04;vm.rotation.z=Math.sin(t*1.1)*.05;animateFish(vm,t,.45);vm.userData.mats.forEach(m=>{m.emissiveIntensity=m.userData.e0*(1+.5*Math.sin(t*4))});vr.render(vs,vc);vraf=requestAnimationFrame(tick)};tick();return vr.domElement}
export function stopViewer(){cancelAnimationFrame(vraf);if(vm&&vs){vs.remove(vm);disposeFish(vm);vm=null}}
