import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Globe, 
  Database, 
  Bot, 
  ArrowRight, 
  CheckCircle2, 
  Code2, 
  Sparkles,
  Search,
  AlertCircle
} from 'lucide-react';

interface ScrapingAndTrainingPipelineProps {
  onOpenConsultation: (prefillDomain?: string) => void;
}

export const ScrapingAndTrainingPipeline: React.FC<ScrapingAndTrainingPipelineProps> = ({
  onOpenConsultation
}) => {
  const [domainInput, setDomainInput] = useState('');
  const [domainError, setDomainError] = useState('');
  const [isTouched, setIsTouched] = useState(false);

  const steps = [
    {
      num: '01',
      icon: Globe,
      title: 'Scrape & Ingest',
      desc: 'Our crawlers traverse your public web pages, PDFs, and documentation. Navbars and footers are stripped to extract pure factual knowledge.',
      detail: 'Automated delta-syncing preserves fresh pricing & specs.'
    },
    {
      num: '02',
      icon: Database,
      title: 'Private Vector Memory',
      desc: 'Text is partitioned into semantic chunks with 15% overlap and embedded into a private, AES-256 encrypted vector index.',
      detail: 'Zero data is ever shared with public foundation models.'
    },
    {
      num: '03',
      icon: Bot,
      title: '1-Line Widget Embed',
      desc: 'We deliver a lightweight JavaScript script tag. Embed it anywhere on your site for instant grounded Q&A and direct contact cards.',
      detail: 'Works seamlessly on WordPress, Webflow, Shopify, React & custom HTML.'
    }
  ];

  const validateDomain = (val: string): string => {
    const trimmed = val.trim();
    if (!trimmed) {
      return 'Please enter your company website or domain.';
    }
    const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/i;
    if (!urlPattern.test(trimmed)) {
      return 'Please enter a valid domain format (e.g. acme.com or https://acme.com).';
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

  return (
    <section id="how-it-works" className="py-16 md:py-20 bg-[#F0EDE4] border-b border-[#DFD9CC] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="max-w-3xl mx-auto text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#004741]/12 border border-[#004741]/30 text-[#003833] text-xs font-bold mb-3">
            <span>Our 3-Step Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#11201D] tracking-tight">
            How We Ingest Your Data & Deploy Your Agent
          </h2>
          <p className="mt-3 text-[#253935] text-sm sm:text-base leading-relaxed font-normal">
            From raw domain URLs to an air-gapped, context-aware AI agent on your website in 7 to 10 days.
          </p>
        </motion.div>

        {/* 3 Step Visual Cards with Staggered Scroll-In */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: idx * 0.1, ease: 'easeOut' }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="bg-[#FAF8F5] p-5 sm:p-7 rounded-2xl border border-[#CDC6B6] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden"
              >
                <div className="absolute top-4 right-4 text-3xl font-black font-mono-code text-[#CDC5B4] select-none">
                  {s.num}
                </div>

                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#004741]/12 border border-[#004741]/30 flex items-center justify-center text-[#004741] mb-4">
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="text-xs font-mono-code font-bold text-[#004741] uppercase mb-1">
                    Step {s.num}
                  </div>

                  <h3 className="text-lg font-bold text-[#11201D] mb-2">
                    {s.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#253935] leading-relaxed mb-4">
                    {s.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#DCD6C8] text-xs text-[#20332F] font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#004741] shrink-0" />
                  <span>{s.detail}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Domain Scraping Readiness Audit Input */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
          className="max-w-2xl mx-auto bg-[#FAF8F5] border border-[#CDC6B6] rounded-2xl p-5 sm:p-7 shadow-2xs text-center"
        >
          <h4 className="text-base font-bold text-[#11201D] mb-1">
            Check Your Website's Scraping Readiness
          </h4>
          <p className="text-xs text-[#253935] mb-4 font-normal">
            Enter your domain. We will inspect your public pages, sitemap, and structure to generate a custom scraping plan.
          </p>

          <form noValidate onSubmit={handleAuditSubmit} className="space-y-2">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative flex-1 w-full text-left">
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
                  aria-describedby={domainError && isTouched ? 'pipeline-domain-error' : undefined}
                  className={`w-full bg-white border rounded-xl pl-4 pr-4 py-2.5 text-base sm:text-sm text-[#11201D] placeholder-[#556965] focus:outline-none transition-colors ${
                    domainError && isTouched
                      ? 'border-red-500 bg-red-50/25 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                      : 'border-[#CDC6B6] focus:border-[#004741] focus:ring-1 focus:ring-[#004741]'
                  }`}
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 bg-[#004741] hover:bg-[#003632] text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Audit My Website</span>
              </button>
            </div>
            {domainError && isTouched && (
              <p id="pipeline-domain-error" className="text-left text-xs text-red-600 font-medium flex items-center gap-1.5 pl-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{domainError}</span>
              </p>
            )}
          </form>
        </motion.div>

        {/* Visual Architecture Blueprint with Accessible Alt Text */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.55, delay: 0.2, ease: 'easeOut' }}
          className="mt-14 max-w-4xl mx-auto rounded-2xl overflow-hidden border border-[#CDC6B6] bg-[#FAF8F5] p-3 sm:p-4 shadow-sm"
        >
          <div className="px-2 py-2 sm:px-3 sm:py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#DCD6C8] mb-3">
            <div>
              <span className="text-[10px] font-mono-code font-bold text-[#004741] uppercase tracking-wider">
                Full-Stack Architecture Diagram
              </span>
              <h4 className="text-sm sm:text-base font-bold text-[#11201D]">
                End-to-End Scraping, Vectorization & Grounded RAG Infrastructure
              </h4>
            </div>
            <span className="text-[11px] bg-[#004741]/12 text-[#003833] font-bold px-2.5 py-1 rounded-md border border-[#004741]/30 shrink-0 font-mono-code">
              7–10 Day Delivery SLA
            </span>
          </div>
          <div className="rounded-xl overflow-hidden border border-emerald-950/20 bg-[#081412] shadow-inner">
            <img
              src="/og-image.png"
              alt="GenNeo AI Architecture Diagram illustrating web scraping pipeline, Pinecone vector storage, and grounded chatbot response system"
              className="w-full h-auto object-cover max-h-[380px] hover:scale-[1.01] transition-transform duration-500"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
          <p className="text-xs text-[#283C38] text-center pt-2.5 font-medium">
            Visual overview of the air-gapped pipeline deployed for your domain. No data is ever shared with public model training pools.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
