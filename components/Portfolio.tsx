import React, { useEffect, useState, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { PortfolioProject, PortfolioMedia } from '../types';
import PortfolioAdmin from './PortfolioAdmin';

const Portfolio: React.FC = () => {
  const { t } = useLanguage();
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(0);
  const [showAdmin, setShowAdmin] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Load projects list (lightweight - only metadata)
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/portfolio-projects');
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(err instanceof Error ? err.message : 'Failed to load portfolio');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const navigateProject = (direction: 'prev' | 'next') => {
    if (projects.length === 0) return;
    
    if (direction === 'prev') {
      setSelectedProjectIndex((prev) => (prev > 0 ? prev - 1 : projects.length - 1));
    } else {
      setSelectedProjectIndex((prev) => (prev < projects.length - 1 ? prev + 1 : 0));
    }
  };

  if (loading) {
    return (
      <section ref={sectionRef} className="py-24 px-6 md:px-20 bg-[#E3E1DC]">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-gray-600">Loading portfolio...</div>
        </div>
      </section>
    );
  }

  if (showAdmin) {
    return <PortfolioAdmin onClose={() => setShowAdmin(false)} projects={projects} setProjects={setProjects} />;
  }

  if (error) {
    return (
      <section ref={sectionRef} className="py-24 px-6 md:px-20 bg-[#E3E1DC]">
        <div className="max-w-7xl mx-auto text-center relative">
          {/* Admin Button - Always visible even on error */}
          <div className="absolute top-0 right-0">
            <button
              onClick={() => setShowAdmin(true)}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Admin"
            >
              ⚙️
            </button>
          </div>
          <div className="text-red-600 mb-4">Error: {error}</div>
          <div className="text-sm text-gray-500 mt-2">Click ⚙️ to access admin panel</div>
        </div>
      </section>
    );
  }

  if (projects.length === 0) {
    return (
      <section ref={sectionRef} className="py-24 px-6 md:px-20 bg-[#E3E1DC]">
        <div className="max-w-7xl mx-auto text-center relative">
          {/* Admin Button - Always visible even with no projects */}
          <div className="absolute top-0 right-0">
            <button
              onClick={() => setShowAdmin(true)}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Admin"
            >
              ⚙️
            </button>
          </div>
          <div className="text-gray-600 mb-4">No projects available.</div>
          <div className="text-sm text-gray-500 mt-2">Click ⚙️ to create your first project</div>
        </div>
      </section>
    );
  }

  const currentProject = projects[selectedProjectIndex];

  return (
    <section ref={sectionRef} className="py-24 px-6 md:px-20 bg-[#E3E1DC]" id="portfolio">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-xs uppercase tracking-widest mb-4 opacity-50">
            {t.portfolio?.subheader || 'PORTFOLIO'}
          </div>
          <h2 className="font-display text-4xl md:text-6xl mb-4">
            {t.portfolio?.header || 'Our Projects'}
          </h2>
        </div>

        {/* Admin Button (small, subtle) */}
        <div className="relative mb-4 text-right">
          <button
            onClick={() => setShowAdmin(true)}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Admin"
          >
            ⚙️
          </button>
        </div>

        {/* Project Navigation */}
        <div className="relative mb-8">
          {projects.length > 1 && (
            <>
              <button
                onClick={() => navigateProject('prev')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/80 hover:bg-white rounded-full shadow-md transition-all"
                aria-label="Previous project"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => navigateProject('next')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/80 hover:bg-white rounded-full shadow-md transition-all"
                aria-label="Next project"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Project Thumbnails Grid */}
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory scroll-smooth px-12">
            {projects.map((project, index) => (
              <button
                key={project.id}
                onClick={() => setSelectedProjectIndex(index)}
                className={`flex-shrink-0 px-6 py-3 bg-transparent border-2 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-all snap-center ${
                  index === selectedProjectIndex 
                    ? 'border-[#121212] bg-gray-100 font-semibold' 
                    : 'border-gray-300'
                }`}
              >
                <span className={`text-sm whitespace-nowrap ${
                  index === selectedProjectIndex ? 'text-[#121212]' : 'text-gray-600'
                }`}>
                  {project.name || project.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Project Gallery - Lazy loaded */}
        <ProjectGallery project={currentProject} />
      </div>
    </section>
  );
};

// Separate component for project gallery (lazy loads media)
const ProjectGallery: React.FC<{ project: PortfolioProject }> = ({ project }) => {
  const [media, setMedia] = useState<PortfolioMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/portfolio-media?projectId=${project.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch media');
        }
        const data = await response.json();
        setMedia(data);
      } catch (err) {
        console.error('Error fetching media:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [project.id]);

  const openLightbox = (index: number) => {
    setSelectedMediaIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedMediaIndex(null);
    document.body.style.overflow = '';
  };

  const navigateMedia = (direction: 'prev' | 'next') => {
    if (selectedMediaIndex === null) return;
    
    if (direction === 'prev') {
      setSelectedMediaIndex(selectedMediaIndex > 0 ? selectedMediaIndex - 1 : media.length - 1);
    } else {
      setSelectedMediaIndex(selectedMediaIndex < media.length - 1 ? selectedMediaIndex + 1 : 0);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600">Loading project...</div>
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600">No media in this project.</div>
      </div>
    );
  }

  const selectedMedia = selectedMediaIndex !== null ? media[selectedMediaIndex] : null;

  return (
    <>
      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {media.map((item, index) => (
              <div
                key={item.id}
                className="aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => openLightbox(index)}
              >
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt={`${project.name || project.title} - ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="relative w-full h-full bg-gray-800">
                    <video
                      src={item.thumbnail || item.url}
                      className="w-full h-full object-cover"
                      preload="metadata"
                      muted
                      playsInline
                      onError={(e) => {
                        console.error('Video thumbnail error:', e);
                        console.error('Video URL:', item.thumbnail || item.url);
                      }}
                      onLoadedMetadata={(e) => {
                        // Seek to first frame for thumbnail
                        const video = e.currentTarget;
                        video.currentTime = 0.1;
                      }}
                      onLoadedData={(e) => {
                        // Ensure first frame is shown
                        const video = e.currentTarget;
                        if (video.currentTime < 0.1) {
                          video.currentTime = 0.1;
                        }
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                      <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
      </div>

      {/* Lightbox */}
      {selectedMedia && selectedMediaIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-24 right-4 md:top-28 md:right-8 text-white hover:text-gray-300 z-[101] p-3 bg-black/50 rounded-full backdrop-blur-sm transition-all hover:bg-black/70"
            aria-label="Close"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {media.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateMedia('prev');
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-[102] p-4 bg-black/50 rounded-full text-white hover:bg-black/70 transition-all"
                aria-label="Previous"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateMedia('next');
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-[102] p-4 bg-black/50 rounded-full text-white hover:bg-black/70 transition-all"
                aria-label="Next"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          <div
            className="max-w-7xl max-h-[85vh] w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedMedia.type === 'image' ? (
              <img
                src={selectedMedia.url}
                alt={`${project.name || project.title} - ${selectedMediaIndex + 1}`}
                className="max-w-full max-h-[75vh] w-auto h-auto object-contain rounded-lg"
              />
            ) : (
              <div className="w-full max-w-4xl">
                <video
                  src={selectedMedia.url}
                  controls
                  className="max-w-full max-h-[75vh] rounded-lg"
                  playsInline
                  preload="metadata"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    console.error('Video playback error:', e);
                    console.error('Video URL:', selectedMedia.url);
                  }}
                >
                  <source src={selectedMedia.url} type="video/mp4" />
                  <source src={selectedMedia.url} type="video/webm" />
                  <source src={selectedMedia.url} type="video/quicktime" />
                  <source src={selectedMedia.url} type="video/x-msvideo" />
                  Your browser does not support the video tag.
                </video>
                {selectedMedia.url && (
                  <div className="mt-2 text-center">
                    <a
                      href={selectedMedia.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/70 hover:text-white text-sm underline"
                    >
                      Open video in new tab →
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
};

export default Portfolio;
