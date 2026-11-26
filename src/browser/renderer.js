import * as T from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { getWorld, terrainHeight, getAmbientProgress } from '../data/worlds.js';
import { addWorldDecor } from './decor.js';
import { createMay } from './character.js';

const M={sky:'#0E1430',fog:'#1B2350',grass:'#2F5D50',sand:'#C9B48A',wood:'#6B4A2F',sea:'#12384A',lamp:'#FFB347',core:'#FFE9B0',off:'#5B5F6E',mote:'#FFF6C2',halo:'#FFE58A',shade:'#120A1A',shadeEdge:'#7A3CFF',stunned:'#3A3450',coat:'#E8E2D0',scarf:'#C8102E',gold:'#F2C14E',drifter:'#8FA3B8',danger:'#FF5A5F',text:'#F5F1E6'};
const mat=(color,emissive=0,extra={})=>new T.MeshLambertMaterial({color,emissive,flatShading:true,...extra});
function box(w,h,d){return new T.BoxGeometry(w,h,d);}
function disk(r,y,depth,color,parent,texture){const o=new T.Mesh(new T.CylinderGeometry(r,r,depth,64),mat(color,color,{emissiveIntensity:.26,map:texture}));o.position.y=y-depth/2;parent.add(o);return o;}
function ringArc(inner,outer,a0,a1,y,color,parent){const verts=[],idx=[],steps=Math.ceil((a1-a0)*outer/2);for(let i=0;i<=steps;i++){const a=a0+(a1-a0)*i/steps;for(const r of [inner,outer])verts.push(Math.cos(a)*r,y,Math.sin(a)*r);}for(let i=0;i<steps;i++){const b=i*2;idx.push(b,b+1,b+2,b+1,b+3,b+2);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(verts,3));g.setIndex(idx);g.computeVertexNormals();const m=new T.Mesh(g,mat(color,0,{side:T.DoubleSide}));parent.add(m);return m;}
function arcWall(r,a0,a1,y0,y1,color,parent){const v=[],idx=[],steps=Math.ceil((a1-a0)*r/2);for(let i=0;i<=steps;i++){const a=a0+(a1-a0)*i/steps,x=Math.cos(a)*r,z=Math.sin(a)*r;v.push(x,y0,z,x,y1,z);}for(let i=0;i<steps;i++){const b=i*2;idx.push(b,b+1,b+2,b+1,b+3,b+2);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setIndex(idx);g.computeVertexNormals();parent.add(new T.Mesh(g,mat(color,0,{side:T.DoubleSide})));}
function cylinderBetween(a,b,r,color,parent){const d=new T.Vector3(b.x-a.x,b.y-a.y,b.z-a.z),m=new T.Mesh(new T.CylinderGeometry(r,r,d.length(),6),mat(color));m.position.set((a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());parent.add(m);return m;}

export function createRenderer(canvasHost,onEvent=()=>{}){
 const scene=new T.Scene();scene.background=new T.Color(M.sky);scene.fog=new T.FogExp2(M.fog,.0032);
 const mossPixels=new Uint8Array(64*64*4);for(let y=0;y<64;y++)for(let x=0;x<64;x++){const k=(y*64+x)*4,v=Math.round(239+7*Math.sin(x*.33)*Math.sin(y*.29)+5*Math.sin(x*.11+y*.17));mossPixels[k]=v;mossPixels[k+1]=v;mossPixels[k+2]=v;mossPixels[k+3]=255;}const mossTexture=new T.DataTexture(mossPixels,64,64,T.RGBAFormat);mossTexture.wrapS=mossTexture.wrapT=T.RepeatWrapping;mossTexture.magFilter=mossTexture.minFilter=T.LinearFilter;mossTexture.repeat.set(3,3);mossTexture.colorSpace=T.SRGBColorSpace;mossTexture.needsUpdate=true;
 const paperPixels=new Uint8Array(32*32*4);for(let y=0;y<32;y++)for(let x=0;x<32;x++){const k=(y*32+x)*4,v=Math.round(244+7*Math.sin(x*.73+y*.27)+3*Math.sin(y*1.81));paperPixels[k]=v;paperPixels[k+1]=v;paperPixels[k+2]=v;paperPixels[k+3]=255;}const paperTexture=new T.DataTexture(paperPixels,32,32,T.RGBAFormat);paperTexture.wrapS=paperTexture.wrapT=T.RepeatWrapping;paperTexture.magFilter=paperTexture.minFilter=T.LinearFilter;paperTexture.colorSpace=T.SRGBColorSpace;paperTexture.needsUpdate=true;
 const skyGeo=new T.SphereGeometry(320,24,12),colors=[],position=skyGeo.attributes.position,zenith=new T.Color(M.sky),horizon=new T.Color('#394565'),deep=new T.Color(M.sea),sample=new T.Color();
 for(let i=0;i<position.count;i++){const y=position.getY(i)/320;sample.copy(y>=0?zenith:deep).lerp(horizon,y>=0?Math.max(0,1-y*2.2):Math.max(0,1+y*2));colors.push(sample.r,sample.g,sample.b);}skyGeo.setAttribute('color',new T.Float32BufferAttribute(colors,3));const sky=new T.Mesh(skyGeo,new T.MeshBasicMaterial({vertexColors:true,side:T.BackSide,depthWrite:false,fog:false,toneMapped:false}));scene.add(sky);
 const renderer=new T.WebGLRenderer({antialias:false,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.shadowMap.enabled=false;canvasHost.append(renderer.domElement);
 const camera=new T.PerspectiveCamera(48,innerWidth/innerHeight,.1,450),hemisphere=new T.HemisphereLight('#F5F1E6','#24213B',.15),sun=new T.DirectionalLight('#F2C14E',2.1);sun.position.set(-25,50,18);scene.add(hemisphere,sun);
 const stars=new T.BufferGeometry(),starPos=[];for(let i=0;i<420;i++){const a=i*2.399,r=100+(i%11)*10;starPos.push(Math.cos(a)*r,26+(i*37%74),Math.sin(a)*r);}stars.setAttribute('position',new T.Float32BufferAttribute(starPos,3));scene.add(new T.Points(stars,new T.PointsMaterial({color:M.text,size:.65,sizeAttenuation:true})));
 const moon=new T.Mesh(new T.SphereGeometry(4,18,14),new T.MeshBasicMaterial({color:M.core,toneMapped:false,fog:false}));moon.position.set(-48,63,-78);scene.add(moon);
 const moonHalo=new T.Mesh(new T.SphereGeometry(6.8,16,12),new T.MeshBasicMaterial({color:'#FFE58A',transparent:true,opacity:.14,depthWrite:false,toneMapped:false,fog:false}));moonHalo.position.copy(moon.position);scene.add(moonHalo);
 const player=new T.Group();scene.add(player);const may=createMay(player);

 let worldRoot=new T.Group(),lampMeshes=new Map(),moteMeshes=new Map(),shadeMeshes=new Map(),drifterMeshes=new Map(),charmMeshes=new Map(),currentNight=0,lastX=0,lastZ=0,currentWorld=null,benchmarkCamera=false,benchmarkCameraEpoch=null;const pools={mote:[],shade:[],drifter:[],charm:[]};const moteGeometry=new T.SphereGeometry(.13,6,4),moteDummy=new T.Object3D();let moteInstances=null,shadeInstances=null,visuals=null,lampInstances=null,decor=null,distinguishable=false,reducedMotion=false,observed={},lastVisualTime=0;const cameraTarget=new T.Vector3(),focus=new T.Vector3(),barRight=new T.Vector3(),cameraForward=new T.Vector3();
 const glowMat=mat(M.mote,0xFFE58A),woodMat=mat(M.wood),leafMat=mat(M.grass,M.grass,{emissiveIntensity:.25}),cloudMat=new T.MeshBasicMaterial({color:'#8FA3B8',transparent:true,opacity:.11,depthWrite:false});
 function clearWorld(){
 scene.remove(worldRoot);const geometries=new Set(),materials=new Set();
 worldRoot.traverse(o=>{if(o.isInstancedMesh)o.dispose();if(o.geometry&&o.geometry!==moteGeometry)geometries.add(o.geometry);for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m&&![glowMat,woodMat,leafMat,cloudMat].includes(m))materials.add(m);});
 for(const g of geometries)g.dispose();for(const m of materials)m.dispose();
 worldRoot=new T.Group();moteInstances=null;shadeInstances=null;visuals=null;lampInstances=null;decor=null;lastVisualTime=0;scene.add(worldRoot);
 lampMeshes.clear();moteMeshes.clear();shadeMeshes.clear();drifterMeshes.clear();charmMeshes.clear();
}
 function mergeStatic(){
   const dynamic=new Set([...lampMeshes.values()].flatMap(o=>[o.cage,o.bulb,o.progress])),groups=new Map(),originals=[];
   worldRoot.updateMatrixWorld(true);worldRoot.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||dynamic.has(o)||o.userData.keepUnmerged||o.material.map)return;const m=o.material,key=[m.type,m.color.getHex(),m.emissive.getHex(),m.emissiveIntensity,m.side,m.opacity,m.transparent].join('/');let g=o.geometry.clone();if(g.index){const indexed=g;g=g.toNonIndexed();indexed.dispose();}g.applyMatrix4(o.matrixWorld);for(const name of Object.keys(g.attributes))if(!['position','normal'].includes(name))g.deleteAttribute(name);if(!groups.has(key))groups.set(key,{material:m,geometries:[]});groups.get(key).geometries.push(g);originals.push(o);});
   const retained=new Set([...groups.values()].map(x=>x.material));for(const o of originals){o.parent.remove(o);o.geometry.dispose();if(!retained.has(o.material)&&![glowMat,woodMat,leafMat,cloudMat].includes(o.material))o.material.dispose();}
   for(const {material,geometries}of groups.values()){const merged=mergeGeometries(geometries);worldRoot.add(new T.Mesh(merged,material));for(const g of geometries)g.dispose();}
 }
 function build(n){clearWorld();const w=getWorld(n);currentWorld=w;currentNight=n;for(const pool of Object.values(pools))pool.length=0;
   for(const s of w.surfaces){if(s.type==='disk'){const top=disk(s.r,s.y,.7,M.grass,worldRoot,mossTexture);top.position.x=s.x;top.position.z=s.z;const base=new T.Mesh(new T.CylinderGeometry(s.r,s.r*.82,s.y>0?s.y-.7:4.5,48),mat(M.wood));base.position.set(s.x,s.y>0?(s.y-.7)/2:s.y-2.55,s.z);worldRoot.add(base);}else if(s.type==='rect'){const b=new T.Mesh(box(s.x2-s.x1,.28,s.z2-s.z1),mat(M.wood));b.position.set((s.x1+s.x2)/2,s.y-.14,(s.z1+s.z2)/2);worldRoot.add(b);for(let x=s.x1+.8;x<s.x2;x+=2.4){const tie=new T.Mesh(box(.3,.38,s.z2-s.z1+.15),mat('#8B6744'));tie.position.set(x,s.y-.02,(s.z1+s.z2)/2);worldRoot.add(tie);}}else if(s.type==='annulus'){ringArc(s.rmin,s.r,0,Math.PI,s.y,M.grass,worldRoot);arcWall(s.rmin,0,Math.PI,0,s.y,M.wood,worldRoot);arcWall(s.r,0,Math.PI,0,s.y,M.wood,worldRoot);}}
   if(n===3){for(const sign of [-1,1]){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([12*sign,0,0,24*sign,0,0,12*sign,3,0,12*sign,3,0,24*sign,0,0,24*sign,3,0],3));g.computeVertexNormals();worldRoot.add(new T.Mesh(g,mat(M.wood,0,{side:T.DoubleSide})));}}
   for(const q of w.ramps){const ux=Math.cos(q.angle),uz=Math.sin(q.angle),px=-uz*q.width/2,pz=ux*q.width/2,points=[];for(const side of [-1,1])for(const rad of [q.r0,q.r1]){const h=q.y0+(q.r0-rad)/(q.r0-q.r1)*(q.y1-q.y0);points.push([ux*rad+px*side,h,uz*rad+pz*side]);}const v=[...points[0],...points[2],...points[1],...points[1],...points[2],...points[3]],g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.computeVertexNormals();worldRoot.add(new T.Mesh(g,mat(M.sand,0,{side:T.DoubleSide})));}
   if(w.tower){const t=w.tower,o=new T.Mesh(new T.CylinderGeometry(t.r,t.r,t.height,12),mat(M.wood));o.position.set(t.x,t.y+t.height/2,t.z);worldRoot.add(o);const roof=new T.Mesh(new T.ConeGeometry(2.6,2.4,12),mat(M.scarf));roof.position.set(t.x,t.y+t.height+1,t.z);worldRoot.add(roof);}
   for(const p of w.pads){const pad=new T.Mesh(new T.CylinderGeometry(p.r,p.r,.22,20),mat(M.gold));pad.position.set(p.x,p.y+.11,p.z);worldRoot.add(pad);const inner=new T.Mesh(new T.TorusGeometry(.65,.07,5,24),mat(M.lamp,0xFFB347));inner.rotation.x=-Math.PI/2;inner.position.set(p.x,p.y+.25,p.z);worldRoot.add(inner);}
   const dummy=new T.Object3D();
   const flowerGeo=new T.ConeGeometry(.14,.4,5),flowers=new T.InstancedMesh(flowerGeo,mat('#E0A3AC'),28);for(let i=0;i<28;i++){const a=i*2.399,r=n===2?9+i%4*4:n===3?16+i%4*3:7+i%5*6,x=(n===2&&(i%2)?70:0)+Math.cos(a)*r,z=Math.sin(a)*r,y=terrainHeight(n,x,z,0);if(y===null)continue;dummy.position.set(x,y+.2,z);dummy.rotation.set(0,a,0);dummy.updateMatrix();flowers.setMatrixAt(i,dummy.matrix);}worldRoot.add(flowers);
   const cloudGeo=new T.IcosahedronGeometry(3.6,1),clouds=new T.InstancedMesh(cloudGeo,cloudMat,44);for(let i=0;i<44;i++){const a=i*2.399,r=46+i%8*8.5;dummy.position.set(Math.cos(a)*r+(n===2?25:0),-4.5-(i%5)*1.4,Math.sin(a)*r);dummy.scale.set(1.3+i%3*.4,.55+i%2*.2,1.1+i%4*.3);dummy.updateMatrix();clouds.setMatrixAt(i,dummy.matrix);}worldRoot.add(clouds);
   // Distant floating island silhouettes for horizon depth (visual-only)
   const distTopGeo=new T.CylinderGeometry(8,8,1.2,12),distBaseGeo=new T.ConeGeometry(8,9,10);
   const distTopMat=mat(n===3?'#1D2E3A':'#23423D',0),distBaseMat=mat(n===3?'#17132A':'#2A2233',0);
   const distTops=new T.InstancedMesh(distTopGeo,distTopMat,7),distBases=new T.InstancedMesh(distBaseGeo,distBaseMat,7);
   for(let i=0;i<7;i++){const a=i*Math.PI*2/7+.35,r=95+(i%3)*18,cx=(n===2?25:0)+Math.cos(a)*r,cz=Math.sin(a)*r,cy=-4+(i%4)*3.5,sc=.85+(i%3)*.35;dummy.position.set(cx,cy,cz);dummy.rotation.set(0,a,0);dummy.scale.set(sc,1,sc);dummy.updateMatrix();distTops.setMatrixAt(i,dummy.matrix);dummy.position.set(cx,cy-5.1,cz);dummy.rotation.set(Math.PI,a,0);dummy.scale.set(sc,1,sc);dummy.updateMatrix();distBases.setMatrixAt(i,dummy.matrix);}
   dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);worldRoot.add(distTops,distBases);
   for(const l of w.lamps){const g=new T.Group();g.position.set(l.x,l.y,l.z);worldRoot.add(g);const base=new T.Mesh(new T.CylinderGeometry(.4,.55,.35,8),mat(M.wood));base.position.y=.18;g.add(base);const pole=new T.Mesh(new T.CylinderGeometry(.11,.18,2.55,8),mat(M.wood));pole.position.y=1.55;g.add(pole);const cage=new T.Mesh(new T.CylinderGeometry(.56,.62,1.35,10),mat(M.off,0,{map:paperTexture}));cage.position.y=3.25;g.add(cage);const cap=new T.Mesh(new T.ConeGeometry(.88,.34,10),mat(M.wood));cap.position.y=4.12;g.add(cap);const lower=new T.Mesh(new T.CylinderGeometry(.64,.64,.12,10),mat(M.wood));lower.position.y=2.53;g.add(lower);const bulb=new T.Mesh(new T.SphereGeometry(.2,8,6),mat(M.core,0xFFE9B0));bulb.position.y=3.25;g.add(bulb);const progress=new T.Mesh(new T.TorusGeometry(1.05,.07,5,32),mat(M.gold));progress.position.y=.25;progress.rotation.x=Math.PI/2;g.add(progress);lampMeshes.set(l.id,{g,cage,bulb,progress});}
   decor=addWorldDecor(worldRoot,w,n);mergeStatic();createFuelVisuals(w);
 }
 function entityMesh(kind){const g=new T.Group();if(kind==='shade'){const b=new T.Mesh(new T.SphereGeometry(.67,12,9),mat(M.shade,0,{emissive:M.shadeEdge,emissiveIntensity:.12}));b.scale.y=1.15;b.position.y=.7;g.add(b);for(const x of [-.22,.22]){const e=new T.Mesh(new T.SphereGeometry(.09,8,6),mat(M.halo,0xFFF6C2));e.position.set(x,.85,.56);g.add(e);}}else if(kind==='drifter'){const silk=new T.Mesh(new T.TorusGeometry(.36,.14,7,18,Math.PI*1.55),mat(M.drifter,0,{transparent:true,opacity:.8}));silk.rotation.x=Math.PI/2;g.add(silk);const bead=new T.Mesh(new T.SphereGeometry(.2,9,7),mat(M.drifter,0x8FA3B8));g.add(bead);for(const side of [-1,1]){const ribbon=new T.Mesh(new T.ConeGeometry(.15,.8,3),mat('#6D9E9D',0,{side:T.DoubleSide}));ribbon.position.set(side*.22,-.35,0);ribbon.rotation.z=side*.35;g.add(ribbon);}}else if(kind==='charm'){const leaf=new T.Mesh(new T.SphereGeometry(.35,6,5),mat(M.scarf));leaf.scale.set(.65,1,.18);g.add(leaf);const edge=new T.Mesh(new T.TorusGeometry(.31,.035,4,12),mat(M.gold,0xF2C14E));g.add(edge);}else{const o=new T.Mesh(moteGeometry,glowMat);g.add(o);}worldRoot.add(g);return g;}
 function syncMap(map,items,kind,idOf=x=>x.id,time=0){const ids=new Set(items.map(idOf));for(const [id,o] of map)if(!ids.has(id)){o.visible=false;pools[kind].push(o);map.delete(id);}for(const x of items){const id=idOf(x);if(!map.has(id))map.set(id,pools[kind].pop()??entityMesh(kind));const o=map.get(id);o.position.set(x.x??x.pos?.x??0,(x.y??x.pos?.y??0)+((kind==='mote'||kind==='charm') ? 0.65 : 0),x.z??x.pos?.z??0);o.visible=x.available!==false&&x.state!=='removed';if(kind==='shade'){const stunned=x.state==='stunned';o.children[0].material.color.set(stunned?M.stunned:M.shade);o.children[0].material.emissive.set(stunned?M.stunned:M.shadeEdge);o.rotation.z=Math.sin(time*.003+id.length)*.08;}if(kind==='mote')o.position.y+=(Math.sin(time*.004+id.length)*.12);if(kind==='drifter')o.rotation.z=Math.sin(time*.004+id.length)*.18;}}
 // Night3 shares identical enemy geometry/materials across GPU instances.
 function syncShadeInstances(items,time){
  if(!shadeInstances||items.length>shadeInstances.capacity){
   if(shadeInstances){const geos=new Set();for(const mesh of shadeInstances.meshes){worldRoot.remove(mesh);mesh.dispose();geos.add(mesh.geometry);mesh.material.dispose();}for(const g of geos)g.dispose();}
   const capacity=Math.max(16,items.length*2),bodyGeometry=new T.SphereGeometry(.67,12,9),eyeGeometry=new T.SphereGeometry(.09,8,6);
   const normal=new T.InstancedMesh(bodyGeometry,mat(M.shade,0,{emissive:M.shadeEdge,emissiveIntensity:.12}),capacity);
   const stunned=new T.InstancedMesh(bodyGeometry,mat(M.stunned,0,{emissive:M.stunned,emissiveIntensity:.12}),capacity);
   const eyes=new T.InstancedMesh(eyeGeometry,new T.MeshBasicMaterial({color:M.shadeEdge,toneMapped:false}),capacity*2);
   const outline=new T.InstancedMesh(bodyGeometry,new T.MeshBasicMaterial({color:M.shadeEdge,side:T.BackSide,toneMapped:false}),capacity);
   const wisp=new T.InstancedMesh(new T.ConeGeometry(.36,.86,6),mat(M.shade,0,{emissive:M.shadeEdge,emissiveIntensity:.16}),capacity);
   shadeInstances={capacity,meshes:[normal,stunned,eyes,outline,wisp]};
   for(const mesh of shadeInstances.meshes){mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);mesh.frustumCulled=false;worldRoot.add(mesh);}
  }
  const [normal,stunned,eyes,outline,wisp]=shadeInstances.meshes,counts=[0,0,0,0,0];
  eyes.material.color.set(distinguishable?'#00B3FF':M.shadeEdge);outline.material.color.copy(eyes.material.color);
  for(const e of items){
   const angle=e.state==='drain'?0:Math.sin(time*.003+e.id.length)*.08,c=Math.cos(angle),sn=Math.sin(angle),index=e.state==='stunned'?1:0;
   moteDummy.position.set(e.x-sn*.7,e.y+c*.7,e.z);moteDummy.rotation.set(0,0,angle);moteDummy.scale.set(1,1.15,1);moteDummy.updateMatrix();shadeInstances.meshes[index].setMatrixAt(counts[index]++,moteDummy.matrix);
   moteDummy.scale.set(1.08,1.15*1.08,1.08);moteDummy.updateMatrix();outline.setMatrixAt(counts[3]++,moteDummy.matrix);
   moteDummy.position.set(e.x,e.y+.02,e.z);moteDummy.rotation.set(0,0,Math.PI+(e.state==='drain'?0:angle*.6));moteDummy.scale.set(e.state==='stunned'?.68:1,1,1);moteDummy.updateMatrix();wisp.setMatrixAt(counts[4]++,moteDummy.matrix);
   for(const x of [-.22,.22]){moteDummy.position.set(e.x+c*x-sn*.85,e.y+sn*x+c*.85,e.z+.56);moteDummy.scale.set(1,1,1);moteDummy.updateMatrix();eyes.setMatrixAt(counts[2]++,moteDummy.matrix);}
  }
  shadeInstances.meshes.forEach((mesh,i)=>{mesh.count=counts[i];mesh.visible=counts[i]>0;mesh.instanceMatrix.needsUpdate=true;});
  moteDummy.rotation.set(0,0,0);moteDummy.scale.set(1,1,1);
 }
 function syncMotes(items,time){if(!moteInstances||items.length>moteInstances.instanceMatrix.count){if(moteInstances){worldRoot.remove(moteInstances);moteInstances.dispose();}moteInstances=new T.InstancedMesh(moteGeometry,glowMat,Math.max(64,items.length*2));moteInstances.frustumCulled=false;worldRoot.add(moteInstances);}moteInstances.count=items.length;for(let i=0;i<items.length;i++){const m=items[i];moteDummy.position.set(m.x,m.y+.65+Math.sin(time*.004+m.id.length)*.12,m.z);moteDummy.updateMatrix();moteInstances.setMatrixAt(i,moteDummy.matrix);}moteInstances.instanceMatrix.needsUpdate=true;}


 function createLampInstances(w){
  const entries=[...lampMeshes.values()],cageGeo=entries[0].cage.geometry,bulbGeo=entries[0].bulb.geometry,progressGeo=entries[0].progress.geometry;
  const cages=[new T.InstancedMesh(cageGeo,mat(M.off,0,{map:paperTexture}),w.lamps.length),new T.InstancedMesh(cageGeo,mat(M.lamp,M.lamp,{map:paperTexture}),w.lamps.length),new T.InstancedMesh(cageGeo,mat(M.lamp,M.lamp,{map:paperTexture}),w.lamps.length)];
  const bulbs=[new T.InstancedMesh(bulbGeo,mat(M.core,0xFFE9B0),w.lamps.length),new T.InstancedMesh(bulbGeo,mat(M.core,0xFFE9B0),w.lamps.length)];
  const progress=new T.InstancedMesh(progressGeo,mat(M.gold),w.lamps.length);
  for(const o of entries)for(const [key,kept]of [['cage',cageGeo],['bulb',bulbGeo],['progress',progressGeo]]){
   const mesh=o[key];mesh.parent.remove(mesh);mesh.material.dispose();if(mesh.geometry!==kept)mesh.geometry.dispose();
  }
  for(const mesh of [...cages,...bulbs,progress]){mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);mesh.frustumCulled=false;worldRoot.add(mesh);}
  lampInstances={cages,bulbs,progress};
 }

 function createFuelVisuals(w){
  createLampInstances(w);
  const count=w.lamps.length,plane=new T.PlaneGeometry(2.2,.18);
  const bg=new T.InstancedMesh(plane,new T.MeshBasicMaterial({color:M.off,toneMapped:false}),count);
  const fill=new T.InstancedMesh(plane,new T.MeshBasicMaterial({color:'#FFFFFF',toneMapped:false}),count);
  const safe=new T.InstancedMesh(new T.RingGeometry(5.96,6.03,64),new T.MeshBasicMaterial({color:M.gold,transparent:true,opacity:.22,side:T.DoubleSide,depthWrite:false,toneMapped:false}),count);
  // Dark jagged opening plus a hanging paper triangle; visual only, no collision.
  const tornGeo=new T.BufferGeometry(),v=[-.3,.2,0, -.04,-.14,0, .08,.12,0, .08,.12,0, .03,-.22,0, .3,-.1,0, -.25,-.35,0, -.1,-.72,0, .04,-.35,0];
  tornGeo.setAttribute('position',new T.Float32BufferAttribute(v,3));
  const colors=[];for(let i=0;i<9;i++){const c=new T.Color(i<6?M.shade:M.off);colors.push(c.r,c.g,c.b);}
  tornGeo.setAttribute('color',new T.Float32BufferAttribute(colors,3));
  const torn=new T.InstancedMesh(tornGeo,new T.MeshBasicMaterial({vertexColors:true,side:T.DoubleSide,toneMapped:false}),count);
  const linePos=new Float32Array(64*6),particlePos=new Float32Array(64*3),lineGeo=new T.BufferGeometry(),particleGeo=new T.BufferGeometry();
  lineGeo.setAttribute('position',new T.BufferAttribute(linePos,3).setUsage(T.DynamicDrawUsage));
  particleGeo.setAttribute('position',new T.BufferAttribute(particlePos,3).setUsage(T.DynamicDrawUsage));
  const streams=new T.LineSegments(lineGeo,new T.LineBasicMaterial({color:M.halo,transparent:true,opacity:.7,toneMapped:false,depthWrite:false}));
  const sparks=new T.Points(particleGeo,new T.PointsMaterial({color:M.halo,size:.18,toneMapped:false,depthWrite:false}));
  for(const m of [bg,fill,safe,torn,streams,sparks]){m.frustumCulled=false;worldRoot.add(m);if(m.isInstancedMesh)m.instanceMatrix.setUsage(T.DynamicDrawUsage);}
  visuals={bg,fill,safe,torn,streams,sparks,linePos,particlePos};
 }
 function setAccessibility(value,reduced=false){distinguishable=!!value;reducedMotion=!!reduced;}
 function syncFuelVisuals(s,time,dt){
  if(!visuals)return;
  let bars=0,zones=0,tornCount=0,drains=0;const lampData=[],cageCounts=[0,0,0],bulbCounts=[0,0];let progressCount=0;
  const pulse=reducedMotion?1:(Math.sin(time*Math.PI*2)+1)/2,blink=reducedMotion||s.sim_tick%60<30;
  for(const l of s.lanterns){
   const o=lampMeshes.get(l.id);if(!o)continue;
   if(o.wasLit!==l.lit){o.shownFuel=l.fuel;o.wasLit=l.lit;}else o.shownFuel+=(l.fuel-o.shownFuel)*(1-Math.exp(-dt*14));
   const cageIndex=!l.lit?0:l.low?2:1,bulbIndex=l.low?1:0;
   o.cage.material=lampInstances.cages[cageIndex].material;o.bulb.material=lampInstances.bulbs[bulbIndex].material;
   o.cage.scale.y=l.lit?1:.8;o.cage.material.color.set(l.lit?M.lamp:M.off);
   o.cage.material.emissive.set(l.lit?M.lamp:'#000000');o.cage.material.emissiveIntensity=l.lit?(l.low?.2+.6*pulse:.8):0;
   o.bulb.visible=l.lit;o.bulb.material.emissiveIntensity=l.lit?(l.low?.3+pulse:1.3):0;
   o.progress.visible=!l.lit&&l.progress>0;o.progress.scale.setScalar(Math.max(.04,l.progress/l.cost));
   moteDummy.position.set(l.x,l.y+3.25,l.z);moteDummy.rotation.set(0,0,0);moteDummy.scale.set(1,o.cage.scale.y,1);moteDummy.updateMatrix();lampInstances.cages[cageIndex].setMatrixAt(cageCounts[cageIndex]++,moteDummy.matrix);
   if(l.lit){moteDummy.scale.set(1,1,1);moteDummy.updateMatrix();lampInstances.bulbs[bulbIndex].setMatrixAt(bulbCounts[bulbIndex]++,moteDummy.matrix);}
   if(o.progress.visible){moteDummy.position.set(l.x,l.y+.25,l.z);moteDummy.rotation.set(Math.PI/2,0,0);moteDummy.scale.copy(o.progress.scale);moteDummy.updateMatrix();lampInstances.progress.setMatrixAt(progressCount++,moteDummy.matrix);}
   if(l.lit){
    moteDummy.position.set(l.x,l.y+4.7,l.z);moteDummy.quaternion.copy(camera.quaternion);moteDummy.scale.set(1,1,1);moteDummy.updateMatrix();visuals.bg.setMatrixAt(bars,moteDummy.matrix);
    const ratio=Math.max(.001,o.shownFuel/100),right=barRight.setFromMatrixColumn(camera.matrixWorld,0);
    moteDummy.position.addScaledVector(right,(ratio-1)*1.1);moteDummy.position.addScaledVector(cameraForward,.006);moteDummy.scale.set(ratio,l.low&&!blink?.35:1,1);moteDummy.updateMatrix();visuals.fill.setMatrixAt(bars,moteDummy.matrix);
    visuals.fill.setColorAt(bars,new T.Color(l.low?(distinguishable?'#FFFFFF':M.danger):M.gold));bars++;
   }else{
    moteDummy.position.set(l.x,l.y+3,l.z);moteDummy.position.addScaledVector(barRight.set(cameraForward.x,0,cameraForward.z).normalize(),.62);moteDummy.quaternion.copy(camera.quaternion);moteDummy.scale.set(1,.8,1);moteDummy.updateMatrix();visuals.torn.setMatrixAt(tornCount++,moteDummy.matrix);
   }
   if(l.safe){moteDummy.position.set(l.x,l.y+.04,l.z);moteDummy.rotation.set(-Math.PI/2,0,0);moteDummy.scale.set(1,1,1);moteDummy.updateMatrix();visuals.safe.setMatrixAt(zones++,moteDummy.matrix);}
   lampData.push({id:l.id,fuel:l.fuel,safe:l.safe,low:l.low,full:l.full,cageScaleY:o.cage.scale.y,color:'#'+o.cage.material.color.getHexString(),progress:l.progress,cost:l.cost,barVisible:l.lit,tornVisible:!l.lit});
  }
  const byId=new Map(s.lanterns.map(l=>[l.id,l])),drainData=[];
  for(const e of s.shades){const l=byId.get(e.target_lantern_id);if(e.state!=='drain'||!l?.lit||drains>=64)continue;
   const start=[l.x,l.y+3.25,l.z],end=[e.x,e.y+.85,e.z],phase=(time*.8+drains*.19)%1;
   visuals.linePos.set([...start,...end],drains*6);for(let k=0;k<3;k++)visuals.particlePos[drains*3+k]=start[k]+(end[k]-start[k])*phase;
   drainData.push({shade:e.id,lantern:l.id});drains++;
  }
  for(const [m,n]of [[visuals.bg,bars],[visuals.fill,bars],[visuals.safe,zones],[visuals.torn,tornCount]]){m.count=n;m.visible=n>0;m.instanceMatrix.needsUpdate=true;}
  for(const [i,m]of lampInstances.cages.entries()){m.count=cageCounts[i];m.visible=m.count>0;m.instanceMatrix.needsUpdate=true;}
  for(const [i,m]of lampInstances.bulbs.entries()){m.count=bulbCounts[i];m.visible=m.count>0;m.instanceMatrix.needsUpdate=true;}
  lampInstances.progress.count=progressCount;lampInstances.progress.visible=progressCount>0;lampInstances.progress.instanceMatrix.needsUpdate=true;
  if(visuals.fill.instanceColor)visuals.fill.instanceColor.needsUpdate=true;
  visuals.streams.geometry.setDrawRange(0,drains*2);visuals.sparks.geometry.setDrawRange(0,drains);
  visuals.streams.visible=visuals.sparks.visible=drains>0;visuals.streams.geometry.attributes.position.needsUpdate=true;visuals.sparks.geometry.attributes.position.needsUpdate=true;
  moteDummy.rotation.set(0,0,0);moteDummy.scale.set(1,1,1);
  observed={lamps:lampData,drains:drainData,safeZones:zones,fuelBars:bars,ambient:hemisphere.intensity,distinguishable,
   edge:shadeInstances?'#'+shadeInstances.meshes[3].material.color.getHexString():null,eyes:shadeInstances?'#'+shadeInstances.meshes[2].material.color.getHexString():null,
   camera:{x:camera.position.x,y:camera.position.y,z:camera.position.z},drawingBuffer:{width:renderer.domElement.width,height:renderer.domElement.height}};
 }
function update(s,time,yaw,zoom){
 if(s.night!==currentNight)build(s.night);
 const dt=lastVisualTime?Math.min(.2,(time-lastVisualTime)/1000):1/60;lastVisualTime=time;
 const p=s.player,simTime=s.sim_tick*1000/60;player.position.set(p.x,p.y,p.z);player.rotation.y=Math.atan2(p.vel.x,p.vel.z);may.update(p,simTime,reducedMotion);
 decor?.update(simTime,s.wind,reducedMotion);
 const lit=s.lanterns.filter(x=>x.lit).length;hemisphere.intensity=getAmbientProgress(lit,s.lanterns.length);
 const nightAtmosphere={1:{sky:'#0E1430',fog:'#1B2350'},2:{sky:'#0B1A33',fog:'#16304E'},3:{sky:'#14102C',fog:'#241B47'}};
 const atmo=nightAtmosphere[currentNight]??nightAtmosphere[1];
 scene.background.set(atmo.sky);scene.fog.color.set(atmo.fog);
 if(benchmarkCamera){if(benchmarkCameraEpoch===null)benchmarkCameraEpoch=time;const a=2*Math.PI*((time-benchmarkCameraEpoch)%15000)/15000;camera.position.set(30*Math.cos(a),15,-30*Math.sin(a));camera.lookAt(0,0,0);}else{cameraTarget.set(p.x+Math.sin(yaw)*zoom,p.y+zoom*.62,p.z+Math.cos(yaw)*zoom);camera.position.copy(cameraTarget);camera.lookAt(p.x,p.y+1.15,p.z);}camera.updateMatrixWorld();cameraForward.setFromMatrixColumn(camera.matrixWorld,2);
 syncMotes(s.motes,simTime);syncShadeInstances(s.shades,simTime);syncMap(drifterMeshes,s.drifters,'drifter',undefined,simTime);syncMap(charmMeshes,s.charms,'charm',undefined,simTime);
 syncFuelVisuals(s,s.sim_tick/60,dt);
 focus.set(p.x,p.y+1,p.z);onEvent({camera,focus,player,world:currentWorld,time});renderer.render(scene,camera);
}
 function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);}
 addEventListener('resize',resize);return{scene,camera,renderer,build,update,setAccessibility,benchmarkMode(v){benchmarkCamera=!!v;benchmarkCameraEpoch=null;},observe:()=>structuredClone(observed),dispose(){removeEventListener('resize',resize);clearWorld();may.dispose();skyGeo.dispose();sky.material.dispose();mossTexture.dispose();paperTexture.dispose();stars.dispose();renderer.dispose();canvasHost.removeChild(renderer.domElement);}};
}
export { M as palette };
