import React, { useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const PrivacyPolicy: React.FC = () => {
  const { t } = useLanguage();

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <section className="min-h-screen py-24 px-6 md:px-20 bg-[#E3E1DC]" id="privacy">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-4xl md:text-6xl mb-8 text-center">
          {t.privacy?.title || 'Privacy Policy'}
        </h1>
        
        <div className="text-sm text-gray-600 mb-8 text-center">
          {t.privacy?.lastUpdated || 'Last Updated:'} {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>

        <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
          <div>
            <h2 className="font-display text-2xl md:text-3xl mb-4 mt-8">
              {t.privacy?.introduction?.title || 'Introduction'}
            </h2>
            <p className="leading-relaxed">
              {t.privacy?.introduction?.text || 'DANIELBAU ("we", "our", "us") uses Facebook Graph API to display content from our Facebook business page on our website (www.dani-bau.ch).'}
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl md:text-3xl mb-4 mt-8">
              {t.privacy?.dataCollection?.title || 'Data Collection'}
            </h2>
            <ul className="list-disc pl-6 space-y-2 leading-relaxed">
              <li>{t.privacy?.dataCollection?.item1 || 'We fetch public photos and videos from our Facebook business page'}</li>
              <li>{t.privacy?.dataCollection?.item2 || 'We do not collect any personal information from users'}</li>
              <li>{t.privacy?.dataCollection?.item3 || 'We do not store any user data'}</li>
              <li>{t.privacy?.dataCollection?.item4 || 'We only access our own business page\'s public content'}</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl md:text-3xl mb-4 mt-8">
              {t.privacy?.dataUsage?.title || 'How We Use Data'}
            </h2>
            <ul className="list-disc pl-6 space-y-2 leading-relaxed">
              <li>{t.privacy?.dataUsage?.item1 || 'Photos and videos from our Facebook page are displayed in our website\'s portfolio section'}</li>
              <li>{t.privacy?.dataUsage?.item2 || 'Content is cached for 1 hour to improve website performance'}</li>
              <li>{t.privacy?.dataUsage?.item3 || 'No data is shared with third parties'}</li>
              <li>{t.privacy?.dataUsage?.item4 || 'No data is used for advertising or marketing purposes'}</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl md:text-3xl mb-4 mt-8">
              {t.privacy?.dataStorage?.title || 'Data Storage'}
            </h2>
            <ul className="list-disc pl-6 space-y-2 leading-relaxed">
              <li>{t.privacy?.dataStorage?.item1 || 'Content is temporarily cached (1 hour) for performance'}</li>
              <li>{t.privacy?.dataStorage?.item2 || 'No permanent storage of user data'}</li>
              <li>{t.privacy?.dataStorage?.item3 || 'No database storage of Facebook content'}</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl md:text-3xl mb-4 mt-8">
              {t.privacy?.userRights?.title || 'Your Rights'}
            </h2>
            <ul className="list-disc pl-6 space-y-2 leading-relaxed">
              <li>{t.privacy?.userRights?.item1 || 'All displayed content is from our public Facebook page'}</li>
              <li>{t.privacy?.userRights?.item2 || 'You can view our Facebook page directly on Facebook'}</li>
              <li>{t.privacy?.userRights?.item3 || 'No personal data is collected, so no data deletion requests are needed'}</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl md:text-3xl mb-4 mt-8">
              {t.privacy?.contact?.title || 'Contact'}
            </h2>
            <p className="leading-relaxed">
              {t.privacy?.contact?.text || 'If you have questions about this privacy policy, please contact us at:'} {' '}
              <a href="mailto:danielbau@mail.ch" className="text-[#121212] underline hover:text-blue-600">
                danielbau@mail.ch
              </a>
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl md:text-3xl mb-4 mt-8">
              {t.privacy?.facebookIntegration?.title || 'Facebook Integration'}
            </h2>
            <p className="leading-relaxed">
              {t.privacy?.facebookIntegration?.text || 'This website uses Facebook Graph API to display content from our Facebook page. By using Facebook\'s services, you are also subject to Facebook\'s Privacy Policy.'} {' '}
              <a 
                href="https://www.facebook.com/privacy/explanation" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#121212] underline hover:text-blue-600"
              >
                {t.privacy?.facebookIntegration?.link || 'View Facebook\'s Privacy Policy'}
              </a>
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-300 text-center">
          <a 
            href="#contact" 
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: 'smooth'
              });
            }}
            className="text-[#121212] underline hover:text-blue-600"
          >
            {t.privacy?.backToSite || '← Back to Site'}
          </a>
        </div>
      </div>
    </section>
  );
};

export default PrivacyPolicy;
