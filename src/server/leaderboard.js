import {readFile,writeFile,rename,mkdir,unlink} from 'node:fs/promises';
import {join,dirname,resolve} from 'node:path';
import os from 'node:os';
import {randomUUID} from 'node:crypto';

const namePattern=/^[A-Za-z0-9_]{3,12}$/;
const isoPattern=/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?(?:Z|[+-]\d\d:\d\d)$/;
const safeCount=(n,max)=>Number.isSafeInteger(n)&&n>=0&&n<=max;
export function leaderboardPath(env=process.env,platform=process.platform,home=os.homedir()){
 const base=env.DAO_DATA_DIR?resolve(env.DAO_DATA_DIR):platform==='win32'?join(env.LOCALAPPDATA||join(home,'AppData','Local'),'DaoDenLong'):platform==='darwin'?join(home,'Library','Application Support','DaoDenLong'):join(env.XDG_DATA_HOME||join(home,'.local','share'),'dao-den-long');
 return join(base,'leaderboard.json');
}
function validTimestamp(value){if(typeof value!=='string'||!isoPattern.test(value)||!Number.isFinite(Date.parse(value)))return false;const parts=/^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)/.exec(value).slice(1).map(Number);const date=new Date(Date.UTC(parts[0],parts[1]-1,parts[2],parts[3],parts[4],parts[5]));return date.getUTCFullYear()===parts[0]&&date.getUTCMonth()+1===parts[1]&&date.getUTCDate()===parts[2]&&date.getUTCHours()===parts[3]&&date.getUTCMinutes()===parts[4]&&date.getUTCSeconds()===parts[5];}
export function validateEntry(x){
 if(!x||typeof x!=='object'||Array.isArray(x)||Object.keys(x).sort().join()!=='achieved_at,name,nights_won,score,seed')throw new Error('invalid leaderboard entry fields');
 if(typeof x.name!=='string'||!namePattern.test(x.name))throw new Error('invalid name');
 if(!safeCount(x.score,Number.MAX_SAFE_INTEGER))throw new Error('invalid score');
 if(!safeCount(x.nights_won,3))throw new Error('invalid nights_won');
 if(!safeCount(x.seed,Number.MAX_SAFE_INTEGER))throw new Error('invalid seed');
 if(!validTimestamp(x.achieved_at))throw new Error('invalid achieved_at');
 return x;
}
export function rankEntries(entries){return entries.map((entry,index)=>({entry:validateEntry(entry),index})).sort((a,b)=>(a.entry.score===b.entry.score?0:a.entry.score>b.entry.score?-1:1)||Date.parse(a.entry.achieved_at)-Date.parse(b.entry.achieved_at)||a.index-b.index).slice(0,10).map(x=>x.entry);}
export function submissionEntry(payload,achievedAt){
 if(!payload||typeof payload!=='object'||Array.isArray(payload)||Object.keys(payload).sort().join()!=='name,result_id,seed,won_scores')throw new Error('invalid submission fields');
 if(typeof payload.result_id!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(payload.result_id))throw new Error('invalid result_id');
 const scores=payload.won_scores;
 if(!scores||typeof scores!=='object'||Array.isArray(scores))throw new Error('invalid won_scores');
 const keys=Object.keys(scores);if(keys.length>3||keys.some(k=>!['1','2','3'].includes(k)||!safeCount(scores[k],Number.MAX_SAFE_INTEGER))||keys.sort().join()!==Array.from({length:keys.length},(_,i)=>String(i+1)).join())throw new Error('invalid won_scores');
 const score=keys.reduce((total,k)=>total+scores[k],0);
 return validateEntry({name:payload.name,score,nights_won:keys.length,achieved_at:achievedAt,seed:payload.seed});
}
export function createLeaderboardStore({file=leaderboardPath(),clock=()=>new Date().toISOString()}={}){
 let queue=Promise.resolve();
 async function read(){let raw;try{raw=await readFile(file,'utf8');}catch(error){if(error.code==='ENOENT')return{entries:[],submission_ids:[]};throw error;}
  let data;try{data=JSON.parse(raw);}catch{throw new Error('leaderboard file is corrupt JSON');}
  if(!data||!Array.isArray(data.entries)||!Array.isArray(data.submission_ids)||data.submission_ids.some(x=>typeof x!=='string'||!x))throw new Error('leaderboard file has invalid structure');
  return{entries:rankEntries(data.entries),submission_ids:data.submission_ids};
 }
 async function submit(payload){const operation=async()=>{const current=await read();if(current.submission_ids.includes(payload?.result_id))return{duplicate:true,entries:current.entries};
  const entry=submissionEntry(payload,clock());const next={entries:rankEntries([...current.entries,entry]),submission_ids:[...current.submission_ids,payload.result_id]};await mkdir(dirname(file),{recursive:true});const tmp=`${file}.${process.pid}.${randomUUID()}.tmp`;
  try{await writeFile(tmp,JSON.stringify(next,null,2)+'\n',{flag:'wx',mode:0o600});await rename(tmp,file);}catch(error){await unlink(tmp).catch(()=>{});throw error;}
  return{duplicate:false,entry,entries:next.entries};};const result=queue.then(operation);queue=result.catch(()=>{});return result;}
 return{file,read,submit};
}
export async function exportLeaderboard(out,{store=createLeaderboardStore()}={}){const target=resolve(out);if(target===resolve(store.file))throw new Error('cannot export over leaderboard store');const {entries}=await store.read();await mkdir(dirname(target),{recursive:true});const tmp=`${target}.${process.pid}.${randomUUID()}.tmp`;try{await writeFile(tmp,JSON.stringify({entries},null,2)+'\n',{flag:'wx',mode:0o600});await rename(tmp,target);}catch(error){await unlink(tmp).catch(()=>{});throw error;}return{entries};}
