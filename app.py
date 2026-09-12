import os,re,io,uuid,math,hashlib,threading,ipaddress,socket
from datetime import datetime,timezone
from urllib.parse import urljoin,urlparse,urlunparse,parse_qsl,urlencode
from urllib import robotparser
import xml.etree.ElementTree as ET
import requests
from bs4 import BeautifulSoup
from flask import Flask,request,jsonify,Response,render_template_string
from pymongo import MongoClient,ASCENDING
from google import genai
from google.genai import types
from pypdf import PdfReader

app=Flask(__name__)
GEMINI_API_KEY=os.getenv('GEMINI_API_KEY','').strip(); MONGODB_URI=os.getenv('MONGODB_URI','').strip(); PUBLIC_URL=os.getenv('PUBLIC_URL','').strip().rstrip('/'); ADMIN_KEY=os.getenv('ADMIN_KEY','').strip()
CHAT_MODEL=os.getenv('GEMINI_CHAT_MODEL','gemini-3.8-flash'); EMBED_MODEL=os.getenv('GEMINI_EMBED_MODEL','gemini-embedding-001'); EMBED_DIM=int(os.getenv('EMBEDDING_DIM','768'))
MAX_PAGES=int(os.getenv('MAX_PAGES','400')); MAX_PDFS=int(os.getenv('MAX_PDFS','100')); MAX_CHUNKS=int(os.getenv('MAX_CHUNKS','12000')); TIMEOUT=int(os.getenv('REQUEST_TIMEOUT','20'))
UA='AIWebsiteChatbot/2.0 (respectful crawler; honors robots.txt)'
mongo=MongoClient(MONGODB_URI,serverSelectionTimeoutMS=8000) if MONGODB_URI else None; db=mongo['ai_website_chatbot'] if mongo else None
bots=db['bots'] if db else None; chunks=db['chunks'] if db else None; jobs=db['jobs'] if db else None
if chunks:
    for spec in ([('bot_id',ASCENDING)],[('url',ASCENDING)],[('content_hash',ASCENDING)]):
        try: chunks.create_index(spec)
        except: pass
ai=genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

def now(): return datetime.now(timezone.utc).isoformat()
def clean(x): return re.sub(r'\s+',' ',x or '').strip()
def norm(url):
    if not url:return ''
    p=urlparse(url.strip())
    if p.scheme not in ('http','https') or not p.netloc:return ''
    q=[(k,v) for k,v in parse_qsl(p.query,keep_blank_values=True) if k.lower() not in {'utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','fbclid','mc_cid','mc_eid'}]
    path=p.path or '/'
    if path!='/' and path.endswith('/'):path=path[:-1]
    return urlunparse((p.scheme.lower(),p.netloc.lower(),path,'',urlencode(q),''))
def host(u): return (urlparse(u).hostname or '').lower().rstrip('.')
def private_host(h):
    if h in {'localhost','localhost.localdomain'}:return True
    try:
        for x in socket.getaddrinfo(h,None):
            ip=ipaddress.ip_address(x[4][0])
            if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved:return True
    except:pass
    return False
def same_site(u,r):
    a,b=host(u),host(r); return a==b or a=='www.'+b or b=='www.'+a
def is_pdf(u,ct=''):return u.lower().split('?')[0].endswith('.pdf') or 'application/pdf' in ct.lower()
def allowed(u,r):
    u=norm(u)
    if not u or not same_site(u,r):return False
    bad=('.jpg','.jpeg','.png','.gif','.webp','.svg','.ico','.css','.js','.zip','.rar','.mp4','.mp3','.avi','.mov','.woff','.woff2','.ttf','.eot')
    return not urlparse(u).path.lower().endswith(bad)
def get(url,s):return s.get(url,timeout=TIMEOUT,headers={'User-Agent':UA,'Accept':'*/*'},allow_redirects=True)
def extract_html(data,url):
    soup=BeautifulSoup(data,'html.parser')
    for t in soup(['script','style','noscript','svg','canvas','iframe','form','nav','footer','header','aside']):t.decompose()
    title=clean(soup.title.get_text(' ',strip=True)) if soup.title else ''
    if not title and soup.find('h1'):title=clean(soup.find('h1').get_text(' ',strip=True))
    date=''
    for sel in ["time[datetime]","meta[property='article:published_time']","meta[property='article:modified_time']","meta[name='date']","meta[name='last-modified']"]:
        for e in soup.select(sel):
            v=e.get('datetime') or e.get('content') or ''; m=re.search(r'\b20\d{2}[-/]\d{1,2}[-/]\d{1,2}\b',v)
            if m:date=m.group();break
        if date:break
    texts=[]
    for n in soup.find_all(['main','article','section']):
        t=clean(n.get_text(' ',strip=True))
        if len(t)>=120:texts.append(t)
    text=clean('\n'.join(sorted(texts,key=len,reverse=True)[:5]) if texts else soup.get_text(' ',strip=True))
    return title or url,date,text,soup
def pdf_text(data):
    r=PdfReader(io.BytesIO(data));out=[]
    for i,p in enumerate(r.pages):
        try:t=clean(p.extract_text() or '')
        except:t=''
        if t:out.append(f'[PDF page {i+1}] {t}')
    return clean('\n'.join(out))
def split_text(text,size=2600,overlap=350):
    text=clean(text)
    if len(text)<=size:return [text] if text else []
    out=[];start=0
    while start<len(text):
        end=min(len(text),start+size)
        if end<len(text):
            cut=max(text.rfind('. ',start,end),text.rfind(' ',start,end))
            if cut>start+int(size*.55):end=cut+1
        if text[start:end].strip():out.append(text[start:end].strip())
        if end>=len(text):break
        start=max(start+1,end-overlap)
    return out
def sitemap_urls(root):
    out={norm(urljoin(root+'/','/sitemap.xml')),norm(urljoin(root+'/','/wp-sitemap.xml')),norm(urljoin(root+'/','/sitemap_index.xml'))}
    try:
        r=requests.get(urljoin(root+'/','/robots.txt'),timeout=TIMEOUT,headers={'User-Agent':UA})
        if r.ok:
            for line in r.text.splitlines():
                if line.lower().startswith('sitemap:'):out.add(norm(line.split(':',1)[1].strip()))
    except:pass
    return {x for x in out if x}
def parse_sitemap(u,seen=None):
    seen=seen or set()
    if u in seen:return set()
    seen.add(u);out=set()
    try:
        r=requests.get(u,timeout=TIMEOUT,headers={'User-Agent':UA})
        if not r.ok:return out
        root=ET.fromstring(r.content);ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
        for e in root.findall('.//s:sitemap/s:loc',ns):out|=parse_sitemap(clean(e.text or ''),seen)
        for e in root.findall('.//s:url/s:loc',ns):
            x=norm(e.text or '')
            if x:out.add(x)
    except:pass
    return out
def get_robots(root):
    rp=robotparser.RobotFileParser();rp.set_url(urljoin(root+'/','/robots.txt'))
    try:rp.read();return rp
    except:return None
def can_fetch(rp,u):
    try:return True if rp is None else rp.can_fetch(UA,u)
    except:return True
def emb(texts,task):
    result=ai.models.embed_content(model=EMBED_MODEL,contents=texts,config=types.EmbedContentConfig(task_type=task,output_dimensionality=EMBED_DIM))
    return [list(x.values) for x in result.embeddings]
def cosine(a,b):
    n=min(len(a),len(b))
    if not n:return 0.0
    d=sum(a[i]*b[i] for i in range(n));aa=math.sqrt(sum(x*x for x in a[:n]));bb=math.sqrt(sum(x*x for x in b[:n]));return d/(aa*bb) if aa and bb else 0.0
def set_job(j,**kw):
    if jobs:kw['updated_at']=now();jobs.update_one({'_id':j},{'$set':kw},upsert=True)
def build(jid,bid,root):
    try:
        set_job(jid,status='running',stage='crawling',pages_indexed=0,pdfs_found=0,chunks_indexed=0,error='')
        rp=get_robots(root);sess=requests.Session();seen=set();queue=[];pdfs=set();records=[]
        seed=[root]
        for sm in sitemap_urls(root):
            if same_site(sm,root):seed+=list(parse_sitemap(sm))
        for u in seed:
            if allowed(u,root) and u not in seen and len(queue)<MAX_PAGES:seen.add(u);queue.append(u)
        indexed=0
        while queue and indexed<MAX_PAGES:
            u=queue.pop(0)
            if not can_fetch(rp,u):continue
            try:
                r=get(u,sess);fu=norm(r.url);ct=r.headers.get('content-type','')
                if is_pdf(fu,ct):
                    if len(pdfs)<MAX_PDFS:pdfs.add(fu)
                    continue
                if 'text/html' not in ct.lower() or len(r.content)>8000000:continue
                title,date,text,soup=extract_html(r.content,fu)
                if len(text)>=80:records.append({'url':fu,'title':title,'date_hint':date,'text':text,'kind':'html'});indexed+=1
                for a in soup.find_all('a',href=True):
                    x=norm(urljoin(fu,a.get('href')))
                    if not x or not same_site(x,root):continue
                    if is_pdf(x):
                        if len(pdfs)<MAX_PDFS:pdfs.add(x)
                    elif allowed(x,root) and x not in seen and len(seen)<MAX_PAGES:seen.add(x);queue.append(x)
            except:continue
            if indexed%10==0:set_job(jid,pages_found=len(seen),pages_indexed=indexed,pdfs_found=len(pdfs))
        set_job(jid,stage='processing_pdfs',pages_indexed=indexed,pdfs_found=len(pdfs),pages_found=len(seen))
        for u in sorted(pdfs):
            if not can_fetch(rp,u):continue
            try:
                r=get(u,sess)
                if len(r.content)>30000000:continue
                text=pdf_text(r.content)
                if len(text)>=80:records.append({'url':norm(r.url),'title':u.rstrip('/').split('/')[-1] or 'PDF document','date_hint':'','text':text,'kind':'pdf'})
            except:pass
        unique={}
        for rec in records:
            h=hashlib.sha256(rec['text'].encode('utf8','ignore')).hexdigest();rec['content_hash']=h
            if h not in unique or len(rec['text'])>len(unique[h]['text']):unique[h]=rec
        items=[]
        for rec in unique.values():
            for n,part in enumerate(split_text(rec['text'])):
                if len(items)>=MAX_CHUNKS:break
                items.append({'bot_id':bid,'url':rec['url'],'title':rec['title'],'date_hint':rec['date_hint'],'kind':rec['kind'],'content_hash':rec['content_hash'],'chunk_index':n,'text':part})
            if len(items)>=MAX_CHUNKS:break
        chunks.delete_many({'bot_id':bid});set_job(jid,stage='creating_embeddings',pages_indexed=indexed,pdfs_found=len(pdfs),chunks_indexed=0)
        for n in range(0,len(items),50):
            batch=items[n:n+50];vectors=emb([x['text'] for x in batch],'RETRIEVAL_DOCUMENT')
            for d,v in zip(batch,vectors):d['embedding']=v;d['created_at']=now()
            if batch:chunks.insert_many(batch)
            set_job(jid,stage='creating_embeddings',pages_indexed=indexed,pdfs_found=len(pdfs),chunks_indexed=min(n+len(batch),len(items)))
        bots.update_one({'bot_id':bid},{'$set':{'status':'ready','updated_at':now(),'pages_indexed':indexed,'pdfs_indexed':len(pdfs),'chunks_indexed':len(items),'root_url':root,'domain':host(root)}},upsert=True)
        set_job(jid,status='complete',stage='complete',bot_id=bid,pages_indexed=indexed,pdfs_found=len(pdfs),chunks_indexed=len(items))
    except Exception as e:
        bots.update_one({'bot_id':bid},{'$set':{'status':'error','error':str(e),'updated_at':now()}},upsert=True);set_job(jid,status='error',stage='failed',error=str(e))
def retrieve(bid,q):
    qv=emb([q],'RETRIEVAL_QUERY')[0];vals=list(chunks.find({'bot_id':bid},{'_id':0,'embedding':1,'text':1,'url':1,'title':1,'date_hint':1,'kind':1}))
    for x in vals:x['score']=cosine(qv,x.get('embedding',[]));x.pop('embedding',None)
    vals.sort(key=lambda x:x['score'],reverse=True);return [x for x in vals[:8] if x['score']>=.25][:6]
def make_prompt(q,h,src):
    context='\n\n'.join(f"SOURCE {i}\nTitle: {x['title']}\nURL: {x['url']}\nDate: {x['date_hint']}\n{x['text']}" for i,x in enumerate(src,1))
    history='\n'.join(f"{x.get('role','').upper()}: {clean(x.get('content',''))[:1000]}" for x in (h or [])[-6:])
    return f"""You are the official website information assistant.
Use ONLY the supplied website sources. Never use outside knowledge or guess.
If the answer is not supported, say: "I couldn't find that information on the website."
Never invent fees, dates, eligibility, deadlines, policies, timings or requirements.
Prefer newer information when sources conflict. Never silently treat old dated material as current; mention the year/date when relevant.
English question -> English. Roman Hinglish question -> natural Roman Hinglish. NEVER use Devanagari.
Be concise but complete and use bullets when useful.

WEBSITE SOURCES:
{context}

RECENT CONVERSATION:
{history}

USER QUESTION:
{q}
"""
ADMIN="""<!doctype html><meta charset=utf-8><meta name=viewport content=width=device-width,initial-scale=1><title>AI Website Chatbot</title><style>*{box-sizing:border-box}body{margin:0;background:#f5f7fb;font-family:system-ui;color:#111827}.wrap{max-width:820px;margin:50px auto;padding:20px}.card{background:#fff;border:1px solid #e5e7eb;border-radius:22px;padding:28px;box-shadow:0 15px 45px #0001}h1{margin:0 0 8px}.sub{color:#6b7280;margin-bottom:22px}label{display:block;font-weight:700;margin:14px 0 7px}input{width:100%;padding:14px;border:1px solid #d1d5db;border-radius:12px}button{margin-top:16px;padding:13px 18px;border:0;border-radius:12px;background:#111827;color:#fff;font-weight:700;cursor:pointer}.bar{height:10px;background:#e5e7eb;border-radius:9px;margin:20px 0;overflow:hidden}.fill{height:100%;width:0;background:#111827}.small{font-size:13px;color:#6b7280}.box{padding:14px;border-radius:12px;margin-top:16px}.ok{background:#ecfdf5;color:#065f46}.err{background:#fef2f2;color:#991b1b}pre{white-space:pre-wrap;background:#0b1220;color:#e5e7eb;padding:14px;border-radius:12px}.hide{display:none}</style><div class=wrap><div class=card><h1>AI Website Chatbot</h1><div class=sub>Enter the client website. The system crawls pages and public PDFs, builds the knowledge base, and generates the embed code.</div><label>Website URL</label><input id=u placeholder=https://example.com><label>Admin Key</label><input id=k type=password placeholder=ADMIN_KEY><button id=b>Build Chatbot</button><div id=s class=hide><div class=bar><div id=f class=fill></div></div><div id=t class=small></div></div><div id=r></div></div></div><script>const $=x=>document.getElementById(x);$('b').onclick=async()=>{let u=$('u').value.trim(),k=$('k').value.trim();if(!u||!k)return $('r').innerHTML='<div class="box err">URL and Admin Key are required.</div>';$('b').disabled=true;$('s').classList.remove('hide');try{let x=await fetch('/api/admin/build',{method:'POST',headers:{'Content-Type':'application/json','X-Admin-Key':k},body:JSON.stringify({url:u})}),d=await x.json();if(!x.ok)throw Error(d.error);poll(d.job_id,k)}catch(e){$('r').innerHTML='<div class="box err">'+e.message+'</div>';$('b').disabled=false}};async function poll(j,k){let x=await fetch('/api/admin/job/'+j+'?key='+encodeURIComponent(k)),d=await x.json();$('t').textContent=(d.stage||'working')+' · pages '+(d.pages_indexed||0)+' · PDFs '+(d.pdfs_found||0)+' · chunks '+(d.chunks_indexed||0);$('f').style.width=(d.status==='complete'?100:35)+'%';if(d.status==='running'||d.status==='pending')return setTimeout(()=>poll(j,k),1200);$('b').disabled=false;if(d.status==='error')return $('r').innerHTML='<div class="box err">'+(d.error||'Build failed')+'</div>';let code='<script src="'+location.origin+'/widget.js?bot_id='+d.bot_id+'" async><\\/script>';$('r').innerHTML='<div class="box ok"><b>Chatbot ready.</b><br>Pages: '+d.pages_indexed+' · PDFs: '+d.pdfs_found+' · chunks: '+d.chunks_indexed+'<br><br><b>Embed code:</b><pre>'+code.replaceAll('<','&lt;').replaceAll('>','&gt;')+'</pre><button onclick="navigator.clipboard.writeText('+JSON.stringify(code)+')">Copy</button> <button onclick="open(\\'/preview?bot_id='+d.bot_id+'\\',\\'_blank\\')">Preview</button></div>'}</script>"""
CHAT="""<!doctype html><meta charset=utf-8><meta name=viewport content=width=device-width,initial-scale=1><title>Website Assistant</title><style>*{box-sizing:border-box}html,body{margin:0;height:100%;font-family:system-ui}body{background:transparent}.app{height:100%;display:flex;flex-direction:column;background:#fff;border:1px solid #e5e7eb;border-radius:20px;overflow:hidden;box-shadow:0 18px 60px #0003}.head{padding:16px;background:#111827;color:#fff}.head b{font-size:15px}.head small{display:block;opacity:.7}.msgs{flex:1;overflow:auto;padding:16px;background:#f8fafc}.msg{max-width:88%;padding:11px 13px;border-radius:15px;margin-bottom:10px;line-height:1.5;font-size:14px;white-space:pre-wrap}.bot{background:#fff;border:1px solid #e5e7eb}.user{margin-left:auto;background:#111827;color:#fff}.sources{font-size:11px;margin-top:8px}.sources a{display:block;color:#6b7280;text-decoration:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.composer{display:flex;gap:8px;padding:11px;border-top:1px solid #e5e7eb}.composer textarea{flex:1;resize:none;border:1px solid #d1d5db;border-radius:12px;padding:10px;font:inherit}.composer button{width:55px;border:0;border-radius:12px;background:#111827;color:#fff}@media(max-width:520px){.app{border-radius:0}}</style><div class=app><div class=head><b>Website Assistant</b><small>Answers from this website</small></div><div id=m class=msgs><div style="color:#6b7280;font-size:13px;margin-bottom:12px">Hi! Ask me anything about the information available on this website.</div></div><div class=composer><textarea id=i placeholder="Ask a question..."></textarea><button id=s>Send</button></div></div><script>const bot={{BOT|tojson}},m=document.getElementById('m'),i=document.getElementById('i'),s=document.getElementById('s');let h=[];function add(x,c,src){let d=document.createElement('div');d.className='msg '+c;d.textContent=x;if(src&&src.length){let z=document.createElement('div');z.className='sources';src.slice(0,3).forEach(a=>{let l=document.createElement('a');l.href=a.url;l.target='_blank';l.rel='noopener';l.textContent='Source: '+(a.title||a.url);z.appendChild(l)});d.appendChild(z)}m.appendChild(d);m.scrollTop=m.scrollHeight}async function ask(){let q=i.value.trim();if(!q||s.disabled)return;i.value='';add(q,'user');s.disabled=true;add('Thinking...','bot');let typing=m.lastChild;try{let r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({bot_id:bot,question:q,history:h.slice(-6)})}),d=await r.json();typing.remove();if(!r.ok)throw Error(d.error);add(d.answer,'bot',d.sources);h.push({role:'user',content:q},{role:'assistant',content:d.answer})}catch(e){typing.remove();add(e.message,'bot')}s.disabled=false} s.onclick=ask;i.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();ask()}})</script>"""
WIDGET="""(function(){if(window.__AI_WEBSITE_CHATBOT__)return;window.__AI_WEBSITE_CHATBOT__=1;var s=document.currentScript,u=new URL(s.src,location.href),id=u.searchParams.get('bot_id');if(!id)return;var f=document.createElement('iframe');f.src=u.origin+'/widget?bot_id='+encodeURIComponent(id);f.title='Website Assistant';f.setAttribute('allow','clipboard-write');f.style.cssText='position:fixed;right:20px;bottom:20px;width:390px;height:650px;border:0;background:transparent;z-index:2147483647';document.documentElement.appendChild(f);function r(){var m=innerWidth<520;f.style.width=m?'100vw':'390px';f.style.height=m?'100vh':'650px';f.style.right=m?'0':'20px';f.style.bottom=m?'0':'20px'}r();addEventListener('resize',r)})();"""
@app.get('/')
def home():return render_template_string(ADMIN)
def admin_ok():return bool(ADMIN_KEY) and (request.headers.get('X-Admin-Key') or request.args.get('key',''))==ADMIN_KEY
@app.post('/api/admin/build')
def start_build():
    if not admin_ok():return jsonify(error='Unauthorized'),401
    u=norm((request.get_json(silent=True) or {}).get('url',''))
    if not u or private_host(host(u)):return jsonify(error='Invalid or private website URL.'),400
    bid='bot_'+uuid.uuid4().hex;jid='job_'+uuid.uuid4().hex
    bots.insert_one({'bot_id':bid,'root_url':u,'status':'building','created_at':now()});jobs.insert_one({'_id':jid,'job_id':jid,'bot_id':bid,'status':'pending','stage':'queued','created_at':now()})
    threading.Thread(target=build,args=(jid,bid,u),daemon=True).start();return jsonify(job_id=jid,bot_id=bid)
@app.get('/api/admin/job/<jid>')
def job(jid):
    if not admin_ok():return jsonify(error='Unauthorized'),401
    d=jobs.find_one({'_id':jid},{'_id':0});return (jsonify(d),200) if d else (jsonify(error='Job not found'),404)
@app.get('/widget.js')
def widget_js():return Response(WIDGET,mimetype='application/javascript')
@app.get('/widget')
def widget():
    bid=request.args.get('bot_id','')
    if not bots.find_one({'bot_id':bid}):return 'Bot not found',404
    return render_template_string(CHAT,BOT=bid)
@app.get('/preview')
def preview():
    bid=request.args.get('bot_id','')
    if not bots.find_one({'bot_id':bid}):return 'Bot not found',404
    return render_template_string(CHAT,BOT=bid)
@app.post('/api/chat')
def chat():
    d=request.get_json(silent=True) or {};bid=clean(d.get('bot_id',''));q=clean(d.get('question',''));h=d.get('history',[])
    if not bid or not q:return jsonify(error='Question is required.'),400
    if len(q)>2000:return jsonify(error='Question is too long.'),400
    try:
        b=bots.find_one({'bot_id':bid})
        if not b or b.get('status')!='ready':raise ValueError('Chatbot is not ready yet.')
        src=retrieve(bid,q)
        if not src:return jsonify(answer="I couldn't find that information on the website.",sources=[])
        response=ai.models.generate_content(model=CHAT_MODEL,contents=make_prompt(q,h,src),config=types.GenerateContentConfig(temperature=.15,max_output_tokens=700,candidate_count=1))
        answer=clean(response.text or '') or "I couldn't find that information on the website."
        seen=set();out=[]
        for x in src:
            if x['url'] in seen:continue
            seen.add(x['url']);out.append({'title':x['title'],'url':x['url'],'date_hint':x['date_hint']})
        return jsonify(answer=answer,sources=out)
    except Exception as e:
        print('CHAT ERROR',repr(e));return jsonify(error="Sorry, I couldn't process that right now. Please try again."),500
@app.get('/health')
def health():
    try:mongo.admin.command('ping');ok=True
    except:ok=False
    return jsonify(ok=ok,service='ai-website-chatbot',time=now()),200 if ok else 503
@app.after_request
def headers(r):
    r.headers['X-Content-Type-Options']='nosniff';r.headers['Referrer-Policy']='strict-origin-when-cross-origin';return r
if __name__=='__main__':app.run(host='0.0.0.0',port=int(os.getenv('PORT','10000')))
