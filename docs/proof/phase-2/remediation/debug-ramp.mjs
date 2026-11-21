import {createGame,step} from '../../../../src/core/game.js';
import {terrainHeight} from '../../../../src/data/worlds.js';
for(const deg of [30,150])for(const off of [-1.1,0,1.1]){const a=deg*Math.PI/180,c=Math.cos(a),z=Math.sin(a),s=createGame({night:3});s.motes=[];Object.assign(s.player,{x:30*c-off*z,y:0,z:30*z+off*c});const trace=[];for(let i=0;i<85;i++){const p=s.player;trace.push({i,x:p.x,y:p.y,z:p.z,ground:p.grounded,support:terrainHeight(3,p.x,p.z,p.y)});step(s,{moveX:-c,moveZ:-z});}if(s.player.y<2.95)console.log(JSON.stringify({deg,off,final:s.player,trace:trace.slice(52)}));}
