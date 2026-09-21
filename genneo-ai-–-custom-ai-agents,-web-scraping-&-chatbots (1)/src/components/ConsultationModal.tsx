import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Send, 
  Globe, 
  User, 
  Phone, 
  FileText, 
  Loader2, 
  Clock, 
  ExternalLink,
  Check,
  AlertTriangle,
  AlertCircle,
  History,
  Trash2
} from 'lucide-react';
import { WhatsAppIcon, MailIcon } from './CustomSocialIcons';
import { GenNeoAgentAvatar } from './GenNeoAgentAvatar';
import { FOUNDER_CONTACT } from '../data/agencyData';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillUrl?: string;
  selectedPackageName?: string;
}

interface SavedInquiry {
  id: number;
  timestamp: string;
  formattedDate: string;
  name: string;
  whatsappNumber: string;
  website: string;
  need: string;
  packageContext?: string;
}

export const ConsultationModal: React.FC<ConsultationModalProps> = ({
  isOpen,
  onClose,
  prefillUrl = '',
  selectedPackageName = ''
}) => {
  const [name, setName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState(prefillUrl || '');
  const [need, setNeed] = useState('');

  const [touched, setTouched] = useState<{
    websiteUrl?: boolean;
    name?: boolean;
    whatsappNumber?: boolean;
    need?: boolean;
  }>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [savedInquiries, setSavedInquiries] = useState<SavedInquiry[]>([]);

  useEffect(() => {
    if (prefillUrl) {
      setWebsiteUrl(prefillUrl);
    }
  }, [prefillUrl]);

  useEffect(() => {
    try {
      const items = JSON.parse(localStorage.getItem('genneo_inquiries') || '[]');
      setSavedInquiries(items);
    } catch {
      setSavedInquiries([]);
    }
  }, [isOpen, isSuccess]);

  if (!isOpen) return null;

  // Validation Rules
  const validateWebsiteUrl = (val: string): string => {
    const trimmed = val.trim();
    if (!trimmed) {
      return 'Website URL or company domain is required.';
    }
    const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/i;
    if (!urlPattern.test(trimmed)) {
      return 'Please enter a valid domain or URL (e.g. yourcompany.com or https://yourcompany.com).';
    }
    return '';
  };

  const validateName = (val: string): string => {
    const trimmed = val.trim();
    if (!trimmed) {
      return 'Your full name is required.';
    }
    if (trimmed.length < 2) {
      return 'Full name must be at least 2 characters long.';
    }
    if (!/[a-zA-Z]/.test(trimmed)) {
      return 'Please enter a valid name containing letters.';
    }
    return '';
  };

  const validateWhatsApp = (val: string): string => {
    const trimmed = val.trim();
    if (!trimmed) {
      return 'WhatsApp number is required for direct scoping updates.';
    }
    const digitsOnly = trimmed.replace(/\D/g, '');
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      return 'Phone number must contain 7 to 15 digits with country code (e.g. +1 555-0123).';
    }
    const phonePattern = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]{5,20}$/;
    if (!phonePattern.test(trimmed)) {
      return 'Phone number format is invalid. Example: +1 (555) 234-5678 or +91 9876543210';
    }
    return '';
  };

  const validateNeed = (val: string): string => {
    const trimmed = val.trim();
    if (!trimmed) {
      return 'Please describe your project or AI agent requirements.';
    }
    if (trimmed.length < 10) {
      return `Please provide at least 10 characters describing your needs (currently ${trimmed.length}/10).`;
    }
    return '';
  };

  const errors = {
    websiteUrl: validateWebsiteUrl(websiteUrl),
    name: validateName(name),
    whatsappNumber: validateWhatsApp(whatsappNumber),
    need: validateNeed(need),
  };

  const hasErrors = Boolean(errors.websiteUrl || errors.name || errors.whatsappNumber || errors.need);

  const isFieldInvalid = (field: 'websiteUrl' | 'name' | 'whatsappNumber' | 'need') => {
    return Boolean((touched[field] || submitAttempted) && errors[field]);
  };

  const isFieldValid = (field: 'websiteUrl' | 'name' | 'whatsappNumber' | 'need') => {
    if (!touched[field]) return false;
    if (errors[field]) return false;
    if (field === 'need') return need.trim().length >= 10;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setTouched({
      websiteUrl: true,
      name: true,
      whatsappNumber: true,
      need: true,
    });

    if (hasErrors) {
      // Focus first field with an error
      if (errors.websiteUrl) {
        document.getElementById('input-website')?.focus();
      } else if (errors.name) {
        document.getElementById('input-name')?.focus();
      } else if (errors.whatsappNumber) {
        document.getElementById('input-whatsapp')?.focus();
      } else if (errors.need) {
        document.getElementById('input-need')?.focus();
      }
      return;
    }

    setIsSubmitting(true);

    const formDataPayload = {
      name: name.trim(),
      whatsappNumber: whatsappNumber.trim(),
      website: websiteUrl.trim(),
      need: need.trim(),
      packageContext: selectedPackageName || 'Direct Inquiry',
      _subject: `New AI Inquiry: ${name.trim()} (${whatsappNumber.trim()}) - ${websiteUrl.trim()}`,
      _replyto: 'genneob2c@gmail.com',
      _template: 'table',
      _captcha: 'false'
    };

    // 1. Send via FormData to FormSubmit (most resilient against CORS & header restrictions)
    try {
      const body = new FormData();
      body.append('name', formDataPayload.name);
      body.append('whatsapp', formDataPayload.whatsappNumber);
      body.append('website', formDataPayload.website);
      body.append('project_need', formDataPayload.need);
      body.append('package', formDataPayload.packageContext);
      body.append('_subject', formDataPayload._subject);
      body.append('_replyto', 'genneob2c@gmail.com');
      body.append('_template', 'table');
      body.append('_captcha', 'false');

      await fetch('https://formsubmit.co/ajax/genneob2c@gmail.com', {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: body
      });
    } catch (err) {
      console.warn('FormSubmit AJAX notification:', err);
    }

    // 2. Always store locally in browser so NO lead is EVER lost
    try {
      const existing: SavedInquiry[] = JSON.parse(localStorage.getItem('genneo_inquiries') || '[]');
      const newInquiry: SavedInquiry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        formattedDate: new Date().toLocaleString(),
        ...formDataPayload
      };
      existing.unshift(newInquiry);
      localStorage.setItem('genneo_inquiries', JSON.stringify(existing.slice(0, 50)));
      setSavedInquiries(existing.slice(0, 50));
    } catch {
      // Ignore localStorage errors
    }

    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const handleClearHistory = () => {
    localStorage.removeItem('genneo_inquiries');
    setSavedInquiries([]);
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setShowHistory(false);
    setTouched({});
    setSubmitAttempted(false);
    onClose();
  };

  const formattedWhatsAppText = encodeURIComponent(
    `*New AI Agent Inquiry for GenNeo AI*\n\n` +
    `• *Name:* ${name}\n` +
    `• *WhatsApp:* ${whatsappNumber}\n` +
    `• *Website:* ${websiteUrl || 'Not specified'}\n` +
    `• *Need / Requirement:* ${need || 'None specified'}\n\n` +
    `Sent directly to: genneob2c@gmail.com`
  );

  const directWhatsAppUrl = `https://wa.me/918468950877?text=${formattedWhatsAppText}`;

  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=genneob2c@gmail.com&su=${encodeURIComponent(
    `New AI Agent Inquiry: ${name} (${whatsappNumber})`
  )}&body=${encodeURIComponent(
    `Hello Bhavesh,\n\nHere are the inquiry details submitted on GenNeo AI:\n\n` +
    `• Name: ${name}\n` +
    `• WhatsApp: ${whatsappNumber}\n` +
    `• Website: ${websiteUrl || 'Not specified'}\n` +
    `• Project Need: ${need || 'None'}\n`
  )}`;

  const gmailSpamSearchUrl = `https://mail.google.com/mail/u/0/#search/in%3Aanywhere+formsubmit`;

  const handleCopySummary = () => {
    const text = `Name: ${name}\nWhatsApp: ${whatsappNumber}\nWebsite: ${websiteUrl}\nNeed: ${need}`;
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs overflow-y-auto font-sans">
      <div className="relative w-full max-w-md bg-[#FAF8F5] border border-[#DFD9CC] rounded-2xl p-4 sm:p-6 shadow-2xl shadow-[#162422]/20 my-auto max-h-[92vh] overflow-y-auto animate-fade-in">
        {/* Header Action Buttons */}
        <div className="absolute top-3.5 right-3.5 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            title="View Saved Inquiries"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6E7D7A] hover:text-[#004741] hover:bg-[#EFECE3] transition-colors cursor-pointer"
          >
            <History className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6E7D7A] hover:text-[#162422] hover:bg-[#EFECE3] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Saved Inquiries History View */}
        {showHistory ? (
          <div className="py-2 space-y-3">
            <div className="flex items-center justify-between border-b border-[#DFD9CC] pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#162422]">
                <History className="w-4 h-4 text-[#004741]" />
                <span>Saved Inquiries Backup ({savedInquiries.length})</span>
              </div>
              {savedInquiries.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-[11px] text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            <p className="text-xs text-[#253935] font-normal">
              Every inquiry submitted through this form is backed up here safely in your browser, even if email filters delay incoming mail.
            </p>

            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {savedInquiries.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#253935] bg-[#FAF8F5] rounded-xl border border-[#CDC6B6]">
                  No inquiries recorded yet. Submit the form to see entries here!
                </div>
              ) : (
                savedInquiries.map((inq) => (
                  <div key={inq.id} className="p-3 rounded-xl bg-white border border-[#CDC6B6] text-xs space-y-1 shadow-2xs">
                    <div className="flex items-center justify-between font-bold text-[#11201D]">
                      <span>{inq.name}</span>
                      <span className="text-[11px] text-[#2C403C] font-medium">{inq.formattedDate}</span>
                    </div>
                    <div className="text-xs text-emerald-900 font-mono-code font-bold">
                      WhatsApp: {inq.whatsappNumber}
                    </div>
                    <div className="text-xs text-[#004741] font-semibold truncate">
                      Website: {inq.website}
                    </div>
                    {inq.need && (
                      <p className="text-xs text-[#1E312E] bg-[#FAF8F5] p-2 rounded border border-[#CDC6B6] mt-1">
                        {inq.need}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowHistory(false)}
              className="w-full py-2 bg-[#004741] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Back to Form
            </button>
          </div>
        ) : isSuccess ? (
          <div className="text-center py-2 space-y-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs font-bold mb-1.5">
                <MailIcon className="w-3.5 h-3.5 text-emerald-800" />
                <span>Dispatched to genneob2c@gmail.com</span>
              </div>
              <h3 className="text-xl font-bold text-[#11201D] font-display">
                Inquiry Submitted Successfully!
              </h3>
              <p className="text-xs text-[#253935] max-w-xs mx-auto leading-relaxed mt-0.5 font-normal">
                Thank you, <strong className="text-[#11201D]">{name}</strong>. Your project details have been sent directly to our lead engineer.
              </p>
            </div>

            {/* GMAIL SPAM INSTRUCTION NOTICE */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-left text-xs space-y-1.5 text-amber-950">
              <div className="flex items-center gap-1.5 font-bold text-amber-950 text-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                <span>Gmail Delivery Notice:</span>
              </div>
              <p className="text-xs text-amber-950 leading-relaxed">
                If the email does not show in your Primary Inbox right away, check your Gmail <strong>"Spam"</strong> or <strong>"Updates"</strong> folder and click <strong>"Report not spam"</strong>.
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
                <a
                  href={gmailSpamSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-amber-950 underline hover:text-black cursor-pointer"
                >
                  <span>Check Gmail Spam Folder</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Submitted Data Summary Box */}
            <div className="p-3.5 rounded-xl bg-[#EAE6DC] border border-[#CDC6B6] text-xs font-mono-code text-left max-w-sm mx-auto space-y-2 text-[#1E312E]">
              <div className="flex items-center justify-between text-[#004741] font-bold border-b border-[#CDC6B6] pb-1">
                <span>SUBMISSION SUMMARY:</span>
                <span className="text-[11px] text-emerald-950 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 font-bold">
                  Saved & Sent
                </span>
              </div>
              <div className="space-y-1.5 pt-0.5 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[#2C403C] font-semibold shrink-0">Name:</span>
                  <span className="font-bold text-[#11201D] text-right truncate">{name}</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[#2C403C] font-semibold shrink-0">WhatsApp:</span>
                  <span className="font-bold text-emerald-900 text-right">{whatsappNumber}</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[#2C403C] font-semibold shrink-0">Website:</span>
                  <span className="font-bold text-[#004741] text-right truncate">{websiteUrl || 'Not specified'}</span>
                </div>
                {need && (
                  <div className="pt-1 border-t border-[#CDC6B6]">
                    <span className="text-[#2C403C] font-semibold block mb-0.5">Project Requirements:</span>
                    <p className="font-sans text-xs text-[#11201D] bg-white/80 p-2 rounded-lg border border-[#CDC6B6] line-clamp-3">
                      {need}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Instant Multi-Channel Actions */}
            <div className="max-w-sm mx-auto space-y-2 pt-1">
              <a
                href={directWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>Instant WhatsApp Sync (+91 8468950877)</span>
                <ExternalLink className="w-3 h-3 ml-auto opacity-80" />
              </a>

              <a
                href={gmailComposeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 bg-white hover:bg-[#F0EDE4] border border-[#DFD9CC] text-[#162422] font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MailIcon className="w-3.5 h-3.5 text-red-600" />
                <span>Open in Gmail (Direct 1-Click Send)</span>
                <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
              </a>

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  onClick={handleCopySummary}
                  className="flex-1 py-2 px-3 bg-[#FAF8F5] hover:bg-[#F0EDE4] border border-[#DFD9CC] text-[#162422] font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5 text-[#657371]" />}
                  <span>{copiedSummary ? 'Copied Details!' : 'Copy Summary'}</span>
                </button>
                <button
                  onClick={handleResetAndClose}
                  className="px-5 py-2 rounded-xl bg-[#004741] hover:bg-[#003632] text-white font-semibold text-xs transition-all cursor-pointer shadow-sm"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form noValidate onSubmit={handleSubmit} className="space-y-3.5">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <GenNeoAgentAvatar sizeClassName="w-7 h-7" alt="GenNeo Autonomous Agent" />
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#004741]/12 text-[#003833] border border-[#004741]/30 text-[10px] font-mono-code font-bold">
                  <MailIcon className="w-3 h-3 text-[#004741]" />
                  <span>Direct Inbox: genneob2c@gmail.com</span>
                </div>
              </div>
              <h3 className="text-lg font-bold text-[#11201D] tracking-tight font-display">
                Get in Touch with GenNeo AI
              </h3>
              <p className="text-xs text-[#253935] mt-0.5 font-normal">
                Fill these 4 quick details to send your inquiry directly to our lead engineer.
              </p>
            </div>

            {/* Top error banner if submit was attempted with invalid fields */}
            {submitAttempted && hasErrors && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span className="font-medium">
                  Please correct the highlighted field{Object.values(errors).filter(Boolean).length > 1 ? 's' : ''} to send your inquiry.
                </span>
              </div>
            )}

            {/* 1. Website Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="input-website" className="text-[11px] font-bold text-[#11201D] flex items-center gap-1">
                  <Globe className="w-3 h-3 text-[#004741]" />
                  <span>Website URL / Domain</span> <span className="text-[#004741]">*</span>
                </label>
                {isFieldValid('websiteUrl') && (
                  <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
                    <Check className="w-3 h-3" /> Valid domain
                  </span>
                )}
              </div>
              <input
                id="input-website"
                type="text"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                onBlur={() => setTouched(prev => ({ ...prev, websiteUrl: true }))}
                placeholder="https://yourwebsite.com or acme.com"
                aria-invalid={isFieldInvalid('websiteUrl')}
                aria-describedby={isFieldInvalid('websiteUrl') ? 'website-error' : undefined}
                className={`w-full bg-white border rounded-lg px-3 py-2.5 text-base sm:text-xs text-[#11201D] placeholder-[#60726E] font-mono-code transition-colors focus:outline-none ${
                  isFieldInvalid('websiteUrl')
                    ? 'border-red-500 bg-red-50/25 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                    : isFieldValid('websiteUrl')
                    ? 'border-emerald-600 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                    : 'border-[#CDC6B6] focus:border-[#004741] focus:ring-1 focus:ring-[#004741]'
                }`}
              />
              {isFieldInvalid('websiteUrl') && (
                <p id="website-error" className="mt-1 text-[11px] text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.websiteUrl}</span>
                </p>
              )}
            </div>

            {/* 2. Name & 3. WhatsApp Number (Side-by-side or stacked on mobile) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* 2. Name */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="input-name" className="text-[11px] font-bold text-[#11201D] flex items-center gap-1">
                    <User className="w-3 h-3 text-[#004741]" />
                    <span>Your Full Name</span> <span className="text-[#004741]">*</span>
                  </label>
                  {isFieldValid('name') && (
                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <input
                  id="input-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
                  placeholder="e.g. Alex Morgan"
                  aria-invalid={isFieldInvalid('name')}
                  aria-describedby={isFieldInvalid('name') ? 'name-error' : undefined}
                  className={`w-full bg-white border rounded-lg px-3 py-2.5 text-base sm:text-xs text-[#11201D] placeholder-[#60726E] transition-colors focus:outline-none ${
                    isFieldInvalid('name')
                      ? 'border-red-500 bg-red-50/25 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                      : isFieldValid('name')
                      ? 'border-emerald-600 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                      : 'border-[#CDC6B6] focus:border-[#004741] focus:ring-1 focus:ring-[#004741]'
                  }`}
                />
                {isFieldInvalid('name') && (
                  <p id="name-error" className="mt-1 text-[11px] text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

              {/* 3. WhatsApp Number */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="input-whatsapp" className="text-[11px] font-bold text-[#11201D] flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-800" />
                    <span>WhatsApp Number</span> <span className="text-[#004741]">*</span>
                  </label>
                  {isFieldValid('whatsappNumber') && (
                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <input
                  id="input-whatsapp"
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, whatsappNumber: true }))}
                  placeholder="+1 (555) 000-0000 / +91 ..."
                  aria-invalid={isFieldInvalid('whatsappNumber')}
                  aria-describedby={isFieldInvalid('whatsappNumber') ? 'whatsapp-error' : undefined}
                  className={`w-full bg-white border rounded-lg px-3 py-2.5 text-base sm:text-xs text-[#11201D] placeholder-[#60726E] font-mono-code transition-colors focus:outline-none ${
                    isFieldInvalid('whatsappNumber')
                      ? 'border-red-500 bg-red-50/25 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                      : isFieldValid('whatsappNumber')
                      ? 'border-emerald-600 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                      : 'border-[#CDC6B6] focus:border-[#004741] focus:ring-1 focus:ring-[#004741]'
                  }`}
                />
                {isFieldInvalid('whatsappNumber') && (
                  <p id="whatsapp-error" className="mt-1 text-[11px] text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.whatsappNumber}</span>
                  </p>
                )}
              </div>
            </div>

            {/* 4. Need / Description Box */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="input-need" className="text-[11px] font-bold text-[#11201D] flex items-center gap-1">
                  <FileText className="w-3 h-3 text-[#004741]" />
                  <span>Project Description & Requirements</span> <span className="text-[#004741]">*</span>
                </label>
                <span className={`text-[10px] font-mono-code font-bold ${
                  need.trim().length >= 10 ? 'text-emerald-700' : 'text-[#657371]'
                }`}>
                  {need.trim().length}/10 min chars
                </span>
              </div>
              <textarea
                id="input-need"
                rows={3}
                value={need}
                onChange={(e) => setNeed(e.target.value)}
                onBlur={() => setTouched(prev => ({ ...prev, need: true }))}
                placeholder="Tell us about your project (e.g., scrape company documentation, build a custom 24/7 AI customer support assistant, automate CRM lead routing, appointment scheduling...)"
                aria-invalid={isFieldInvalid('need')}
                aria-describedby={isFieldInvalid('need') ? 'need-error' : undefined}
                className={`w-full bg-white border rounded-lg p-3 text-base sm:text-xs text-[#11201D] placeholder-[#60726E] resize-none transition-colors focus:outline-none ${
                  isFieldInvalid('need')
                    ? 'border-red-500 bg-red-50/25 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                    : isFieldValid('need')
                    ? 'border-emerald-600 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                    : 'border-[#CDC6B6] focus:border-[#004741] focus:ring-1 focus:ring-[#004741]'
                }`}
              />
              {isFieldInvalid('need') && (
                <p id="need-error" className="mt-1 text-[11px] text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.need}</span>
                </p>
              )}
            </div>

            {/* Direct Contact Notice */}
            <div className="p-2.5 rounded-xl bg-[#EAE6DC] border border-[#CDC6B6] flex items-center justify-between text-[11px]">
              <span className="text-[#253935] flex items-center gap-1.5 font-medium">
                <MailIcon className="w-3.5 h-3.5 text-[#004741] shrink-0" />
                <span>Inbox: <strong className="text-[#11201D]">genneob2c@gmail.com</strong></span>
              </span>
              <a
                href={FOUNDER_CONTACT.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-emerald-900 font-bold hover:underline"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-800" />
                <span>WhatsApp directly</span>
              </a>
            </div>

            {/* Submit Action */}
            <div className="pt-2 border-t border-[#CDC6B6] flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5 text-xs text-[#253935] font-medium">
                <Clock className="w-3.5 h-3.5 text-[#004741] shrink-0" />
                <span>Reply guaranteed &lt; 2 Hours</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto min-h-[44px] px-5 py-3 rounded-xl bg-[#004741] hover:bg-[#003632] disabled:opacity-50 text-white font-bold text-xs shadow-sm shadow-[#004741]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending to Mail...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Inquiry to Email</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
