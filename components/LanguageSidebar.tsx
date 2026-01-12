import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../translations';

const LanguageSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage } = useLanguage();

  const languages: { code: Language; label: string }[] = [
    { code: 'de', label: 'DE' },
    { code: 'en', label: 'EN' },
    { code: 'fr', label: 'FR' },
    { code: 'it', label: 'IT' },
  ];

  return (
    <div 
      className="fixed right-6 top-1/2 -translate-y-1/2 z-[9999] flex flex-col items-end gap-2 group"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Active Language Pill */}
      <div className="bg-[#121212] text-white px-3 py-4 rounded-full shadow-xl cursor-pointer hover:bg-black transition-all flex flex-col items-center gap-1 min-w-[3rem] border border-white/10">
        <span className="text-xs font-bold tracking-widest">{language.toUpperCase()}</span>
        <div className="w-1 h-1 bg-white rounded-full opacity-50"></div>
      </div>

      {/* Dropdown / Slideout options */}
      <div 
        className={`flex flex-col gap-2 transition-all duration-300 origin-top-right ${
          isOpen ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-4 scale-90 pointer-events-none'
        }`}
      >
        {languages
          .filter(l => l.code !== language)
          .map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className="bg-white/90 backdrop-blur-md text-[#121212] w-[3rem] h-[3rem] rounded-full shadow-lg hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center text-xs font-bold tracking-widest"
            >
              {lang.label}
            </button>
          ))}
      </div>
    </div>
  );
};

export default LanguageSidebar;