import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SplitTextProps {
  children: string;
  className?: string;
  tag?: React.ElementType;
}

const SplitText: React.FC<SplitTextProps> = ({ children, className = '', tag: Tag = 'div' }) => {
  const elementRef = useRef<HTMLElement>(null);

  const words = children.split(' ');

  // Disabled ScrollTrigger animation for better performance
  // useLayoutEffect(() => {
  //   const ctx = gsap.context(() => {
  //     const wordElements = elementRef.current?.querySelectorAll('.word-inner');
  //     if (wordElements) {
  //       gsap.to(wordElements, {
  //         y: "0%",
  //         duration: 1,
  //         ease: "power3.out",
  //         stagger: 0.02,
  //         scrollTrigger: {
  //           trigger: elementRef.current,
  //           start: "top 85%",
  //           toggleActions: "play none none reverse"
  //         }
  //       });
  //     }
  //   }, elementRef);
  //   return () => ctx.revert();
  // }, [children]);
  
  // Simple CSS-based reveal instead
  useLayoutEffect(() => {
    const wordElements = elementRef.current?.querySelectorAll('.word-inner');
    if (wordElements) {
      wordElements.forEach((el) => {
        (el as HTMLElement).style.transform = 'translateY(0%)';
      });
    }
  }, [children]);

  return (
    <Tag ref={elementRef} className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-top pb-[0.1em] mr-[0.25em]">
          <span className="word-inner inline-block translate-y-[110%]">
            {word}
          </span>
        </span>
      ))}
    </Tag>
  );
};

export default SplitText;