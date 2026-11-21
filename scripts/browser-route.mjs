// Acceptance driver: chooses keyboard actions from read-only snapshots and canonical maps.
// This module never changes game state, tuning, inventory or timers.
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z), angle=p=>Math.atan2(p.z,p.x);
function arc(points,from,to,r,y){let a=angle(from),b=angle(to),d=Math.atan2(Math.sin(b-a),Math.cos(b-a));const count=Math.ceil(Math.abs(d)/.17);for(let i=1;i<=count;i++){const q=a+d*i/count;points.push({x:r*Math.cos(q),z:r*Math.sin(q),y});}}
function route(n,p,t){const out=[];
 if(n===2){const a=p.x<35,b=t.x<35;if(a!==b)out.push(...(a?[{x:24,z:0,y:0},{x:46,z:0,y:0}]:[{x:46,z:0,y:0},{x:24,z:0,y:0}]));}
 if(n===3){let layer=p.y>5?6:p.y>2.8?3:0,goal=t.y;
  if(layer===6&&goal<6){const a=angle(p),start={x:5*Math.cos(a),z:5*Math.sin(a),y:6};out.push(start);arc(out,start,{x:0,z:-5},5,6);out.push({x:0,z:-10,y:0},{x:0,z:-34,y:0});layer=0;p={x:0,z:-34,y:0};}
  if(layer===3&&goal===0){const a=angle(p);out.push({x:28*Math.cos(a),z:28*Math.sin(a),y:0});layer=0;p=out.at(-1);}
  if(layer===0){const a=angle(p),start={x:34*Math.cos(a),z:34*Math.sin(a),y:0};out.push(start);
   if(goal>0){const ramp=t.x<0?Math.PI*5/6:Math.PI/6,end={x:34*Math.cos(ramp),z:34*Math.sin(ramp),y:0};arc(out,start,end,34,0);out.push({x:30*Math.cos(ramp),z:30*Math.sin(ramp),y:0},...Array.from({length:17},(_,i)=>{const r=30-i*.5;return{x:r*Math.cos(ramp),z:r*Math.sin(ramp),y:Math.min(3,(30-r)*.5)};}));p=out.at(-1);layer=3;}
   else arc(out,start,t,34,0);
  }
  if(layer===3){const a=angle(p),start={x:18*Math.cos(a),z:18*Math.sin(a),y:3};out.push(start);const end=goal===6?{x:0,z:18,y:3}:t;arc(out,start,end,18,3);if(goal===6){out.push({x:0,z:13,y:3},{x:0,z:6,y:6});p={x:0,z:6,y:6};layer=6;}}
  if(layer===6&&goal===6){const a=angle(p),start={x:5*Math.cos(a),z:5*Math.sin(a),y:6};out.push(start);arc(out,start,t,5,6);}
 }
 out.push(t);return out;
}
export function createRouteDriver(onAim=()=>{}){let target=null,points=[],lastNight=0,lastTick=-1,stuck=0,lastPos=null;return s=>{
 const p=s.player,n=s.night;if(n!==lastNight||s.sim_tick<lastTick){target=null;points=[];lastNight=n;}lastTick=s.sim_tick;
 const live=s.shades.filter(e=>!['stunned','spawning','recoil'].includes(e.state));if(target?.kind==='mote'&&live.some(e=>dist(e.pos,target)<5&&Math.abs(e.pos.y-target.y)<1.6)&&dist(p,target)>2){target=null;points=[];}const lamps=s.lanterns.filter(l=>!l.lit),nearest=lamps.slice().sort((a,b)=>dist(p,a.pos)-dist(p,b.pos))[0];
 if(!nearest)return{};
 if(target?.kind==='mote'&&(p.light===10||!s.motes.some(m=>m.id===target.id))||target?.kind==='lamp'&&(p.light===0||s.lanterns.find(l=>l.id===target.id)?.lit)){target=null;points=[];}
 const nearby=lamps.find(l=>dist(p,l.pos)<=1.8&&Math.abs(p.y-l.pos.y)<1.2);
 if(nearby&&p.light){target=null;points=[];return{interact:true};}
 if(!target){let destination;if(p.light>=Math.min(10,10-nearest.progress)){destination={...nearest.pos,id:nearest.id,kind:'lamp'};}
  else {const candidates=s.motes.slice().sort((a,b)=>{const cost=m=>dist(p,m.pos)+Math.max(0,7-Math.min(...live.filter(e=>Math.abs(e.pos.y-m.pos.y)<1.6).map(e=>dist(e.pos,m.pos))))*10+(n===2&&((m.pos.x<35)!==(p.x<35))?35:0)+(n===3?Math.abs(m.pos.y-p.y)*8:0);return cost(a)-cost(b);});if(candidates.length)destination={...candidates[0].pos,id:candidates[0].id,kind:'mote'};else destination={...nearest.pos,id:nearest.id,kind:'lamp'};}
  target=destination;points=route(n,p,target);
 }
 while(points.length>1&&dist(p,points[0])<(n===3&&points[0].y>0&&points[0].y<3?.18:.45)&&(Math.abs(p.y-points[0].y)<.7||points[0].y<p.y))points.shift();
 if(n===3&&points[0]?.z===13&&points[0]?.y===3&&s.wind.active){return{moveX:Math.abs(p.x)>.3?-Math.sign(p.x):0,moveZ:p.z<16?1:p.z>16.5?-1:0};}const q=points[0]??target;onAim({target,points});const dx=q.x-p.x,dz=q.z-p.z,d=Math.hypot(dx,dz);
 if(d<.4&&Math.abs(p.y-q.y)<1){if(points.length>1)points.shift();else {target=null;points=[];}return{};}
 if(!p.grounded&&n>1&&Math.hypot(p.vel.x,p.vel.z)>7.5&&Math.abs(p.vel.y)>1.5)return{}; // respect pad flight
 const threats=s.shades.filter(e=>!['stunned','spawning','recoil'].includes(e.state)&&Math.abs(e.pos.y-p.y)<1.6),danger=Math.min(...threats.map(e=>dist(p,e.pos)));
 let mx=Math.abs(dx)>.3?Math.sign(dx):0,mz=Math.abs(dz)>.3?Math.sign(dz):0;
 if(danger<4&&(n!==3||p.y<.1)){let best=-Infinity;for(let i=0;i<8;i++){const x=Math.round(Math.cos(i*Math.PI/4)),z=Math.round(Math.sin(i*Math.PI/4)),l=Math.hypot(x,z),nx=p.x+x/l*2,nz=p.z+z/l*2;const cx=n===2?(p.x<35?0:70):0;if(Math.hypot(nx-cx,nz)>(n===1?38:n===3?43:26)&&!(n===2&&Math.abs(nz)<1.2&&nx>24&&nx<46))continue;const clearance=Math.min(...threats.map(e=>Math.hypot(nx-e.pos.x,nz-e.pos.z)));const score=clearance*1.3- Math.hypot(q.x-nx,q.z-nz);if(score>best){best=score;mx=x;mz=z;}}}
 const straight=(n!==3||p.y<.1&&Math.hypot(p.x,p.z)>30)&&d>4&&!(n===2&&p.x>24&&p.x<46&&Math.abs(p.z)>.6);
 return{moveX:mx,moveZ:mz,dash:straight&&p.dash_cd_s===0,jump:danger<5&&s.sim_tick%42<6,pulse:danger<(n===3?4:1.8)&&p.light>=3&&p.pulse_cd_s===0};
 };}
