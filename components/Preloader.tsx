import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

interface PreloaderProps {
  onComplete: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

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
      })
      .to(containerRef.current, {
        yPercent: -100,
        duration: 1,
        ease: 'power4.inOut'
      });

    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div ref={containerRef} className="fixed inset-0 bg-black z-[10000] flex justify-center items-center text-white">
      <div ref={textRef} className="font-display text-[5vw] font-bold">
        DANIELBAU
      </div>
      <div ref={barRef} className="absolute bottom-0 left-0 h-1 bg-white w-0" />
    </div>
  );
};

export default Preloader;