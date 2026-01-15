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

  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.8, // Further reduced for better performance
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 0.7, // Further reduced for better performance
      touchMultiplier: 1.2,
      syncTouch: false, // Disable touch sync for better performance
    });

    let rafId: number;
    let lastTime = 0;
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;
    
    function raf(time: number) {
      lenis.raf(time);
      // Throttle to target FPS
      const elapsed = time - lastTime;
      if (elapsed >= frameInterval) {
        lastTime = time - (elapsed % frameInterval);
        rafId = requestAnimationFrame(raf);
      } else {
        rafId = requestAnimationFrame(raf);
      }
    }

    rafId = requestAnimationFrame(raf);

    if (loading) {
      lenis.stop();
    } else {
      // Start Lenis immediately when loading is false
      lenis.start();
      // Enable scrolling immediately
      document.body.style.overflow = '';
      
      // Debounced ScrollTrigger refresh
      const refreshTimeout = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);
      
      return () => {
        clearTimeout(refreshTimeout);
        cancelAnimationFrame(rafId);
        lenis.destroy();
      };
    }

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [loading]);

  // Ensure body overflow is enabled when loading completes
  useEffect(() => {
    if (!loading) {
      document.body.style.overflow = '';
      // Force enable scrolling immediately
      document.documentElement.style.overflow = '';
      document.body.style.pointerEvents = 'auto';
    } else {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }
  }, [loading]);

  return (
    <>
      {loading && <Preloader onComplete={() => setLoading(false)} />}
      
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