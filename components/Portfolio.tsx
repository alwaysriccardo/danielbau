import React, { useEffect, useState, useRef } from 'react';
import { PortfolioItem } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const Portfolio: React.FC = () => {
  const { t } = useLanguage();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'photo' | 'video'>('all');
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/facebook-portfolio');
        
        const data = await response.json();
        
        if (!response.ok) {
          // Show detailed error message
          const errorMsg = data.details || data.error || 'Failed to fetch portfolio';
          throw new Error(errorMsg);
        }
        
        // Check if data is an array (success) or error object
        if (Array.isArray(data)) {
          setItems(data);
        } else {
          throw new Error(data.error || 'Invalid response from API');
        }
      } catch (err) {
        console.error('Error fetching portfolio:', err);
        setError(err instanceof Error ? err.message : 'Failed to load portfolio');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  const filteredItems = filter === 'all' 
    ? items 
    : items.filter(item => item.type === filter);

  const openLightbox = (item: PortfolioItem) => {
    setSelectedItem(item);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedItem(null);
    document.body.style.overflow = '';
  };

  // Close lightbox on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedItem) {
        closeLightbox();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedItem]);

  if (loading) {
    return (
      <section ref={sectionRef} className="py-24 px-6 md:px-20 bg-[#E3E1DC]">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-gray-600">Loading portfolio...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section ref={sectionRef} className="py-24 px-6 md:px-20 bg-[#E3E1DC]">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-red-600 mb-4">Error: {error}</div>
          <div className="text-sm text-gray-600">
            Please check that Facebook API credentials are configured correctly.
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section ref={sectionRef} className="py-24 px-6 md:px-20 bg-[#E3E1DC]">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-gray-600">No portfolio items found.</div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section ref={sectionRef} className="py-24 px-6 md:px-20 bg-[#E3E1DC]" id="portfolio">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-widest mb-4 opacity-50">
              {t.portfolio?.subheader || 'PORTFOLIO'}
            </div>
            <h2 className="font-display text-4xl md:text-6xl mb-4">
              {t.portfolio?.header || 'Our Work'}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              {t.portfolio?.description || 'Recent projects and completed work'}
            </p>
            
            {/* Filter Buttons */}
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-2 text-sm uppercase tracking-widest transition-colors ${
                  filter === 'all'
                    ? 'bg-[#121212] text-white'
                    : 'bg-white/50 text-[#121212] hover:bg-white/70'
                }`}
              >
                All ({items.length})
              </button>
              <button
                onClick={() => setFilter('photo')}
                className={`px-6 py-2 text-sm uppercase tracking-widest transition-colors ${
                  filter === 'photo'
                    ? 'bg-[#121212] text-white'
                    : 'bg-white/50 text-[#121212] hover:bg-white/70'
                }`}
              >
                Photos ({items.filter(i => i.type === 'photo').length})
              </button>
              <button
                onClick={() => setFilter('video')}
                className={`px-6 py-2 text-sm uppercase tracking-widest transition-colors ${
                  filter === 'video'
                    ? 'bg-[#121212] text-white'
                    : 'bg-white/50 text-[#121212] hover:bg-white/70'
                }`}
              >
                Videos ({items.filter(i => i.type === 'video').length})
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden bg-[#1a1a1a] aspect-square cursor-pointer"
                onClick={() => openLightbox(item)}
              >
                {item.type === 'photo' ? (
                  <img
                    src={item.thumbnail}
                    alt={item.caption || 'Portfolio item'}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <img
                      src={item.thumbnail}
                      alt={item.caption || 'Video thumbnail'}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
                      <svg
                        className="w-16 h-16 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white text-sm">
                      {item.caption.length > 100
                        ? `${item.caption.substring(0, 100)}...`
                        : item.caption}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-[101] p-2"
            aria-label="Close"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          
          <div
            className="max-w-7xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedItem.type === 'photo' ? (
              <img
                src={selectedItem.fullSize || selectedItem.thumbnail}
                alt={selectedItem.caption || 'Portfolio image'}
                className="max-w-full max-h-[90vh] mx-auto object-contain"
              />
            ) : (
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                {selectedItem.fullSize ? (
                  <video
                    src={selectedItem.fullSize}
                    controls
                    className="absolute inset-0 w-full h-full object-contain"
                    autoPlay
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
                    <a
                      href={selectedItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg underline hover:text-blue-400"
                    >
                      Watch on Facebook →
                    </a>
                  </div>
                )}
              </div>
            )}
            
            {selectedItem.caption && (
              <div className="mt-4 text-white text-center max-w-3xl mx-auto">
                <p className="text-lg">{selectedItem.caption}</p>
              </div>
            )}
            
            <div className="mt-4 text-center">
              <a
                href={selectedItem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white text-sm underline"
              >
                View on Facebook →
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Portfolio;
