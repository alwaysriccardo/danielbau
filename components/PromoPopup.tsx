import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface PromoPopupProps {
  onClose: () => void;
}

const PromoPopup: React.FC<PromoPopupProps> = ({ onClose }) => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    projectType: '',
    description: ''
  });

  // Slide in animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Create mailto link with form data
    const subject = encodeURIComponent(t.promo.subject);
    const body = encodeURIComponent(
      `${t.promo.formName}: ${formData.name}\n` +
      `${t.promo.formEmail}: ${formData.email}\n` +
      `${t.promo.formPhone}: ${formData.phone}\n` +
      `${t.promo.formProjectType}: ${formData.projectType || t.promo.formNotSpecified}\n\n` +
      `${t.promo.formDescription}:\n${formData.description || t.promo.formNotSpecified}`
    );
    
    window.location.href = `mailto:danielbau@mail.ch?subject=${subject}&body=${body}`;

    setTimeout(() => {
      setIsSubmitting(false);
      setFormData({ name: '', email: '', phone: '', projectType: '', description: '' });
      onClose();
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-[100] bg-black/40 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Slide-in Panel */}
      <div 
        className={`fixed right-0 top-0 h-full z-[101] w-full sm:w-[380px] transition-transform duration-500 ease-out ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-full bg-gradient-to-br from-[#E3E1DC] via-[#E3E1DC] to-[#d4d1ca] border-l-2 border-[#121212] shadow-[-4px_0_24px_rgba(0,0,0,0.15)] flex flex-col overflow-y-auto">
          {/* Header with animated badge */}
          <div className="relative p-5 pb-4 border-b border-[#121212]/20 bg-gradient-to-r from-[#121212]/5 to-transparent">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[#121212]/60 hover:text-[#121212] transition-colors z-10"
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            {/* Animated discount badge */}
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <div className="absolute inset-0 bg-[#121212] rounded-full blur-md opacity-30 animate-pulse"></div>
                <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#121212] to-[#2a2a2a] rounded-full border-2 border-[#121212] shadow-lg">
                  <span className="text-xl font-bold text-[#E3E1DC]">10%</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <svg className="w-4 h-4 text-[#121212]/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                  <span className="text-xs font-bold text-[#121212]/70 uppercase tracking-wider">
                    {t.promo.off}
                  </span>
                </div>
                <h2 className="text-base font-semibold text-[#121212] leading-tight">
                  {t.promo.title}
                </h2>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-[#121212]/60">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{t.promo.subtitle}</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 p-5 space-y-3">
            {/* Two-column: Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t.promo.formName}
                  required
                  className="w-full px-3 py-2 text-sm border border-[#121212]/30 rounded bg-white/60 focus:outline-none focus:border-[#121212] focus:bg-white focus:ring-2 focus:ring-[#121212]/20 transition-all text-[#121212] placeholder:text-[#121212]/50"
                />
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t.promo.formEmail}
                  required
                  className="w-full px-3 py-2 text-sm border border-[#121212]/30 rounded bg-white/60 focus:outline-none focus:border-[#121212] focus:bg-white focus:ring-2 focus:ring-[#121212]/20 transition-all text-[#121212] placeholder:text-[#121212]/50"
                />
              </div>
            </div>

            {/* Two-column: Phone + Project Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t.promo.formPhone}
                  required
                  className="w-full px-3 py-2 text-sm border border-[#121212]/30 rounded bg-white/60 focus:outline-none focus:border-[#121212] focus:bg-white focus:ring-2 focus:ring-[#121212]/20 transition-all text-[#121212] placeholder:text-[#121212]/50"
                />
              </div>
              <div>
                <select
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-[#121212]/30 rounded bg-white/60 focus:outline-none focus:border-[#121212] focus:bg-white focus:ring-2 focus:ring-[#121212]/20 transition-all text-[#121212]"
                >
                  <option value="">{t.promo.formProjectType}</option>
                  <option value={t.promo.projectTypes.kitchen}>{t.promo.projectTypes.kitchen}</option>
                  <option value={t.promo.projectTypes.bathroom}>{t.promo.projectTypes.bathroom}</option>
                  <option value={t.promo.projectTypes.fullRenovation}>{t.promo.projectTypes.fullRenovation}</option>
                  <option value={t.promo.projectTypes.other}>{t.promo.projectTypes.other}</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={t.promo.formDescription}
                rows={2}
                className="w-full px-3 py-2 text-sm border border-[#121212]/30 rounded bg-white/60 focus:outline-none focus:border-[#121212] focus:bg-white focus:ring-2 focus:ring-[#121212]/20 transition-all text-[#121212] placeholder:text-[#121212]/50 resize-none"
              />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 bg-[#121212] text-[#E3E1DC] font-semibold text-sm rounded hover:bg-[#121212]/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{t.promo.submitting}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{t.promo.cta}</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={onClose}
                className="w-full px-4 py-2 text-[#121212]/60 hover:text-[#121212] transition-colors text-xs text-center"
              >
                {t.promo.noThanks}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default PromoPopup;
