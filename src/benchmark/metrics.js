export function computeBenchmarkMetrics(deltas) {
  if (!Array.isArray(deltas) || !deltas.length || deltas.some(x => !Number.isFinite(x) || x <= 0)) throw new RangeError('frame deltas must be a non-empty array of positive finite milliseconds');
  const sorted=[...deltas].sort((a,b)=>a-b),n=deltas.length,k=Math.max(1,Math.ceil(.01*n));
  const slow=sorted.slice(n-k),rank=Math.ceil(.95*n)-1;
  return {avg_fps:1000*n/deltas.reduce((a,b)=>a+b,0),p1_low_fps:1000/(slow.reduce((a,b)=>a+b,0)/k),frame_ms_p95:sorted[rank],frames:n};
}
export function sampleFrameInterval(previous,now,start,end) { const lo=Math.max(previous,start),hi=Math.min(now,end);return hi>lo?hi-lo:null; }
export function validateBenchmarkResult(x) {
  return !!x&&x.contract_version==='1.3'&&['avg_fps','p1_low_fps','frame_ms_p95','load_ms'].every(k=>Number.isFinite(x[k])&&x[k]>=0)&&Number.isSafeInteger(x.frames)&&x.frames>0&&(x.peak_mem_mb===null||Number.isFinite(x.peak_mem_mb)&&x.peak_mem_mb>=0)&&typeof x.vsync_off==='boolean'&&typeof x.renderer==='string'&&!!x.renderer&&typeof x.os==='string'&&!!x.os;
}
export function benchmarkCameraPose(elapsedMs) {
  const a=2*Math.PI*((elapsedMs%15000+15000)%15000)/15000;
  const clean=n=>Math.abs(n)<1e-12?0:n;
  return {x:clean(30*Math.cos(a)),y:15,z:clean(-30*Math.sin(a)),target:{x:0,y:0,z:0}};
}
export function makeSeededRandom(seed) { let x=(seed>>>0)||1;return()=>((x=Math.imul(x,1664525)+1013904223>>>0)/4294967296); }
export const soakDirections=Object.freeze([[0,1],[Math.SQRT1_2,Math.SQRT1_2],[1,0],[Math.SQRT1_2,-Math.SQRT1_2],[0,-1],[-Math.SQRT1_2,-Math.SQRT1_2],[-1,0],[-Math.SQRT1_2,Math.SQRT1_2]]);
export function soakActionAt(seed,tick) { const r=makeSeededRandom((seed+tick)>>>0);const [moveX,moveZ]=soakDirections[Math.floor(makeSeededRandom(seed)()*8)];return {moveX,moveZ,jump:r()<.05,dash:r()<.03,pulse:r()<.02,interact:r()<.10}; }
