import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SERVICES } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

const ServiceStack: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const { t } = useLanguage();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, i) => {
        const nextCard = cardsRef.current[i + 1];
        if (nextCard && card) {
          const inner = card.querySelector('.card-inner');
          
          gsap.to(inner, {
            scale: 0.9,
            opacity: 0.4,
            ease: "none",
            scrollTrigger: {
              trigger: nextCard,
              start: "top bottom",
              end: "top 10vh",
              scrub: true
            }
          });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [t]);

  return (
    <section ref={sectionRef} className="py-[10vh] bg-[#121212] text-[#E3E1DC] relative" id="services">
      <div className="text-center mb-20 px-6">
        <div className="text-xs uppercase tracking-widest mb-4 opacity-50">
          {t.services.subheader}
        </div>
        <h2 className="font-display text-5xl md:text-7xl">{t.services.header}</h2>
      </div>

      <div className="w-full max-w-[1400px] mx-auto relative pb-[10vh]">
        {SERVICES.map((serviceConstant, index) => {
          // Merge translation data
          const textData = t.services.items[index];
          
          return (
            <div 
              key={serviceConstant.id}
              ref={el => (cardsRef.current[index] = el)}
              className="sticky top-[10vh] h-[80vh] w-full flex items-center justify-center mb-[5vh]"
            >
              <div className="card-inner w-[90%] h-full bg-[#1a1a1a] border border-white/10 relative overflow-hidden grid md:grid-cols-[1fr_1.2fr] grid-cols-1 shadow-2xl group">
                
                <div className="p-8 md:p-16 flex flex-col justify-between bg-[#1a1a1a] z-10 relative">
                  <div>
                    <div className={`font-display text-5xl mb-2 ${serviceConstant.accentColor}`}>
                      {serviceConstant.number}
                    </div>
                    <h3 className="text-3xl font-bold">{textData.title}</h3>
                    <p className="text-sm mt-4 opacity-70 uppercase tracking-widest">
                      {textData.subtitle}
                    </p>
                  </div>
                  
                  <div className="text-gray-400 font-light my-8 md:my-0">
                    {textData.description}
                  </div>

                  <button 
                    className="text-left uppercase tracking-widest text-xs border-b border-white/30 pb-2 w-max hover:text-white transition-colors"
                    aria-label={`${t.services.viewProject}: ${textData.title}`}
                  >
                    {t.services.viewProject}
                  </button>
                </div>

                <div className="relative w-full h-full overflow-hidden order-first md:order-last">
                  <img 
                    src={serviceConstant.image} 
                    alt={textData.title}
                    className="w-full h-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-110" 
                  />
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ServiceStack;