import React from 'react';
import { Database, Cpu, Bot, Workflow, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';
import { AI_SERVICES } from '../data/agencyData';
import { AIAgentService } from '../types';

const ICONS = {
  Database,
  Cpu,
  Bot,
  Workflow,
  RefreshCw
};

interface ServicesGridProps {
  onSelectService: (service: AIAgentService) => void;
}

export const ServicesGrid: React.FC<ServicesGridProps> = ({ onSelectService }) => {
  return (
    <section id="services" className="py-20 bg-slate-950 border-t border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono-code mb-4">
            <Cpu className="w-3.5 h-3.5" />
            <span>Actual Services Provided</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            AI Agent & Automation Engineering Services
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-400 leading-relaxed">
            Every service is engineered with developer precision. We don’t deliver generic plug-and-play templates; we build custom scraping, vectorization, and conversational intelligence tailored to your exact business.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {AI_SERVICES.map((service, idx) => {
            const Icon = ICONS[service.iconName as keyof typeof ICONS] || Cpu;
            return (
              <div
                key={service.id}
                className={`bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-6 transition-all flex flex-col justify-between ${
                  idx === 0 || idx === 1 ? 'lg:col-span-1' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono-code text-slate-400 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
                      {service.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">
                    {service.title}
                  </h3>
                  <p className="text-xs text-emerald-400 font-mono-code mb-3">
                    {service.tagline}
                  </p>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                    {service.description}
                  </p>

                  <div className="mb-4 p-3 bg-slate-950 border border-slate-800/80 rounded-xl text-xs space-y-1">
                    <span className="font-semibold text-white block">Developer Implementation:</span>
                    <p className="text-slate-400 leading-relaxed">{service.howWeDoIt}</p>
                  </div>

                  <div className="space-y-2 mb-6">
                    <span className="text-xs font-mono-code text-slate-300 font-semibold block">
                      Technical Deliverables:
                    </span>
                    <ul className="space-y-1.5">
                      {service.technicalDeliverables.map((item, dIdx) => (
                        <li key={dIdx} className="text-xs text-slate-400 flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="text-[11px] text-emerald-300/90 font-medium">
                    Benefit: {service.clientBenefit}
                  </div>
                  <button
                    onClick={() => onSelectService(service)}
                    className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title={`Inquire about ${service.title}`}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
