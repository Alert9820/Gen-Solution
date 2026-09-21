import React from 'react';
import { UserCog, CheckCircle2, Layers, BarChart3, ArrowRight, Shield } from 'lucide-react';
import { MailIcon } from './CustomSocialIcons';
import { DEVELOPER_ATTENTION, FOUNDER_CONTACT } from '../data/agencyData';

const ICONS = {
  UserCog,
  CheckCircle2,
  Layers,
  BarChart3
};

interface DeveloperAttentionSectionProps {
  onOpenConsultation: () => void;
}

export const DeveloperAttentionSection: React.FC<DeveloperAttentionSectionProps> = ({
  onOpenConsultation
}) => {
  return (
    <section id="developer-attention" className="py-20 bg-slate-900/60 border-t border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono-code mb-4">
            <UserCog className="w-3.5 h-3.5" />
            <span>Developer Commitment</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            The Exact Attention & Dedication We Pay to You
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-400 leading-relaxed">
            Most agencies sell you an AI wrapper and disappear, or pass you between tier-1 support tickets. Here is the dedicated, senior-developer engineering attention you receive when building your custom AI agent with us.
          </p>
        </div>

        {/* 4 Pillars of Developer Attention */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {DEVELOPER_ATTENTION.map((item) => {
            const Icon = ICONS[item.iconName as keyof typeof ICONS] || UserCog;
            return (
              <div
                key={item.id}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-all space-y-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white mb-0.5">{item.title}</h3>
                    <p className="text-xs text-emerald-400/90 font-mono-code">{item.subtitle}</p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {item.description}
                </p>

                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs space-y-1">
                  <span className="font-semibold text-white block">Direct Attention Provided:</span>
                  <p className="text-slate-400">{item.developerAttention}</p>
                </div>

                <div className="pt-2 flex items-center gap-2 text-xs font-mono-code text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>{item.deliverableProof}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Founder Direct Card */}
        <div className="bg-gradient-to-r from-slate-950 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <img
              src="/founder-bhavesh-mali.png"
              alt="Bhavesh Mali – Founder and Lead AI Engineer at GenNeo AI Agency"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-emerald-500/40 shadow-lg shadow-emerald-950/50 object-cover shrink-0"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono-code">
                <Shield className="w-3.5 h-3.5" />
                Direct Founder Accountability
              </div>
              <h3 className="text-xl font-bold text-white">
                Work Directly With Lead AI Engineer {FOUNDER_CONTACT.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                Have questions about your website architecture, scraping constraints, or RAG vector databases? Reach out directly to discuss your project scope.
              </p>
              <div className="text-xs text-emerald-400 font-mono-code pt-1 flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <MailIcon className="w-3.5 h-3.5" />
                <span>{FOUNDER_CONTACT.email}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">{FOUNDER_CONTACT.responseTime}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenConsultation}
            className="px-6 py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <span>Book 1-on-1 Discovery Call</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
