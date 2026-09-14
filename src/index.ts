import { MongoClient, Db } from "mongodb";

type Env = { MONGODB_URI: string; ADMIN_KEY: string; PUBLIC_URL?: string; AI: any };
type Bot = { botId:string; siteUrl:string; host:string; title:string; createdAt:string; updatedAt:string; status:string; pageCount:number; pdfCount:number; chunkCount:number };
type Chunk = { botId:string; url:string; title:string; text:string; kind:"page"; updatedAt:string };
type PdfLink = { botId:string; url:string; title:string; updatedAt:string };
type Job = { jobId:string; botId:string; seed:string; queue:string[]; visited:string[]; pdfLinks:string[]; sitemapQueue:string[]; sitemapSeen:string[]; stage:"crawl"|"done"|"error"; pages:number; pdfs:number; chunks:number; errors:string[]; createdAt:string; updatedAt:string; done:boolean };

const DB_NAME="ai_website_chatbot";
const MAX_PAGES=400;
const MAX_PDFS=200;
const MAX_CHUNK=1800;
const OVERLAP=250;
const MAX_HTML_BYTES=5_000_000;
const MAX_SITEMAP_BYTES=2_000_000;
const MODEL="@cf/zai-org/glm-4.7-flash";
const UA="Gen-Solution-Bot/7.0";
let client:MongoClient|undefined;
let db:Db|undefined;

const now=()=>new Date().toISOString();
const makeId=()=>crypto.randomUUID();

function json(data:any,status=200){
  return new Response(JSON.stringify(data),{status,headers:{
    "content-type":"application/json; charset=utf-8",
    "access-control-allow-origin":"*",
    "access-control-allow-headers":"content-type,x-admin-key",
    "cache-control":"no-store"
  }});
}
function html(data:string,status=200){
  return new Response(data,{status,headers:{
    "content-type":"text/html; charset=utf-8",
    "cache-control":"no-store"
  }});
}
function isAdmin(req:Request,env:Env){
  const h=req.headers.get("x-admin-key");
  const q=new URL(req.url).searchParams.get("key");
  return !!env.ADMIN_KEY&&(h===env.ADMIN_KEY||q===env.ADMIN_KEY);
}

async function mongo(uri:string){
  if(!client){
    client=new MongoClient(uri,{serverSelectionTimeoutMS:8000,maxPoolSize:5});
    await client.connect();
    db=client.db(DB_NAME);
  }
  return db!;
}
async function ensureIndexes(d:Db){
  await d.collection("chunks").createIndex({botId:1,updatedAt:-1}).catch(()=>{});
  await d.collection("chunks").createIndex({botId:1,text:"text"}).catch(()=>{});
  await d.collection("pdfLinks").createIndex({botId:1,url:1},{unique:true}).catch(()=>{});
  await d.collection("bots").createIndex({botId:1},{unique:true}).catch(()=>{});
  await d.collection("jobs").createIndex({jobId:1},{unique:true}).catch(()=>{});
}

function cleanUrl(raw:string,base?:string){
  try{
    const u=new URL(raw,base);
    if(!/^https?:$/.test(u.protocol))return null;
    u.hash="";
    u.hostname=u.hostname.toLowerCase();
    if(u.pathname!=="/")u.pathname=u.pathname.replace(/\/{2,}/g,"/");
    return u.toString().replace(/\/$/,"");
  }catch{return null}
}
function host(u:string){return new URL(u).hostname.toLowerCase()}
function sameHost(a:string,b:string){
  return host(a).replace(/^www\./,"")===host(b).replace(/^www\./,"");
}
function privateHost(h:string){
  return /^(localhost|127\.|0\.0\.0\.0|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[0-1])\.|::1|fc|fd)/i.test(h);
}
function allowed(u:string,seed:string){
  try{
    const x=new URL(u);
    return /^https?:$/.test(x.protocol)&&!privateHost(x.hostname)&&sameHost(x.href,seed);
  }catch{return false}
}

function decode(s:string){
  return s.replace(/&nbsp;/gi," ")
    .replace(/&amp;/gi,"&").replace(/&quot;/gi,'"')
    .replace(/&#39;/gi,"'").replace(/&lt;/gi,"<")
    .replace(/&gt;/gi,">")
    .replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCharCode(parseInt(n,16)));
}
function stripHtml(source:string){
  const title=decode((source.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||"").replace(/<[^>]+>/g," "))
    .replace(/\s+/g," ").trim().slice(0,300);
  const cleaned=source
    .replace(/<(script|style|noscript|template|svg|canvas|iframe)[^>]*>[\s\S]*?<\/\1>/gi," ")
    .replace(/<!--[\s\S]*?-->/g," ");
  const breaks=cleaned.replace(/<(br|\/p|\/div|\/li|\/tr|\/h[1-6]|\/section|\/article|\/header|\/footer|\/nav|\/td|\/th)[^>]*>/gi,"\n");
  const text=decode(breaks.replace(/<[^>]+>/g," "))
    .replace(/[\t ]+/g," ").replace(/\n\s+/g,"\n").replace(/\n{3,}/g,"\n\n").trim();
  return {title,text};
}

function isPdf(u:string){return /\.pdf(?:$|[?#])/i.test(u)}
function isBinary(u:string){
  return /\.(?:jpg|jpeg|png|gif|webp|svg|ico|mp4|mp3|zip|rar|7z|doc|docx|xls|xlsx|ppt|pptx|css|js|woff2?|ttf)(?:$|[?#])/i.test(u);
}
function extractLinks(source:string,base:string,seed:string){
  const out=new Set<string>();
  const re=/<a\b[^>]*?href\s*=\s*["']([^"']+)["'][^>]*>/gi;
  let m:RegExpExecArray|null;
  while((m=re.exec(source))){
    const raw=m[1].trim();
    if(/^(mailto:|tel:|javascript:|data:|#)/i.test(raw))continue;
    const u=cleanUrl(raw,base);
    if(u&&allowed(u,seed)&&!isBinary(u)&&!isPdf(u))out.add(u);
  }
  return [...out];
}
function extractPdfs(source:string,base:string,seed:string){
  const out=new Set<string>();
  const re=/(?:href|data-href|data-url)\s*=\s*["']([^"']+)["']/gi;
  let m:RegExpExecArray|null;
  while((m=re.exec(source))){
    const u=cleanUrl(m[1],base);
    if(u&&allowed(u,seed)&&isPdf(u))out.add(u);
  }
  return [...out];
}
function pdfTitle(url:string){
  try{
    const u=new URL(url);
    return decodeURIComponent(u.pathname.split("/").pop()||"PDF Document")
      .replace(/\.pdf$/i,"").replace(/[-_]+/g," ").replace(/\s+/g," ").trim().slice(0,200);
  }catch{return "PDF Document"}
}
function makeChunks(text:string){
  const out:string[]=[];
  let start=0;
  while(start<text.length){
    const end=Math.min(text.length,start+MAX_CHUNK);
    let cut=end;
    if(end<text.length){
      const p=Math.max(text.lastIndexOf(" ",end),text.lastIndexOf("\n",end));
      if(p>start+800)cut=p;
    }
    const value=text.slice(start,cut).trim();
    if(value.length>60)out.push(value);
    if(cut>=text.length)break;
    start=Math.max(cut-OVERLAP,start+1);
  }
  return out;
}
function tokens(s:string){
  return new Set((s.toLowerCase().match(/[a-z0-9@._+-]+/g)||[]).filter(x=>x.length>1));
}
function score(q:string,t:string){
  const a=tokens(q),b=tokens(t);
  if(!a.size||!b.size)return 0;
  let n=0;for(const x of a)if(b.has(x))n++;
  return n/a.size;
}

async function fetchPage(url:string,seed:string){
  if(!allowed(url,seed))throw new Error("Blocked URL");
  const c=new AbortController();
  const timer=setTimeout(()=>c.abort(),15000);
  try{
    const r=await fetch(url,{redirect:"follow",signal:c.signal,headers:{
      "user-agent":UA,
      accept:"text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.1",
      "accept-language":"en-US,en;q=0.8"
    }});
    if(!r.ok)throw new Error(`HTTP ${r.status}`);
    if(!allowed(r.url||url,seed))throw new Error("Redirected outside website");
    const type=(r.headers.get("content-type")||"").toLowerCase();
    if(type&&!type.includes("text/html")&&!type.includes("application/xhtml+xml")&&!type.includes("text/plain"))throw new Error("Not an HTML page");
    const len=Number(r.headers.get("content-length")||"0");
    if(len>MAX_HTML_BYTES)throw new Error("HTML page too large");
    const text=await r.text();
    if(text.length>MAX_HTML_BYTES)throw new Error("HTML page too large");
    return {url:r.url||url,html:text};
  }finally{clearTimeout(timer)}
}
async function fetchSmall(url:string){
  const c=new AbortController();const timer=setTimeout(()=>c.abort(),8000);
  try{return await fetch(url,{redirect:"follow",signal:c.signal,headers:{"user-agent":UA,accept:"application/xml,text/xml,text/plain,*/*;q=0.5"}})}
  finally{clearTimeout(timer)}
}
async function savePdfs(d:Db,job:Job,urls:string[]){
  if(!urls.length)return;
  const ops=urls.slice(0,MAX_PDFS).map(url=>({updateOne:{
    filter:{botId:job.botId,url},
    update:{$set:{botId:job.botId,url,title:pdfTitle(url),updatedAt:now()}},
    upsert:true
  }}));
  if(ops.length)await d.collection<PdfLink>("pdfLinks").bulkWrite(ops,{ordered:false});
}
function sitemapCandidates(seed:string){
  return ["/sitemap.xml","/wp-sitemap.xml","/sitemap_index.xml"].map(p=>new URL(p,seed).href);
}
function parseSitemap(text:string,seed:string){
  const pages=new Set<string>(),sitemaps=new Set<string>();
  for(const m of text.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)){
    const u=cleanUrl(m[1].trim());
    if(!u||!sameHost(u,seed))continue;
    if(/\.xml(?:$|[?#])/i.test(u)&&/sitemap/i.test(u)){sitemaps.add(u);continue}
    if(!isPdf(u)&&!isBinary(u))pages.add(u);
  }
  return {pages:[...pages],sitemaps:[...sitemaps]};
}
async function processSitemap(job:Job,d:Db){
  const sitemap=job.sitemapQueue.shift();
  if(!sitemap||job.sitemapSeen.includes(sitemap))return false;
  job.sitemapSeen.push(sitemap);
  try{
    const r=await fetchSmall(sitemap);
    if(!r.ok)return true;
    const len=Number(r.headers.get("content-length")||"0");
    if(len>MAX_SITEMAP_BYTES)return true;
    const text=await r.text();
    if(text.length>MAX_SITEMAP_BYTES)return true;
    const parsed=parseSitemap(text,job.seed);
    for(const u of parsed.pages){
      if(job.queue.length>=MAX_PAGES*2)break;
      if(!job.visited.includes(u)&&!job.queue.includes(u))job.queue.push(u);
    }
    for(const u of parsed.sitemaps){
      if(!job.sitemapSeen.includes(u)&&!job.sitemapQueue.includes(u)&&job.sitemapQueue.length<20)job.sitemapQueue.push(u);
    }
    return true;
  }catch(e){
    job.errors.push(`Sitemap ${sitemap}: ${e instanceof Error?e.message:String(e)}`);
    return true;
  }
}
async function crawlPage(job:Job,d:Db){
  let url=job.queue.shift();
  while(url&&(job.visited.includes(url)||!allowed(url,job.seed)))url=job.queue.shift();
  if(!url)return false;
  try{
    const result=await fetchPage(url,job.seed);
    const parsed=stripHtml(result.html);
    if(!job.visited.includes(result.url))job.visited.push(result.url);
    for(const u of extractLinks(result.html,result.url,job.seed)){
      if(!job.visited.includes(u)&&!job.queue.includes(u)&&job.queue.length<MAX_PAGES*2)job.queue.push(u);
    }
    const pdfs=extractPdfs(result.html,result.url,job.seed);
    for(const u of pdfs)if(!job.pdfLinks.includes(u)&&job.pdfLinks.length<MAX_PDFS)job.pdfLinks.push(u);
    await savePdfs(d,job,pdfs);
    const cc=makeChunks(parsed.text);
    const collection=d.collection<Chunk>("chunks");
    await collection.deleteMany({botId:job.botId,url:result.url});
    if(cc.length)await collection.insertMany(cc.map(text=>({botId:job.botId,url:result.url,title:parsed.title||result.url,text,kind:"page" as const,updatedAt:now()})));
    job.chunks+=cc.length;
    job.pages++;
    return true;
  }catch(e){
    job.errors.push(`${url}: ${e instanceof Error?e.message:String(e)}`);
    if(!job.visited.includes(url))job.visited.push(url);
    return true;
  }
}
async function createJob(env:Env,siteUrl:string){
  const d=await mongo(env.MONGODB_URI);await ensureIndexes(d);
  const botId=makeId(),jobId=makeId(),t=now();
  const bot:Bot={botId,siteUrl,host:host(siteUrl),title:"Website Assistant",createdAt:t,updatedAt:t,status:"building",pageCount:0,pdfCount:0,chunkCount:0};
  const job:Job={jobId,botId,seed:siteUrl,queue:[siteUrl],visited:[],pdfLinks:[],sitemapQueue:sitemapCandidates(siteUrl),sitemapSeen:[],stage:"crawl",pages:0,pdfs:0,chunks:0,errors:[],createdAt:t,updatedAt:t,done:false};
  await d.collection("bots").insertOne(bot);await d.collection("jobs").insertOne(job);
  return {bot,job};
}
async function step(env:Env,jobId:string){
  const d=await mongo(env.MONGODB_URI);const jobs=d.collection<Job>("jobs");
  const job=await jobs.findOne({jobId});
  if(!job)throw new Error("Job not found");
  if(job.done)return job;
  let worked=false;
  if(job.pages>=MAX_PAGES){job.done=true;job.stage="done"}
  else{
    if(job.sitemapQueue.length)worked=await processSitemap(job,d);
    if(!worked&&job.queue.length)worked=await crawlPage(job,d);
    if(!worked){job.done=true;job.stage="done"}
  }
  job.pdfs=job.pdfLinks.length;job.updatedAt=now();
  await jobs.updateOne({jobId},{$set:job});
  if(job.done)await d.collection("bots").updateOne({botId:job.botId},{$set:{status:"ready",pageCount:job.pages,pdfCount:job.pdfs,chunkCount:job.chunks,updatedAt:now()}});
  return job;
}
async function chat(env:Env,botId:string,question:string){
  const d=await mongo(env.MONGODB_URI);
  const bot=await d.collection<Bot>("bots").findOne({botId});
  if(!bot)throw new Error("Bot not found");
  if(bot.status!=="ready")return {answer:"The website knowledge base is still being built. Please try again shortly.",sources:[]};
  const c=d.collection<Chunk>("chunks");
  let found:Chunk[]=[];
  try{found=await c.find({botId,$text:{$search:question}}).limit(30).toArray()}
  catch{found=await c.find({botId}).limit(100).toArray()}
  found=found.map(x=>({x,s:score(question,x.text)})).sort((a,b)=>b.s-a.s).slice(0,8).map(x=>x.x);
  const pdfs=await d.collection<PdfLink>("pdfLinks").find({botId}).limit(MAX_PDFS).toArray();
  const pm=pdfs.map(x=>({x,s:score(question,x.title+" "+x.url)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s).slice(0,5).map(x=>x.x);
  if(!found.length&&!pm.length)return {answer:"I couldn't find that information on the website.",sources:[]};
  const context=found.map((x,i)=>`[SOURCE ${i+1}]\nTitle: ${x.title}\nURL: ${x.url}\nContent:\n${x.text}`).join("\n\n");
  const pdfContext=pm.map((x,i)=>`[PDF ${i+1}]\nTitle: ${x.title}\nURL: ${x.url}`).join("\n\n")||"No matching PDF.";
  const prompt=`You are the official website assistant. Answer ONLY from the website information below. Never invent facts or use outside knowledge. If the answer is not present, say exactly: I couldn't find that information on the website. PDFs are link-only: never claim to have read PDF content. Preserve exact phone numbers and emails. English question = English answer. Natural Roman Hindi/Hinglish question = Roman Hindi/Hinglish answer. Keep it concise.\n\nWEBSITE:\n${context}\n\nPDF LINKS:\n${pdfContext}\n\nQUESTION:\n${question}`;
  const r=await env.AI.run(MODEL,{messages:[{role:"system",content:"You are a strict website-grounded assistant."},{role:"user",content:prompt}],temperature:0.1,max_tokens:700});
  const answerText=typeof r==="string"?r:r?.response||r?.result||"I couldn't find that information on the website.";
  const map=new Map<string,{title:string,url:string,type:"page"|"pdf"}>();
  for(const x of found)map.set(x.url,{title:x.title||x.url,url:x.url,type:"page"});
  for(const x of pm)map.set(x.url,{title:x.title,url:x.url,type:"pdf"});
  return {answer:String(answerText).trim(),sources:[...map.values()].slice(0,8)};
}
function esc(s:string){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}

function adminPage(){
return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Gen-Solution Admin</title><style>body{margin:0;background:#f5f7fb;font-family:Arial,sans-serif;color:#111827}.wrap{max-width:850px;margin:40px auto;padding:20px}.card{background:#fff;border:1px solid #e5e7eb;border-radius:18px;padding:25px;box-shadow:0 10px 35px #0000000d}h1{margin:0 0 8px}label{display:block;font-weight:700;font-size:14px;margin:16px 0 7px}input,textarea{width:100%;box-sizing:border-box;padding:13px;border:1px solid #d1d5db;border-radius:10px;font-size:15px}button{margin-top:18px;padding:13px 18px;border:0;border-radius:10px;background:#111827;color:#fff;font-weight:700;cursor:pointer}button:disabled{opacity:.5}.status{margin-top:18px;background:#f3f4f6;padding:14px;border-radius:10px;white-space:pre-wrap;word-break:break-word}.embed{display:none;margin-top:20px}</style></head><body><div class="wrap"><div class="card"><h1>Gen-Solution AI Website Chatbot</h1><p>Enter a public website URL to crawl its HTML and discover official PDF links.</p><label>Website URL</label><input id="site" placeholder="https://example.com/"><label>Admin Key</label><input id="key" type="password" placeholder="ADMIN_KEY"><button id="build">Crawl & Build</button><div id="status" class="status">Ready.</div><div id="embed" class="embed"><label>Embed code</label><textarea id="code" readonly></textarea><button id="copy">Copy Embed Code</button></div></div></div><script>
const site=document.getElementById('site'),key=document.getElementById('key'),btn=document.getElementById('build'),status=document.getElementById('status'),box=document.getElementById('embed'),code=document.getElementById('code');let adminKey='';
async function read(r,label){const t=await r.text();if(!r.ok)throw new Error(label+' HTTP '+r.status+': '+t.slice(0,400));try{return JSON.parse(t)}catch{throw new Error('Invalid '+label+' response: '+t.slice(0,400))}}
async function statusJob(id){return read(await fetch('/api/admin/job/'+encodeURIComponent(id),{headers:{'x-admin-key':adminKey},cache:'no-store'}),'status')}
async function runStep(id){return read(await fetch('/api/admin/step/'+encodeURIComponent(id),{method:'POST',headers:{'x-admin-key':adminKey},cache:'no-store'}),'step')}
async function poll(id,bot){for(;;){const s=(await statusJob(id)).job;if(s.done||s.stage==='done'){status.textContent='Build completed.\\nPages: '+s.pages+'\\nPDF links: '+s.pdfs+'\\nChunks: '+s.chunks;code.value='<script src="'+location.origin+'/widget.js?bot='+encodeURIComponent(bot)+'" defer><\\/script>';box.style.display='block';return}if(s.stage==='error')throw new Error(s.errors?.join('\\n')||'Build failed');status.textContent='Building...\\nPages: '+s.pages+' / 400\\nPDF links: '+s.pdfs+'\\nChunks: '+s.chunks+'\\nQueue: '+s.queue.length+'\\nSitemaps left: '+s.sitemapQueue.length;await runStep(id);await new Promise(r=>setTimeout(r,700))}}
btn.addEventListener('click',async()=>{try{btn.disabled=true;box.style.display='none';adminKey=key.value.trim();if(!site.value.trim())throw new Error('Website URL is required.');if(!adminKey)throw new Error('Admin Key is required.');status.textContent='Creating build job...';const r=await read(await fetch('/api/admin/build',{method:'POST',headers:{'content-type':'application/json','x-admin-key':adminKey},body:JSON.stringify({url:site.value.trim()})}),'build');if(!r.ok)throw new Error(r.error||'Build failed');await poll(r.jobId,r.botId)}catch(e){status.textContent='Build Error:\\n\\n'+(e instanceof Error?e.message:String(e))}finally{btn.disabled=false}});
document.getElementById('copy').addEventListener('click',async()=>{await navigator.clipboard.writeText(code.value);document.getElementById('copy').textContent='Copied!'});
</script></body></html>`;
}

function widgetJs(requestUrl:string){
  const origin=new URL(requestUrl).origin;
  return `(()=>{const s=document.currentScript;if(!s)return;const bot=new URL(s.src).searchParams.get('bot');if(!bot)return;const i=document.createElement('iframe');i.src=${JSON.stringify(origin)}+'/widget?bot='+encodeURIComponent(bot);i.title='AI Website Assistant';Object.assign(i.style,{position:'fixed',right:'18px',bottom:'18px',width:'390px',height:'620px',maxWidth:'calc(100vw - 24px)',maxHeight:'calc(100vh - 24px)',border:'0',zIndex:'2147483647',background:'transparent',borderRadius:'18px',boxShadow:'0 15px 50px rgba(0,0,0,.18)'});document.body.appendChild(i)})()`;
}

async function widget(env:Env,botId:string){
  const d=await mongo(env.MONGODB_URI);
  const bot=await d.collection<Bot>("bots").findOne({botId});
  if(!bot)return html("Bot not found.",404);
  return html(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(bot.title||"Website Assistant")}</title><style>*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden;font-family:Arial,sans-serif}.app{height:100%;display:flex;flex-direction:column;background:#fff;border-radius:18px;overflow:hidden}.head{background:#111827;color:#fff;padding:16px}.title{font-weight:800}.sub{font-size:12px;opacity:.7;margin-top:3px}.msgs{flex:1;overflow:auto;padding:14px;background:#f9fafb}.msg{max-width:88%;padding:11px 13px;border-radius:13px;margin-bottom:10px;font-size:14px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere}.bot{background:#fff;border:1px solid #e5e7eb}.user{margin-left:auto;background:#111827;color:#fff}.src{display:block;margin-top:7px;font-size:12px;color:#2563eb;text-decoration:none}.form{display:flex;gap:8px;padding:11px;border-top:1px solid #e5e7eb}.input{flex:1;min-width:0;padding:11px;border:1px solid #d1d5db;border-radius:10px}.send{border:0;border-radius:10px;background:#111827;color:#fff;padding:0 15px;font-weight:700}</style></head><body><div class="app"><div class="head"><div class="title">${esc(bot.title||"Website Assistant")}</div><div class="sub">Ask questions about this website</div></div><div id="msgs" class="msgs"><div class="msg bot">Hi! How can I help you?</div></div><form id="form" class="form"><input id="input" class="input" placeholder="Ask a question..." autocomplete="off"><button class="send" id="send">Send</button></form></div><script>
const msgs=document.getElementById('msgs'),input=document.getElementById('input'),send=document.getElementById('send'),form=document.getElementById('form'),botId=${JSON.stringify(botId)};
function add(text,cls,sources=[]){const d=document.createElement('div');d.className='msg '+cls;d.textContent=text;for(const s of sources){const a=document.createElement('a');a.className='src';a.href=s.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=(s.type==='pdf'?'PDF: ':'Source: ')+s.title;d.appendChild(a)}msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight}
form.addEventListener('submit',async e=>{e.preventDefault();const q=input.value.trim();if(!q)return;add(q,'user');input.value='';send.disabled=true;add('Thinking...','bot');const loading=msgs.lastElementChild;try{const r=await fetch('/api/chat',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({botId,question:q})});const t=await r.text();if(!r.ok)throw new Error('HTTP '+r.status);const data=JSON.parse(t);loading.remove();add(data.answer||"I couldn't find that information on the website.",'bot',data.sources||[])}catch{loading.textContent='Sorry, something went wrong. Please try again.'}finally{send.disabled=false;input.focus()}});
</script></body></html>`);
}

export default {async fetch(request:Request,env:Env){
  const u=new URL(request.url),p=u.pathname;
  if(request.method==="OPTIONS")return new Response(null,{status:204,headers:{"access-control-allow-origin":"*","access-control-allow-methods":"GET,POST,OPTIONS","access-control-allow-headers":"content-type,x-admin-key"}});
  if(p==="/health")return json({ok:true,service:"gen-solution",time:now()});
  if(p==="/"){
    if(!isAdmin(request,env))return new Response("Unauthorized",{status:401});
    return html(adminPage());
  }
  if(p==="/widget.js")return new Response(widgetJs(request.url),{headers:{"content-type":"application/javascript; charset=utf-8","cache-control":"public,max-age=300"}});
  if(p==="/widget"){
    const bot=u.searchParams.get("bot");if(!bot)return html("Missing bot.",400);
    try{return await widget(env,bot)}catch(e){return html("Widget error: "+(e instanceof Error?e.message:String(e)),500)}
  }
  if(p==="/api/admin/build"&&request.method==="POST"){
    if(!isAdmin(request,env))return json({ok:false,error:"Unauthorized"},401);
    try{
      const raw=await request.json();
      const body=raw as {url?:string};
      if(!body.url)return json({ok:false,error:"Website URL is required."},400);
      const site=cleanUrl(body.url);
      if(!site)return json({ok:false,error:"Invalid website URL."},400);
      if(privateHost(host(site)))return json({ok:false,error:"Private/local URLs are not allowed."},400);
      const r=await createJob(env,site);
      return json({ok:true,jobId:r.job.jobId,botId:r.bot.botId});
    }catch(e){return json({ok:false,error:e instanceof Error?e.message:String(e)},500)}
  }
  if(p.startsWith("/api/admin/job/")&&request.method==="GET"){
    if(!isAdmin(request,env))return json({ok:false,error:"Unauthorized"},401);
    const jobId=p.split("/").pop();if(!jobId)return json({ok:false,error:"Job ID missing."},400);
    try{
      const d=await mongo(env.MONGODB_URI);
      const job=await d.collection<Job>("jobs").findOne({jobId});
      if(!job)return json({ok:false,error:"Job not found."},404);
      return json({ok:true,job});
    }catch(e){return json({ok:false,error:e instanceof Error?e.message:String(e)},500)}
  }
  if(p.startsWith("/api/admin/step/")&&request.method==="POST"){
    if(!isAdmin(request,env))return json({ok:false,error:"Unauthorized"},401);
    const jobId=p.split("/").pop();if(!jobId)return json({ok:false,error:"Job ID missing."},400);
    try{return json({ok:true,job:await step(env,jobId)})}
    catch(e){return json({ok:false,error:e instanceof Error?e.message:String(e)},500)}
  }
  if(p==="/api/chat"&&request.method==="POST"){
    try{
      const raw=await request.json();
      const body=raw as {botId?:string;question?:string};
      const botId=body.botId?.trim(),question=body.question?.trim();
      if(!botId||!question)return json({ok:false,error:"botId and question are required."},400);
      if(question.length>1000)return json({ok:false,error:"Question is too long."},400);
      return json({ok:true,...await chat(env,botId,question)});
    }catch(e){return json({ok:false,error:e instanceof Error?e.message:String(e)},500)}
  }
  return new Response("Not Found",{status:404});
}};
