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

      // Parallax Image - delay initialization to prevent shaking
      if (imageRef.current) {
        const isMobile = window.innerWidth < 768;
        
        // Wait for layout to be stable before initializing parallax
        const initParallax = () => {
          if (!imageRef.current) return;
          
          // Use transform: translate3d for better GPU acceleration
          gsap.set(imageRef.current, { 
            force3D: true, 
            transform: 'translate3d(0,0,0)',
            yPercent: 0,
            willChange: 'transform'
          });
          
          gsap.to(imageRef.current, {
            yPercent: isMobile ? 15 : 30,
            ease: 'none',
            force3D: true,
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: isMobile ? 3 : 5, // Higher scrub = less frequent updates = better performance
              invalidateOnRefresh: false,
              refreshPriority: -1,
              pin: false,
              anticipatePin: 1
            }
          });
        };

        // Delay parallax initialization to ensure layout is stable
        setTimeout(() => {
          initParallax();
        }, 300);
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
      
      <div ref={textContainerRef} className="relative z-10 text-center text-white mix-blend-difference">
        <h1 className="font-display text-[12vw] leading-none overflow-hidden">
          <span className="hero-text-line block translate-y-full" style={{ 
            WebkitTextStroke: '1px rgba(255,255,255,0.3)',
            textStroke: '1px rgba(255,255,255,0.3)'
          }}>{t.hero.line1}</span>
        </h1>
        <h1 className="font-display text-[12vw] leading-none overflow-hidden">
          <span className="hero-text-line block translate-y-full" style={{ 
            WebkitTextStroke: '1px rgba(255,255,255,0.3)',
            textStroke: '1px rgba(255,255,255,0.3)'
          }}>{t.hero.line2}</span>
        </h1>
        
        <p className="hero-fade mt-8 text-sm uppercase tracking-[0.5em] opacity-0 mix-blend-difference" style={{
          WebkitTextStroke: '0.5px rgba(255,255,255,0.2)',
          textStroke: '0.5px rgba(255,255,255,0.2)'
        }}>
          {t.hero.subtitle}
        </p>
      </div>
    </section>
  );
};

export default Hero;