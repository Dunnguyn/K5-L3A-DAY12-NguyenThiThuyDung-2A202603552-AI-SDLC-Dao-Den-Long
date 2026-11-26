import * as T from 'three';
import {terrainHeight} from '../data/worlds.js';

// All meshes in this layer are visual-only. Core terrain, collision and world data stay untouched.
const make=(color,emissive='#000000',opacity=1)=>new T.MeshLambertMaterial({color,emissive,emissiveIntensity:.22,flatShading:true,transparent:opacity<1,opacity,depthWrite:opacity===1});
const add=(root,geometry,material,x,y,z)=>{const mesh=new T.Mesh(geometry,material);mesh.position.set(x,y,z);root.add(mesh);return mesh;};
function instances(root,geometry,material,points){if(!points.length)return;const mesh=new T.InstancedMesh(geometry,material,points.length),dummy=new T.Object3D();points.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(p.pitch??0,p.angle??0,p.tilt??0);dummy.scale.set(p.sx??1,p.sy??1,p.sz??1);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);if(p.color)mesh.setColorAt(i,new T.Color(p.color));});mesh.count=points.length;root.add(mesh);return mesh;}
function clearOfPlay(world,x,z,min=5){return Math.hypot(x-world.spawn.x,z-world.spawn.z)>8&&world.lamps.every(l=>Math.hypot(x-l.x,z-l.z)>min)&&world.pads.every(p=>Math.hypot(x-p.x,z-p.z)>4);}

// Realistic multi-part instanced trees (visual-only, zero collision).
function buildBroadTrees(root,world,night,positions){
 const trunkGeo=new T.CylinderGeometry(.12,.3,2.5,7),branchGeo=new T.CylinderGeometry(.055,.095,1.25,5),crownGeo=new T.IcosahedronGeometry(1.05,1);
 const trunkMat=make('#6E4A2E','#2A180B'),crownMat=make('#44753E','#183215');
 const trunks=[],branches=[],crowns=[],greens=['#3A6B36','#4A7D43','#568C4D','#2F5B2C'];
 for(const p of positions){
  const y=terrainHeight(night,p.x,p.z,p.baseY??0);
  if(y===null||!clearOfPlay(world,p.x,p.z,p.clearance??5.5))continue;
  const s=p.scale??1,yaw=p.angle??0;
  trunks.push({x:p.x,y:y+1.25*s,z:p.z,angle:yaw,pitch:(p.lean??0)*.05,sx:s,sy:s,sz:s});
  // Two angled upper limbs
  for(let b=0;b<2;b++){
   const ba=yaw+b*2.6+.4;
   branches.push({x:p.x+Math.cos(ba)*.36*s,y:y+2.2*s,z:p.z+Math.sin(ba)*.36*s,angle:ba,pitch:.55,sx:s,sy:s,sz:s});
  }
  // 4 overlapping foliage clusters for an organic canopy silhouette
  const offsets=[[0,2.95,0,1.25,.85],[.75,2.55,.35,.95,.78],[-.65,2.6,.45,.9,.75],[.1,2.5,-.7,.92,.76]];
  offsets.forEach(([ox,oy,oz,rx,ry],idx)=>{
   const c=Math.cos(yaw),sn=Math.sin(yaw);
   crowns.push({x:p.x+(ox*c-oz*sn)*s,y:y+oy*s,z:p.z+(ox*sn+oz*c)*s,angle:yaw+idx*.9,sx:rx*s,sy:ry*s,sz:rx*s,color:greens[(idx+Math.round(yaw*3))%greens.length]});
  });
 }
 instances(root,trunkGeo,trunkMat,trunks);instances(root,branchGeo,trunkMat,branches);instances(root,crownGeo,crownMat,crowns);
}

function buildPalmTrees(root,world,night,positions,{height=4.4,frondLen=1.55,trunkColor='#8C6A38'}={}){
 const trunkGeo=new T.CylinderGeometry(.06,.14,height,6),frondGeo=new T.ConeGeometry(.24,frondLen,4),coreGeo=new T.IcosahedronGeometry(.22,0);
 const trunkMat=make(trunkColor,'#38260E'),frondMat=make('#529648','#1C4218');
 const trunks=[],cores=[],fronds=[],shades=['#4C9142','#5BA34E','#3F7E37'];
 for(const p of positions){
  const y=terrainHeight(night,p.x,p.z,p.baseY??0);
  if(y===null||!clearOfPlay(world,p.x,p.z,p.clearance??4.8))continue;
  const s=p.scale??1,yaw=p.angle??0,lean=p.lean??.06;
  const topX=p.x+Math.sin(yaw)*lean*height*s*.45,topZ=p.z+Math.cos(yaw)*lean*height*s*.45,topY=y+height*s;
  trunks.push({x:(p.x+topX)/2,y:y+height*s/2,z:(p.z+topZ)/2,angle:yaw,pitch:lean,sx:s,sy:s,sz:s});
  cores.push({x:topX,y:topY,z:topZ,sx:s,sy:s,sz:s,color:'#4B7A3B'});
  // 6 radiating drooping palm fronds
  for(let f=0;f<6;f++){
   const fa=yaw+f*(Math.PI/3)+(f%2?.12:-.12),dist=frondLen*.44*s;
   fronds.push({x:topX+Math.cos(fa)*dist,y:topY-.06*s,z:topZ+Math.sin(fa)*dist,angle:-fa+Math.PI/2,pitch:1.18+(f%2)*.14,sx:1.15*s,sy:s,sz:.28*s,color:shades[f%shades.length]});
  }
 }
 instances(root,trunkGeo,trunkMat,trunks);instances(root,coreGeo,frondMat,cores);instances(root,frondGeo,frondMat,fronds);
}

function buildBambooClumps(root,world,night,positions){
 const culmGeo=new T.CylinderGeometry(.045,.07,3.8,5),nodeGeo=new T.TorusGeometry(.068,.014,4,6),leafGeo=new T.ConeGeometry(.26,.78,4);
 const culmMat=make('#B2A160','#4C4020'),leafMat=make('#6BA25B','#244A20');
 const culms=[],nodes=[],leaves=[];
 for(const p of positions){
  const y=terrainHeight(night,p.x,p.z,p.baseY??0);
  if(y===null||!clearOfPlay(world,p.x,p.z,p.clearance??4.2))continue;
  const s=p.scale??1,yaw=p.angle??0;
  for(let k=0;k<3;k++){
   const ca=yaw+k*2.1,ox=Math.cos(ca)*.22*s,oz=Math.sin(ca)*.22*s,ch=s*(.85+k*.14);
   culms.push({x:p.x+ox,y:y+1.9*ch,z:p.z+oz,angle:ca,pitch:.06,sx:1,sy:ch,sz:1});
   for(const ny of [1.1,2.2,3.1])nodes.push({x:p.x+ox,y:y+ny*ch,z:p.z+oz,pitch:Math.PI/2});
   for(let l=0;l<2;l++){
    const la=ca+l*1.8+.4;
    leaves.push({x:p.x+ox+Math.cos(la)*.24,y:y+(2.6+l*.75)*ch,z:p.z+oz+Math.sin(la)*.24,angle:-la,pitch:1.1,sx:.9,sy:1,sz:.3,color:l?'#7EB56D':'#5E944F'});
   }
  }
 }
 instances(root,culmGeo,culmMat,culms);instances(root,nodeGeo,culmMat,nodes);instances(root,leafGeo,leafMat,leaves);
}

function buildPineTrees(root,world,night,positions){
 const trunkGeo=new T.CylinderGeometry(.08,.18,2.0,6),tierGeo=new T.ConeGeometry(1.0,1.6,7);
 const trunkMat=make('#5C3E22','#241608'),tierMat=make('#2F5E38','#122918');
 const trunks=[],tiers=[],shades=['#274F30','#31613B','#3B7045'];
 for(const p of positions){
  const y=terrainHeight(night,p.x,p.z,p.baseY??0);
  if(y===null||!clearOfPlay(world,p.x,p.z,p.clearance??5.0))continue;
  const s=p.scale??1,yaw=p.angle??0;
  trunks.push({x:p.x,y:y+1.0*s,z:p.z,sx:s,sy:s,sz:s});
  // 3 stacked evergreen tiers
  const layers=[[1.85,1.15,1.05],[2.75,.88,.95],[3.55,.58,.85]];
  layers.forEach(([ly,rw,rh],idx)=>{
   tiers.push({x:p.x,y:y+ly*s,z:p.z,angle:yaw+idx*.6,sx:rw*s,sy:rh*s,sz:rw*s,color:shades[idx]});
  });
 }
 instances(root,trunkGeo,trunkMat,trunks);instances(root,tierGeo,tierMat,tiers);
}

function groundCover(root,world,night,m){const tufts=[],stones=[],flowers=[],count=night===2?110:night===3?80:105;
 for(let i=0;i<count;i++){const island=night===2?i%2:0,cx=island?70:0,a=i*2.399963229728653,r=night===1?9+28*Math.sqrt((i+.5)/count):night===2?8+18*Math.sqrt((i+.5)/count):26+16*Math.sqrt((i+.5)/count),x=cx+Math.cos(a)*r,z=Math.sin(a)*r,y=terrainHeight(night,x,z,0);if(y===null||Math.abs(y)>.05||!clearOfPlay(world,x,z))continue;
  if(i%9===0)stones.push({x,y:y+.13,z,sx:.5+i%3*.16,sy:.34,sz:.7,color:i%2?'#80796A':'#687C75'});
  else if(i%7===0)flowers.push({x,y:y+.29,z,sx:.8,sy:.8,sz:.8,color:i%2?'#E0A3AC':'#F2C14E'});
  else tufts.push({x,y:y+.23,z,angle:a,sx:.65+i%3*.2,sy:.8+i%4*.17,sz:.65,color:i%3?'#7D9B72':'#9BAE82'});
 }
 instances(root,new T.ConeGeometry(.18,.48,3),m.grass,tufts);instances(root,new T.DodecahedronGeometry(.36,0),m.stone,stones);instances(root,new T.IcosahedronGeometry(.15,0),m.flower,flowers);
}
function hut(root,x,z,m){const group=new T.Group();group.position.set(x,0,z);root.add(group);
 for(const dx of [-1.6,1.6])for(const dz of [-1.3,1.3])add(group,new T.CylinderGeometry(.11,.13,2.7,6),m.bamboo,dx,1.35,dz);
 add(group,new T.BoxGeometry(3.8,.2,3.15),m.wood,0,.72,0);
 add(group,new T.BoxGeometry(3.55,2.05,2.8),m.paper,0,1.83,0);
 const roof=add(group,new T.ConeGeometry(3.2,1.65,4),m.thatch,0,3.65,0);roof.rotation.y=Math.PI/4;
 add(group,new T.BoxGeometry(.85,1.45,.06),m.wood,0,1.65,1.43);
 for(const dx of [-1.23,1.23])add(group,new T.BoxGeometry(.46,.52,.07),m.midnight,dx,2.05,1.44);
 for(const dx of [-2.1,2.1])add(group,new T.CylinderGeometry(.09,.09,3.4,6),m.bamboo,dx,.35,0).rotation.z=Math.PI/2;
 return group;
}
function steppingPath(root,points,mat){
 if(!points.length)return;
 instances(root,new T.CylinderGeometry(.55,.65,.09,7),mat,points.map((p,i)=>({x:p.x,y:(p.y??0)+.045,z:p.z,angle:i*.8,sx:.9+(i%3)*.15,sy:1,sz:.75+(i%2)*.2})));
}
function miniLanterns(root,points,m){
 if(!points.length)return;
 instances(root,new T.CylinderGeometry(.06,.08,1.5,6),m.bamboo,points.map(p=>({x:p.x,y:(p.y??0)+.75,z:p.z})));
 instances(root,new T.CylinderGeometry(.18,.2,.38,8),m.warmGlow,points.map(p=>({x:p.x,y:(p.y??0)+1.62,z:p.z})));
 instances(root,new T.ConeGeometry(.3,.18,8),m.wood,points.map(p=>({x:p.x,y:(p.y??0)+1.9,z:p.z})));
}
function nightOne(root,world,m){hut(root,-21,-27,m);hut(root,18,-29,m);
 // A short riverside landing remains entirely inside the existing island disk.
 for(let i=0;i<6;i++)add(root,new T.BoxGeometry(1.05,.13,4.1),m.wood,-3.3+i*1.15,.06,-33.5);
 for(const x of [-3.7,3.7])for(const z of [-35,-32])add(root,new T.CylinderGeometry(.12,.15,1.65,7),m.bamboo,x,.82,z);
 // Moored wooden sampan boat beside the dock (visual-only)
 const boat=new T.Group();boat.position.set(6.8,.12,-35.6);boat.rotation.y=-.25;root.add(boat);
 add(boat,new T.BoxGeometry(3.4,.22,1.15),m.wood,0,0,0);
 for(const side of [-1,1]){const rim=add(boat,new T.BoxGeometry(3.2,.28,.1),m.bamboo,0,.18,side*.55);rim.rotation.x=side*.18;}
 add(boat,new T.CylinderGeometry(.06,.08,1.1,6),m.bamboo,-1.4,.55,0);
 add(boat,new T.CylinderGeometry(.16,.18,.32,8),m.warmGlow,-1.4,1.18,0);
 // Stepping stone path from center to the riverside dock & huts
 const path=[];for(let i=1;i<=11;i++)path.push({x:Math.sin(i*.55)*1.1,z:-i*2.65});
 steppingPath(root,path,m.stone);
 miniLanterns(root,[{x:-4.4,z:-31.5},{x:4.4,z:-31.5},{x:-18.5,z:-24.8},{x:15.5,z:-26.8},{x:-3.2,z:-12},{x:3.2,z:-20}],m);
 const flags=[];for(let i=0;i<7;i++){const x=-9+i*3,z=-32,flag=add(root,new T.ConeGeometry(.23,.8,3),m.scarlet,x,2.1,z);flag.rotation.z=Math.PI/2;flag.userData.keepUnmerged=true;flags.push(flag);}

 // --- Night 1 realistic vegetation ---
 const broadPos=[],palmPos=[],bambooPos=[];
 for(let i=0;i<18;i++){const a=i*2.399963229728653,r=24+5*(i%4);broadPos.push({x:Math.cos(a)*r,z:Math.sin(a)*r,angle:a,scale:.88+(i%3)*.16,lean:i%2?1:-1,clearance:6.5});}
 for(let i=0;i<12;i++){const a=i*2.399963229728653*1.3+.7,r=17+(i%3)*5.5;palmPos.push({x:Math.cos(a)*r,z:Math.sin(a)*r,angle:a,scale:.9+(i%3)*.12,lean:.07,clearance:5.5});}
 for(let i=0;i<14;i++){const a=i*2.399963229728653*.7+1.1,r=11+(i%5)*4.2;bambooPos.push({x:Math.cos(a)*r,z:Math.sin(a)*r,angle:a,scale:.85+(i%3)*.15,clearance:4.5});}
 buildBroadTrees(root,world,1,broadPos);
 buildPalmTrees(root,world,1,palmPos,{height:4.1,frondLen:1.45,trunkColor:'#947044'});
 buildBambooClumps(root,world,1,bambooPos);

 // Flowering shrubs near landing
 const shrubs=[];
 for(let i=0;i<10;i++){
  const a=i*2.399*1.5+.3,r=14+i%5*3.2;
  const x=Math.cos(a)*r,z=Math.sin(a)*r;
  if(!clearOfPlay(world,x,z,4.5))continue;
  const y=terrainHeight(1,x,z,0);if(y===null)continue;
  shrubs.push({x,y:y+.28,z,sx:.55+i%3*.12,sy:.45+i%4*.1,sz:.55+i%3*.12,angle:a,color:i%3===0?'#5B9955':i%3===1?'#D4809A':'#4A7A45'});
 }
 instances(root,new T.IcosahedronGeometry(.45,0),make('#5B9955','#284A24'),shrubs);

 return flags;
}
function nightTwo(root,world,m){const flags=[];
 // --- Night 2 realistic vegetation: Areca palms (cau), coconut palms & bamboo clumps on both islands ---
 const cauPos=[],coconutPos=[],bamPos=[];
 for(let i=0;i<26;i++){const cx=i%2?70:0,a=i*2.399963229728653*1.1+.5,r=14+(i%5)*2.4;cauPos.push({x:cx+Math.cos(a)*r,z:Math.sin(a)*r,angle:a,scale:.95+(i%3)*.14,lean:.06,clearance:5});}
 for(let i=0;i<12;i++){const cx=i%2?70:0,a=i*2.399963229728653*1.7+1.2,r=10+(i%4)*3;coconutPos.push({x:cx+Math.cos(a)*r,z:Math.sin(a)*r,angle:a,scale:1.0+(i%3)*.12,lean:.14,clearance:5.5});}
 for(let i=0;i<24;i++){const cx=i%2?70:0,a=i*2.399963229728653*.9+.3,r=19+(i%5)*1.5;bamPos.push({x:cx+Math.cos(a)*r,z:Math.sin(a)*r,angle:a,scale:.9+(i%3)*.14,clearance:4.5});}
 buildPalmTrees(root,world,2,cauPos,{height:4.9,frondLen:1.35,trunkColor:'#9C7A42'});
 buildPalmTrees(root,world,2,coconutPos,{height:4.1,frondLen:1.75,trunkColor:'#826234'});
 buildBambooClumps(root,world,2,bamPos);
 for(let i=0;i<12;i++){const x=26.8+i*1.45;add(root,new T.BoxGeometry(1.25,.055,3.72),m.bamboo,x,.042,0);}
 for(const x of [25.5,44.5]){
  add(root,new T.CylinderGeometry(.11,.14,2.7,7),m.bamboo,x,1.35,3.7);
  // Bamboo archway framing both ends of the bridge
  add(root,new T.CylinderGeometry(.11,.14,3.1,7),m.bamboo,x,1.55,-2.5);
  add(root,new T.CylinderGeometry(.11,.14,3.1,7),m.bamboo,x,1.55,2.5);
  add(root,new T.BoxGeometry(.22,.22,5.6),m.wood,x,3.1,0);
  add(root,new T.CylinderGeometry(.22,.24,.44,8),m.warmGlow,x,2.75,0);
  const flag=add(root,new T.BoxGeometry(1.25,.75,.035),m.scarlet,x+.66,2.22,3.7);flag.userData.keepUnmerged=true;flags.push(flag);
 }
 // Stepping stones leading toward the bridge on both islands
 const n2Path=[];for(let i=1;i<=7;i++){n2Path.push({x:7+i*2.4,z:Math.sin(i*.6)*.7});n2Path.push({x:63-i*2.4,z:-Math.sin(i*.6)*.7});}
 steppingPath(root,n2Path,m.stone);
 miniLanterns(root,[{x:23.5,z:-3.2},{x:23.5,z:3.2},{x:46.5,z:-3.2},{x:46.5,z:3.2}],m);

 // Wind-reactive cloth markers (flags already in original); add extra fabric strips near bridge on both sides
 for(const side of [-1,1]){
  const stripX=side>0?25:45,flag2=add(root,new T.BoxGeometry(.06,.95,2.1),m.scarlet,stripX,1.75,0);
  flag2.userData.keepUnmerged=true;flags.push(flag2);
 }

 return flags;
}
function nightThree(root,world,m){const t=world.tower,flags=[];
 // Decorative bands and bell remain inside/above the existing un-climbable tower collider.
 for(const h of [2,5,7.5]){const band=add(root,new T.TorusGeometry(2.05,.13,5,24),m.stone,t.x,t.y+h,t.z);band.rotation.x=Math.PI/2;}
 for(let i=0;i<8;i++){const a=i*Math.PI/4,x=Math.cos(a)*1.75,z=Math.sin(a)*1.75;add(root,new T.CylinderGeometry(.12,.16,6,6),m.wood,t.x+x,t.y+4,t.z+z);}
 const bell=add(root,new T.CylinderGeometry(.62,.9,1.1,12),m.gold,t.x,t.y+7.3,t.z);bell.material.emissiveIntensity=.12;
 add(root,new T.ConeGeometry(.35,1.35,8),m.gold,t.x,t.y+11.4,t.z);
 for(const deg of [30,150]){const a=deg*Math.PI/180,px=Math.cos(a)*30.5,pz=Math.sin(a)*30.5,ox=-Math.sin(a)*2.2,oz=Math.cos(a)*2.2;
  for(const s of [-1,1]){add(root,new T.CylinderGeometry(.22,.3,2.4,6),m.stone,px+ox*s,1.2,pz+oz*s);add(root,new T.CylinderGeometry(.24,.26,.42,8),m.warmGlow,px+ox*s,2.6,pz+oz*s);}
 }
 miniLanterns(root,[{x:-16,y:3,z:14},{x:16,y:3,z:14},{x:-5.5,y:6,z:-4.5},{x:5.5,y:6,z:-4.5}],m);
 for(const side of [-1,1]){const x=side*4.8,z=0;add(root,new T.CylinderGeometry(.08,.1,3.2,6),m.wood,x,7.6,z);const flag=add(root,new T.BoxGeometry(1.75,1.12,.035),m.scarlet,x+side*.88,8.2,z);flag.userData.keepUnmerged=true;flags.push(flag);}
 const terrace=[];for(let i=0;i<28;i++){const a=(i+.5)*Math.PI/28;terrace.push({x:Math.cos(a)*22.8,y:3.12,z:Math.sin(a)*22.8,angle:a,sy:.42});}
 instances(root,new T.DodecahedronGeometry(.45,0),m.stone,terrace);

 // --- Night 3 realistic vegetation: Tiered pine/cypress & broad ancient trees ---
 const pinePos=[],ancientPos=[];
 for(let i=0;i<26;i++){const a=i*2.399963229728653,r=36+(i%4)*2.0;pinePos.push({x:Math.cos(a)*r,z:Math.sin(a)*r,angle:a,scale:.95+(i%3)*.18,clearance:5.5});}
 for(let i=0;i<12;i++){const a=i*2.399963229728653*1.3+.8,r=17+(i%3)*2.8;const x=Math.cos(a)*r,z=Math.sin(a)*r;const y=terrainHeight(3,x,z,0);if(y!==null&&Math.abs(y)<.3)ancientPos.push({x,z,angle:a,scale:.75+(i%3)*.12,clearance:5.0});}
 buildPineTrees(root,world,3,pinePos);
 buildBroadTrees(root,world,3,ancientPos);

 // Flowering red shrubs ringing the tower base and terraces (đỗ quyên / azalea)
 const azaleaShrubs=[];
 for(let i=0;i<24;i++){
  const a=i*2.399963229728653*.8+.4,r=5+i%4*2.5;
  const x=Math.cos(a)*r,z=Math.sin(a)*r;
  if(Math.hypot(x,z)<t.r+1.5)continue;
  if(!clearOfPlay(world,x,z,3))continue;
  const y=terrainHeight(3,x,z,0);if(y===null)continue;
  azaleaShrubs.push({x,y:y+.55,z,angle:a,sx:.7+i%3*.2,sy:.65+i%4*.18,sz:.7+i%3*.2,color:i%3===0?'#D04060':i%3===1?'#C83050':'#E05070'});
 }
 instances(root,new T.IcosahedronGeometry(.55,0),make('#CC3055','#7A1030'),azaleaShrubs);

 // Hanging lantern banners between tower ribs (vertical cloth strips)
 for(let i=0;i<8;i++){
  const a=i*Math.PI/4,bx=Math.cos(a)*1.4,bz=Math.sin(a)*1.4;
  const banner=add(root,new T.BoxGeometry(.06,.65,.58),m.scarlet,t.x+bx,t.y+4.8,t.z+bz);
  banner.userData.keepUnmerged=true;flags.push(banner);
 }

 // Tall moss-green ferns on the outer slopes
 const fernGeo=new T.ConeGeometry(.55,1.3,4);
 const fernMat=make('#4E824A','#1C381A');
 const ferns=[];
 for(let i=0;i<30;i++){
  const a=i*2.399963229728653*1.5+.6,r=28+i%5*2;
  const x=Math.cos(a)*r,z=Math.sin(a)*r;
  if(!clearOfPlay(world,x,z,4.5))continue;
  const y=terrainHeight(3,x,z,0);if(y===null||Math.abs(y)>.5)continue;
  ferns.push({x,y:y+.65,z,angle:a,sx:.8+i%4*.16,sy:.9+i%3*.22,sz:.8+i%4*.16,color:i%2?'#4E824A':'#3D6B3A'});
 }
 instances(root,fernGeo,fernMat,ferns);

 return flags;
}
function pinkFlowerBushes(root,world,night,m){
 const count=night===2?22:night===3?20:18,bases=[],blossoms=[];
 for(let i=0;i<count;i++){
  const cx=night===2&&i%2?70:0,a=i*2.399963229728653+.45,r=night===1?11+i%5*4.8:night===2?9+i%4*3.6:16+i%5*4.2;
  const x=cx+Math.cos(a)*r,z=Math.sin(a)*r;
  if(!clearOfPlay(world,x,z,4.2))continue;
  const y=terrainHeight(night,x,z,0);if(y===null||Math.abs(y)>.4)continue;
  const s=.72+i%3*.16;
  bases.push({x,y:y+.22*s,z,angle:a,sx:s,sy:.68*s,sz:s,color:i%2?'#4A7A45':'#3B6638'});
  for(let j=0;j<3;j++){
   const ba=a+j*2.094,br=.24*s;
   blossoms.push({x:x+Math.cos(ba)*br,y:y+(.34+j%2*.08)*s,z:z+Math.sin(ba)*br,angle:ba,sx:.32*s,sy:.28*s,sz:.32*s,color:j===0?'#FF9EB5':j===1?'#F28CA8':'#E06C92'});
  }
 }
 instances(root,new T.IcosahedronGeometry(.48,0),m.leaf,bases);
 instances(root,new T.DodecahedronGeometry(.36,0),m.pinkFlower,blossoms);
}
export function addWorldDecor(root,world,night){const m={grass:make('#8CA984','#344F3E'),stone:make('#A1A394','#33433F'),flower:make('#E0A3AC','#7D4D58'),pinkFlower:make('#FF9EB5','#8C3454'),wood:make('#8A6348','#3D261D'),bamboo:make('#B7A66A','#55452B'),paper:make('#D9CBA8','#756648'),thatch:make('#9D7950','#604123'),midnight:make('#283244'),scarlet:make('#C8102E','#5B071B'),leaf:make('#829C70','#2E4B3E'),gold:make('#D5AF61','#6D4D1E'),warmGlow:new T.MeshLambertMaterial({color:'#FFD685',emissive:'#FFB347',emissiveIntensity:.85,flatShading:true})};
 groundCover(root,world,night,m);pinkFlowerBushes(root,world,night,m);const flags=night===1?nightOne(root,world,m):night===2?nightTwo(root,world,m):nightThree(root,world,m);
 return {update(time,wind,reduced){const sway=reduced?0:Math.sin(time*.0018)*(wind?.active?.14:.045);for(let i=0;i<flags.length;i++)flags[i].rotation.z=sway*(i%2?-1:1);}};
}
