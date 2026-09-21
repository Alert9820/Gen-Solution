import React from 'react';
import { ShieldCheck, ShieldAlert, Lock, FileCode, EyeOff, UserCheck, CheckCircle2 } from 'lucide-react';
import { SAFETY_PRECAUTIONS } from '../data/agencyData';

const ICONS = {
  ShieldAlert,
  Lock,
  FileCode,
  EyeOff,
  UserCheck
};

interface SafetyPrecautionsSectionProps {
  onOpenConsultation: () => void;
}

export const SafetyPrecautionsSection: React.FC<SafetyPrecautionsSectionProps> = ({
  onOpenConsultation
}) => {
  return (
    <section id="precautions" className="py-20 bg-slate-950 border-t border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono-code mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Precautions & Security Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Precautions We Take to Protect Your Brand & Business Data
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-400 leading-relaxed">
            Deploying an AI agent directly on your customer-facing website requires enterprise-grade precautions. Here is the exact technical engineering we implement to prevent hallucinations, secure your proprietary data, and guarantee safe user interactions.
          </p>
        </div>

        {/* 5 Safety Precaution Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SAFETY_PRECAUTIONS.map((item) => {
            const Icon = ICONS[item.iconName as keyof typeof ICONS] || ShieldCheck;
            return (
              <div
                key={item.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-6 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-emerald-400/90 font-mono-code mb-3">
                    {item.subtitle}
                  </p>

                  <div className="mb-3 p-2.5 bg-rose-950/20 border border-rose-500/20 rounded-lg text-xs text-rose-300">
                    <span className="font-semibold block mb-0.5">Threat Prevented:</span>
                    {item.threatPrevented}
                  </div>

                  <div className="text-xs text-slate-300 leading-relaxed space-y-2 mb-4">
                    <span className="text-slate-400 font-medium block">Technical Implementation:</span>
                    <p>{item.technicalImplementation}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-start gap-2 text-xs text-emerald-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{item.guarantee}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reassurance Callout */}
        <div className="mt-10 p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-white mb-1">Need a custom NDA or private VPC deployment?</h4>
            <p className="text-xs text-slate-400">
              We happily execute bilateral non-disclosure agreements before reviewing any internal proprietary documentation.
            </p>
          </div>
          <button
            onClick={onOpenConsultation}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
          >
            Request Security & NDA Brief
          </button>
        </div>
      </div>
    </section>
  );
};
