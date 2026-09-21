import React from 'react';
import { Calendar, Clock, CheckCircle2, ArrowRight, ShieldCheck, FileText } from 'lucide-react';
import { DELIVERY_ROADMAP } from '../data/agencyData';

interface DeliveryTimelineSectionProps {
  onOpenConsultation: () => void;
}

export const DeliveryTimelineSection: React.FC<DeliveryTimelineSectionProps> = ({
  onOpenConsultation
}) => {
  return (
    <section id="timeline" className="py-20 bg-slate-900/50 border-t border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono-code mb-4">
            <Clock className="w-3.5 h-3.5" />
            <span>When We Provide The Service</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Clear Engineering Roadmap & Turnaround Milestones
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-400 leading-relaxed">
            No vague deadlines or months of endless meetings. As a dedicated AI developer, I execute your website scraping, vector training, security guardrails, and chatbot deployment across an honest 7 to 10 business day timeline.
          </p>
        </div>

        {/* Timeline phases */}
        <div className="space-y-6">
          {DELIVERY_ROADMAP.map((item, index) => (
            <div
              key={item.phase}
              className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                {/* Left meta */}
                <div className="lg:w-1/4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono-code font-bold text-emerald-400 px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                      {item.phase}
                    </span>
                    <span className="text-xs font-mono-code text-slate-400 font-semibold">
                      {item.days}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.objective}</p>
                </div>

                {/* Center Developer Actions */}
                <div className="lg:w-2/4 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                  <div className="text-xs font-mono-code text-slate-300 font-semibold mb-2.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Exact Developer Actions Executed:</span>
                  </div>
                  <ul className="space-y-2">
                    {item.developerActions.map((action, aIdx) => (
                      <li key={aIdx} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="text-emerald-400 font-bold select-none">•</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right Milestone & Client Involvement */}
                <div className="lg:w-1/4 flex flex-col justify-between space-y-3">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                    <div className="text-[10px] font-mono-code text-slate-400 uppercase mb-1">
                      What is needed from you:
                    </div>
                    <div className="text-xs text-slate-300">
                      {item.clientInvolvement}
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-lg">
                    <div className="text-[10px] font-mono-code text-emerald-400 uppercase mb-1">
                      Milestone Deliverable:
                    </div>
                    <div className="text-xs font-medium text-emerald-200">
                      {item.milestoneOutput}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Continuous Retraining Banner */}
        <div className="mt-8 p-6 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Ongoing Lifecycle: Automated Continuous Re-Scraping</span>
            </div>
            <p className="text-xs text-slate-400">
              When you launch new services, update pricing, or edit pages, our automated crawler resyncs your AI agent automatically.
            </p>
          </div>
          <button
            onClick={onOpenConsultation}
            className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <span>Lock In Your 7-Day Sprint</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
