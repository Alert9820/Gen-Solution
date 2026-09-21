import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, Check, Settings2, X, ChevronDown, ChevronUp, Lock } from 'lucide-react';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  functional: boolean;
  timestamp: string;
}

interface CookieConsentBannerProps {
  onOpenPrivacy: () => void;
  onOpenTerms?: () => void;
  forceOpen?: boolean;
  onCloseSettings?: () => void;
}

const STORAGE_KEY = 'genneo_cookie_consent';

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  onOpenPrivacy,
  onOpenTerms,
  forceOpen = false,
  onCloseSettings
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsAllowed, setAnalyticsAllowed] = useState(true);
  const [functionalAllowed, setFunctionalAllowed] = useState(true);

  // Check saved consent on initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        // Slight delay so the page loads cleanly first
        const timer = setTimeout(() => setIsOpen(true), 600);
        return () => clearTimeout(timer);
      } else {
        const parsed: CookiePreferences = JSON.parse(saved);
        setAnalyticsAllowed(Boolean(parsed.analytics));
        setFunctionalAllowed(Boolean(parsed.functional));
      }
    } catch {
      setIsOpen(true);
    }
  }, []);

  // Handle external forceOpen trigger (e.g. from footer "Cookie Settings")
  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      setShowPreferences(true);
    }
  }, [forceOpen]);

  const saveConsent = (analytics: boolean, functional: boolean) => {
    const preferences: CookiePreferences = {
      necessary: true,
      analytics,
      functional,
      timestamp: new Date().toISOString()
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (e) {
      console.warn('Unable to persist cookie consent', e);
    }

    setAnalyticsAllowed(analytics);
    setFunctionalAllowed(functional);
    setIsOpen(false);
    setShowPreferences(false);
    if (onCloseSettings) onCloseSettings();
  };

  const handleAcceptAll = () => {
    saveConsent(true, true);
  };

  const handleRejectNonEssential = () => {
    saveConsent(false, false);
  };

  const handleSaveCustom = () => {
    saveConsent(analyticsAllowed, functionalAllowed);
  };

  if (!isOpen) return null;

  return (
    <aside
      aria-label="Cookie and Privacy Consent"
      role="region"
      className="fixed bottom-3 left-3 right-3 sm:bottom-4 sm:right-auto sm:left-6 z-50 sm:max-w-md md:max-w-lg bg-[#FAF8F5]/98 backdrop-blur-md border border-[#DFD9CC] rounded-2xl shadow-2xl shadow-[#162422]/15 overflow-hidden font-sans animate-fade-in"
    >
      <div className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#004741]/10 border border-[#004741]/20 flex items-center justify-center text-[#004741] shrink-0">
              <Cookie className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#162422] font-display flex items-center gap-1.5">
                <span>Cookie & Privacy Choices</span>
                <span className="inline-flex items-center text-[10px] font-mono-code font-semibold px-1.5 py-0.5 rounded bg-emerald-100/80 text-emerald-800 border border-emerald-200">
                  GDPR Ready
                </span>
              </h2>
              <p className="text-[11px] text-[#5A6966]">
                Respecting your privacy with transparent tracking options.
              </p>
            </div>
          </div>

          {forceOpen && onCloseSettings && (
            <button
              onClick={() => {
                setIsOpen(false);
                onCloseSettings();
              }}
              className="text-[#657371] hover:text-[#162422] p-1 rounded-lg hover:bg-[#E8E4D9] transition-colors cursor-pointer"
              aria-label="Close cookie preferences"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Description Body */}
        <p className="text-xs text-[#4F5E5C] leading-relaxed mb-3.5">
          We use strictly necessary cookies to ensure encrypted security, HTTPS enforcement, and session integrity. Optional analytics help us evaluate system latency and improve our custom AI agent scraping pipelines.{' '}
          <button
            type="button"
            onClick={onOpenPrivacy}
            className="text-[#004741] font-semibold underline underline-offset-2 hover:text-[#003632] cursor-pointer"
          >
            Privacy Policy
          </button>
          {onOpenTerms && (
            <>
              {' '}and{' '}
              <button
                type="button"
                onClick={onOpenTerms}
                className="text-[#004741] font-semibold underline underline-offset-2 hover:text-[#003632] cursor-pointer"
              >
                Terms
              </button>
            </>
          )}
          .
        </p>

        {/* Detailed Preferences Section (Expandable) */}
        {showPreferences && (
          <div className="mb-4 pt-3 border-t border-[#E8E4D9] space-y-2.5">
            {/* 1. Necessary (Always Active) */}
            <div className="p-2.5 rounded-xl bg-[#F0EDE4] border border-[#E0DBCF] flex items-center justify-between gap-3">
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-[#004741] shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-[#162422] flex items-center gap-1.5">
                    <span>Strictly Necessary</span>
                    <span className="text-[10px] font-mono-code text-[#657371] bg-[#FAF8F5] px-1.5 py-0.2 rounded border border-[#DFD9CC]">
                      Always Active
                    </span>
                  </div>
                  <div className="text-[11px] text-[#556360]">
                    Required for HTTPS routing, HSTS headers, CSRF, and remembering your privacy settings.
                  </div>
                </div>
              </div>
              <div className="shrink-0">
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="w-4 h-4 accent-[#004741] cursor-not-allowed opacity-80"
                  aria-label="Necessary cookies always active"
                />
              </div>
            </div>

            {/* 2. Analytics & Performance */}
            <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#DFD9CC] flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-[#162422]">
                  Performance & Analytics
                </div>
                <div className="text-[11px] text-[#556360]">
                  Measures page loading speeds, response latency, and aggregated visitor metrics with zero public profiling.
                </div>
              </div>
              <div className="shrink-0">
                <input
                  type="checkbox"
                  id="cookie-analytics"
                  checked={analyticsAllowed}
                  onChange={(e) => setAnalyticsAllowed(e.target.checked)}
                  className="w-4 h-4 accent-[#004741] rounded cursor-pointer"
                />
              </div>
            </div>

            {/* 3. Functional / Agent Preferences */}
            <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#DFD9CC] flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-[#162422]">
                  Agent & Functional Memory
                </div>
                <div className="text-[11px] text-[#556360]">
                  Persists your interactive widget chat session so queries aren't lost when navigating pages.
                </div>
              </div>
              <div className="shrink-0">
                <input
                  type="checkbox"
                  id="cookie-functional"
                  checked={functionalAllowed}
                  onChange={(e) => setFunctionalAllowed(e.target.checked)}
                  className="w-4 h-4 accent-[#004741] rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Button Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#E8E4D9]/80">
          {!showPreferences ? (
            <>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="flex-1 sm:flex-none min-h-[40px] px-3.5 py-2 bg-[#004741] hover:bg-[#003632] text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Accept All</span>
              </button>

              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="flex-1 sm:flex-none min-h-[40px] px-3.5 py-2 bg-[#FAF8F5] hover:bg-white text-[#2C3B38] border border-[#D5CFBF] text-xs font-semibold rounded-xl transition-all flex items-center justify-center cursor-pointer"
              >
                <span>Necessary Only</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPreferences(true)}
                className="min-h-[40px] px-2.5 py-2 text-xs font-semibold text-[#5A6966] hover:text-[#004741] transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>Preferences</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleSaveCustom}
                className="flex-1 sm:flex-none min-h-[40px] px-4 py-2 bg-[#004741] hover:bg-[#003632] text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Preferences</span>
              </button>

              <button
                type="button"
                onClick={handleAcceptAll}
                className="flex-1 sm:flex-none min-h-[40px] px-3.5 py-2 bg-[#FAF8F5] hover:bg-white text-[#2C3B38] border border-[#D5CFBF] text-xs font-semibold rounded-xl transition-all flex items-center justify-center cursor-pointer"
              >
                <span>Accept All</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="min-h-[40px] px-2.5 py-2 text-xs font-semibold text-[#5A6966] hover:text-[#162422] transition-colors flex items-center justify-center cursor-pointer"
              >
                Back
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};
