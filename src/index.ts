import { MongoClient, Db } from "mongodb";

type Env = {
  MONGODB_URI: string;
  ADMIN_KEY: string;
  PUBLIC_URL?: string;
  AI: any;
};

type Bot = {
  botId: string;
  siteUrl: string;
  host: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  pageCount: number;
  pdfCount: number;
  chunkCount: number;
  pdfLinks?: number;
};

type Chunk = {
  botId: string;
  url: string;
  title: string;
  text: string;
  kind: "page";
  updatedAt: string;
};

type PdfLink = {
  botId: string;
  url: string;
  title: string;
  updatedAt: string;
};

type Job = {
  jobId: string;
  botId: string;
  seed: string;
  queue: string[];
  visited: string[];
  pdfLinks: string[];
  pdfDone: string[];
  stage: string;
  pages: number;
  pdfs: number;
  chunks: number;
  errors: string[];
  createdAt: string;
  updatedAt: string;
  done: boolean;
  sitemapLoaded?: boolean;
};

const DB_NAME = "ai_website_chatbot";

const MAX_PAGES = 400;
const MAX_PDFS = 200;

const PAGE_BATCH = 1;

const MAX_CHUNK = 1800;
const OVERLAP = 250;

const MAX_HTML_BYTES = 5_000_000;

const MODEL = "@cf/zai-org/glm-4.7-flash";

const UA = "Gen-Solution-Bot/5.0";

let client: MongoClient | undefined;
let db: Db | undefined;

function now() {
  return new Date().toISOString();
}

function id() {
  return crypto.randomUUID();
}

function json(x: any, status = 200) {
  return new Response(JSON.stringify(x), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "content-type,x-admin-key"
    }
  });
}

function admin(req: Request, env: Env) {
  const key = req.headers.get("x-admin-key");
  const queryKey = new URL(req.url).searchParams.get("key");

  return (
    !!env.ADMIN_KEY &&
    (key === env.ADMIN_KEY || queryKey === env.ADMIN_KEY)
  );
}

async function mongo(uri: string) {
  if (!client) {
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 8000,
      maxPoolSize: 5
    });

    await client.connect();

    db = client.db(DB_NAME);
  }

  return db!;
}

function cleanUrl(raw: string, base?: string) {
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

function host(url: string) {
  return new URL(url).hostname.toLowerCase();
}

function sameHost(a: string, b: string) {
  const x = host(a);
  const y = host(b);

  return x === y;
}

function privateHost(h: string) {
  return /^(localhost|127\.|0\.0\.0\.0|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[0-1])\.|::1|fc|fd)/i.test(
    h
  );
}

function allowed(url: string, seed: string) {
  try {
    const u = new URL(url);

    return (
      /^https?:$/.test(u.protocol) &&
      !privateHost(u.hostname) &&
      sameHost(u.href, seed)
    );
  } catch {
    return false;
  }
}

function decode(s: string) {
  return s
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(
      /&#(\d+);/g,
      (_, n) => String.fromCharCode(Number(n))
    )
    .replace(
      /&#x([0-9a-f]+);/gi,
      (_, n) => String.fromCharCode(parseInt(n, 16))
    );
}

function stripHtml(html: string) {
  const title = decode(
    (
      html.match(
        /<title[^>]*>([\s\S]*?)<\/title>/i
      )?.[1] || ""
    ).replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 300);

  const cleaned = html
    .replace(
      /<(script|style|noscript|template|svg|canvas|iframe)[^>]*>[\s\S]*?<\/\1>/gi,
      " "
    )
    .replace(/<!--[\s\S]*?-->/g, " ");

  const withBreaks = cleaned.replace(
    /<(br|\/p|\/div|\/li|\/tr|\/h[1-6]|\/section|\/article|\/header|\/footer|\/nav|\/td|\/th)[^>]*>/gi,
    "\n"
  );

  const text = decode(
    withBreaks.replace(/<[^>]+>/g, " ")
  )
    .replace(/[\t ]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return {
    title,
    text
  };
}

function extractLinks(
  html: string,
  base: string,
  seed: string
) {
  const out = new Set<string>();

  const re =
    /<a\b[^>]*?href\s*=\s*["']([^"']+)["'][^>]*>/gi;

  let m: RegExpExecArray | null;

  while ((m = re.exec(html))) {
    const raw = m[1].trim();

    if (
      /^(mailto:|tel:|javascript:|data:|#)/i.test(
        raw
      )
    ) {
      continue;
    }

    const u = cleanUrl(raw, base);

    if (
      u &&
      allowed(u, seed) &&
      !isBinary(u) &&
      !isPdfUrl(u)
    ) {
      out.add(u);
    }
  }

  return [...out];
}

function extractPdfLinks(
  html: string,
  base: string,
  seed: string
) {
  const out = new Set<string>();

  const re =
    /(?:href|data-href|data-url)\s*=\s*["']([^"']+)["']/gi;

  let m: RegExpExecArray | null;

  while ((m = re.exec(html))) {
    const u = cleanUrl(m[1], base);

    if (
      u &&
      allowed(u, seed) &&
      isPdfUrl(u)
    ) {
      out.add(u);
    }
  }

  return [...out];
}

function isPdfUrl(u: string) {
  return /\.pdf(?:$|[?#])/i.test(u);
}

function isBinary(u: string) {
  return /\.(?:jpg|jpeg|png|gif|webp|svg|ico|mp4|mp3|zip|rar|7z|doc|docx|xls|xlsx|ppt|pptx|css|js|woff2?|ttf)(?:$|[?#])/i.test(
    u
  );
}

function pdfTitle(url: string) {
  try {
    const u = new URL(url);

    const name =
      decodeURIComponent(
        u.pathname.split("/").pop() || "PDF Document"
      );

    return name
      .replace(/\.pdf$/i, "")
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 200);
  } catch {
    return "PDF Document";
  }
}

function chunkText(text: string) {
  const out: string[] = [];

  let i = 0;

  while (i < text.length) {
    const end = Math.min(
      text.length,
      i + MAX_CHUNK
    );

    let cut = end;

    if (end < text.length) {
      const p = Math.max(
        text.lastIndexOf(" ", end),
        text.lastIndexOf("\n", end)
      );

      if (p > i + 800) {
        cut = p;
      }
    }

    const t = text.slice(i, cut).trim();

    if (t.length > 60) {
      out.push(t);
    }

    if (cut >= text.length) {
      break;
    }

    i = Math.max(
      cut - OVERLAP,
      i + 1
    );
  }

  return out;
}

function tokens(s: string) {
  return new Set(
    (
      s.toLowerCase().match(
        /[a-z0-9@._+-]+/g
      ) || []
    ).filter((x) => x.length > 1)
  );
}

function lexicalScore(
  q: string,
  t: string
) {
  const a = tokens(q);
  const b = tokens(t);

  if (!a.size || !b.size) {
    return 0;
  }

  let hit = 0;

  for (const x of a) {
    if (b.has(x)) {
      hit++;
    }
  }

  return hit / a.size;
}

async function fetchPage(
  url: string,
  seed: string
) {
  if (!allowed(url, seed)) {
    throw new Error("blocked URL");
  }

  const controller = new AbortController();

  const timer = setTimeout(
    () => controller.abort(),
    15000
  );

  try {
    const r = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": UA,
        accept:
          "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.1",
        "accept-language": "en-US,en;q=0.8"
      }
    });

    if (!r.ok) {
      throw new Error(`HTTP ${r.status}`);
    }

    if (!allowed(r.url || url, seed)) {
      throw new Error(
        "redirected outside website"
      );
    }

    return r;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchSmall(
  url: string
) {
  const controller = new AbortController();

  const timer = setTimeout(
    () => controller.abort(),
    8000
  );

  try {
    return await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": UA,
        accept: "text/plain,application/xml,text/xml,*/*;q=0.5"
      }
    });
  } finally {
    clearTimeout(timer);
  }
}

async function ensureIndexes(d: Db) {
  const chunks = d.collection("chunks");

  await chunks
    .createIndex({
      botId: 1,
      updatedAt: -1
    })
    .catch(() => {});

  await chunks
    .createIndex({
      botId: 1,
      text: "text"
    })
    .catch(() => {});

  await d
    .collection("pdfLinks")
    .createIndex(
      {
        botId: 1,
        url: 1
      },
      {
        unique: true
      }
    )
    .catch(() => {});

  await d
    .collection("bots")
    .createIndex(
      {
        botId: 1
      },
      {
        unique: true
      }
    )
    .catch(() => {});

  await d
    .collection("jobs")
    .createIndex(
      {
        jobId: 1
      },
      {
        unique: true
      }
    )
    .catch(() => {});
}

/*
  Bounded sitemap discovery.

  Important:
  Cloudflare Workers Free has a subrequest limit.
  Therefore we intentionally keep sitemap discovery bounded.
*/
async function sitemapUrls(
  seed: string
) {
  const candidates = [
    new URL(
      "/sitemap.xml",
      seed
    ).href,
    new URL(
      "/wp-sitemap.xml",
      seed
    ).href
  ];

  const discovered = new Set<string>();

  const queue = [
    ...candidates
  ];

  const seen = new Set<string>();

  const MAX_SITEMAP_FETCHES = 12;

  let fetchCount = 0;

  while (
    queue.length &&
    discovered.size < MAX_PAGES &&
    fetchCount < MAX_SITEMAP_FETCHES
  ) {
    const sitemap = queue.shift()!;

    if (seen.has(sitemap)) {
      continue;
    }

    seen.add(sitemap);

    try {
      const r = await fetchSmall(
        sitemap
      );

      fetchCount++;

      if (!r.ok) {
        continue;
      }

      const contentType =
        (
          r.headers.get(
            "content-type"
          ) || ""
        ).toLowerCase();

      const text =
        await r.text();

      /*
        Only process XML-ish sitemap responses.
      */
      if (
        !contentType.includes("xml") &&
        !/^\s*<[\s\S]*(urlset|sitemapindex)/i.test(
          text
        )
      ) {
        continue;
      }

      for (
        const x of text.matchAll(
          /<loc>\s*([^<]+?)\s*<\/loc>/gi
        )
      ) {
        const u = cleanUrl(
          x[1].trim()
        );

        if (
          !u ||
          !sameHost(u, seed)
        ) {
          continue;
        }

        if (
          /sitemap/i.test(u) &&
          /\.xml(?:$|[?#])/i.test(u)
        ) {
          if (
            !seen.has(u) &&
            queue.length < 20
          ) {
            queue.push(u);
          }

          continue;
        }

        if (isPdfUrl(u)) {
          continue;
        }

        discovered.add(u);

        if (
          discovered.size >=
          MAX_PAGES
        ) {
          break;
        }
      }
    } catch {
      continue;
    }
  }

  return [...discovered].slice(
    0,
    MAX_PAGES
  );
}

async function robotsSitemaps(
  seed: string
) {
  try {
    const u = new URL(
      "/robots.txt",
      seed
    );

    const r = await fetchSmall(
      u.href
    );

    if (!r.ok) {
      return [];
    }

    const t =
      await r.text();

    return t
      .split(/\r?\n/)
      .filter((x) =>
        /^\s*sitemap\s*:/i.test(x)
      )
      .map((x) =>
        cleanUrl(
          x.replace(
            /^\s*sitemap\s*:/i,
            ""
          )
        )
      )
      .filter(
        (
          x
        ): x is string =>
          !!x &&
          sameHost(x, seed)
      )
      .slice(0, 10);
  } catch {
    return [];
  }
}

async function savePdfLinks(
  d: Db,
  botId: string,
  urls: string[]
) {
  if (!urls.length) {
    return;
  }

  const unique = [
    ...new Set(urls)
  ].slice(0, MAX_PDFS);

  if (!unique.length) {
    return;
  }

  await d
    .collection<PdfLink>(
      "pdfLinks"
    )
    .bulkWrite(
      unique.map((url) => ({
        updateOne: {
          filter: {
            botId,
            url
          },
          update: {
            $set: {
              botId,
              url,
              title: pdfTitle(url),
              updatedAt: now()
            }
          },
          upsert: true
        }
      })),
      {
        ordered: false
      }
    )
    .catch(() => {});
}

async function seedJob(
  d: Db,
  seed: string,
  botId: string
) {
  const u = new URL(seed);

  const bot: Bot = {
    botId,
    siteUrl: seed,
    host: u.hostname,
    title: "",
    createdAt: now(),
    updatedAt: now(),
    status: "building",
    pageCount: 0,
    pdfCount: 0,
    chunkCount: 0,
    pdfLinks: 0
  };

  await d
    .collection<Bot>("bots")
    .updateOne(
      {
        botId
      },
      {
        $set: bot
      },
      {
        upsert: true
      }
    );

  await d
    .collection("chunks")
    .deleteMany({
      botId
    });

  await d
    .collection("pdfLinks")
    .deleteMany({
      botId
    });

  const job: Job = {
    jobId: id(),
    botId,
    seed,
    queue: [seed],
    visited: [],
    pdfLinks: [],
    pdfDone: [],
    stage: "crawling",
    pages: 0,
    pdfs: 0,
    chunks: 0,
    errors: [],
    createdAt: now(),
    updatedAt: now(),
    done: false,
    sitemapLoaded: false
  };

  await d
    .collection<Job>("jobs")
    .insertOne(job);

  return job;
}

async function crawlStep(
  job: Job,
  d: Db
) {
  /*
    Process exactly one page per call.
    This is intentional for Cloudflare Worker stability.
  */

  const urls =
    job.queue.splice(
      0,
      PAGE_BATCH
    );

  if (!urls.length) {
    job.stage = "done";
    job.updatedAt = now();

    await d
      .collection("jobs")
      .updateOne(
        {
          jobId: job.jobId
        },
        {
          $set: job
        }
      );

    return;
  }

  for (const url of urls) {
    if (
      job.visited.includes(url)
    ) {
      continue;
    }

    job.visited.push(url);

    try {
      const r =
        await fetchPage(
          url,
          job.seed
        );

      const finalUrl =
        r.url || url;

      const contentType =
        (
          r.headers.get(
            "content-type"
          ) || ""
        ).toLowerCase();

      /*
        PDFs are NOT downloaded/read.
        We only store their official URL.
      */
      if (
        isPdfUrl(url) ||
        contentType.includes(
          "application/pdf"
        )
      ) {
        if (
          !job.pdfLinks.includes(
            finalUrl
          ) &&
          job.pdfLinks.length <
            MAX_PDFS
        ) {
          job.pdfLinks.push(
            finalUrl
          );

          await savePdfLinks(
            d,
            job.botId,
            [finalUrl]
          );
        }

        continue;
      }

      const contentLength =
        Number(
          r.headers.get(
            "content-length"
          ) || 0
        );

      if (
        contentLength >
        MAX_HTML_BYTES
      ) {
        throw new Error(
          "HTML page too large"
        );
      }

      const raw =
        await r.text();

      if (
        raw.length >
        MAX_HTML_BYTES
      ) {
        throw new Error(
          "HTML page too large"
        );
      }

      const htmlish =
        contentType.includes(
          "html"
        ) ||
        contentType.includes(
          "text/plain"
        ) ||
        /<(?:html|body|main|article|nav|header)\b/i.test(
          raw.slice(
            0,
            50000
          )
        );

      if (!htmlish) {
        continue;
      }

      const {
        title,
        text
      } = stripHtml(raw);

      const parts =
        chunkText(text);

      if (parts.length) {
        await d
          .collection<Chunk>(
            "chunks"
          )
          .insertMany(
            parts.map(
              (p) => ({
                botId:
                  job.botId,
                url:
                  finalUrl,
                title,
                text: p,
                kind: "page" as const,
                updatedAt: now()
              })
            )
          );

        job.chunks +=
          parts.length;

        job.pages++;

        await d
          .collection<Bot>(
            "bots"
          )
          .updateOne(
            {
              botId:
                job.botId
            },
            {
              $set: {
                title:
                  title ||
                  undefined,
                updatedAt:
                  now()
              },
              $inc: {
                pageCount: 1,
                chunkCount:
                  parts.length
              }
            }
          );
      }

      /*
        Find PDF links in HTML.
        We DO NOT fetch the PDFs.
      */
      const pagePdfs =
        extractPdfLinks(
          raw,
          finalUrl,
          job.seed
        );

      const newPdfs =
        pagePdfs.filter(
          (p) =>
            !job.pdfLinks.includes(
              p
            )
        );

      for (const p of newPdfs) {
        if (
          job.pdfLinks.length >=
          MAX_PDFS
        ) {
          break;
        }

        job.pdfLinks.push(p);
      }

      if (newPdfs.length) {
        await savePdfLinks(
          d,
          job.botId,
          job.pdfLinks
        );
      }

      /*
        Find normal internal links.
      */
      const found =
        extractLinks(
          raw,
          finalUrl,
          job.seed
        );

      const queued =
        new Set([
          ...job.queue,
          ...job.visited
        ]);

      for (const u of found) {
        if (
          queued.has(u)
        ) {
          continue;
        }

        if (
          job.queue.length >=
          MAX_PAGES * 2
        ) {
          break;
        }

        job.queue.push(u);
        queued.add(u);
      }
    } catch (e) {
      if (
        job.errors.length <
        50
      ) {
        job.errors.push(
          `${url}: ${String(e).slice(
            0,
            220
          )}`
        );
      }
    }
  }

  /*
    Load sitemap only once.
    Bounded to keep Worker subrequests safe.
  */
  if (
    !job.sitemapLoaded
  ) {
    job.sitemapLoaded =
      true;

    const robots =
      await robotsSitemaps(
        job.seed
      );

    const sitemap =
      await sitemapUrls(
        job.seed
      );

    const allSitemapUrls = [
      ...robots,
      ...sitemap
    ];

    const seen =
      new Set([
        ...job.queue,
        ...job.visited
      ]);

    for (
      const u of allSitemapUrls
    ) {
      if (
        seen.has(u)
      ) {
        continue;
      }

      if (
        job.queue.length >=
        MAX_PAGES * 2
      ) {
        break;
      }

      job.queue.push(u);
      seen.add(u);
    }
  }

  job.pdfLinks = [
    ...new Set(
      job.pdfLinks
    )
  ].slice(
    0,
    MAX_PDFS
  );

  await savePdfLinks(
    d,
    job.botId,
    job.pdfLinks
  );

  if (
    job.queue.length === 0
  ) {
    job.stage = "done";
  }

  job.updatedAt = now();

  await d
    .collection<Job>("jobs")
    .updateOne(
      {
        jobId: job.jobId
      },
      {
        $set: job
      }
    );

  await d
    .collection<Bot>("bots")
    .updateOne(
      {
        botId: job.botId
      },
      {
        $set: {
          pdfLinks:
            job.pdfLinks.length,
          updatedAt: now()
        }
      }
    );
}

async function finalize(
  job: Job,
  d: Db
) {
  job.done = true;
  job.stage = "done";
  job.updatedAt = now();

  await savePdfLinks(
    d,
    job.botId,
    job.pdfLinks
  );

  await d
    .collection<Job>("jobs")
    .updateOne(
      {
        jobId: job.jobId
      },
      {
        $set: job
      }
    );

  await d
    .collection<Bot>("bots")
    .updateOne(
      {
        botId: job.botId
      },
      {
        $set: {
          status:
            job.pages ||
            job.chunks
              ? "ready"
              : "failed",
          updatedAt: now(),
          pageCount:
            job.pages,
          pdfCount: 0,
          chunkCount:
            job.chunks,
          pdfLinks:
            job.pdfLinks.length
        }
      }
    );
}

async function buildStep(
  env: Env,
  jobId: string
) {
  const d =
    await mongo(
      env.MONGODB_URI
    );

  await ensureIndexes(d);

  const job =
    await d
      .collection<Job>("jobs")
      .findOne({
        jobId
      });

  if (!job || job.done) {
    return job;
  }

  if (
    job.stage ===
    "crawling"
  ) {
    await crawlStep(
      job,
      d
    );
  }

  if (
    job.stage === "done" &&
    !job.done
  ) {
    await finalize(
      job,
      d
    );
  }

  return job;
}

function pdfMatches(
  question: string,
  pdf: PdfLink
) {
  const title =
    `${pdf.title} ${pdf.url}`;

  return lexicalScore(
    question,
    title
  );
}

async function answer(
  env: Env,
  botId: string,
  q: string
) {
  const d =
    await mongo(
      env.MONGODB_URI
    );

  await ensureIndexes(d);

  const chunks =
    d.collection<Chunk>(
      "chunks"
    );

  let candidates: any[] =
    [];

  try {
    candidates =
      await chunks
        .find(
          {
            botId,
            $text: {
              $search: q
            }
          },
          {
            projection: {
              _id: 0
            }
          }
        )
        .sort({
          score: {
            $meta:
              "textScore"
          }
        })
        .limit(40)
        .toArray();
  } catch {
    candidates =
      await chunks
        .find(
          {
            botId
          },
          {
            projection: {
              _id: 0
            }
          }
        )
        .limit(200)
        .toArray();
  }

  candidates =
    candidates
      .map((x) => ({
        ...x,
        _score:
          lexicalScore(
            q,
            x.text
          )
      }))
      .sort(
        (a, b) =>
          b._score -
          a._score
      )
      .slice(0, 8);

  /*
    Also search PDF metadata.
    PDF contents are never extracted.
  */
  const pdfs =
    await d
      .collection<PdfLink>(
        "pdfLinks"
      )
      .find({
        botId
      })
      .limit(MAX_PDFS)
      .toArray()
      .catch(
        () => []
      );

  const relevantPdfs =
    pdfs
      .map((pdf) => ({
        pdf,
        score:
          pdfMatches(
            q,
            pdf
          )
      }))
      .filter(
        (x) =>
          x.score >= 0.25
      )
      .sort(
        (a, b) =>
          b.score -
          a.score
      )
      .slice(0, 5);

  const bestChunkScore =
    candidates.length
      ? candidates[0]._score
      : 0;

  /*
    If neither website content nor PDF metadata
    matches the question, refuse to guess.
  */
  if (
    bestChunkScore <
      0.08 &&
    relevantPdfs.length === 0
  ) {
    return {
      answer:
        "I couldn't find that information on the website.",
      sources: []
    };
  }

  const contextParts =
    candidates.map(
      (x, i) =>
        `SOURCE ${i + 1}
URL: ${x.url}
CONTENT:
${x.text}`
    );

  if (
    relevantPdfs.length
  ) {
    for (
      const item of relevantPdfs
    ) {
      contextParts.push(
        `OFFICIAL PDF LINK
TITLE: ${item.pdf.title}
URL: ${item.pdf.url}
NOTE: Only the PDF title and official URL are available. The PDF contents were not extracted.`
      );
    }
  }

  const context =
    contextParts.join(
      "\n\n"
    );

  const system = `
You are the AI receptionist for the website represented by the supplied sources.

Answer ONLY from the supplied website sources.

Never use outside knowledge.

Never invent:
- facts
- dates
- fees
- eligibility
- names
- phone numbers
- emails
- policies
- timings
- availability
- course information
- admission information

If the answer is not supported by the supplied website sources, say exactly:

"I couldn't find that information on the website."

If the user writes natural Roman Hinglish, reply in natural Roman Hinglish.

Otherwise reply in English.

Be concise and helpful.

If a relevant official PDF/document link is supplied but its contents were not extracted, clearly tell the user that the official document can be opened/downloaded using the provided source link. Do not claim anything about the document's contents.

Never pretend that you read a PDF when only its title and URL are available.
`;

  const res =
    await env.AI.run(
      MODEL,
      {
        messages: [
          {
            role: "system",
            content:
              system
          },
          {
            role: "user",
            content:
              `WEBSITE SOURCES:

${context}

USER QUESTION:
${q}`
          }
        ],
        max_tokens: 500,
        temperature: 0.1
      }
    );

  const text =
    typeof res === "string"
      ? res
      : res?.response ||
        res?.result
          ?.response ||
        "";

  const sourcesMap =
    new Map<
      string,
      {
        url: string;
        title: string;
      }
    >();

  for (
    const x of candidates
  ) {
    if (
      !sourcesMap.has(
        x.url
      )
    ) {
      sourcesMap.set(
        x.url,
        {
          url: x.url,
          title:
            x.title ||
            "Source"
        }
      );
    }
  }

  for (
    const item of relevantPdfs
  ) {
    if (
      !sourcesMap.has(
        item.pdf.url
      )
    ) {
      sourcesMap.set(
        item.pdf.url,
        {
          url:
            item.pdf.url,
          title:
            item.pdf.title ||
            "PDF Document"
        }
      );
    }
  }

  return {
    answer:
      text ||
      "I couldn't find that information on the website.",
    sources: [
      ...sourcesMap.values()
    ].slice(0, 5)
  };
}

function adminHtml() {
  return `<!doctype html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Gen Solution</title>

<style>
body{
  font-family:Inter,Arial,sans-serif;
  background:#f5f7fb;
  margin:0;
  color:#111827
}

.wrap{
  max-width:900px;
  margin:50px auto;
  padding:24px
}

.card{
  background:#fff;
  border-radius:18px;
  padding:28px;
  box-shadow:0 8px 35px #0001
}

input,button{
  width:100%;
  box-sizing:border-box;
  padding:13px;
  border-radius:10px;
  border:1px solid #d1d5db;
  font-size:15px
}

button{
  margin-top:12px;
  background:#111827;
  color:#fff;
  border:0;
  cursor:pointer
}

button:disabled{
  opacity:.6;
  cursor:not-allowed
}

.status{
  margin-top:18px;
  padding:15px;
  background:#f3f4f6;
  border-radius:10px;
  white-space:pre-wrap;
  overflow:auto;
  min-height:40px
}
</style>
</head>

<body>

<div class="wrap">
<div class="card">

<h1>Gen Solution</h1>

<p>
Build a website-only AI receptionist.
</p>

<input
  id="url"
  placeholder="https://example.com"
  autocomplete="url"
>

<input
  id="key"
  placeholder="Admin key"
  type="password"
  style="margin-top:10px"
  autocomplete="off"
>

<button
  id="buildBtn"
  type="button"
>
Crawl & Build
</button>

<div
  id="s"
  class="status"
>
Ready.
</div>

</div>
</div>

<script>
(function(){

const urlInput =
  document.getElementById("url");

const keyInput =
  document.getElementById("key");

const button =
  document.getElementById("buildBtn");

const status =
  document.getElementById("s");

let timer = null;

function show(text){
  status.textContent = text;
}

async function startBuild(){

  const website =
    urlInput.value.trim();

  const key =
    keyInput.value;

  if(!website){
    show(
      "Please enter a website URL."
    );

    urlInput.focus();

    return;
  }

  if(!key){
    show(
      "Please enter the Admin Key."
    );

    keyInput.focus();

    return;
  }

  if(timer){
    clearInterval(timer);
    timer = null;
  }

  button.disabled = true;
  button.textContent =
    "Starting...";

  show(
    "Starting build..."
  );

  try{

    const response =
      await fetch(
        "/api/admin/build",
        {
          method:"POST",

          headers:{
            "content-type":
              "application/json",

            "x-admin-key":
              key
          },

          body:JSON.stringify({
            url:website
          })
        }
      );

    const text =
      await response.text();

    let data;

    try{
      data =
        JSON.parse(text);
    }catch{
      throw new Error(
        "Server returned an invalid response: " +
        text.slice(0,300)
      );
    }

    if(!response.ok){
      throw new Error(
        data.error ||
        "Build request failed. HTTP " +
        response.status
      );
    }

    if(!data.jobId){
      throw new Error(
        "Server did not return a jobId."
      );
    }

    show(
      "Build started.\\n\\n" +
      "Job ID: " +
      data.jobId +
      "\\n\\n" +
      "Crawling website..."
    );

    button.textContent =
      "Crawling...";

    await checkJob(
      data.jobId,
      key
    );

    timer =
      setInterval(
        async function(){

          try{

            const finished =
              await checkJob(
                data.jobId,
                key
              );

            if(finished){

              clearInterval(
                timer
              );

              timer = null;

              button.disabled =
                false;

              button.textContent =
                "Crawl & Build";
            }

          }catch(error){

            clearInterval(
              timer
            );

            timer = null;

            show(
              "Error while checking build:\\n\\n" +
              (
                error.message ||
                String(error)
              )
            );

            button.disabled =
              false;

            button.textContent =
              "Crawl & Build";
          }

        },
        1500
      );

  }catch(error){

    show(
      "Build Error:\\n\\n" +
      (
        error.message ||
        String(error)
      )
    );

    button.disabled =
      false;

    button.textContent =
      "Crawl & Build";
  }
}

async function checkJob(
  jobId,
  key
){

  const response =
    await fetch(
      "/api/admin/job/" +
      encodeURIComponent(
        jobId
      ),
      {
        method:"GET",

        headers:{
          "x-admin-key":
            key
        },

        cache:"no-store"
      }
    );

  const text =
    await response.text();

  let data;

  try{
    data =
      JSON.parse(text);
  }catch{
    throw new Error(
      "Invalid job response: " +
      text.slice(0,300)
    );
  }

  if(!response.ok){
    throw new Error(
      data.error ||
      "Job request failed. HTTP " +
      response.status
    );
  }

  show(
    JSON.stringify(
      data,
      null,
      2
    )
  );

  if(data.done){

    if(data.embedScript){

      show(
        "BUILD COMPLETE ✅\\n\\n" +
        JSON.stringify(
          data,
          null,
          2
        ) +
        "\\n\\n" +
        "EMBED SCRIPT:\\n\\n" +
        data.embedScript
      );

    }else{

      show(
        "BUILD FINISHED\\n\\n" +
        JSON.stringify(
          data,
          null,
          2
        )
      );
    }

    return true;
  }

  return false;
}

button.addEventListener(
  "click",
  startBuild
);

})();
</script>

</body>
</html>`;
}

function widgetJs(
  publicUrl: string
) {
  return `(()=>{

const s =
  document.currentScript;

const u =
  new URL(s.src);

const id =
  u.searchParams.get(
    'bot_id'
  ) || '';

const f =
  document.createElement(
    'iframe'
  );

f.src =
  ${JSON.stringify(
    publicUrl
  )} +
  '/widget?bot_id=' +
  encodeURIComponent(id);

Object.assign(
  f.style,
  {
    position:'fixed',
    right:'18px',
    bottom:'18px',
    width:'390px',
    height:'650px',
    maxWidth:'calc(100vw - 24px)',
    maxHeight:'calc(100vh - 24px)',
    border:'0',
    borderRadius:'18px',
    boxShadow:'0 10px 40px #0003',
    zIndex:'2147483647',
    background:'transparent'
  }
);

f.title =
  'AI Website Assistant';

document.body.appendChild(f);

})();`;
}

function widgetPage(
  botId: string
) {
  return `<!doctype html>
<html>

<head>

<meta
  name="viewport"
  content="width=device-width,initial-scale=1"
>

<style>

*{
  box-sizing:border-box
}

body{
  margin:0;
  font-family:Inter,Arial,sans-serif;
  background:transparent
}

.box{
  height:100vh;
  background:#fff;
  border-radius:18px;
  display:flex;
  flex-direction:column;
  overflow:hidden;
  box-shadow:0 8px 35px #0002
}

.head{
  padding:15px 17px;
  background:#111827;
  color:#fff;
  font-weight:700
}

.sub{
  font-size:11px;
  opacity:.7;
  font-weight:400;
  margin-top:3px
}

.msgs{
  flex:1;
  overflow:auto;
  padding:14px;
  background:#f8fafc
}

.m{
  max-width:85%;
  padding:10px 12px;
  border-radius:13px;
  margin:7px 0;
  line-height:1.45;
  font-size:14px;
  white-space:pre-wrap
}

.a{
  background:#fff;
  border:1px solid #e5e7eb
}

.u{
  background:#111827;
  color:#fff;
  margin-left:auto
}

.foot{
  padding:10px;
  border-top:1px solid #e5e7eb;
  display:flex;
  gap:7px
}

.foot input{
  flex:1;
  padding:11px;
  border:1px solid #d1d5db;
  border-radius:10px;
  outline:0
}

.foot button{
  width:70px;
  border:0;
  border-radius:10px;
  background:#111827;
  color:#fff
}

.src{
  font-size:11px;
  margin-top:7px
}

.src a{
  color:#2563eb
}

</style>

</head>

<body>

<div class="box">

<div class="head">
AI Website Assistant

<div class="sub">
Ask about this website
</div>

</div>

<div
  id="m"
  class="msgs"
>

<div class="m a">
Hi! How can I help you?
</div>

</div>

<form
  id="f"
  class="foot"
>

<input
  id="q"
  autocomplete="off"
  placeholder="Ask a question..."
>

<button>
Send
</button>

</form>

</div>

<script>

const bot =
  ${JSON.stringify(botId)};

const m =
  document.getElementById(
    'm'
  );

const q =
  document.getElementById(
    'q'
  );

document.getElementById(
  'f'
).onsubmit = async e => {

  e.preventDefault();

  const v =
    q.value.trim();

  if(!v){
    return;
  }

  add(
    v,
    'u'
  );

  q.value = '';

  const t =
    add(
      'Thinking...',
      'a'
    );

  try{

    const r =
      await fetch(
        '/api/chat',
        {
          method:'POST',

          headers:{
            'content-type':
              'application/json'
          },

          body:JSON.stringify({
            botId:bot,
            question:v
          })
        }
      );

    const j =
      await r.json();

    t.remove();

    if(!r.ok){

      add(
        j.error ||
        'I could not process that right now.',
        'a'
      );

      return;
    }

    add(
      j.answer ||
      'I could not process that right now.',
      'a',
      j.sources
    );

  }catch{

    t.remove();

    add(
      'I could not process that right now. Please try again.',
      'a'
    );
  }
};

function add(
  x,
  c,
  sources
){

  const d =
    document.createElement(
      'div'
    );

  d.className =
    'm ' + c;

  d.textContent =
    x;

  if(
    sources &&
    sources.length
  ){

    const z =
      document.createElement(
        'div'
      );

    z.className =
      'src';

    sources.forEach(
      a => {

        const l =
          document.createElement(
            'a'
          );

        l.href =
          a.url;

        l.target =
          '_blank';

        l.rel =
          'noopener';

        l.textContent =
          a.title ||
          'Source';

        z.appendChild(l);

        z.appendChild(
          document.createTextNode(
            ' · '
          )
        );
      }
    );

    d.appendChild(z);
  }

  m.appendChild(d);

  m.scrollTop =
    m.scrollHeight;

  return d;
}

</script>

</body>

</html>`;
}

export default {

  async fetch(
    req: Request,
    env: Env
  ) {

    try {

      const u =
        new URL(req.url);

      /*
        CORS preflight
      */
      if (
        req.method ===
        "OPTIONS"
      ) {

        return new Response(
          null,
          {
            headers:{
              "access-control-allow-origin":
                "*",

              "access-control-allow-headers":
                "content-type,x-admin-key",

              "access-control-allow-methods":
                "GET,POST,OPTIONS"
            }
          }
        );
      }

      /*
        Health check
      */
      if (
        u.pathname ===
        "/health"
      ) {

        return json({
          ok:true,
          service:
            "gen-solution",
          version:"5.1",
          time:now()
        });
      }

      /*
        Admin page
      */
      if (
        u.pathname ===
          "/" &&
        req.method ===
          "GET"
      ) {

        return new Response(
          adminHtml(),
          {
            headers:{
              "content-type":
                "text/html;charset=utf-8"
            }
          }
        );
      }

      /*
        Widget JavaScript
      */
      if (
        u.pathname ===
        "/widget.js"
      ) {

        return new Response(
          widgetJs(
            env.PUBLIC_URL ||
              u.origin
          ),
          {
            headers:{
              "content-type":
                "application/javascript;charset=utf-8",

              "cache-control":
                "public,max-age=300"
            }
          }
        );
      }

      /*
        Widget iframe
      */
      if (
        u.pathname ===
        "/widget"
      ) {

        const botId =
          u.searchParams.get(
            "bot_id"
          ) || "";

        return new Response(
          widgetPage(botId),
          {
            headers:{
              "content-type":
                "text/html;charset=utf-8",

              "content-security-policy":
                "default-src 'self' https:; frame-ancestors *"
            }
          }
        );
      }

      /*
        START BUILD

        IMPORTANT:
        We DO NOT call buildStep here.

        This returns immediately.
        The browser then calls /api/admin/job/:id
        repeatedly and each call processes one page.
      */
      if (
        u.pathname ===
          "/api/admin/build" &&
        req.method ===
          "POST"
      ) {

        if (
          !admin(req,env)
        ) {

          return json(
            {
              error:
                "Unauthorized"
            },
            401
          );
        }

        let body:any;

        try {

          body =
            await req.json();

        } catch {

          return json(
            {
              error:
                "Invalid JSON request"
            },
            400
          );
        }

        const seed =
          cleanUrl(
            String(
              body?.url ||
                ""
            ).trim()
          );

        if (!seed) {

          return json(
            {
              error:
                "Valid website URL required"
            },
            400
          );
        }

        if (
          privateHost(
            host(seed)
          )
        ) {

          return json(
            {
              error:
                "Private/local URLs are not allowed"
            },
            400
          );
        }

        const d =
          await mongo(
            env.MONGODB_URI
          );

        await ensureIndexes(
          d
        );

        const botId =
          id();

        const job =
          await seedJob(
            d,
            seed,
            botId
          );

        /*
          Return immediately.
          Do NOT crawl here.
        */
        return json({
          ok:true,
          jobId:
            job.jobId,
          botId
        });
      }

      /*
        BUILD STATUS + NEXT CRAWL STEP

        Every call performs one crawl step.
      */
      if (
        u.pathname.startsWith(
          "/api/admin/job/"
        ) &&
        req.method ===
          "GET"
      ) {

        if (
          !admin(req,env)
        ) {

          return json(
            {
              error:
                "Unauthorized"
            },
            401
          );
        }

        const jobId =
          u.pathname.slice(
            "/api/admin/job/"
              .length
          );

        if (!jobId) {

          return json(
            {
              error:
                "Job ID required"
            },
            400
          );
        }

        const j =
          await buildStep(
            env,
            jobId
          );

        if (!j) {

          return json(
            {
              error:
                "Job not found"
            },
            404
          );
        }

        return json({
          jobId:
            j.jobId,

          botId:
            j.botId,

          stage:
            j.stage,

          done:
            j.done,

          pages:
            j.pages,

          /*
            PDFs are NOT processed.
          */
          pdfs:0,

          chunks:
            j.chunks,

          queuedPages:
            j.queue.length,

          queuedPdfs:0,

          pdfLinks:
            j.pdfLinks.length,

          errors:
            j.errors.slice(
              -8
            ),

          embedScript:
            j.done
              ? `<script src="${env.PUBLIC_URL || u.origin}/widget.js?bot_id=${j.botId}" async></script>`
              : null
        });
      }

      /*
        CHAT
      */
      if (
        u.pathname ===
          "/api/chat" &&
        req.method ===
          "POST"
      ) {

        let body:any;

        try {

          body =
            await req.json();

        } catch {

          return json(
            {
              error:
                "Invalid JSON request"
            },
            400
          );
        }

        const botId =
          String(
            body?.botId ||
              ""
          ).trim();

        const question =
          String(
            body?.question ||
              ""
          ).trim();

        if (
          !botId ||
          !question
        ) {

          return json(
            {
              error:
                "botId and question required"
            },
            400
          );
        }

        if (
          question.length >
          1000
        ) {

          return json(
            {
              error:
                "Question is too long"
            },
            400
          );
        }

        const d =
          await mongo(
            env.MONGODB_URI
          );

        await ensureIndexes(
          d
        );

        const bot =
          await d
            .collection<Bot>(
              "bots"
            )
            .findOne({
              botId
            });

        if (!bot) {

          return json(
            {
              error:
                "Chatbot not found"
            },
            404
          );
        }

        if (
          bot.status !==
          "ready"
        ) {

          return json(
            {
              error:
                "Chatbot is still building"
            },
            409
          );
        }

        const result =
          await answer(
            env,
            botId,
            question
          );

        return json(
          result
        );
      }

      return new Response(
        "Not found",
        {
          status:404
        }
      );

    } catch (e) {

      return json(
        {
          error:
            String(e).slice(
              0,
              500
            )
        },
        500
      );
    }
  }

};
