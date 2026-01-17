import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Testimonial {
  name: string;
  text: string;
  language: 'DE' | 'FR' | 'IT';
}

const originalTestimonials: Testimonial[] = [
  {
    name: 'Michael Schneider',
    text: 'Ausgezeichnete Arbeit! Das Team von DANIELBAU hat unsere Küche komplett renoviert. Alles wurde pünktlich und in höchster Qualität abgeliefert. Sehr empfehlenswert!',
    language: 'DE'
  },
  {
    name: 'Sarah Müller',
    text: 'Wir sind absolut begeistert von der Renovierung unseres Badezimmers. Professionelle Beratung, saubere Ausführung und faire Preise. Vielen Dank für die tolle Arbeit!',
    language: 'DE'
  },
  {
    name: 'Thomas Weber',
    text: 'DANIELBAU hat unser gesamtes Haus renoviert. Die Handwerker waren immer pünktlich, sehr freundlich und haben alles perfekt umgesetzt. Wir würden jederzeit wieder mit ihnen arbeiten.',
    language: 'DE'
  },
  {
    name: 'Anna Fischer',
    text: 'Die Malerarbeiten wurden mit größter Sorgfalt durchgeführt. Die Farben sind genau wie besprochen und die Oberflächen sind makellos. Wir sind sehr zufrieden!',
    language: 'DE'
  },
  {
    name: 'Pierre Dubois',
    text: 'Service exceptionnel! L\'équipe a rénové notre salon avec un soin remarquable. Travail de qualité, respect des délais et prix très compétitifs. Nous recommandons vivement!',
    language: 'FR'
  },
  {
    name: 'Sophie Martin',
    text: 'Très professionnel et attentionné. La rénovation de notre appartement s\'est déroulée sans problème. Le résultat est magnifique et correspond exactement à nos attentes.',
    language: 'FR'
  },
  {
    name: 'Marco Rossi',
    text: 'Lavoro eccellente! Hanno ristrutturato completamente il nostro appartamento. Professionalità, pulizia e attenzione ai dettagli. Consigliatissimo!',
    language: 'IT'
  }
];

// Shuffle array function
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const Testimonials: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [testimonials] = useState(() => shuffleArray(originalTestimonials));

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useLayoutEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const items = sectionRef.current?.querySelectorAll('.testimonial-item');
      if (items && items.length > 0) {
        gsap.set(items, { force3D: true, transform: 'translate3d(0,0,0)' });
        
        gsap.from(items, {
          y: 30,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          force3D: true,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: false
          }
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="py-12 md:py-16 px-6 md:px-20 bg-[#E3E1DC]" 
      id="testimonials"
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Compact Header */}
        <div className="text-center mb-8 md:mb-10">
          <h2 className="font-display text-3xl md:text-4xl mb-2 text-gray-800">
            Kundenbewertungen
          </h2>
          <div className="h-px w-16 bg-gray-400 mx-auto"></div>
        </div>

        {/* Mobile: Carousel with arrows, Desktop: Grid */}
        {isMobile ? (
          <div className="relative">
            {/* Navigation Arrows */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <button
                onClick={prevTestimonial}
                className="p-3 bg-[#121212] text-white rounded-full hover:bg-gray-800 transition-colors shadow-lg z-10"
                aria-label="Previous testimonial"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
              
              <div className="text-center">
                <span className="text-xs text-gray-500">
                  {currentIndex + 1} / {testimonials.length}
                </span>
              </div>
              
              <button
                onClick={nextTestimonial}
                className="p-3 bg-[#121212] text-white rounded-full hover:bg-gray-800 transition-colors shadow-lg z-10"
                aria-label="Next testimonial"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </div>

            {/* Single Testimonial Card */}
            <div className="testimonial-item bg-white/80 rounded-lg p-5 shadow-md">
              {/* Stars */}
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-base text-gray-700 leading-relaxed mb-3 italic">
                "{testimonials[currentIndex].text}"
              </p>

              {/* Author */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-800">
                  {testimonials[currentIndex].name}
                </p>
                <span className="text-xs text-gray-400">
                  {testimonials[currentIndex].language}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Desktop: Grid Layout */
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="testimonial-item bg-white/80 rounded-lg p-4 md:p-5 shadow-md hover:shadow-lg transition-shadow"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-4 h-4 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3 italic">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <p className="text-xs md:text-sm font-semibold text-gray-800">
                    {testimonial.name}
                  </p>
                  <span className="text-xs text-gray-400">
                    {testimonial.language}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
