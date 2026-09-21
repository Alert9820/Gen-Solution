import React, { useState } from 'react';
import { 
  Building2, 
  Cpu, 
  ShoppingCart, 
  Activity, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  FileText,
  Database
} from 'lucide-react';
import { INDUSTRY_SOLUTIONS } from '../data/agencyData';

interface IndustrySolutionsSectionProps {
  onOpenConsultation: () => void;
}

export const IndustrySolutionsSection: React.FC<IndustrySolutionsSectionProps> = ({
  onOpenConsultation
}) => {
  const [selectedIndustryId, setSelectedIndustryId] = useState(INDUSTRY_SOLUTIONS[0].id);
  const activeSolution = INDUSTRY_SOLUTIONS.find(s => s.id === selectedIndustryId) || INDUSTRY_SOLUTIONS[0];

  const getIndustryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Building2':
        return <Building2 className="w-5 h-5" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5" />;
      case 'ShoppingCart':
        return <ShoppingCart className="w-5 h-5" />;
      case 'Activity':
        return <Activity className="w-5 h-5" />;
      default:
        return <Database className="w-5 h-5" />;
    }
  };

  return (
    <section id="industry-solutions" className="py-20 bg-slate-950 text-slate-100 border-b border-slate-900 font-sans relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Hitachi Signature Red Accent Marker */}
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-1 bg-red-600 rounded-full inline-block" />
            <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-red-500">
              Industry Tailored Architectures
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Specialized Data Extraction & Contextual Intelligence by Sector
          </h2>

          <p className="mt-3 text-sm sm:text-base text-slate-400 leading-relaxed">
            Every industry has unique data topologies, compliance obligations, and visitor intent patterns. Discover how GenNeo AI customizes ingestion, security barriers, and conversion workflows for your sector.
          </p>
        </div>

        {/* Industry Tabs */}
        <div className="flex flex-wrap items-center gap-2.5 pb-6 border-b border-slate-800 mb-8">
          {INDUSTRY_SOLUTIONS.map((item) => {
            const isSelected = item.id === selectedIndustryId;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedIndustryId(item.id)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800'
                }`}
              >
                {getIndustryIcon(item.iconName)}
                <span>{item.industry}</span>
              </button>
            );
          })}
        </div>

        {/* Active Industry Deep-Dive Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md">
          {/* Left Column: Headline, Scope, & Outcome */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-600/30 text-red-400 text-xs font-mono-code font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{activeSolution.complianceBadge}</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
              {activeSolution.headline}
            </h3>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {activeSolution.description}
            </p>

            {/* Workflow details */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono-code">
                Autonomous Workflow Execution
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {activeSolution.agentWorkflow}
              </p>
            </div>

            {/* Proven Outcome */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/30 to-slate-950 border border-red-900/30 flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-red-400 font-mono-code">
                  Proven Enterprise Benchmark
                </div>
                <div className="text-xs sm:text-sm font-semibold text-white mt-0.5">
                  {activeSolution.provenOutcome}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Ingested Data Sources Checklist */}
          <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800/80 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300 font-mono-code mb-4">
                <FileText className="w-4 h-4 text-red-500" />
                <span>Proprietary Sources Ingested</span>
              </div>

              <div className="space-y-2.5 mb-6">
                {activeSolution.dataSources.map((source, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60 text-xs text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0" />
                    <span>{source}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="text-[11px] text-slate-400">
                Want a custom scraper and vector pipeline scoped for your specific domain?
              </div>
              <button
                onClick={onOpenConsultation}
                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Scope {activeSolution.industry} Agent</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
