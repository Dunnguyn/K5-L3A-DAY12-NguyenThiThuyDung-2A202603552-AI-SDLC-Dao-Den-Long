// Headless acceptance pilot. Observes state; sends only normal movement/E/dash actions.
import {route} from './browser-route.mjs';
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export function fuelPilot(n){
 const keep={1:['L1','L2','L3'],2:['L1','L2','L3','L4'],3:['L2','L4','L5','L6','L7']}[n];
 let target=null,points=[];
 return s=>{
  // This fixture tests dawn evaluation: late relights are legal; no continuous-ratio rule exists.
  if(s.time_s>70)return {};
  const p=s.player,lamps=s.lanterns.filter(l=>keep.includes(l.id));
  const horizon=Math.min(70,s.time_s+5);
  const needy=lamps.filter(l=>!l.lit||l.fuel<horizon).sort((a,b)=>(a.lit?a.fuel:0)-(b.lit?b.fuel:0)||dist(p,a.pos)-dist(p,b.pos));
  if(!needy.length){target=null;points=[];return {};}
  if(target){
   if(target.kind==='mote'&&!s.motes.some(m=>m.id===target.id)||
    target.kind==='lamp'&&(p.light===0||!needy.some(l=>l.id===target.id))){
    target=null;points=[];
   }
  }
  if(!target){
   const l=needy[0],need=l.lit?Math.ceil((100-l.fuel)/10):(l.ever_lit?5:10)-l.progress;
   if(p.light>=need)target={...l.pos,id:l.id,kind:'lamp'};
   else{
    const cost=m=>dist(p,m.pos)+Math.abs(p.y-m.pos.y)*12+(n===2&&((m.pos.x<35)!==(p.x<35))?45:0);
    // Do not climb an unrelated upper tier for one mote while ground spawns replenish.
    const candidates=n===3?s.motes.filter(m=>m.pos.y===0||(p.y>2.8&&p.y<5&&m.pos.y===3)):s.motes;
    const m=candidates.slice().sort((a,b)=>cost(a)-cost(b))[0];
    target=m?{...m.pos,id:m.id,kind:'mote'}:n===3?{x:34,y:0,z:0,id:'wait-ground-spawn',kind:'mote'}:{...l.pos,id:l.id,kind:'lamp'};
   }
   points=route(n,p,target);
  }
  if(target.kind==='lamp'&&dist(p,target)<=1.7&&Math.abs(p.y-target.y)<.8){
   target=null;points=[];return {interact:true};
  }
  while(points.length>1&&dist(p,points[0])<(n===3&&points[0].y>0&&points[0].y<3?.18:.4)&&(Math.abs(p.y-points[0].y)<.7||points[0].y<p.y))points.shift();
  const q=points[0]??target,dx=q.x-p.x,dz=q.z-p.z,d=Math.hypot(dx,dz);
  if(d<.35&&Math.abs(p.y-q.y)<.8){if(points.length>1)points.shift();else{target=null;points=[];}return {};}
  if(!p.grounded&&n>1&&Math.hypot(p.vel.x,p.vel.z)>7.5&&Math.abs(p.vel.y)>1.5)return {};
  const safeDash=(n!==3||p.y<.1&&Math.hypot(p.x,p.z)>30)&&d>5&&!(n===2&&p.x>24&&p.x<46);
  // Keyboard directions permit lossless action RLE within the existing 10,000-action limit.
  return {moveX:Math.abs(dx)>.08?Math.sign(dx):0,moveZ:Math.abs(dz)>.08?Math.sign(dz):0,dash:safeDash&&p.dash_cd_s===0};
 };
}
