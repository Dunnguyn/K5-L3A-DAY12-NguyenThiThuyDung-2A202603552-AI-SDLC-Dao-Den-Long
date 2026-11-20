import { config } from '../config/game.js';
export const levelName = 'Đêm 1 – Đảo Bến';
export function layout(c=config) {
  const lanterns = Array.from({length:c.lanternCount},(_,id)=>({id,x:18*Math.cos(id*Math.PI*2/5),z:18*Math.sin(id*Math.PI*2/5),lit:false}));
  const fireflies = Array.from({length:c.fireflyCount},(_,id)=>{const l=lanterns[Math.floor(id/8)%5],a=id%8*Math.PI/4;return {id,x:l.x+3*Math.cos(a),z:l.z+3*Math.sin(a),available:true,respawnAt:0};});
  const enemies = Array.from({length:c.enemyCount},(_,id)=>({id,x:25*Math.cos(id*Math.PI/2+.6),z:25*Math.sin(id*Math.PI/2+.6),fleeUntil:0}));
  return {lanterns,fireflies,enemies};
}
