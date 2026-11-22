import {spawnSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
const repo='Dunnguyn/K5-L3A-DAY12-NguyenThiThuyDung-2A202603552-AI-SDLC-Dao-Den-Long';
const [mode,id]=process.argv.slice(2),route=mode==='runs'?`actions/runs?head_sha=${id}`:mode==='jobs'?`actions/runs/${id}/jobs`:mode==='run'?`actions/runs/${id}`:null;
if(!route)throw Error('Usage: phase3-github.mjs runs <sha> | run <id> | jobs <id>');
const headers={'Accept':'application/vnd.github+json','User-Agent':'dao-den-long-release-verification','X-GitHub-Api-Version':'2022-11-28'};
let response=await fetch(`https://api.github.com/repos/${repo}/${route}`,{headers});
if([401,403,404].includes(response.status)){
 const r=spawnSync('git',['credential','fill'],{input:'protocol=https\nhost=github.com\n\n',encoding:'utf8',env:{...process.env,GIT_TERMINAL_PROMPT:'0',GCM_INTERACTIVE:'Never'},windowsHide:true});
 const secret=r.stdout?.split('\n').find(s=>s.startsWith('password='))?.slice(9);if(secret){headers.Authorization='Bearer '+secret;response=await fetch(`https://api.github.com/repos/${repo}/${route}`,{headers});}
}
if(!response.ok)throw Error('GitHub API HTTP '+response.status);
const result=await response.json(),root=process.env.RELEASE_DIR;if(root){mkdirSync(root,{recursive:true});writeFileSync(root+'/github-'+mode+'-'+id+'-'+Date.now()+'.json',JSON.stringify(result,null,2)+'\n');}
if(mode==='runs')console.log(JSON.stringify(result.workflow_runs.map(r=>({id:r.id,name:r.name,sha:r.head_sha,status:r.status,conclusion:r.conclusion,url:r.html_url}))));
else if(mode==='jobs')console.log(JSON.stringify(result.jobs.map(j=>({name:j.name,status:j.status,conclusion:j.conclusion,steps:j.steps.map(s=>({name:s.name,status:s.status,conclusion:s.conclusion}))}))));
else console.log(JSON.stringify({id:result.id,sha:result.head_sha,status:result.status,conclusion:result.conclusion,url:result.html_url}));
