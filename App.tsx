import React, { useEffect, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import Preloader from './components/Preloader';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Intro from './components/Intro';
import ServiceStack from './components/ServiceStack';
import CleaningServices from './components/CleaningServices';
import Testimonials from './components/Testimonials';
import Portfolio from './components/Portfolio';
import PrivacyPolicy from './components/PrivacyPolicy';
import Footer from './components/Footer';
import LanguageSidebar from './components/LanguageSidebar';
import ContactButtons from './components/ContactButtons';
import PromoPopup from './components/PromoPopup';

const AppContent = () => {
  const [loading, setLoading] = useState(true);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showPromo, setShowPromo] = useState(false);
  const { t } = useLanguage();

  // Check for privacy hash in URL
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#privacy') {
        setShowPrivacy(true);
      } else {
        setShowPrivacy(false);
      }
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

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

      // Show promo popup after 3 seconds
      const promoTimer = setTimeout(() => {
        setShowPromo(true);
      }, 3000);

      return () => clearTimeout(promoTimer);
    } else {
      // During loading, keep body fixed
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.classList.remove('loaded');
      document.body.style.backgroundColor = '#000';
    }
  }, [loading]);

  useEffect(() => {
    // Only initialize ScrollTrigger after loading completes
    if (loading) return;
    
    // Optimize ScrollTrigger for maximum performance
    ScrollTrigger.config({
      autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load',
      ignoreMobileResize: true,
      refreshPriority: -1,
      limitCallbacks: true,
      // Add these for better performance
      anticipatePin: 1,
      syncInterval: 0.1
    });
    
    // Batch refresh after initialization
    const refreshTimeout = setTimeout(() => {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    }, 500);
      
    return () => {
      clearTimeout(refreshTimeout);
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

        {showPromo && <PromoPopup onClose={() => setShowPromo(false)} />}

        {showPrivacy ? (
          <PrivacyPolicy />
        ) : (
          <>
        {/* Main Content Wrapper */}
        <div className="relative z-10 bg-[#E3E1DC] shadow-[0_20px_40px_rgba(0,0,0,0.2)] mb-[100vh]">
        <Hero />
        <Intro />
        <ServiceStack />
        <CleaningServices />
        <Testimonials />
            <Portfolio />
        
        {/* Final Text Section */}
            <section className="pt-12 md:pt-16 pb-8 bg-[#E3E1DC] text-center flex flex-col items-center justify-center">
          <h2 className="font-display text-3xl md:text-5xl mb-8">
            {t.final.title}
          </h2>
          <div className="max-w-xl text-gray-600 font-light mb-12 leading-relaxed px-6">
            {t.final.text}
          </div>
          {/* Switzerland Flag */}
          <div className="w-16 h-16 md:w-20 md:h-20 mb-8">
            <svg viewBox="0 0 100 100" className="w-full h-full">
                  {/* Red background */}
                  <rect x="0" y="0" width="100" height="100" fill="#FF0000" />
                  {/* White cross - vertical arm */}
                  <rect x="40" y="20" width="20" height="60" fill="white" />
                  {/* White cross - horizontal arm */}
                  <rect x="20" y="40" width="60" height="20" fill="white" />
            </svg>
          </div>
          <div className="h-16 w-px bg-black/20"></div>
        </section>
        </div>

        <Footer />
          </>
        )}
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