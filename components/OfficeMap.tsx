import React from 'react';

const OfficeMap: React.FC = () => {
  // Combined map URL showing both locations
  // Using a map that shows both addresses
  const mapUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2708.5!2d7.52065!3d47.2794!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDfCsDE2JzQ1LjgiTiA3wrAzMScxNC4zIkU!5e0!3m2!1sen!2sch!4v1234567890&q=Rheinstrasse+3,+4410+Liestal+Switzerland|Fluhrweg+16,+3250+Lyss+Switzerland';

  return (
    <section className="py-8 px-6 bg-[#E3E1DC]">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
          {/* Office Addresses */}
          <div className="flex flex-col md:flex-row gap-6 text-sm text-gray-700">
            <div className="text-center md:text-left">
              <p className="font-semibold mb-1">Main Office</p>
              <p>4410 Liestal</p>
              <p>Rheinstrasse 3</p>
            </div>
            <div className="text-center md:text-left">
              <p className="font-semibold mb-1">Second Office</p>
              <p>3250 Lyss</p>
              <p>Fluhrweg 16</p>
            </div>
          </div>
          
          {/* Small Square Map */}
          <div className="w-full md:w-[400px] h-[400px] rounded-lg overflow-hidden border border-gray-300 shadow-lg flex-shrink-0">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2708.5!2d7.52065!3d47.2794!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDfCsDE2JzQ1LjgiTiA3wrAzMScxNC4zIkU!5e0!3m2!1sen!2sch!4v1234567890&q=Rheinstrasse+3,+4410+Liestal+Switzerland|Fluhrweg+16,+3250+Lyss+Switzerland"
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
      </div>
    </section>
  );
};

export default OfficeMap;
