import React, { useLayoutEffect, useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '../contexts/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  hue: number;
}

const CleaningServices: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const quoteButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const [bubbles] = useState<Bubble[]>(() => {
    // Create rainbow bubbles - reduced count for performance
    const newBubbles: Bubble[] = [];
    for (let i = 0; i < 10; i++) { // Reduced from 15 to 10
      newBubbles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 20 + Math.random() * 40,
        delay: Math.random() * 2,
        hue: (i * 36) % 360 // Rainbow colors
      });
    }
    return newBubbles;
  });
  const [showQuoteMenu, setShowQuoteMenu] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (quoteButtonRef.current && menuRef.current) {
        if (!quoteButtonRef.current.contains(event.target as Node) && 
            !menuRef.current.contains(event.target as Node)) {
          setShowQuoteMenu(false);
        }
      }
    };

    if (showQuoteMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showQuoteMenu]);

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

      // Animate quote menu
      if (menuRef.current) {
        gsap.to(menuRef.current, {
          opacity: showQuoteMenu ? 1 : 0,
          scale: showQuoteMenu ? 1 : 0.9,
          pointerEvents: showQuoteMenu ? 'auto' : 'none',
          duration: 0.2,
          ease: 'power2.out'
        });
      }

      // Animate bubbles with transform for better performance - optimized
      bubbles.forEach((bubble) => {
        const bubbleEl = document.getElementById(`bubble-${bubble.id}`);
        if (bubbleEl) {
          const moveY = 50 + Math.random() * 100;
          const moveX = -20 + Math.random() * 40;
          gsap.to(bubbleEl, {
            y: `-=${moveY}`,
            x: `+=${moveX}`,
            opacity: 0.6 + Math.random() * 0.4,
            scale: 0.8 + Math.random() * 0.4,
            duration: 4 + Math.random() * 2, // Slower for better performance
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: bubble.delay,
            force3D: true, // GPU acceleration
            lazy: true // Only animate when visible
          });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [t, showQuoteMenu, bubbles]);

  return (
    <section 
      ref={sectionRef} 
      className="py-24 px-6 md:px-20 bg-[#E3E1DC] relative overflow-hidden"
    >
      {/* Rainbow Bubbles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            id={`bubble-${bubble.id}`}
            className="absolute rounded-full opacity-60"
            style={{
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              background: `radial-gradient(circle, hsla(${bubble.hue}, 70%, 60%, 0.6), hsla(${bubble.hue}, 70%, 50%, 0.3))`,
              boxShadow: `0 0 ${bubble.size}px hsla(${bubble.hue}, 70%, 60%, 0.5)`,
              willChange: 'transform, opacity'
            }}
          />
        ))}
      </div>

      <div ref={contentRef} className="max-w-[1200px] mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="text-xs uppercase tracking-widest mb-3 opacity-50 text-gray-600">
            {t.cleaning.subheader}
          </div>
          <h3 className="font-display text-3xl md:text-4xl mb-4 text-gray-800">
            {t.cleaning.header}
          </h3>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto mb-6">
            {t.cleaning.note}
          </p>
          
          {/* Small Quote Button */}
          <div className="relative inline-block">
            <button
              ref={quoteButtonRef}
              onClick={() => setShowQuoteMenu(!showQuoteMenu)}
              className="text-xs uppercase tracking-widest px-4 py-2 bg-white/80 hover:bg-white border border-gray-300 rounded-full transition-all duration-300 shadow-sm hover:shadow-md"
            >
              {t.cleaning.quoteButton || 'QUOTE'}
            </button>
            
            {/* Quote Menu */}
            <div
              ref={menuRef}
              className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[160px] opacity-0 scale-90 pointer-events-none z-50"
            >
              <a
                href="tel:+41762313831"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                onClick={() => setShowQuoteMenu(false)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {t.cleaning.call || 'Call'}
              </a>
              <a
                href="mailto:zitat@danielbau.de"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                onClick={() => setShowQuoteMenu(false)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {t.cleaning.email || 'Email'}
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {t.cleaning.items.map((item, index) => (
            <div
              key={index}
              className="text-center p-6 bg-white/60 backdrop-blur-md rounded-lg border border-gray-200/50 hover:bg-white/80 transition-all duration-300 shadow-lg"
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
