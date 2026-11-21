import fs from 'node:fs';
import assert from 'node:assert/strict';
function edit(p,pairs){let s=fs.readFileSync(p,'utf8');for(const[a,b]of pairs){assert.ok(s.includes(a),`Missing exact source: ${p}: ${a}`);s=s.replace(a,b);}fs.writeFileSync(p,s);}
edit('src/core/game.js',[
 ['const x0=p.x,z0=p.z;','const x0=p.x,y0=p.y,z0=p.z;'],
 ['if(mag)p.facing={x:ux,z:uz};','if(mag)p.facing={x:mx/mag,z:mz/mag};'],
 ['p.grounded=h!==null&&p.y<=h+.05&&p.vel.y<=0;','p.grounded=h!==null&&p.y>=h-1e-8&&p.y<=h+C.ground_epsilon&&p.vel.y<=0;'],
 ['p.dashDirection=mag?{x:ux,z:uz}:clone(p.facing);','p.dashDirection=clone(p.facing);'],
 [' if(p.dash_ticks){moveHorizontal',' const followsGround=p.grounded;\n if(p.dash_ticks){moveHorizontal'],
 ['if(p.motionVelocity){p.vel.x=p.motionVelocity.x;p.vel.z=p.motionVelocity.z;}','// Controlled velocity excludes dash, pad launch and additive wind.\n const control=p.motionVelocity??{x:0,z:0};p.vel.x=control.x;p.vel.z=control.z;'],
 ['p.vel.z+=clamp(uz*speed-p.vel.z,-d,d);let nx=','p.vel.z+=clamp(uz*speed-p.vel.z,-d,d);p.motionVelocity={x:p.vel.x,z:p.vel.z};let nx='],
 [' p.motionVelocity={x:(p.x-x0)*C.tick_rate,z:(p.z-z0)*C.tick_rate};',' // Snapshot velocity below includes all displacement; never feed it back into control.'],
 [' h=terrainHeight(s.night,p.x,p.z,p.y);if(p.padVelocity&&h!==null&&p.y<=h&&p.vel.y<=0){p.y=h;p.vel.y=0;p.padVelocity=null;p.grounded=true;}else if(!p.padVelocity&&h!==null&&p.y<=h&&p.vel.y<=0){p.y=h;p.vel.y=0;p.grounded=true;}',
  ' // Land only across a support from above; grounded ramp-following is bounded separately.\n h=terrainHeight(s.night,p.x,p.z,y0);const follow=followsGround&&h!==null&&Math.abs(h-y0)<=physics.supportTolerance;\n p.grounded=false;if(h!==null&&p.vel.y<=0&&(y0>=h-1e-8||follow)&&(p.y<=h+1e-8||follow)){p.y=h;p.vel.y=0;p.padVelocity=null;p.grounded=true;}'],
 ["let v=d.flee_dir??{x:1,z:0},m=Math.hypot(v.x,v.z)||1;d.x+=", "let v=d.flee_dir??{x:1,z:0},m=Math.hypot(v.x,v.z);if(!m){v={x:1,z:0};m=1;}d.x+="]
]);
edit('src/data/worlds.js',[["return support.length?Math.max(...support):Math.min(...heights);","return support.length?Math.max(...support):null;"]]);
edit('src/browser/app.js',[
 ["function setScreen(next){screen=next;","function setScreen(next){screen=next;$('#fx').classList.remove('dash','pulse','hurt','wind','warning');pulseUntil=0;damageUntil=0;"],
 ["$('#fx').classList.toggle('wind',!!state.wind?.active);","$('#fx').classList.toggle('dash',screen==='play'&&state.player.dash_ticks>0);$('#fx').classList.toggle('wind',screen==='play'&&!!state.wind?.active);"],
 ["$('#fx').classList.toggle('warning',!!state.wind?.warning_ticks&&!state.wind?.active);","$('#fx').classList.toggle('warning',screen==='play'&&!!state.wind?.warning_ticks&&!state.wind?.active);"],
 ["if(e.type==='dash')$('#fx').classList.add('dash');",'']
]);
edit('src/browser/app.css',[["#fx.dash{","#fx.dash:not(.wind):not(.warning):not(.pulse):not(.hurt){"]]);
edit('src/browser/renderer.js',[["l.lit?M.lamp:l.progress?M.moteHalo:M.unlit","l.lit?M.lamp:M.unlit"]]);
edit('src/headless/adapter.js',[["for(const x of s.events)if(!isObj(x)||typeof x.type!=='string')throw Error('invalid event');return o;","for(const x of s.events)validateEvent(x);return o;"]]);
fs.appendFileSync('src/headless/adapter.js',`\n// Only the published v1.1 delta is constrained here; legacy event schema is unverified.\nfunction validateEvent(e){\n+ if(!isObj(e)||typeof e.type!=='string')throw Error('invalid event');\n+ const field=(k,test)=>{if(!test(e[k]))throw Error(\`invalid event \${e.type}.\${k}\`);};\n+ const id=v=>typeof v==='string'&&v.length>0,integer=(v,max)=>Number.isSafeInteger(v)&&v>=0&&v<=max;\n+ switch(e.type){\n+ case 'charm_picked':field('charm_id',id);field('charm_ticks',v=>integer(v,Number.MAX_SAFE_INTEGER));break;\n+ case 'drifter_steal':field('drifter_id',id);field('amount',v=>integer(v,3));field('carried',v=>integer(v,10));break;\n+ case 'drifter_drop':field('drifter_id',id);field('amount',v=>integer(v,3));break;\n+ case 'night_start':field('night',v=>[1,2,3].includes(v));break;\n+ case 'player_hit':if(e.source==='fall')field('lost',v=>integer(v,10));break;\n+ // dash/paused/resumed have empty published payloads. Unknown base fields remain allowed.\n+ }\n+}\n`.replaceAll('\n+','\n'));
console.log('Applied minimal F01-F07 fixes; no tuning or world geometry changed.');
