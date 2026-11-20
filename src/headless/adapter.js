import { createGame, step } from '../core/game.js';
import { config } from '../config/game.js';
import { levelName } from '../data/night-1.js';
export function validate(input){
 const keys=(o,allowed)=>o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).every(k=>allowed.includes(k));
 if(!keys(input,['version','actions'])||input.version!=='internal-draft-1'||!Array.isArray(input.actions)||input.actions.length>10000)throw Error('Expected internal-draft-1 and actions array (max 10000)');
 let total=0;for(const a of input.actions){if(!keys(a,['ticks','moveX','moveZ','jump','interact','glow','restart'])||!Number.isInteger(a.ticks)||a.ticks<1||(total+=a.ticks)>360000)throw Error('Invalid action or tick budget');for(const k of ['moveX','moveZ'])if(a[k]!==undefined&&(!Number.isFinite(a[k])||Math.abs(a[k])>1))throw Error('Invalid movement');for(const k of ['jump','interact','glow','restart'])if(a[k]!==undefined&&typeof a[k]!=='boolean')throw Error('Invalid button');}return input;
}
export function runScenario(input){validate(input);const state=createGame();for(const a of input.actions)for(let i=0;i<a.ticks;i++)step(state,{...a,jump:i===0&&a.jump,interact:i===0&&a.interact,glow:i===0&&a.glow,restart:i===0&&a.restart});return {version:'internal-draft-1',state};}
export function validateOutput(output){
 const s=output?.state,p=s?.player;
 const record=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);
 const uint=n=>Number.isSafeInteger(n)&&n>=0;
 const numbers=(o,keys)=>record(o)&&keys.every(k=>Object.hasOwn(o,k)&&Number.isFinite(o[k]));
 const entities=(list,count,check)=>Array.isArray(list)&&list.length===count&&Array.from(list).every((e,i)=>record(e)&&e.id===i&&numbers(e,['x','z'])&&check(e));
 if(!record(output)||output.version!=='internal-draft-1'||!record(s)||s.level!==levelName||typeof s.message!=='string'||!['playing','won','lost'].includes(s.status)||!['tick','score','damageAt','glowAt','glowUntil'].every(k=>uint(s[k]))||!numbers(p,['x','y','z','vy','health','light'])||!uint(p.health)||p.health>config.maxHealth||!uint(p.light)||p.y<0||!entities(s.lanterns,config.lanternCount,e=>typeof e.lit==='boolean')||!entities(s.enemies,config.enemyCount,e=>uint(e.fleeUntil))||!entities(s.fireflies,config.fireflyCount,e=>typeof e.available==='boolean'&&uint(e.respawnAt)))throw Error('Invalid internal output');
 return output;
}
