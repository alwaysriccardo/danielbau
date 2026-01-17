import React, { useLayoutEffect, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { IMAGES } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

const Footer: React.FC = () => {
  const footerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLAnchorElement>(null);
  const phoneRef = useRef<HTMLAnchorElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const readyRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Create mailto link with form data
    const subject = encodeURIComponent(`Contact from ${formData.name}`);
    const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`);
    window.location.href = `mailto:zitat@danielbau.de?subject=${subject}&body=${body}`;
    
    setTimeout(() => {
      setIsSubmitting(false);
      setFormData({ name: '', email: '', message: '' });
    }, 1000);
  };

  // Fix scroll-up issue on mobile: allow page scroll when footer is at top
  useEffect(() => {
    if (!footerRef.current) return;
    
    const footer = footerRef.current;
    const isMobile = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (!isMobile) {
      // Desktop: only handle wheel events
      const handleWheel = (e: WheelEvent) => {
        if (footer.scrollTop <= 5 && e.deltaY < 0) {
          e.stopPropagation();
          window.scrollBy({ top: e.deltaY, behavior: 'auto' });
        }
      };
      footer.addEventListener('wheel', handleWheel, { passive: false, capture: true });
      return () => footer.removeEventListener('wheel', handleWheel, true);
    }
    
    // Mobile: minimal interference - let native scrolling work
    // Only prevent default if we're definitely at the top AND scrolling up
    let touchStartY = 0;
    let touchStartScrollTop = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      touchStartScrollTop = footer.scrollTop;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      // Only interfere if we're at the very top (0 scroll) and user is swiping up
      if (touchStartScrollTop === 0 && touchStartY > 0) {
        const touchY = e.touches[0].clientY;
        const deltaY = touchStartY - touchY;
        
        // User swiping up from top - allow page scroll naturally
        if (deltaY > 5) {
          // Don't prevent default - let the browser handle it naturally
          // The footer's overscroll-behavior: auto will allow page scroll
        }
      }
    };
    
    footer.addEventListener('touchstart', handleTouchStart, { passive: true });
    footer.addEventListener('touchmove', handleTouchMove, { passive: true });
    
    return () => {
      footer.removeEventListener('touchstart', handleTouchStart);
      footer.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Animate ready text
      gsap.from(readyRef.current, {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      });

      // Animate quote link with scale and glow effect
      gsap.from(quoteRef.current, {
        y: 50,
        opacity: 0,
        scale: 0.9,
        duration: 1.2,
        ease: 'power4.out',
        delay: 0.2,
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      });

      // Continuous glow animation for quote
      if (quoteRef.current) {
        gsap.to(quoteRef.current, {
          textShadow: '0 0 20px rgba(255,255,255,0.3), 0 0 40px rgba(255,255,255,0.2)',
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      }

      // Animate phone and form
      gsap.from([phoneRef.current, formRef.current], {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.2,
        delay: 0.4,
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      });

      // Hover animations
      if (quoteRef.current) {
        quoteRef.current.addEventListener('mouseenter', () => {
          gsap.to(quoteRef.current, {
            scale: 1.05,
            textShadow: '0 0 30px rgba(255,255,255,0.5), 0 0 60px rgba(255,255,255,0.3)',
            duration: 0.3,
            ease: 'power2.out'
          });
        });
        quoteRef.current.addEventListener('mouseleave', () => {
          gsap.to(quoteRef.current, {
            scale: 1,
            textShadow: '0 0 20px rgba(255,255,255,0.3), 0 0 40px rgba(255,255,255,0.2)',
            duration: 0.3,
            ease: 'power2.out'
          });
        });
      }
    }, footerRef);

    return () => ctx.revert();
  }, [t]);

  return (
    <footer 
      ref={footerRef}
      className="fixed bottom-0 left-0 w-full h-screen z-[1] bg-[#111] text-white flex flex-col items-center overflow-y-auto pt-safe pb-safe"
      id="contact"
      style={{ 
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
        minHeight: '100dvh',
        WebkitOverflowScrolling: 'touch',
        overscrollBehaviorY: 'auto', // Allow scroll chaining so users can scroll back up
        overscrollBehavior: 'auto',
        scrollBehavior: 'auto',
        touchAction: 'pan-y pinch-zoom' // Allow vertical scrolling and pinch zoom
      }}
    >
      <div 
        ref={contentRef} 
        className="relative z-10 text-center w-full max-w-6xl px-4 md:px-6 py-8 md:pt-12 md:pb-12 flex flex-col justify-center min-h-screen md:min-h-0"
        style={{ 
          minHeight: 'calc(100vh - 2rem)' // Ensure footer content fills viewport but allows scroll
        }}
      >
        <div 
          ref={readyRef}
          className="text-xs uppercase tracking-[0.3em] mb-3 md:mb-6 text-gray-400"
        >
          {t.footer.ready}
        </div>
        
        {/* Desktop: ANGEBOT centered above map/form row */}
        {/* Mobile: ANGEBOT centered above map/form */}
        <div className="mb-4 md:mb-8">
          <a 
            ref={quoteRef}
            href="mailto:zitat@danielbau.de" 
            className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-none hover:text-white transition-all duration-300 block cursor-pointer relative z-50"
            style={{ 
              pointerEvents: 'auto',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent'
            }}
            onClick={(e) => {
              e.preventDefault();
              window.location.href = 'mailto:zitat@danielbau.de';
            }}
          >
            {t.footer.offer}
          </a>

          {/* Phone Number */}
          <div ref={phoneRef} className="mt-4 md:mt-6">
            <a 
              href="tel:+41762313831" 
              className="text-base md:text-xl lg:text-2xl font-light tracking-wide text-white hover:text-blue-400 transition-all duration-300 flex items-center justify-center gap-3 group"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>+41 76 231 38 31</span>
            </a>
          </div>
        </div>

        {/* Desktop Layout: Map Left, Form Right (below centered ANGEBOT) */}
        {/* Mobile Layout: Map Left, Form Right */}
        <div className="flex flex-row gap-4 md:gap-8 items-start justify-center max-w-full md:max-w-6xl mx-auto mb-6 md:mb-8 w-full px-2 md:px-0">
          {/* Map - Left Side (Mobile and Desktop) */}
          <div className="w-[40%] md:w-[300px] flex-shrink-0">
            <div className="w-full h-[180px] md:h-[300px] rounded-lg overflow-hidden border border-white/20 shadow-lg pointer-events-auto touch-none">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2708.5!2d7.52065!3d47.2794!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDfCsDE2JzQ1LjgiTiA3wrAzMScxNC4zIkU!5e0!3m2!1sen!2sch!4v1234567890&q=Rheistrasse+3,+4410+Liestal+Switzerland|Fluhrweg+16,+3250+Lyss+Switzerland"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="DANIELBAU Offices Map"
              />
            </div>
            <div className="mt-2 md:mt-3 text-[10px] md:text-xs text-white/70 space-y-0.5 md:space-y-1">
              <p><strong>Main Office:</strong> 4410 Liestal / Rheistrasse 3</p>
              <p><strong>Second Office:</strong> 3250 Lyss / Fluhrweg 16</p>
            </div>
          </div>

          {/* Contact Form - Right Side (Mobile and Desktop) - Bigger on Mobile */}
          <form 
            ref={formRef}
            onSubmit={handleSubmit}
            className="w-[60%] md:w-[320px] flex-shrink-0 space-y-4 md:space-y-4"
            style={{ touchAction: 'manipulation' }}
          >
            <input
              type="text"
              placeholder={t.footer.namePlaceholder || "Name"}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 md:px-4 md:py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-colors text-base md:text-base"
              style={{ fontSize: '16px' }}
              required
            />
            <input
              type="email"
              placeholder={t.footer.emailPlaceholder || "Email"}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 md:px-4 md:py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-colors text-base md:text-base"
              style={{ fontSize: '16px' }}
              required
            />
            <textarea
              placeholder={t.footer.messagePlaceholder || "Message"}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 md:px-4 md:py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-colors resize-none text-base md:text-base"
              style={{ fontSize: '16px', minHeight: '100px' }}
              required
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 md:px-6 md:py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded text-white uppercase tracking-widest text-sm md:text-sm transition-all duration-300 disabled:opacity-50 font-medium"
              style={{ touchAction: 'manipulation' }}
            >
              {isSubmitting ? (t.footer.sending || 'Sending...') : (t.footer.send || 'Send')}
            </button>
          </form>
        </div>

        <div className="mt-6 md:mt-12 text-[10px] text-gray-700">
          {t.footer.copyright}
        </div>

        {/* Colossians 3:23 - Almost invisible but visible */}
        <div className="mt-4 md:mt-8 text-[8px] text-gray-800/30 font-light italic">
          Colossians 3:23
        </div>
      </div>
      
      <img 
        src={IMAGES.FOOTER_BG} 
        className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none"
        alt="Footer Background"
      />
    </footer>
  );
};

export default Footer;
