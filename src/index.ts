import { MongoClient, Db } from "mongodb";

type Env = {
  MONGODB_URI: string;
  AI: any;
};

type Bot = {
  botId: string;
  siteUrl: string;
  host: string;
  title: string;
  status: string;
  pages: number;
  pdfs: number;
  chunks: number;
  createdAt: string;
  updatedAt: string;
};

type Job = {
  jobId: string;
  botId: string;
  seed: string;
  queue: string[];
  seen: string[];
  sitemaps: string[];
  sitemapSeen: string[];
  pdfs: string[];
  pages: number;
  chunks: number;
  errors: string[];
  done: boolean;
  createdAt: string;
  updatedAt: string;
};

type Chunk = {
  botId: string;
  url: string;
  title: string;
  text: string;
  updatedAt: string;
};

type Pdf = {
  botId: string;
  url: string;
  title: string;
  updatedAt: string;
};

const DB_NAME = "ai_website_chatbot";
const MODEL = "@cf/zai-org/glm-4.7-flash";
const USER_AGENT = "Gen-Solution-Bot/9.0";

const MAX_PAGES = 400;
const MAX_PDFS = 200;
const MAX_HTML = 5_000_000;
const MAX_XML = 2_000_000;
const MAX_QUEUE = 800;

let mongoClient: MongoClient | undefined;
let database: Db | undefined;

function now(): string {
  return new Date().toISOString();
}

function makeId(): string {
  return crypto.randomUUID();
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": "*"
    }
  });
}

function html(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function getDb(env: Env): Promise<Db> {
  if (!mongoClient) {
    mongoClient = new MongoClient(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      maxPoolSize: 5
    });

    await mongoClient.connect();
    database = mongoClient.db(DB_NAME);
  }

  return database!;
}

async function ensureIndexes(db: Db): Promise<void> {
  await Promise.all([
    db.collection("bots")
      .createIndex({ botId: 1 }, { unique: true })
      .catch(() => {}),

    db.collection("jobs")
      .createIndex({ jobId: 1 }, { unique: true })
      .catch(() => {}),

    db.collection("chunks")
      .createIndex({ botId: 1, text: "text" })
      .catch(() => {}),

    db.collection("chunks")
      .createIndex({ botId: 1, url: 1 })
      .catch(() => {}),

    db.collection("pdfs")
      .createIndex({ botId: 1, url: 1 }, { unique: true })
      .catch(() => {})
  ]);
}

/* ---------------- URL SECURITY ---------------- */

function cleanUrl(raw: string, base?: string): string | null {
  try {
    const u = new URL(raw, base);

    if (!/^https?:$/.test(u.protocol)) {
      return null;
    }

    u.hash = "";
    u.hostname = u.hostname.toLowerCase();

    if (u.pathname !== "/") {
      u.pathname = u.pathname.replace(/\/{2,}/g, "/");
    }

    return u.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

function getHost(url: string): string {
  return new URL(url).hostname.toLowerCase();
}

function sameHost(a: string, b: string): boolean {
  const hostA = getHost(a).replace(/^www\./, "");
  const hostB = getHost(b).replace(/^www\./, "");

  return hostA === hostB;
}

function isPrivateHost(hostname: string): boolean {
  return /^(localhost|127\.|0\.0\.0\.0|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[0-1])\.|::1|fc|fd)/i.test(
    hostname
  );
}

function isAllowedUrl(url: string, seed: string): boolean {
  try {
    const u = new URL(url);

    return (
      /^https?:$/.test(u.protocol) &&
      !isPrivateHost(u.hostname) &&
      sameHost(u.href, seed)
    );
  } catch {
    return false;
  }
}

/* ---------------- TEXT ---------------- */

function decodeHtml(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, n) =>
      String.fromCharCode(Number(n))
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, n) =>
      String.fromCharCode(parseInt(n, 16))
    );
}

function extractText(source: string): {
  title: string;
  text: string;
} {
  const title = decodeHtml(
    (
      source.match(
        /<title[^>]*>([\s\S]*?)<\/title>/i
      )?.[1] || ""
    ).replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 250);

  const cleaned = source
    .replace(
      /<(script|style|noscript|template|svg|canvas|iframe)[^>]*>[\s\S]*?<\/\1>/gi,
      " "
    )
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(
      /<(br|\/p|\/div|\/li|\/tr|\/h[1-6]|\/section|\/article|\/header|\/footer|\/nav|\/td|\/th)[^>]*>/gi,
      "\n"
    )
    .replace(/<[^>]+>/g, " ");

  const text = decodeHtml(cleaned)
    .replace(/[\t ]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return {
    title,
    text
  };
}

/* ---------------- LINKS ---------------- */

function isPdf(url: string): boolean {
  return /\.pdf(?:$|[?#])/i.test(url);
}

function isBinary(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|svg|ico|mp4|mp3|zip|rar|7z|doc|docx|xls|xlsx|ppt|pptx|css|js|woff2?|ttf)(?:$|[?#])/i.test(
    url
  );
}

function extractLinks(
  source: string,
  base: string,
  seed: string
): string[] {
  const found = new Set<string>();

  const regex =
    /<a\b[^>]*?href\s*=\s*["']([^"']+)["'][^>]*>/gi;

  let match: RegExpExecArray | null;

  while ((match = regex.exec(source))) {
    const raw = match[1].trim();

    if (
      /^(mailto:|tel:|javascript:|data:|#)/i.test(raw)
    ) {
      continue;
    }

    const url = cleanUrl(raw, base);

    if (
      url &&
      isAllowedUrl(url, seed) &&
      !isPdf(url) &&
      !isBinary(url)
    ) {
      found.add(url);
    }
  }

  return [...found];
}

function extractPdfLinks(
  source: string,
  base: string,
  seed: string
): string[] {
  const found = new Set<string>();

  const regex =
    /(?:href|data-href|data-url)\s*=\s*["']([^"']+)["']/gi;

  let match: RegExpExecArray | null;

  while ((match = regex.exec(source))) {
    const url = cleanUrl(match[1], base);

    if (
      url &&
      isAllowedUrl(url, seed) &&
      isPdf(url)
    ) {
      found.add(url);
    }
  }

  return [...found];
}

function pdfTitle(url: string): string {
  try {
    const filename =
      new URL(url).pathname.split("/").pop() ||
      "PDF Document";

    return decodeURIComponent(filename)
      .replace(/\.pdf$/i, "")
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 200);
  } catch {
    return "PDF Document";
  }
}

/* ---------------- CHUNKS ---------------- */

function makeChunks(text: string): string[] {
  const result: string[] = [];

  const size = 1800;
  const overlap = 250;

  let start = 0;

  while (start < text.length) {
    let end = Math.min(
      start + size,
      text.length
    );

    if (end < text.length) {
      const space = text.lastIndexOf(" ", end);
      const newline = text.lastIndexOf("\n", end);

      const cut = Math.max(space, newline);

      if (cut > start + 700) {
        end = cut;
      }
    }

    const value = text
      .slice(start, end)
      .trim();

    if (value.length > 60) {
      result.push(value);
    }

    if (end >= text.length) {
      break;
    }

    start = Math.max(
      end - overlap,
      start + 1
    );
  }

  return result;
}

/* ---------------- SEARCH SCORE ---------------- */

function tokenize(value: string): Set<string> {
  return new Set(
    (value.toLowerCase().match(
      /[a-z0-9@._+-]+/g
    ) || [])
      .filter((x) => x.length > 1)
  );
}

function relevance(
  question: string,
  text: string
): number {
  const q = tokenize(question);
  const t = tokenize(text);

  if (!q.size) {
    return 0;
  }

  let matched = 0;

  for (const token of q) {
    if (t.has(token)) {
      matched++;
    }
  }

  return matched / q.size;
}

/* ---------------- FETCH ---------------- */

async function fetchWebsite(
  url: string,
  seed: string,
  xml = false
): Promise<{
  url: string;
  text: string;
}> {
  if (!isAllowedUrl(url, seed)) {
    throw new Error("URL is outside the website domain.");
  }

  const controller = new AbortController();

  const timer = setTimeout(
    () => controller.abort(),
    xml ? 8000 : 15000
  );

  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": USER_AGENT,
        accept: xml
          ? "application/xml,text/xml,text/plain,*/*"
          : "text/html,application/xhtml+xml,text/plain,*/*"
      }
    });

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }

    const finalUrl = response.url || url;

    if (!isAllowedUrl(finalUrl, seed)) {
      throw new Error(
        "Website redirected outside the allowed domain."
      );
    }

    const contentType =
      response.headers.get("content-type") ||
      "";

    if (
      !xml &&
      contentType &&
      !contentType.includes("text/html") &&
      !contentType.includes("application/xhtml+xml") &&
      !contentType.includes("text/plain")
    ) {
      throw new Error(
        "URL did not return an HTML page."
      );
    }

    const max = xml
      ? MAX_XML
      : MAX_HTML;

    const length = Number(
      response.headers.get("content-length") || 0
    );

    if (length > max) {
      throw new Error(
        "Response is too large."
      );
    }

    const body = await response.text();

    if (body.length > max) {
      throw new Error(
        "Response is too large."
      );
    }

    return {
      url: finalUrl,
      text: body
    };
  } finally {
    clearTimeout(timer);
  }
}

/* ---------------- SITEMAP ---------------- */

function initialSitemaps(
  site: string
): string[] {
  return [
    "/sitemap.xml",
    "/wp-sitemap.xml",
    "/sitemap_index.xml"
  ].map(
    (path) => new URL(path, site).href
  );
}

function parseSitemap(
  source: string,
  seed: string
): {
  pages: string[];
  sitemaps: string[];
} {
  const pages = new Set<string>();
  const sitemaps = new Set<string>();

  for (const match of source.matchAll(
    /<loc>\s*([^<]+?)\s*<\/loc>/gi
  )) {
    const url = cleanUrl(
      match[1].trim()
    );

    if (!url || !sameHost(url, seed)) {
      continue;
    }

    if (/\.xml(?:$|[?#])/i.test(url)) {
      sitemaps.add(url);
      continue;
    }

    if (
      !isPdf(url) &&
      !isBinary(url)
    ) {
      pages.add(url);
    }
  }

  return {
    pages: [...pages],
    sitemaps: [...sitemaps]
  };
}

/* ---------------- CREATE JOB ---------------- */

async function createJob(
  env: Env,
  site: string
): Promise<{
  bot: Bot;
  job: Job;
}> {
  const db = await getDb(env);

  await ensureIndexes(db);

  const botId = makeId();
  const jobId = makeId();
  const timestamp = now();

  const bot: Bot = {
    botId,
    siteUrl: site,
    host: getHost(site),
    title: "Website Assistant",
    status: "building",
    pages: 0,
    pdfs: 0,
    chunks: 0,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  const job: Job = {
    jobId,
    botId,
    seed: site,
    queue: [site],
    seen: [],
    sitemaps: initialSitemaps(site),
    sitemapSeen: [],
    pdfs: [],
    pages: 0,
    chunks: 0,
    errors: [],
    done: false,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  await db
    .collection<Bot>("bots")
    .insertOne(bot);

  await db
    .collection<Job>("jobs")
    .insertOne(job);

  return {
    bot,
    job
  };
}

/* ---------------- ONE BUILD STEP ---------------- */

async function buildStep(
  env: Env,
  jobId: string
): Promise<Job> {
  const db = await getDb(env);

  const jobs =
    db.collection<Job>("jobs");

  const job =
    await jobs.findOne({ jobId });

  if (!job) {
    throw new Error("Job not found.");
  }

  if (job.done) {
    return job;
  }

  let worked = false;

  /*
   * FIRST PROCESS ONE SITEMAP.
   * This keeps every Worker invocation small.
   */
  if (job.sitemaps.length > 0) {
    const sitemap =
      job.sitemaps.shift()!;

    if (
      !job.sitemapSeen.includes(
        sitemap
      )
    ) {
      job.sitemapSeen.push(
        sitemap
      );

      try {
        const result =
          await fetchWebsite(
            sitemap,
            job.seed,
            true
          );

        const parsed =
          parseSitemap(
            result.text,
            job.seed
          );

        for (const url of parsed.pages) {
          if (
            job.queue.length >=
            MAX_QUEUE
          ) {
            break;
          }

          if (
            !job.seen.includes(url) &&
            !job.queue.includes(url)
          ) {
            job.queue.push(url);
          }
        }

        for (const url of parsed.sitemaps) {
          if (
            job.sitemaps.length >=
            20
          ) {
            break;
          }

          if (
            !job.sitemapSeen.includes(url) &&
            !job.sitemaps.includes(url)
          ) {
            job.sitemaps.push(url);
          }
        }
      } catch (error) {
        job.errors.push(
          `Sitemap ${sitemap}: ${
            error instanceof Error
              ? error.message
              : String(error)
          }`
        );
      }

      worked = true;
    }
  }

  /*
   * OTHERWISE CRAWL ONE HTML PAGE.
   */
  else if (
    job.queue.length > 0 &&
    job.pages < MAX_PAGES
  ) {
    let url =
      job.queue.shift()!;

    while (
      url &&
      (
        job.seen.includes(url) ||
        !isAllowedUrl(
          url,
          job.seed
        )
      )
    ) {
      url =
        job.queue.shift() || "";
    }

    if (url) {
      job.seen.push(url);

      try {
        const result =
          await fetchWebsite(
            url,
            job.seed,
            false
          );

        const parsed =
          extractText(
            result.text
          );

        /*
         * INTERNAL LINKS
         */
        const internalLinks =
          extractLinks(
            result.text,
            result.url,
            job.seed
          );

        for (const link of internalLinks) {
          if (
            job.queue.length >=
            MAX_QUEUE
          ) {
            break;
          }

          if (
            !job.seen.includes(link) &&
            !job.queue.includes(link)
          ) {
            job.queue.push(link);
          }
        }

        /*
         * PDF LINKS ONLY.
         * WE DO NOT DOWNLOAD OR READ PDF CONTENT.
         */
        const pdfLinks =
          extractPdfLinks(
            result.text,
            result.url,
            job.seed
          );

        const pdfCollection =
          db.collection<Pdf>("pdfs");

        for (const pdfUrl of pdfLinks) {
          if (
            !job.pdfs.includes(pdfUrl) &&
            job.pdfs.length <
              MAX_PDFS
          ) {
            job.pdfs.push(pdfUrl);
          }

          await pdfCollection.updateOne(
            {
              botId: job.botId,
              url: pdfUrl
            },
            {
              $set: {
                botId: job.botId,
                url: pdfUrl,
                title: pdfTitle(pdfUrl),
                updatedAt: now()
              }
            },
            {
              upsert: true
            }
          );
        }

        /*
         * SAVE HTML TEXT CHUNKS
         */
        const pieces =
          makeChunks(
            parsed.text
          );

        const chunksCollection =
          db.collection<Chunk>(
            "chunks"
          );

        await chunksCollection.deleteMany({
          botId: job.botId,
          url: result.url
        });

        if (pieces.length > 0) {
          await chunksCollection.insertMany(
            pieces.map((piece) => ({
              botId: job.botId,
              url: result.url,
              title:
                parsed.title ||
                result.url,
              text: piece,
              updatedAt: now()
            }))
          );
        }

        job.pages++;
        job.chunks += pieces.length;
      } catch (error) {
        job.errors.push(
          `${url}: ${
            error instanceof Error
              ? error.message
              : String(error)
          }`
        );
      }

      worked = true;
    }
  }

  /*
   * BUILD FINISHED
   */
  if (
    !worked ||
    job.pages >= MAX_PAGES ||
    (
      job.queue.length === 0 &&
      job.sitemaps.length === 0
    )
  ) {
    job.done = true;
  }

  job.updatedAt = now();

  await jobs.updateOne(
    { jobId },
    { $set: job }
  );

  await db
    .collection<Bot>("bots")
    .updateOne(
      { botId: job.botId },
      {
        $set: {
          status: job.done
            ? "ready"
            : "building",
          pages: job.pages,
          pdfs: job.pdfs.length,
          chunks: job.chunks,
          updatedAt: now()
        }
      }
    );

  return job;
}

/* ---------------- ADMIN PROGRESS PAGE ---------------- */

function progressPage(
  job: Job,
  origin: string
): string {
  if (job.done) {
    const embed =
      `<script src="${origin}/widget.js?bot=${encodeURIComponent(
        job.botId
      )}" defer></script>`;

    return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Build Complete</title>
<style>
body{
  margin:0;
  background:#f4f6fa;
  font-family:Arial,sans-serif;
  color:#111827;
}
.wrap{
  max-width:820px;
  margin:50px auto;
  padding:20px;
}
.card{
  background:#fff;
  padding:30px;
  border-radius:18px;
  box-shadow:0 10px 30px rgba(0,0,0,.08);
}
.success{
  padding:16px;
  background:#ecfdf5;
  border-radius:12px;
  margin:20px 0;
}
textarea{
  width:100%;
  min-height:100px;
  box-sizing:border-box;
  padding:14px;
  border:1px solid #d1d5db;
  border-radius:10px;
}
a{
  color:#2563eb;
}
</style>
</head>
<body>
<div class="wrap">
<div class="card">

<h1>Build Completed</h1>

<div class="success">
<strong>Website chatbot is ready.</strong>
</div>

<p><strong>Pages:</strong> ${job.pages}</p>
<p><strong>PDF links:</strong> ${job.pdfs.length}</p>
<p><strong>Knowledge chunks:</strong> ${job.chunks}</p>

<h3>Embed code</h3>

<textarea readonly>${escapeHtml(
      embed
    )}</textarea>

<p>
Bot ID:
<strong>${escapeHtml(
      job.botId
    )}</strong>
</p>

<h3>Errors / skipped pages</h3>

<pre>${escapeHtml(
      job.errors.length
        ? job.errors.join("\n")
        : "None"
    )}</pre>

</div>
</div>
</body>
</html>`;
  }

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="refresh" content="1;url=/admin/job/${encodeURIComponent(
    job.jobId
  )}">
<title>Building...</title>
<style>
body{
  margin:0;
  background:#f4f6fa;
  font-family:Arial,sans-serif;
  color:#111827;
}
.wrap{
  max-width:820px;
  margin:50px auto;
  padding:20px;
}
.card{
  background:#fff;
  padding:30px;
  border-radius:18px;
  box-shadow:0 10px 30px rgba(0,0,0,.08);
}
.progress{
  height:12px;
  background:#e5e7eb;
  border-radius:10px;
  overflow:hidden;
  margin:20px 0;
}
.bar{
  height:100%;
  width:35%;
  background:#111827;
  animation:move 1.2s infinite alternate;
}
@keyframes move{
  from{width:20%}
  to{width:80%}
}
</style>
</head>
<body>
<div class="wrap">
<div class="card">

<h1>Building Website Knowledge Base</h1>

<p>Your website is being crawled one step at a time.</p>

<div class="progress">
<div class="bar"></div>
</div>

<p><strong>Pages:</strong> ${job.pages} / ${MAX_PAGES}</p>
<p><strong>PDF links:</strong> ${job.pdfs.length}</p>
<p><strong>Knowledge chunks:</strong> ${job.chunks}</p>
<p><strong>Pages waiting:</strong> ${job.queue.length}</p>
<p><strong>Sitemaps waiting:</strong> ${job.sitemaps.length}</p>

<p>
This page automatically refreshes while the build continues.
</p>

</div>
</div>
</body>
</html>`;
}

/* ---------------- ADMIN HOME ---------------- */

function adminPage(
  origin: string
): string {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Gen-Solution AI Website Receptionist</title>

<style>
*{
  box-sizing:border-box;
}

body{
  margin:0;
  min-height:100vh;
  background:#f4f6fa;
  font-family:Arial,sans-serif;
  color:#111827;
}

.wrap{
  width:100%;
  max-width:850px;
  margin:60px auto;
  padding:20px;
}

.card{
  background:white;
  padding:32px;
  border-radius:20px;
  box-shadow:0 12px 40px rgba(0,0,0,.08);
}

h1{
  margin-top:0;
  font-size:32px;
}

p{
  line-height:1.5;
}

label{
  display:block;
  font-weight:700;
  margin-top:25px;
  margin-bottom:8px;
}

input{
  width:100%;
  padding:14px;
  border:1px solid #d1d5db;
  border-radius:10px;
  font-size:16px;
}

button{
  margin-top:18px;
  padding:14px 20px;
  border:0;
  border-radius:10px;
  background:#111827;
  color:white;
  font-size:15px;
  font-weight:700;
  cursor:pointer;
}

.note{
  margin-top:20px;
  padding:14px;
  background:#f3f4f6;
  border-radius:10px;
  font-size:13px;
}
</style>

</head>

<body>

<div class="wrap">

<div class="card">

<h1>AI Website Receptionist</h1>

<p>
Enter the client's public website URL.
The system will crawl the website and build its AI knowledge base.
</p>

<form action="/api/admin/build" method="POST">

<label for="site">
Website URL
</label>

<input
  id="site"
  name="url"
  type="text"
  placeholder="https://example.com/"
  required
  autocomplete="url"
/>

<button type="submit">
Crawl &amp; Build
</button>

</form>

<div class="note">
<strong>What this does:</strong><br>
HTML pages are indexed for the chatbot.
Official PDF links are detected and saved, but PDF files themselves are not downloaded or read.
</div>

</div>

</div>

</body>
</html>`;
}

/* ---------------- CHAT ---------------- */

async function answerQuestion(
  env: Env,
  botId: string,
  question: string
): Promise<{
  answer: string;
  sources: Array<{
    title: string;
    url: string;
    type: "page" | "pdf";
  }>;
}> {
  const db = await getDb(env);

  const bot =
    await db
      .collection<Bot>("bots")
      .findOne({ botId });

  if (!bot) {
    throw new Error(
      "Bot not found."
    );
  }

  if (bot.status !== "ready") {
    return {
      answer:
        "The website knowledge base is still being built. Please try again shortly.",
      sources: []
    };
  }

  const chunksCollection =
    db.collection<Chunk>("chunks");

  let chunksFound: Chunk[] = [];

  try {
    chunksFound =
      await chunksCollection
        .find({
          botId,
          $text: {
            $search: question
          }
        })
        .limit(40)
        .toArray();
  } catch {
    chunksFound =
      await chunksCollection
        .find({ botId })
        .limit(150)
        .toArray();
  }

  const ranked =
    chunksFound
      .map((item) => ({
        item,
        score: relevance(
          question,
          item.text
        )
      }))
      .filter(
        (item) => item.score > 0
      )
      .sort(
        (a, b) =>
          b.score - a.score
      )
      .slice(0, 8)
      .map(
        (item) => item.item
      );

  const pdfItems =
    await db
      .collection<Pdf>("pdfs")
      .find({ botId })
      .limit(MAX_PDFS)
      .toArray();

  const matchingPdfs =
    pdfItems
      .map((item) => ({
        item,
        score: relevance(
          question,
          `${item.title} ${item.url}`
        )
      }))
      .filter(
        (item) => item.score > 0
      )
      .sort(
        (a, b) =>
          b.score - a.score
      )
      .slice(0, 5)
      .map(
        (item) => item.item
      );

  if (
    ranked.length === 0 &&
    matchingPdfs.length === 0
  ) {
    return {
      answer:
        "I couldn't find that information on the website.",
      sources: []
    };
  }

  const websiteContext =
    ranked
      .map(
        (item, index) =>
          `[SOURCE ${index + 1}]
Title: ${item.title}
URL: ${item.url}
Content:
${item.text}`
      )
      .join("\n\n");

  const pdfContext =
    matchingPdfs.length
      ? matchingPdfs
          .map(
            (item) =>
              `[PDF]
Title: ${item.title}
URL: ${item.url}`
          )
          .join("\n\n")
      : "No matching PDF.";

  const prompt = `
You are the official AI assistant for a website.

Answer ONLY using the website information provided below.

STRICT RULES:

1. Never invent information.
2. Never use outside knowledge.
3. If the answer is not present, say exactly:
"I couldn't find that information on the website."
4. Preserve phone numbers, emails, addresses and timings exactly when available.
5. PDFs are link-only. You have NOT read the PDF content.
6. Never claim that you read or extracted a PDF.
7. If a PDF is relevant, provide its title and official URL.
8. If the user asks in English, answer in English.
9. If the user asks naturally in Roman Hindi/Hinglish, answer in Roman Hindi/Hinglish.
10. Do not use Devanagari Hindi.
11. Keep answers concise and useful.

WEBSITE INFORMATION:

${websiteContext}

PDF LINKS:

${pdfContext}

USER QUESTION:

${question}
`;

  const aiResult =
    await env.AI.run(
      MODEL,
      {
        messages: [
          {
            role: "system",
            content:
              "You are a strict website-grounded AI assistant."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 700
      }
    );

  let answer = "";

  if (
    aiResult &&
    typeof aiResult === "object"
  ) {
    answer =
      String(
        aiResult.response ??
        aiResult.result ??
        ""
      );
  } else {
    answer = String(
      aiResult ?? ""
    );
  }

  answer = answer.trim();

  if (!answer) {
    answer =
      "I couldn't find that information on the website.";
  }

  const sourceMap =
    new Map<
      string,
      {
        title: string;
        url: string;
        type: "page" | "pdf";
      }
    >();

  for (const item of ranked) {
    sourceMap.set(
      item.url,
      {
        title:
          item.title ||
          item.url,
        url: item.url,
        type: "page"
      }
    );
  }

  for (const item of matchingPdfs) {
    sourceMap.set(
      item.url,
      {
        title: item.title,
        url: item.url,
        type: "pdf"
      }
    );
  }

  return {
    answer,
    sources: [
      ...sourceMap.values()
    ].slice(0, 8)
  };
}

/* ---------------- WIDGET JS ---------------- */

function widgetScript(
  requestUrl: string
): string {
  const origin =
    new URL(requestUrl).origin;

  return `
(function(){

  var script = document.currentScript;

  if (!script) {
    return;
  }

  var botId =
    new URL(script.src).searchParams.get("bot");

  if (!botId) {
    return;
  }

  var iframe =
    document.createElement("iframe");

  iframe.src =
    ${JSON.stringify(origin)} +
    "/widget?bot=" +
    encodeURIComponent(botId);

  iframe.title =
    "AI Website Assistant";

  iframe.style.position =
    "fixed";

  iframe.style.right =
    "18px";

  iframe.style.bottom =
    "18px";

  iframe.style.width =
    "390px";

  iframe.style.height =
    "620px";

  iframe.style.maxWidth =
    "calc(100vw - 24px)";

  iframe.style.maxHeight =
    "calc(100vh - 24px)";

  iframe.style.border =
    "0";

  iframe.style.zIndex =
    "2147483647";

  iframe.style.borderRadius =
    "18px";

  iframe.style.background =
    "transparent";

  iframe.style.boxShadow =
    "0 15px 50px rgba(0,0,0,.18)";

  document.body.appendChild(
    iframe
  );

})();
`;
}

/* ---------------- WIDGET HTML ---------------- */

async function widgetPage(
  env: Env,
  botId: string
): Promise<Response> {
  const db =
    await getDb(env);

  const bot =
    await db
      .collection<Bot>("bots")
      .findOne({ botId });

  if (!bot) {
    return html(
      "Bot not found.",
      404
    );
  }

  return html(`
<!doctype html>

<html>

<head>

<meta charset="utf-8">

<meta
  name="viewport"
  content="width=device-width,initial-scale=1"
/>

<title>
${escapeHtml(
  bot.title ||
  "Website Assistant"
)}
</title>

<style>

*{
  box-sizing:border-box;
}

html,
body{
  margin:0;
  width:100%;
  height:100%;
  overflow:hidden;
  font-family:Arial,sans-serif;
}

.app{
  width:100%;
  height:100%;
  display:flex;
  flex-direction:column;
  background:white;
  border-radius:18px;
  overflow:hidden;
}

.header{
  background:#111827;
  color:white;
  padding:16px;
}

.title{
  font-weight:800;
}

.subtitle{
  margin-top:4px;
  font-size:12px;
  opacity:.7;
}

.messages{
  flex:1;
  overflow-y:auto;
  padding:14px;
  background:#f9fafb;
}

.message{
  max-width:88%;
  padding:11px 13px;
  border-radius:13px;
  margin-bottom:10px;
  font-size:14px;
  line-height:1.5;
  white-space:pre-wrap;
  overflow-wrap:anywhere;
}

.bot{
  background:white;
  border:1px solid #e5e7eb;
}

.user{
  margin-left:auto;
  background:#111827;
  color:white;
}

.source{
  display:block;
  margin-top:7px;
  font-size:12px;
  color:#2563eb;
  text-decoration:none;
}

.form{
  display:flex;
  gap:8px;
  padding:11px;
  border-top:1px solid #e5e7eb;
}

.input{
  flex:1;
  min-width:0;
  padding:11px;
  border:1px solid #d1d5db;
  border-radius:10px;
  outline:none;
}

.send{
  border:0;
  border-radius:10px;
  background:#111827;
  color:white;
  padding:0 15px;
  font-weight:700;
}

.send:disabled{
  opacity:.5;
}

</style>

</head>

<body>

<div class="app">

<div class="header">

<div class="title">
${escapeHtml(
  bot.title ||
  "Website Assistant"
)}
</div>

<div class="subtitle">
Ask questions about this website
</div>

</div>

<div
  id="messages"
  class="messages"
>

<div class="message bot">
Hi! How can I help you?
</div>

</div>

<form
  id="chatForm"
  class="form"
>

<input
  id="question"
  class="input"
  placeholder="Ask a question..."
  autocomplete="off"
/>

<button
  id="send"
  class="send"
  type="submit"
>
Send
</button>

</form>

</div>

<script>

(function(){

  var form =
    document.getElementById(
      "chatForm"
    );

  var input =
    document.getElementById(
      "question"
    );

  var messages =
    document.getElementById(
      "messages"
    );

  var send =
    document.getElementById(
      "send"
    );

  function addMessage(
    text,
    type,
    sources
  ){

    var message =
      document.createElement(
        "div"
      );

    message.className =
      "message " +
      type;

    message.textContent =
      text;

    if (sources) {

      sources.forEach(
        function(source){

          var link =
            document.createElement(
              "a"
            );

          link.className =
            "source";

          link.href =
            source.url;

          link.target =
            "_blank";

          link.rel =
            "noopener noreferrer";

          link.textContent =
            (
              source.type === "pdf"
                ? "PDF: "
                : "Source: "
            ) +
            source.title;

          message.appendChild(
            link
          );

        }
      );

    }

    messages.appendChild(
      message
    );

    messages.scrollTop =
      messages.scrollHeight;

    return message;
  }

  form.addEventListener(
    "submit",
    async function(event){

      event.preventDefault();

      var question =
        input.value.trim();

      if (!question) {
        return;
      }

      addMessage(
        question,
        "user"
      );

      input.value = "";

      send.disabled =
        true;

      var loading =
        addMessage(
          "Thinking...",
          "bot"
        );

      try {

        var response =
          await fetch(
            "/api/chat",
            {
              method:"POST",
              headers:{
                "content-type":
                  "application/json"
              },
              body:
                JSON.stringify({
                  botId:
                    ${JSON.stringify(
                      botId
                    )},
                  question:
                    question
                })
            }
          );

        var data =
          await response.json();

        loading.remove();

        addMessage(
          data.answer ||
          "I couldn't find that information on the website.",
          "bot",
          data.sources || []
        );

      } catch (error) {

        loading.textContent =
          "Sorry, something went wrong. Please try again.";

      } finally {

        send.disabled =
          false;

        input.focus();

      }

    }
  );

})();

</script>

</body>

</html>
`);
}

/* ---------------- REQUEST HANDLER ---------------- */

export default {
  async fetch(
    request: Request,
    env: Env
  ): Promise<Response> {

    const url =
      new URL(request.url);

    const path =
      url.pathname;

    /*
     * CORS
     */
    if (
      request.method ===
      "OPTIONS"
    ) {
      return new Response(
        null,
        {
          status: 204,
          headers: {
            "access-control-allow-origin":
              "*",
            "access-control-allow-methods":
              "GET,POST,OPTIONS",
            "access-control-allow-headers":
              "content-type"
          }
        }
      );
    }

    /*
     * HEALTH
     */
    if (path === "/health") {
      return json({
        ok: true,
        service:
          "gen-solution",
        time: now()
      });
    }

    /*
     * ADMIN HOME
     *
     * NO ADMIN KEY.
     */
    if (
      path === "/" &&
      request.method === "GET"
    ) {
      return html(
        adminPage(url.origin)
      );
    }

    /*
     * NATIVE HTML FORM BUILD
     *
     * THIS IS THE IMPORTANT PART.
     *
     * The browser submits the form directly.
     * No JavaScript click handler is needed.
     */
    if (
      path === "/api/admin/build" &&
      request.method === "POST"
    ) {
      try {

        const contentType =
          request.headers.get(
            "content-type"
          ) || "";

        let siteUrl = "";

        if (
          contentType.includes(
            "application/json"
          )
        ) {
          const body =
            await request.json() as {
              url?: string;
            };

          siteUrl =
            String(
              body.url || ""
            ).trim();

        } else {

          const form =
            await request.formData();

          siteUrl =
            String(
              form.get("url") || ""
            ).trim();
        }

        if (!siteUrl) {

          if (
            contentType.includes(
              "application/json"
            )
          ) {
            return json(
              {
                ok:false,
                error:
                  "Website URL is required."
              },
              400
            );
          }

          return html(
            "<h2>Website URL is required.</h2>",
            400
          );
        }

        const site =
          cleanUrl(siteUrl);

        if (!site) {

          if (
            contentType.includes(
              "application/json"
            )
          ) {
            return json(
              {
                ok:false,
                error:
                  "Invalid website URL."
              },
              400
            );
          }

          return html(
            "<h2>Invalid website URL.</h2>",
            400
          );
        }

        if (
          isPrivateHost(
            getHost(site)
          )
        ) {

          if (
            contentType.includes(
              "application/json"
            )
          ) {
            return json(
              {
                ok:false,
                error:
                  "Private/local URLs are not allowed."
              },
              400
            );
          }

          return html(
            "<h2>Private/local URLs are not allowed.</h2>",
            400
          );
        }

        const result =
          await createJob(
            env,
            site
          );

        /*
         * JSON callers get JSON.
         */
        if (
          contentType.includes(
            "application/json"
          )
        ) {
          return json({
            ok:true,
            jobId:
              result.job.jobId,
            botId:
              result.bot.botId
          });
        }

        /*
         * Browser form gets progress page.
         */
        return Response.redirect(
          `${url.origin}/admin/job/${encodeURIComponent(
            result.job.jobId
          )}`,
          303
        );

      } catch (error) {

        const message =
          error instanceof Error
            ? error.message
            : String(error);

        if (
          (
            request.headers.get(
              "content-type"
            ) || ""
          ).includes(
            "application/json"
          )
        ) {
          return json(
            {
              ok:false,
              error:message
            },
            500
          );
        }

        return html(
          `<h2>Build Error</h2><pre>${escapeHtml(
            message
          )}</pre>`,
          500
        );
      }
    }

    /*
     * ADMIN JOB PAGE
     *
     * Every page refresh performs ONE small step.
     *
     * No browser JavaScript required.
     */
    if (
      path.startsWith(
        "/admin/job/"
      ) &&
      request.method === "GET"
    ) {
      const jobId =
        decodeURIComponent(
          path.split("/").pop() || ""
        );

      try {

        const job =
          await buildStep(
            env,
            jobId
          );

        return html(
          progressPage(
            job,
            url.origin
          )
        );

      } catch (error) {

        return html(
          `<h2>Build Error</h2>
<pre>${escapeHtml(
            error instanceof Error
              ? error.message
              : String(error)
          )}</pre>`,
          500
        );
      }
    }

    /*
     * STATUS API
     *
     * Useful for external integrations.
     */
    if (
      path.startsWith(
        "/api/admin/job/"
      ) &&
      request.method === "GET"
    ) {
      try {

        const jobId =
          decodeURIComponent(
            path.split("/").pop() || ""
          );

        const db =
          await getDb(env);

        const job =
          await db
            .collection<Job>("jobs")
            .findOne({
              jobId
            });

        if (!job) {
          return json(
            {
              ok:false,
              error:
                "Job not found."
            },
            404
          );
        }

        return json({
          ok:true,
          job
        });

      } catch (error) {

        return json(
          {
            ok:false,
            error:
              error instanceof Error
                ? error.message
                : String(error)
          },
          500
        );
      }
    }

    /*
     * MANUAL ONE-STEP API
     */
    if (
      path.startsWith(
        "/api/admin/step/"
      ) &&
      request.method === "POST"
    ) {
      try {

        const jobId =
          decodeURIComponent(
            path.split("/").pop() || ""
          );

        const job =
          await buildStep(
            env,
            jobId
          );

        return json({
          ok:true,
          job
        });

      } catch (error) {

        return json(
          {
            ok:false,
            error:
              error instanceof Error
                ? error.message
                : String(error)
          },
          500
        );
      }
    }

    /*
     * WIDGET SCRIPT
     */
    if (
      path === "/widget.js"
    ) {
      return new Response(
        widgetScript(
          request.url
        ),
        {
          headers: {
            "content-type":
              "application/javascript; charset=utf-8",
            "cache-control":
              "public,max-age=300"
          }
        }
      );
    }

    /*
     * WIDGET
     */
    if (
      path === "/widget"
    ) {
      const botId =
        url.searchParams.get(
          "bot"
        );

      if (!botId) {
        return html(
          "Missing bot ID.",
          400
        );
      }

      try {
        return await widgetPage(
          env,
          botId
        );
      } catch (error) {
        return html(
          `Widget error: ${escapeHtml(
            error instanceof Error
              ? error.message
              : String(error)
          )}`,
          500
        );
      }
    }

    /*
     * CHAT API
     */
    if (
      path === "/api/chat" &&
      request.method === "POST"
    ) {
      try {

        const body =
          await request.json() as {
            botId?: string;
            question?: string;
          };

        const botId =
          String(
            body.botId || ""
          ).trim();

        const question =
          String(
            body.question || ""
          ).trim();

        if (
          !botId ||
          !question
        ) {
          return json(
            {
              ok:false,
              error:
                "botId and question are required."
            },
            400
          );
        }

        if (
          question.length > 1500
        ) {
          return json(
            {
              ok:false,
              error:
                "Question is too long."
            },
            400
          );
        }

        const result =
          await answerQuestion(
            env,
            botId,
            question
          );

        return json({
          ok:true,
          answer:
            result.answer,
          sources:
            result.sources
        });

      } catch (error) {

        return json(
          {
            ok:false,
            error:
              error instanceof Error
                ? error.message
                : String(error)
          },
          500
        );
      }
    }

    return new Response(
      "Not Found",
      {
        status:404
      }
    );
  }
};
