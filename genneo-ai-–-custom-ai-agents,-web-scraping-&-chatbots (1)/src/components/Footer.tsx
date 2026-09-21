import React from 'react';
import { Bot, ShieldCheck, Lock, Clock, ExternalLink } from 'lucide-react';
import { WhatsAppIcon, LinkedInIcon, MailIcon } from './CustomSocialIcons';
import { GenNeoAgentAvatar } from './GenNeoAgentAvatar';
import { GenNeoBrandLogo } from './GenNeoBrandLogo';
import { FOUNDER_CONTACT } from '../data/agencyData';

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenTerms?: () => void;
  onOpenCookieSettings?: () => void;
  onOpenNotFound?: () => void;
  onOpenConsultation?: () => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  onOpenPrivacy, 
  onOpenTerms,
  onOpenCookieSettings,
  onOpenNotFound,
  onOpenConsultation,
  onNavigateSection
}) => {
  const handleNavClick = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    if (onNavigateSection) {
      onNavigateSection(sectionId);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };
  return (
    <footer className="bg-[#E4DFD0] border-t border-[#CDC6B6] text-[#253935] text-xs py-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center">
              <GenNeoBrandLogo
                variant="full"
                heightClassName="h-8.5"
                alt="GenNeo AI Official Agency Brand"
              />
            </div>
            <p className="text-xs text-[#253935] max-w-sm leading-relaxed font-normal">
              Engineering private, grounded website AI agents and autonomous data pipelines. Zero hallucinations, verified citations, and direct engineering access.
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1">
              <a
                href={FOUNDER_CONTACT.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 min-h-[40px] px-3 py-2 rounded-xl bg-emerald-600/12 hover:bg-emerald-600/20 text-emerald-900 border border-emerald-600/30 transition-colors font-bold text-xs"
              >
                <WhatsAppIcon className="w-4 h-4 text-emerald-800" />
                <span>WhatsApp</span>
              </a>
              <a
                href={FOUNDER_CONTACT.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 min-h-[40px] px-3 py-2 rounded-xl bg-sky-600/12 hover:bg-sky-600/20 text-sky-900 border border-sky-600/30 transition-colors font-bold text-xs"
              >
                <LinkedInIcon className="w-4 h-4 text-sky-800" />
                <span>LinkedIn</span>
              </a>
              <a
                href={`mailto:${FOUNDER_CONTACT.email}?subject=Inquiry%3A%20Custom%20AI%20Agent%20Development`}
                className="inline-flex items-center gap-1.5 min-h-[40px] px-3 py-2 rounded-xl bg-[#004741]/12 hover:bg-[#004741]/20 text-[#003833] border border-[#004741]/30 transition-colors font-bold text-xs"
              >
                <MailIcon className="w-4 h-4 text-[#004741]" />
                <span>Email</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-[#11201D] uppercase font-mono-code tracking-wider">
              Navigation
            </div>
            <ul className="space-y-1 text-[#253935] font-medium">
              <li>
                <a 
                  href="#why-choose" 
                  onClick={(e) => handleNavClick(e, 'why-choose')}
                  className="inline-block py-1 hover:text-[#004741] transition-colors"
                >
                  Why GenNeo
                </a>
              </li>
              <li>
                <a 
                  href="#how-it-works" 
                  onClick={(e) => handleNavClick(e, 'how-it-works')}
                  className="inline-block py-1 hover:text-[#004741] transition-colors"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a 
                  href="#packages" 
                  onClick={(e) => handleNavClick(e, 'packages')}
                  className="inline-block py-1 hover:text-[#004741] transition-colors"
                >
                  Packages & Pricing
                </a>
              </li>
              <li>
                <a 
                  href="#contact" 
                  onClick={(e) => handleNavClick(e, 'contact')}
                  className="inline-block py-1 hover:text-[#004741] transition-colors"
                >
                  Direct Contact
                </a>
              </li>
              {onOpenConsultation && (
                <li>
                  <button 
                    onClick={onOpenConsultation} 
                    className="inline-block py-1 text-[#004741] font-bold hover:underline transition-colors cursor-pointer text-left"
                  >
                    Book Discovery Call
                  </button>
                </li>
              )}
              {onOpenPrivacy && (
                <li>
                  <button 
                    onClick={onOpenPrivacy} 
                    className="inline-block py-1 hover:text-[#004741] transition-colors cursor-pointer text-left"
                  >
                    Privacy Policy
                  </button>
                </li>
              )}
              {onOpenTerms && (
                <li>
                  <button 
                    onClick={onOpenTerms} 
                    className="inline-block py-1 hover:text-[#004741] transition-colors cursor-pointer text-left"
                  >
                    Terms & Conditions
                  </button>
                </li>
              )}
              {onOpenNotFound && (
                <li>
                  <button 
                    onClick={onOpenNotFound} 
                    className="inline-block py-1 text-[#556965] hover:text-[#004741] transition-colors cursor-pointer text-left font-mono-code text-[11px]"
                  >
                    404 Page (Demo)
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-[#11201D] uppercase font-mono-code tracking-wider">
              Lead AI Engineer Contact
            </div>
            <div className="text-xs text-[#11201D] font-bold">{FOUNDER_CONTACT.name}</div>
            <div className="text-xs text-[#253935] font-medium">{FOUNDER_CONTACT.role}</div>
            
            <div className="pt-1.5 space-y-1.5">
              <div>
                <a
                  href={`mailto:${FOUNDER_CONTACT.email}?subject=Inquiry%3A%20Custom%20AI%20Agent%20Development`}
                  className="inline-flex items-center gap-1.5 text-[#004741] hover:underline font-mono-code font-bold text-xs break-all"
                >
                  <MailIcon className="w-3.5 h-3.5 shrink-0" />
                  <span>{FOUNDER_CONTACT.email}</span>
                </a>
              </div>
              <div>
                <a
                  href={FOUNDER_CONTACT.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-900 hover:text-emerald-950 hover:underline font-mono-code font-bold text-xs"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 shrink-0 text-emerald-800" />
                  <span>{FOUNDER_CONTACT.whatsapp}</span>
                </a>
              </div>
              <div>
                <a
                  href={FOUNDER_CONTACT.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sky-900 hover:text-sky-950 hover:underline font-mono-code font-bold text-xs"
                >
                  <LinkedInIcon className="w-3.5 h-3.5 shrink-0 text-sky-800" />
                  <span>{FOUNDER_CONTACT.linkedinHandle}</span>
                </a>
              </div>
            </div>

            <div className="text-xs text-[#2C403C] font-semibold pt-1">Response SLA: &lt; 2 Hours Guaranteed</div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[#CDC6B6] flex flex-col sm:flex-row items-center justify-between gap-3 text-[#2C403C] text-xs">
          <div>
            &copy; {new Date().getFullYear()} GenNeo AI. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              onClick={onOpenPrivacy}
              className="hover:text-[#004741] text-[#253935] font-semibold transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>&bull;</span>
            {onOpenTerms && (
              <>
                <button
                  onClick={onOpenTerms}
                  className="hover:text-[#004741] text-[#253935] font-semibold transition-colors cursor-pointer"
                >
                  Terms & Conditions
                </button>
                <span>&bull;</span>
              </>
            )}
            {onOpenCookieSettings && (
              <>
                <button
                  onClick={onOpenCookieSettings}
                  className="hover:text-[#004741] text-[#253935] font-semibold transition-colors cursor-pointer"
                >
                  Cookie Settings
                </button>
                <span>&bull;</span>
              </>
            )}
            <span className="text-[#003833] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#004741]" />
              100% Grounded RAG Standard
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
