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
  const [contentReady, setContentReady] = useState(false);
  const { t } = useLanguage();

  // Ensure scroll is at top when loading completes
  useEffect(() => {
    if (!loading) {
      // Force scroll to top immediately
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Wait a frame for content to be ready, then show it
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setContentReady(true);
        });
      });
    }
  }, [loading]);

  useEffect(() => {
    // Only initialize Lenis after content is ready
    if (!contentReady) return;

    const lenis = new Lenis({
      duration: 1.0,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 0.8,
      touchMultiplier: 1.5,
    });

    // Ensure scroll position is at top
    lenis.scrollTo(0, { immediate: true });

    let rafId: number;
    let lastTime = 0;
    function raf(time: number) {
      lenis.raf(time);
      if (time - lastTime >= 16) {
        lastTime = time;
        rafId = requestAnimationFrame(raf);
      } else {
        rafId = requestAnimationFrame(raf);
      }
    }

    rafId = requestAnimationFrame(raf);
    
    // Refresh ScrollTrigger after a short delay to ensure layout is calculated
    const refreshTimeout = setTimeout(() => {
      ScrollTrigger.refresh();
      // Ensure scroll is still at top after refresh
      lenis.scrollTo(0, { immediate: true });
    }, 150);
    
    return () => {
      clearTimeout(refreshTimeout);
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [contentReady]);

  // Ensure body overflow is enabled when loading completes
  useEffect(() => {
    if (!loading && contentReady) {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.pointerEvents = 'auto';
      document.body.classList.add('loaded');
    } else {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.classList.remove('loaded');
    }
  }, [loading, contentReady]);

  return (
    <>
      {loading && <Preloader onComplete={() => setLoading(false)} />}
      
      {/* Render content immediately but keep it hidden until ready */}
      <div 
        className={contentReady ? 'opacity-100' : 'opacity-0'} 
        style={{ 
          visibility: contentReady ? 'visible' : 'hidden',
          transition: contentReady ? 'opacity 0.3s ease' : 'none'
        }}
      >
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