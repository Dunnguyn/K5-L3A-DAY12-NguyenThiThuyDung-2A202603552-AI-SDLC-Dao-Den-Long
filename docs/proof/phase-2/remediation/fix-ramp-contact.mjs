import fs from 'node:fs';
let p='src/core/game.js',s=fs.readFileSync(p,'utf8');s=s.replace('getWorld, terrainHeight, isSolid','getWorld, terrainHeight, isSolid, rampTopContact');s=s.replace('h=terrainHeight(s.night,p.x,p.z,y0);const follow=', 'h=terrainHeight(s.night,p.x,p.z,y0);if(followsGround){const lip=rampTopContact(s.night,{x:x0,y:y0,z:z0},p);if(lip!==null)h=lip;}const follow=');fs.writeFileSync(p,s);
p='tests/remediation.test.js';s=fs.readFileSync(p,'utf8');
s=s.replace("['opposite',{moveX:-1},6]","['opposite',{moveX:-1},0]");
s=s.replace("if(name==='opposite')expect(s.player.vel.x).toBeLessThan(0);","if(name==='opposite'){run(s,6,a);expect(s.player.vel.x).toBeCloseTo(-6);}");
s=s.replace('const p={...s.player};step(s,{moveX:-1});','const p={...s.player,vel:{...s.player.vel}};step(s,{moveX:-1});');
s=s.replace('run(s,70);expect(s.player.flames)',"while(!s.player.respawn_ticks)step(s);run(s,60);expect(s.player.flames)");
fs.writeFileSync(p,s);
console.log('Grounded uphill lip contact uses existing numerical envelope; test fixture corrections retain old failing run.');
