import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

interface PreloaderProps {
  onComplete: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const flagRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!containerRef.current || !textRef.current || !flagRef.current) return;
    
    // Preload logo image for smoother experience
    const logoImg = new Image();
    logoImg.src = '/images/logo.png';
    
    const ctx = gsap.context(() => {
      // Wait for logo to load, then start animation
      const startAnimation = () => {
        const tl = gsap.timeline({
          onComplete: onComplete
        });

        // Fade in text and logo smoothly
        gsap.set([textRef.current, flagRef.current], { opacity: 0, y: 20 });
        
        // Use force3D and will-change for GPU acceleration
        gsap.set([textRef.current, flagRef.current], { 
          force3D: true,
          willChange: 'transform, opacity'
        });
        gsap.set(containerRef.current, { 
          force3D: true,
          willChange: 'transform, background-color'
        });

        tl.to([textRef.current, flagRef.current], {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.08,
          force3D: true
        })
        .to({}, { duration: 0.7 }) // Hold time
        .to([textRef.current, flagRef.current], {
          y: -30,
          opacity: 0,
          duration: 0.4,
          ease: 'power2.in',
          stagger: 0.05,
          force3D: true
        }, "-=0.1")
        .to(containerRef.current, {
          backgroundColor: '#E3E1DC', // Fade to site background color
          duration: 0.3,
          ease: 'power2.inOut',
          force3D: true
        }, "-=0.1")
        .to(containerRef.current, {
          yPercent: -100,
          duration: 0.6,
          ease: 'power3.inOut',
          force3D: true,
          onStart: () => {
            // Start showing content as preloader slides up
            // Ensure scroll is at top
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
          },
          onComplete: () => {
            // Ensure scroll is at top when preloader completes
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
          }
        }, "-=0.05");
      };

      if (logoImg.complete) {
        startAnimation();
      } else {
        logoImg.onload = startAnimation;
        logoImg.onerror = startAnimation; // Start anyway if image fails
      }
    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div 
      ref={containerRef} 
      className="preloader-container fixed inset-0 bg-black z-[10000] flex flex-col justify-center items-center text-white"
      style={{ 
        opacity: 1,
        visibility: 'visible'
      }}
    >
      <div ref={textRef} className="font-display text-[5vw] font-bold mb-6" style={{ opacity: 0 }}>
        DANIELBAU
      </div>
      <div 
        ref={flagRef}
        className="w-32 h-32 md:w-40 md:h-40 relative"
        style={{ opacity: 0 }}
      >
        {/* Logo */}
        <img 
          src="/images/logo.png" 
          alt="DANIELBAU Logo" 
          className="w-full h-full object-contain"
          onError={(e) => {
            console.error('Logo failed to load:', e);
            // Fallback if logo not found - show placeholder
            const img = e.target as HTMLImageElement;
            img.style.display = 'none';
          }}
          onLoad={() => {
            console.log('Logo loaded successfully');
          }}
        />
      </div>
    </div>
  );
};

export default Preloader;
