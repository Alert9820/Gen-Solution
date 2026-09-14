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

  sitemapQueue: string[];
  sitemapSeen: string[];

  stage: "crawl" | "done" | "error";

  pages: number;
  pdfs: number;
  chunks: number;

  errors: string[];

  createdAt: string;
  updatedAt: string;

  done: boolean;
};

const DB_NAME = "ai_website_chatbot";

const MAX_PAGES = 400;
const MAX_PDFS = 200;

const MAX_CHUNK = 1800;
const OVERLAP = 250;

const MAX_HTML_BYTES = 5_000_000;
const MAX_SITEMAP_BYTES = 2_000_000;

const MODEL = "@cf/zai-org/glm-4.7-flash";

const UA = "Gen-Solution-Bot/6.0";

let client: MongoClient | undefined;
let db: Db | undefined;

/* =========================================================
   BASIC HELPERS
========================================================= */

function now() {
  return new Date().toISOString();
}

function makeId() {
  return crypto.randomUUID();
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-headers":
        "content-type,x-admin-key",
      "cache-control": "no-store"
    }
  });
}

function html(data: string, status = 200) {
  return new Response(data, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function admin(req: Request, env: Env) {
  const key = req.headers.get("x-admin-key");

  const queryKey = new URL(req.url)
    .searchParams
    .get("key");

  return (
    !!env.ADMIN_KEY &&
    (key === env.ADMIN_KEY ||
      queryKey === env.ADMIN_KEY)
  );
}

/* =========================================================
   MONGODB
========================================================= */

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

async function ensureIndexes(d: Db) {
  const chunks = d.collection("chunks");
  const pdfLinks = d.collection("pdfLinks");
  const bots = d.collection("bots");
  const jobs = d.collection("jobs");

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

  await pdfLinks
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

  await bots
    .createIndex(
      {
        botId: 1
      },
      {
        unique: true
      }
    )
    .catch(() => {});

  await jobs
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

/* =========================================================
   URL SECURITY
========================================================= */

function cleanUrl(
  raw: string,
  base?: string
) {
  try {
    const u = new URL(raw, base);

    if (!/^https?:$/.test(u.protocol)) {
      return null;
    }

    u.hash = "";

    u.hostname =
      u.hostname.toLowerCase();

    if (u.pathname !== "/") {
      u.pathname =
        u.pathname.replace(
          /\/{2,}/g,
          "/"
        );
    }

    return u
      .toString()
      .replace(/\/$/, "");
  } catch {
    return null;
  }
}

function host(url: string) {
  return new URL(url)
    .hostname
    .toLowerCase();
}

function sameHost(
  a: string,
  b: string
) {
  const x = host(a);
  const y = host(b);

  if (x === y) {
    return true;
  }

  /*
    Treat www.example.com and example.com
    as the same website.
  */

  return (
    x.replace(/^www\./, "") ===
    y.replace(/^www\./, "")
  );
}

function privateHost(h: string) {
  return /^(localhost|127\.|0\.0\.0\.0|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[0-1])\.|::1|fc|fd)/i.test(
    h
  );
}

function allowed(
  url: string,
  seed: string
) {
  try {
    const u = new URL(url);

    return (
      /^https?:$/.test(
        u.protocol
      ) &&
      !privateHost(u.hostname) &&
      sameHost(
        u.href,
        seed
      )
    );
  } catch {
    return false;
  }
}

/* =========================================================
   HTML / TEXT
========================================================= */

function decode(s: string) {
  return s
    .replace(
      /&nbsp;/gi,
      " "
    )
    .replace(
      /&amp;/gi,
      "&"
    )
    .replace(
      /&quot;/gi,
      '"'
    )
    .replace(
      /&#39;/gi,
      "'"
    )
    .replace(
      /&lt;/gi,
      "<"
    )
    .replace(
      /&gt;/gi,
      ">"
    )
    .replace(
      /&#(\d+);/g,
      (_, n) =>
        String.fromCharCode(
          Number(n)
        )
    )
    .replace(
      /&#x([0-9a-f]+);/gi,
      (_, n) =>
        String.fromCharCode(
          parseInt(n, 16)
        )
    );
}

function stripHtml(htmlText: string) {
  const title = decode(
    (
      htmlText.match(
        /<title[^>]*>([\s\S]*?)<\/title>/i
      )?.[1] || ""
    )
      .replace(
        /<[^>]+>/g,
        " "
      )
  )
    .replace(
      /\s+/g,
      " "
    )
    .trim()
    .slice(0, 300);

  const cleaned =
    htmlText
      .replace(
        /<(script|style|noscript|template|svg|canvas|iframe)[^>]*>[\s\S]*?<\/\1>/gi,
        " "
      )
      .replace(
        /<!--[\s\S]*?-->/g,
        " "
      );

  const withBreaks =
    cleaned.replace(
      /<(br|\/p|\/div|\/li|\/tr|\/h[1-6]|\/section|\/article|\/header|\/footer|\/nav|\/td|\/th)[^>]*>/gi,
      "\n"
    );

  const text = decode(
    withBreaks.replace(
      /<[^>]+>/g,
      " "
    )
  )
    .replace(
      /[\t ]+/g,
      " "
    )
    .replace(
      /\n\s+/g,
      "\n"
    )
    .replace(
      /\n{3,}/g,
      "\n\n"
    )
    .trim();

  return {
    title,
    text
  };
}

/* =========================================================
   LINK EXTRACTION
========================================================= */

function isPdfUrl(
  url: string
) {
  return /\.pdf(?:$|[?#])/i.test(
    url
  );
}

function isBinary(
  url: string
) {
  return /\.(?:jpg|jpeg|png|gif|webp|svg|ico|mp4|mp3|zip|rar|7z|doc|docx|xls|xlsx|ppt|pptx|css|js|woff2?|ttf)(?:$|[?#])/i.test(
    url
  );
}

function extractLinks(
  htmlText: string,
  base: string,
  seed: string
) {
  const out =
    new Set<string>();

  const re =
    /<a\b[^>]*?href\s*=\s*["']([^"']+)["'][^>]*>/gi;

  let match:
    RegExpExecArray | null;

  while (
    (match = re.exec(htmlText))
  ) {
    const raw =
      match[1].trim();

    if (
      /^(mailto:|tel:|javascript:|data:|#)/i.test(
        raw
      )
    ) {
      continue;
    }

    const url =
      cleanUrl(
        raw,
        base
      );

    if (
      url &&
      allowed(
        url,
        seed
      ) &&
      !isBinary(url) &&
      !isPdfUrl(url)
    ) {
      out.add(url);
    }
  }

  return [
    ...out
  ];
}

function extractPdfLinks(
  htmlText: string,
  base: string,
  seed: string
) {
  const out =
    new Set<string>();

  const re =
    /(?:href|data-href|data-url)\s*=\s*["']([^"']+)["']/gi;

  let match:
    RegExpExecArray | null;

  while (
    (match = re.exec(htmlText))
  ) {
    const url =
      cleanUrl(
        match[1],
        base
      );

    if (
      url &&
      allowed(
        url,
        seed
      ) &&
      isPdfUrl(url)
    ) {
      out.add(url);
    }
  }

  return [
    ...out
  ];
}

function pdfTitle(
  url: string
) {
  try {
    const u =
      new URL(url);

    const file =
      decodeURIComponent(
        u.pathname
          .split("/")
          .pop() ||
          "PDF Document"
      );

    return file
      .replace(
        /\.pdf$/i,
        ""
      )
      .replace(
        /[-_]+/g,
        " "
      )
      .replace(
        /\s+/g,
        " "
      )
      .trim()
      .slice(
        0,
        200
      );
  } catch {
    return "PDF Document";
  }
}

/* =========================================================
   CHUNKING
========================================================= */

function chunkText(
  text: string
) {
  const result: string[] =
    [];

  let start = 0;

  while (
    start < text.length
  ) {
    const end =
      Math.min(
        text.length,
        start +
          MAX_CHUNK
      );

    let cut = end;

    if (
      end <
      text.length
    ) {
      const p =
        Math.max(
          text.lastIndexOf(
            " ",
            end
          ),
          text.lastIndexOf(
            "\n",
            end
          )
        );

      if (
        p >
        start + 800
      ) {
        cut = p;
      }
    }

    const value =
      text
        .slice(
          start,
          cut
        )
        .trim();

    if (
      value.length > 60
    ) {
      result.push(
        value
      );
    }

    if (
      cut >=
      text.length
    ) {
      break;
    }

    start =
      Math.max(
        cut -
          OVERLAP,
        start + 1
      );
  }

  return result;
}

/* =========================================================
   SEARCH
========================================================= */

function tokens(
  text: string
) {
  return new Set(
    (
      text
        .toLowerCase()
        .match(
          /[a-z0-9@._+-]+/g
        ) || []
    ).filter(
      (x) =>
        x.length > 1
    )
  );
}

function lexicalScore(
  question: string,
  text: string
) {
  const q =
    tokens(question);

  const t =
    tokens(text);

  if (
    !q.size ||
    !t.size
  ) {
    return 0;
  }

  let hit = 0;

  for (
    const word of q
  ) {
    if (
      t.has(word)
    ) {
      hit++;
    }
  }

  return (
    hit / q.size
  );
}

/* =========================================================
   FETCH WEBSITE
========================================================= */

async function fetchPage(
  url: string,
  seed: string
) {
  if (
    !allowed(
      url,
      seed
    )
  ) {
    throw new Error(
      "Blocked URL"
    );
  }

  const controller =
    new AbortController();

  const timer =
    setTimeout(
      () =>
        controller.abort(),
      15000
    );

  try {
    const response =
      await fetch(
        url,
        {
          redirect:
            "follow",
          signal:
            controller.signal,
          headers: {
            "user-agent":
              UA,
            accept:
              "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.1",
            "accept-language":
              "en-US,en;q=0.8"
          }
        }
      );

    if (
      !response.ok
    ) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }

    if (
      !allowed(
        response.url ||
          url,
        seed
      )
    ) {
      throw new Error(
        "Redirected outside website"
      );
    }

    const type =
      (
        response.headers.get(
          "content-type"
        ) || ""
      ).toLowerCase();

    if (
      type &&
      !type.includes(
        "text/html"
      ) &&
      !type.includes(
        "application/xhtml+xml"
      ) &&
      !type.includes(
        "text/plain"
      )
    ) {
      throw new Error(
        "Not an HTML page"
      );
    }

    const length =
      Number(
        response.headers.get(
          "content-length"
        ) || "0"
      );

    if (
      length >
      MAX_HTML_BYTES
    ) {
      throw new Error(
        "HTML page too large"
      );
    }

    const text =
      await response.text();

    if (
      text.length >
      MAX_HTML_BYTES
    ) {
      throw new Error(
        "HTML page too large"
      );
    }

    return {
      url:
        response.url ||
        url,
      html:
        text
    };
  } finally {
    clearTimeout(
      timer
    );
  }
}

/* =========================================================
   SMALL FETCH
========================================================= */

async function fetchSmall(
  url: string
) {
  const controller =
    new AbortController();

  const timer =
    setTimeout(
      () =>
        controller.abort(),
      8000
    );

  try {
    return await fetch(
      url,
      {
        redirect:
          "follow",
        signal:
          controller.signal,
        headers: {
          "user-agent":
            UA,
          accept:
            "application/xml,text/xml,text/plain,*/*;q=0.5"
        }
      }
    );
  } finally {
    clearTimeout(
      timer
    );
  }
}

/* =========================================================
   SAVE PDF METADATA
========================================================= */

async function savePdfLinks(
  d: Db,
  job: Job,
  urls: string[]
) {
  if (
    !urls.length
  ) {
    return;
  }

  const collection =
    d.collection<PdfLink>(
      "pdfLinks"
    );

  const operations =
    urls
      .slice(
        0,
        MAX_PDFS
      )
      .map(
        (url) => ({
          updateOne: {
            filter: {
              botId:
                job.botId,
              url
            },
            update: {
              $set: {
                botId:
                  job.botId,
                url,
                title:
                  pdfTitle(
                    url
                  ),
                updatedAt:
                  now()
              }
            },
            upsert: true
          }
        })
      );

  if (
    operations.length
  ) {
    await collection.bulkWrite(
      operations,
      {
        ordered:
          false
      }
    );
  }
}

/* =========================================================
   SITEMAP PROCESSING
========================================================= */

function sitemapCandidates(
  seed: string
) {
  const urls =
    new Set<string>();

  const paths = [
    "/sitemap.xml",
    "/wp-sitemap.xml",
    "/sitemap_index.xml"
  ];

  for (
    const path of paths
  ) {
    try {
      urls.add(
        new URL(
          path,
          seed
        ).href
      );
    } catch {}
  }

  return [
    ...urls
  ];
}

function parseSitemap(
  text: string,
  seed: string
) {
  const pages =
    new Set<string>();

  const sitemaps =
    new Set<string>();

  for (
    const match of text.matchAll(
      /<loc>\s*([^<]+?)\s*<\/loc>/gi
    )
  ) {
    const url =
      cleanUrl(
        match[1].trim()
      );

    if (
      !url ||
      !sameHost(
        url,
        seed
      )
    ) {
      continue;
    }

    if (
      /\.xml(?:$|[?#])/i.test(
        url
      ) &&
      /sitemap/i.test(
        url
      )
    ) {
      sitemaps.add(
        url
      );
      continue;
    }

    if (
      isPdfUrl(url)
    ) {
      continue;
    }

    if (
      !isBinary(url)
    ) {
      pages.add(
        url
      );
    }
  }

  return {
    pages: [
      ...pages
    ],
    sitemaps: [
      ...sitemaps
    ]
  };
}

/*
  ONE sitemap per step.
  This is intentionally separate from
  normal page crawling so one request
  remains lightweight.
*/

async function processSitemapStep(
  job: Job,
  d: Db
) {
  const sitemap =
    job.sitemapQueue.shift();

  if (
    !sitemap
  ) {
    return false;
  }

  if (
    job.sitemapSeen.includes(
      sitemap
    )
  ) {
    return true;
  }

  job.sitemapSeen.push(
    sitemap
  );

  try {
    const response =
      await fetchSmall(
        sitemap
      );

    if (
      !response.ok
    ) {
      return true;
    }

    const length =
      Number(
        response.headers.get(
          "content-length"
        ) || "0"
      );

    if (
      length >
      MAX_SITEMAP_BYTES
    ) {
      return true;
    }

    const text =
      await response.text();

    if (
      text.length >
      MAX_SITEMAP_BYTES
    ) {
      return true;
    }

    const parsed =
      parseSitemap(
        text,
        job.seed
      );

    /*
      Add discovered pages.
    */

    for (
      const url of
      parsed.pages
    ) {
      if (
        job.queue.length >=
        MAX_PAGES * 2
      ) {
        break;
      }

      if (
        job.visited.includes(
          url
        )
      ) {
        continue;
      }

      if (
        !job.queue.includes(
          url
        )
      ) {
        job.queue.push(
          url
        );
      }
    }

    /*
      Add nested sitemaps.
    */

    for (
      const url of
      parsed.sitemaps
    ) {
      if (
        job.sitemapSeen.includes(
          url
        )
      ) {
        continue;
      }

      if (
        !job.sitemapQueue.includes(
          url
        ) &&
        job.sitemapQueue.length <
          20
      ) {
        job.sitemapQueue.push(
          url
        );
      }
    }

    return true;
  } catch (err) {
    job.errors.push(
      `Sitemap ${sitemap}: ${
        err instanceof Error
          ? err.message
          : String(err)
      }`
    );

    return true;
  }
}

/* =========================================================
   CRAWL ONE PAGE
========================================================= */

async function crawlOnePage(
  job: Job,
  d: Db
) {
  let url =
    job.queue.shift();

  /*
    Find next usable URL.
  */

  while (
    url &&
    (
      job.visited.includes(
        url
      ) ||
      !allowed(
        url,
        job.seed
      )
    )
  ) {
    url =
      job.queue.shift();
  }

  if (
    !url
  ) {
    return false;
  }

  try {
    const result =
      await fetchPage(
        url,
        job.seed
      );

    const finalUrl =
      result.url;

    const parsed =
      stripHtml(
        result.html
      );

    /*
      Mark visited only after
      successful fetch.
    */

    if (
      !job.visited.includes(
        finalUrl
      )
    ) {
      job.visited.push(
        finalUrl
      );
    }

    /*
      Discover normal internal pages.
    */

    const links =
      extractLinks(
        result.html,
        finalUrl,
        job.seed
      );

    for (
      const link of
      links
    ) {
      if (
        job.visited.includes(
          link
        )
      ) {
        continue;
      }

      if (
        job.queue.length >=
        MAX_PAGES * 2
      ) {
        break;
      }

      if (
        !job.queue.includes(
          link
        )
      ) {
        job.queue.push(
          link
        );
      }
    }

    /*
      Discover PDFs.
      We DO NOT download them.
    */

    const pdfs =
      extractPdfLinks(
        result.html,
        finalUrl,
        job.seed
      );

    for (
      const pdf of
      pdfs
    ) {
      if (
        job.pdfLinks.length >=
        MAX_PDFS
      ) {
        break;
      }

      if (
        !job.pdfLinks.includes(
          pdf
        )
      ) {
        job.pdfLinks.push(
          pdf
        );
      }
    }

    await savePdfLinks(
      d,
      job,
      pdfs
    );

    /*
      Create text chunks.
    */

    const chunks =
      chunkText(
        parsed.text
      );

    const collection =
      d.collection<Chunk>(
        "chunks"
      );

    /*
      Avoid duplicates if a page
      is ever retried.
    */

    await collection.deleteMany({
      botId:
        job.botId,
      url:
        finalUrl
    });

    if (
      chunks.length
    ) {
      const documents =
        chunks.map(
          (text) => ({
            botId:
              job.botId,
            url:
              finalUrl,
            title:
              parsed.title ||
              finalUrl,
            text,
            kind:
              "page" as const,
            updatedAt:
              now()
          })
        );

      await collection.insertMany(
        documents
      );

      job.chunks +=
        documents.length;
    }

    job.pages += 1;

    return true;
  } catch (err) {
    job.errors.push(
      `${url}: ${
        err instanceof Error
          ? err.message
          : String(err)
      }`
    );

    /*
      Mark failed page visited so
      one broken page doesn't loop forever.
    */

    if (
      !job.visited.includes(
        url
      )
    ) {
      job.visited.push(
        url
      );
    }

    return true;
  }
}

/* =========================================================
   ONE BUILD STEP
========================================================= */

async function buildStep(
  env: Env,
  jobId: string
) {
  const d =
    await mongo(
      env.MONGODB_URI
    );

  const jobs =
    d.collection<Job>(
      "jobs"
    );

  const job =
    await jobs.findOne({
      jobId
    });

  if (
    !job
  ) {
    throw new Error(
      "Job not found"
    );
  }

  if (
    job.done ||
    job.stage === "done" ||
    job.stage === "error"
  ) {
    return job;
  }

  /*
    If page limit reached,
    finish.
  */

  if (
    job.pages >=
    MAX_PAGES
  ) {
    job.done = true;
    job.stage = "done";
  } else {
    /*
      Process sitemap first.
      Exactly ONE sitemap request.
    */

    let worked =
      false;

    if (
      job.sitemapQueue.length
    ) {
      worked =
        await processSitemapStep(
          job,
          d
        );
    }

    /*
      Then crawl exactly ONE page.
    */

    if (
      !worked &&
      job.queue.length
    ) {
      worked =
        await crawlOnePage(
          job,
          d
        );
    }

    /*
      Nothing left.
    */

    if (
      !worked &&
      !job.queue.length &&
      !job.sitemapQueue.length
    ) {
      job.done = true;
      job.stage = "done";
    }
  }

  job.pdfs =
    job.pdfLinks.length;

  job.updatedAt =
    now();

  await jobs.updateOne(
    {
      jobId
    },
    {
      $set: job
    }
  );

  if (
    job.done
  ) {
    await finalize(
      env,
      job
    );
  }

  return job;
}

/* =========================================================
   FINALIZE
========================================================= */

async function finalize(
  env: Env,
  job: Job
) {
  const d =
    await mongo(
      env.MONGODB_URI
    );

  const chunks =
    await d
      .collection("chunks")
      .countDocuments({
        botId:
          job.botId
      });

  const pdfs =
    await d
      .collection("pdfLinks")
      .countDocuments({
        botId:
          job.botId
      });

  await d
    .collection("bots")
    .updateOne(
      {
        botId:
          job.botId
      },
      {
        $set: {
          status:
            "ready",
          pageCount:
            job.pages,
          pdfCount:
            pdfs,
          chunkCount:
            chunks,
          updatedAt:
            now()
        }
      }
    );
}

/* =========================================================
   CREATE JOB
========================================================= */

async function seedJob(
  env: Env,
  siteUrl: string
) {
  const d =
    await mongo(
      env.MONGODB_URI
    );

  await ensureIndexes(
    d
  );

  const botId =
    makeId();

  const jobId =
    makeId();

  const created =
    now();

  const hostName =
    host(siteUrl);

  const bot: Bot = {
    botId,
    siteUrl,
    host:
      hostName,
    createdAt:
      created,
    updatedAt:
      created,
    status:
      "building",
    pageCount:
      0,
    pdfCount:
      0,
    chunkCount:
      0
  };

  /*
    Only official website sitemap
    locations are considered.
  */

  const sitemaps =
    sitemapCandidates(
      siteUrl
    );

  const job: Job = {
    jobId,
    botId,
    seed:
      siteUrl,

    queue: [
      siteUrl
    ],

    visited: [],

    pdfLinks: [],

    sitemapQueue:
      sitemaps,

    sitemapSeen: [],

    stage:
      "crawl",

    pages:
      0,

    pdfs:
      0,

    chunks:
      0,

    errors: [],

    createdAt:
      created,

    updatedAt:
      created,

    done:
      false
  };

  await d
    .collection<Bot>(
      "bots"
    )
    .insertOne(
      bot
    );

  await d
    .collection<Job>(
      "jobs"
    )
    .insertOne(
      job
    );

  return {
    bot,
    job
  };
}

/* =========================================================
   CHAT ANSWER
========================================================= */

async function answer(
  env: Env,
  botId: string,
  question: string
) {
  const d =
    await mongo(
      env.MONGODB_URI
    );

  await ensureIndexes(
    d
  );

  const chunks =
    d.collection<Chunk>(
      "chunks"
    );

  const pdfCollection =
    d.collection<PdfLink>(
      "pdfLinks"
    );

  /*
    Mongo text search first.
  */

  let candidates:
    Chunk[] = [];

  try {
    candidates =
      await chunks
        .find(
          {
            botId,
            $text: {
              $search:
                question
            }
          },
          {
            projection: {
              botId: 1,
              url: 1,
              title: 1,
              text: 1,
              kind: 1,
              updatedAt: 1
            }
          }
        )
        .limit(20)
        .toArray();
  } catch {
    candidates =
      await chunks
        .find({
          botId
        })
        .limit(100)
        .toArray();
  }

  /*
    Lexical reranking.
  */

  candidates =
    candidates
      .map(
        (item) => ({
          item,
          score:
            lexicalScore(
              question,
              item.text
            )
        })
      )
      .sort(
        (a, b) =>
          b.score -
          a.score
      )
      .slice(
        0,
        8
      )
      .map(
        (x) =>
          x.item
      );

  /*
    PDF metadata search.
    PDFs themselves are NOT read.
  */

  const pdfs =
    await pdfCollection
      .find({
        botId
      })
      .limit(
        MAX_PDFS
      )
      .toArray();

  const pdfMatches =
    pdfs
      .map(
        (pdf) => ({
          pdf,
          score:
            lexicalScore(
              question,
              `${pdf.title} ${pdf.url}`
            )
        })
      )
      .filter(
        (x) =>
          x.score > 0
      )
      .sort(
        (a, b) =>
          b.score -
          a.score
      )
      .slice(
        0,
        5
      )
      .map(
        (x) =>
          x.pdf
      );

  /*
    If absolutely nothing matches,
    don't hallucinate.
  */

  if (
    !candidates.length &&
    !pdfMatches.length
  ) {
    return {
      answer:
        "I couldn't find that information on the website.",
      sources: []
    };
  }

  const context =
    candidates
      .map(
        (c, index) =>
          `[SOURCE ${index + 1}]
Title: ${c.title}
URL: ${c.url}
Content:
${c.text}`
      )
      .join(
        "\n\n"
      );

  const pdfContext =
    pdfMatches.length
      ? pdfMatches
          .map(
            (p, index) =>
              `[PDF ${index + 1}]
Title: ${p.title}
URL: ${p.url}`
          )
          .join(
            "\n\n"
          )
      : "No matching PDF.";

  const prompt = `
You are the official website assistant.

Answer ONLY using the website information supplied below.

Rules:
1. Never invent facts.
2. Never use outside knowledge.
3. If the answer is not present, say:
   "I couldn't find that information on the website."
4. If the user asks about a PDF, you may mention its title and provide its official URL.
5. Do NOT pretend that you read the PDF content.
6. If the user asks for contact information, preserve exact phone numbers and email addresses.
7. If the user asks in English, answer in English.
8. If the user asks naturally in Roman Hindi/Hinglish, answer in Roman Hindi/Hinglish.
9. Keep answers clear and reasonably concise.
10. Include useful source URLs when appropriate.

WEBSITE CONTENT:

${context}

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
            role:
              "system",
            content:
              "You are a strict website-grounded assistant."
          },
          {
            role:
              "user",
            content:
              prompt
          }
        ],
        temperature:
          0.1,
        max_tokens:
          700
      }
    );

  let text =
    "";

  if (
    typeof aiResult ===
    "string"
  ) {
    text =
      aiResult;
  } else if (
    aiResult?.response
  ) {
    text =
      aiResult.response;
  } else if (
    aiResult?.result
  ) {
    text =
      aiResult.result;
  } else {
    text =
      "I couldn't find that information on the website.";
  }

  /*
    Sources shown separately in UI.
  */

  const sourceMap =
    new Map<
      string,
      {
        title: string;
        url: string;
        type: "page" | "pdf";
      }
    >();

  for (
    const item of
    candidates
  ) {
    if (
      !sourceMap.has(
        item.url
      )
    ) {
      sourceMap.set(
        item.url,
        {
          title:
            item.title ||
            item.url,
          url:
            item.url,
          type:
            "page"
        }
      );
    }
  }

  for (
    const item of
    pdfMatches
  ) {
    if (
      !sourceMap.has(
        item.url
      )
    ) {
      sourceMap.set(
        item.url,
        {
          title:
            item.title,
          url:
            item.url,
          type:
            "pdf"
        }
      );
    }
  }

  return {
    answer:
      text.trim(),
    sources:
      [...sourceMap.values()]
        .slice(
          0,
          8
        )
  };
}

/* =========================================================
   ADMIN HTML
========================================================= */

function adminHtml() {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Gen-Solution Admin</title>

<style>
*{
  box-sizing:border-box;
}

body{
  margin:0;
  background:#f5f7fb;
  color:#111827;
  font-family:Inter,Arial,sans-serif;
}

.wrap{
  max-width:900px;
  margin:40px auto;
  padding:20px;
}

.card{
  background:white;
  border:1px solid #e5e7eb;
  border-radius:18px;
  padding:24px;
  box-shadow:0 10px 35px rgba(0,0,0,.06);
}

h1{
  margin:0 0 8px;
  font-size:28px;
}

.muted{
  color:#6b7280;
  margin-bottom:24px;
}

label{
  display:block;
  font-size:14px;
  font-weight:700;
  margin:16px 0 7px;
}

input{
  width:100%;
  padding:13px 14px;
  border:1px solid #d1d5db;
  border-radius:10px;
  font-size:15px;
  outline:none;
}

input:focus{
  border-color:#111827;
}

button{
  border:0;
  border-radius:10px;
  padding:13px 18px;
  background:#111827;
  color:white;
  font-size:15px;
  font-weight:700;
  cursor:pointer;
  margin-top:18px;
}

button:disabled{
  opacity:.55;
  cursor:not-allowed;
}

.status{
  margin-top:20px;
  padding:14px;
  border-radius:10px;
  background:#f3f4f6;
  white-space:pre-wrap;
  word-break:break-word;
}

.embed{
  margin-top:24px;
  display:none;
}

textarea{
  width:100%;
  min-height:130px;
  margin-top:8px;
  border:1px solid #d1d5db;
  border-radius:10px;
  padding:12px;
  font-family:monospace;
  font-size:13px;
}

.small{
  font-size:13px;
  color:#6b7280;
  margin-top:8px;
}
</style>
</head>

<body>

<div class="wrap">

<div class="card">

<h1>Gen-Solution AI Website Chatbot</h1>

<div class="muted">
Enter a public website URL. The crawler will index its
HTML content and PDF links.
</div>

<label>Website URL</label>
<input
  id="siteUrl"
  placeholder="https://example.com/"
/>

<label>Admin Key</label>
<input
  id="adminKey"
  type="password"
  placeholder="Your ADMIN_KEY"
/>

<button id="buildBtn">
Crawl & Build
</button>

<div
  id="status"
  class="status"
>
Ready.
</div>

<div
  id="embedBox"
  class="embed"
>
<label>Embed code</label>

<textarea
  id="embedCode"
  readonly
></textarea>

<button id="copyBtn">
Copy Embed Code
</button>

<div class="small">
Paste this single script tag into the client's website.
No source-code sharing is required.
</div>
</div>

</div>

</div>

<script>
const buildBtn =
  document.getElementById("buildBtn");

const statusEl =
  document.getElementById("status");

const embedBox =
  document.getElementById("embedBox");

const embedCode =
  document.getElementById("embedCode");

const copyBtn =
  document.getElementById("copyBtn");

let currentKey = "";

function setStatus(text){
  statusEl.textContent = text;
}

async function readJson(response, label){
  const text =
    await response.text();

  if(!response.ok){
    throw new Error(
      label +
      " HTTP " +
      response.status +
      ": " +
      text.slice(0,500)
    );
  }

  try{
    return JSON.parse(text);
  }catch{
    throw new Error(
      "Invalid " +
      label +
      " response: " +
      text.slice(0,500)
    );
  }
}

async function getStatus(jobId){
  const response =
    await fetch(
      "/api/admin/job/" +
      encodeURIComponent(jobId),
      {
        headers:{
          "x-admin-key":
            currentKey
        },
        cache:"no-store"
      }
    );

  return readJson(
    response,
    "status"
  );
}

async function doStep(jobId){
  const response =
    await fetch(
      "/api/admin/step/" +
      encodeURIComponent(jobId),
      {
        method:"POST",
        headers:{
          "x-admin-key":
            currentKey
        },
        cache:"no-store"
      }
    );

  return readJson(
    response,
    "step"
  );
}

async function pollJob(jobId,botId){

  while(true){

    const statusData =
      await getStatus(
        jobId
      );

    const job =
      statusData.job;

    if(!job){
      throw new Error(
        "Job data missing."
      );
    }

    if(
      job.done ||
      job.stage === "done"
    ){

      setStatus(
        "Build completed.\\n" +
        "Pages: " +
        job.pages +
        "\\n" +
        "PDF links: " +
        job.pdfs +
        "\\n" +
        "Chunks: " +
        job.chunks
      );

      const base =
        window.location.origin;

      const code =
        '<script src="' +
        base +
        '/widget.js?bot=' +
        encodeURIComponent(botId) +
        '" defer><\\/script>';

      embedCode.value =
        code;

      embedBox.style.display =
        "block";

      return;
    }

    if(
      job.stage === "error"
    ){
      throw new Error(
        job.errors &&
        job.errors.length
          ? job.errors.join("\\n")
          : "Build failed."
      );
    }

    setStatus(
      "Building...\\n" +
      "Pages crawled: " +
      job.pages +
      " / 400\\n" +
      "PDF links: " +
      job.pdfs +
      "\\n" +
      "Chunks: " +
      job.chunks +
      "\\n" +
      "Queue: " +
      job.queue.length +
      "\\n" +
      "Sitemaps left: " +
      job.sitemapQueue.length
    );

    /*
      One lightweight step.
    */

    await doStep(
      jobId
    );

    /*
      Small delay avoids hammering
      Cloudflare/MongoDB.
    */

    await new Promise(
      resolve =>
        setTimeout(
          resolve,
          700
        )
    );
  }
}

buildBtn.addEventListener(
  "click",
  async () => {

    try{

      buildBtn.disabled =
        true;

      embedBox.style.display =
        "none";

      const siteUrl =
        document
          .getElementById(
            "siteUrl"
          )
          .value
          .trim();

      currentKey =
        document
          .getElementById(
            "adminKey"
          )
          .value
          .trim();

      if(!siteUrl){
        throw new Error(
          "Website URL is required."
        );
      }

      if(!currentKey){
        throw new Error(
          "Admin Key is required."
        );
      }

      setStatus(
        "Creating build job..."
      );

      const response =
        await fetch(
          "/api/admin/build",
          {
            method:"POST",
            headers:{
              "content-type":
                "application/json",
              "x-admin-key":
                currentKey
            },
            body:
              JSON.stringify({
                url:
                  siteUrl
              })
          }
        );

      const data =
        await readJson(
          response,
          "build"
        );

      if(
        !data.ok ||
        !data.jobId
      ){
        throw new Error(
          data.error ||
          "Build job was not created."
        );
      }

      setStatus(
        "Job created. Starting crawler..."
      );

      await pollJob(
        data.jobId,
        data.botId
      );

    }catch(error){

      setStatus(
        "Build Error:\\n\\n" +
        (
          error instanceof Error
            ? error.message
            : String(error)
        )
      );

    }finally{

      buildBtn.disabled =
        false;
    }
  }
);

copyBtn.addEventListener(
  "click",
  async () => {

    try{

      await navigator.clipboard.writeText(
        embedCode.value
      );

      copyBtn.textContent =
        "Copied!";

      setTimeout(
        () => {
          copyBtn.textContent =
            "Copy Embed Code";
        },
        1500
      );

    }catch{

      embedCode.select();

      document.execCommand(
        "copy"
      );
    }
  }
);
</script>

</body>
</html>`;
}

/* =========================================================
   WIDGET JS
========================================================= */

function widgetJs(
  requestUrl: string
) {
  const origin =
    new URL(
      requestUrl
    ).origin;

  return `(() => {

const script =
  document.currentScript;

if(!script){
  return;
}

const botId =
  new URL(
    script.src
  ).searchParams.get(
    "bot"
  );

if(!botId){
  console.error(
    "Gen-Solution: bot ID missing."
  );
  return;
}

const origin =
  ${JSON.stringify(origin)};

const iframe =
  document.createElement(
    "iframe"
  );

iframe.src =
  origin +
  "/widget?bot=" +
  encodeURIComponent(
    botId
  );

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

iframe.style.background =
  "transparent";

iframe.style.borderRadius =
  "18px";

iframe.style.boxShadow =
  "0 15px 50px rgba(0,0,0,.18)";

iframe.setAttribute(
  "allow",
  "clipboard-write"
);

document.body.appendChild(
  iframe
);

})();`;
}

/* =========================================================
   WIDGET PAGE
========================================================= */

async function widgetPage(
  env: Env,
  botId: string
) {
  const d =
    await mongo(
      env.MONGODB_URI
    );

  const bot =
    await d
      .collection<Bot>(
        "bots"
      )
      .findOne({
        botId
      });

  if(
    !bot
  ){
    return html(
      "Bot not found.",
      404
    );
  }

  const title =
    bot.title ||
    "Website Assistant";

  return html(
`<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">

<title>${escapeHtml(title)}</title>

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
  font-family:Inter,Arial,sans-serif;
  background:transparent;
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
  padding:16px;
  background:#111827;
  color:white;
}

.headerTitle{
  font-size:16px;
  font-weight:800;
}

.headerSub{
  font-size:12px;
  opacity:.75;
  margin-top:3px;
}

.messages{
  flex:1;
  overflow:auto;
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

.user{
  margin-left:auto;
  background:#111827;
  color:white;
  border-bottom-right-radius:4px;
}

.bot{
  margin-right:auto;
  background:white;
  border:1px solid #e5e7eb;
  color:#111827;
  border-bottom-left-radius:4px;
}

.sources{
  margin-top:9px;
  padding-top:8px;
  border-top:1px solid #e5e7eb;
}

.source{
  display:block;
  font-size:12px;
  color:#2563eb;
  text-decoration:none;
  margin-top:5px;
}

.source:hover{
  text-decoration:underline;
}

.inputArea{
  display:flex;
  gap:8px;
  padding:11px;
  border-top:1px solid #e5e7eb;
  background:white;
}

.input{
  flex:1;
  min-width:0;
  border:1px solid #d1d5db;
  border-radius:10px;
  padding:11px;
  font-size:14px;
  outline:none;
}

.send{
  border:0;
  border-radius:10px;
  padding:0 15px;
  background:#111827;
  color:white;
  font-weight:700;
  cursor:pointer;
}

.send:disabled{
  opacity:.5;
}

</style>
</head>

<body>

<div class="app">

<div class="header">
  <div class="headerTitle">
    ${escapeHtml(title)}
  </div>

  <div class="headerSub">
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
  id="form"
  class="inputArea"
>

<input
  id="input"
  class="input"
  autocomplete="off"
  placeholder="Ask a question..."
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

const messages =
  document.getElementById(
    "messages"
  );

const form =
  document.getElementById(
    "form"
  );

const input =
  document.getElementById(
    "input"
  );

const send =
  document.getElementById(
    "send"
  );

const botId =
  ${JSON.stringify(botId)};

function addMessage(
  text,
  type,
  sources
){

  const div =
    document.createElement(
      "div"
    );

  div.className =
    "message " +
    type;

  div.textContent =
    text;

  if(
    sources &&
    sources.length
  ){

    const box =
      document.createElement(
        "div"
      );

    box.className =
      "sources";

    sources.forEach(
      source => {

        const link =
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
            source.type ===
            "pdf"
              ? "PDF: "
              : "Source: "
          ) +
          source.title;

        box.appendChild(
          link
        );
      }
    );

    div.appendChild(
      box
    );
  }

  messages.appendChild(
    div
  );

  messages.scrollTop =
    messages.scrollHeight;
}

form.addEventListener(
  "submit",
  async event => {

    event.preventDefault();

    const question =
      input.value.trim();

    if(!question){
      return;
    }

    addMessage(
      question,
      "user"
    );

    input.value =
      "";

    send.disabled =
      true;

    const loading =
      document.createElement(
        "div"
      );

    loading.className =
      "message bot";

    loading.textContent =
      "Thinking...";

    messages.appendChild(
      loading
    );

    messages.scrollTop =
      messages.scrollHeight;

    try{

      const response =
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
                botId,
                question
              })
          }
        );

      const text =
        await response.text();

      if(!response.ok){
        throw new Error(
          "HTTP " +
          response.status
        );
      }

      const data =
        JSON.parse(text);

      loading.remove();

      addMessage(
        data.answer ||
        "I couldn't find that information on the website.",
        "bot",
        data.sources ||
        []
      );

    }catch(error){

      loading.textContent =
        "Sorry, something went wrong. Please try again.";

    }finally{

      send.disabled =
        false;

      input.focus();
    }
  }
);

</script>

</body>
</html>`
  );
}

/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(
  value: string
) {
  return value
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
}

/* =========================================================
   MAIN WORKER
========================================================= */

export default {
  async fetch(
    request: Request,
    env: Env
  ): Promise<Response> {

    const url =
      new URL(
        request.url
      );

    const pathname =
      url.pathname;

    /*
      OPTIONS
    */

    if (
      request.method ===
      "OPTIONS"
    ) {
      return new Response(
        null,
        {
          status:204,
          headers:{
            "access-control-allow-origin":
              "*",
            "access-control-allow-methods":
              "GET,POST,OPTIONS",
            "access-control-allow-headers":
              "content-type,x-admin-key"
          }
        }
      );
    }

    /*
      HEALTH
    */

    if (
      pathname ===
      "/health"
    ) {
      return json({
        ok:true,
        service:
          "gen-solution",
        time:
          now()
      });
    }

    /*
      ADMIN HOME
    */

    if (
      pathname ===
      "/"
    ) {
      if(
        !admin(
          request,
          env
        )
      ){
        return new Response(
          "Unauthorized",
          {
            status:401
          }
        );
      }

      return html(
        adminHtml()
      );
    }

    /*
      WIDGET JS
    */

    if (
      pathname ===
      "/widget.js"
    ) {
      return new Response(
        widgetJs(
          request.url
        ),
        {
          headers:{
            "content-type":
              "application/javascript; charset=utf-8",
            "cache-control":
              "public,max-age=300"
          }
        }
      );
    }

    /*
      WIDGET
    */

    if (
      pathname ===
      "/widget"
    ) {
      const botId =
        url.searchParams.get(
          "bot"
        );

      if(
        !botId
      ){
        return html(
          "Missing bot.",
          400
        );
      }

      try{
        return await widgetPage(
          env,
          botId
        );
      }catch(error){
        return html(
          "Widget error: " +
          (
            error instanceof Error
              ? error.message
              : String(error)
          ),
          500
        );
      }
    }

    /*
      ADMIN BUILD
      Creates job ONLY.
      It does not crawl here.
    */

    if (
      pathname ===
        "/api/admin/build" &&
      request.method ===
        "POST"
    ) {

      if(
        !admin(
          request,
          env
        )
      ){
        return json(
          {
            ok:false,
            error:
              "Unauthorized"
          },
          401
        );
      }

      try{

        const body =
          await request.json()
            as {
              url?: string;
            };

        if(
          !body.url
        ){
          return json(
            {
              ok:false,
              error:
                "Website URL is required."
            },
            400
          );
        }

        const siteUrl =
          cleanUrl(
            body.url
          );

        if(
          !siteUrl
        ){
          return json(
            {
              ok:false,
              error:
                "Invalid website URL."
            },
            400
          );
        }

        if(
          privateHost(
            host(
              siteUrl
            )
          )
        ){
          return json(
            {
              ok:false,
              error:
                "Private/local URLs are not allowed."
            },
            400
          );
        }

        const result =
          await seedJob(
            env,
            siteUrl
          );

        return json({
          ok:true,
          jobId:
            result.job.jobId,
          botId:
            result.bot.botId
        });

      }catch(error){

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
      ADMIN JOB STATUS
      IMPORTANT:
      This endpoint performs NO crawling.
    */

    if (
      pathname.startsWith(
        "/api/admin/job/"
      ) &&
      request.method ===
        "GET"
    ) {

      if(
        !admin(
          request,
          env
        )
      ){
        return json(
          {
            ok:false,
            error:
              "Unauthorized"
          },
          401
        );
      }

      const jobId =
        pathname
          .split("/")
          .pop();

      if(
        !jobId
      ){
        return json(
          {
            ok:false,
            error:
              "Job ID missing."
          },
          400
        );
      }

      try{

        const d =
          await mongo(
            env.MONGODB_URI
          );

        const job =
          await d
            .collection<Job>(
              "jobs"
            )
            .findOne({
              jobId
            });

        if(
          !job
        ){
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

      }catch(error){

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
      ADMIN STEP
      Performs exactly ONE small operation.
    */

    if (
      pathname.startsWith(
        "/api/admin/step/"
      ) &&
      request.method ===
        "POST"
    ) {

      if(
        !admin(
          request,
          env
        )
      ){
        return json(
          {
            ok:false,
            error:
              "Unauthorized"
          },
          401
        );
      }

      const jobId =
        pathname
          .split("/")
          .pop();

      if(
        !jobId
      ){
        return json(
          {
            ok:false,
            error:
              "Job ID missing."
          },
          400
        );
      }

      try{

        const job =
          await buildStep(
            env,
            jobId
          );

        return json({
          ok:true,
          job
        });

      }catch(error){

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
      CHAT
    */

    if (
      pathname ===
        "/api/chat" &&
      request.method ===
        "POST"
    ) {

      try{

        const body =
          await request.json()
            as {
              botId?: string;
              question?: string;
            };

        const botId =
          body.botId?.trim();

        const question =
          body.question?.trim();

        if(
          !botId ||
          !question
        ){
          return json(
            {
              ok:false,
              error:
                "botId and question are required."
            },
            400
          );
        }

        if(
          question.length >
          1000
        ){
          return json(
            {
              ok:false,
              error:
                "Question is too long."
            },
            400
          );
        }

        const d =
          await mongo(
            env.MONGODB_URI
          );

        const bot =
          await d
            .collection<Bot>(
              "bots"
            )
            .findOne({
              botId
            });

        if(
          !bot
        ){
          return json(
            {
              ok:false,
              error:
                "Bot not found."
            },
            404
          );
        }

        if(
          bot.status !==
          "ready"
        ){
          return json({
            ok:true,
            answer:
              "The website knowledge base is still being built. Please try again shortly.",
            sources:[]
          });
        }

        const result =
          await answer(
            env,
            botId,
            question
          );

        return json({
          ok:true,
          ...result
        });

      }catch(error){

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
        status:404,
        headers:{
          "content-type":
            "text/plain; charset=utf-8"
        }
      }
    );
  }
};
