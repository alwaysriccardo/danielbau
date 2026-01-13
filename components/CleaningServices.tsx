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
}

const CleaningServices: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const quoteButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const [bubbles] = useState<Bubble[]>(() => {
    // Reduced bubble count for better performance (8 instead of 15)
    const newBubbles: Bubble[] = [];
    for (let i = 0; i < 8; i++) {
      newBubbles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 30 + Math.random() * 50,
        delay: Math.random() * 2
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
    }, sectionRef);

    return () => ctx.revert();
  }, [t, showQuoteMenu]);

  return (
    <section 
      ref={sectionRef} 
      className="py-24 px-6 md:px-20 bg-[#E3E1DC] relative overflow-hidden"
    >
      {/* Realistic Soap Bubbles - CSS animations for better performance */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className="absolute bubble"
            style={{
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              animationDelay: `${bubble.delay}s`,
              willChange: 'transform, opacity'
            }}
          >
            <div className="bubble-inner" />
          </div>
        ))}
      </div>

      <style>{`
        .bubble {
          animation: float 8s ease-in-out infinite;
        }
        
        .bubble-inner {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.8);
          background: radial-gradient(circle at 30% 30%, 
            rgba(255, 255, 255, 0.3) 0%,
            rgba(200, 220, 255, 0.2) 30%,
            rgba(150, 200, 255, 0.15) 60%,
            transparent 100%
          );
          box-shadow: 
            inset 0 0 20px rgba(255, 255, 255, 0.4),
            inset -10px -10px 20px rgba(200, 220, 255, 0.3),
            0 0 10px rgba(255, 255, 255, 0.3),
            0 2px 4px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
        }
        
        .bubble-inner::before {
          content: '';
          position: absolute;
          top: 20%;
          left: 30%;
          width: 30%;
          height: 30%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, transparent 70%);
          filter: blur(2px);
        }
        
        .bubble-inner::after {
          content: '';
          position: absolute;
          top: 10%;
          right: 20%;
          width: 20%;
          height: 20%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%);
          filter: blur(1px);
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0.6;
          }
          25% {
            transform: translateY(-30px) translateX(10px) scale(1.05);
            opacity: 0.7;
          }
          50% {
            transform: translateY(-60px) translateX(-5px) scale(0.95);
            opacity: 0.8;
          }
          75% {
            transform: translateY(-30px) translateX(-10px) scale(1.02);
            opacity: 0.7;
          }
        }
      `}</style>

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
