import { config } from '../config/game.js';
import { layout, levelName } from '../data/night-1.js';
export function createGame(){return {level:levelName,status:'playing',tick:0,score:0,player:{x:0,y:0,z:0,vy:0,health:config.maxHealth,light:config.initialLight},damageAt:0,glowAt:0,glowUntil:0,message:'Thu đom đóm và mang ánh sáng về đèn.',...layout()};}
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
function clamp(p){const r=Math.hypot(p.x,p.z),max=config.islandRadius-config.boundaryMargin;if(r>max){p.x*=max/r;p.z*=max/r;}}
function travel(e,target,speed,away=false){let dx=target.x-e.x,dz=target.z-e.z,d=Math.hypot(dx,dz);if(d<1e-9){dx=Math.cos(e.id+1);dz=Math.sin(e.id+1);d=1;}const k=(away?-1:1)*Math.min(speed/config.tickRate,d)/d;e.x+=dx*k;e.z+=dz*k;clamp(e);}
export function step(s,a={}){
 if(s.status!=='playing'){if(a.restart)Object.assign(s,createGame());return s;}
 const c=config,p=s.player;s.tick++;const seconds=n=>Math.round(n*c.tickRate);
 let dx=a.moveX??0,dz=a.moveZ??0,n=Math.max(1,Math.hypot(dx,dz));p.x+=dx/n*c.playerSpeed/c.tickRate;p.z+=dz/n*c.playerSpeed/c.tickRate;clamp(p);
 if(a.jump&&p.y===0)p.vy=c.jumpSpeed;
 p.vy-=c.gravity/c.tickRate;p.y=Math.max(0,p.y+p.vy/c.tickRate);if(!p.y)p.vy=0;
 for(const f of s.fireflies){if(!f.available&&s.tick>=f.respawnAt)f.available=true;if(f.available&&distance(p,f)<=c.pickupRadius&&p.y<=c.pickupMaxHeight){f.available=false;f.respawnAt=s.tick+seconds(c.fireflyRespawnSeconds);p.light+=c.fireflyLightValue;s.score+=c.fireflyScore;s.message='Đã nhặt một đốm sáng!';}}
 if(a.glow){if(p.light>=c.glowLightCost&&s.tick>=s.glowAt){p.light-=c.glowLightCost;s.glowAt=s.tick+seconds(c.glowCooldownSeconds);s.glowUntil=s.tick+seconds(c.glowFeedbackSeconds);s.message='Ánh sáng xua tan Bóng Mực!';for(const e of s.enemies)if(distance(e,p)<=c.glowRadius)e.fleeUntil=s.tick+seconds(c.fleeSeconds);}else s.message='Chưa đủ ánh sáng hoặc tỏa sáng đang hồi.';}
 const safe=s.lanterns.filter(l=>l.lit),protectedPlayer=safe.some(l=>distance(l,p)<=c.lanternSafeRadius);
 for(const e of s.enemies){const lamp=safe.find(l=>distance(l,e)<=c.lanternSafeRadius);travel(e,lamp??p,lamp||s.tick<e.fleeUntil?c.fleeSpeed:c.enemySpeed,!!lamp||s.tick<e.fleeUntil);
 if(!protectedPlayer&&distance(e,p)<=c.contactRadius&&p.y<=c.contactMaxHeight&&s.tick>=s.damageAt){p.health=Math.max(0,p.health-c.enemyContactDamage);s.damageAt=s.tick+seconds(c.damageCooldownSeconds);s.message='Bóng Mực chạm vào Mây!';}}
 if(p.health===0){s.status='lost';return s;}
 if(a.interact){const l=s.lanterns.filter(l=>!l.lit&&distance(l,p)<=c.interactionRadius).sort((a,b)=>distance(a,p)-distance(b,p)||a.id-b.id)[0];if(l&&p.light>=c.lanternLightCost&&p.y===0){p.light-=c.lanternLightCost;l.lit=true;s.score+=c.lanternScore;s.message='Một ngọn đèn đã bừng sáng!';}else s.message='Đến gần đèn chưa sáng, cần 5 ánh sáng và đứng trên đất.';}
 if(s.lanterns.every(l=>l.lit)){s.status='won';s.score+=c.victoryBonus;}
 return s;
}
