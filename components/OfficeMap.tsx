import React from 'react';

const OfficeMap: React.FC = () => {
  const mapUrl = 'https://www.google.com/maps?q=Geschwister-Scholl-Stra%C3%9Fe+3,+02727+Ebersbach-Neugersdorf,+Germany&z=15&output=embed';

  return (
    <section className="py-8 px-6 bg-[#E3E1DC]">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
          {/* Office Addresses */}
          <div className="flex flex-col md:flex-row gap-6 text-sm text-gray-700">
            <div className="text-center md:text-left">
              <p className="font-semibold mb-1">Office</p>
              <p>Geschwister-Scholl-Straße 3</p>
              <p>02727 Ebersbach-Neugersdorf</p>
            </div>
          </div>
          
          {/* Small Square Map */}
          <div className="w-full md:w-[400px] h-[400px] rounded-lg overflow-hidden border border-gray-300 shadow-lg flex-shrink-0">
            <iframe
              src="https://www.google.com/maps?q=Geschwister-Scholl-Stra%C3%9Fe+3,+02727+Ebersbach-Neugersdorf,+Germany&z=15&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="PROBAU Office Map"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default OfficeMap;
