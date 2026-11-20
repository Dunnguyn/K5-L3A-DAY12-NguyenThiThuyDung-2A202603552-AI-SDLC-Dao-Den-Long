import {test,expect} from 'vitest';
import {runScenario,validateOutput,validate} from '../src/headless/adapter.js';
const output=()=>runScenario({version:'internal-draft-1',actions:[]});
test('FIX-01 entity records reject null/primitives/arrays/missing and invalid fields',()=>{
 for(const list of ['lanterns','enemies','fireflies']){
  for(const bad of [null,1,'entity',true,[],{}]){const o=output();o.state[list][0]=bad;expect(()=>validateOutput(o)).toThrow();}
  for(const key of Object.keys(output().state[list][0])){
   const o=output();delete o.state[list][0][key];expect(()=>validateOutput(o)).toThrow();
   for(const value of [null,NaN,Infinity,-Infinity,'0',{},[]]){const o=output();o.state[list][0][key]=value;expect(()=>validateOutput(o)).toThrow();}
  }
  const o=output();delete o.state[list][0];expect(()=>validateOutput(o)).toThrow();
 }
});
test('FIX-01 wrapper, player, timers and array shape validation',()=>{
 for(const key of Object.keys(output().state)){const o=output();delete o.state[key];expect(()=>validateOutput(o)).toThrow();}
 for(const key of Object.keys(output().state.player))for(const value of [undefined,null,NaN,Infinity,'1',[]]){const o=output();o.state.player[key]=value;expect(()=>validateOutput(o)).toThrow();}
 for(const [key,value] of [['health',-1],['health',101],['light',-.1],['light',1.5],['y',-1]]){const o=output();o.state.player[key]=value;expect(()=>validateOutput(o)).toThrow();}
 for(const key of ['tick','score','damageAt','glowAt','glowUntil'])for(const value of [-1,1.5,NaN,Infinity,'1']){const o=output();o.state[key]=value;expect(()=>validateOutput(o)).toThrow();}
 expect(validateOutput(output())).toEqual(output());
});
test('FIX-01 input null records and invalid field types',()=>{for(const a of [null,[],1,{ticks:NaN},{ticks:1,glow:null},{ticks:1,moveX:null}])expect(()=>validate({version:'internal-draft-1',actions:[a]})).toThrow();});
