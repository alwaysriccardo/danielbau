import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useLanguage } from '../contexts/LanguageContext';

const Navigation: React.FC = () => {
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOverDarkBg, setIsOverDarkBg] = useState(true); // Start true since hero is dark
  const logoRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Detect when navigation is over dark background (hero, services, footer)
  useEffect(() => {
    const checkBackground = () => {
      if (!navRef.current) return;
      
      const navY = navRef.current.getBoundingClientRect().top + 40; // Nav center point
      let isOverDark = false;
      
      // Check hero section (first section, typically dark)
      const heroSection = document.querySelector('section:first-of-type');
      if (heroSection) {
        const heroRect = heroSection.getBoundingClientRect();
        if (navY >= heroRect.top && navY <= heroRect.bottom) {
          isOverDark = true;
        }
      }
      
      // Check services section (dark background #121212)
      const servicesSection = document.getElementById('services');
      if (servicesSection) {
        const servicesRect = servicesSection.getBoundingClientRect();
        if (navY >= servicesRect.top && navY <= servicesRect.bottom) {
          isOverDark = true;
        }
      }
      
      // Check footer (dark background #111)
      const footer = document.getElementById('contact');
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        if (navY >= footerRect.top && navY <= footerRect.bottom) {
          isOverDark = true;
        }
      }
      
      setIsOverDarkBg(isOverDark);
    };

    // Check on mount
    checkBackground();
    
    // Throttle scroll events for better performance
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          checkBackground();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    // Throttle resize events
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        checkBackground();
      }, 150);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  // Shine effect removed for cleaner look

  const textColor = isOverDarkBg ? 'text-white' : 'text-[#121212]';
  const borderColor = isOverDarkBg ? 'border-white/30' : 'border-[#121212]/30';
  const hoverColor = isOverDarkBg ? 'hover:text-blue-400' : 'hover:text-blue-600';

  return (
    <>
      <nav ref={navRef} className="fixed top-0 w-full p-8 flex justify-between items-center z-50" style={{ willChange: 'transform' }}>
        <div ref={logoRef} className={`font-display font-bold text-xl tracking-tighter z-[60] danielbau-logo ${textColor}`} style={{
          willChange: 'transform'
        }}>DANIELBAU</div>
        
        {/* Desktop Menu */}
        <nav className={`hidden md:flex gap-10 text-xs uppercase tracking-widest ${textColor}`} aria-label="Main navigation">
          <a href="#services" className={`${hoverColor} transition-colors`} aria-label={t.nav.services}>
            {t.nav.services}
          </a>
          <a href="#about" className={`${hoverColor} transition-colors`} aria-label={t.nav.about}>
            {t.nav.about}
          </a>
          <a 
            href="#contact" 
            onClick={(e) => {
              e.preventDefault();
              const footer = document.getElementById('contact');
              if (footer) {
                // Use scrollTo for better compatibility with fixed elements
                window.scrollTo({
                  top: document.documentElement.scrollHeight,
                  behavior: 'auto'
                });
              }
            }}
            className={`${hoverColor} transition-colors`} 
            aria-label={t.nav.contact}
          >
            {t.nav.contact}
          </a>
        </nav>

        {/* Mobile Menu Button - More Visible and Bolder */}
        <button 
          onClick={toggleMenu} 
          className={`md:hidden font-display text-lg font-extrabold z-[60] relative px-4 py-2 bg-transparent rounded border-2 ${borderColor} shadow-lg ${textColor}`}
          style={{
            fontWeight: 900
          }}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? 'CLOSE' : 'MENU'}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-[#121212] z-[55] flex flex-col justify-center items-center gap-8 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
          isMenuOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
        aria-hidden={!isMenuOpen}
      >
        {/* Close Button (X) */}
        <button
          onClick={toggleMenu}
          className="absolute top-8 right-8 text-white hover:text-blue-400 transition-colors z-60"
          aria-label="Close menu"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="32" 
            height="32" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <a 
          href="#services" 
          onClick={toggleMenu}
          className="font-display text-4xl text-white hover:text-blue-500 transition-colors"
        >
          {t.nav.services}
        </a>
        <a 
          href="#about" 
          onClick={toggleMenu}
          className="font-display text-4xl text-white hover:text-blue-500 transition-colors"
        >
          {t.nav.about}
        </a>
        <a 
          href="#contact" 
          onClick={(e) => {
            e.preventDefault();
            toggleMenu();
            setTimeout(() => {
              window.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: 'auto'
              });
            }, 300); // Wait for menu to close
          }}
          className="font-display text-4xl text-white hover:text-blue-500 transition-colors"
        >
          {t.nav.contact}
        </a>
        
        <div className="absolute bottom-10 text-white/30 text-xs uppercase tracking-widest">
           Danielbau Schweiz
        </div>
      </div>
    </>
  );
};

export default Navigation;