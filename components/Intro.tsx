import React from 'react';
import SplitText from './SplitText';
import { useLanguage } from '../contexts/LanguageContext';

const Intro: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="py-32 px-6 md:px-20 grid md:grid-cols-2 gap-16 max-w-[1800px] mx-auto bg-[#E3E1DC]" id="about">
      <div>
        <SplitText tag="h2" className="font-display text-4xl md:text-5xl leading-tight">
          {t.intro.title}
        </SplitText>
      </div>
      <div className="text-xl font-light leading-relaxed text-gray-700">
        <SplitText tag="p" className="mb-8">
          {t.intro.text}
        </SplitText>
        
        <div className="h-px w-full bg-black/10 my-8" />
        
        <div className="flex gap-12 text-sm uppercase tracking-widest">
          <SplitText>{t.intro.since}</SplitText>
          <SplitText>{t.intro.location}</SplitText>
        </div>
      </div>
    </section>
  );
};

export default Intro;