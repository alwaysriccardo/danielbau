import React, { useEffect, useState } from 'react';
import Lenis from '@studio-freight/lenis';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import Preloader from './components/Preloader';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Intro from './components/Intro';
import ServiceStack from './components/ServiceStack';
import CleaningServices from './components/CleaningServices';
import Portfolio from './components/Portfolio';
import Footer from './components/Footer';
import LanguageSidebar from './components/LanguageSidebar';
import EmailButton from './components/EmailButton';

const AppContent = () => {
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  // Handle preloader completion
  useEffect(() => {
    if (!loading) {
      // Remove fixed positioning immediately
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      
      // Force scroll to top immediately and keep it there
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Add loaded class
      document.body.classList.add('loaded');
      
      // Enable scrolling
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.pointerEvents = 'auto';
    } else {
      // During loading, keep body fixed
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.classList.remove('loaded');
    }
  }, [loading]);

  useEffect(() => {
    // Only initialize Lenis after loading completes
    if (loading) return;

    // Small delay to ensure DOM is ready
    const initTimeout = setTimeout(() => {
      const lenis = new Lenis({
        duration: 1.0,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        smoothWheel: true,
        smoothTouch: false,
        wheelMultiplier: 0.8,
        touchMultiplier: 1.5,
      });

      // Force scroll to top immediately and prevent any movement
      lenis.scrollTo(0, { immediate: true });
      
      // Lock scroll position
      let scrollLocked = true;
      const lockTimeout = setTimeout(() => {
        scrollLocked = false;
      }, 500);

      let rafId: number;
      let lastTime = 0;
      function raf(time: number) {
        if (scrollLocked) {
          lenis.scrollTo(0, { immediate: true });
        }
        lenis.raf(time);
        if (time - lastTime >= 16) {
          lastTime = time;
          rafId = requestAnimationFrame(raf);
        } else {
          rafId = requestAnimationFrame(raf);
        }
      }

      rafId = requestAnimationFrame(raf);
      
      // Refresh ScrollTrigger after layout is stable
      const refreshTimeout = setTimeout(() => {
        ScrollTrigger.refresh();
        // Ensure scroll is still at top after refresh
        lenis.scrollTo(0, { immediate: true });
        window.scrollTo(0, 0);
      }, 200);
      
      return () => {
        clearTimeout(lockTimeout);
        clearTimeout(refreshTimeout);
        cancelAnimationFrame(rafId);
        lenis.destroy();
      };
    }, 50);

    return () => clearTimeout(initTimeout);
  }, [loading]);

  return (
    <>
      {loading && <Preloader onComplete={() => setLoading(false)} />}
      
      {/* Always render content - it's behind preloader during loading */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navigation />
        <LanguageSidebar />
        <EmailButton />

        {/* Main Content Wrapper */}
        <div className="relative z-10 bg-[#E3E1DC] shadow-[0_50px_100px_rgba(0,0,0,0.5)] mb-[100vh]">
        <Hero />
        <Intro />
        <ServiceStack />
        <CleaningServices />
        <Portfolio />
        
        {/* Final Text Section */}
        <section className="py-40 bg-[#E3E1DC] text-center flex flex-col items-center justify-center">
          <h2 className="font-display text-3xl md:text-5xl mb-8">
            {t.final.title}
          </h2>
          <div className="max-w-xl text-gray-600 font-light mb-12 leading-relaxed px-6">
            {t.final.text}
          </div>
          {/* Switzerland Flag */}
          <div className="w-16 h-16 md:w-20 md:h-20 mb-8">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <rect x="0" y="0" width="100" height="100" fill="white" />
              <rect x="0" y="40" width="100" height="20" fill="black" />
              <rect x="40" y="0" width="20" height="100" fill="black" />
            </svg>
          </div>
          <div className="h-16 w-px bg-black/20"></div>
        </section>
        </div>

        <Footer />
      </div>
    </>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;