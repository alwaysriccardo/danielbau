import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitText from './SplitText';
import { useLanguage } from '../contexts/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

const Intro: React.FC = () => {
  const { t } = useLanguage();
  const titleRef = useRef<HTMLDivElement>(null);
  const underlineRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const nextClientRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState<number | string>(0);
  const [showNextClient, setShowNextClient] = useState(false);

  useEffect(() => {
    // Animate counter from 0 to 1000, then replace with text
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && count === 0) {
            const duration = 3000; // 3 seconds total
            const increment = 15; // Smaller increments for smoother counting
            const stepDuration = 45; // Update every 45ms for smooth animation
            let current = 0;

            const timer = setInterval(() => {
              current += increment;
              if (current >= 1000) {
                setCount(1000);
                clearInterval(timer);
                // Immediately replace with text - no delay
                setCount(t.intro.nextClientNumber || 'You');
                setShowNextClient(true);
              } else {
                setCount(Math.floor(current));
              }
            }, stepDuration);

            return () => clearInterval(timer);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => {
      if (counterRef.current) {
        observer.unobserve(counterRef.current);
      }
    };
  }, [count, t]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Animated underline
      if (underlineRef.current) {
        gsap.fromTo(underlineRef.current, 
          { width: 0 },
          {
            width: '100%',
            duration: 1.5,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: titleRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      // Counter animation
      if (counterRef.current) {
        gsap.from(counterRef.current, {
          y: 30,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          delay: 0.5,
          scrollTrigger: {
            trigger: counterRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        });
      }

      // Next client text animation
      if (nextClientRef.current) {
        gsap.from(nextClientRef.current, {
          y: 20,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          delay: 0.3,
          scrollTrigger: {
            trigger: nextClientRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        });
      }
    }, titleRef);

    return () => ctx.revert();
  }, [t]);

  return (
    <section className="py-32 px-6 md:px-20 bg-[#E3E1DC]" id="about">
      <div className="max-w-[1800px] mx-auto">
        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <div ref={titleRef} className="relative inline-block">
              <div className="flex items-center gap-4 mb-4">
                <SplitText tag="h2" className="font-display text-4xl md:text-5xl leading-tight">
                  {t.intro.title}
                </SplitText>
                {/* Switzerland Flag */}
                <div className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <rect x="0" y="0" width="100" height="100" fill="white" />
                    <rect x="0" y="40" width="100" height="20" fill="black" />
                    <rect x="40" y="0" width="20" height="100" fill="black" />
                  </svg>
                </div>
              </div>
              {/* Animated Underline */}
              <div 
                ref={underlineRef}
                className="h-1 bg-black origin-left"
                style={{ width: 0 }}
              />
            </div>
          </div>
          <div className="text-lg md:text-xl font-light leading-relaxed text-gray-700">
            <SplitText tag="p" className="mb-8 max-w-full md:max-w-none">
              {t.intro.text}
            </SplitText>
            
            <div className="h-px w-full bg-black/10 my-8" />
            
            <div className="flex flex-col md:flex-row gap-8 md:gap-12 text-sm uppercase tracking-widest mb-8">
              <SplitText>{t.intro.location}</SplitText>
            </div>

            {/* Animated Counter Section */}
            <div ref={counterRef} className="mt-12 p-6 bg-white/30 rounded-lg border border-black/10">
              <div className="flex items-baseline gap-2 mb-2">
                {typeof count === 'number' ? (
                  <>
                    <span className="font-display text-4xl md:text-5xl font-bold text-black">
                      {count.toLocaleString()}
                    </span>
                    <span className="text-sm uppercase tracking-widest opacity-70">
                      {t.intro.satisfiedClients || 'satisfied clients'}
                    </span>
                  </>
                ) : (
                  <span className="font-display text-3xl md:text-4xl font-bold text-black">
                    {count}
                  </span>
                )}
              </div>
              {showNextClient && (
                <div 
                  ref={nextClientRef}
                  className="text-base md:text-lg font-light italic text-gray-700 mt-2"
                >
                  {t.intro.nextClient || 'You can be the next one'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Intro;
