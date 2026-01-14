import React from 'react';

const OfficeMap: React.FC = () => {
  const offices = [
    {
      name: 'Main Office',
      address: 'Rheistrasse 3, 4410 Liestal',
      embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2708.5!2d7.7344!3d47.4844!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDfCsDI5JzA0LjAiTiA3wrA0NCcwMy44IkU!5e0!3m2!1sen!2sch!4v1234567890'
    },
    {
      name: 'Second Office',
      address: 'Fluhrweg 16, 3250 Lyss',
      embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2708.5!2d7.3069!3d47.0744!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDfCsDA0JzI3LjgiTiA3wrAxOCcyNC44IkU!5e0!3m2!1sen!2sch!4v1234567890'
    }
  ];

  // Create a combined map showing both locations
  const combinedMapUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2708.5!2d7.52065!3d47.2794!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDfCsDE2JzQ1LjgiTiA3wrAzMScxNC4zIkU!5e0!3m2!1sen!2sch!4v1234567890';

  return (
    <section className="py-16 px-6 md:px-20 bg-[#E3E1DC]">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="font-display text-4xl md:text-6xl mb-8 text-center text-gray-800">
          OUR OFFICES
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/50 p-6 rounded-lg border border-gray-300">
            <h3 className="font-bold text-lg mb-2 text-gray-800">Main Office</h3>
            <p className="text-gray-600">Rheistrasse 3</p>
            <p className="text-gray-600">4410 Liestal</p>
            <a 
              href="https://www.google.com/maps/search/?api=1&query=Rheistrasse+3,+4410+Liestal" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Open in Google Maps →
            </a>
          </div>
          <div className="bg-white/50 p-6 rounded-lg border border-gray-300">
            <h3 className="font-bold text-lg mb-2 text-gray-800">Second Office</h3>
            <p className="text-gray-600">Fluhrweg 16</p>
            <p className="text-gray-600">3250 Lyss</p>
            <a 
              href="https://www.google.com/maps/search/?api=1&query=Fluhrweg+16,+3250+Lyss" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Open in Google Maps →
            </a>
          </div>
        </div>
        <div className="w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden border border-gray-300 shadow-lg">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2708.5!2d7.52065!3d47.2794!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDfCsDE2JzQ1LjgiTiA3wrAzMScxNC4zIkU!5e0!3m2!1sen!2sch!4v1234567890"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="DANIELBAU Offices Map"
          />
        </div>
      </div>
    </section>
  );
};

export default OfficeMap;
