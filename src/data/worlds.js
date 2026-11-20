import { tuning } from '../config/game.js';
const polar=(r,deg,cx=0,cz=0,y=0)=>({x:cx+r*Math.cos(deg*Math.PI/180),y,z:cz+r*Math.sin(deg*Math.PI/180)});
const polarSet=(r,angles,cx=0,cz=0,y=0)=>angles.map(a=>polar(r,a,cx,cz,y));
const rings=(center,outerAngles,innerAngles,outerR,innerR)=>[...polarSet(innerR,innerAngles,center[0],center[1]),...polarSet(outerR,outerAngles,center[0],center[1])];
const lamps=arr=>arr.map(([x,y,z],i)=>({id:`L${i+1}`,x,y,z,progress:0,lit:false}));
const N1={night:1,name:'Đêm 1 – Đảo Bến',spawn:{x:0,y:0,z:0},surfaces:[{type:'disk',id:'island',x:0,z:0,y:0,r:40}],lamps:lamps([[0,0,25],[23.8,0,7.7],[14.7,0,-20.2],[-14.7,0,-20.2],[-23.8,0,7.7]]),motePoints:[...polarSet(12,Array.from({length:8},(_,i)=>i*45)),...polarSet(33,Array.from({length:16},(_,i)=>i*22.5))],shadePoints:polarSet(37,Array.from({length:12},(_,i)=>15+i*30)),pads:[],charms:[],bridge:null,ramps:[],tower:null};
const centers=[[0,0],[70,0]],n2Motes=centers.flatMap(([x,z])=>rings([x,z],Array.from({length:8},(_,i)=>i*45),[0,90,180,270],22,10));
const n2Shades=centers.flatMap(([x,z])=>polarSet(26,Array.from({length:8},(_,i)=>22.5+i*45),x,z));
const N2={night:2,name:'Đêm 2 – Đảo Cau',spawn:{x:0,y:0,z:0},surfaces:[{type:'disk',id:'island-A',x:0,z:0,y:0,r:28},{type:'disk',id:'island-B',x:70,z:0,y:0,r:28},{type:'rect',id:'bamboo-bridge',x1:26,x2:44,z1:-2,z2:2,y:0}],lamps:lamps([[0,0,20],[17,0,-10],[-17,0,-10],[70,0,20],[87,0,-10],[53,0,-10]]),motePoints:n2Motes,shadePoints:n2Shades,pads:[{x:20,y:0,z:18,r:1,vy:14,speed:24,target:{x:70,z:0}},{x:50,y:0,z:-18,r:1,vy:14,speed:24,target:{x:0,z:0}}],charms:[{id:'C1',x:35,y:0,z:0}],bridge:{x1:26,x2:44,z1:-2,z2:2,y:0},ramps:[],tower:null};
const n3Motes=[...polarSet(34,Array.from({length:18},(_,i)=>i*20)),...polarSet(18,Array.from({length:8},(_,i)=>20+i*20),0,0,3),...polarSet(5,[45,135,225,315],0,0,6)];
const N3={night:3,name:'Đêm 3 – Đảo Chuông',spawn:{x:0,y:0,z:-30},surfaces:[{type:'disk',id:'base',x:0,z:0,y:0,r:45},{type:'annulus',id:'tier-1',x:0,z:0,y:3,rmin:12,r:24,zPositive:true},{type:'disk',id:'tier-2',x:0,z:0,y:6,r:8}],lamps:lamps([[0,6,6],[18,3,10],[-18,3,10],[35,0,-10],[-35,0,-10],[20,0,-35],[-20,0,-35]]),motePoints:n3Motes,shadePoints:polarSet(43,Array.from({length:16},(_,i)=>i*22.5)),pads:[{x:0,y:3,z:13,r:1,vy:12,speed:8,target:{x:0,z:-1}}],charms:[{id:'C1',x:30,y:0,z:25},{id:'C2',x:-30,y:0,z:25}],bridge:null,ramps:[30,150].map(deg=>({angle:deg*Math.PI/180,width:3,r0:30,r1:24,y0:0,y1:3})),tower:{x:0,z:0,y:6,r:2,height:8}};
export const worlds=Object.freeze({1:N1,2:N2,3:N3});
export function getWorld(n=1){return structuredClone(worlds[n]??worlds[1]);}
export const levelName=N1.name;
export function layout(){const w=getWorld(1);return {lanterns:w.lamps,fireflies:w.motePoints.map((p,id)=>({id,...p,available:true,respawnAt:0})),enemies:[]};}
function insideDisk(x,z,s){return Math.hypot(x-s.x,z-s.z)<=s.r+1e-8;}
export function terrainHeight(n,x,z,previousY=0){const w=worlds[n];if(!w)return null;let heights=[];for(const s of w.surfaces){if(s.type==='disk'&&insideDisk(x,z,s))heights.push(s.y);if(s.type==='annulus'){const r=Math.hypot(x-s.x,z-s.z);if(r>=s.rmin-1e-8&&r<=s.r+1e-8&&(!s.zPositive||z>0))heights.push(s.y);}if(s.type==='rect'&&x>=s.x1&&x<=s.x2&&z>=s.z1&&z<=s.z2)heights.push(s.y);}
 if(n===3){for(const ramp of w.ramps){const a=ramp.angle,ux=Math.cos(a),uz=Math.sin(a),along=x*ux+z*uz,cross=Math.abs(-x*uz+z*ux);if(along>=ramp.r1&&along<=ramp.r0&&cross<=ramp.width/2){const t=(ramp.r0-along)/(ramp.r0-ramp.r1);heights.push(ramp.y0+t*(ramp.y1-ramp.y0));}}}
 if(!heights.length)return null;const support=heights.filter(y=>y<=previousY+0.15);return support.length?Math.max(...support):Math.min(...heights);}
export function isSolid(n,x,y,z){if(n===3){const t=worlds[3].tower,r=Math.hypot(x,z);if(r<t.r&&y>=t.y&&y<=t.y+t.height)return true;const onRamp=worlds[3].ramps.some(q=>{const ux=Math.cos(q.angle),uz=Math.sin(q.angle),along=x*ux+z*uz,cross=Math.abs(-x*uz+z*ux);return along>=q.r1-1e-8&&along<=q.r0+1e-8&&cross<=q.width/2;});if(z>0&&y<3&&(Math.abs(r-12)<.22||(Math.abs(r-24)<.22&&!onRamp)))return true;if(y<6&&Math.abs(r-8)<.22)return true;}return false;}
export function validPoint(n,p){return terrainHeight(n,p.x,p.z,p.y)!==null;}
export function getAmbientProgress(lit,total){return .15+.55*(total?lit/total:0);}
