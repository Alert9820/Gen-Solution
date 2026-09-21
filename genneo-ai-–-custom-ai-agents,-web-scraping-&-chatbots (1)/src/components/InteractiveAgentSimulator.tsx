import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Copy, 
  ArrowRight, 
  ShieldCheck, 
  RefreshCw,
  Zap,
  PhoneCall,
  ExternalLink
} from 'lucide-react';
import { WhatsAppIcon, LinkedInIcon, MailIcon } from './CustomSocialIcons';
import { GenNeoAgentAvatar } from './GenNeoAgentAvatar';
import { ChatMessage } from '../types';
import { FOUNDER_CONTACT, DEMO_PRESET_PROMPTS } from '../data/agencyData';

interface InteractiveAgentSimulatorProps {
  onOpenConsultation: () => void;
}

export const InteractiveAgentSimulator: React.FC<InteractiveAgentSimulatorProps> = ({
  onOpenConsultation
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am your custom GenNeo AI Assistant, trained directly on your website, service docs, and product workflows.\n\nTry asking anything—for example, click **"I have to contact you guys."** to see how I instantly surface direct contact channels, or ask about our scraping pipeline and 7–10 day delivery!`,
      timestamp: 'Just now',
      isContextCard: false
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(FOUNDER_CONTACT.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const generateResponse = (prompt: string): ChatMessage => {
    const p = prompt.toLowerCase().trim();

    // 1. Contact prompt (User's primary highlighted requirement)
    if (
      p.includes('contact') || 
      p.includes('reach') || 
      p.includes('email') || 
      p.includes('phone') || 
      p.includes('hire') || 
      p.includes('call') ||
      p.includes('touch') ||
      p.includes('talk')
    ) {
      return {
        id: Date.now().toString(),
        sender: 'assistant',
        text: `Here is the direct contact intelligence for our team. You connect directly with Lead AI Engineer ${FOUNDER_CONTACT.name}—no waitlists, junior account reps, or automated runarounds.`,
        timestamp: 'Just now',
        isContextCard: true,
        contextType: 'contact',
        metadata: {
          email: FOUNDER_CONTACT.email,
          hours: FOUNDER_CONTACT.workingHours,
          responseTime: FOUNDER_CONTACT.responseTime,
          actionLabel: 'Schedule Technical Discovery Call',
          actionType: 'open-consultation'
        }
      };
    }

    // 2. Scraping and training prompt
    if (
      p.includes('scrape') || 
      p.includes('scraping') || 
      p.includes('train') || 
      p.includes('ingest') || 
      p.includes('data') || 
      p.includes('pdf') ||
      p.includes('how do you')
    ) {
      return {
        id: Date.now().toString(),
        sender: 'assistant',
        text: `### How We Ingest & Train On Your Data:\n\n1. **Headless Website Ingestion:** We crawl all public pages, sitemaps, PDFs, and FAQs on your domain.\n2. **Boilerplate Stripping:** Navbars, footers, and scripts are removed to extract clean, dense text.\n3. **Semantic Vectorization:** Text is split into coherent 500-token chunks with 15% overlap and stored in a private, encrypted vector store.\n4. **Grounded RAG Execution:** When visitors ask a question, the agent retrieves the exact paragraph from your data and formulates a precise, cited answer.`,
        timestamp: 'Just now',
        isContextCard: true,
        contextType: 'scraping',
        metadata: {
          actionLabel: 'Audit My Website For Scraping',
          actionType: 'open-consultation'
        }
      };
    }

    // 3. Precautions and Security prompt
    if (
      p.includes('precaution') || 
      p.includes('security') || 
      p.includes('safe') || 
      p.includes('privacy') || 
      p.includes('hallucinat') || 
      p.includes('leak') ||
      p.includes('gdpr')
    ) {
      return {
        id: Date.now().toString(),
        sender: 'assistant',
        text: `### Security Guardrails We Enforce:\n\n- **Zero Hallucinations:** Answers are mathematically bound to your scraped content. If unknown, it routes to human contact.\n- **Zero Model Training:** Your proprietary data is never used to train public LLMs.\n- **Jailbreak Defense:** Multi-layered input sanitization prevents system prompt extraction.\n- **Automatic PII Scrubbing:** Sensitive customer numbers and emails are masked before retrieval.`,
        timestamp: 'Just now',
        isContextCard: true,
        contextType: 'precautions',
        metadata: {
          actionLabel: 'Review Security Specifications',
          actionType: 'open-consultation'
        }
      };
    }

    // 4. Timeline prompt
    if (
      p.includes('when') || 
      p.includes('timeline') || 
      p.includes('how long') || 
      p.includes('turnaround') || 
      p.includes('days')
    ) {
      return {
        id: Date.now().toString(),
        sender: 'assistant',
        text: `### Turnaround Timeline (7 – 10 Days Total):\n\n- **Days 1–2:** Website crawl, PDF ingestion & extraction report.\n- **Days 3–4:** Vector pipeline setup & semantic chunk tuning.\n- **Days 5–6:** Branded widget configuration & prompt engineering.\n- **Days 7–8:** 100+ Prompt adversarial stress-testing.\n- **Days 9–10:** Production deployment via a single-line embed script.`,
        timestamp: 'Just now',
        isContextCard: true,
        contextType: 'timeline',
        metadata: {
          actionLabel: 'Book Deployment Slot',
          actionType: 'open-consultation'
        }
      };
    }

    // 5. Pricing and Packages
    if (
      p.includes('price') || 
      p.includes('cost') || 
      p.includes('package') || 
      p.includes('fee') || 
      p.includes('how much')
    ) {
      return {
        id: Date.now().toString(),
        sender: 'assistant',
        text: `### Transparent Engineering Packages:\n\n1. **Starter AI Agent ($999 setup + $222/mo):** Up to 30 pages scraped, custom vector memory, 1-line script embed, 5–7 day turnaround.\n2. **Growth AI Agent ($1,111 setup + $333/mo):** Full domain + PDFs, weekly auto-sync cron, CRM webhooks, calendar booking.\n3. **Custom Enterprise (Custom Quote):** Multi-domain, private cloud vector hosting, SOC-2/GDPR compliance, dedicated engineering support.`,
        timestamp: 'Just now',
        isContextCard: true,
        contextType: 'packages',
        metadata: {
          actionLabel: 'View Packages & Scopes',
          actionType: 'open-consultation'
        }
      };
    }

    // Default intelligent contextual response
    return {
      id: Date.now().toString(),
      sender: 'assistant',
      text: `Thanks for your inquiry! This autonomous agent is trained directly on your business knowledge. It can answer product inquiries, quote technical capabilities, or immediately convert visitors by surfacing contact cards.\n\nWould you like to schedule a technical discovery call with Lead AI Engineer ${FOUNDER_CONTACT.name}?`,
      timestamp: 'Just now',
      isContextCard: true,
      contextType: 'general',
      metadata: {
        actionLabel: 'Schedule 15-Min Scoping Call',
        actionType: 'open-consultation'
      }
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      timestamp: 'Just now'
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: messages.slice(-4)
        })
      });

      const data = await res.json().catch(() => null);
      const baseResponse = generateResponse(text);

      // If server returned a dedicated reply and it's not a generic fallback, blend the text
      if (data?.reply && data.source === 'gemini-3.8-flash-server') {
        setMessages((prev) => [
          ...prev, 
          {
            ...baseResponse,
            id: (Date.now() + 1).toString(),
            text: data.reply
          }
        ]);
      } else {
        setMessages((prev) => [...prev, baseResponse]);
      }
    } catch {
      const response = generateResponse(text);
      setMessages((prev) => [...prev, response]);
    } finally {
      setIsTyping(false);
    }
  };

  const handlePresetClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div id="interactive-demo" className="bg-[#FAF8F5] border border-[#DFD9CC] rounded-2xl overflow-hidden shadow-lg shadow-[#162422]/5 flex flex-col h-[460px] sm:h-[480px] w-full font-sans">
      {/* Header Bar */}
      <div className="px-3 sm:px-4 py-2.5 bg-[#EFECE3] border-b border-[#DFD9CC] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <GenNeoAgentAvatar
            sizeClassName="w-7 h-7 sm:w-7.5 sm:h-7.5"
            withStatusDot
            statusPosition="bottom-right"
            statusColor="bg-emerald-500"
            alt="GenNeo AI Autonomous Agent Avatar"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-sm font-bold text-[#11201D] tracking-tight font-display truncate">GenNeo Autonomous Agent</span>
              <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full bg-[#004741]/12 text-[#003833] border border-[#004741]/30 font-bold shrink-0">
                Live Simulator
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#253935] font-medium truncate">
              Grounded in website knowledge &bull; Zero hallucinations
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: 'reset',
                sender: 'assistant',
                text: `Conversation reset. Try asking: **"I have to contact you guys."** or **"How do you scrape my website and train the AI?"**`,
                timestamp: 'Just now'
              }
            ]);
          }}
          className="text-xs text-[#2B403C] hover:text-[#11201D] min-h-[36px] px-2.5 py-1 rounded-lg hover:bg-[#DDD8CC] transition-colors flex items-center gap-1 cursor-pointer font-semibold shrink-0"
          title="Reset conversation"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden xs:inline sm:inline">Reset</span>
        </button>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-3 sm:px-3.5 py-2 bg-[#E2DDD2] border-b border-[#CDC6B6] overflow-x-auto flex items-center gap-2 scrollbar-none touch-pan-x">
        <span className="text-xs text-[#162724] whitespace-nowrap font-bold flex items-center gap-1 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-[#004741]" />
          Try:
        </span>
        {DEMO_PRESET_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handlePresetClick(prompt)}
            className="text-xs bg-white hover:bg-[#004741]/10 hover:text-[#004741] text-[#1A2E2B] px-3 py-1.5 rounded-full border border-[#CDC6B6] shadow-2xs transition-all whitespace-nowrap cursor-pointer flex-shrink-0 font-semibold min-h-[34px] flex items-center"
          >
            "{prompt}"
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 bg-[#FAF8F5]/70">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <GenNeoAgentAvatar
                sizeClassName="w-8 h-8"
                className="mt-0.5 shrink-0"
                alt="GenNeo AI Grounded Knowledge Node"
              />
            )}

            <div className={`max-w-[88%] sm:max-w-[78%] space-y-3`}>
              {/* Message Bubble */}
              <div
                className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#004741] text-white font-medium rounded-tr-none ml-auto shadow-sm'
                    : 'bg-white border border-[#CDC6B6] text-[#12221F] rounded-tl-none shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-line space-y-2">
                  {msg.text.split('\n\n').map((paragraph, pIdx) => {
                    if (paragraph.startsWith('### ')) {
                      return (
                        <div key={pIdx} className="font-bold text-[#004741] text-sm sm:text-base border-b border-[#CDC6B6] pb-1 pt-1">
                          {paragraph.replace('### ', '')}
                        </div>
                      );
                    }
                    return (
                      <p key={pIdx}>
                        {paragraph.split('**').map((part, bIdx) => 
                          bIdx % 2 === 1 ? (
                            <strong key={bIdx} className={msg.sender === 'user' ? 'font-bold text-white underline decoration-[#004741]' : 'font-bold text-[#11201D]'}>
                              {part}
                            </strong>
                          ) : (
                            part
                          )
                        )}
                      </p>
                    );
                  })}
                </div>
              </div>

              {/* Context Action Card (Contact Intent Trigger) */}
              {msg.isContextCard && msg.contextType === 'contact' && (
                <div className="bg-[#004741]/5 border border-[#004741]/30 rounded-xl p-4 space-y-3 shadow-sm animate-fade-in text-[#11201D]">
                  <div className="flex items-center justify-between border-b border-[#004741]/25 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#004741] animate-ping" />
                      <span className="text-xs font-bold text-[#11201D] uppercase tracking-wider font-mono-code">
                        Direct Founder Contact Card
                      </span>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-white text-[#003833] border border-[#004741]/30 font-bold">
                      Guaranteed &lt; 2h Response
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    {/* Email Card */}
                    <div className="bg-white p-2.5 rounded-lg border border-[#CDC6B6] shadow-2xs flex flex-col justify-between">
                      <div>
                        <div className="text-[10px] text-[#2C403C] uppercase font-mono-code mb-1 flex items-center gap-1 font-bold">
                          <MailIcon className="w-3.5 h-3.5 text-[#004741]" />
                          Email
                        </div>
                        <a 
                          href={`mailto:${FOUNDER_CONTACT.email}?subject=Inquiry%3A%20Custom%20AI%20Agent%20Development`}
                          className="text-xs font-mono-code text-[#11201D] hover:text-[#004741] font-bold break-all block"
                        >
                          {FOUNDER_CONTACT.email}
                        </a>
                      </div>
                      <div className="mt-2 pt-1.5 border-t border-[#EAE6DC] flex items-center justify-between">
                        <a
                          href={`mailto:${FOUNDER_CONTACT.email}?subject=Inquiry%3A%20Custom%20AI%20Agent%20Development`}
                          className="text-xs text-[#004741] hover:underline font-bold flex items-center gap-0.5"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          onClick={handleCopyEmail}
                          className="text-xs text-[#2C403C] hover:text-[#004741] flex items-center gap-1 cursor-pointer font-semibold"
                          title="Copy email address"
                        >
                          {copiedEmail ? <CheckCircle className="w-3.5 h-3.5 text-[#004741]" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    {/* WhatsApp Card */}
                    <a
                      href={FOUNDER_CONTACT.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white hover:bg-emerald-50/50 p-2.5 rounded-lg border border-[#CDC6B6] hover:border-emerald-700 shadow-2xs flex flex-col justify-between transition-colors group cursor-pointer"
                    >
                      <div>
                        <div className="text-[10px] text-[#2C403C] uppercase font-mono-code mb-1 flex items-center gap-1 font-bold">
                          <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-700" />
                          WhatsApp
                        </div>
                        <div className="text-xs font-mono-code text-[#11201D] font-bold">
                          {FOUNDER_CONTACT.whatsapp}
                        </div>
                      </div>
                      <div className="mt-2 pt-1.5 border-t border-[#EAE6DC] flex items-center justify-between text-xs text-emerald-900 font-bold">
                        <span>Direct Chat</span>
                        <ExternalLink className="w-3 h-3 text-emerald-700 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </a>

                    {/* LinkedIn Card */}
                    <a
                      href={FOUNDER_CONTACT.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white hover:bg-sky-50/50 p-2.5 rounded-lg border border-[#CDC6B6] hover:border-sky-700 shadow-2xs flex flex-col justify-between transition-colors group cursor-pointer"
                    >
                      <div>
                        <div className="text-[10px] text-[#2C403C] uppercase font-mono-code mb-1 flex items-center gap-1 font-bold">
                          <LinkedInIcon className="w-3.5 h-3.5 text-sky-800" />
                          LinkedIn
                        </div>
                        <div className="text-xs font-mono-code text-[#11201D] font-bold truncate">
                          {FOUNDER_CONTACT.linkedinHandle}
                        </div>
                      </div>
                      <div className="mt-2 pt-1.5 border-t border-[#EAE6DC] flex items-center justify-between text-xs text-sky-900 font-bold">
                        <span>Connect</span>
                        <ExternalLink className="w-3 h-3 text-sky-800 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </a>
                  </div>

                  <div className="bg-white border border-[#CDC6B6] rounded-lg p-2.5 text-xs text-[#1C2F2C] leading-relaxed flex items-center justify-between gap-2">
                    <div>
                      <strong className="text-[#11201D]">Direct Senior Access:</strong> You will speak directly with {FOUNDER_CONTACT.name} to scope your website's data extraction.
                    </div>
                    <div className="text-xs font-mono-code text-[#2C403C] font-semibold shrink-0">
                      Mon–Sat 9AM–7PM
                    </div>
                  </div>

                  <button
                    onClick={onOpenConsultation}
                    className="w-full py-2.5 px-4 bg-[#004741] hover:bg-[#003632] text-white font-bold text-xs rounded-lg transition-all shadow-md shadow-[#004741]/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Open Free AI Agent Scoping Request</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Context Action Card for General / Scraping / Timeline */}
              {msg.isContextCard && msg.contextType !== 'contact' && msg.metadata?.actionLabel && (
                <div className="bg-white border border-[#CDC6B6] rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-2xs">
                  <div className="text-xs text-[#20332F] font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#004741] flex-shrink-0" />
                    <span>Want this context-grounded AI on your website?</span>
                  </div>
                  <button
                    onClick={onOpenConsultation}
                    className="py-1.5 px-3 bg-[#004741] hover:bg-[#003632] text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <span>{msg.metadata.actionLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-[#DDD8CC] border border-[#CDC6B6] flex items-center justify-center text-[#162724] flex-shrink-0 mt-0.5 font-bold">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 items-center text-[#243734] text-xs font-semibold">
            <div className="w-8 h-8 rounded-lg bg-[#004741]/12 border border-[#004741]/30 flex items-center justify-center text-[#004741] flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-[#CDC6B6] rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#004741] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-[#004741] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-[#004741] animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-xs text-[#243734] font-semibold ml-2">Retrieving grounded context...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-2.5 sm:p-3 bg-[#EAE6DC] border-t border-[#CDC6B6]">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a prompt (e.g. 'I have to contact you guys')..."
            className="w-full bg-white border border-[#CDC6B6] rounded-xl pl-3.5 pr-12 py-2.5 sm:py-2.5 text-base sm:text-sm text-[#11201D] placeholder-[#556965] focus:outline-none focus:border-[#004741] focus:ring-1 focus:ring-[#004741] transition-all font-sans shadow-2xs"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isTyping}
            className="absolute right-1 w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center bg-[#004741] hover:bg-[#003632] disabled:opacity-40 disabled:hover:bg-[#004741] text-white rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed shadow-2xs"
            title="Send prompt"
            aria-label="Send message"
          >
            <Send className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[11px] sm:text-xs text-[#2B3F3B] font-semibold px-1">
          <span className="flex items-center gap-1 font-semibold text-[#1B2C29]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#004741]" />
            100% Grounded in Truth &bull; Zero Hallucinations
          </span>
          <span className="hidden sm:inline text-[#364B47]">Press Enter to send</span>
        </div>
      </div>
    </div>
  );
};
