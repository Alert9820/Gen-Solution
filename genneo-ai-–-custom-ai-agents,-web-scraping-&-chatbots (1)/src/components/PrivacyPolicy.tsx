import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Check,
  Printer,
  Globe,
  Database
} from 'lucide-react';
import { WhatsAppIcon, MailIcon } from './CustomSocialIcons';
import { FOUNDER_CONTACT } from '../data/agencyData';

interface PrivacyPolicyProps {
  onBackToHome: () => void;
  onOpenConsultation: () => void;
  onOpenTerms?: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ 
  onBackToHome, 
  onOpenConsultation,
  onOpenTerms
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(FOUNDER_CONTACT.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F0EDE4] text-[#162422] py-8 sm:py-12 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-[#DFD9CC]">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 min-h-[40px] px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#DFD9CC] text-[#162422] hover:text-[#004741] hover:border-[#004741]/40 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#004741]" />
            <span>Back to Main Page</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => window.print()}
              className="min-h-[40px] px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DFD9CC] text-[#4F5E5C] hover:text-[#162422] text-xs font-medium flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#6E7D7A]" />
              <span>Print Policy</span>
            </button>
            <button
              onClick={onOpenConsultation}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-[#004741] hover:bg-[#003632] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              Book Scoping Call
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="bg-[#FAF8F5] border border-[#DFD9CC] rounded-3xl p-6 sm:p-8 shadow-2xs">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#004741]/10 border border-[#004741]/20 text-[#004741] text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Privacy Policy & Vector Data Security</span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#162422] tracking-tight">
            Zero-Trust Data Protection & Model Privacy Policy
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-[#4F5E5C] leading-relaxed">
            Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} &bull; Direct DPO Oversight by Lead AI Engineer {FOUNDER_CONTACT.name}.
          </p>
        </div>

        {/* Policy Sections */}
        <div className="space-y-6">
          {/* Section 1 */}
          <div className="bg-[#FAF8F5] border border-[#DFD9CC] rounded-2xl p-6 shadow-2xs space-y-3">
            <h2 className="text-base font-bold text-[#162422] flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-[#004741]/10 text-[#004741] font-mono-code font-bold text-xs flex items-center justify-center">
                01
              </span>
              <span>Zero Public Model Training Guarantee</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#4F5E5C] leading-relaxed">
              When GenNeo AI ingests your website URLs, PDFs, or internal documentation, <strong>your proprietary content is never submitted into public training sets</strong> for OpenAI, Anthropic, Google, or any open-source foundational model. Your vectors exist exclusively in an isolated, private database namespace.
            </p>
          </div>

          {/* Section 2 */}
          <div className="bg-[#FAF8F5] border border-[#DFD9CC] rounded-2xl p-6 shadow-2xs space-y-3">
            <h2 className="text-base font-bold text-[#162422] flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-[#004741]/10 text-[#004741] font-mono-code font-bold text-xs flex items-center justify-center">
                02
              </span>
              <span>Website Scraping & Data Extraction Scope</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#4F5E5C] leading-relaxed">
              We only crawl public URLs and documents explicitly designated by your company. Navbars, tracking cookies, and scripts are stripped automatically during ingestion to retain only high-density factual content.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-[#354643]">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#F0EDE4]/70 border border-[#DFD9CC]">
                <CheckCircle2 className="w-4 h-4 text-[#004741] shrink-0" />
                <span>AES-256 Vector Encryption at Rest</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#F0EDE4]/70 border border-[#DFD9CC]">
                <CheckCircle2 className="w-4 h-4 text-[#004741] shrink-0" />
                <span>TLS 1.3 End-to-End Encryption in Transit</span>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-[#FAF8F5] border border-[#DFD9CC] rounded-2xl p-6 shadow-2xs space-y-3">
            <h2 className="text-base font-bold text-[#162422] flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-[#004741]/10 text-[#004741] font-mono-code font-bold text-xs flex items-center justify-center">
                03
              </span>
              <span>Contextual Intent Triggers & CRM Routing</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#4F5E5C] leading-relaxed">
              When visitors trigger contextual contact actions (such as saying <em>"I have to contact you guys"</em>), the collected parameters (work email, query, source page) are transmitted directly to your designated webhook or CRM. We do not sell, broker, or monetize visitor communications.
            </p>
          </div>

          {/* Section 4 */}
          <div className="bg-[#FAF8F5] border border-[#DFD9CC] rounded-2xl p-6 shadow-2xs space-y-3">
            <h2 className="text-base font-bold text-[#162422] flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-[#004741]/10 text-[#004741] font-mono-code font-bold text-xs flex items-center justify-center">
                04
              </span>
              <span>100% Client Ownership & Complete Data Deletion</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#4F5E5C] leading-relaxed">
              You retain full, uncompromised intellectual property ownership over all ingested text, custom prompts, and vector embeddings. If you choose to terminate your engagement, our engineering team executes a permanent, cryptographic purge of all your vector indexes and backups within 24 hours.
            </p>
          </div>

          {/* Section 5: Cookies and Tracking */}
          <div className="bg-[#FAF8F5] border border-[#DFD9CC] rounded-2xl p-6 shadow-2xs space-y-3">
            <h2 className="text-base font-bold text-[#162422] flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-[#004741]/10 text-[#004741] font-mono-code font-bold text-xs flex items-center justify-center">
                05
              </span>
              <span>Cookies, Local Storage & User Consent Options</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#4F5E5C] leading-relaxed">
              We employ minimal, transparent storage mechanisms compliant with GDPR and ePrivacy guidelines:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-[#F0EDE4]/80 border border-[#DFD9CC] space-y-1">
                <div className="font-bold text-[#162422]">1. Strictly Necessary</div>
                <div className="text-[#556360] leading-relaxed">
                  Enforces HTTPS protocol routing, TLS certificates, HSTS headers, and records your cookie preference choices. Cannot be disabled.
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#F0EDE4]/80 border border-[#DFD9CC] space-y-1">
                <div className="font-bold text-[#162422]">2. Performance & Analytics</div>
                <div className="text-[#556360] leading-relaxed">
                  Measures page loading latencies and aggregate feature interactions to benchmark scraping pipeline performance without identifying you.
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#F0EDE4]/80 border border-[#DFD9CC] space-y-1">
                <div className="font-bold text-[#162422]">3. Agent Functional State</div>
                <div className="text-[#556360] leading-relaxed">
                  Temporarily caches live chat conversation messages and pre-filled domain audits in your browser's local session for seamless navigation.
                </div>
              </div>
            </div>
            <p className="text-[11px] text-[#6E7D7A] pt-1">
              You can adjust or revoke your cookie choices at any time via the "Cookie Settings" button in the footer.
            </p>
          </div>

          {/* Section 6 */}
          <div className="bg-[#FAF8F5] border border-[#DFD9CC] rounded-2xl p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-[#162422] flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-[#004741]/10 text-[#004741] font-mono-code font-bold text-xs flex items-center justify-center">
                06
              </span>
              <span>Data Protection Officer & Direct Founder Contact</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#4F5E5C] leading-relaxed">
              For any regulatory, GDPR, vector deletion, or security audit requests, you have direct, unmediated access to Lead AI Engineer and Founder {FOUNDER_CONTACT.name}:
            </p>

            <div className="p-4 rounded-xl bg-[#F0EDE4]/70 border border-[#DFD9CC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="font-bold text-[#162422]">{FOUNDER_CONTACT.name} &bull; Lead AI Engineer</div>
                <div className="text-[#4F5E5C] font-mono-code">{FOUNDER_CONTACT.email}</div>
                <div className="text-[#004741] font-mono-code text-[11px] mt-0.5">{FOUNDER_CONTACT.whatsapp}</div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={FOUNDER_CONTACT.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5" />
                  <span>WhatsApp Compliance</span>
                </a>
                <button
                  onClick={handleCopyEmail}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#D5CFBF] hover:bg-[#FAF8F5] text-[#162422] font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-[#004741]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEmail ? 'Copied' : 'Copy Email'}</span>
                </button>
                <a
                  href={`mailto:${FOUNDER_CONTACT.email}`}
                  className="px-3 py-1.5 rounded-lg bg-[#004741] hover:bg-[#003632] text-white font-semibold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <MailIcon className="w-3.5 h-3.5" />
                  <span>Send Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Switcher */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-[#004741]">
          <button
            onClick={onBackToHome}
            className="hover:underline cursor-pointer"
          >
            &larr; Return to Home Platform
          </button>
          {onOpenTerms && (
            <>
              <span className="text-[#DFD9CC]">&bull;</span>
              <button
                onClick={onOpenTerms}
                className="hover:underline cursor-pointer"
              >
                Review Terms & Conditions &rarr;
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
