import React, { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import Preloader from './components/Preloader';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Intro from './components/Intro';
import ServiceStack from './components/ServiceStack';
import CleaningServices from './components/CleaningServices';
import Portfolio from './components/Portfolio';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import LanguageSidebar from './components/LanguageSidebar';
import ContactButtons from './components/ContactButtons';

const AppContent = () => {
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  // Handle preloader completion
  useEffect(() => {
    if (!loading) {
      // Set background color immediately to prevent white flash
      document.body.style.backgroundColor = '#E3E1DC';
      
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
      
      // Enable scrolling immediately
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.pointerEvents = 'auto';
    } else {
      // During loading, keep body fixed
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.classList.remove('loaded');
      document.body.style.backgroundColor = '#000';
    }
  }, [loading]);

  useEffect(() => {
    // Only continue after loading completes
    if (loading) return;

    // Check if desktop - enable smooth scrolling on desktop only, native on mobile
    const isDesktop = window.innerWidth >= 768;
    
    let lenis: Lenis | null = null;
    let rafId: number | undefined;
    
    if (isDesktop) {
      // Initialize Lenis on desktop with optimized settings for responsive, fast scrolling
      lenis = new Lenis({
        duration: 1.2, // Slightly faster duration for more responsive feel
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Smooth easing
        direction: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0, // Normal multiplier for responsive scrolling
        touchMultiplier: 1.5, // Lower for mobile (though not used on desktop)
        gestureDirection: 'vertical',
        infinite: false,
      });

      // Force scroll to top immediately
      lenis.scrollTo(0, { immediate: true });
      
      // Smooth RAF loop for lag-free scrolling
      function raf(time: number) {
        if (lenis) lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }

      rafId = requestAnimationFrame(raf);
      
      // Sync ScrollTrigger with Lenis for smooth animations
      lenis.on('scroll', ScrollTrigger.update);
    }
    
    // Optimize ScrollTrigger globally for smooth performance
    ScrollTrigger.config({
      autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load',
      ignoreMobileResize: true, // Ignore mobile resize for better performance
      refreshPriority: -1, // Lower refresh priority
      limitCallbacks: true // Limit callback frequency
    });
    
    // Refresh ScrollTrigger after a brief delay to allow Hero parallax to initialize
    const refreshTimeout = setTimeout(() => {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        // Ensure scroll is still at top after refresh
        if (lenis) {
          lenis.scrollTo(0, { immediate: true });
        }
        window.scrollTo(0, 0);
      });
    }, 300); // Brief delay for Hero parallax
      
    return () => {
      clearTimeout(refreshTimeout);
      if (rafId) cancelAnimationFrame(rafId);
      if (lenis) lenis.destroy();
    };
  }, [loading]);

  return (
    <>
      {loading && <Preloader onComplete={() => setLoading(false)} />}
      
      {/* Always render content - it's behind preloader during loading */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navigation />
        <LanguageSidebar />
        <ContactButtons />

        {/* Main Content Wrapper */}
        <div className="relative z-10 bg-[#E3E1DC] shadow-[0_20px_40px_rgba(0,0,0,0.2)] mb-[100vh]">
        <Hero />
        <Intro />
        <ServiceStack />
        <CleaningServices />
        <Portfolio />
        <Testimonials />
        
        {/* Final Text Section */}
        <section className="pt-12 md:pt-16 pb-40 bg-[#E3E1DC] text-center flex flex-col items-center justify-center">
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