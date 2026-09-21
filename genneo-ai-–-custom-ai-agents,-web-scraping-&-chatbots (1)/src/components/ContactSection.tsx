import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Copy, 
  Calendar,
  Check,
  ExternalLink
} from 'lucide-react';
import { WhatsAppIcon, LinkedInIcon, MailIcon } from './CustomSocialIcons';
import { FOUNDER_CONTACT } from '../data/agencyData';

interface ContactSectionProps {
  onOpenConsultation: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ onOpenConsultation }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(FOUNDER_CONTACT.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="contact" className="py-16 md:py-20 bg-[#F0EDE4] relative border-b border-[#DFD9CC] font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="bg-[#FAF8F5] border border-[#CDC6B6] rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 shadow-lg shadow-[#162422]/5"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
            {/* Left Content */}
            <div className="md:col-span-7 space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src="/founder-bhavesh-mali.png"
                  alt="Bhavesh Mali – Lead AI Engineer and Founder of GenNeo AI Agency"
                  className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl border-2 border-[#004741]/30 shadow-xs object-cover shrink-0"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#004741]/12 border border-[#004741]/30 text-[#003833] text-xs font-bold">
                  <span>Direct Founder Access</span>
                </div>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#11201D] tracking-tight leading-tight">
                Speak Directly with Lead AI Engineer {FOUNDER_CONTACT.name}
              </h2>

              <p className="text-[#253935] text-xs sm:text-sm leading-relaxed font-normal">
                Skip the sales reps. We will review your domain URLs, discuss what knowledge documents need scraping, map out your contextual intent routing, and deliver a production-ready AI agent in 7 to 10 days.
              </p>

              <div className="space-y-2 pt-1 text-xs text-[#1E312E] font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#004741] shrink-0" />
                  <span>Free Website Scraping & Vector Readiness Audit</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#004741] shrink-0" />
                  <span>Interactive Context Action Mapping (e.g. "I have to contact you guys")</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#004741] shrink-0" />
                  <span>Private AES-256 Vector Pipeline with Zero LLM Public Training</span>
                </div>
              </div>
            </div>

            {/* Right Action Box - Clickable Direct Channels */}
            <div className="md:col-span-5 bg-[#EAE6DC] p-4 sm:p-6 rounded-2xl border border-[#CDC6B6] space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-[#CDC6B6]">
                <span className="text-xs text-[#253935] uppercase font-mono-code font-bold">
                  Direct Communication Channels
                </span>
                <span className="text-[11px] text-[#003833] bg-white border border-[#004741]/30 px-2.5 py-0.5 rounded font-bold">
                  SLA &lt; 2h
                </span>
              </div>

              {/* WhatsApp Button */}
              <a
                href={FOUNDER_CONTACT.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between bg-white hover:bg-emerald-50/50 p-3 rounded-xl border border-[#CDC6B6] hover:border-emerald-700 transition-all text-left shadow-2xs cursor-pointer min-h-[48px]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-600/12 border border-emerald-600/30 flex items-center justify-center text-emerald-800 group-hover:scale-105 transition-transform shrink-0">
                    <WhatsAppIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-[#2C403C] uppercase font-mono-code font-bold">
                      WhatsApp Quick Chat
                    </div>
                    <div className="text-xs font-mono-code font-bold text-[#11201D]">
                      {FOUNDER_CONTACT.whatsapp}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-900 shrink-0">
                  <span className="hidden sm:inline">Chat</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </a>

              {/* Email Button with Separated Action Targets */}
              <div className="group flex items-center justify-between bg-white hover:bg-[#004741]/5 p-3 rounded-xl border border-[#CDC6B6] hover:border-[#004741]/50 transition-all text-left shadow-2xs min-h-[48px]">
                <a
                  href={`mailto:${FOUNDER_CONTACT.email}?subject=Inquiry%3A%20Custom%20AI%20Agent%20Development`}
                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#004741]/12 border border-[#004741]/30 flex items-center justify-center text-[#004741] group-hover:scale-105 transition-transform shrink-0">
                    <MailIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-[#2C403C] uppercase font-mono-code font-bold">
                      Direct Email
                    </div>
                    <div className="text-xs font-mono-code font-bold text-[#11201D] truncate">
                      {FOUNDER_CONTACT.email}
                    </div>
                  </div>
                </a>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center text-[#2C403C] hover:text-[#004741] hover:bg-[#FAF8F5] rounded-lg border border-transparent hover:border-[#CDC6B6] transition-colors cursor-pointer"
                    title="Copy email address"
                    aria-label="Copy email address"
                  >
                    {copied ? <Check className="w-4 h-4 text-[#004741]" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <a
                    href={`mailto:${FOUNDER_CONTACT.email}?subject=Inquiry%3A%20Custom%20AI%20Agent%20Development`}
                    className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center text-[#004741]"
                    aria-label="Send email"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* LinkedIn Button */}
              <a
                href={FOUNDER_CONTACT.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between bg-white hover:bg-sky-50/50 p-3 rounded-xl border border-[#CDC6B6] hover:border-sky-700 transition-all text-left shadow-2xs cursor-pointer min-h-[48px]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-sky-600/12 border border-sky-600/30 flex items-center justify-center text-sky-800 group-hover:scale-105 transition-transform shrink-0">
                    <LinkedInIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-[#2C403C] uppercase font-mono-code font-bold">
                      LinkedIn Profile
                    </div>
                    <div className="text-xs font-mono-code font-bold text-[#11201D] truncate">
                      {FOUNDER_CONTACT.linkedinHandle}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-sky-900 shrink-0">
                  <span className="hidden sm:inline">Connect</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </a>

              <button
                onClick={onOpenConsultation}
                className="w-full py-3.5 px-4 bg-[#004741] hover:bg-[#003632] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-[#004741]/25 flex items-center justify-center gap-2 cursor-pointer mt-1 min-h-[48px]"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule 15-Min Scoping Call</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
