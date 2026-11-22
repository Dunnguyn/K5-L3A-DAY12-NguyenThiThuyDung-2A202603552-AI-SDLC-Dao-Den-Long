import {terrainHeight,isSolid} from '../src/data/worlds.js';
function walkable(a,b,n){
 if(Math.abs(a.y-b.y)>.01)return false;
 const steps=Math.ceil(Math.hypot(a.x-b.x,a.z-b.z)/.3);
 for(let i=0;i<=steps;i++){const q=i/Math.max(1,steps),x=a.x+(b.x-a.x)*q,z=a.z+(b.z-a.z)*q,h=terrainHeight(n,x,z,a.y);if(h===null||Math.abs(h-a.y)>.05||isSolid(n,x,a.y,z))return false;
  const length=Math.hypot(b.x-a.x,b.z-a.z)||1,nx=-(b.z-a.z)/length*.45,nz=(b.x-a.x)/length*.45;
  if(isSolid(n,x+nx,a.y,z+nz)||isSolid(n,x-nx,a.y,z-nz))return false;}
 return true;
}
function prune(points,n,p){
 const out=[];let from=p,i=0;
 while(i<points.length){let best=i;for(let j=i;j<points.length;j++){if(points[j].launch)break;if(walkable(from,points[j],n))best=j;else if(j>i&&Math.abs(points[j].y-from.y)>.05)break;}
  out.push(points[best]);from=points[best];i=best+1;
 }
 return out;
}
import {route as baseRoute} from './browser-route.mjs';
function route(n,p,t){
 if(n===3&&p.y>=5.8&&t.y===3){
  const side=t.x<0?-4.5:4.5,edge={x:side,y:6,z:5.8},landing={x:side,y:3,z:16};
  return [...baseRoute(n,p,edge),{...edge,launch:true},landing,...baseRoute(n,landing,t)];
 }
 return n===3?prune(baseRoute(n,p,t),n,p):baseRoute(n,p,t);
}

const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
function baseDriver(onAim=()=>{},idsOverride=null,earlyOnly=false){
 let target=null,points=[],night=0,lastTick=-1,lastPos=null,still=0;
 return s=>{
  if(night!==s.night||s.sim_tick<lastTick){target=null;points=[];night=s.night;}lastTick=s.sim_tick;
  const p=s.player,n=s.night;
  if(lastPos&&dist(p,lastPos)<.005&&p.grounded)still++;else still=0;lastPos={x:p.x,z:p.z};
  if(still>=5&&target&&dist(p,target)>1){points=route(n,p,target);still=0;}
  const ids=idsOverride??{1:['L1','L2','L3'],2:['L1','L2','L3','L4'],3:['L1','L2','L3','L4','L5','L6','L7']}[n],lamps=s.lanterns.filter(l=>ids.includes(l.id));
  const prepared=lamps.every(l=>l.ever_lit),final=!earlyOnly&&s.time_s<=(n===3?Number(process.env.P3_FINAL_LEAD??99):70);
  const live=s.shades.filter(e=>!['stunned','spawning','recoil'].includes(e.state)&&Math.abs(e.pos.y-p.y)<1.6);
  const danger=Math.min(...live.map(e=>dist(e.pos,p)));
  function orbit(){
   target=null;points=[];
   const cx=n===2?(p.x<35?0:70):0,r=n===1?33:n===2?22:34,a=Math.atan2(p.z,p.x-cx)+.22;
   const dx=cx+r*Math.cos(a)-p.x,dz=r*Math.sin(a)-p.z;
   onAim({stage:'orbit',target:{x:cx+r*Math.cos(a),z:r*Math.sin(a),y:0}});
   return {moveX:Math.abs(dx)>.2?Math.sign(dx):0,moveZ:Math.abs(dz)>.2?Math.sign(dz):0,dash:p.dash_cd_s===0,jump:danger<5&&s.sim_tick%42<6,pulse:danger<2&&p.light>=3&&p.pulse_cd_s===0};
  }
  if(prepared&&!final)return orbit();
  const enough=n===3&&final&&lamps.filter(l=>l.lit).length>=5;
  const goals=(enough?[]:lamps.filter(l=>final?!l.lit:!l.ever_lit)).sort((a,b)=>dist(p,a.pos)-dist(p,b.pos)+Math.abs(p.y-a.pos.y)*5-Math.abs(p.y-b.pos.y)*5);
  if(!goals.length){
   const haven=lamps.filter(l=>l.lit&&l.fuel>=Math.max(30,s.time_s+1)).sort((a,b)=>dist(p,a.pos)-dist(p,b.pos))[0];
   if(!haven)return orbit();
   if(dist(p,haven.pos)<1.7&&Math.abs(p.y-haven.pos.y)<1)return {};
   if(target?.id!==haven.id){target={...haven.pos,id:haven.id,kind:'haven'};points=route(n,p,target);}
  }
  if(target?.kind==='mote'&&live.some(e=>Math.abs(e.pos.y-target.y)<1.6&&dist(e.pos,target)<5)&&dist(p,target)>2){target=null;points=[];}
  if(target?.kind==='mote'&&!s.motes.some(m=>m.id===target.id)||target?.kind==='lamp'&&(!goals.some(l=>l.id===target.id)||p.light===0)){target=null;points=[];}
  const close=goals.filter(l=>Math.hypot(p.x-l.pos.x,p.y-l.pos.y,p.z-l.pos.z)<=1.8).sort((a,b)=>dist(p,a.pos)-dist(p,b.pos)||a.id.localeCompare(b.id))[0];
  if(close&&p.light){target=null;points=[];return{interact:true};}
  if(!target){
   const l=goals[0];if(!l)return orbit();
   const needed=(l.ever_lit?5:10)-l.progress;
   if(p.light>=needed)target={...l.pos,id:l.id,kind:'lamp'};
   else{
    const cost=m=>dist(p,m.pos)+Math.max(0,7-Math.min(...live.filter(e=>Math.abs(e.pos.y-m.pos.y)<1.6).map(e=>dist(e.pos,m.pos))))*9+(n===2&&((m.pos.x<35)!==(p.x<35))?35:0)+Math.abs(p.y-m.pos.y)*8;
    const needUpper=goals.some(l=>l.pos.y>0&&!l.lit);
    const upper=n===3&&p.y>=2.8&&needUpper?s.motes.filter(m=>p.y<5?m.pos.y===3:m.pos.y>=3):[];
    const candidates=(n===3&&p.y>=2.8&&needUpper?upper:n===3&&final?s.motes.filter(m=>m.pos.y===0):s.motes).slice().sort((a,b)=>cost(a)-cost(b));
    const m=candidates[0];if(m)target={...m.pos,id:m.id,kind:'mote'};else if(n===3&&p.y>=2.8&&p.y<5)target={x:18*Math.cos(Math.PI/9),y:3,z:18*Math.sin(Math.PI/9),id:'wait-upper',kind:'mote'};else return orbit();
   }
   points=route(n,p,target);
  }
  while(points.length>1&&!points[0].launch&&dist(p,points[0])<(n===3&&points[0].y>0&&points[0].y<3?.18:.45)&&(Math.abs(p.y-points[0].y)<.7||points[0].y<p.y))points.shift();
  const q=points[0]??target;if(q.launch&&dist(p,q)<.5&&p.grounded){points.shift();return{moveZ:1,jump:true,dash:p.dash_cd_s===0};}onAim({stage:final?'dawn':'prepare',target,points});const dx=q.x-p.x,dz=q.z-p.z,d=Math.hypot(dx,dz);
  if(d<.4&&Math.abs(p.y-q.y)<1){if(points.length>1)points.shift();else{target=null;points=[];}return{};}
  if(!p.grounded&&n>1&&Math.hypot(p.vel.x,p.vel.z)>7.5&&Math.abs(p.vel.y)>1.5)return{};
  let mx=Math.abs(dx)>.3?Math.sign(dx):0,mz=Math.abs(dz)>.3?Math.sign(dz):0;
  if(n===3){const sector=Math.round(Math.atan2(dz,dx)/(Math.PI/4));mx=Math.round(Math.cos(sector*Math.PI/4));mz=Math.round(Math.sin(sector*Math.PI/4));}
  if(danger<Number(process.env.P3_AVOID??4)&&(n!==3||p.y<.1)){
   let best=-Infinity;
   for(let i=0;i<8;i++){
    const x=Math.round(Math.cos(i*Math.PI/4)),z=Math.round(Math.sin(i*Math.PI/4)),l=Math.hypot(x,z),nx=p.x+x/l*2,nz=p.z+z/l*2,cx=n===2?(p.x<35?0:70):0;
    if(Math.hypot(nx-cx,nz)>(n===1?38:n===3?43:26)&&!(n===2&&Math.abs(nz)<1.2&&nx>24&&nx<46))continue;
    if(n===3&&!walkable(p,{x:nx,y:p.y,z:nz},n))continue;
    const clearance=Math.min(...live.map(e=>Math.hypot(nx-e.pos.x,nz-e.pos.z))),score=clearance*Number(process.env.P3_CLEARANCE??1.3)-Math.hypot(q.x-nx,q.z-nz);
    if(score>best){best=score;mx=x;mz=z;}
   }
  }
  const straight=(n!==3||p.y<.1&&Math.hypot(p.x,p.z)>30)&&d>4&&!(n===2&&p.x>24&&p.x<46&&Math.abs(p.z)>.6);
  return{moveX:mx,moveZ:mz,dash:straight&&p.dash_cd_s===0,jump:danger<5&&s.sim_tick%42<6,pulse:danger<1.8&&p.light>=3&&p.pulse_cd_s===0};
 };
}

export function createCampaignDriver(onAim=()=>{}){
 const base=baseDriver(onAim),expedition=baseDriver(onAim,['L4','L6'],true);let high=false,last=-1,points=[],target=null,topRefueled=false,expeditionStarted=false,expeditionDone=false;
 function nav(s,t){
  const p=s.player;
  if(!target||target.id!==t.id){target=t;points=route(3,p,t);}
  while(points.length>1&&!points[0].launch&&Math.hypot(p.x-points[0].x,p.z-points[0].z)<(points[0].y>0&&points[0].y<3?.18:.4)&&(Math.abs(p.y-points[0].y)<.7||points[0].y<p.y))points.shift();
  if(points[0]?.z===13&&points[0]?.y===3&&s.wind.active)return{moveX:Math.abs(p.x)>.3?-Math.sign(p.x):0,moveZ:p.z<16?1:p.z>16.5?-1:0};
  const q=points[0]??t,dx=q.x-p.x,dz=q.z-p.z,d=Math.hypot(dx,dz);
  if(q.launch&&dist(p,q)<.5&&p.grounded){points.shift();return{moveZ:1,jump:true,dash:p.dash_cd_s===0};}
  onAim({stage:'upper-supply',target:t,points});
  if(d<.35&&Math.abs(p.y-q.y)<.8){if(points.length>1)points.shift();else{target=null;points=[];}return{};}
  if(!p.grounded&&Math.hypot(p.vel.x,p.vel.z)>7.5&&Math.abs(p.vel.y)>1.5)return{};
  const sector=Math.round(Math.atan2(dz,dx)/(Math.PI/4));return{moveX:Math.round(Math.cos(sector*Math.PI/4)),moveZ:Math.round(Math.sin(sector*Math.PI/4)),dash:p.y<.1&&Math.hypot(p.x,p.z)>30&&d>4&&p.dash_cd_s===0};
 }
 return s=>{
  if(s.sim_tick<last){high=false;points=[];target=null;topRefueled=false;expeditionStarted=false;expeditionDone=false;}last=s.sim_tick;
  if(s.night!==3)return base(s);
  const p=s.player,l=s.lanterns.find(l=>l.id==='L1');
  if(!high){
   if(p.y>=5.9&&p.grounded){high=true;target=null;points=[];}
   else return nav(s,{x:0,y:6,z:6,id:'ascent'});
  }
  if(s.time_s>Number(process.env.P3_FINAL_LEAD??99)){
   if(!l.lit&&p.light>=(l.ever_lit?5:10)){
    if(Math.hypot(p.x-l.pos.x,p.y-l.pos.y,p.z-l.pos.z)<1.8)return{interact:true};
    return nav(s,{...l.pos,id:l.id});
   }
   if(p.light<p.capacity){
    const m=s.motes.filter(m=>m.pos.y===6).sort((a,b)=>dist(p,a.pos)-dist(p,b.pos))[0];
    return nav(s,m?{...m.pos,id:m.id}:{x:Math.SQRT1_2*5,y:6,z:Math.SQRT1_2*5,id:'wait-top-spawn'});
   }
   return nav(s,{...l.pos,id:l.id});
  }
  if(!topRefueled){
   if(Math.hypot(p.x-l.pos.x,p.y-l.pos.y,p.z-l.pos.z)>=1.8)return nav(s,{...l.pos,id:l.id});
   topRefueled=true;target=null;points=[];return{interact:true};
  }
  return base(s);
 };
}
