import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { IMAGES } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

const Footer: React.FC = () => {
  const footerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(contentRef.current, {
        y: 100,
        opacity: 0.5,
        scale: 0.9,
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top bottom',
          end: 'bottom bottom',
          scrub: true
        }
      });
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
        <div className="text-xs uppercase tracking-[0.3em] mb-4 text-gray-500">
          {t.footer.ready}
        </div>
        <a href="mailto:zitat@danielbau.de" className="font-display text-[8vw] leading-none hover:text-gray-400 transition-colors block">
          {t.footer.offer}
        </a>
        <div className="flex justify-center gap-8 mt-12 text-sm uppercase tracking-widest text-gray-400">
          <a href="tel:+41762313831" className="hover:text-white transition-colors">
            +41 76 231 38 31
          </a>
          <a href="mailto:zitat@danielbau.de" className="hover:text-white transition-colors">
            zitat@danielbau.de
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