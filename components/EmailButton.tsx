import React from 'react';

const EmailButton: React.FC = () => {
  return (
    <a
      href="mailto:zitat@danielbau.de"
      className="fixed bottom-8 right-6 z-[90] group"
      aria-label="Email us"
    >
      <div className="bg-[#E3E1DC] border-2 border-[#121212] w-14 h-14 rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_4px_20px_rgba(18,18,18,0.3)]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#121212"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
    </a>
  );
};

export default EmailButton;
