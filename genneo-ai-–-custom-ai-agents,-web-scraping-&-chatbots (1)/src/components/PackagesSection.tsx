import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Sparkles,
  Calendar
} from 'lucide-react';
import { AI_PACKAGES, FOUNDER_CONTACT } from '../data/agencyData';

interface PackagesSectionProps {
  onSelectPackage: (packageName: string) => void;
  onOpenConsultation: () => void;
}

export const PackagesSection: React.FC<PackagesSectionProps> = ({
  onSelectPackage,
  onOpenConsultation
}) => {
  return (
    <section id="packages" className="py-16 md:py-20 bg-[#F7F5F0] relative border-b border-[#DFD9CC] font-sans">
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
            <span>Simple & Transparent Pricing</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#11201D] tracking-tight">
            Fixed-Price AI Agent Scopes
          </h2>

          <p className="mt-3 text-sm sm:text-base text-[#253935] leading-relaxed font-normal">
            No surprise fees. Every tier includes website crawling, private vector setup, anti-hallucination testing, and direct engineering with {FOUNDER_CONTACT.name}.
          </p>
        </motion.div>

        {/* 3 Packages Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {AI_PACKAGES.map((pkg, idx) => {
            const isFeatured = !!pkg.badge;
            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: idx * 0.1, ease: 'easeOut' }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`rounded-2xl p-5 sm:p-7 flex flex-col justify-between transition-all duration-200 relative ${
                  isFeatured
                    ? 'bg-white border-2 border-[#004741] shadow-xl shadow-[#004741]/15 ring-1 ring-[#004741]/30'
                    : 'bg-[#FAF8F5] border border-[#CDC6B6] hover:border-[#004741] hover:bg-white hover:shadow-md'
                }`}
              >
                {pkg.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#004741] text-white font-bold text-xs shadow-sm tracking-wider uppercase font-mono-code whitespace-nowrap">
                    Most Popular
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="text-lg font-bold text-[#11201D]">
                      {pkg.name}
                    </h3>
                  </div>

                  <div className="inline-block text-xs font-mono-code font-bold text-[#003833] px-2.5 py-0.5 bg-[#004741]/12 border border-[#004741]/30 rounded mb-3">
                    {pkg.turnaroundTime}
                  </div>

                  <p className="text-xs text-[#253935] leading-relaxed mb-4 min-h-[36px]">
                    {pkg.description}
                  </p>

                  {/* Price */}
                  <div className="mb-5 pb-5 border-b border-[#DCD6C8]">
                    <div className="flex flex-wrap items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black font-display text-[#11201D]">
                        {pkg.price}
                      </span>
                      <span className="text-xs text-[#2C403C] font-semibold">
                        {pkg.price === 'Custom Quote' ? '' : '/ one-time setup'}
                      </span>
                    </div>

                    {pkg.monthlyPrice && (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-[#003833] font-bold bg-[#004741]/12 px-2.5 py-1 rounded-md border border-[#004741]/25 w-fit font-mono-code">
                        <span>+ {pkg.monthlyPrice}</span>
                        <span className="text-xs text-[#253935] font-normal font-sans">
                          {pkg.price === 'Custom Quote' ? '' : '(maintenance & sync)'}
                        </span>
                      </div>
                    )}

                    <div className="text-xs text-[#2C403C] mt-2 font-medium">
                      Scope: <strong className="text-[#11201D] font-bold">{pkg.scrapingScope}</strong>
                    </div>
                  </div>

                  {/* Capabilities List */}
                  <div className="space-y-2 mb-6">
                    <div className="text-xs font-bold text-[#11201D] uppercase font-mono-code tracking-wider">
                      Included Capabilities:
                    </div>
                    {pkg.agentCapabilities.slice(0, 4).map((cap, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-[#1E312E] font-medium">
                        <CheckCircle2 className="w-4 h-4 text-[#004741] shrink-0 mt-0.5" />
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onSelectPackage(pkg.name)}
                    className={`w-full min-h-[44px] py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isFeatured
                        ? 'bg-[#004741] hover:bg-[#003632] text-white shadow-md shadow-[#004741]/20'
                        : 'bg-[#11201D] hover:bg-[#004741] text-white'
                    }`}
                  >
                    <span>Choose Package</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Reassurance text */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 text-center text-xs text-[#253935] font-semibold flex items-center justify-center gap-2"
        >
          <Clock className="w-4 h-4 text-[#004741]" />
          <span>7–10 day turnaround SLA on all packages. Have custom integration requirements? Contact Bhavesh directly.</span>
        </motion.div>
      </div>
    </section>
  );
};
