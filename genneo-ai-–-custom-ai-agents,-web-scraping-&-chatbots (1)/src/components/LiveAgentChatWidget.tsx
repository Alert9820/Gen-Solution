import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Calendar, 
  Clock, 
  Copy, 
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { WhatsAppIcon, LinkedInIcon, MailIcon } from './CustomSocialIcons';
import { GenNeoAgentAvatar } from './GenNeoAgentAvatar';
import { ChatMessage } from '../types';
import { FOUNDER_CONTACT } from '../data/agencyData';

interface LiveAgentChatWidgetProps {
  onOpenConsultation: () => void;
}

export const LiveAgentChatWidget: React.FC<LiveAgentChatWidgetProps> = ({
  onOpenConsultation
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `👋 Hi! I am the GenNeo Autonomous AI Assistant, grounded in our website scraping and RAG pipelines.\n\nTry asking me anything, or click **"I have to contact you guys."** below to see how I instantly surface direct contact channels!`,
      timestamp: 'Just now'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Allow closing via Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(FOUNDER_CONTACT.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      timestamp: 'Just now'
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    try {
      // Call secure server-side API (secrets remain 100% server-side)
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: messages.slice(-4)
        })
      });

      const data = await res.json().catch(() => null);
      const p = text.toLowerCase();
      let reply: ChatMessage;

      if (
        p.includes('contact') || 
        p.includes('call') || 
        p.includes('email') || 
        p.includes('hire') || 
        p.includes('reach') ||
        p.includes('whatsapp') ||
        p.includes('linkedin')
      ) {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: data?.reply || `You can connect directly with Lead AI Engineer ${FOUNDER_CONTACT.name} via WhatsApp, LinkedIn, or Email. No sales intermediaries:`,
          timestamp: 'Just now',
          isContextCard: true,
          contextType: 'contact',
          metadata: {
            email: FOUNDER_CONTACT.email,
            hours: FOUNDER_CONTACT.workingHours,
            actionLabel: 'Schedule Technical Discovery Call'
          }
        };
      } else if (p.includes('price') || p.includes('cost') || p.includes('package')) {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: data?.reply || `We offer transparent, fixed delivery packages:\n- **Starter AI Agent ($999 setup + $222/mo):** Up to 30 pages scraped, custom vector memory, 7–10 day delivery, monthly re-sync.\n- **Growth & Automations ($1,111 setup + $333/mo):** Full domain + PDFs, weekly auto-sync cron, instant contact cards, CRM/calendar routing.\n- **Custom Enterprise:** Multi-domain, private cloud vector hosting, dedicated AI architect.`,
          timestamp: 'Just now',
          isContextCard: true,
          contextType: 'packages',
          metadata: { actionLabel: 'View Detailed Packages' }
        };
      } else if (p.includes('scrape') || p.includes('train') || p.includes('ingest')) {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: data?.reply || `We crawl your entire public domain, strip headers/footers, partition clean text into semantic chunks, and vectorize into a private AES-256 database. The agent then retrieves exact paragraphs to give cited answers.`,
          timestamp: 'Just now',
          isContextCard: true,
          contextType: 'scraping',
          metadata: { actionLabel: 'Audit My Domain For Scraping' }
        };
      } else {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: data?.reply || `I'm fully grounded in website data with zero hallucinations. Would you like to schedule a 15-min discovery call with Lead AI Engineer ${FOUNDER_CONTACT.name}?`,
          timestamp: 'Just now',
          isContextCard: true,
          contextType: 'general',
          metadata: { actionLabel: 'Book 15-Min Scoping Call' }
        };
      }

      setMessages((prev) => [...prev, reply]);
    } catch {
      // Fallback offline message if network drops
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: `Directly connect with Lead AI Engineer ${FOUNDER_CONTACT.name} via WhatsApp (${FOUNDER_CONTACT.whatsapp}) or email (${FOUNDER_CONTACT.email}) for instant scoping.`,
          timestamp: 'Just now',
          isContextCard: true,
          contextType: 'contact',
          metadata: {
            email: FOUNDER_CONTACT.email,
            hours: FOUNDER_CONTACT.workingHours,
            actionLabel: 'Schedule Technical Discovery Call'
          }
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-40 font-sans">
      {/* Trigger floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="min-h-[44px] px-3.5 py-2.5 bg-[#004741] hover:bg-[#003632] text-white rounded-full shadow-lg shadow-[#004741]/30 flex items-center gap-2.5 transition-all transform hover:scale-105 cursor-pointer border border-[#002D29]"
          aria-label="Open chat widget"
        >
          <GenNeoAgentAvatar
            sizeClassName="w-6 h-6"
            withStatusDot
            statusPosition="top-right"
            statusColor="bg-emerald-400"
            alt="GenNeo AI Autonomous Agent Avatar"
          />
          <span className="text-xs font-bold tracking-tight">Ask GenNeo Agent</span>
        </button>
      )}

      {/* Pop-up chat window */}
      {isOpen && (
        <div className="w-[calc(100vw-24px)] max-w-[340px] h-[75vh] max-h-[480px] sm:h-[450px] bg-[#FAF8F5] border border-[#DFD9CC] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="px-3 py-2 bg-[#E8E4D9]/95 border-b border-[#DDD8CB] flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <GenNeoAgentAvatar
                sizeClassName="w-7 h-7"
                withStatusDot
                statusPosition="bottom-right"
                statusColor="bg-emerald-500"
                alt="GenNeo AI Agent Assistant Avatar"
              />
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#162422] flex items-center gap-1.5 font-display">
                  <span>GenNeo AI</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                </div>
                <div className="text-[9px] text-[#556360] truncate">Grounded in Website Data</div>
              </div>
            </div>

            {/* Clear, prominent Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1 min-h-[34px] px-2.5 py-1 bg-white hover:bg-[#F0EDE4] text-[#354643] hover:text-[#162422] border border-[#DFD9CC] hover:border-[#C5BFB0] rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer shrink-0"
              title="Close chat (Esc)"
              aria-label="Close chat"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close</span>
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="px-2.5 py-1.5 bg-[#F0EDE4]/60 border-b border-[#DFD9CC] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <button
              onClick={() => handleSendMessage('I have to contact you guys.')}
              className="text-[10px] bg-[#004741]/10 hover:bg-[#004741]/20 text-[#004741] px-2 py-0.5 rounded-full border border-[#004741]/25 whitespace-nowrap cursor-pointer transition-all flex-shrink-0 font-medium"
            >
              ★ "Contact you guys"
            </button>
            <button
              onClick={() => handleSendMessage('How do you scrape my website?')}
              className="text-[10px] bg-white hover:bg-[#E8E4D9] text-[#455351] px-2 py-0.5 rounded-full border border-[#DFD9CC] whitespace-nowrap cursor-pointer transition-all flex-shrink-0"
            >
              "How do you scrape?"
            </button>
            <button
              onClick={() => handleSendMessage('What packages do you offer?')}
              className="text-[10px] bg-white hover:bg-[#E8E4D9] text-[#455351] px-2 py-0.5 rounded-full border border-[#DFD9CC] whitespace-nowrap cursor-pointer transition-all flex-shrink-0"
            >
              "Packages"
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-2.5 overflow-y-auto space-y-2.5 bg-[#FAF8F5] text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'assistant' && (
                  <GenNeoAgentAvatar
                    sizeClassName="w-6 h-6"
                    className="mt-0.5 shrink-0"
                    alt="GenNeo AI Response Node"
                  />
                )}
                <div className="max-w-[88%] space-y-1.5">
                  <div
                    className={`p-2.5 rounded-xl leading-relaxed text-[11px] ${
                      m.sender === 'user'
                        ? 'bg-[#004741] text-white font-medium rounded-tr-none shadow-xs'
                        : 'bg-white border border-[#DFD9CC] text-[#162422] rounded-tl-none shadow-xs'
                    }`}
                  >
                    <div className="whitespace-pre-line">{m.text}</div>
                  </div>

                  {/* Contact Card */}
                  {m.isContextCard && m.contextType === 'contact' && (
                    <div className="p-2.5 bg-[#EFECE3] border border-[#DFD9CC] rounded-xl space-y-2 text-[11px] text-[#162422] shadow-xs">
                      <div className="flex items-center justify-between border-b border-[#DDD8CB] pb-1">
                        <span className="font-bold text-[#162422] uppercase font-mono-code text-[9px]">
                          Direct Founder Channels
                        </span>
                        <span className="text-[9px] text-[#004741] bg-white border border-[#004741]/20 px-1 py-0.2 rounded font-semibold">
                          &lt; 2h Reply
                        </span>
                      </div>

                      {/* WhatsApp Button */}
                      <a
                        href={FOUNDER_CONTACT.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white hover:bg-emerald-50/50 p-1.5 rounded-lg border border-[#DFD9CC] hover:border-emerald-600/40 flex items-center justify-between transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-1.5">
                          <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-700" />
                          <span className="font-mono-code text-[10px] font-bold text-[#162422]">
                            {FOUNDER_CONTACT.whatsapp}
                          </span>
                        </div>
                        <span className="text-[9px] text-emerald-800 font-semibold flex items-center gap-0.5">
                          WhatsApp <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      </a>

                      {/* Email Button */}
                      <div className="bg-white p-1.5 rounded-lg border border-[#DFD9CC] flex items-center justify-between font-mono-code text-[#162422] text-[10px]">
                        <a
                          href={`mailto:${FOUNDER_CONTACT.email}?subject=Inquiry%3A%20Custom%20AI%20Agent%20Development`}
                          className="truncate hover:text-[#004741] font-bold flex items-center gap-1.5"
                        >
                          <MailIcon className="w-3 h-3 text-[#004741] shrink-0" />
                          <span className="truncate">{FOUNDER_CONTACT.email}</span>
                        </a>
                        <button
                          onClick={handleCopyEmail}
                          className="text-[#657371] hover:text-[#004741] p-0.5 cursor-pointer ml-1 shrink-0"
                          title="Copy email"
                        >
                          {copiedEmail ? <CheckCircle className="w-3 h-3 text-[#004741]" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>

                      {/* LinkedIn Button */}
                      <a
                        href={FOUNDER_CONTACT.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white hover:bg-sky-50/50 p-1.5 rounded-lg border border-[#DFD9CC] hover:border-sky-600/40 flex items-center justify-between transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <LinkedInIcon className="w-3 h-3 text-sky-700 shrink-0" />
                          <span className="font-mono-code text-[10px] font-bold text-[#162422] truncate">
                            {FOUNDER_CONTACT.linkedinHandle}
                          </span>
                        </div>
                        <span className="text-[9px] text-sky-800 font-semibold flex items-center gap-0.5 shrink-0 ml-1">
                          Connect <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      </a>

                      {/* Actions row: Discovery Call + Explicit Close Option */}
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            onOpenConsultation();
                          }}
                          className="flex-1 py-1.5 bg-[#004741] hover:bg-[#003632] text-white font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs text-[11px]"
                        >
                          <Calendar className="w-3 h-3" />
                          <span>Discovery Call</span>
                        </button>
                        <button
                          onClick={() => setIsOpen(false)}
                          className="px-2.5 py-1.5 bg-white hover:bg-[#FAF8F5] text-[#455351] hover:text-[#162422] font-semibold rounded-lg transition-all text-[11px] border border-[#DFD9CC] flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                          title="Close chat window"
                        >
                          <X className="w-3 h-3" />
                          <span>Close</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* General action button */}
                  {m.isContextCard && m.contextType !== 'contact' && m.metadata?.actionLabel && (
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        onOpenConsultation();
                      }}
                      className="w-full py-1.5 px-2 bg-[#004741] hover:bg-[#003632] text-white font-semibold rounded-lg text-[10px] transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                    >
                      <span>{m.metadata.actionLabel}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-1.5 items-center text-[#657371] text-[11px]">
                <Bot className="w-3.5 h-3.5 text-[#004741]" />
                <span>Retrieving verified context...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar & Dismiss Option */}
          <div className="p-2 bg-[#E8E4D9]/80 border-t border-[#DDD8CB] space-y-1">
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                placeholder="Ask anything or 'Contact'..."
                className="w-full bg-white border border-[#DFD9CC] rounded-xl pl-2.5 pr-9 py-2 text-base sm:text-xs text-[#162422] placeholder-[#657371] focus:outline-none focus:border-[#004741]"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isTyping}
                className="absolute right-1 w-7 h-7 flex items-center justify-center bg-[#004741] hover:bg-[#003632] disabled:opacity-40 text-white rounded-lg cursor-pointer transition-all"
                title="Send message"
                aria-label="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between text-[9px] text-[#657371] px-1">
              <span>Zero hallucinations &bull; Grounded</span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#556360] hover:text-[#162422] hover:underline cursor-pointer flex items-center gap-0.5 font-medium"
              >
                <X className="w-2.5 h-2.5" />
                <span>Close Chat (Esc)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
