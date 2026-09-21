import { 
  AIAgentService, 
  DeliveryPhase, 
  SafetyPrecaution, 
  ClientCareCommitment, 
  AIPackage 
} from '../types';

export const FOUNDER_CONTACT = {
  name: 'Bhavesh Mali',
  role: 'Lead AI Engineer & Founder',
  agencyName: 'GenNeo AI',
  email: 'genneob2c@gmail.com',
  whatsapp: '+91 8468950877',
  whatsappUrl: 'https://wa.me/918468950877?text=Hi%20GenNeo%20Team%2C%20I%20would%20like%20to%20discuss%20building%20a%20custom%20AI%20agent%20for%20my%20website.',
  linkedinHandle: 'gen-solutions-1a64a9431',
  linkedinUrl: 'https://www.linkedin.com/in/gen-solutions-1a64a9431',
  workingHours: 'Monday – Saturday: 9:00 AM – 7:00 PM (EST / IST)',
  responseTime: 'Within 2 hours guaranteed during business hours',
  directBookingNotice: 'Direct 1-on-1 technical consultation with the lead engineer building your agent.',
  supportedLanguages: 'English & Multi-language AI Agent support'
};

export const AI_SERVICES: AIAgentService[] = [
  {
    id: 'web-scraping-ingestion',
    title: 'Intelligent Website Scraping & Data Ingestion',
    category: 'Data Scraping & Ingestion',
    tagline: 'Converting your messy web pages and PDFs into clean, vectorized AI memory',
    description: 'We don’t rely on generic LLMs that guess about your company. We deploy targeted crawlers that scrape your website, documentation, FAQs, product catalogs, pricing tables, return policies, and case studies.',
    howWeDoIt: 'Our crawler strips boilerplate HTML, extracts semantic hierarchy, deduplicates content, and splits text into optimal token chunks with parent-document metadata.',
    technicalDeliverables: [
      'Full-depth domain crawler with sitemap & dynamic JavaScript rendering',
      'PDF, DOCX, Google Docs, and FAQ knowledge parser',
      'HTML boilerplate, navigation, and advertisement cleaner',
      'Semantic chunking (500–800 token windows with 15% overlap)',
      'Data extraction audit report delivered for client review'
    ],
    clientBenefit: 'Your AI agent knows every product spec, service nuance, and company detail with zero guesswork.',
    iconName: 'Database'
  },
  {
    id: 'agent-training-rag',
    title: 'Custom AI Agent Training & RAG Engineering',
    category: 'Agent Training & RAG',
    tagline: 'Grounded in your business truth with zero hallucination tolerance',
    description: 'We build a dedicated Retrieval-Augmented Generation (RAG) system with high-dimensional vector embeddings, custom system prompts, and strict tone guidelines that match your company identity.',
    howWeDoIt: 'Queries from visitors trigger vector similarity search against your private vector database. The retrieved context is injected into a fortified system prompt with strict guardrails prohibiting speculative answers.',
    technicalDeliverables: [
      'Custom vector database deployment (Pinecone / Qdrant / pgvector)',
      'High-performance embedding pipeline with domain semantic fine-tuning',
      'System prompt engineering tailored to your brand voice & policies',
      'Strict grounding boundaries: "If not in context, state you will connect with human staff"',
      'Source attribution and verifiable document reference linking'
    ],
    clientBenefit: 'Customers receive exact, authoritative answers instantly, building immense trust and eliminating support overload.',
    iconName: 'Cpu'
  },
  {
    id: 'contextual-chatbot',
    title: 'Context-Aware Embedded Chatbot Widget',
    category: 'Contextual Chatbot',
    tagline: 'Continuously guiding your visitors and resolving intents in real time',
    description: 'A seamless, lightweight chatbot widget embedded on your website with one simple script tag. It doesn’t just output plain text; it understands context and serves interactive action cards.',
    howWeDoIt: 'When a visitor types a prompt like "I have to contact you guys", the agent immediately surfaces the exact contact context: phone numbers, direct email links, consultation schedulers, and business hours—ready to take action.',
    technicalDeliverables: [
      'Lightweight embeddable JS widget (<45kb, zero impact on page load speed)',
      'Intent detection engine (detects contact requests, pricing inquiries, support issues)',
      'Interactive UI cards (instant contact badges, appointment calendars, product cards)',
      'Full mobile responsiveness and accessible keyboard navigation',
      'Real-time streaming responses with typing indicators'
    ],
    clientBenefit: 'Visitors never get lost on your website. Friction is removed, dramatically boosting inquiries and conversions.',
    iconName: 'Bot'
  },
  {
    id: 'automated-workflows',
    title: 'Backend AI Automations & CRM Integration',
    category: 'Automated Workflows',
    tagline: 'Turning chat conversations into automated business actions',
    description: 'The chatbot doesn’t stop at answering questions. We wire it to your business tools so that customer requests trigger automated backend workflows without human intervention.',
    howWeDoIt: 'Through secure webhook triggers and API connectors, the agent captures lead info, validates email/phone, qualifies intent, schedules appointments into your calendar, and posts to your CRM or team Slack.',
    technicalDeliverables: [
      'Webhook integration with CRMs (HubSpot, Salesforce, Pipedrive, Notion)',
      'Automated Google Calendar / Calendly appointment scheduling',
      'Real-time SMS / WhatsApp / Email lead notifications to your team',
      'Lead qualification logic (scoring budget, urgency, and project scope)',
      'Zendesk / Intercom / Freshdesk ticket creation for complex support tickets'
    ],
    clientBenefit: 'Leads are captured and qualified 24/7/365 within 5 seconds, even while your team is asleep.',
    iconName: 'Workflow'
  },
  {
    id: 'continuous-sync-security',
    title: 'Automated Re-Scraping & Continuous Context Sync',
    category: 'Continuous Sync & Security',
    tagline: 'Your AI agent never goes stale when your website or pricing changes',
    description: 'Websites evolve constantly. When you launch a new service, change pricing, or publish a blog post, our automated synchronization system re-crawls the delta and refreshes the AI’s memory automatically.',
    howWeDoIt: 'Scheduled cron jobs inspect your sitemap and page hashes for updates. Any modified or newly added URL is automatically re-scraped, chunked, re-vectorized, and deployed to your live agent.',
    technicalDeliverables: [
      'Automated weekly or bi-weekly change detection crawler',
      'Incremental vector updates without service interruption or downtime',
      'Broken link & stale information purge mechanism',
      'Admin notification report whenever knowledge base updates occur',
      'Rollback capability to previous vector snapshots if needed'
    ],
    clientBenefit: 'Zero manual updating required. Your AI assistant stays 100% accurate as your business grows.',
    iconName: 'RefreshCw'
  }
];

export const DELIVERY_ROADMAP: DeliveryPhase[] = [
  {
    phase: 'Phase 01',
    days: 'Days 1 – 2',
    title: 'Website Scraping & Knowledge Extraction',
    objective: 'Scrape all public website pages, subdomains, FAQs, and documents to construct the raw knowledge baseline.',
    developerActions: [
      'Configure headless browser crawler to ingest all accessible website URLs',
      'Parse uploaded PDFs, product sheets, pricing guides, and brand documents',
      'Clean raw HTML: remove headers, footers, navigation junk, and script tags',
      'Generate semantic chunks with metadata (source URL, section title, timestamp)'
    ],
    clientInvolvement: 'Provide website URL and any internal documentation or FAQs not yet published on the live site.',
    milestoneOutput: 'Comprehensive Knowledge Extraction Audit Report delivered for your review.',
    status: 'complete'
  },
  {
    phase: 'Phase 02',
    days: 'Days 3 – 4',
    title: 'Vector Database & RAG Pipeline Architecture',
    objective: 'Generate high-dimensional embeddings and establish the private vector similarity search index.',
    developerActions: [
      'Initialize private vector database cluster with encrypted storage (AES-256)',
      'Run chunked documents through dense embedding model',
      'Configure hybrid search (BM25 keyword matching + dense vector similarity) for maximum precision',
      'Establish strict metadata filtering to prevent cross-topic confusion'
    ],
    clientInvolvement: 'Review and approve the extracted knowledge scope.',
    milestoneOutput: 'Live Vector Database ready with query latency under 45ms.',
    status: 'active'
  },
  {
    phase: 'Phase 03',
    days: 'Days 5 – 6',
    title: 'Custom Agent Training & Contextual Chatbot Widget',
    objective: 'Engineer system instructions, contextual action triggers, and branded UI widget.',
    developerActions: [
      'Formulate domain-specific system prompts with strict tone & personality rules',
      'Implement contextual intent detection: when users ask "I have to contact you guys", render interactive contact cards',
      'Build embeddable chatbot widget matching your website colors, typography, and layout',
      'Wire webhook triggers for lead capture, email notification, and calendar booking'
    ],
    clientInvolvement: 'Review interactive widget preview on a private staging sandbox.',
    milestoneOutput: 'Functional staging demo URL where you can chat with your agent in real time.',
    status: 'planning'
  },
  {
    phase: 'Phase 04',
    days: 'Days 7 – 8',
    title: 'Guardrail Hardening & 100+ Prompt Benchmarking',
    objective: 'Adversarial testing to guarantee zero hallucinations, data leaks, or inappropriate answers.',
    developerActions: [
      'Run automated test suite of 100+ domain prompts including edge cases and trick questions',
      'Verify anti-hallucination guardrails: ensure bot admits ignorance on ungrounded topics',
      'Test prompt injection defenses (jailbreak attempts, system prompt extraction tests)',
      'Benchmark response latency, mobile touch responsiveness, and fallback triggers'
    ],
    clientInvolvement: 'Test your own tricky questions against the staging agent; provide feedback on responses.',
    milestoneOutput: 'Quality Assurance & Security Benchmark Report showing 0 hallucinations.',
    status: 'planning'
  },
  {
    phase: 'Phase 05',
    days: 'Days 9 – 10',
    title: 'Production Go-Live & Automated Sync Activation',
    objective: 'Embed the chatbot into your live website with 1 line of code and activate auto-sync.',
    developerActions: [
      'Provide single-line script embed tag (`<script src="..."></script>`)',
      'Assist your team with placement or install directly via WordPress / Webflow / Shopify / Custom HTML',
      'Verify production analytics, error logging, and webhook event delivery',
      'Configure automated scheduled re-scraping cron job to keep memory fresh'
    ],
    clientInvolvement: 'Paste the script tag or grant temporary access for our engineer to install it.',
    milestoneOutput: 'Live AI Agent operational on your production website guiding visitors 24/7.',
    status: 'planning'
  }
];

export const SAFETY_PRECAUTIONS: SafetyPrecaution[] = [
  {
    id: 'precaution-anti-hallucination',
    title: 'Strict Anti-Hallucination & Source Grounding',
    subtitle: 'Zero tolerance for fabricated facts, prices, or false promises',
    threatPrevented: 'AI making up non-existent products, discount codes, or incorrect business policies.',
    technicalImplementation: 'We enforce strict Retrieval-Augmented Generation (RAG) constraints. The agent is mathematically bound to answer only from retrieved knowledge chunks. If an inquiry is outside the verified data, the agent politely states it does not have that information and offers to connect the user with a human team member.',
    guarantee: 'Zero ungrounded speculation. Every answer can cite the exact page on your website it came from.',
    iconName: 'ShieldAlert'
  },
  {
    id: 'precaution-no-model-training',
    title: 'Zero Foundational Model Training on Your Data',
    subtitle: 'Your proprietary business knowledge remains strictly private and isolated',
    threatPrevented: 'Your internal documents, pricing strategies, or customer data leaking into public AI models.',
    technicalImplementation: 'We utilize private enterprise API endpoints with zero-data-retention agreements. Your scraped data is stored exclusively in your dedicated, encrypted vector database instance (AES-256 at rest, TLS 1.3 in transit) and is never used to train public models (OpenAI, Anthropic, or Google).',
    guarantee: '100% intellectual property protection. Your data belongs exclusively to you.',
    iconName: 'Lock'
  },
  {
    id: 'precaution-prompt-injection',
    title: 'Prompt Injection & Jailbreak Defenses',
    subtitle: 'Hardened against malicious users attempting to bypass system rules',
    threatPrevented: 'Attackers trying to get the bot to say inappropriate things, leak system instructions, or act maliciously.',
    technicalImplementation: 'We implement multi-stage input sanitization, delimiter isolation between system instructions and user input, and dedicated output moderation classifiers that detect and block adversarial evasion techniques before a response is rendered.',
    guarantee: 'System prompts and internal instructions remain completely confidential and impenetrable.',
    iconName: 'FileCode'
  },
  {
    id: 'precaution-pii-scrubbing',
    title: 'PII Redaction & Privacy Compliance (GDPR/CCPA)',
    subtitle: 'Automatic masking of sensitive personal details',
    threatPrevented: 'Accidental storage or leakage of customer credit cards, social security numbers, or sensitive data.',
    technicalImplementation: 'Regex and NLP entity recognition filters intercept inbound and outbound messages. Any detected credit card patterns, passwords, or sensitive personal identifiers are scrubbed and replaced with cryptographic tokens before logging.',
    guarantee: 'Full compliance with global privacy standards, keeping your business legally protected.',
    iconName: 'EyeOff'
  },
  {
    id: 'precaution-human-fallback',
    title: 'Graceful Human Escalation & Fallback',
    subtitle: 'Never leaving a frustrated customer stuck in a dead-end loop',
    threatPrevented: 'A visitor having an urgent or emotional issue that an AI cannot resolve.',
    technicalImplementation: 'Sentiment analysis and confidence thresholds monitor every conversation. If sentiment is negative, confidence score is below 0.70, or the user explicitly asks for human intervention, the agent immediately displays direct human contact cards (phone, email, WhatsApp, or live ticket routing).',
    guarantee: 'Seamless handoff to your team within seconds whenever human judgment is required.',
    iconName: 'UserCheck'
  }
];

export const DEVELOPER_ATTENTION: ClientCareCommitment[] = [
  {
    id: 'care-direct-engineer',
    title: '1-on-1 Senior Developer Attention',
    subtitle: 'No junior account managers, outsourced ticket queues, or automated runarounds',
    description: 'When you partner with GenNeo, you work directly with Lead AI Engineer Bhavesh Mali. Every line of crawler code, system instruction, vector pipeline, and integration is architected and tested by senior engineering hands.',
    developerAttention: 'Direct access via email, WhatsApp, and private Slack/Google Meet sessions throughout scoping, development, and post-launch.',
    deliverableProof: 'Direct founder contact line: bhaveshmali1116@gmail.com with guaranteed <2h response time.',
    iconName: 'UserCog'
  },
  {
    id: 'care-100-prompt-audit',
    title: '100+ Custom Domain Prompt Testing Suite',
    subtitle: 'Rigorous pre-launch evaluation before a single real customer touches the bot',
    description: 'We don’t just deploy and hope for the best. We formulate a comprehensive testing matrix of 100+ questions specific to your business: pricing queries, edge cases, competitor comparisons, obscure policy details, and contact requests.',
    developerAttention: 'Every failure or ambiguity is manually analyzed, and knowledge chunks or system prompts are tuned until the bot achieves 100% accuracy.',
    deliverableProof: 'Complete pre-launch test transcript report provided to you before production release.',
    iconName: 'CheckCircle2'
  },
  {
    id: 'care-continuous-rescraping',
    title: 'Automated Continuous Re-Scraping',
    subtitle: 'We monitor your website so your AI assistant evolves with you',
    description: 'A website is never finished. Whenever you add a new service, change hours, modify prices, or publish articles, our automated cron crawler picks up the changes and updates the vector database seamlessly.',
    developerAttention: 'We inspect crawler logs and update reports to ensure no content was missed or improperly parsed.',
    deliverableProof: 'Automated change-detection logs and monthly vector health audit summaries.',
    iconName: 'Layers'
  },
  {
    id: 'care-telemetry-optimization',
    title: 'Conversation Telemetry & Query Analytics',
    subtitle: 'Uncovering the exact questions your customers are asking',
    description: 'We analyze conversation logs to identify high-frequency customer questions, common hesitation points, and questions where the website lacked information, providing you actionable business insights.',
    developerAttention: 'Monthly prompt tuning and content recommendations to help you improve both your website and your AI agent.',
    deliverableProof: 'Monthly Customer Intent & Gap Analysis Report highlighting untapped sales opportunities.',
    iconName: 'BarChart3'
  }
];

export const AI_PACKAGES: AIPackage[] = [
  {
    id: 'starter-ai-agent',
    name: 'Starter AI Agent & Web Scraping',
    price: '$999',
    monthlyPrice: '$222 / mo',
    turnaroundTime: '5 – 7 Business Days',
    bestFor: 'Service businesses, clinics, consultancies, and local companies needing instant customer guidance and 24/7 lead capture.',
    description: 'Complete data scraping of your website, custom vector memory training, and a sleek, branded chatbot widget embedded on your site.',
    scrapingScope: 'Up to 30 website pages, service descriptions, pricing, and FAQs',
    agentCapabilities: [
      'Fully custom-trained AI Agent grounded in your exact business data',
      'Context-aware intent responses (Contact info, services, hours, policies)',
      'Interactive Contact Card ("I have to contact you guys" trigger)',
      'Branded floating & embedded chat widget with custom colors & logo',
      'Anti-hallucination guardrails & 50-prompt accuracy test suite',
      '1-line embed script tag for any website platform'
    ],
    automationsIncluded: [
      'Direct lead capture form with email alert to your inbox',
      'Click-to-call and WhatsApp direct routing',
      'Basic inquiry logging dashboard'
    ],
    securityAndPrecautions: [
      'Zero model training on your data',
      'Encrypted private vector database',
      'Input sanitization & prompt injection defense',
      'Human fallback routing trigger'
    ],
    developerAttention: 'Direct 1-on-1 setup with Lead Developer, monthly automated re-scraping & continuous vector updates.'
  },
  {
    id: 'growth-ai-agent',
    name: 'Growth AI Agent + Automations',
    price: '$1,111',
    monthlyPrice: '$333 / mo',
    badge: 'Most Popular & High Conversion',
    turnaroundTime: '7 – 10 Business Days',
    bestFor: 'B2B companies, E-Commerce, SaaS, and busy agencies needing deep multi-source scraping and automated CRM/calendar workflows.',
    description: 'Deep scraping across your entire website, documentation, and PDFs, paired with automated calendar booking, CRM sync, and advanced lead scoring.',
    scrapingScope: 'Up to 100 pages, external PDFs, user manuals, Notion docs, and product catalogs',
    agentCapabilities: [
      'Advanced multi-document RAG with hybrid semantic search',
      'Dynamic contextual cards: Calendly booking, product previews, contact badges',
      'Contextual navigation: Bot can guide visitors to specific URLs on your site',
      'Multilingual support (auto-detects and replies in 50+ languages)',
      'Comprehensive 100+ prompt adversarial test suite with 0-hallucination verification',
      'Custom CSS styling matching your website layout down to the pixel'
    ],
    automationsIncluded: [
      'Direct CRM integration (HubSpot, Salesforce, Pipedrive, or Airtable)',
      'Automated Google Calendar / Calendly appointment scheduling',
      'Instant SMS/WhatsApp lead alerts directly to your sales team',
      'Automated Zendesk / Freshdesk support ticket creation'
    ],
    securityAndPrecautions: [
      'Strict Zero-Trust data isolation & AES-256 encryption',
      'Automated PII scrubbing (phone/email masking)',
      'Advanced multi-tier prompt injection & jailbreak firewall',
      'Sentiment analysis with instant human escalation'
    ],
    developerAttention: 'Direct WhatsApp/Email priority channel with Lead Developer, continuous prompt tuning & weekly re-scraping.'
  },
  {
    id: 'enterprise-orchestration',
    name: 'Custom Enterprise AI Orchestration',
    price: 'Custom Quote',
    monthlyPrice: 'Flexible Retainer',
    turnaroundTime: '10 – 14 Business Days',
    bestFor: 'Enterprises, multi-brand companies, and organizations requiring custom API tool execution and private VPC deployments.',
    description: 'Custom multi-agent architecture with live database read/write tools, private VPC deployment, and specialized internal workflow automations.',
    scrapingScope: 'Unlimited pages, enterprise knowledge bases, API schemas, and internal documentation',
    agentCapabilities: [
      'Multi-agent orchestration (Sales Agent + Technical Support Agent + Account Manager)',
      'Real-time API tool calling (look up order status, query live database, calculate custom quotes)',
      'On-premises / Private Cloud LLM hosting (AWS Bedrock / Azure / Google Cloud Vertex AI)',
      'Custom fine-tuned open-source models (Llama 3 / Mistral) if required',
      'Dedicated admin control center with conversation audit logs and telemetry'
    ],
    automationsIncluded: [
      'Custom enterprise ERP / database bidirectional synchronization',
      'Custom webhook triggers with HMAC authentication',
      'Multi-department routing and automated escalation trees',
      'Custom SLA uptime and emergency engineering hotline'
    ],
    securityAndPrecautions: [
      'SOC2 / HIPAA / GDPR compliance architectural review',
      'Dedicated isolated tenant infrastructure',
      'Role-based access control (RBAC) & audit logging',
      'Automated vulnerability penetration testing'
    ],
    developerAttention: 'Dedicated Senior AI Architect retainer, weekly strategic reviews, continuous model monitoring, and automated daily re-scraping.'
  }
];

// Presets for the interactive Contextual AI Chatbot Demo
export const DEMO_PRESET_PROMPTS = [
  'I have to contact you guys.',
  'How do you scrape my website and train the AI?',
  'What precautions do you take with my business data?',
  'When will you deliver my AI agent and what is the timeline?',
  'How much does it cost and what is included?'
];

export const AGENCY_INFO = {
  name: 'GenNeo AI',
  tagline: 'Custom AI Agents & Autonomous Website Automations',
  founderName: FOUNDER_CONTACT.name,
  founderTitle: FOUNDER_CONTACT.role,
  founderEmail: FOUNDER_CONTACT.email,
  mission: 'Engineering private, grounded AI agents that continuously guide website visitors with zero hallucinations.'
};

// Hitachi Vantara-inspired Core Pillars of Excellence
export const ENTERPRISE_PILLARS = [
  {
    id: 'pillar-availability',
    number: '01',
    title: '100% Grounded Data Availability & Zero Hallucination Guarantee',
    eyebrow: 'DETERMINISTIC RETRIEVAL-AUGMENTED GENERATION',
    summary: 'Just as enterprise infrastructure demands 100% uptime, enterprise intelligence demands 100% grounded truth. We mathematically bind our models to your scraped knowledge base with source verification.',
    highlightStat: '100%',
    highlightLabel: 'Grounded Retrieval Availability SLA',
    keyCapabilities: [
      'Source-cited responses referencing exact live URLs and document paragraphs',
      'Dual-threshold confidence scoring: strictly rejects speculative generation',
      'Dynamic fallback to direct human engineer escalation when data is absent',
      'Hybrid semantic vector search + BM25 keyword precision matching'
    ],
    enterpriseImpact: 'Eliminates legal liabilities, brand reputational hazards, and incorrect pricing quotes that plague generic LLMs.',
    architectureDetails: 'Vectors embedded with 1536-dim text-embedding-3-large, normalized cosine similarity, sub-50ms query latency.',
    iconName: 'ShieldCheck'
  },
  {
    id: 'pillar-security',
    number: '02',
    title: 'Resilient Data Security & Complete IP Isolation',
    eyebrow: 'ZERO FOUNDATIONAL MODEL TRAINING',
    summary: 'Your website architecture, internal docs, product margins, and customer conversations remain strictly confidential. We enforce absolute isolation with zero public model training.',
    highlightStat: '0%',
    highlightLabel: 'Data Exposure to Public AI Training Sets',
    keyCapabilities: [
      'Encrypted-at-rest (AES-256) and in-transit (TLS 1.3) vector database instances',
      'Automated PII scrubbing (masks credit cards, emails, phone numbers, and keys)',
      'Delimiter-hardened system prompt barriers impenetrable to jailbreak injection',
      'Full compliance architecture aligning with GDPR, CCPA, and SOC2 principles'
    ],
    enterpriseImpact: 'Confidently deploy conversational AI knowing your proprietary trade secrets and customer privacy are fortress-protected.',
    architectureDetails: 'Isolated namespace partitioning with cryptographic tokenization before logging or storage.',
    iconName: 'Lock'
  },
  {
    id: 'pillar-ingestion',
    number: '03',
    title: 'Dynamic Hybrid Ingestion & Continuous Parity',
    eyebrow: 'AUTOMATED RE-SCRAPING CRAWLERS',
    summary: 'Websites and catalogs change daily. Our autonomous headless crawlers ingest complex DOM structures, PDFs, and documentation, then continuously re-sync delta changes without downtime.',
    highlightStat: '24/7',
    highlightLabel: 'Automated Delta Sync & Knowledge Parity',
    keyCapabilities: [
      'Headless browser execution capable of rendering dynamic client-side JS & React DOMs',
      'Recursive sitemap navigation with intelligent rate-limiting and robots etiquette',
      'Semantic document chunking with 15% sliding window overlap to preserve context',
      'Scheduled weekly/bi-weekly delta cron jobs with automatic cache invalidation'
    ],
    enterpriseImpact: 'Zero maintenance burden on your team. When you update your product, pricing, or terms, your AI is updated automatically.',
    architectureDetails: 'Puppeteer/Playwright headless engines, AST semantic parser, parent-child document metadata hierarchy.',
    iconName: 'RefreshCw'
  },
  {
    id: 'pillar-actions',
    number: '04',
    title: 'Context-Aware Intent Detection & Instant Action Cards',
    eyebrow: 'AUTONOMOUS BUSINESS EXECUTION',
    summary: 'Standard bots output passive walls of text. GenNeo AI detects high-value buying and contact intents in milliseconds, surfacing interactive contact cards, scheduling widgets, and webhook automations.',
    highlightStat: '4.4x',
    highlightLabel: 'Average Increase in Qualified Lead Conversion',
    keyCapabilities: [
      'Immediate action card rendering when users say "I have to contact you guys"',
      'Direct one-click scheduling with Google Calendar, Calendly, or direct phone dispatch',
      'Bidirectional CRM webhooks (HubSpot, Salesforce, Pipedrive, Slack, Webhooks)',
      'Zero-friction lead capture capturing verified name, domain, email, and intent scope'
    ],
    enterpriseImpact: 'Turns casual website browsing into closed deals, qualified sales pipelines, and instant customer resolution 24/7/365.',
    architectureDetails: 'Sub-45ms intent classification layer triggering dynamic JSON-schema UI card components in the client widget.',
    iconName: 'Zap'
  },
  {
    id: 'pillar-developer',
    number: '05',
    title: 'Direct Senior Engineering Partnership & 100+ Test Suite',
    eyebrow: 'CO-ENGINEERED WITH LEAD DEVELOPER',
    summary: 'No ticket queues, automated runarounds, or outsourced junior contractors. You collaborate 1-on-1 with Lead AI Engineer Bhavesh Mali, backed by a 100+ prompt adversarial verification suite before launch.',
    highlightStat: '7–10',
    highlightLabel: 'Days From Ingestion to Production Deployment',
    keyCapabilities: [
      'Direct line to Lead AI Engineer Bhavesh Mali (bhaveshmali1116@gmail.com, <2h response)',
      '100+ custom adversarial test suite checking edge cases, trick questions, and prompt safety',
      'Single-line script embed installation with full custom CSS branding adaptation',
      'Post-launch telemetry dashboard and monthly query gap optimization reports'
    ],
    enterpriseImpact: 'White-glove engineering certainty. You know exactly who is writing the crawler code and securing your AI agent.',
    architectureDetails: 'Custom staging sandbox environment with recorded transcript audits prior to production cutover.',
    iconName: 'UserCog'
  }
];

// Hitachi Vantara-style Comparison Matrix
export const COMPARISON_METRICS = [
  {
    feature: 'Data Grounding & Truth',
    category: 'Accuracy',
    genericChatbot: 'Hallucinates guesses; answers from generic public internet data.',
    genneoEnterprise: '100% mathematically grounded in your verified scraped website data & docs.',
    advantage: 'Zero liability; verifiable source citations on every single answer.',
    criticalForEnterprise: true
  },
  {
    feature: 'Data Privacy & Training',
    category: 'Security',
    genericChatbot: 'Data frequently logged and used to train public foundational models.',
    genneoEnterprise: 'Zero model training. Dedicated encrypted vector instance (AES-256).',
    advantage: 'Proprietary IP and trade secrets are never leaked or shared.',
    criticalForEnterprise: true
  },
  {
    feature: 'Intent-to-Action Execution',
    category: 'Conversion',
    genericChatbot: 'Passive text output; tells users to go find the contact page themselves.',
    genneoEnterprise: 'Renders rich interactive contact cards, booking modals, and CRM webhooks instantly.',
    advantage: 'Instant action when users ask "I have to contact you guys". 4.4x higher conversion.',
    criticalForEnterprise: true
  },
  {
    feature: 'Continuous Knowledge Sync',
    category: 'Maintenance',
    genericChatbot: 'Static upload; becomes outdated the moment your website or pricing changes.',
    genneoEnterprise: 'Automated cron crawlers detect website deltas and update vector memory automatically.',
    advantage: 'Zero manual re-uploading needed; always synchronized with live reality.',
    criticalForEnterprise: true
  },
  {
    feature: 'Engineering & Support',
    category: 'Reliability',
    genericChatbot: 'Impersonal SaaS support, outsourced help desks, generic ticket queues.',
    genneoEnterprise: 'Direct 1-on-1 partnership with Lead AI Engineer Bhavesh Mali (<2h response SLA).',
    advantage: 'Custom tailored code, bespoke prompt tuning, and senior engineering attention.',
    criticalForEnterprise: true
  },
  {
    feature: 'Adversarial Pre-Launch Testing',
    category: 'Quality Assurance',
    genericChatbot: 'None. Customer is the guinea pig in production.',
    genneoEnterprise: '100+ custom adversarial prompt matrix tested and audited prior to go-live.',
    advantage: 'Pre-tested resilience against edge cases, competitor queries, and prompt injections.',
    criticalForEnterprise: true
  },
  {
    feature: 'Deployment Friction',
    category: 'Architecture',
    genericChatbot: 'Heavy SDKs, complex backend rewrites, or bloated iframes.',
    genneoEnterprise: 'Single lightweight `<script>` embed tag (<45kb), zero performance penalty.',
    advantage: 'Works instantly on Next.js, WordPress, Shopify, Webflow, React, or custom HTML.',
    criticalForEnterprise: false
  }
];

// Hitachi Vantara-style Industry Solutions Showcase
export const INDUSTRY_SOLUTIONS = [
  {
    id: 'solution-fintech',
    industry: 'Financial Services & FinTech',
    headline: 'Secure, Grounded Financial Guidance & Compliant Lead Capture',
    description: 'Financial institutions require uncompromising accuracy. Our agents guide prospective clients through loan tiers, compliance disclosures, and fee schedules with zero hallucination risk.',
    dataSources: ['Compliance Disclosures', 'Interest Rate Sheets', 'Application Guides', 'Fee Tables', 'Whitepapers'],
    agentWorkflow: 'Verifies eligibility thresholds, explains policy requirements, and routes high-net-worth inquiries directly to senior advisors via authenticated CRM hooks.',
    provenOutcome: '3.8x faster qualification of commercial financing leads; 100% adherence to regulatory disclosure rules.',
    complianceBadge: 'SOC2 & PII Masking Compliant',
    iconName: 'Building2'
  },
  {
    id: 'solution-saas',
    industry: 'Enterprise B2B SaaS & Tech',
    headline: 'Autonomous Technical Documentation & High-Intent Sales Engineering',
    description: 'Transform complex API docs, integrations, pricing tiers, and SLA terms into an interactive sales engineer that guides developers and CIOs 24/7.',
    dataSources: ['API Documentation', 'Changelogs & Release Notes', 'Security Whitepapers', 'Pricing Matrices', 'Integration Guides'],
    agentWorkflow: 'Answers deep architectural questions with exact documentation citations and books technical demo calls with sales engineers.',
    provenOutcome: '52% reduction in initial support ticket volume; 4.6x increase in scheduled enterprise demo calls.',
    complianceBadge: 'Zero Public Training SLA',
    iconName: 'Cpu'
  },
  {
    id: 'solution-ecommerce',
    industry: 'High-Volume Enterprise E-Commerce',
    headline: 'Real-Time Catalog Guidance, Fitment Matching & Intent Conversion',
    description: 'Help shoppers discover exact product variants, compatibility requirements, shipping rules, and return policies without digging through thousands of pages.',
    dataSources: ['Product Specs & SKUs', 'Sizing & Compatibility Guides', 'Return & Shipping Policies', 'Customer FAQs', 'Warranty Documents'],
    agentWorkflow: 'Provides direct product deep-links, answers compatibility queries, and renders instantaneous return/exchange guidance.',
    provenOutcome: '28% decrease in cart abandonment; 64% reduction in pre-purchase live chat inquiries.',
    complianceBadge: 'Sub-45ms Vector Latency',
    iconName: 'ShoppingCart'
  },
  {
    id: 'solution-healthcare',
    industry: 'Healthcare & Specialized Professional Services',
    headline: 'Strictly Grounded Patient & Client Inquiry Triage',
    description: 'Deliver compassionate, highly structured guidance regarding services, practitioner specialties, locations, and intake steps with absolute PII protection.',
    dataSources: ['Service Catalogues', 'Practitioner Bios', 'Intake Protocols', 'Location & Hours', 'Insurance Acceptance Guides'],
    agentWorkflow: 'Guides clients through intake requirements, strictly refrains from medical diagnosis, and routes urgent requests to on-call coordinators.',
    provenOutcome: 'Zero compliance breaches; 94% patient satisfaction rating during after-hours website visits.',
    complianceBadge: 'PII Scrubbing & HIPAA Alignment',
    iconName: 'Activity'
  }
];

export const HITACHI_STYLE_STATS = [
  {
    stat: '100%',
    label: 'Grounded Data Availability',
    detail: 'Mathematical citation guarantee with zero speculative hallucinations.'
  },
  {
    stat: '< 1.2s',
    label: 'Hybrid Context Latency',
    detail: 'Sub-second semantic vector retrieval with real-time streaming tokens.'
  },
  {
    stat: '0%',
    label: 'Public LLM Data Leakage',
    detail: 'Zero client data fed to OpenAI, Anthropic, or public models.'
  },
  {
    stat: '4.4x',
    label: 'Qualified Lead Surge',
    detail: 'Instant conversion cards when users prompt "I have to contact you guys".'
  },
  {
    stat: '7–10 Days',
    label: 'Production Deployment SLA',
    detail: 'From initial domain crawl to live embed on your production website.'
  }
];
