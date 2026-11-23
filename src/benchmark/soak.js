import { createGame, step, restartNight } from '../core/game.js';
import { nightDurationTicks } from '../config/game.js';
import { makeSeededRandom, soakDirections } from './metrics.js';

export function nextSoakInput(rng,tick,direction) {
  if (tick % 30 === 1 || !direction.value) direction.value=soakDirections[Math.floor(rng()*soakDirections.length)];
  return {moveX:direction.value[0],moveZ:direction.value[1],jump:rng()<.05,dash:rng()<.03,pulse:rng()<.02,interact:rng()<.10};
}
export function soakAccepted(output) { return output.crashes===0&&output.results.length===output.nights&&Number.isFinite(output.mem_start_mb)&&Number.isFinite(output.mem_end_mb)&&output.mem_end_mb<=1.2*output.mem_start_mb; }
export async function runSoak({seed=7,nights=10,rss=()=>process.memoryUsage().rss/1024/1024,onNight=()=>{},onStage=null}={}) {
  if(!Number.isSafeInteger(seed)||seed<0||!Number.isSafeInteger(nights)||nights<1)throw new RangeError('invalid soak options');
  const start=process.hrtime.bigint(),results=[],trace=[];let memStart=null,memEnd=null,crashes=0;
  for(let i=0;i<nights;i++){
    const night=i%3+1,nightSeed=seed+i;let game=createGame({night,seed:nightSeed});game.cachePeriodicSnapshots=false;
    if(i===0)memStart=rss();
    onStage?.('initialized',i,game);
    const direction={value:null},rng=makeSeededRandom((nightSeed^0x9e3779b9)>>>0);let failure=null;
    try { for(let tick=1;tick<=nightDurationTicks(night)&&game.status==='playing';tick++){step(game,nextSoakInput(rng,tick,direction));} if(game.status!=='won'&&game.status!=='lost')throw new Error('night exceeded standard duration without outcome');results.push(game.status); }
    catch(e){crashes++;failure=String(e?.stack??e);}
    onStage?.('finished',i,game);
    trace.push({index:i,night,seed:nightSeed,ticks:game.sim_tick,result:results.at(-1)??null,error:failure,pid:process.pid,rss_after_night_mb:rss()});
    onNight(trace.at(-1));
    if(i===nights-1)restartNight(game);
    // The soak report keeps only its compact result/trace; release per-Night event snapshots before the next reset.
    game.eventLog.length=0;game.events.length=0;game.lastSnapshot=null;
    if(i===nights-1)onStage?.('reset',i,game);
    if(i===nights-1)memEnd=rss();
    game=null;
    if(i<nights-1)await new Promise(resolve=>setImmediate(resolve));
  }
  return {output:{nights,crashes,results,mem_start_mb:memStart,mem_end_mb:memEnd,duration_s:Number(process.hrtime.bigint()-start)/1e9},trace};
}
