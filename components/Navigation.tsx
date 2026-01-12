import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Navigation: React.FC = () => {
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      <nav className="fixed top-0 w-full p-8 flex justify-between items-center z-50 mix-blend-difference text-white">
        <div className="font-display font-bold text-xl tracking-tighter z-[60]">DANIELBAU</div>
        
        {/* Desktop Menu */}
        <nav className="hidden md:flex gap-10 text-xs uppercase tracking-widest" aria-label="Main navigation">
          <a href="#services" className="hover:text-blue-400 transition-colors" aria-label={t.nav.services}>
            {t.nav.services}
          </a>
          <a href="#about" className="hover:text-blue-400 transition-colors" aria-label={t.nav.about}>
            {t.nav.about}
          </a>
          <a href="#contact" className="hover:text-blue-400 transition-colors" aria-label={t.nav.contact}>
            {t.nav.contact}
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          onClick={toggleMenu} 
          className="md:hidden font-display text-sm z-[60] relative"
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
          href="#contact" 
          onClick={toggleMenu}
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