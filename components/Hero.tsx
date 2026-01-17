import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { IMAGES } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Intro Text Reveal
      gsap.to('.hero-text-line', {
        y: 0,
        stagger: 0.1,
        duration: 1.5,
        ease: 'power4.out',
        delay: 0.5 
      });
      
      gsap.to('.hero-fade', {
        opacity: 1,
        duration: 1,
        delay: 1.2
      });

      // Shine effects removed for cleaner look

      // Parallax Image - optimized for 60 FPS (different settings for mobile vs desktop)
      if (imageRef.current) {
        const isMobile = window.innerWidth < 768;
        
        // Use transform: translate3d for better GPU acceleration
        gsap.set(imageRef.current, { force3D: true, transform: 'translate3d(0,0,0)' });
        
        gsap.to(imageRef.current, {
          yPercent: isMobile ? 15 : 30, // Reduced parallax intensity on mobile for smoother performance
          ease: 'none',
          force3D: true, // GPU acceleration
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: isMobile ? 2 : 1, // Optimized scrub for 60 FPS (lower = smoother)
            invalidateOnRefresh: false, // Disable to reduce recalculations
            refreshPriority: -1 // Lower priority to reduce impact
          }
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [t]); // Re-run animation if language changes might be visually slightly jumpy, but necessary for text update

  return (
    <section ref={containerRef} className="flex overflow-hidden h-screen relative items-center justify-center">
      <img 
        ref={imageRef}
        src={IMAGES.HERO} 
        className="absolute inset-0 w-full h-full object-cover brightness-75 scale-110" 
        alt="Hero Background" 
        loading="eager"
        decoding="async"
        style={{ willChange: 'transform' }}
      />
      
      <div ref={textContainerRef} className="relative z-10 text-center text-white mix-blend-difference" style={{ willChange: 'transform' }}>
        <h1 className="font-display text-[12vw] leading-none overflow-hidden">
          <span className="hero-text-line block translate-y-full" style={{ 
            WebkitTextStroke: '1px rgba(255,255,255,0.3)',
            textStroke: '1px rgba(255,255,255,0.3)',
            willChange: 'transform'
          }}>{t.hero.line1}</span>
        </h1>
        <h1 className="font-display text-[12vw] leading-none overflow-hidden">
          <span className="hero-text-line block translate-y-full" style={{ 
            WebkitTextStroke: '1px rgba(255,255,255,0.3)',
            textStroke: '1px rgba(255,255,255,0.3)',
            willChange: 'transform'
          }}>{t.hero.line2}</span>
        </h1>
        
        <p className="hero-fade mt-8 text-sm uppercase tracking-[0.5em] opacity-0 mix-blend-difference" style={{
          WebkitTextStroke: '0.5px rgba(255,255,255,0.2)',
          textStroke: '0.5px rgba(255,255,255,0.2)',
          willChange: 'opacity'
        }}>
          {t.hero.subtitle}
        </p>
      </div>
    </section>
  );
};

export default Hero;