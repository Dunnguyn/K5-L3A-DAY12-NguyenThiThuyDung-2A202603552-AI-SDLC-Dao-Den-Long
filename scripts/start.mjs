import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createLeaderboardStore} from '../src/server/leaderboard.js';

const root=resolve('dist'),store=createLeaderboardStore();
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.ico':'image/x-icon'};
export function makeServer({rootDir=root,leaderboard=store}={}){
 return createServer(async(req,res)=>{const send=(status,data,contentType='application/json; charset=utf-8')=>{res.writeHead(status,{'Content-Type':contentType,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(contentType.startsWith('application/json')?JSON.stringify(data):data);};
  try{const host=req.headers.host||'',origin=req.headers.origin;if(req.url?.startsWith('/api/')){
   if(!/^127\.0\.0\.1:\d+$/.test(host)||origin!==undefined&&origin!==`http://${host}`){send(403,{error:'loopback origin required'});return;}
   if(req.url==='/api/leaderboard'&&req.method==='GET'){send(200,{entries:(await leaderboard.read()).entries});return;}
   if(req.url==='/api/leaderboard'&&req.method==='POST'){
    let body='',bytes=0;for await(const chunk of req){bytes+=chunk.length;if(bytes>4096){send(413,{error:'request too large'});return;}body+=chunk;}
    let payload;try{payload=JSON.parse(body);}catch{send(400,{error:'invalid JSON'});return;}
    try{send(200,await leaderboard.submit(payload));}catch(error){if(error.message.startsWith('invalid '))send(400,{error:error.message});else throw error;}return;
   }send(404,{error:'not found'});return;
  }
  if(req.method!=='GET'&&req.method!=='HEAD'){send(405,{error:'method not allowed'});return;}
  const pathname=new URL(req.url||'/',`http://${req.headers.host||'127.0.0.1'}`).pathname;const path=resolve(rootDir,'.'+decodeURIComponent(pathname==='/'?'/index.html':pathname));
  if(path!==rootDir&&!path.startsWith(rootDir+sep)){send(403,{error:'invalid path'});return;}
  let bytes;try{bytes=await readFile(path);}catch(error){if(error.code==='ENOENT'){send(404,{error:'not found'});return;}throw error;}
  res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:bytes);
  }catch(error){console.error(error);send(500,{error:'server error'});}
 });
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){
 const port=Number(process.env.PORT||4173);if(!Number.isSafeInteger(port)||port<0||port>65535)throw new Error('invalid PORT');
 const server=makeServer();server.listen(port,'127.0.0.1',()=>console.log(`Đảo Đèn Lồng: http://127.0.0.1:${server.address().port}`));
}
