import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../translations';

const LanguageSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const languages: { code: Language; label: string }[] = [
    { code: 'de', label: 'DE' },
    { code: 'en', label: 'EN' },
    { code: 'fr', label: 'FR' },
    { code: 'it', label: 'IT' },
  ];

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleLanguageSelect = (code: Language) => {
    setLanguage(code);
    setIsOpen(false);
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    // Small delay before closing on mouse leave to prevent accidental closes
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  return (
    <div 
      ref={containerRef}
      className="fixed right-6 top-28 md:top-32 z-[9999] flex flex-col items-end gap-2"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Active Language Pill - Now clickable */}
      <button
        onClick={handleToggle}
        className="bg-[#121212] text-white px-3 py-4 rounded-full shadow-xl cursor-pointer hover:bg-black transition-colors flex flex-col items-center gap-1 min-w-[3rem] border border-white/10 active:scale-95"
      >
        <span className="text-xs font-bold tracking-widest">{language.toUpperCase()}</span>
        <div className={`w-1 h-1 bg-white rounded-full transition-opacity ${isOpen ? 'opacity-100' : 'opacity-50'}`}></div>
      </button>

      {/* Dropdown options */}
      <div 
        className={`flex flex-col gap-2 transition-all duration-200 origin-top-right ${
          isOpen ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-2 scale-95 pointer-events-none'
        }`}
      >
        {languages
          .filter(l => l.code !== language)
          .map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code)}
              className="bg-white/95 text-[#121212] w-[3rem] h-[3rem] rounded-full shadow-lg hover:bg-[#121212] hover:text-white transition-colors flex items-center justify-center text-xs font-bold tracking-widest active:scale-95"
            >
              {lang.label}
            </button>
          ))}
      </div>
    </div>
  );
};

export default LanguageSidebar;