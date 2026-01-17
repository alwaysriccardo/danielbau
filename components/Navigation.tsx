import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useLanguage } from '../contexts/LanguageContext';

const Navigation: React.FC = () => {
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Shine effect removed for cleaner look

  return (
    <>
      <nav className="fixed top-0 w-full p-8 flex justify-between items-center z-50" style={{ willChange: 'transform' }}>
        <div ref={logoRef} className="font-display font-bold text-xl tracking-tighter z-[60] danielbau-logo text-[#121212]" style={{
          textShadow: '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.5)',
          willChange: 'transform'
        }}>DANIELBAU</div>
        
        {/* Desktop Menu */}
        <nav className="hidden md:flex gap-10 text-xs uppercase tracking-widest text-[#121212]" aria-label="Main navigation" style={{ textShadow: '0 0 8px rgba(255,255,255,0.8), 0 0 16px rgba(255,255,255,0.5)' }}>
          <a href="#services" className="hover:text-blue-600 transition-colors" aria-label={t.nav.services}>
            {t.nav.services}
          </a>
          <a href="#about" className="hover:text-blue-600 transition-colors" aria-label={t.nav.about}>
            {t.nav.about}
          </a>
          <a href="#portfolio" className="hover:text-blue-600 transition-colors" aria-label={t.nav.portfolio}>
            {t.nav.portfolio}
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
                  behavior: 'smooth'
                });
              }
            }}
            className="hover:text-blue-600 transition-colors" 
            aria-label={t.nav.contact}
          >
            {t.nav.contact}
          </a>
        </nav>

        {/* Mobile Menu Button - More Visible and Bolder */}
        <button 
          onClick={toggleMenu} 
          className="md:hidden font-display text-lg font-extrabold z-[60] relative px-4 py-2 bg-white/90 backdrop-blur-sm rounded border-2 border-[#121212]/20 shadow-lg text-[#121212]"
          style={{
            fontWeight: 900,
            textShadow: '0 1px 2px rgba(255,255,255,0.5)'
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
          href="#portfolio" 
          onClick={toggleMenu}
          className="font-display text-4xl text-white hover:text-blue-500 transition-colors"
        >
          {t.nav.portfolio}
        </a>
        <a 
          href="#contact" 
          onClick={(e) => {
            e.preventDefault();
            toggleMenu();
            setTimeout(() => {
              window.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: 'smooth'
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