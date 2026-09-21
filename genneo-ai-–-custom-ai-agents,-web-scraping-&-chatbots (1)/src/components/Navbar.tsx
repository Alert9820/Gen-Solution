import React, { useState } from 'react';
import { Bot, Menu, X, Calendar, Sparkles, Workflow } from 'lucide-react';
import { WhatsAppIcon, LinkedInIcon, MailIcon } from './CustomSocialIcons';
import { GenNeoAgentAvatar } from './GenNeoAgentAvatar';
import { GenNeoBrandLogo } from './GenNeoBrandLogo';
import { FOUNDER_CONTACT } from '../data/agencyData';

interface NavbarProps {
  onOpenConsultation: () => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
  onGoHome?: () => void;
  onNavigateSection?: (sectionId: string) => void;
  isPrivacyPage?: boolean;
  isTermsPage?: boolean;
  isNotFoundPage?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenConsultation,
  onOpenPrivacy,
  onOpenTerms,
  onGoHome,
  onNavigateSection,
  isPrivacyPage = false,
  isTermsPage = false,
  isNotFoundPage = false
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isCustomPageView = isPrivacyPage || isTermsPage || isNotFoundPage;

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
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#CDC6B6] bg-[#FAF8F5]/98 backdrop-blur-md font-sans">
      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={onGoHome ? onGoHome : undefined}
          className="flex items-center gap-3 group text-left cursor-pointer bg-transparent border-0 p-0"
        >
          {/* Official GenNeo Brand Logo lockup */}
          <div className="flex items-center">
            <GenNeoBrandLogo
              variant="full"
              heightClassName="h-8.5 sm:h-9"
              alt="GenNeo Official Brand Logo"
            />
          </div>

          <div className="hidden lg:flex flex-col border-l border-[#CDC6B6] pl-3 py-0.5">
            <span className="text-[10px] text-[#253935] font-bold tracking-wider uppercase font-mono-code">AI Engineering Agency</span>
            <span className="text-[9px] text-[#3B4E4A] font-semibold">Autonomous Website Agents</span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-bold text-[#253935]">
          {isCustomPageView ? (
            <>
              <button
                onClick={onGoHome}
                className="text-[#004741] hover:text-[#003632] font-bold transition-colors flex items-center gap-1 cursor-pointer"
              >
                &larr; Return to Home
              </button>
              {onOpenPrivacy && (
                <button
                  onClick={onOpenPrivacy}
                  className={`hover:text-[#004741] transition-colors cursor-pointer text-xs font-semibold ${isPrivacyPage ? 'text-[#004741] font-bold underline underline-offset-4' : ''}`}
                >
                  Privacy Policy
                </button>
              )}
              {onOpenTerms && (
                <button
                  onClick={onOpenTerms}
                  className={`hover:text-[#004741] transition-colors cursor-pointer text-xs font-semibold ${isTermsPage ? 'text-[#004741] font-bold underline underline-offset-4' : ''}`}
                >
                  Terms & Conditions
                </button>
              )}
            </>
          ) : (
            <>
              <a 
                href="#why-choose" 
                onClick={(e) => handleNavClick(e, 'why-choose')}
                className="hover:text-[#004741] transition-colors"
              >
                Why GenNeo
              </a>
              <a 
                href="#how-it-works" 
                onClick={(e) => handleNavClick(e, 'how-it-works')}
                className="hover:text-[#004741] transition-colors"
              >
                How It Works
              </a>
              <a 
                href="#packages" 
                onClick={(e) => handleNavClick(e, 'packages')}
                className="hover:text-[#004741] transition-colors"
              >
                Packages & Pricing
              </a>
              <a 
                href="#contact" 
                onClick={(e) => handleNavClick(e, 'contact')}
                className="hover:text-[#004741] transition-colors"
              >
                Direct Contact
              </a>
              {onOpenPrivacy && (
                <button
                  onClick={onOpenPrivacy}
                  className="hover:text-[#004741] transition-colors cursor-pointer text-xs font-bold"
                >
                  Privacy
                </button>
              )}
              {onOpenTerms && (
                <button
                  onClick={onOpenTerms}
                  className="hover:text-[#004741] transition-colors cursor-pointer text-xs font-bold"
                >
                  Terms
                </button>
              )}
            </>
          )}
        </nav>

        {/* Action Button & Contact */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={onOpenConsultation}
            className="px-4 py-2 bg-[#004741] hover:bg-[#003632] text-white font-bold text-xs rounded-xl transition-all shadow-sm shadow-[#004741]/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Consultation</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#253935] hover:text-[#11201D] rounded-xl hover:bg-[#E8E4D9] transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-[#004741]" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF8F5] border-b border-[#CDC6B6] px-4 pt-2 pb-5 space-y-3 font-sans shadow-lg">
          <div className="flex flex-col text-sm font-bold text-[#253935]">
            {isCustomPageView ? (
              <>
                <button
                  onClick={() => {
                    if (onGoHome) onGoHome();
                    setMobileMenuOpen(false);
                  }}
                  className="text-[#004741] text-left min-h-[44px] flex items-center font-bold border-b border-[#DCD6C8] cursor-pointer"
                >
                  &larr; Return to Home Platform
                </button>
                <div className="pt-2 pb-1 border-b border-[#DCD6C8]">
                  <span className="text-[10px] font-mono-code uppercase font-bold text-[#556965] block mb-1">
                    Direct Section Jump
                  </span>
                  <a
                    href="#why-choose"
                    onClick={(e) => handleNavClick(e, 'why-choose')}
                    className="min-h-[40px] flex items-center text-xs text-[#253935] hover:text-[#004741] border-b border-[#EAE6DC]"
                  >
                    Why GenNeo
                  </a>
                  <a
                    href="#how-it-works"
                    onClick={(e) => handleNavClick(e, 'how-it-works')}
                    className="min-h-[40px] flex items-center text-xs text-[#253935] hover:text-[#004741] border-b border-[#EAE6DC]"
                  >
                    How It Works
                  </a>
                  <a
                    href="#packages"
                    onClick={(e) => handleNavClick(e, 'packages')}
                    className="min-h-[40px] flex items-center text-xs text-[#253935] hover:text-[#004741] border-b border-[#EAE6DC]"
                  >
                    Packages & Pricing
                  </a>
                  <a
                    href="#contact"
                    onClick={(e) => handleNavClick(e, 'contact')}
                    className="min-h-[40px] flex items-center text-xs text-[#253935] hover:text-[#004741]"
                  >
                    Direct Contact
                  </a>
                </div>
                {onOpenPrivacy && (
                  <button
                    onClick={() => {
                      onOpenPrivacy();
                      setMobileMenuOpen(false);
                    }}
                    className={`min-h-[44px] flex items-center text-left hover:text-[#004741] border-b border-[#DCD6C8] cursor-pointer ${isPrivacyPage ? 'text-[#004741] font-bold' : ''}`}
                  >
                    Privacy Policy
                  </button>
                )}
                {onOpenTerms && (
                  <button
                    onClick={() => {
                      onOpenTerms();
                      setMobileMenuOpen(false);
                    }}
                    className={`min-h-[44px] flex items-center text-left hover:text-[#004741] border-b border-[#DCD6C8] cursor-pointer ${isTermsPage ? 'text-[#004741] font-bold' : ''}`}
                  >
                    Terms & Conditions
                  </button>
                )}
              </>
            ) : (
              <>
                <a
                  href="#why-choose"
                  onClick={(e) => handleNavClick(e, 'why-choose')}
                  className="min-h-[44px] flex items-center hover:text-[#004741] border-b border-[#DCD6C8]"
                >
                  Why GenNeo
                </a>
                <a
                  href="#how-it-works"
                  onClick={(e) => handleNavClick(e, 'how-it-works')}
                  className="min-h-[44px] flex items-center hover:text-[#004741] border-b border-[#DCD6C8]"
                >
                  How It Works
                </a>
                <a
                  href="#packages"
                  onClick={(e) => handleNavClick(e, 'packages')}
                  className="min-h-[44px] flex items-center hover:text-[#004741] border-b border-[#DCD6C8]"
                >
                  Packages & Pricing
                </a>
                <a
                  href="#contact"
                  onClick={(e) => handleNavClick(e, 'contact')}
                  className="min-h-[44px] flex items-center hover:text-[#004741] border-b border-[#DCD6C8]"
                >
                  Direct Contact
                </a>
                {onOpenPrivacy && (
                  <button
                    onClick={() => {
                      onOpenPrivacy();
                      setMobileMenuOpen(false);
                    }}
                    className="min-h-[44px] flex items-center text-left hover:text-[#004741] border-b border-[#DCD6C8] cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                )}
                {onOpenTerms && (
                  <button
                    onClick={() => {
                      onOpenTerms();
                      setMobileMenuOpen(false);
                    }}
                    className="min-h-[44px] flex items-center text-left hover:text-[#004741] border-b border-[#DCD6C8] cursor-pointer"
                  >
                    Terms & Conditions
                  </button>
                )}
              </>
            )}
          </div>

          <div className="pt-2 border-t border-[#DCD6C8] space-y-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenConsultation();
              }}
              className="w-full min-h-[44px] py-3 bg-[#004741] hover:bg-[#003632] text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-[#004741]/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Discovery Call</span>
            </button>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <a
                href={FOUNDER_CONTACT.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 min-h-[42px] py-2 px-1.5 rounded-lg bg-emerald-600/12 text-emerald-900 border border-emerald-600/30 font-mono-code font-bold text-xs"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                <span className="truncate">WhatsApp</span>
              </a>
              <a
                href={FOUNDER_CONTACT.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 min-h-[42px] py-2 px-1.5 rounded-lg bg-sky-600/12 text-sky-900 border border-sky-600/30 font-mono-code font-bold text-xs"
              >
                <LinkedInIcon className="w-3.5 h-3.5 text-sky-800 shrink-0" />
                <span className="truncate">LinkedIn</span>
              </a>
              <a
                href={`mailto:${FOUNDER_CONTACT.email}?subject=Inquiry%3A%20Custom%20AI%20Agent%20Development`}
                className="flex items-center justify-center gap-1 min-h-[42px] py-2 px-1.5 rounded-lg bg-[#004741]/12 text-[#003833] border border-[#004741]/30 font-mono-code font-bold text-xs"
              >
                <MailIcon className="w-3.5 h-3.5 text-[#004741] shrink-0" />
                <span className="truncate">Email</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
