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
  const [currentIndex, setCurrentIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

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

  const openLightbox = (item: PortfolioItem, index?: number) => {
    setSelectedItem(item);
    if (index !== undefined) {
      setCurrentIndex(index);
    } else {
      const itemIndex = filteredItems.findIndex(i => i.id === item.id);
      setCurrentIndex(itemIndex >= 0 ? itemIndex : 0);
    }
    document.body.style.overflow = 'hidden';
  };

  const navigateCarousel = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      const newIndex = currentIndex > 0 ? currentIndex - 1 : filteredItems.length - 1;
      setCurrentIndex(newIndex);
      setSelectedItem(filteredItems[newIndex]);
    } else {
      const newIndex = currentIndex < filteredItems.length - 1 ? currentIndex + 1 : 0;
      setCurrentIndex(newIndex);
      setSelectedItem(filteredItems[newIndex]);
    }
  };

  const closeLightbox = () => {
    setSelectedItem(null);
    document.body.style.overflow = '';
  };

  // Close lightbox on escape key and navigate with arrow keys
  useEffect(() => {
    if (!selectedItem) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft' && filteredItems.length > 1) {
        e.preventDefault();
        const newIndex = currentIndex > 0 ? currentIndex - 1 : filteredItems.length - 1;
        setCurrentIndex(newIndex);
        setSelectedItem(filteredItems[newIndex]);
      } else if (e.key === 'ArrowRight' && filteredItems.length > 1) {
        e.preventDefault();
        const newIndex = currentIndex < filteredItems.length - 1 ? currentIndex + 1 : 0;
        setCurrentIndex(newIndex);
        setSelectedItem(filteredItems[newIndex]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, currentIndex, filteredItems]);

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

          {/* Horizontal Carousel */}
          <div className="relative">
            <div 
              ref={carouselRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory scroll-smooth"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className="group relative flex-shrink-0 w-[90vw] sm:w-[45vw] lg:w-[30vw] aspect-square bg-[#1a1a1a] cursor-pointer snap-center"
                  onClick={() => openLightbox(item, index)}
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
            
            {/* Scrollbar hide styles */}
            <style>{`
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
            `}</style>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-8"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-24 right-4 md:top-28 md:right-8 text-white hover:text-gray-300 z-[101] p-3 bg-black/50 rounded-full backdrop-blur-sm transition-all hover:bg-black/70"
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
            className="w-full max-w-6xl max-h-[85vh] flex flex-col items-center justify-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Navigation Arrows */}
            {filteredItems.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateCarousel('prev');
                  }}
                  className="absolute left-0 md:-left-12 top-1/2 -translate-y-1/2 z-[102] p-3 md:p-4 bg-black/50 rounded-full backdrop-blur-sm text-white hover:bg-black/70 transition-all"
                  aria-label="Previous"
                >
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateCarousel('next');
                  }}
                  className="absolute right-0 md:-right-12 top-1/2 -translate-y-1/2 z-[102] p-3 md:p-4 bg-black/50 rounded-full backdrop-blur-sm text-white hover:bg-black/70 transition-all"
                  aria-label="Next"
                >
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}

            {/* Media Content */}
            <div className="w-full flex-shrink-0 flex items-center justify-center">
              {selectedItem.type === 'photo' ? (
                <img
                  src={selectedItem.fullSize || selectedItem.thumbnail}
                  alt={selectedItem.caption || 'Portfolio image'}
                  className="max-w-full max-h-[70vh] w-auto h-auto object-contain rounded-lg"
                />
              ) : (
                <div className="w-full max-w-4xl" style={{ paddingBottom: '56.25%' }}>
                  {selectedItem.embedHtml ? (
                    // Use Facebook embed if available (has sound support)
                    <div 
                      className="absolute inset-0 w-full h-full rounded-lg overflow-hidden"
                      dangerouslySetInnerHTML={{ __html: selectedItem.embedHtml }}
                    />
                  ) : selectedItem.fullSize ? (
                    // Fallback to direct video source
                    <video
                      src={selectedItem.fullSize}
                      controls
                      className="absolute inset-0 w-full h-full object-contain rounded-lg"
                      playsInline
                      preload="metadata"
                      crossOrigin="anonymous"
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-black text-white rounded-lg">
                      <div className="text-center">
                        <p className="mb-4">Video playback not available</p>
                        <a
                          href={selectedItem.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg underline hover:text-blue-400"
                        >
                          Watch on Facebook →
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Caption and Link */}
            <div className="w-full max-w-4xl mt-6 flex-shrink-0">
              {selectedItem.caption && (
                <div className="text-white text-center mb-4">
                  <p className="text-base md:text-lg px-4">{selectedItem.caption}</p>
                </div>
              )}
              
              <div className="text-center">
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
        </div>
      )}
    </>
  );
};

export default Portfolio;
