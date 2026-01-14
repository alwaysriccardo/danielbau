import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

interface PreloaderProps {
  onComplete: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const flagRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: onComplete
      });

      tl.to(barRef.current, {
        width: '100%',
        duration: 1.5,
        ease: 'power2.inOut'
      })
      .to(textRef.current, {
        y: -50,
        opacity: 0,
        duration: 0.5
      }, "-=0.3")
      .to(flagRef.current, {
        y: -50,
        opacity: 0,
        duration: 0.5
      }, "-=0.5")
      .to(containerRef.current, {
        yPercent: -100,
        duration: 1,
        ease: 'power4.inOut'
      });

      // Flag fluttering animation
      if (flagRef.current) {
        gsap.to(flagRef.current, {
          rotation: 2,
          duration: 0.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div ref={containerRef} className="fixed inset-0 bg-black z-[10000] flex flex-col justify-center items-center text-white">
      <div ref={textRef} className="font-display text-[5vw] font-bold mb-6">
        DANIELBAU
      </div>
      <div 
        ref={flagRef}
        className="w-32 h-32 md:w-40 md:h-40 relative"
      >
        {/* Logo */}
        <img 
          src="/images/logo.png" 
          alt="DANIELBAU Logo" 
          className="w-full h-full object-contain"
          onError={(e) => {
            // Fallback if logo not found
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
      <div ref={barRef} className="absolute bottom-0 left-0 h-1 bg-white w-0" />
    </div>
  );
};

export default Preloader;
