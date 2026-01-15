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
  const mapIframeRef = useRef<HTMLIFrameElement>(null);
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

  // Prevent map iframe from interfering with scroll on mobile
  useEffect(() => {
    const mapContainer = footerRef.current?.querySelector('.map-container');
    if (!mapContainer || !mapIframeRef.current) return;

    let scrollTimeout: NodeJS.Timeout;
    let isScrolling = false;

    const handleScroll = () => {
      if (!isScrolling && mapIframeRef.current) {
        isScrolling = true;
        mapIframeRef.current.style.pointerEvents = 'none';
      }
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
        if (mapIframeRef.current) {
          mapIframeRef.current.style.pointerEvents = 'auto';
        }
      }, 150);
    };

    // Listen for scroll events
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchmove', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchmove', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <footer 
      ref={footerRef}
      className="fixed bottom-0 left-0 w-full h-screen z-[100] bg-[#111] text-white flex flex-col justify-start md:justify-center items-center overflow-y-auto"
      id="contact"
      style={{ isolation: 'isolate' }}
    >
      <div ref={contentRef} className="relative z-10 text-center w-full max-w-5xl px-6 pt-16 pb-8 md:py-12 md:pt-12">
        <div 
          ref={readyRef}
          className="text-xs uppercase tracking-[0.3em] mb-4 md:mb-6 text-gray-400"
        >
          {t.footer.ready}
        </div>
        
        {/* QUOTE Button - Most Prominent */}
        <a 
          ref={quoteRef}
          href="mailto:zitat@danielbau.de" 
          className="font-display text-5xl md:text-7xl lg:text-8xl leading-none hover:text-white transition-all duration-300 block cursor-pointer mb-6 md:mb-8 relative z-20 py-4 md:py-0"
          style={{ pointerEvents: 'auto', minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {t.footer.offer}
        </a>

        {/* Phone Number */}
        <div ref={phoneRef} className="mb-6 md:mb-8">
          <a 
            href="tel:+41762313831" 
            className="text-lg md:text-xl lg:text-2xl font-light tracking-wide text-white hover:text-blue-400 transition-all duration-300 flex items-center justify-center gap-3 group"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>+41 76 231 38 31</span>
          </a>
        </div>

        {/* Contact Form and Map Side by Side */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start justify-center max-w-5xl mx-auto mb-6 md:mb-8">
          {/* Contact Form */}
          <form 
            ref={formRef}
            onSubmit={handleSubmit}
            className="flex-1 max-w-md space-y-4"
          >
            <input
              type="text"
              placeholder={t.footer.namePlaceholder || "Name"}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-colors"
              required
            />
            <input
              type="email"
              placeholder={t.footer.emailPlaceholder || "Email"}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-colors"
              required
            />
            <textarea
              placeholder={t.footer.messagePlaceholder || "Message"}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-colors resize-none"
              required
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded text-white uppercase tracking-widest text-sm transition-all duration-300 disabled:opacity-50"
            >
              {isSubmitting ? (t.footer.sending || 'Sending...') : (t.footer.send || 'Send')}
            </button>
          </form>

          {/* Small Square Map */}
          <div className="flex-1 max-w-md">
            <div 
              className="w-full h-[250px] md:h-[300px] rounded-lg overflow-hidden border border-white/20 shadow-lg map-container"
              style={{ 
                position: 'relative',
                zIndex: 10
              }}
            >
              <iframe
                ref={mapIframeRef}
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2708.5!2d7.52065!3d47.2794!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDfCsDE2JzQ1LjgiTiA3wrAzMScxNC4zIkU!5e0!3m2!1sen!2sch!4v1234567890&q=Rheistrasse+3,+4410+Liestal+Switzerland|Fluhrweg+16,+3250+Lyss+Switzerland"
                width="100%"
                height="100%"
                style={{ 
                  border: 0,
                  pointerEvents: 'auto'
                }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="DANIELBAU Offices Map"
              />
            </div>
            <div className="mt-3 text-xs text-white/70 space-y-1">
              <p><strong>Main Office:</strong> 4410 Liestal / Rheistrasse 3</p>
              <p><strong>Second Office:</strong> 3250 Lyss / Fluhrweg 16</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-[10px] text-gray-700">
          {t.footer.copyright}
        </div>

        {/* Colossians 3:23 - Almost invisible but visible */}
        <div className="mt-8 text-[8px] text-gray-800/30 font-light italic">
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
