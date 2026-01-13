import React, { useLayoutEffect, useRef } from 'react';
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
  const emailRef = useRef<HTMLAnchorElement>(null);
  const readyRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

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

      // Animate contact info
      gsap.from([phoneRef.current, emailRef.current], {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.1,
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
      className="fixed bottom-0 left-0 w-full h-screen z-[1] bg-[#111] text-white flex flex-col justify-center items-center"
      id="contact"
    >
      <div ref={contentRef} className="relative z-10 text-center">
        <div 
          ref={readyRef}
          className="text-xs uppercase tracking-[0.3em] mb-6 text-gray-400"
        >
          {t.footer.ready}
        </div>
        <a 
          ref={quoteRef}
          href="mailto:zitat@danielbau.de" 
          className="font-display text-[8vw] md:text-[6vw] leading-none hover:text-white transition-all duration-300 block cursor-pointer"
        >
          {t.footer.offer}
        </a>
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-12 mt-16">
          <a 
            ref={phoneRef}
            href="tel:+41762313831" 
            className="text-lg md:text-xl font-light tracking-wide text-white hover:text-blue-400 transition-all duration-300 flex items-center gap-3 group"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>+41 76 231 38 31</span>
          </a>
          <a 
            ref={emailRef}
            href="mailto:zitat@danielbau.de" 
            className="text-lg md:text-xl font-light tracking-wide text-white hover:text-blue-400 transition-all duration-300 flex items-center gap-3 group"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>zitat@danielbau.de</span>
          </a>
        </div>
        <div className="mt-20 text-[10px] text-gray-700">
          {t.footer.copyright}
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