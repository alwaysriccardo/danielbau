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

      // Animated outline/shine effect for hero text - optimized
      gsap.to('.hero-text-line', {
        textShadow: '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.6), 0 0 30px rgba(255,255,255,0.4)',
        duration: 3, // Slower for better performance
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 2,
        force3D: true
      });

      gsap.to('.hero-fade', {
        textShadow: '0 0 8px rgba(255,255,255,0.6), 0 0 16px rgba(255,255,255,0.4)',
        duration: 3, // Slower for better performance
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 2.5,
        force3D: true
      });

      // Parallax Image
      if (imageRef.current) {
      gsap.to(imageRef.current, {
        yPercent: 30,
        ease: 'none',
          force3D: true, // GPU acceleration
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true
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