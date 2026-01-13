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
  const { t } = useLanguage();
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    // Create rainbow bubbles
    const newBubbles: Bubble[] = [];
    for (let i = 0; i < 15; i++) {
      newBubbles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 20 + Math.random() * 40,
        delay: Math.random() * 2,
        hue: (i * 24) % 360 // Rainbow colors
      });
    }
    setBubbles(newBubbles);
  }, []);

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

      // Animate bubbles
      bubbles.forEach((bubble) => {
        const bubbleEl = document.getElementById(`bubble-${bubble.id}`);
        if (bubbleEl) {
          gsap.to(bubbleEl, {
            y: `-=${50 + Math.random() * 100}`,
            x: `+=${-20 + Math.random() * 40}`,
            opacity: 0.6 + Math.random() * 0.4,
            scale: 0.8 + Math.random() * 0.4,
            duration: 3 + Math.random() * 2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: bubble.delay
          });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [t, bubbles]);

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
            className="absolute rounded-full opacity-60 blur-sm"
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
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            {t.cleaning.note}
          </p>
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
