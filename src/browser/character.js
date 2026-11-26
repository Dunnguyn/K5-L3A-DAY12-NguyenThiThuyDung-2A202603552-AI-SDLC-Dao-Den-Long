import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

const material=(color,glow=0)=>new T.MeshStandardMaterial({color,roughness:.92,metalness:0,flatShading:true,emissive:color,emissiveIntensity:glow});
const mesh=(group,geometry,mat,x,y,z)=>{const o=new T.Mesh(geometry,mat);o.position.set(x,y,z);group.add(o);return o;};

export function createMay(group){
 const cream=material('#E8E2D0',.24),skin=material('#EACAA5',.16),scarf=material('#C8102E',.28),trousers=material('#38455B',.14),bamboo=material('#C9B48A',.25),brown=material('#6B4A2F',.2),gold=material('#F2C14E',.45),dark=material('#2E2630',.08);
 const tunic=mesh(group,new T.CylinderGeometry(.35,.47,.92,10),cream,0,.91,0);
 mesh(group,new T.CylinderGeometry(.39,.4,.1,10),brown,0,.56,0);
 const collar=mesh(group,new T.ConeGeometry(.27,.25,4),cream,0,1.42,.24);collar.rotation.x=.3;
 const head=mesh(group,new T.SphereGeometry(.34,14,10),skin,0,1.53,0);
 const hair=mesh(group,new T.SphereGeometry(.35,12,8,0,Math.PI*2,0,Math.PI*.43),dark,0,1.56,-.02);
 const brim=mesh(group,new T.CylinderGeometry(.83,.83,.055,18),bamboo,0,1.83,0);
 const hat=mesh(group,new T.ConeGeometry(.74,.43,18),bamboo,0,2.06,0);
 const hatBand=mesh(group,new T.CylinderGeometry(.31,.32,.06,16),brown,0,1.9,0);
 const hatRidge=mesh(group,new T.TorusGeometry(.7,.018,4,18),brown,0,1.81,0);hatRidge.rotation.x=Math.PI/2;
 for(const x of [-.13,.13]){mesh(group,new T.SphereGeometry(.046,8,6),dark,x,1.56,.31);mesh(group,new T.SphereGeometry(.015,6,4),cream,x-.012,1.575,.346);}
 const smile=mesh(group,new T.TorusGeometry(.075,.012,3,8,Math.PI),brown,0,1.39,.31);smile.rotation.z=Math.PI;
 const scarfKnot=mesh(group,new T.SphereGeometry(.16,8,6),scarf,.13,1.27,.35),tail=mesh(group,new T.BoxGeometry(.2,.52,.055),scarf,.23,1.02,.31);tail.rotation.z=-.25;
 const legs=[];for(const x of [-.19,.19]){const leg=mesh(group,new T.CapsuleGeometry(.12,.27,3,7),trousers,x,.31,0);legs.push(leg);mesh(group,new T.BoxGeometry(.28,.12,.43),brown,x,.09,.08);}
 const arms=[];for(const x of [-.47,.47]){const pivot=new T.Group();pivot.position.set(x,1.28,0);group.add(pivot);mesh(pivot,new T.CapsuleGeometry(.11,.34,3,6),cream,0,-.26,0);mesh(pivot,new T.SphereGeometry(.115,8,6),skin,0,-.55,0);arms.push(pivot);}
 const satchel=mesh(group,new T.BoxGeometry(.45,.5,.26),brown,.45,.75,-.03);mesh(group,new T.BoxGeometry(.51,.09,.29),bamboo,.45,.97,-.03);
 const strap=mesh(group,new T.BoxGeometry(.055,.8,.05),brown,.17,1.12,.36);strap.rotation.z=.55;
 const handLamp=mesh(group,new T.CylinderGeometry(.12,.16,.28,8),bamboo,-.52,.78,.06);mesh(group,new T.SphereGeometry(.1,8,6),gold,-.52,.78,.07);mesh(group,new T.ConeGeometry(.18,.12,8),brown,-.52,.98,.06);
 const animated=new Set([tunic,hat,tail,...legs,satchel,handLamp]),batches=new Map();
 for(const o of [...group.children]){if(!o.isMesh||animated.has(o))continue;o.updateMatrix();let g=o.geometry.clone();if(g.index){const indexed=g;g=g.toNonIndexed();indexed.dispose();}g.applyMatrix4(o.matrix);if(!batches.has(o.material))batches.set(o.material,[]);batches.get(o.material).push(g);group.remove(o);o.geometry.dispose();}
 for(const [m,geometries]of batches){const merged=mergeGeometries(geometries);group.add(new T.Mesh(merged,m));for(const g of geometries)g.dispose();}
 const palette=[cream,skin,scarf,trousers,bamboo,brown,gold,dark];
 return{update(p,simTime,reduced){const speed=Math.hypot(p.vel.x,p.vel.z),stride=p.grounded?Math.min(1,speed/6):0,cycle=simTime*.014,breath=reduced?0:Math.sin(simTime*.0025)*.012;tunic.scale.y=1+breath;
  for(let i=0;i<2;i++){legs[i].rotation.x=p.grounded?Math.sin(cycle+i*Math.PI)*.5*stride:-.28;arms[i].rotation.x=p.grounded?Math.sin(cycle+i*Math.PI+Math.PI)*.32*stride:-.48;}
  if(p.dashActive){tunic.rotation.x=.18;arms[0].rotation.x=-.62;arms[1].rotation.x=.48;}else tunic.rotation.x=0;
  tail.rotation.z=-.25+(reduced?0:Math.sin(simTime*.006)*.17)+Math.min(speed/14,.34);satchel.rotation.z=reduced?0:Math.sin(cycle)*.04*stride;hat.rotation.z=reduced?0:Math.sin(simTime*.0018)*.018;handLamp.rotation.z=reduced?0:Math.sin(cycle)*.12*stride;
  if(p.respawning&&!reduced)group.visible=Math.floor(simTime/180)%2===0;else group.visible=true;
 },dispose(){const geometries=new Set();group.traverse(o=>{if(o.geometry)geometries.add(o.geometry);});for(const g of geometries)g.dispose();for(const m of palette)m.dispose();}};
}
