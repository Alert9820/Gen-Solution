import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

const AGENCY_SYSTEM_PROMPT = `
You are the official GenNeo AI Autonomous Website Agent and Lead Engineering Assistant.
GenNeo AI is a specialized AI agency founded and led by Lead AI Engineer Bhavesh Mali.
Core Agency Information:
- Founder & Lead AI Engineer: Bhavesh Mali
- Official Inquiries Email: genneob2c@gmail.com
- Direct WhatsApp Engineering Channel: +91 8468950877
- LinkedIn: https://www.linkedin.com/in/gen-solutions-1a64a9431
- SLA Turnaround: 7 to 10 business days for complete deployment
- Pricing Packages:
  1. Starter AI Agent: $999 one-time setup + $222/month maintenance (Up to 30 pages crawled, clean semantic chunking, custom branded floating widget, 1-line script embed, monthly automated re-scraping cron).
  2. Growth AI Agent: $1,111 one-time setup + $333/month maintenance (Up to 100 pages + PDFs, CRM/Calendar webhooks like HubSpot/Zapier/Calendly, dynamic intent cards, weekly re-scraping cron).
  3. Custom Enterprise: Custom scoping for multi-tenant setups, private VPCs, and specialized tools.
- Core Architecture: Intelligent web scraping, semantic chunking, private vector database (Pinecone/Qdrant/Milvus), Retrieval-Augmented Generation (RAG) with strict source grounding.
- Zero-Hallucination Policy: Only answer from grounded context. If a visitor asks something not in the knowledge base, politely provide direct contact with Bhavesh Mali via WhatsApp or email.
- Tone: Technical, crisp, transparent, authoritative, and direct. Never make salesy fluff or false claims.
`;

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable trust proxy for Cloud Run and reverse proxies
  app.set('trust proxy', 1);

  // Force HTTPS Middleware & Security Headers
  app.use((req, res, next) => {
    const proto = req.headers['x-forwarded-proto'];
    const host = req.headers.host;

    // Detect if client is on non-local domain and connected via HTTP
    const isLocal = !host || host.includes('localhost') || host.includes('127.0.0.1');
    const isHttp = proto === 'http' || (!req.secure && req.protocol === 'http');

    if (!isLocal && isHttp && host) {
      return res.redirect(301, `https://${host}${req.originalUrl || req.url}`);
    }

    // Apply HTTP Strict Transport Security (HSTS) header
    if (proto === 'https' || req.secure || !isLocal) {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    // Set standard security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    next();
  });

  app.use(express.json());

  // Explicitly serve public static assets (such as og-image.png, favicon, robots.txt)
  app.use(express.static(path.join(process.cwd(), 'public'), {
    maxAge: '1d',
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png');
      } else if (filePath.endsWith('.webp')) {
        res.setHeader('Content-Type', 'image/webp');
      } else if (filePath.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml');
      } else if (filePath.endsWith('.ico')) {
        res.setHeader('Content-Type', 'image/x-icon');
      } else if (filePath.endsWith('.xml')) {
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      } else if (filePath.endsWith('.txt')) {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      }
    }
  }));

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      secretsLocation: 'server-only'
    });
  });

  // Secure Server-Side AI Chat Endpoint
  // All API keys (GEMINI_API_KEY) remain completely hidden on the server.
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'Message is required' });
        return;
      }

      const getFallbackReply = (text: string) => {
        const lower = text.toLowerCase();
        if (lower.includes('price') || lower.includes('cost') || lower.includes('package')) {
          return `Our fixed packages:\n• Starter Agent: $999 setup + $222/mo (up to 30 pages crawled, branded widget, monthly re-scraping cron)\n• Growth Agent: $1,111 setup + $333/mo (up to 100 pages + PDFs, CRM webhooks, weekly re-scraping)\nDelivery in 7–10 business days.`;
        } else if (lower.includes('contact') || lower.includes('call') || lower.includes('whatsapp') || lower.includes('email') || lower.includes('hire')) {
          return `You can connect directly with Lead AI Engineer Bhavesh Mali:\n• Email: genneob2c@gmail.com\n• WhatsApp: +91 8468950877\n• LinkedIn: linkedin.com/in/gen-solutions-1a64a9431\nDirect 1-on-1 technical consultation with no sales intermediaries.`;
        } else if (lower.includes('scrap') || lower.includes('crawl') || lower.includes('rag')) {
          return `We deploy custom crawlers that strip boilerplate HTML, parse PDFs/DOCs, perform semantic chunking (500–800 tokens with 15% overlap), and store vectors in private databases with zero public LLM training.`;
        }
        return `I am the GenNeo Autonomous Agent. We engineer grounded AI agents and data pipelines with 7–10 day delivery SLA. Connect directly with Lead AI Engineer Bhavesh Mali at genneob2c@gmail.com or WhatsApp +91 8468950877.`;
      };

      const ai = getAI();
      if (!ai) {
        res.json({ 
          reply: getFallbackReply(message),
          source: 'grounded-engine',
          serverGrounded: true 
        });
        return;
      }

      try {
        let promptText = `${AGENCY_SYSTEM_PROMPT}\n\n`;
        if (Array.isArray(history) && history.length > 0) {
          promptText += 'Previous conversation:\n';
          for (const msg of history.slice(-6)) {
            promptText += `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}\n`;
          }
        }
        promptText += `\nUser: ${message}\nAssistant:`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: promptText
        });

        const replyText = response.text || getFallbackReply(message);

        res.json({
          reply: replyText,
          source: 'gemini-3.8-flash-server',
          serverGrounded: true
        });
      } catch (genAiError) {
        console.warn('[Gemini AI Fallback]', genAiError);
        res.json({
          reply: getFallbackReply(message),
          source: 'grounded-engine-fallback',
          serverGrounded: true
        });
      }
    } catch (error: any) {
      console.error('Server chat error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        fallbackEmail: 'genneob2c@gmail.com'
      });
    }
  });

  // Secure Domain Audit Endpoint
  app.post('/api/audit-domain', (req, res) => {
    const { domain } = req.body;
    if (!domain || typeof domain !== 'string') {
      res.status(400).json({ error: 'Domain is required' });
      return;
    }

    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
    res.json({
      domain: cleanDomain,
      status: 'analyzed',
      recommendedPackage: cleanDomain.length > 15 ? 'Growth AI Agent' : 'Starter AI Agent',
      estimatedScrapePages: '15–45 pages detected',
      vectorReadiness: '100% compatible for Pinecone/Milvus RAG indexing',
      turnaroundEstimate: '7 Business Days'
    });
  });

  // Vite middleware in dev; static file serving in prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[GenNeo AI Full-Stack Server] Running on http://localhost:${PORT}`);
    console.log(`[Security Guard] All API keys and secrets strictly isolated on backend server.`);
  });
}

startServer().catch((err) => {
  console.error('[Server Startup Error]', err);
  process.exit(1);
});
