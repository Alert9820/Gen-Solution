import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Home, 
  Search, 
  FileQuestion, 
  Compass, 
  Calendar, 
  Copy, 
  Check, 
  Sparkles, 
  Layers, 
  Cpu, 
  MessageSquare, 
  HelpCircle,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';
import { WhatsAppIcon, LinkedInIcon, MailIcon } from './CustomSocialIcons';
import { FOUNDER_CONTACT } from '../data/agencyData';

interface NotFoundPageProps {
  onBackToHome: () => void;
  onOpenConsultation: (domain?: string) => void;
  onNavigateSection?: (sectionId: string) => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
  attemptedPath?: string;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  onBackToHome,
  onOpenConsultation,
  onNavigateSection,
  onOpenPrivacy,
  onOpenTerms,
  attemptedPath = ''
}) => {
  const [domainInput, setDomainInput] = useState('');
  const [domainError, setDomainError] = useState('');
  const [isTouched, setIsTouched] = useState(false);
  const [copiedDiag, setCopiedDiag] = useState(false);
  const [showDiag, setShowDiag] = useState(false);

  const displayPath = attemptedPath || (typeof window !== 'undefined' ? window.location.pathname + window.location.hash : '/unknown-route');
  const timestamp = new Date().toISOString();

  const validateDomain = (val: string): string => {
    const trimmed = val.trim();
    if (!trimmed) {
      return 'Please enter your company website or domain.';
    }
    const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/i;
    if (!urlPattern.test(trimmed)) {
      return 'Please enter a valid domain (e.g. yourcompany.com).';
    }
    return '';
  };

  const handleAuditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsTouched(true);
    const err = validateDomain(domainInput);
    if (err) {
      setDomainError(err);
      return;
    }
    setDomainError('');
    onOpenConsultation(domainInput.trim());
  };

  const handleCopyDiagnostic = () => {
    const diagText = `[GenNeo AI 404 Diagnostic]\nAttempted URL: ${displayPath}\nTimestamp: ${timestamp}\nReferrer: ${typeof document !== 'undefined' ? document.referrer || 'Direct / None' : 'None'}\nOrigin: ${typeof window !== 'undefined' ? window.location.origin : 'https://genneo.agency'}`;
    navigator.clipboard.writeText(diagText).then(() => {
      setCopiedDiag(true);
      setTimeout(() => setCopiedDiag(false), 2500);
    });
  };

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      onBackToHome();
    }
  };

  return (
    <div className="min-h-screen bg-[#F0EDE4] text-[#162422] py-8 sm:py-14 font-sans selection:bg-[#004741]/15 selection:text-[#004741]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Breadcrumb & Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[#CDC6B6]">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 min-h-[40px] px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#CDC6B6] text-[#11201D] hover:text-[#004741] hover:border-[#004741]/40 text-xs font-bold shadow-2xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#004741]" />
            <span>Return to Homepage</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleGoBack}
              className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#CDC6B6] text-[#253935] hover:text-[#11201D] text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-[#556965]" />
              <span>Go Back</span>
            </button>
            <button
              onClick={() => onOpenConsultation()}
              className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-xl bg-[#004741] hover:bg-[#003632] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Scoping Call</span>
            </button>
          </div>
        </div>

        {/* Hero 404 Card */}
        <div className="bg-[#FAF8F5] border border-[#CDC6B6] rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden text-center sm:text-left">
          
          {/* Subtle Background Monospace Vector Stamp */}
          <div className="absolute top-3 right-4 sm:top-6 sm:right-8 opacity-10 select-none pointer-events-none font-mono-code font-black text-7xl sm:text-9xl text-[#004741]">
            404
          </div>

          <div className="max-w-2xl relative z-10 space-y-5">
            {/* Monospace Tech Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#004741]/10 text-[#004741] text-[11px] font-bold font-mono-code border border-[#004741]/20">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>HTTP 404 // UNINDEXED_VECTOR_NODE</span>
            </div>

            {/* Main Headline */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#11201D] tracking-tight font-display mb-2">
                Page Not Found
              </h1>
              <p className="text-sm sm:text-base text-[#253935] leading-relaxed">
                The requested URL does not correspond to an indexed knowledge base route on GenNeo AI. It may have moved, been reorganized, or mistyped.
              </p>
            </div>

            {/* Attempted Route Callout */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-[#F0EDE4] border border-[#CDC6B6] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-left">
              <div className="space-y-0.5 overflow-hidden">
                <span className="text-[10px] uppercase font-bold text-[#556965] font-mono-code tracking-wider">
                  Requested Route
                </span>
                <p className="font-mono-code text-xs sm:text-sm font-semibold text-[#11201D] truncate">
                  {displayPath}
                </p>
              </div>
              <button
                onClick={handleCopyDiagnostic}
                className="inline-flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-white border border-[#CDC6B6] text-[11px] font-bold text-[#253935] transition-all cursor-pointer shrink-0"
              >
                {copiedDiag ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="text-emerald-800">Copied Info</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#556965]" />
                    <span>Copy Route Info</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onBackToHome}
                className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 bg-[#004741] hover:bg-[#003632] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Return to Homepage</span>
              </button>
              <button
                onClick={() => onOpenConsultation()}
                className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 bg-[#FAF8F5] hover:bg-white border border-[#CDC6B6] text-[#11201D] text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#004741]" />
                <span>Schedule Consultation</span>
              </button>
            </div>
          </div>
        </div>

        {/* Website Scraping Audit Tool (Helpful Utility on 404) */}
        <div className="bg-[#FAF8F5] border border-[#CDC6B6] rounded-2xl p-5 sm:p-7 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#004741] uppercase tracking-wider font-mono-code">
                <Sparkles className="w-3.5 h-3.5 text-[#004741]" />
                <span>Looking for Website Scraping & AI Agents?</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#11201D]">
                Test Your Website’s AI Scraping Readiness
              </h3>
              <p className="text-xs sm:text-sm text-[#253935]">
                Enter your company domain to verify crawler indexing and receive a custom agent architecture proposal.
              </p>
            </div>

            <form noValidate onSubmit={handleAuditSubmit} className="space-y-1.5 w-full sm:w-auto sm:min-w-[340px]">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={domainInput}
                    onChange={(e) => {
                      setDomainInput(e.target.value);
                      if (domainError) {
                        setDomainError(validateDomain(e.target.value));
                      }
                    }}
                    onBlur={() => {
                      setIsTouched(true);
                      if (domainInput.trim()) {
                        setDomainError(validateDomain(domainInput));
                      }
                    }}
                    placeholder="e.g. yourcompany.com"
                    aria-invalid={Boolean(domainError && isTouched)}
                    aria-describedby={domainError && isTouched ? 'notfound-domain-error' : undefined}
                    className={`w-full min-h-[44px] bg-white border rounded-xl px-3.5 py-2 text-base sm:text-xs text-[#11201D] placeholder-[#556965] focus:outline-none transition-colors ${
                      domainError && isTouched
                        ? 'border-red-500 bg-red-50/25 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                        : 'border-[#CDC6B6] focus:border-[#004741] focus:ring-1 focus:ring-[#004741]'
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  className="min-h-[44px] px-4 py-2 bg-[#004741] hover:bg-[#003632] text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Audit Domain</span>
                </button>
              </div>
              {domainError && isTouched && (
                <p id="notfound-domain-error" className="text-left text-xs text-red-600 font-medium flex items-center gap-1.5 pl-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{domainError}</span>
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Valid Directory / Popular Destinations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-[#11201D] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#004741]" />
              <span>Available Indexed Destinations</span>
            </h2>
            <span className="text-xs font-mono-code text-[#556965]">Direct Navigation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Card 1: Why Choose GenNeo */}
            <div 
              onClick={() => onNavigateSection ? onNavigateSection('why-choose') : onBackToHome()}
              className="p-4 sm:p-5 rounded-xl bg-[#FAF8F5] border border-[#CDC6B6] hover:border-[#004741] hover:bg-white hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-[#004741]/10 text-[#004741] flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4 text-[#004741]" />
                </div>
                <h4 className="text-sm font-bold text-[#11201D] group-hover:text-[#004741] transition-colors">
                  Why GenNeo AI
                </h4>
                <p className="text-xs text-[#253935] leading-relaxed">
                  Direct engineering access with Lead AI Engineer Bhavesh Mali, strict zero-hallucination grounding, and 7–10 day turnaround.
                </p>
              </div>
              <div className="pt-3 text-[11px] font-bold text-[#004741] flex items-center gap-1">
                <span>Explore Core Pillars</span>
                <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
              </div>
            </div>

            {/* Card 2: Scraping & Training Pipeline */}
            <div 
              onClick={() => onNavigateSection ? onNavigateSection('how-it-works') : onBackToHome()}
              className="p-4 sm:p-5 rounded-xl bg-[#FAF8F5] border border-[#CDC6B6] hover:border-[#004741] hover:bg-white hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-[#004741]/10 text-[#004741] flex items-center justify-center">
                  <Layers className="w-4 h-4 text-[#004741]" />
                </div>
                <h4 className="text-sm font-bold text-[#11201D] group-hover:text-[#004741] transition-colors">
                  Scraping & RAG Pipeline
                </h4>
                <p className="text-xs text-[#253935] leading-relaxed">
                  How we ingest raw HTML, parse PDFs, split into semantic chunks, and vectorize memory into private vector databases.
                </p>
              </div>
              <div className="pt-3 text-[11px] font-bold text-[#004741] flex items-center gap-1">
                <span>View Architecture Pipeline</span>
                <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
              </div>
            </div>

            {/* Card 3: Packages & Pricing */}
            <div 
              onClick={() => onNavigateSection ? onNavigateSection('packages') : onBackToHome()}
              className="p-4 sm:p-5 rounded-xl bg-[#FAF8F5] border border-[#CDC6B6] hover:border-[#004741] hover:bg-white hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-[#004741]/10 text-[#004741] flex items-center justify-center">
                  <Cpu className="w-4 h-4 text-[#004741]" />
                </div>
                <h4 className="text-sm font-bold text-[#11201D] group-hover:text-[#004741] transition-colors">
                  Packages & Pricing
                </h4>
                <p className="text-xs text-[#253935] leading-relaxed">
                  Fixed pricing packages starting at $999 setup + $222/mo maintenance with automated weekly/monthly re-crawling.
                </p>
              </div>
              <div className="pt-3 text-[11px] font-bold text-[#004741] flex items-center gap-1">
                <span>View Starter & Growth Plans</span>
                <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
              </div>
            </div>

            {/* Card 4: Direct Engineering Channel */}
            <div 
              onClick={() => onNavigateSection ? onNavigateSection('contact') : onBackToHome()}
              className="p-4 sm:p-5 rounded-xl bg-[#FAF8F5] border border-[#CDC6B6] hover:border-[#004741] hover:bg-white hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-[#004741]/10 text-[#004741] flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-[#004741]" />
                </div>
                <h4 className="text-sm font-bold text-[#11201D] group-hover:text-[#004741] transition-colors">
                  Direct Founder Contact
                </h4>
                <p className="text-xs text-[#253935] leading-relaxed">
                  Direct WhatsApp (+91 8468950877) and Email communications directly with the engineer coding your agent.
                </p>
              </div>
              <div className="pt-3 text-[11px] font-bold text-[#004741] flex items-center gap-1">
                <span>Connect with Bhavesh Mali</span>
                <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
              </div>
            </div>
          </div>
        </div>

        {/* Direct Channels & Founder Verification */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#FAF8F5] border border-[#CDC6B6] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm font-bold text-[#11201D]">
              Need Immediate Engineering Assistance?
            </h4>
            <p className="text-xs text-[#253935]">
              Contact Lead AI Engineer Bhavesh Mali directly through guaranteed channels:
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <a
              href={FOUNDER_CONTACT.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 min-h-[40px] px-3 py-2 rounded-xl bg-emerald-600/12 hover:bg-emerald-600/20 text-emerald-900 border border-emerald-600/30 transition-colors font-bold text-xs"
            >
              <WhatsAppIcon className="w-4 h-4 text-emerald-800" />
              <span>WhatsApp</span>
            </a>
            <a
              href={`mailto:${FOUNDER_CONTACT.email}?subject=Report%20404%20or%20Request%20Agent%20Scoping`}
              className="inline-flex items-center gap-1.5 min-h-[40px] px-3 py-2 rounded-xl bg-[#004741]/12 hover:bg-[#004741]/20 text-[#003833] border border-[#004741]/30 transition-colors font-bold text-xs"
            >
              <MailIcon className="w-4 h-4 text-[#004741]" />
              <span>Email</span>
            </a>
            <a
              href={FOUNDER_CONTACT.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 min-h-[40px] px-3 py-2 rounded-xl bg-sky-600/12 hover:bg-sky-600/20 text-sky-900 border border-sky-600/30 transition-colors font-bold text-xs"
            >
              <LinkedInIcon className="w-4 h-4 text-sky-800" />
              <span>LinkedIn</span>
            </a>
          </div>
        </div>

        {/* Collapsible Diagnostics Accordion */}
        <div className="pt-2 border-t border-[#CDC6B6]">
          <div className="flex items-center justify-between text-xs text-[#556965]">
            <button
              onClick={() => setShowDiag(!showDiag)}
              className="hover:text-[#11201D] font-mono-code font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showDiag ? 'Hide Route Diagnostic Information' : 'Show Technical Diagnostic Information'}</span>
            </button>
            <span className="font-mono-code text-[11px]">Error Code: 404</span>
          </div>

          {showDiag && (
            <div className="mt-3 p-4 rounded-xl bg-[#11201D] text-[#E0E7E5] font-mono-code text-xs space-y-1.5 overflow-x-auto shadow-inner">
              <div className="text-emerald-400 font-bold">// GENNEO AI ROUTER TELEMETRY</div>
              <div>Timestamp: {timestamp}</div>
              <div>Attempted Route: {displayPath}</div>
              <div>Client Referrer: {typeof document !== 'undefined' ? document.referrer || 'None (Direct link)' : 'Unknown'}</div>
              <div>Platform Ingress: Cloud Run Reverse Proxy / SPA Fallback</div>
              <div>Resolution Action: Redirect to indexed node or verify spelling</div>
            </div>
          )}
        </div>

        {/* Legal & Policy Links */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-[#556965]">
          {onOpenPrivacy && (
            <button onClick={onOpenPrivacy} className="hover:text-[#004741] font-semibold transition-colors cursor-pointer">
              Privacy Policy
            </button>
          )}
          <span>&bull;</span>
          {onOpenTerms && (
            <button onClick={onOpenTerms} className="hover:text-[#004741] font-semibold transition-colors cursor-pointer">
              Terms of Service
            </button>
          )}
          <span>&bull;</span>
          <button onClick={onBackToHome} className="hover:text-[#004741] font-semibold transition-colors cursor-pointer">
            Return to Homepage
          </button>
        </div>

      </div>
    </div>
  );
};
