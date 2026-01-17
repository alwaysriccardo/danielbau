import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { portfolioAPI } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

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
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [showLogin, setShowLogin] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProjectName, setEditingProjectName] = useState('');
  const [editingProjectDescription, setEditingProjectDescription] = useState('');
  const [editingDescriptionInline, setEditingDescriptionInline] = useState<string | null>(null);
  const [inlineDescriptionValue, setInlineDescriptionValue] = useState('');
  const [editingProjectNameInline, setEditingProjectNameInline] = useState<string | null>(null);
  const [inlineProjectNameValue, setInlineProjectNameValue] = useState('');
  const [editingMedia, setEditingMedia] = useState<{ projectId: string; mediaId: string; field: 'title' | 'description' } | null>(null);
  const [inlineMediaValue, setInlineMediaValue] = useState('');
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
  // Pause polling when section is not visible for better performance
  useEffect(() => {
    if (!sectionRef.current) return;
    
    // Only poll if admin is logged in, or poll much less frequently for public users
    // Public users: 60 seconds (1 minute) - very infrequent to avoid any flicker
    // Admin: 15 seconds - more frequent for admin to see changes
    const pollInterval = isAdmin ? 15000 : 60000;
    
    let interval: NodeJS.Timeout | null = null;
    let isVisible = true;
    
    // Use IntersectionObserver to pause polling when section is not visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          
          if (isVisible && !interval) {
            // Resume polling when visible
            interval = setInterval(() => {
              loadProjects();
            }, pollInterval);
          } else if (!isVisible && interval) {
            // Pause polling when not visible
            clearInterval(interval);
            interval = null;
          }
        });
      },
      { threshold: 0.1, rootMargin: '200px' } // Start/stop slightly before entering viewport
    );
    
    observer.observe(sectionRef.current);
    
    // Start polling if section is already visible
    const rect = sectionRef.current.getBoundingClientRect();
    const initiallyVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (initiallyVisible) {
      interval = setInterval(() => {
        loadProjects();
      }, pollInterval);
    }
    
    // Also listen to focus events (when user switches back to tab) - but silently
    const handleFocus = () => {
      if (isVisible) {
        // Small delay to avoid flicker when tab becomes active
        setTimeout(() => {
          loadProjects();
        }, 500);
      }
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      if (interval) clearInterval(interval);
      observer.disconnect();
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
    const filesList = e.target.files;
    if (!filesList || filesList.length === 0) return;

    const files = Array.from(filesList) as File[];
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

    const newProject = await portfolioAPI.createProject(newProjectName.trim(), newProjectDescription.trim() || undefined);
    if (newProject) {
      // Reload projects to get the latest from API
      await loadProjects();
      setNewProjectName('');
      setNewProjectDescription('');
      setSelectedProjectId(newProject.id);
    } else {
      alert('Failed to create project. Please try again.');
    }
  };

  const handleEditProject = (project: PortfolioProject) => {
    setEditingProjectId(project.id);
    setEditingProjectName(project.name);
    setEditingProjectDescription(project.description || '');
  };

  const handleSaveProjectEdit = async () => {
    if (!editingProjectId || !editingProjectName.trim()) {
      alert('Please enter a folder name');
      return;
    }

    const project = projects.find(p => p.id === editingProjectId);
    if (!project) return;

    const success = await portfolioAPI.updateProject(editingProjectId, {
      ...project,
      name: editingProjectName.trim(),
      description: editingProjectDescription.trim() || undefined
    });

    if (success) {
      await loadProjects();
      setEditingProjectId(null);
      setEditingProjectName('');
      setEditingProjectDescription('');
    } else {
      alert('Failed to update folder. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingProjectId(null);
    setEditingProjectName('');
    setEditingProjectDescription('');
  };

  const handleAddMedia = async () => {
    if (!selectedProjectId) {
      alert('Please select or create a folder first');
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
    if (confirm('Are you sure you want to delete this folder and all its media?')) {
      const success = await portfolioAPI.deleteProject(id);
      if (success) {
        await loadProjects(); // Reload from API
        if (selectedProjectId === id) {
          setSelectedProjectId(null);
        }
      } else {
        alert('Failed to delete folder. Please try again.');
      }
    }
  };

  const handleDeleteMedia = async (projectId: string, mediaId: string) => {
    if (!confirm('Are you sure you want to delete this media?')) {
      return;
    }

    const project = projects.find(p => p.id === projectId);
    if (!project) {
      alert('Project not found');
      return;
    }

    // Filter out the media to delete
    const updatedMedia = project.media
      .filter(m => m.id !== mediaId)
      .map(m => ({
        id: m.id,
        url: m.url,
        type: m.type,
        title: m.title,
        description: m.description,
        uploaded_at: m.uploadedAt || m.uploaded_at || new Date().toISOString()
      }));

    // Update project with filtered media
    const success = await portfolioAPI.updateProject(projectId, {
      ...project,
      media: updatedMedia
    });

    if (success) {
      // Reload projects to get latest from API
      await loadProjects();
    } else {
      alert('Failed to delete media. Please try again.');
    }
  };

  const handleStartEditDescription = (projectId: string, currentDescription: string) => {
    setEditingDescriptionInline(projectId);
    setInlineDescriptionValue(currentDescription || '');
  };

  const handleSaveInlineDescription = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const success = await portfolioAPI.updateProject(projectId, {
      ...project,
      description: inlineDescriptionValue.trim() || undefined
    });

    if (success) {
      // Update local state immediately
      setProjects(prevProjects => {
        const updated = prevProjects.map(p => 
          p.id === projectId 
            ? { ...p, description: inlineDescriptionValue.trim() || undefined }
            : p
        );
        projectsRef.current = updated;
        return updated;
      });
      setEditingDescriptionInline(null);
      setInlineDescriptionValue('');
      // Then sync with server
      await loadProjects();
    } else {
      alert('Failed to update description. Please try again.');
    }
  };

  const handleCancelInlineDescription = () => {
    setEditingDescriptionInline(null);
    setInlineDescriptionValue('');
  };

  const handleStartEditProjectName = (projectId: string, currentName: string) => {
    setEditingProjectNameInline(projectId);
    setInlineProjectNameValue(currentName || '');
  };

  const handleSaveInlineProjectName = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    if (!inlineProjectNameValue.trim()) {
      alert('Folder name cannot be empty');
      return;
    }

    const success = await portfolioAPI.updateProject(projectId, {
      ...project,
      name: inlineProjectNameValue.trim()
    });

    if (success) {
      // Update local state immediately
      setProjects(prevProjects => {
        const updated = prevProjects.map(p => 
          p.id === projectId 
            ? { ...p, name: inlineProjectNameValue.trim() }
            : p
        );
        projectsRef.current = updated;
        return updated;
      });
      setEditingProjectNameInline(null);
      setInlineProjectNameValue('');
      // Then sync with server
      await loadProjects();
    } else {
      alert('Failed to update folder name. Please try again.');
    }
  };

  const handleCancelInlineProjectName = () => {
    setEditingProjectNameInline(null);
    setInlineProjectNameValue('');
  };

  const handleStartEditMedia = (projectId: string, mediaId: string, field: 'title' | 'description', currentValue: string) => {
    setEditingMedia({ projectId, mediaId, field });
    setInlineMediaValue(currentValue || '');
  };

  const handleSaveInlineMedia = async () => {
    if (!editingMedia) return;

    const project = projects.find(p => p.id === editingMedia.projectId);
    if (!project) return;

    const mediaIndex = project.media.findIndex(m => m.id === editingMedia.mediaId);
    if (mediaIndex === -1) return;

    const updatedMedia = [...project.media];
    if (editingMedia.field === 'title') {
      updatedMedia[mediaIndex] = {
        ...updatedMedia[mediaIndex],
        title: inlineMediaValue.trim() || undefined
      };
    } else {
      updatedMedia[mediaIndex] = {
        ...updatedMedia[mediaIndex],
        description: inlineMediaValue.trim() || undefined
      };
    }

    const success = await portfolioAPI.updateProject(editingMedia.projectId, {
      ...project,
      media: updatedMedia.map(m => ({
        id: m.id,
        url: m.url,
        type: m.type,
        title: m.title,
        description: m.description,
        uploaded_at: m.uploadedAt || (m as any).uploaded_at || new Date().toISOString()
      }))
    });

    if (success) {
      // Update local state immediately
      const field = editingMedia.field;
      const value = inlineMediaValue.trim() || undefined;
      setProjects(prevProjects => {
        const updated = prevProjects.map(p => 
          p.id === editingMedia.projectId 
            ? { 
                ...p, 
                media: p.media.map(m => 
                  m.id === editingMedia.mediaId
                    ? {
                        ...m,
                        [field]: value
                      }
                    : m
                )
              }
            : p
        );
        projectsRef.current = updated;
        return updated;
      });
      setEditingMedia(null);
      setInlineMediaValue('');
      // Then sync with server
      await loadProjects();
    } else {
      alert('Failed to update media. Please try again.');
    }
  };

  const handleCancelInlineMedia = () => {
    setEditingMedia(null);
    setInlineMediaValue('');
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
        // Set GPU acceleration for all items
        gsap.set(items, { force3D: true, transform: 'translate3d(0,0,0)' });
        
        gsap.from(items, {
          y: 50,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          force3D: true, // GPU acceleration
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: false, // Reduce recalculations
            refreshPriority: -1 // Lower priority
          }
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [projects]);

  return (
    <section 
      ref={sectionRef}
      className="py-16 md:py-20 px-6 md:px-20 bg-[#E3E1DC] min-h-screen" 
      id="portfolio"
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="font-display text-5xl md:text-7xl mb-4 text-gray-800">
            {t.portfolio.header}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t.portfolio.subheader}
          </p>
        </div>

        {/* Admin Controls - Redesigned */}
        {isAdmin && (
          <div className="mb-6">
            {/* Admin Header Bar */}
            <div className="flex items-center justify-between bg-[#121212] text-white px-4 py-3 rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-medium text-sm">Admin Mode</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefresh}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Refresh"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Admin Tabs */}
            <div className="bg-white/80 backdrop-blur border border-t-0 border-gray-200 rounded-b-lg overflow-hidden">
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setShowUpload(false)}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    !showUpload 
                      ? 'bg-white text-[#121212] border-b-2 border-[#121212]' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    Folders
                  </span>
                </button>
                <button
                  onClick={() => setShowUpload(true)}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    showUpload 
                      ? 'bg-white text-[#121212] border-b-2 border-[#121212]' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload
                  </span>
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-4">
                {!showUpload ? (
                  /* Folders Tab */
                  <div className="space-y-4">
                    {/* Quick Create */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="New folder name..."
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && newProjectName.trim() && createProject()}
                        className="flex-1 px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#121212]/20 focus:border-[#121212]"
                      />
                      <button
                        onClick={createProject}
                        disabled={!newProjectName.trim()}
                        className="px-4 py-2.5 bg-[#121212] text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="hidden sm:inline">Create</span>
                      </button>
                    </div>

                    {/* Folder List */}
                    {projects.length > 0 ? (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {projects.map((project, idx) => (
                          <div 
                            key={project.id}
                            className={`p-3 rounded-lg border transition-all cursor-pointer ${
                              selectedProjectId === project.id 
                                ? 'border-[#121212] bg-gray-50 shadow-sm' 
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                            }`}
                            onClick={() => setSelectedProjectId(selectedProjectId === project.id ? null : project.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                                  selectedProjectId === project.id ? 'bg-[#121212] text-white' : 'bg-gray-200 text-gray-600'
                                }`}>
                                  {idx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 truncate">{project.name}</p>
                                  <p className="text-xs text-gray-500">{project.media.length} media</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                {/* Reorder buttons */}
                                <button
                                  onClick={(e) => { e.stopPropagation(); moveProject(project.id, 'up'); }}
                                  disabled={idx === 0}
                                  className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                  title="Move up"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                  </svg>
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); moveProject(project.id, 'down'); }}
                                  disabled={idx === projects.length - 1}
                                  className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                  title="Move down"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                                {/* Delete button */}
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id); }}
                                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                  title="Delete folder"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            
                            {/* Expanded folder details */}
                            {selectedProjectId === project.id && (
                              <div className="mt-3 pt-3 border-t border-gray-200 space-y-3" onClick={(e) => e.stopPropagation()}>
                                {/* Description input */}
                                <div>
                                  <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
                                  <textarea
                                    value={editingDescriptionInline === project.id ? inlineDescriptionValue : (project.description || '')}
                                    onChange={(e) => {
                                      if (editingDescriptionInline !== project.id) {
                                        setEditingDescriptionInline(project.id);
                                        setInlineDescriptionValue(e.target.value);
                                      } else {
                                        setInlineDescriptionValue(e.target.value);
                                      }
                                    }}
                                    onBlur={() => {
                                      if (editingDescriptionInline === project.id) {
                                        handleSaveInlineDescription(project.id);
                                      }
                                    }}
                                    placeholder="Add a description..."
                                    rows={2}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#121212]/20 focus:border-[#121212] resize-none"
                                  />
                                </div>
                                
                                {/* Quick action buttons */}
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setShowUpload(true);
                                    }}
                                    className="flex-1 px-3 py-2 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Media
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <p className="text-sm">No folders yet</p>
                        <p className="text-xs text-gray-400 mt-1">Create your first folder above</p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Upload Tab */
                  <div className="space-y-4">
                    {/* Folder Selection */}
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1.5 block">Upload to folder</label>
                      <select
                        value={selectedProjectId || ''}
                        onChange={(e) => setSelectedProjectId(e.target.value || null)}
                        className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#121212]/20 focus:border-[#121212] bg-white"
                      >
                        <option value="">Select a folder...</option>
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      {!selectedProjectId && projects.length === 0 && (
                        <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Create a folder first in the Folders tab
                        </p>
                      )}
                    </div>

                    {/* File Drop Zone */}
                    <div 
                      className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                        uploadFiles.length > 0 
                          ? 'border-green-400 bg-green-50' 
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {uploadFiles.length > 0 ? (
                        <div>
                          <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <p className="font-medium text-green-700">{uploadFiles.length} file{uploadFiles.length > 1 ? 's' : ''} selected</p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUploadFiles([]);
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="text-xs text-green-600 hover:text-green-800 mt-1 underline"
                          >
                            Clear selection
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <p className="font-medium text-gray-700">Tap to select files</p>
                          <p className="text-xs text-gray-500 mt-1">Photos & Videos (max 50MB)</p>
                        </div>
                      )}
                    </div>

                    {/* Selected Files Preview */}
                    {uploadFiles.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500">Selected files</label>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {uploadFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg text-sm">
                              <span className="truncate flex-1 text-gray-700">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => setUploadFiles(uploadFiles.filter((_, i) => i !== idx))}
                                className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Optional Title/Description */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Title (optional)</label>
                        <input
                          type="text"
                          placeholder="Add a title for all files..."
                          value={uploadTitle}
                          onChange={(e) => setUploadTitle(e.target.value)}
                          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#121212]/20 focus:border-[#121212]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Description (optional)</label>
                        <textarea
                          placeholder="Add a description..."
                          value={uploadDescription}
                          onChange={(e) => setUploadDescription(e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#121212]/20 focus:border-[#121212] resize-none"
                        />
                      </div>
                    </div>

                    {/* Upload Button */}
                    <button
                      onClick={handleAddMedia}
                      disabled={!selectedProjectId || uploadFiles.length === 0}
                      className="w-full py-3 bg-[#121212] text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Upload {uploadFiles.length > 0 ? `${uploadFiles.length} File${uploadFiles.length > 1 ? 's' : ''}` : 'Media'}
                    </button>
                  </div>
                )}
              </div>
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

        {/* Portfolio Projects Display */}
        {projects.length > 0 ? (
          <div>

            {/* Display selected project (for non-admin) or all projects (for admin) */}
            {isAdmin ? (
              // Admin view: Simplified grid-based media management
              <div className="space-y-8">
                {projects.map((project) => (
                  <div key={project.id} className="portfolio-project bg-white/60 rounded-xl p-4 md:p-6 border border-gray-200">
                    {/* Folder Header - Compact */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        {editingProjectNameInline === project.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={inlineProjectNameValue}
                              onChange={(e) => setInlineProjectNameValue(e.target.value)}
                              className="font-bold text-lg md:text-xl text-gray-800 px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:border-[#121212] flex-1 min-w-0"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveInlineProjectName(project.id);
                                else if (e.key === 'Escape') handleCancelInlineProjectName();
                              }}
                            />
                            <button onClick={() => handleSaveInlineProjectName(project.id)} className="p-1.5 bg-[#121212] text-white rounded-lg hover:bg-gray-800" title="Save">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </button>
                            <button onClick={handleCancelInlineProjectName} className="p-1.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400" title="Cancel">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg md:text-xl text-gray-800 truncate">{project.name}</h3>
                            <button onClick={() => handleStartEditProjectName(project.id, project.name)} className="p-1 text-gray-400 hover:text-[#121212] transition-colors flex-shrink-0" title="Edit name">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{project.media.length} media</span>
                          </div>
                        )}
                        
                        {/* Description - inline editable */}
                        {editingDescriptionInline === project.id ? (
                          <div className="flex items-start gap-2 mt-2">
                            <textarea
                              value={inlineDescriptionValue}
                              onChange={(e) => setInlineDescriptionValue(e.target.value)}
                              rows={2}
                              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#121212] resize-none"
                              placeholder="Add description..."
                              autoFocus
                            />
                            <button onClick={() => handleSaveInlineDescription(project.id)} className="p-1.5 bg-[#121212] text-white rounded-lg hover:bg-gray-800" title="Save">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </button>
                            <button onClick={handleCancelInlineDescription} className="p-1.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400" title="Cancel">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-start gap-1 mt-1">
                            <p className={`text-sm flex-1 ${project.description ? 'text-gray-600' : 'text-gray-400 italic'}`}>
                              {project.description || 'No description'}
                            </p>
                            <button onClick={() => handleStartEditDescription(project.id, project.description || '')} className="p-0.5 text-gray-400 hover:text-[#121212] transition-colors flex-shrink-0" title="Edit description">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Quick Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => { setSelectedProjectId(project.id); setShowUpload(true); }}
                          className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                          title="Add media"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          title="Delete folder"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>

                    {/* Media Grid - Simple and Clean */}
                    {project.media.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {project.media.map((media) => (
                          <div key={media.id} className="group relative bg-gray-100 rounded-lg overflow-hidden">
                            {/* Media editing mode */}
                            {editingMedia?.projectId === project.id && editingMedia?.mediaId === media.id ? (
                              <div className="p-3 bg-white border border-gray-200 rounded-lg space-y-2">
                                <div className="aspect-video bg-gray-100 rounded overflow-hidden mb-2">
                                  {media.type === 'video' ? (
                                    <video src={media.url} className="w-full h-full object-cover" preload="metadata" />
                                  ) : (
                                    <img src={media.url} alt="" className="w-full h-full object-cover" />
                                  )}
                                </div>
                                <input
                                  type="text"
                                  value={editingMedia.field === 'title' ? inlineMediaValue : (media.title || '')}
                                  onChange={(e) => {
                                    if (editingMedia.field !== 'title') {
                                      setEditingMedia({ ...editingMedia, field: 'title' });
                                      setInlineMediaValue(e.target.value);
                                    } else {
                                      setInlineMediaValue(e.target.value);
                                    }
                                  }}
                                  onFocus={() => {
                                    if (editingMedia.field !== 'title') {
                                      setEditingMedia({ ...editingMedia, field: 'title' });
                                      setInlineMediaValue(media.title || '');
                                    }
                                  }}
                                  placeholder="Title"
                                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-[#121212]"
                                />
                                <textarea
                                  value={editingMedia.field === 'description' ? inlineMediaValue : (media.description || '')}
                                  onChange={(e) => {
                                    if (editingMedia.field !== 'description') {
                                      setEditingMedia({ ...editingMedia, field: 'description' });
                                      setInlineMediaValue(e.target.value);
                                    } else {
                                      setInlineMediaValue(e.target.value);
                                    }
                                  }}
                                  onFocus={() => {
                                    if (editingMedia.field !== 'description') {
                                      setEditingMedia({ ...editingMedia, field: 'description' });
                                      setInlineMediaValue(media.description || '');
                                    }
                                  }}
                                  placeholder="Description"
                                  rows={2}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-[#121212] resize-none"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={handleSaveInlineMedia}
                                    className="flex-1 py-1.5 bg-[#121212] text-white text-xs font-medium rounded hover:bg-gray-800 transition-colors"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={handleCancelInlineMedia}
                                    className="flex-1 py-1.5 bg-gray-200 text-gray-700 text-xs font-medium rounded hover:bg-gray-300 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* Normal media display */
                              <div className="aspect-square relative">
                                {media.type === 'video' ? (
                                  <video src={media.url} className="w-full h-full object-cover" preload="metadata" />
                                ) : (
                                  <img src={media.url} alt={media.title || ''} className="w-full h-full object-cover" loading="lazy" />
                                )}
                                
                                {/* Overlay with actions */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                  <button
                                    onClick={() => handleStartEditMedia(project.id, media.id, 'title', media.title || '')}
                                    className="p-2 bg-white text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                                    title="Edit title & description"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMedia(project.id, media.id)}
                                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                    title="Delete"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                  </button>
                                </div>
                                
                                {/* Media type indicator */}
                                {media.type === 'video' && (
                                  <div className="absolute top-2 left-2 p-1 bg-black/50 rounded">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                  </div>
                                )}
                                
                                {/* Title/Description indicator */}
                                {(media.title || media.description) && (
                                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                                    {media.title && <p className="text-white text-xs font-medium truncate">{media.title}</p>}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                        <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm">No media yet</p>
                        <button
                          onClick={() => { setSelectedProjectId(project.id); setShowUpload(true); }}
                          className="mt-2 text-xs text-green-600 hover:text-green-700 font-medium"
                        >
                          + Add media
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              // Public view: Show selected project with gallery (mobile: swipe + tap to expand)
              <div 
                className="portfolio-project relative"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {projects[selectedProjectIndex] && (
                  <>
                    {/* Project Navigation Arrows - Desktop & Mobile */}
                    {projects.length > 1 && (
                      <div className="flex items-center justify-center gap-4 md:gap-8 mb-6 md:mb-8 relative" style={{ zIndex: 9999 }}>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedProjectIndex((prev) => (prev > 0 ? prev - 1 : projects.length - 1));
                          }}
                          className="p-3 md:p-4 bg-[#121212] text-white rounded-full hover:bg-gray-800 transition-colors shadow-lg hover:scale-110 transition-transform relative"
                          style={{ zIndex: 10000, pointerEvents: 'auto' }}
                          aria-label="Previous project"
                          type="button"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-6 md:h-6">
                            <path d="M15 18l-6-6 6-6"/>
                          </svg>
                        </button>
                        
                        <div className="text-center relative" style={{ zIndex: 9999 }}>
                          <span className="text-xs md:text-sm text-gray-500">
                            {selectedProjectIndex + 1} / {projects.length}
                          </span>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedProjectIndex((prev) => (prev < projects.length - 1 ? prev + 1 : 0));
                          }}
                          className="p-3 md:p-4 bg-[#121212] text-white rounded-full hover:bg-gray-800 transition-colors shadow-lg hover:scale-110 transition-transform relative"
                          style={{ zIndex: 10000, pointerEvents: 'auto' }}
                          aria-label="Next project"
                          type="button"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-6 md:h-6">
                            <path d="M9 18l6-6-6-6"/>
                          </svg>
                        </button>
                      </div>
                    )}

                    {/* Project Header */}
                    <div className="mb-6 md:mb-8 text-center">
                      {editingProjectNameInline === projects[selectedProjectIndex].id ? (
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <input
                            type="text"
                            value={inlineProjectNameValue}
                            onChange={(e) => setInlineProjectNameValue(e.target.value)}
                            className="font-display text-2xl md:text-5xl text-gray-800 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#121212] text-center"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveInlineProjectName(projects[selectedProjectIndex].id);
                              } else if (e.key === 'Escape') {
                                handleCancelInlineProjectName();
                              }
                            }}
                          />
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => handleSaveInlineProjectName(projects[selectedProjectIndex].id)}
                              className="px-3 py-1 bg-[#121212] text-white text-xs rounded hover:bg-gray-800 transition-colors"
                              title="Save"
                            >
                              ✓
                            </button>
                            <button
                              onClick={handleCancelInlineProjectName}
                              className="px-3 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500 transition-colors"
                              title="Cancel"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <h3 className="font-display text-2xl md:text-5xl text-gray-800">
                            {projects[selectedProjectIndex].name}
                          </h3>
                          {isAdmin && (
                            <button
                              onClick={() => handleStartEditProjectName(projects[selectedProjectIndex].id, projects[selectedProjectIndex].name)}
                              className="p-1 text-gray-500 hover:text-[#121212] transition-colors"
                              title="Edit folder name"
                            >
                              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      )}
                      {/* Desktop: Show description in header */}
                      {!isMobile && (
                        <div className="flex items-center justify-center gap-2 max-w-2xl mx-auto px-4">
                          {editingDescriptionInline === projects[selectedProjectIndex].id ? (
                            <div className="flex items-start gap-2 w-full">
                              <textarea
                                value={inlineDescriptionValue}
                                onChange={(e) => setInlineDescriptionValue(e.target.value)}
                                rows={3}
                                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#121212] resize-none"
                                placeholder="Folder description"
                              />
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => handleSaveInlineDescription(projects[selectedProjectIndex].id)}
                                  className="px-3 py-1 bg-[#121212] text-white text-xs rounded hover:bg-gray-800 transition-colors"
                                  title="Save"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={handleCancelInlineDescription}
                                  className="px-3 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500 transition-colors"
                                  title="Cancel"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {projects[selectedProjectIndex].description ? (
                                <p className="text-base md:text-lg text-gray-700 font-light italic leading-relaxed flex-1 max-w-3xl mx-auto text-center px-4 py-3 border-l-2 border-gray-300 pl-6">
                                  {projects[selectedProjectIndex].description}
                                </p>
                              ) : (
                                <p className="text-base md:text-lg text-gray-400 italic flex-1 text-center">No description</p>
                              )}
                              {isAdmin && (
                                <button
                                  onClick={() => handleStartEditDescription(projects[selectedProjectIndex].id, projects[selectedProjectIndex].description || '')}
                                  className="p-1 text-gray-500 hover:text-[#121212] transition-colors"
                                  title="Edit description"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      )}
                      
                      {/* Mobile: Swipe indicator (swipe still works in addition to arrows) */}
                      {isMobile && projects.length > 1 && (
                        <p className="text-xs text-gray-400 mt-2">Swipe left/right or use arrows to switch projects</p>
                      )}
                    </div>

                    {/* Project Gallery - Mobile: thumbnails grid, tap to see full media */}
                    {/* Desktop: full gallery grid */}
                    {projects[selectedProjectIndex].media.length > 0 ? (
                      <>
                        {expandedProjectId === projects[selectedProjectIndex].id ? (
                          // Expanded view: Show all media in gallery (centered and bigger on desktop)
                          <div className="flex justify-center">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full max-w-6xl">
                            {projects[selectedProjectIndex].media.map((media, index) => (
                              <div
                                key={media.id}
                                className="group relative bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                              >
                                <div className="relative overflow-hidden">
                                  {media.type === 'video' ? (
                                    <video
                                      src={media.url}
                                      controls
                                      className="w-full h-auto object-contain"
                                      preload="metadata"
                                    />
                                  ) : (
                                    <img
                                      src={media.url}
                                      alt={media.title || 'Portfolio media'}
                                      className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105"
                                      loading="lazy"
                                      decoding="async"
                                    />
                                  )}
                                </div>
                                {(media.title || media.description || isAdmin) && (
                                  <div className="p-4">
                                    {editingMedia?.projectId === projects[selectedProjectIndex].id && editingMedia?.mediaId === media.id && editingMedia?.field === 'title' ? (
                                      <div className="flex items-start gap-2 mb-2">
                                        <input
                                          type="text"
                                          value={inlineMediaValue}
                                          onChange={(e) => setInlineMediaValue(e.target.value)}
                                          className="flex-1 px-2 py-1 text-sm font-bold border border-gray-300 rounded focus:outline-none focus:border-[#121212]"
                                          placeholder="Media title"
                                          autoFocus
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              handleSaveInlineMedia();
                                            } else if (e.key === 'Escape') {
                                              handleCancelInlineMedia();
                                            }
                                          }}
                                        />
                                        <div className="flex flex-col gap-1">
                                          <button
                                            onClick={handleSaveInlineMedia}
                                            className="px-2 py-1 bg-[#121212] text-white text-xs rounded hover:bg-gray-800 transition-colors"
                                            title="Save"
                                          >
                                            ✓
                                          </button>
                                          <button
                                            onClick={handleCancelInlineMedia}
                                            className="px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500 transition-colors"
                                            title="Cancel"
                                          >
                                            ×
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2 mb-1">
                                        {media.title ? (
                                          <h4 className="font-bold text-gray-800 flex-1">{media.title}</h4>
                                        ) : (
                                          <h4 className="font-bold text-gray-400 italic flex-1 text-sm">No title</h4>
                                        )}
                                        {isAdmin && (
                                          <button
                                            onClick={() => handleStartEditMedia(projects[selectedProjectIndex].id, media.id, 'title', media.title || '')}
                                            className="p-1 text-gray-500 hover:text-[#121212] transition-colors"
                                            title="Edit title"
                                          >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                          </button>
                                        )}
                                      </div>
                                    )}
                                    {editingMedia?.projectId === projects[selectedProjectIndex].id && editingMedia?.mediaId === media.id && editingMedia?.field === 'description' ? (
                                      <div className="flex items-start gap-2">
                                        <textarea
                                          value={inlineMediaValue}
                                          onChange={(e) => setInlineMediaValue(e.target.value)}
                                          rows={2}
                                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#121212] resize-none"
                                          placeholder="Media description"
                                          autoFocus
                                          onKeyDown={(e) => {
                                            if (e.key === 'Escape') {
                                              handleCancelInlineMedia();
                                            }
                                          }}
                                        />
                                        <div className="flex flex-col gap-1">
                                          <button
                                            onClick={handleSaveInlineMedia}
                                            className="px-2 py-1 bg-[#121212] text-white text-xs rounded hover:bg-gray-800 transition-colors"
                                            title="Save"
                                          >
                                            ✓
                                          </button>
                                          <button
                                            onClick={handleCancelInlineMedia}
                                            className="px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500 transition-colors"
                                            title="Cancel"
                                          >
                                            ×
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-start gap-2">
                                        {media.description ? (
                                          <p className="text-sm text-gray-600 flex-1">{media.description}</p>
                                        ) : (
                                          <p className="text-sm text-gray-400 italic flex-1">No description</p>
                                        )}
                                        {isAdmin && (
                                          <button
                                            onClick={() => handleStartEditMedia(projects[selectedProjectIndex].id, media.id, 'description', media.description || '')}
                                            className="p-1 text-gray-500 hover:text-[#121212] transition-colors flex-shrink-0"
                                            title="Edit description"
                                          >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                            </div>
                          </div>
                        ) : (
                          // Preview/Thumbnail view (mobile shows grid, tap to expand; desktop shows centered larger grid)
                          <div 
                            className={isMobile 
                              ? `flex flex-wrap justify-center items-center gap-4 ${projects[selectedProjectIndex].media.length <= 2 ? 'gap-6' : ''}` 
                              : "flex justify-center items-center"
                            }
                            onClick={() => isMobile && setExpandedProjectId(projects[selectedProjectIndex].id)}
                            style={{ cursor: isMobile ? 'pointer' : 'default' }}
                          >
                            <div className={isMobile ? 'w-full' : 'w-full max-w-6xl'}>
                              <div className={isMobile 
                                ? 'flex flex-wrap justify-center items-center gap-4' 
                                : 'grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 justify-items-center'
                              }>
                                {projects[selectedProjectIndex].media.slice(0, isMobile ? 4 : undefined).map((media, index) => (
                                  <div
                                    key={media.id}
                                    className={`group relative bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ${
                                      isMobile && projects[selectedProjectIndex].media.length === 1 ? 'w-[90%] max-w-lg' : 
                                      isMobile && projects[selectedProjectIndex].media.length === 2 ? 'w-[80%] max-w-md' : 
                                      isMobile && projects[selectedProjectIndex].media.length >= 3 ? 'w-[48%]' :
                                      'w-full max-w-md'
                                    }`}
                                  >
                                <div className="relative overflow-hidden">
                                  {media.type === 'video' ? (
                                    <video
                                      src={media.url}
                                      controls={!isMobile}
                                      className="w-full h-auto object-contain"
                                      preload="metadata"
                                      onClick={(e) => isMobile && e.preventDefault()}
                                    />
                                  ) : (
                                    <img
                                      src={media.url}
                                      alt={media.title || 'Portfolio media'}
                                      className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105"
                                      loading="lazy"
                                      decoding="async"
                                    />
                                  )}
                                </div>
                                {/* Desktop: Show title and description, Mobile: Show description only */}
                                {(!isMobile && (media.title || media.description || isAdmin)) || (isMobile && (media.description || isAdmin)) ? (
                                  <div className="p-4">
                                    {/* Title - Desktop only */}
                                    {!isMobile && (
                                      <>
                                        {editingMedia?.projectId === projects[selectedProjectIndex].id && editingMedia?.mediaId === media.id && editingMedia?.field === 'title' ? (
                                          <div className="flex items-start gap-2 mb-2">
                                            <input
                                              type="text"
                                              value={inlineMediaValue}
                                              onChange={(e) => setInlineMediaValue(e.target.value)}
                                              className="flex-1 px-2 py-1 text-sm font-bold border border-gray-300 rounded focus:outline-none focus:border-[#121212]"
                                              placeholder="Media title"
                                              autoFocus
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                  handleSaveInlineMedia();
                                                } else if (e.key === 'Escape') {
                                                  handleCancelInlineMedia();
                                                }
                                              }}
                                            />
                                            <div className="flex flex-col gap-1">
                                              <button
                                                onClick={handleSaveInlineMedia}
                                                className="px-2 py-1 bg-[#121212] text-white text-xs rounded hover:bg-gray-800 transition-colors"
                                                title="Save"
                                              >
                                                ✓
                                              </button>
                                              <button
                                                onClick={handleCancelInlineMedia}
                                                className="px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500 transition-colors"
                                                title="Cancel"
                                              >
                                                ×
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-2 mb-1">
                                            {media.title ? (
                                              <h4 className="font-bold text-gray-800 flex-1">{media.title}</h4>
                                            ) : (
                                              isAdmin && <h4 className="font-bold text-gray-400 italic flex-1 text-sm">No title</h4>
                                            )}
                                            {isAdmin && (
                                              <button
                                                onClick={() => handleStartEditMedia(projects[selectedProjectIndex].id, media.id, 'title', media.title || '')}
                                                className="p-1 text-gray-500 hover:text-[#121212] transition-colors"
                                                title="Edit title"
                                              >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                              </button>
                                            )}
                                          </div>
                                        )}
                                      </>
                                    )}
                                    {/* Description - Desktop and Mobile */}
                                    {editingMedia?.projectId === projects[selectedProjectIndex].id && editingMedia?.mediaId === media.id && editingMedia?.field === 'description' ? (
                                      <div className="flex items-start gap-2">
                                        <textarea
                                          value={inlineMediaValue}
                                          onChange={(e) => setInlineMediaValue(e.target.value)}
                                          rows={2}
                                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#121212] resize-none"
                                          placeholder="Media description"
                                          autoFocus
                                          onKeyDown={(e) => {
                                            if (e.key === 'Escape') {
                                              handleCancelInlineMedia();
                                            }
                                          }}
                                        />
                                        <div className="flex flex-col gap-1">
                                          <button
                                            onClick={handleSaveInlineMedia}
                                            className="px-2 py-1 bg-[#121212] text-white text-xs rounded hover:bg-gray-800 transition-colors"
                                            title="Save"
                                          >
                                            ✓
                                          </button>
                                          <button
                                            onClick={handleCancelInlineMedia}
                                            className="px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500 transition-colors"
                                            title="Cancel"
                                          >
                                            ×
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-start gap-2">
                                        {media.description ? (
                                          <p className="text-sm text-gray-600 flex-1">{media.description}</p>
                                        ) : (
                                          isAdmin && <p className="text-sm text-gray-400 italic flex-1">No description</p>
                                        )}
                                        {isAdmin && (
                                          <button
                                            onClick={() => handleStartEditMedia(projects[selectedProjectIndex].id, media.id, 'description', media.description || '')}
                                            className="p-1 text-gray-500 hover:text-[#121212] transition-colors flex-shrink-0"
                                            title="Edit description"
                                          >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ) : null}
                              </div>
                            ))}
                              </div>
                            </div>
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
                        
                        {/* Mobile: Show project description under photos */}
                        {isMobile && (
                          <div className="mt-6 px-4">
                            {editingDescriptionInline === projects[selectedProjectIndex].id ? (
                              <div className="flex items-start gap-2">
                                <textarea
                                  value={inlineDescriptionValue}
                                  onChange={(e) => setInlineDescriptionValue(e.target.value)}
                                  rows={3}
                                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#121212] resize-none"
                                  placeholder="Folder description"
                                />
                                <div className="flex flex-col gap-1">
                                  <button
                                    onClick={() => handleSaveInlineDescription(projects[selectedProjectIndex].id)}
                                    className="px-3 py-1 bg-[#121212] text-white text-xs rounded hover:bg-gray-800 transition-colors"
                                    title="Save"
                                  >
                                    ✓
                                  </button>
                                  <button
                                    onClick={handleCancelInlineDescription}
                                    className="px-3 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500 transition-colors"
                                    title="Cancel"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start gap-2">
                                {projects[selectedProjectIndex].description ? (
                                  <p className="text-base md:text-lg text-gray-700 font-light italic leading-relaxed flex-1 px-4 py-3 border-l-2 border-gray-300 pl-6">
                                    {projects[selectedProjectIndex].description}
                                  </p>
                                ) : (
                                  <p className="text-base md:text-lg text-gray-400 italic flex-1">No description</p>
                                )}
                                {isAdmin && (
                                  <button
                                    onClick={() => handleStartEditDescription(projects[selectedProjectIndex].id, projects[selectedProjectIndex].description || '')}
                                    className="p-1 text-gray-500 hover:text-[#121212] transition-colors flex-shrink-0"
                                    title="Edit description"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                )}
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
