/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { WhyChoosePillarsSection } from './components/WhyChoosePillarsSection';
import { ScrapingAndTrainingPipeline } from './components/ScrapingAndTrainingPipeline';
import { PackagesSection } from './components/PackagesSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { ConsultationModal } from './components/ConsultationModal';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsAndConditions } from './components/TermsAndConditions';
import { NotFoundPage } from './components/NotFoundPage';
import { LiveAgentChatWidget } from './components/LiveAgentChatWidget';
import { CookieConsentBanner } from './components/CookieConsentBanner';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'privacy' | 'terms' | '404'>('home');
  const [attemptedRoute, setAttemptedRoute] = useState<string>('');
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [isCookieSettingsOpen, setIsCookieSettingsOpen] = useState(false);
  const [prefillUrl, setPrefillUrl] = useState('');
  const [selectedPackageName, setSelectedPackageName] = useState<string>('');

  // Sync state with URL pathname & hash for seamless SPA routing and 404 detection
  useEffect(() => {
    const checkRoute = () => {
      const pathname = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();

      // Priority: If user clicked or landed on a section anchor hash (#why-choose, #how-it-works, #packages, #contact)
      const validSectionHashes = ['#why-choose', '#how-it-works', '#packages', '#contact', '#timeline', '#services', '#precautions'];
      if (validSectionHashes.includes(hash)) {
        setCurrentView('home');
        setAttemptedRoute('');
        if (pathname !== '/' && pathname !== '/index.html' && pathname !== '') {
          window.history.pushState(null, '', '/' + hash);
        }
        setTimeout(() => {
          const sectionId = hash.slice(1);
          const el = document.getElementById(sectionId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 120);
        return;
      }

      // 1. Privacy Policy route
      if (
        pathname === '/privacy' ||
        pathname === '/privacy-policy' ||
        hash === '#privacy' ||
        hash === '#privacy-policy'
      ) {
        setCurrentView('privacy');
        setAttemptedRoute('');
        return;
      }

      // 2. Terms & Conditions route
      if (
        pathname === '/terms' ||
        pathname === '/terms-and-conditions' ||
        hash === '#terms' ||
        hash === '#terms-and-conditions'
      ) {
        setCurrentView('terms');
        setAttemptedRoute('');
        return;
      }

      // 3. Explicit 404 / Not Found triggers
      if (
        pathname === '/404' ||
        pathname === '/not-found' ||
        hash === '#404' ||
        hash === '#not-found'
      ) {
        setCurrentView('404');
        setAttemptedRoute(pathname !== '/' && pathname !== '/index.html' ? pathname : hash);
        return;
      }

      // 4. Any unindexed or unknown URL pathname (e.g. /unknown-page, /blog, /pricing-plan)
      if (pathname !== '/' && pathname !== '/index.html' && pathname !== '') {
        setCurrentView('404');
        setAttemptedRoute(window.location.pathname + window.location.search + (window.location.hash || ''));
        return;
      }

      // 5. Default: Standard Home view (allows section anchor hashes like #why-choose, #how-it-works, #packages, etc.)
      setCurrentView('home');
      setAttemptedRoute('');
    };

    checkRoute();
    window.addEventListener('hashchange', checkRoute);
    window.addEventListener('popstate', checkRoute);
    return () => {
      window.removeEventListener('hashchange', checkRoute);
      window.removeEventListener('popstate', checkRoute);
    };
  }, []);

  // Dynamically update document title, meta description, and robots directives based on active view
  useEffect(() => {
    let title = 'GenNeo AI – Custom AI Agents, Web Scraping & Chatbots';
    let description = 'Custom AI agents engineered in 7–10 days. We scrape your website, train grounded RAG chatbots, and automate workflows with zero hallucinations.';

    if (currentView === 'privacy') {
      title = 'Privacy Policy – GenNeo AI Data Scraping & Protection Standards';
      description = 'Review GenNeo AI privacy policies, data scraping safeguards, zero-training vector retention policies, and GDPR compliance guidelines.';
    } else if (currentView === 'terms') {
      title = 'Terms of Service – GenNeo AI Engineering SLA & Contracts';
      description = 'Official Terms and Conditions for GenNeo AI custom AI agent development, website scraping services, fixed deliverables, and maintenance SLAs.';
    } else if (currentView === '404') {
      title = '404: Page Not Found – GenNeo AI';
      description = 'The requested route does not exist or has moved. Return to the GenNeo AI homepage to explore custom AI agents, web scraping, and RAG architectures.';
    }

    document.title = title;

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    }

    // Update OpenGraph Title & Description
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', title);
    }
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute('content', description);
    }

    // Update robots directive: prevent search indexing on 404 pages
    const robotsMeta = document.querySelector('meta[name="robots"]');
    if (robotsMeta) {
      if (currentView === '404') {
        robotsMeta.setAttribute('content', 'noindex, follow');
      } else {
        robotsMeta.setAttribute('content', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
      }
    }
  }, [currentView]);

  const handleOpenPrivacy = () => {
    setCurrentView('privacy');
    setAttemptedRoute('');
    window.location.hash = 'privacy';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenTerms = () => {
    setCurrentView('terms');
    setAttemptedRoute('');
    window.location.hash = 'terms';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenNotFound = () => {
    setCurrentView('404');
    setAttemptedRoute('/example-unindexed-route');
    window.history.pushState(null, '', '/404');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoHome = () => {
    setCurrentView('home');
    setAttemptedRoute('');
    window.history.pushState(null, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToSection = (sectionId: string) => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setAttemptedRoute('');
      window.history.pushState(null, '', '/#' + sectionId);
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    } else {
      window.history.pushState(null, '', '#' + sectionId);
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectPackage = (packageName: string) => {
    setSelectedPackageName(packageName);
    setIsConsultationOpen(true);
  };

  const handleOpenConsultationWithDomain = (domain?: string) => {
    if (domain) {
      setPrefillUrl(domain.startsWith('http') ? domain : `https://${domain}`);
    }
    setIsConsultationOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F0EDE4] text-[#162422] flex flex-col font-sans selection:bg-[#004741]/15 selection:text-[#004741]">
      {/* Clean Premium Light Navbar */}
      <Navbar
        onOpenConsultation={() => {
          setSelectedPackageName('');
          setIsConsultationOpen(true);
        }}
        onOpenPrivacy={handleOpenPrivacy}
        onOpenTerms={handleOpenTerms}
        onGoHome={handleGoHome}
        onNavigateSection={handleScrollToSection}
        isPrivacyPage={currentView === 'privacy'}
        isTermsPage={currentView === 'terms'}
        isNotFoundPage={currentView === '404'}
      />

      {/* Main Content */}
      <main className="flex-grow">
        {currentView === 'privacy' ? (
          <PrivacyPolicy
            onBackToHome={handleGoHome}
            onOpenConsultation={() => setIsConsultationOpen(true)}
            onOpenTerms={handleOpenTerms}
          />
        ) : currentView === 'terms' ? (
          <TermsAndConditions
            onBackToHome={handleGoHome}
            onOpenConsultation={() => setIsConsultationOpen(true)}
            onOpenPrivacy={handleOpenPrivacy}
          />
        ) : currentView === '404' ? (
          <NotFoundPage
            onBackToHome={handleGoHome}
            onOpenConsultation={handleOpenConsultationWithDomain}
            onNavigateSection={handleScrollToSection}
            onOpenPrivacy={handleOpenPrivacy}
            onOpenTerms={handleOpenTerms}
            attemptedPath={attemptedRoute}
          />
        ) : (
          <>
            {/* 1. Value-focused Hero with embedded Live Agent Simulator */}
            <Hero
              onOpenConsultation={() => {
                setSelectedPackageName('');
                setIsConsultationOpen(true);
              }}
              onExplorePipeline={() => handleScrollToSection('how-it-works')}
              onExploreWhyChoose={() => handleScrollToSection('why-choose')}
            />

            {/* 2. Why Choose GenNeo: 4 Crisp Premium Cards */}
            <WhyChoosePillarsSection
              onOpenConsultation={() => setIsConsultationOpen(true)}
              onExploreArchitecture={() => handleScrollToSection('how-it-works')}
            />

            {/* 3. How We Ingest & Deploy (3 Steps + Domain Audit Input) */}
            <ScrapingAndTrainingPipeline
              onOpenConsultation={handleOpenConsultationWithDomain}
            />

            {/* 4. Transparent Packages & Pricing */}
            <PackagesSection
              onSelectPackage={handleSelectPackage}
              onOpenConsultation={() => setIsConsultationOpen(true)}
            />

            {/* 5. Direct Founder & Engineering Contact Card */}
            <ContactSection
              onOpenConsultation={() => setIsConsultationOpen(true)}
            />
          </>
        )}
      </main>

      {/* Minimal Footer */}
      <Footer 
        onOpenPrivacy={handleOpenPrivacy} 
        onOpenTerms={handleOpenTerms} 
        onOpenCookieSettings={() => setIsCookieSettingsOpen(true)}
        onOpenNotFound={handleOpenNotFound}
        onOpenConsultation={() => setIsConsultationOpen(true)}
        onNavigateSection={handleScrollToSection}
      />

      {/* Floating Interactive AI Chat Widget */}
      <LiveAgentChatWidget
        onOpenConsultation={() => setIsConsultationOpen(true)}
      />

      {/* Cookie Consent Banner & Preferences Manager */}
      <CookieConsentBanner
        onOpenPrivacy={handleOpenPrivacy}
        onOpenTerms={handleOpenTerms}
        forceOpen={isCookieSettingsOpen}
        onCloseSettings={() => setIsCookieSettingsOpen(false)}
      />

      {/* Consultation / Scoping Modal */}
      <ConsultationModal
        isOpen={isConsultationOpen}
        onClose={() => {
          setIsConsultationOpen(false);
          setSelectedPackageName('');
        }}
        prefillUrl={prefillUrl}
        selectedPackageName={selectedPackageName}
      />
    </div>
  );
}
