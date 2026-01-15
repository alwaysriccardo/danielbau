import React, { useLayoutEffect, useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SERVICES } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

const ServiceStack: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const { t } = useLanguage();
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Wait for images to load
  useEffect(() => {
    const images = sectionRef.current?.querySelectorAll('img');
    if (!images || images.length === 0) {
      setImagesLoaded(true);
      return;
    }

    let loadedCount = 0;
    const totalImages = images.length;

    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        // Small delay to ensure layout is calculated
        setTimeout(() => {
          setImagesLoaded(true);
          ScrollTrigger.refresh();
        }, 100);
      }
    };

    images.forEach((img) => {
      if (img.complete) {
        checkAllLoaded();
      } else {
        img.addEventListener('load', checkAllLoaded);
        img.addEventListener('error', checkAllLoaded);
      }
    });

    // Fallback timeout
    const timeout = setTimeout(() => {
      setImagesLoaded(true);
      ScrollTrigger.refresh();
    }, 2000);

    return () => {
      clearTimeout(timeout);
      images.forEach((img) => {
        img.removeEventListener('load', checkAllLoaded);
        img.removeEventListener('error', checkAllLoaded);
      });
    };
  }, []);

  useLayoutEffect(() => {
    if (!imagesLoaded) return;

    const ctx = gsap.context(() => {
      // Clear any existing ScrollTriggers for this section - optimized
      const existingTriggers = ScrollTrigger.getAll().filter(trigger => {
        const triggerEl = trigger.vars.trigger as Element;
        return triggerEl && sectionRef.current?.contains(triggerEl);
      });
      existingTriggers.forEach(trigger => trigger.kill());

      // Wait for DOM to be fully ready
      const initScrollTriggers = () => {
      cardsRef.current.forEach((card, i) => {
        const nextCard = cardsRef.current[i + 1];
        if (nextCard && card) {
            const inner = card.querySelector('.card-inner') as HTMLElement;
          
            if (inner) {
            gsap.to(inner, {
            scale: 0.9,
            opacity: 0.4,
            ease: "none",
                force3D: true, // GPU acceleration
            scrollTrigger: {
              trigger: nextCard,
              start: "top bottom",
              end: "top 10vh",
              scrub: 1, // Less frequent updates for better performance
              invalidateOnRefresh: false, // Disable to reduce recalculations
              refreshPriority: -1,
              markers: false
            }
          });
        }
          }
        });

        // Refresh ScrollTrigger after all animations are set up (only once)
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
        });
      };

      // Single initialization
      requestAnimationFrame(() => {
        initScrollTriggers();
      });
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, [t, imagesLoaded]);

  // Refresh on window resize (debounced - longer delay for better performance)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 300); // Increased from 150ms to 300ms
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Add shine effect to view project buttons
  useEffect(() => {
    if (!imagesLoaded) return;

    const buttons = sectionRef.current?.querySelectorAll('.view-project-btn');
    buttons?.forEach((btn) => {
      gsap.to(btn, {
        textShadow: '0 0 8px rgba(255,255,255,0.5), 0 0 16px rgba(255,255,255,0.3)',
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    });
  }, [imagesLoaded]);

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
              ref={el => {
                cardsRef.current[index] = el;
                // Refresh ScrollTrigger when refs are set
                if (el && imagesLoaded) {
                  requestAnimationFrame(() => ScrollTrigger.refresh());
                }
              }}
              className="sticky top-[10vh] h-[80vh] md:h-[80vh] min-h-[600px] w-full flex items-center justify-center mb-[5vh]"
              style={{ willChange: 'transform' }}
            >
              <div className="card-inner w-[90%] h-full bg-[#1a1a1a] border border-white/10 relative overflow-hidden grid md:grid-cols-[1fr_1.2fr] grid-cols-1 shadow-2xl group" style={{ willChange: 'transform, opacity' }}>
                
                <div className="p-8 md:p-16 flex flex-col justify-between bg-[#1a1a1a] z-10 relative min-h-0">
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

                  <a
                    href="#contact"
                    onClick={(e) => {
                      e.preventDefault();
                      window.scrollTo({
                        top: document.documentElement.scrollHeight,
                        behavior: 'smooth'
                      });
                    }}
                    className="view-project-btn text-left uppercase tracking-widest text-xs border-b border-white/30 pb-2 w-max hover:text-white transition-all duration-300 inline-block"
                    aria-label={`${t.services.viewProject}: ${textData.title}`}
                  >
                    {t.services.viewProject}
                  </a>
                </div>

                <div className="relative w-full h-full min-h-[300px] md:min-h-0 overflow-hidden order-first md:order-last">
                  {serviceConstant.image2 ? (
                    // Split view for two images
                    <div className="w-full h-full grid grid-cols-2 gap-0">
                      <div className="relative overflow-hidden group/image1">
                        <img 
                          src={serviceConstant.image} 
                          alt={textData.title}
                          className="w-full h-full object-cover transition-transform duration-[1500ms] ease-out group-hover/image1:scale-110"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <div className="relative overflow-hidden group/image2">
                        <img 
                          src={serviceConstant.image2} 
                          alt={`${textData.title} - Bathroom`}
                          className="w-full h-full object-cover transition-transform duration-[1500ms] ease-out group-hover/image2:scale-110"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    </div>
                  ) : serviceConstant.image.endsWith('.gif') ? (
                    <img 
                      src={serviceConstant.image} 
                      alt={textData.title}
                      className="w-full h-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-110"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                  <img 
                    src={serviceConstant.image} 
                    alt={textData.title}
                    className="w-full h-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-110" 
                      loading="lazy"
                      decoding="async"
                  />
                  )}
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
