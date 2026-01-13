import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '../contexts/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

const CleaningServices: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(contentRef.current, {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [t]);

  return (
    <section 
      ref={sectionRef} 
      className="py-24 px-6 md:px-20 bg-[#E3E1DC] relative"
    >
      <div ref={contentRef} className="max-w-[1200px] mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs uppercase tracking-widest mb-3 opacity-50 text-gray-600">
            {t.cleaning.subheader}
          </div>
          <h3 className="font-display text-3xl md:text-4xl mb-4 text-gray-800">
            {t.cleaning.header}
          </h3>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            {t.cleaning.note}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {t.cleaning.items.map((item, index) => (
            <div
              key={index}
              className="text-center p-6 bg-white/50 rounded-lg backdrop-blur-sm border border-gray-200/50 hover:bg-white/70 transition-all duration-300"
            >
              <div className="text-sm md:text-base font-light text-gray-700">
                {item}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CleaningServices;
