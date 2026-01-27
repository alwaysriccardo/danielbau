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

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      // Silently fail if audio context is not available
    }
  };

  // Animate in with sound
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      playNotificationSound();
    }, 100);
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
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/50 transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className={`bg-[#E3E1DC] border-2 border-[#121212] rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.3)] max-w-sm md:max-w-md w-[85%] md:w-[90%] max-h-[85vh] md:max-h-[90vh] overflow-y-auto transition-all duration-500 ease-out ${
          isVisible 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-90 opacity-0 translate-y-8'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 md:p-5 pb-3 md:pb-4 border-b border-[#121212]/20">
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <div className="flex items-center gap-1.5 md:gap-2">
              <span className="text-xl md:text-2xl font-bold text-[#121212]">10%</span>
              <span className="text-[10px] md:text-xs font-semibold text-[#121212]/70 uppercase tracking-wider">
                {t.promo.off}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-[#121212]/60 hover:text-[#121212] transition-colors p-1"
              aria-label="Close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <h2 className="text-base md:text-lg font-semibold text-[#121212] mb-0.5 md:mb-1">
            {t.promo.title}
          </h2>
          <p className="text-xs md:text-sm text-[#121212]/70">
            {t.promo.subtitle}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 md:p-5 space-y-3 md:space-y-4">
          <div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t.promo.formName}
              required
              className="w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base border border-[#121212]/30 rounded bg-white/50 focus:outline-none focus:border-[#121212] focus:bg-white transition-colors text-[#121212] placeholder:text-[#121212]/50"
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
              className="w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base border border-[#121212]/30 rounded bg-white/50 focus:outline-none focus:border-[#121212] focus:bg-white transition-colors text-[#121212] placeholder:text-[#121212]/50"
            />
          </div>

          <div>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder={t.promo.formPhone}
              required
              className="w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base border border-[#121212]/30 rounded bg-white/50 focus:outline-none focus:border-[#121212] focus:bg-white transition-colors text-[#121212] placeholder:text-[#121212]/50"
            />
          </div>

          <div>
            <select
              name="projectType"
              value={formData.projectType}
              onChange={handleChange}
              className="w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base border border-[#121212]/30 rounded bg-white/50 focus:outline-none focus:border-[#121212] focus:bg-white transition-colors text-[#121212]"
            >
              <option value="">{t.promo.formProjectType}</option>
              <option value={t.promo.projectTypes.kitchen}>{t.promo.projectTypes.kitchen}</option>
              <option value={t.promo.projectTypes.bathroom}>{t.promo.projectTypes.bathroom}</option>
              <option value={t.promo.projectTypes.fullRenovation}>{t.promo.projectTypes.fullRenovation}</option>
              <option value={t.promo.projectTypes.other}>{t.promo.projectTypes.other}</option>
            </select>
          </div>

          <div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={t.promo.formDescription}
              rows={2}
              className="w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base border border-[#121212]/30 rounded bg-white/50 focus:outline-none focus:border-[#121212] focus:bg-white transition-colors text-[#121212] placeholder:text-[#121212]/50 resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5 md:gap-2 pt-1 md:pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base bg-[#121212] text-[#E3E1DC] font-semibold rounded hover:bg-[#121212]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t.promo.submitting : t.promo.cta}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="w-full px-4 md:px-6 py-2 md:py-2.5 text-xs md:text-sm text-[#121212]/70 hover:text-[#121212] transition-colors"
            >
              {t.promo.noThanks}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromoPopup;
