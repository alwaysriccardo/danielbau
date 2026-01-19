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
    for (let i = 0; i < 4; i++) { // Reduced from 6 to 4 for better performance
      newBubbles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 20 + Math.random() * 40,
        delay: Math.random() * 2,
        hue: (i * 60) % 360 // Rainbow colors
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
      if (contentRef.current) {
        gsap.set(contentRef.current, { force3D: true, transform: 'translate3d(0,0,0)' });
        gsap.from(contentRef.current, {
          y: 50,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          force3D: true, // GPU acceleration
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: false, // Reduce recalculations
            refreshPriority: -1 // Lower priority for smoother scrolling
          }
        });
      }

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

      // Animate bubbles with transform - pause when off-screen
      const bubbleAnimations: gsap.core.Tween[] = [];
      bubbles.forEach((bubble) => {
        const bubbleEl = document.getElementById(`bubble-${bubble.id}`);
        if (bubbleEl) {
          const moveY = 30 + Math.random() * 60; // Further reduced movement range
          const moveX = -10 + Math.random() * 20; // Further reduced movement range
          const anim = gsap.to(bubbleEl, {
            y: `-=${moveY}`,
            x: `+=${moveX}`,
            opacity: 0.4 + Math.random() * 0.2, // Reduced opacity variation
            scale: 1 + Math.random() * 0.05, // Further reduced scale variation
            duration: 6 + Math.random() * 3, // Longer duration for smoother motion
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: bubble.delay,
            force3D: true, // GPU acceleration
            transformOrigin: 'center center', // Optimize transform origin
            paused: true, // Start paused
            lazy: false // Disable lazy rendering for smoother animation
          });
          bubbleAnimations.push(anim);
        }
      });
      
      // Use IntersectionObserver to pause/resume bubbles when off-screen
      if (sectionRef.current && bubbleAnimations.length > 0) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                bubbleAnimations.forEach(anim => anim.play());
              } else {
                bubbleAnimations.forEach(anim => anim.pause());
              }
            });
          },
          { threshold: 0.1, rootMargin: '300px' } // Increased rootMargin
        );
        
        observer.observe(sectionRef.current);
        
        // Start animations if already in view
        const rect = sectionRef.current.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight && rect.bottom > 0;
        if (isInView) {
          bubbleAnimations.forEach(anim => anim.play());
        }
      }
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
            className="absolute rounded-full opacity-50"
            style={{
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              background: `radial-gradient(circle, hsla(${bubble.hue}, 70%, 60%, 0.6), hsla(${bubble.hue}, 70%, 50%, 0.3))`,
              boxShadow: `0 0 ${bubble.size}px hsla(${bubble.hue}, 70%, 60%, 0.5)`
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
                href="mailto:danielbau@mail.ch"
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
              className="text-center p-6 bg-white/70 rounded-lg border border-gray-200/50 hover:bg-white/90 transition-all duration-300 shadow-md"
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
