import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Clock, 
  Lock, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { InteractiveAgentSimulator } from './InteractiveAgentSimulator';
import { FOUNDER_CONTACT } from '../data/agencyData';

interface HeroProps {
  onOpenConsultation: () => void;
  onExplorePipeline: () => void;
  onExploreWhyChoose?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ 
  onOpenConsultation,
  onExplorePipeline,
  onExploreWhyChoose
}) => {
  return (
    <section className="relative overflow-hidden pt-7 pb-12 md:pt-10 md:pb-16 bg-[#F0EDE4] font-sans border-b border-[#DFD9CC]">
      {/* Subtle clean background accent glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-[#004741]/10 blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Minimal Badge */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="flex justify-center mb-4"
        >
          <div className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-[#FAF8F5] border border-[#CDC6B6] text-[11px] sm:text-xs font-semibold text-[#182825] shadow-2xs max-w-full text-center">
            <span className="w-2 h-2 rounded-full bg-[#004741] animate-pulse shrink-0" />
            <span>Autonomous AI Agents & Website Scraping</span>
            <span className="hidden sm:inline text-[#8C8472]">|</span>
            <span className="text-[#004741] font-mono-code font-bold">7–10 Day Delivery</span>
          </div>
        </motion.div>

        {/* Hero Headings - Clean, Balanced, High-Impact */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' }}
          className="text-center max-w-3xl mx-auto mb-6 space-y-3"
        >
          <h1 className="font-display text-2xl sm:text-4xl lg:text-[44px] font-extrabold text-[#11201D] tracking-tight leading-[1.2] sm:leading-[1.15] px-1">
            Turn Your Website Into an Intelligent,{' '}
            <span className="text-[#004741]">Grounded AI Agent.</span>
          </h1>

          <p className="text-xs sm:text-base text-[#253935] leading-relaxed font-normal max-w-xl mx-auto px-2">
            We crawl your pages, FAQs, and PDFs into an air-gapped vector memory. Your visitors get instant, verifiable answers and direct contact flows with zero hallucinations.
          </p>

          {/* 3 Core Proof Guarantees */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="pt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:gap-6 text-[11px] sm:text-xs font-semibold text-[#253935] px-2"
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#004741] shrink-0" />
              <span>100% Grounded Accuracy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#004741] shrink-0" />
              <span>7–10 Day Delivery SLA</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#004741] shrink-0" />
              <span>Zero Public Model Training</span>
            </div>
          </motion.div>

          {/* Quick Action Navigation CTAs */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
            <button
              onClick={onOpenConsultation}
              className="px-4 py-2 bg-[#004741] hover:bg-[#003632] text-white font-bold text-xs rounded-xl transition-all shadow-sm shadow-[#004741]/20 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Book Discovery Call</span>
              <span aria-hidden="true">&rarr;</span>
            </button>
            <button
              onClick={onExplorePipeline}
              className="px-4 py-2 bg-[#FAF8F5] hover:bg-white text-[#11201D] hover:text-[#004741] border border-[#CDC6B6] font-bold text-xs rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>How We Ingest & Deploy</span>
              <span aria-hidden="true">&darr;</span>
            </button>
          </div>
        </motion.div>

        {/* Live Interactive Simulator - Compact & Sleek */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          className="mt-5 max-w-3xl mx-auto"
        >
          <div className="text-center mb-2.5">
            <span className="text-[11px] font-mono-code text-[#2A3F3B] uppercase tracking-wider font-semibold flex items-center justify-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#004741]" />
              Live Interactive Agent Simulator &bull; Try It Below
            </span>
          </div>
          <InteractiveAgentSimulator onOpenConsultation={onOpenConsultation} />
        </motion.div>
      </div>
    </section>
  );
};
