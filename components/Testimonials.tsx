import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '../contexts/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

interface Testimonial {
  text: string;
  language: 'DE' | 'FR' | 'IT';
}

const originalTestimonials: Testimonial[] = [
  {
    text: 'Ausgezeichnete Arbeit! Das Team von DANIELBAU hat unsere Küche komplett renoviert. Alles wurde pünktlich und in höchster Qualität abgeliefert. Sehr empfehlenswert!',
    language: 'DE'
  },
  {
    text: 'Wir sind absolut begeistert von der Renovierung unseres Badezimmers. Professionelle Beratung, saubere Ausführung und faire Preise. Vielen Dank für die tolle Arbeit!',
    language: 'DE'
  },
  {
    text: 'DANIELBAU hat unser gesamtes Haus renoviert. Die Handwerker waren immer pünktlich, sehr freundlich und haben alles perfekt umgesetzt. Wir würden jederzeit wieder mit ihnen arbeiten.',
    language: 'DE'
  },
  {
    text: 'Die Malerarbeiten wurden mit größter Sorgfalt durchgeführt. Die Farben sind genau wie besprochen und die Oberflächen sind makellos. Wir sind sehr zufrieden!',
    language: 'DE'
  },
  {
    text: 'Service exceptionnel! L\'équipe a rénové notre salon avec un soin remarquable. Travail de qualité, respect des délais et prix très compétitifs. Nous recommandons vivement!',
    language: 'FR'
  },
  {
    text: 'Très professionnel et attentionné. La rénovation de notre appartement s\'est déroulée sans problème. Le résultat est magnifique et correspond exactement à nos attentes.',
    language: 'FR'
  },
  {
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
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const [testimonials] = useState<Testimonial[]>(() => shuffleArray(originalTestimonials));
  const [currentIndex, setCurrentIndex] = useState(0);
  const testimonialRef = useRef<HTMLDivElement>(null);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Disabled ScrollTrigger animation for better performance
  // useLayoutEffect(() => {
  //   if (!sectionRef.current) return;
  //   const ctx = gsap.context(() => {
  //     const item = sectionRef.current?.querySelector('.testimonial-item');
  //     if (item) {
  //       gsap.set(item, { force3D: true, transform: 'translate3d(0,0,0)' });
  //       gsap.from(item, {
  //         y: 30,
  //         opacity: 0,
  //         duration: 0.6,
  //         ease: 'power2.out',
  //         force3D: true,
  //         scrollTrigger: {
  //           trigger: sectionRef.current,
  //           start: 'top 85%',
  //           toggleActions: 'play none none reverse',
  //           invalidateOnRefresh: false
  //         }
  //       });
  //     }
  //   }, sectionRef);
  //   return () => ctx.revert();
  // }, []);

  // Animate testimonial change
  useEffect(() => {
    if (testimonialRef.current) {
      gsap.fromTo(
        testimonialRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [currentIndex]);

  return (
    <section 
      ref={sectionRef}
      className="pt-12 md:pt-16 pb-4 md:pb-6 px-6 md:px-20 bg-[#E3E1DC]" 
      id="testimonials"
    >
      <div className="max-w-4xl mx-auto">
        {/* Compact Header */}
        <div className="text-center mb-6 md:mb-8">
          <h2 className="font-display text-xl md:text-2xl mb-1 text-gray-700">
            {t.testimonials.header}
          </h2>
          <div className="h-px w-12 bg-gray-300 mx-auto"></div>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-8 z-10 p-3 md:p-4 bg-[#121212] text-white rounded-full hover:bg-gray-800 transition-all shadow-lg hover:scale-110"
            aria-label="Previous testimonial"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>

          {/* Testimonial Card */}
          <div
            ref={testimonialRef}
            className="testimonial-item relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 md:p-12 shadow-2xl border border-gray-200/50 backdrop-blur-sm"
          >
            {/* Decorative Quote Icon */}
            <div className="absolute top-4 left-4 text-gray-200 text-6xl md:text-8xl font-serif leading-none">
              "
            </div>

            {/* Stars */}
            <div className="flex gap-1 mb-6 justify-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-5 h-5 md:w-6 md:h-6 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>

            {/* Testimonial Text */}
            <p className="text-base md:text-lg lg:text-xl text-gray-700 leading-relaxed mb-6 italic relative z-10 text-center px-4">
              "{testimonials[currentIndex].text}"
            </p>

            {/* Language Badge */}
            <div className="flex justify-center">
              <span className="inline-block px-4 py-2 bg-gray-100 text-gray-600 text-xs md:text-sm font-semibold rounded-full">
                {testimonials[currentIndex].language}
              </span>
            </div>

            {/* Indicator Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'w-8 bg-[#121212]'
                      : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right Arrow */}
          <button
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-8 z-10 p-3 md:p-4 bg-[#121212] text-white rounded-full hover:bg-gray-800 transition-all shadow-lg hover:scale-110"
            aria-label="Next testimonial"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
