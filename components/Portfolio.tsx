import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface PortfolioImage {
  id: string;
  url: string;
  title?: string;
  description?: string;
  uploadedAt: string;
}

const Portfolio: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [showLogin, setShowLogin] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('file');
  const [currentIndex, setCurrentIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Load images from localStorage on mount
  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return;
    
    const storedImages = localStorage.getItem('danielbau_portfolio');
    if (storedImages) {
      try {
        setImages(JSON.parse(storedImages));
      } catch (e) {
        console.error('Error loading portfolio images:', e);
      }
    }

    // Check if admin is already logged in
    const adminSession = sessionStorage.getItem('danielbau_admin');
    if (adminSession === 'true') {
      setIsAdmin(true);
      setIsLoggedIn(true);
    }
  }, []);

  // Save images to localStorage whenever they change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (images.length > 0 || localStorage.getItem('danielbau_portfolio')) {
      localStorage.setItem('danielbau_portfolio', JSON.stringify(images));
    }
  }, [images]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'danielbauadmin' && password === 'danielbau') {
      setIsAdmin(true);
      setIsLoggedIn(true);
      setShowLogin(false);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('danielbau_admin', 'true');
      }
      setUsername('');
      setPassword('');
    } else {
      alert('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setIsLoggedIn(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('danielbau_admin');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      // Check if it's an image
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      setUploadFile(file);
    }
  };

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let imageUrl = '';
    
    if (uploadMethod === 'file' && uploadFile) {
      // Convert file to base64 data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const newImage: PortfolioImage = {
          id: Date.now().toString(),
          url: base64String,
          title: uploadTitle.trim() || undefined,
          description: uploadDescription.trim() || undefined,
          uploadedAt: new Date().toISOString()
        };
        setImages([...images, newImage]);
        setUploadFile(null);
        setUploadTitle('');
        setUploadDescription('');
        setShowUpload(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
      reader.onerror = () => {
        alert('Error reading file');
      };
      reader.readAsDataURL(uploadFile);
      return;
    } else if (uploadMethod === 'url' && uploadUrl.trim()) {
      imageUrl = uploadUrl.trim();
    } else {
      alert('Please select a file or enter an image URL');
      return;
    }
    
    if (imageUrl) {
      const newImage: PortfolioImage = {
        id: Date.now().toString(),
        url: imageUrl,
        title: uploadTitle.trim() || undefined,
        description: uploadDescription.trim() || undefined,
        uploadedAt: new Date().toISOString()
      };
      setImages([...images, newImage]);
      setUploadUrl('');
      setUploadTitle('');
      setUploadDescription('');
      setShowUpload(false);
    }
  };

  const handleDeleteImage = (id: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      setImages(images.filter(img => img.id !== id));
    }
  };

  // Auto-advance carousel
  useEffect(() => {
    if (images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  useLayoutEffect(() => {
    if (!sectionRef.current) return;
    
    const ctx = gsap.context(() => {
      const items = sectionRef.current?.querySelectorAll('.portfolio-item');
      if (items && items.length > 0) {
        gsap.from(items, {
          y: 50,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [images]);

  return (
    <section 
      ref={sectionRef}
      className="py-24 px-6 md:px-20 bg-[#E3E1DC] min-h-screen" 
      id="portfolio"
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-5xl md:text-7xl mb-4 text-gray-800">
            PORTFOLIO
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Showcasing our completed projects and craftsmanship
          </p>
        </div>

        {/* Admin Controls */}
        {isAdmin && (
          <div className="mb-8 p-4 bg-white/50 rounded-lg border border-gray-300 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="text-sm text-gray-700">
              Admin Mode: <span className="font-bold">Active</span>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowUpload(!showUpload)}
                className="px-4 py-2 bg-[#121212] text-white text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors"
              >
                {showUpload ? 'Cancel' : 'Add Image'}
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-400 text-white text-sm uppercase tracking-widest hover:bg-gray-500 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        )}

        {/* Login Form - Subtle, only visible on hover/focus */}
        {!isLoggedIn && (
          <div className="mb-8 text-center opacity-20 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 group">
            <button
              onClick={() => setShowLogin(!showLogin)}
              className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              title="Admin Login"
            >
              ⚙ Admin
            </button>
            {showLogin && (
              <form onSubmit={handleLogin} className="mt-4 max-w-md mx-auto bg-white/50 p-6 rounded-lg border border-gray-300">
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 mb-4 border border-gray-300 rounded focus:outline-none focus:border-[#121212]"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 mb-4 border border-gray-300 rounded focus:outline-none focus:border-[#121212]"
                  required
                />
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-[#121212] text-white uppercase tracking-widest hover:bg-gray-800 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLogin(false);
                      setUsername('');
                      setPassword('');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-400 text-white uppercase tracking-widest hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Upload Form */}
        {isAdmin && showUpload && (
          <form onSubmit={handleAddImage} className="mb-8 p-6 bg-white/50 rounded-lg border border-gray-300">
            <h3 className="text-xl font-bold mb-4">Add New Image</h3>
            
            {/* Upload Method Toggle */}
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                onClick={() => {
                  setUploadMethod('file');
                  setUploadUrl('');
                  setUploadFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className={`px-4 py-2 text-sm uppercase tracking-widest transition-colors ${
                  uploadMethod === 'file'
                    ? 'bg-[#121212] text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Upload from Device
              </button>
              <button
                type="button"
                onClick={() => {
                  setUploadMethod('url');
                  setUploadFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className={`px-4 py-2 text-sm uppercase tracking-widest transition-colors ${
                  uploadMethod === 'url'
                    ? 'bg-[#121212] text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Image URL
              </button>
            </div>

            {/* File Upload */}
            {uploadMethod === 'file' && (
              <div className="mb-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#121212] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#121212] file:text-white hover:file:bg-gray-800 file:cursor-pointer"
                />
                {uploadFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Max file size: 5MB. Supported formats: JPG, PNG, GIF, WebP
                </p>
              </div>
            )}

            {/* URL Input */}
            {uploadMethod === 'url' && (
              <input
                type="url"
                placeholder="Image URL"
                value={uploadUrl}
                onChange={(e) => setUploadUrl(e.target.value)}
                className="w-full px-4 py-2 mb-4 border border-gray-300 rounded focus:outline-none focus:border-[#121212]"
                required={uploadMethod === 'url'}
              />
            )}

            <input
              type="text"
              placeholder="Title (optional)"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              className="w-full px-4 py-2 mb-4 border border-gray-300 rounded focus:outline-none focus:border-[#121212]"
            />
            <textarea
              placeholder="Description (optional)"
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              className="w-full px-4 py-2 mb-4 border border-gray-300 rounded focus:outline-none focus:border-[#121212] resize-none"
              rows={3}
            />
            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-2 bg-[#121212] text-white uppercase tracking-widest hover:bg-gray-800 transition-colors"
              >
                Add Image
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUpload(false);
                  setUploadUrl('');
                  setUploadFile(null);
                  setUploadTitle('');
                  setUploadDescription('');
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="px-6 py-2 bg-gray-400 text-white uppercase tracking-widest hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Portfolio Carousel */}
        {images.length > 0 ? (
          <div className="relative">
            <div className="overflow-hidden">
              <div 
                className="flex gap-6 transition-transform duration-500 ease-in-out"
                style={{ 
                  transform: `translateX(calc(-${currentIndex} * (100% + 1.5rem)))`
                }}
              >
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="portfolio-item flex-shrink-0 w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] group relative bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="aspect-square relative overflow-hidden">
                      <img
                        src={image.url}
                        alt={image.title || 'Portfolio image'}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23ddd" width="400" height="400"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage not found%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteImage(image.id)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          aria-label="Delete image"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                    {(image.title || image.description) && (
                      <div className="p-4">
                        {image.title && (
                          <h3 className="font-bold text-gray-800 mb-1">{image.title}</h3>
                        )}
                        {image.description && (
                          <p className="text-sm text-gray-600">{image.description}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Carousel Navigation */}
            {images.length > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                  className="px-4 py-2 bg-[#121212] text-white rounded-full hover:bg-gray-800 transition-colors"
                  aria-label="Previous image"
                >
                  ←
                </button>
                <div className="flex gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentIndex ? 'bg-[#121212] w-8' : 'bg-gray-300'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                  className="px-4 py-2 bg-[#121212] text-white rounded-full hover:bg-gray-800 transition-colors"
                  aria-label="Next image"
                >
                  →
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="min-h-[400px] flex items-center justify-center">
            {/* Empty state - looks normal, no message */}
          </div>
        )}
      </div>
    </section>
  );
};

export default Portfolio;
