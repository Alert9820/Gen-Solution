import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  ShieldCheck, 
  ArrowRight, 
  Layers,
  Sparkles,
  Award
} from 'lucide-react';
import { COMPARISON_METRICS, FOUNDER_CONTACT } from '../data/agencyData';

interface EnterpriseBenchmarkMatrixProps {
  onOpenConsultation: () => void;
}

export const EnterpriseBenchmarkMatrix: React.FC<EnterpriseBenchmarkMatrixProps> = ({
  onOpenConsultation
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'critical'>('all');

  const filteredMetrics = selectedFilter === 'critical'
    ? COMPARISON_METRICS.filter(m => m.criticalForEnterprise)
    : COMPARISON_METRICS;

  return (
    <section id="benchmark-matrix" className="py-20 bg-slate-950 text-slate-100 border-b border-slate-900 font-sans relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-red-600/5 blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Hitachi Vantara Signature Red Accent Marker */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-1 bg-red-600 rounded-full inline-block" />
              <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-red-500">
                Enterprise Benchmark Matrix
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Generic Chatbot Wrappers vs. GenNeo Enterprise Architecture
            </h2>

            <p className="mt-3 text-sm sm:text-base text-slate-400 leading-relaxed">
              Why Fortune 500 decision makers avoid off-the-shelf bots: compare architectural grounding, data privacy guarantees, latency benchmarks, and engineering accountability.
            </p>
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono-code">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-red-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Specifications ({COMPARISON_METRICS.length})
            </button>
            <button
              onClick={() => setSelectedFilter('critical')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedFilter === 'critical'
                  ? 'bg-red-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Critical Security Specs ({COMPARISON_METRICS.filter(m => m.criticalForEnterprise).length})
            </button>
          </div>
        </div>

        {/* Matrix Table Container */}
        <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-900/50 backdrop-blur-md shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/90 text-xs font-mono-code tracking-wider">
                <th className="py-4 px-6 text-slate-400 font-bold uppercase w-1/4">
                  Evaluation Dimension
                </th>
                <th className="py-4 px-6 text-slate-500 font-bold uppercase w-1/3 bg-slate-950/40">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-slate-500" />
                    <span>Generic SaaS Chatbots</span>
                  </div>
                </th>
                <th className="py-4 px-6 text-white font-bold uppercase w-5/12 bg-red-950/30 border-l border-r border-red-600/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-red-400 font-extrabold">
                      <Award className="w-4 h-4 text-red-500" />
                      <span>GenNeo AI Enterprise Architecture</span>
                    </div>
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] bg-red-600 text-white font-bold">
                      VERIFIED BENCHMARK
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm">
              {filteredMetrics.map((metric, idx) => (
                <tr 
                  key={idx} 
                  className={`hover:bg-slate-800/30 transition-colors ${
                    idx % 2 === 0 ? 'bg-slate-950/20' : 'bg-transparent'
                  }`}
                >
                  {/* Dimension Name */}
                  <td className="py-4 px-6 font-semibold text-slate-200">
                    <div className="font-bold text-white text-sm">{metric.feature}</div>
                    <div className="text-[10px] font-mono-code text-slate-500 uppercase mt-0.5">
                      Category: {metric.category}
                    </div>
                  </td>

                  {/* Generic Chatbot Flaws */}
                  <td className="py-4 px-6 text-slate-400 bg-slate-950/40">
                    <div className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{metric.genericChatbot}</span>
                    </div>
                  </td>

                  {/* GenNeo AI Enterprise Superiority */}
                  <td className="py-4 px-6 text-slate-200 bg-red-950/15 border-l border-r border-red-600/20 font-medium">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-white font-semibold leading-relaxed">
                          {metric.genneoEnterprise}
                        </span>
                        <div className="mt-1.5 text-xs text-red-400 font-mono-code flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          <span>Advantage: {metric.advantage}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Callout Banner */}
        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border border-red-900/40 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-base font-bold text-white flex items-center justify-center md:justify-start gap-2">
              <ShieldCheck className="w-5 h-5 text-red-500" />
              100% Zero-Hallucination & Zero Public Training Guarantee
            </h4>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Every GenNeo AI agent is bound by formal service level agreements. If an inquiry cannot be answered with high confidence from your scraped data, it gracefully escalates to {FOUNDER_CONTACT.name} or your dedicated team.
            </p>
          </div>

          <button
            onClick={onOpenConsultation}
            className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-red-600/20 flex items-center gap-2 flex-shrink-0 cursor-pointer"
          >
            <span>Request Technical Architecture Audit</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
