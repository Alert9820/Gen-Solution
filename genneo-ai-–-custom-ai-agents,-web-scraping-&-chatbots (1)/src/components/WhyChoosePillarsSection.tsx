import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  RefreshCw, 
  Zap, 
  UserCheck, 
  ArrowRight, 
  CheckCircle2,
  Lock,
  Clock
} from 'lucide-react';
import { FOUNDER_CONTACT } from '../data/agencyData';

interface WhyChoosePillarsSectionProps {
  onOpenConsultation: () => void;
  onExploreArchitecture?: () => void;
}

export const WhyChoosePillarsSection: React.FC<WhyChoosePillarsSectionProps> = ({
  onOpenConsultation,
  onExploreArchitecture
}) => {
  const pillars = [
    {
      icon: ShieldCheck,
      badge: 'Grounded RAG',
      title: 'Zero-Hallucination Truth',
      desc: 'Answers are strictly bound to your scraped web pages, docs, and PDFs. If the information does not exist in your verified data, the agent gracefully routes to human contact.',
      metric: '100% Grounded'
    },
    {
      icon: RefreshCw,
      badge: 'Automated Sync',
      title: 'Continuous Content Parity',
      desc: 'Whenever you update prices, products, or documentation, our scheduled re-crawlers automatically re-index your pages to ensure the bot never gives outdated info.',
      metric: 'Auto-Sync'
    },
    {
      icon: Zap,
      badge: 'Conversion Engine',
      title: 'Intent-to-Action Conversion',
      desc: 'When a visitor prompts "I have to contact you guys", the agent immediately surfaces direct contact channels, working hours, and calendar booking flows.',
      metric: '4.4x Leads'
    },
    {
      icon: UserCheck,
      badge: 'Senior Attention',
      title: '1-on-1 Lead Developer',
      desc: `Direct engineering and prompt tuning with ${FOUNDER_CONTACT.name}. No account managers, offshore handoffs, or automated ticket queues.`,
      metric: '< 2h Response'
    }
  ];

  return (
    <section id="why-choose" className="py-16 md:py-20 bg-[#F7F5F0] border-b border-[#DFD9CC] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="max-w-3xl mx-auto text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#004741]/12 border border-[#004741]/30 text-[#003833] text-xs font-bold mb-3">
            <span>Why Choose GenNeo AI</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#11201D] tracking-tight">
            Engineered for Precision, Privacy & Autonomous Conversion.
          </h2>
          <p className="mt-3 text-[#253935] text-sm sm:text-base leading-relaxed font-normal">
            Generic chatbots hallucinate and leak data. We build private, deterministic AI agents grounded exclusively in your verified knowledge.
          </p>
        </motion.div>

        {/* 4 Crisp Premium Cards with Staggered Scroll-In */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: idx * 0.08, ease: 'easeOut' }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="p-5 sm:p-6 rounded-2xl bg-[#FAF8F5] border border-[#CDC6B6] hover:border-[#004741] hover:bg-white hover:shadow-lg hover:shadow-[#004741]/10 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#CDC6B6] shadow-2xs flex items-center justify-center text-[#004741]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono-code font-bold px-2 py-0.5 rounded bg-white text-[#162724] border border-[#CDC6B6]">
                      {pillar.metric}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#11201D] mb-2">
                    {pillar.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#253935] leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#DCD6C8] flex items-center text-xs font-bold text-[#004741]">
                  <span>Verified Standard</span>
                  <CheckCircle2 className="w-3.5 h-3.5 ml-1" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Bottom Banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          className="mt-10 p-5 rounded-2xl bg-[#FAF8F5] border border-[#CDC6B6] flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#004741]/12 text-[#004741] border border-[#004741]/30 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div className="text-xs text-[#253935]">
              <strong className="text-[#11201D]">Zero Public Model Training:</strong> Your business IP and scraped website data are stored in a private AES-256 vector store.
            </div>
          </div>
          <button
            onClick={onOpenConsultation}
            className="w-full sm:w-auto min-h-[44px] justify-center px-5 py-2.5 bg-[#004741] hover:bg-[#003632] text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm shadow-[#004741]/20"
          >
            <span>Talk to Lead Developer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};
