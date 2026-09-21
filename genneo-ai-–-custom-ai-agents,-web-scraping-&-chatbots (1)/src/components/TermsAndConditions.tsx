import React, { useState } from 'react';
import {
  FileText,
  Shield,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Check,
  Printer,
  Scale,
  Clock,
  ExternalLink,
  Database,
  Lock,
  AlertCircle
} from 'lucide-react';
import { WhatsAppIcon, MailIcon } from './CustomSocialIcons';
import { FOUNDER_CONTACT, AI_PACKAGES } from '../data/agencyData';

interface TermsAndConditionsProps {
  onBackToHome: () => void;
  onOpenConsultation: () => void;
  onOpenPrivacy: () => void;
}

export const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({
  onBackToHome,
  onOpenConsultation,
  onOpenPrivacy
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
              <span>Print Terms</span>
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
            <Scale className="w-3.5 h-3.5" />
            <span>GenNeo AI Agency Client Agreement</span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#162422] tracking-tight">
            Terms & Conditions of Service
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-[#4F5E5C] leading-relaxed">
            Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} &bull; Direct Agency Oversight by Lead AI Engineer {FOUNDER_CONTACT.name} &bull; GenNeo AI.
          </p>

          <div className="mt-4 pt-4 border-t border-[#DFD9CC] flex flex-wrap items-center gap-4 text-xs text-[#354643]">
            <span className="flex items-center gap-1.5 font-semibold text-[#004741]">
              <CheckCircle2 className="w-4 h-4 text-[#004741]" />
              Fixed Scope & Transparent Retainers
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-[#004741]">
              <CheckCircle2 className="w-4 h-4 text-[#004741]" />
              100% Client Vector Ownership
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-[#004741]">
              <CheckCircle2 className="w-4 h-4 text-[#004741]" />
              7–10 Business Day SLA Turnaround
            </span>
          </div>
        </div>

        {/* Terms Sections */}
        <div className="space-y-6">
          {/* Section 1 */}
          <div className="bg-[#FAF8F5] border border-[#DFD9CC] rounded-2xl p-6 shadow-2xs space-y-3">
            <h2 className="text-base font-bold text-[#162422] flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-[#004741]/10 text-[#004741] font-mono-code font-bold text-xs flex items-center justify-center">
                01
              </span>
              <span>Agency Scope of Work & Deliverables</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#4F5E5C] leading-relaxed">
              GenNeo AI specializes in custom autonomous website agents, semantic knowledge-base scraping, and enterprise Retrieval-Augmented Generation (RAG). Deliverables are strictly governed by the selected fixed-tier engagement or custom Statement of Work (SOW):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-[#354643]">
              <div className="p-3 rounded-xl bg-[#F0EDE4]/80 border border-[#DFD9CC]">
                <strong className="text-[#162422] block mb-1">Starter AI Agent ($999 setup + $222/mo):</strong>
                <span>Up to 30 pages crawled, clean semantic chunking, branded floating widget, 1-line script embed, and monthly automated re-scraping cron.</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F0EDE4]/80 border border-[#DFD9CC]">
                <strong className="text-[#162422] block mb-1">Growth AI Agent ($1,111 setup + $333/mo):</strong>
                <span>Up to 100 pages + PDFs, CRM/Calendar webhooks (HubSpot, Zapier, Calendly), dynamic intent cards, and weekly re-scraping cron.</span>
              </div>
            </div>
            <p className="text-xs text-[#6E7D7A] italic">
              Additional custom API tools, multi-tenant databases, or enterprise VPC hosting are scoped separately under custom enterprise arrangements.
            </p>
          </div>

          {/* Section 2 */}
          <div className="bg-[#FAF8F5] border border-[#DFD9CC] rounded-2xl p-6 shadow-2xs space-y-3">
            <h2 className="text-base font-bold text-[#162422] flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-[#004741]/10 text-[#004741] font-mono-code font-bold text-xs flex items-center justify-center">
                02
              </span>
              <span>Website Scraping Authorization & Content Rights</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#4F5E5C] leading-relaxed">
              By engaging GenNeo AI to scrape, parse, or vectorize any domain URL, sitemap, documentation, or PDF catalog, the Client represents and warrants that:
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-[#4F5E5C] list-disc list-inside leading-relaxed">
              <li>Client possesses all necessary intellectual property rights, licenses, or explicit authorizations to extract and vectorize the specified content.</li>
              <li>The provided content does not infringe upon any third-party copyrights, proprietary trade secrets, or statutory confidentiality obligations.</li>
              <li>GenNeo AI acts solely as a technical processor executing client-authorized automated crawling and vector conversion.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="bg-[#FAF8F5] border border-[#DFD9CC] rounded-2xl p-6 shadow-2xs space-y-3">
            <h2 className="text-base font-bold text-[#162422] flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-[#004741]/10 text-[#004741] font-mono-code font-bold text-xs flex items-center justify-center">
                03
              </span>
              <span>Zero-Hallucination Engineering & Verification SLA</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#4F5E5C] leading-relaxed">
              GenNeo AI enforces strict mathematical retrieval-grounding:
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-[#4F5E5C] list-disc list-inside leading-relaxed">
              <li><strong>Source Grounding:</strong> The AI Agent is prompted and constrained to answer solely from your vectorized domain content. Speculative generation or ungrounded external assumptions are strictly rejected.</li>
              <li><strong>Confidence Thresholds & Human Fallback:</strong> If a visitor inquires about pricing, policies, or technical parameters not present in your knowledge base, the agent does not fabricate answers; it immediately surfaces direct contact channels or routes the query to your team.</li>
              <li><strong>Client Content Accuracy:</strong> The AI Agent reflects the live factual state of your provided website and documentation. Client is responsible for notifying GenNeo AI or updating source URLs when business terms, pricing, or policies change.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="bg-[#FAF8F5] border border-[#DFD9CC] rounded-2xl p-6 shadow-2xs space-y-3">
            <h2 className="text-base font-bold text-[#162422] flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-[#004741]/10 text-[#004741] font-mono-code font-bold text-xs flex items-center justify-center">
                04
              </span>
              <span>Fees, Monthly Retainers & Cancellation Policy</span>
            </h2>
            <div className="space-y-2 text-xs sm:text-sm text-[#4F5E5C] leading-relaxed">
              <p>
                <strong>Setup Fee:</strong> The one-time setup fee ($999 for Starter, $1,111 for Growth, or Custom SOW) covers complete domain crawling, token chunking, vector database deployment, widget styling, adversarial prompt testing, and embed delivery.
              </p>
              <p>
                <strong>Monthly Maintenance Retainer:</strong> The ongoing retainer ($222/mo or $333/mo) covers continuous automated re-scraping cron jobs, vector database hosting, LLM token bandwidth allocations, security firewall monitoring, and ongoing prompt adjustments.
              </p>
              <p>
                <strong>Cancellation:</strong> Monthly retainers carry no lock-in contracts and can be cancelled at any time with a 14-day written notice to <strong className="text-[#162422]">genneob2c@gmail.com</strong>. Upon cancellation, the client may request an export of their vectorized dataset or a permanent cryptographic purge.
              </p>
            </div>
          </div>

          {/* Section 5 */}
          <div className="bg-[#FAF8F5] border border-[#DFD9CC] rounded-2xl p-6 shadow-2xs space-y-3">
            <h2 className="text-base font-bold text-[#162422] flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-[#004741]/10 text-[#004741] font-mono-code font-bold text-xs flex items-center justify-center">
                05
              </span>
              <span>Intellectual Property & Complete Client Ownership</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#4F5E5C] leading-relaxed">
              <strong>Your Data Belongs to You:</strong> You retain 100% uncompromised ownership of all your brand assets, scraped texts, knowledge chunks, customer leads, and conversation logs. GenNeo AI claims zero proprietary rights over your business knowledge.
            </p>
            <p className="text-xs sm:text-sm text-[#4F5E5C] leading-relaxed">
              <strong>Agency Frameworks:</strong> GenNeo AI retains ownership of its underlying core scraper microservices, proprietary ingestion pipelines, and generic boilerplate widget scripts.
            </p>
          </div>

          {/* Section 6 */}
          <div className="bg-[#FAF8F5] border border-[#DFD9CC] rounded-2xl p-6 shadow-2xs space-y-3">
            <h2 className="text-base font-bold text-[#162422] flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-[#004741]/10 text-[#004741] font-mono-code font-bold text-xs flex items-center justify-center">
                06
              </span>
              <span>Turnaround Timeline & Client Collaboration SLA</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#4F5E5C] leading-relaxed">
              Our standard delivery commitment is <strong>5 to 10 business days</strong> from receipt of initial setup payment, target domain URLs, and relevant third-party API credentials (such as CRM or Calendly access if applicable).
            </p>
            <p className="text-xs sm:text-sm text-[#4F5E5C] leading-relaxed">
              If client delay in providing required access or domain verification exceeds 30 days, GenNeo AI reserves the right to pause the delivery schedule until access is re-established.
            </p>
          </div>

          {/* Section 7 */}
          <div className="bg-[#FAF8F5] border border-[#DFD9CC] rounded-2xl p-6 shadow-2xs space-y-3">
            <h2 className="text-base font-bold text-[#162422] flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-[#004741]/10 text-[#004741] font-mono-code font-bold text-xs flex items-center justify-center">
                07
              </span>
              <span>Acceptable Use & Anti-Abuse Standards</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#4F5E5C] leading-relaxed">
              Clients agree not to configure or utilize GenNeo AI agents to:
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-[#4F5E5C] list-disc list-inside leading-relaxed">
              <li>Engage in deceptive impersonation of licensed legal, medical, or financial professionals without explicit disclaimers.</li>
              <li>Disseminate unlawful, defamatory, harassing, or fraudulent information.</li>
              <li>Attempt to reverse-engineer, decompile, or extract source code of GenNeo AI crawler infrastructure.</li>
            </ul>
          </div>

          {/* Section 8 */}
          <div className="bg-[#FAF8F5] border border-[#DFD9CC] rounded-2xl p-6 shadow-2xs space-y-3">
            <h2 className="text-base font-bold text-[#162422] flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-[#004741]/10 text-[#004741] font-mono-code font-bold text-xs flex items-center justify-center">
                08
              </span>
              <span>Limitation of Liability</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#4F5E5C] leading-relaxed">
              In no event shall GenNeo AI, its founders, or contractors be liable for any indirect, incidental, special, consequential, or punitive damages arising from the use or inability to use the AI Agent or automated workflows. GenNeo AI's maximum aggregate liability shall not exceed the total fees paid by Client to GenNeo AI in the three (3) months preceding the claim.
            </p>
          </div>

          {/* Section 9: Founder Contact */}
          <div className="bg-[#FAF8F5] border border-[#DFD9CC] rounded-2xl p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-[#162422] flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-[#004741]/10 text-[#004741] font-mono-code font-bold text-xs flex items-center justify-center">
                09
              </span>
              <span>Direct Legal & Engineering Inquiries</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#4F5E5C] leading-relaxed">
              Questions regarding these Terms, custom enterprise contracts, or Service Level Agreements should be directed to Founder & Lead AI Engineer {FOUNDER_CONTACT.name}:
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
                  <span>WhatsApp Terms</span>
                </a>
                <button
                  onClick={handleCopyEmail}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#D5CFBF] hover:bg-[#FAF8F5] text-[#162422] font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-[#004741]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEmail ? 'Copied' : 'Copy Email'}</span>
                </button>
                <a
                  href={`mailto:${FOUNDER_CONTACT.email}?subject=GenNeo%20AI%20Terms%20Inquiry`}
                  className="px-3 py-1.5 rounded-lg bg-[#004741] hover:bg-[#003632] text-white font-semibold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <MailIcon className="w-3.5 h-3.5" />
                  <span>Email Founder</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation Switcher */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-[#004741]">
          <button
            onClick={onBackToHome}
            className="hover:underline cursor-pointer"
          >
            &larr; Return to Home Platform
          </button>
          <span className="text-[#DFD9CC]">&bull;</span>
          <button
            onClick={onOpenPrivacy}
            className="hover:underline cursor-pointer"
          >
            Review Privacy Policy &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
