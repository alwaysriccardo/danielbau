import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '../contexts/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

interface Testimonial {
  name: string;
  location: string;
  text: string;
  rating: number;
}

const Testimonials: React.FC = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !cardsRef.current) return;

    const cards = cardsRef.current.querySelectorAll('.testimonial-card');
    
    // Animate cards on scroll
    gsap.from(cards, {
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === sectionRef.current) {
          trigger.kill();
        }
      });
    };
  }, []);

  const testimonials = t.testimonials.items;

  return (
    <section 
      ref={sectionRef}
      className="py-12 md:py-16 px-6 md:px-20 bg-[#E3E1DC]"
      id="testimonials"
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-10">
          <h2 className="font-display text-3xl md:text-4xl mb-2 text-gray-800">
            {t.testimonials.header}
          </h2>
          <p className="text-sm md:text-base text-gray-600">
            {t.testimonials.subheader}
          </p>
        </div>

        {/* Testimonials Grid - Compact but scrollable on mobile */}
        <div 
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
        >
          {testimonials.map((testimonial: Testimonial, index: number) => (
            <div
              key={index}
              className="testimonial-card bg-white rounded-lg p-5 md:p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 relative overflow-hidden group"
            >
              {/* Decorative accent */}
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#121212] to-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Rating Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote icon */}
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg className="w-12 h-12 text-[#121212]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.984zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
              </div>

              {/* Testimonial Text */}
              <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-5 italic relative z-10">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="pt-4 border-t border-gray-200 relative z-10">
                <p className="font-semibold text-gray-800 text-sm">
                  {testimonial.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {testimonial.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
