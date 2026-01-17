import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { portfolioAPI, supabase } from '../lib/supabase';

gsap.registerPlugin(ScrollTrigger);

interface PortfolioMedia {
  id: string;
  url: string;
  type: 'image' | 'video';
  title?: string;
  description?: string;
  uploadedAt: string;
}

interface PortfolioProject {
  id: string;
  name: string;
  description?: string;
  media: PortfolioMedia[];
  order: number;
  createdAt: string;
}

const Portfolio: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [showLogin, setShowLogin] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [currentMediaIndices, setCurrentMediaIndices] = useState<Record<string, number>>({});
  const [selectedProjectIndex, setSelectedProjectIndex] = useState<number>(0);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<PortfolioProject[]>([]);
  
  // Touch/swipe handling for mobile
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  // Check if mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load projects from Supabase API (with localStorage fallback)
  // Only updates state if data actually changed to prevent flicker
  const loadProjects = async () => {
    if (typeof window === 'undefined') return;
    
    try {
      const loadedProjects = await portfolioAPI.getProjects();
      
      // Compare with current projects using ref to avoid unnecessary re-renders
      const currentProjects = projectsRef.current;
      const currentProjectsStr = JSON.stringify(currentProjects.map(p => ({ id: p.id, name: p.name, order: p.order, mediaCount: p.media.length, mediaIds: p.media.map(m => m.id) })));
      const loadedProjectsStr = JSON.stringify(loadedProjects.map(p => ({ id: p.id, name: p.name, order: p.order, mediaCount: p.media.length, mediaIds: p.media.map(m => m.id) })));
      
      // Only update if data actually changed
      if (currentProjectsStr !== loadedProjectsStr) {
        projectsRef.current = loadedProjects;
        setProjects(loadedProjects);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      // Fallback to localStorage
      const storedProjects = localStorage.getItem('danielbau_portfolio_projects');
      if (storedProjects) {
        try {
          const parsed = JSON.parse(storedProjects);
          const sorted = parsed.sort((a: PortfolioProject, b: PortfolioProject) => a.order - b.order);
          
          // Compare before updating
          const currentProjects = projectsRef.current;
          const currentProjectsStr = JSON.stringify(currentProjects.map(p => ({ id: p.id, name: p.name, order: p.order, mediaCount: p.media.length, mediaIds: p.media.map(m => m.id) })));
          const sortedProjectsStr = JSON.stringify(sorted.map(p => ({ id: p.id, name: p.name, order: p.order, mediaCount: p.media.length, mediaIds: p.media.map(m => m.id) })));
          
          if (currentProjectsStr !== sortedProjectsStr) {
            projectsRef.current = sorted;
            setProjects(sorted);
          }
        } catch (e) {
          console.error('Error loading from localStorage:', e);
        }
      }
    }
  };

  useEffect(() => {
    loadProjects();
    
    // Check if admin is already logged in
    const adminSession = sessionStorage.getItem('danielbau_admin');
    if (adminSession === 'true') {
      setIsAdmin(true);
      setIsLoggedIn(true);
    }
  }, []);
  
  // Update ref whenever projects change
  useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);

  // Poll for updates silently (only when admin is logged in, or much less frequently for public)
  useEffect(() => {
    // Only poll if admin is logged in, or poll much less frequently for public users
    // Public users: 60 seconds (1 minute) - very infrequent to avoid any flicker
    // Admin: 15 seconds - more frequent for admin to see changes
    const pollInterval = isAdmin ? 15000 : 60000;
    
    const interval = setInterval(() => {
      // Silent refresh - only updates if data changed (no flicker)
      loadProjects();
    }, pollInterval);
    
    // Also listen to focus events (when user switches back to tab) - but silently
    const handleFocus = () => {
      // Small delay to avoid flicker when tab becomes active
      setTimeout(() => {
        loadProjects();
      }, 500);
    };
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAdmin]); // Removed projects from deps to avoid re-creating interval
  
  // Update selected project index when projects change
  useEffect(() => {
    if (projects.length > 0 && selectedProjectIndex >= projects.length) {
      setSelectedProjectIndex(0);
    }
  }, [projects.length, selectedProjectIndex]);

  // Swipe gesture handlers for mobile (horizontal swipe to switch projects)
  const touchStartY = useRef<number>(0);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile || isAdmin || projects.length <= 1) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchEndX.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || isAdmin || projects.length <= 1) return;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isMobile || isAdmin || projects.length <= 1) return;
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distanceX = touchStartX.current - touchEndX.current;
    const distanceY = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    const minSwipeDistance = 50; // Minimum distance for a swipe
    
    // Only trigger if it's primarily a horizontal swipe (not vertical scroll)
    if (Math.abs(distanceX) > minSwipeDistance && Math.abs(distanceX) > distanceY) {
      if (distanceX > 0) {
        // Swipe left - next project
        setSelectedProjectIndex(prev => (prev < projects.length - 1 ? prev + 1 : 0));
        setExpandedProjectId(null); // Close expanded view when switching
      } else {
        // Swipe right - previous project
        setSelectedProjectIndex(prev => (prev > 0 ? prev - 1 : projects.length - 1));
        setExpandedProjectId(null); // Close expanded view when switching
      }
    }
    
    touchStartX.current = 0;
    touchEndX.current = 0;
    touchStartY.current = 0;
  };
  
  // Manual refresh function for admin
  const handleRefresh = async () => {
    await loadProjects();
    alert('Portfolio refreshed');
  };

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
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    const validFiles: File[] = [];
    const maxSize = 50 * 1024 * 1024; // 50MB for videos

    files.forEach((file: File) => {
      // Check file size
      if (file.size > maxSize) {
        alert(`${file.name} is too large. Max size: 50MB`);
        return;
      }
      
      // Check if it's an image or video
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        validFiles.push(file);
      } else {
        alert(`${file.name} is not a valid image or video file`);
      }
    });

    setUploadFiles([...uploadFiles, ...validFiles]);
  };

  const createProject = async () => {
    if (!newProjectName.trim()) {
      alert('Please enter a project name');
      return;
    }

    const newProject = await portfolioAPI.createProject(newProjectName.trim());
    if (newProject) {
      // Reload projects to get the latest from API
      await loadProjects();
      setNewProjectName('');
      setSelectedProjectId(newProject.id);
    } else {
      alert('Failed to create project. Please try again.');
    }
  };

  const handleAddMedia = async () => {
    if (!selectedProjectId) {
      alert('Please select or create a project first');
      return;
    }

    if (uploadFiles.length === 0) {
      alert('Please select at least one file');
      return;
    }

    const project = projects.find(p => p.id === selectedProjectId);
    if (!project) return;

    const newMedia: PortfolioMedia[] = [];

    // Process all files
    for (const file of uploadFiles) {
      const reader = new FileReader();
      
      await new Promise<void>((resolve, reject) => {
        reader.onloadend = () => {
          const base64String = reader.result as string;
          newMedia.push({
            id: `${Date.now()}-${Math.random()}`,
            url: base64String,
            type: file.type.startsWith('video/') ? 'video' : 'image',
            title: uploadTitle.trim() || undefined,
            description: uploadDescription.trim() || undefined,
            uploadedAt: new Date().toISOString()
          });
          resolve();
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    // Update project with new media via API
    // Format media for Supabase (convert uploadedAt to uploaded_at)
    const formattedNewMedia = newMedia.map(m => ({
      id: m.id,
      url: m.url,
      type: m.type,
      title: m.title,
      description: m.description,
      uploaded_at: m.uploadedAt
    }));

    const updatedMedia = [...project.media.map(m => ({
      ...m,
      uploaded_at: m.uploadedAt
    })), ...formattedNewMedia];

    const success = await portfolioAPI.updateProject(selectedProjectId, {
      ...project,
      media: updatedMedia
    });

    if (success) {
      // Reload projects to get latest from API
      await loadProjects();
      setUploadFiles([]);
      setUploadTitle('');
      setUploadDescription('');
      setShowUpload(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else {
      alert('Failed to add media. Please try again.');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm('Are you sure you want to delete this project and all its media?')) {
      const success = await portfolioAPI.deleteProject(id);
      if (success) {
        await loadProjects(); // Reload from API
        if (selectedProjectId === id) {
          setSelectedProjectId(null);
        }
      } else {
        alert('Failed to delete project. Please try again.');
      }
    }
  };

  const handleDeleteMedia = async (projectId: string, mediaId: string) => {
    if (confirm('Are you sure you want to delete this media?')) {
      const project = projects.find(p => p.id === projectId);
      if (!project) return;

      const updatedMedia = project.media
        .filter(m => m.id !== mediaId)
        .map(m => ({
          id: m.id,
          url: m.url,
          type: m.type,
          title: m.title,
          description: m.description,
          uploaded_at: m.uploadedAt || m.uploaded_at
        }));

      const success = await portfolioAPI.updateProject(projectId, {
        ...project,
        media: updatedMedia
      });

      if (success) {
        await loadProjects(); // Reload from API
      } else {
        alert('Failed to delete media. Please try again.');
      }
    }
  };

  const moveProject = async (id: string, direction: 'up' | 'down') => {
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= projects.length) return;

    const updatedProjects = [...projects];
    [updatedProjects[index], updatedProjects[newIndex]] = [updatedProjects[newIndex], updatedProjects[index]];
    
    // Update order
    updatedProjects.forEach((p, i) => {
      p.order = i;
    });

    // Update order in API
    const projectIds = updatedProjects.map(p => p.id);
    const success = await portfolioAPI.reorderProjects(projectIds);
    
    if (success) {
      await loadProjects(); // Reload from API
    } else {
      // If API fails, still update locally
      setProjects(updatedProjects);
    }
  };

  // Auto-advance carousel disabled - users can navigate manually
  // This prevents the visual refresh bug

  useLayoutEffect(() => {
    if (!sectionRef.current) return;
    
    const ctx = gsap.context(() => {
      const items = sectionRef.current?.querySelectorAll('.portfolio-project');
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
  }, [projects]);

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
          <div className="mb-8 p-4 bg-white/50 rounded-lg border border-gray-300 space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="text-sm text-gray-700">
                Admin Mode: <span className="font-bold">Active</span>
                {supabase && (
                  <span className="ml-2 text-xs text-gray-500">
                    (Changes sync across all devices via Supabase)
                  </span>
                )}
                {!supabase && (
                  <span className="ml-2 text-xs text-gray-500">
                    (Using localStorage - changes are local to this device)
                  </span>
                )}
              </div>
              <div className="flex gap-4 flex-wrap">
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-blue-600 text-white text-sm uppercase tracking-widest hover:bg-blue-700 transition-colors"
                  title="Refresh portfolio (syncs across devices)"
                >
                  Refresh
                </button>
                <button
                  onClick={() => setShowUpload(!showUpload)}
                  className="px-4 py-2 bg-[#121212] text-white text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors"
                >
                  {showUpload ? 'Cancel' : 'Add Media'}
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-gray-400 text-white text-sm uppercase tracking-widest hover:bg-gray-500 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Project Management */}
            <div className="border-t border-gray-300 pt-4 space-y-4">
              <div className="flex gap-4 items-center">
                <input
                  type="text"
                  placeholder="New project name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#121212]"
                />
                <button
                  onClick={createProject}
                  className="px-4 py-2 bg-[#121212] text-white text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors"
                >
                  Create Project
                </button>
              </div>

              {projects.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Select Project:</label>
                  <select
                    value={selectedProjectId || ''}
                    onChange={(e) => setSelectedProjectId(e.target.value || null)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#121212]"
                  >
                    <option value="">-- Select a project --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Login Form */}
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
          <form onSubmit={(e) => { e.preventDefault(); handleAddMedia(); }} className="mb-8 p-6 bg-white/50 rounded-lg border border-gray-300">
            <h3 className="text-xl font-bold mb-4">Add Media to Project</h3>
            
            {!selectedProjectId && (
              <p className="text-red-600 mb-4">Please select or create a project first</p>
            )}

            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#121212] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#121212] file:text-white hover:file:bg-gray-800 file:cursor-pointer"
              />
              {uploadFiles.length > 0 && (
                <div className="mt-2 space-y-1">
                  {uploadFiles.map((file, index) => (
                    <div key={index} className="text-sm text-gray-600 flex items-center justify-between">
                      <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      <button
                        type="button"
                        onClick={() => setUploadFiles(uploadFiles.filter((_, i) => i !== index))}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-2 text-xs text-gray-500">
                Max file size: 50MB. Supported: Images (JPG, PNG, GIF, WebP) and Videos (MP4, WebM)
              </p>
            </div>

            <input
              type="text"
              placeholder="Title (optional, applies to all files)"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              className="w-full px-4 py-2 mb-4 border border-gray-300 rounded focus:outline-none focus:border-[#121212]"
            />
            <textarea
              placeholder="Description (optional, applies to all files)"
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              className="w-full px-4 py-2 mb-4 border border-gray-300 rounded focus:outline-none focus:border-[#121212] resize-none"
              rows={3}
            />
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={!selectedProjectId || uploadFiles.length === 0}
                className="px-6 py-2 bg-[#121212] text-white uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add {uploadFiles.length > 0 ? `${uploadFiles.length} ` : ''}Media
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUpload(false);
                  setUploadFiles([]);
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

        {/* Portfolio Projects Display */}
        {projects.length > 0 ? (
          <div>
            {/* Display selected project (for non-admin) or all projects (for admin) */}
            {isAdmin ? (
              // Admin view: Show all projects stacked
              <div className="space-y-16">
                {projects.map((project, projectIndex) => (
                  <div key={project.id} className="portfolio-project">
                {/* Project Header */}
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-3xl md:text-4xl text-gray-800 mb-2">
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="text-gray-600">{project.description}</p>
                    )}
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2 items-center">
                      <span className="text-xs text-gray-500 mr-2">Order:</span>
                      <button
                        onClick={() => moveProject(project.id, 'up')}
                        disabled={projectIndex === 0}
                        className="px-3 py-1 bg-gray-200 text-gray-700 text-sm hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded"
                        title="Move up"
                      >
                        ↑ Up
                      </button>
                      <button
                        onClick={() => moveProject(project.id, 'down')}
                        disabled={projectIndex === projects.length - 1}
                        className="px-3 py-1 bg-gray-200 text-gray-700 text-sm hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded"
                        title="Move down"
                      >
                        ↓ Down
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="px-3 py-1 bg-red-500 text-white text-sm hover:bg-red-600 transition-colors rounded"
                        title="Delete project"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Project Media Carousel - Admin view only */}
                {project.media.length > 0 ? (
                  <div className="relative">
                    <div className="overflow-hidden">
                      <div 
                        className="flex gap-6 transition-transform duration-500 ease-in-out"
                        style={{ 
                          transform: `translateX(calc(-${currentMediaIndices[project.id] || 0} * (100% + 1.5rem)))`
                        }}
                      >
                        {project.media.map((media) => (
                          <div
                            key={media.id}
                            className="flex-shrink-0 w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] group relative bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                          >
                            <div className="aspect-square relative overflow-hidden">
                              {media.type === 'video' ? (
                                <video
                                  src={media.url}
                                  controls
                                  className="w-full h-full object-cover"
                                  preload="metadata"
                                />
                              ) : (
                                <img
                                  src={media.url}
                                  alt={media.title || 'Portfolio media'}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                  loading="lazy"
                                  decoding="async"
                                />
                              )}
                              {isAdmin && (
                                <button
                                  onClick={() => handleDeleteMedia(project.id, media.id)}
                                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                  aria-label="Delete media"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                            </div>
                            {(media.title || media.description) && (
                              <div className="p-4">
                                {media.title && (
                                  <h4 className="font-bold text-gray-800 mb-1">{media.title}</h4>
                                )}
                                {media.description && (
                                  <p className="text-sm text-gray-600">{media.description}</p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Carousel Navigation */}
                    {project.media.length > 1 && (
                      <div className="flex justify-center items-center gap-4 mt-8">
                        <button
                          onClick={() => setCurrentMediaIndices(prev => ({
                            ...prev,
                            [project.id]: ((prev[project.id] || 0) > 0 ? (prev[project.id] || 0) - 1 : project.media.length - 1)
                          }))}
                          className="px-4 py-2 bg-[#121212] text-white rounded-full hover:bg-gray-800 transition-colors"
                          aria-label="Previous media"
                        >
                          ←
                        </button>
                        <div className="flex gap-2">
                          {project.media.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentMediaIndices(prev => ({ ...prev, [project.id]: index }))}
                              className={`w-2 h-2 rounded-full transition-all ${
                                index === (currentMediaIndices[project.id] || 0) ? 'bg-[#121212] w-8' : 'bg-gray-300'
                              }`}
                              aria-label={`Go to media ${index + 1}`}
                            />
                          ))}
                        </div>
                        <button
                          onClick={() => setCurrentMediaIndices(prev => ({
                            ...prev,
                            [project.id]: ((prev[project.id] || 0) < project.media.length - 1 ? (prev[project.id] || 0) + 1 : 0)
                          }))}
                          className="px-4 py-2 bg-[#121212] text-white rounded-full hover:bg-gray-800 transition-colors"
                          aria-label="Next media"
                        >
                          →
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="min-h-[200px] flex items-center justify-center text-gray-400">
                    No media in this project yet
                  </div>
                )}
              </div>
                ))}
              </div>
            ) : (
              // Public view: Show selected project with gallery (mobile: swipe + tap to expand)
              <div 
                className="portfolio-project"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {projects[selectedProjectIndex] && (
                  <>
                    {/* Project Header */}
                    <div className="mb-6 md:mb-8 text-center">
                      <h3 className="font-display text-2xl md:text-5xl text-gray-800 mb-4">
                        {projects[selectedProjectIndex].name}
                      </h3>
                      {projects[selectedProjectIndex].description && (
                        <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto px-4">
                          {projects[selectedProjectIndex].description}
                        </p>
                      )}
                      
                      {/* Mobile: Swipe indicator */}
                      {isMobile && projects.length > 1 && (
                        <p className="text-xs text-gray-400 mt-4">Swipe left/right to switch projects</p>
                      )}
                    </div>

                    {/* Project Gallery - Mobile: thumbnails grid, tap to see full media */}
                    {/* Desktop: full gallery grid */}
                    {projects[selectedProjectIndex].media.length > 0 ? (
                      <>
                        {expandedProjectId === projects[selectedProjectIndex].id ? (
                          // Expanded view: Show all media in gallery
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            {projects[selectedProjectIndex].media.map((media, index) => (
                              <div
                                key={media.id}
                                className="group relative bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                              >
                                <div className="aspect-square relative overflow-hidden">
                                  {media.type === 'video' ? (
                                    <video
                                      src={media.url}
                                      controls
                                      className="w-full h-full object-cover"
                                      preload="metadata"
                                    />
                                  ) : (
                                    <img
                                      src={media.url}
                                      alt={media.title || 'Portfolio media'}
                                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                      loading="lazy"
                                      decoding="async"
                                    />
                                  )}
                                </div>
                                {(media.title || media.description) && (
                                  <div className="p-4">
                                    {media.title && (
                                      <h4 className="font-bold text-gray-800 mb-1">{media.title}</h4>
                                    )}
                                    {media.description && (
                                      <p className="text-sm text-gray-600">{media.description}</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          // Preview/Thumbnail view (mobile shows grid, tap to expand; desktop shows full gallery)
                          <div 
                            className={isMobile ? "grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"}
                            onClick={() => isMobile && setExpandedProjectId(projects[selectedProjectIndex].id)}
                            style={{ cursor: isMobile ? 'pointer' : 'default' }}
                          >
                            {projects[selectedProjectIndex].media.slice(0, isMobile ? 4 : undefined).map((media) => (
                              <div
                                key={media.id}
                                className="group relative bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                              >
                                <div className="aspect-square relative overflow-hidden">
                                  {media.type === 'video' ? (
                                    <video
                                      src={media.url}
                                      controls={!isMobile}
                                      className="w-full h-full object-cover"
                                      preload="metadata"
                                      onClick={(e) => isMobile && e.preventDefault()}
                                    />
                                  ) : (
                                    <img
                                      src={media.url}
                                      alt={media.title || 'Portfolio media'}
                                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                      loading="lazy"
                                      decoding="async"
                                    />
                                  )}
                                </div>
                                {!isMobile && (media.title || media.description) && (
                                  <div className="p-4">
                                    {media.title && (
                                      <h4 className="font-bold text-gray-800 mb-1">{media.title}</h4>
                                    )}
                                    {media.description && (
                                      <p className="text-sm text-gray-600">{media.description}</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                            {isMobile && projects[selectedProjectIndex].media.length > 4 && (
                              <div className="aspect-square relative bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                                <div className="text-center px-4">
                                  <p className="text-xs text-gray-500 mb-1">+{projects[selectedProjectIndex].media.length - 4} more</p>
                                  <p className="text-xs text-gray-400">Tap to view all</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {isMobile && expandedProjectId === projects[selectedProjectIndex].id && (
                          <button
                            onClick={() => setExpandedProjectId(null)}
                            className="mt-6 mx-auto block px-6 py-3 bg-[#121212] text-white font-display text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors"
                          >
                            Close Gallery
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="min-h-[200px] flex items-center justify-center text-gray-400">
                        No media in this project yet
                      </div>
                    )}
                  </>
                )}
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
