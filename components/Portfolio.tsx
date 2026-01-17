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
            invalidateOnRefresh: false // Reduce recalculations
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

        {/* Admin Controls */}
        {isAdmin && (
          <div className="mb-6 p-4 md:p-6 bg-white/50 rounded-lg border border-gray-300 space-y-4">
            <div className="flex flex-col gap-4">
              <div className="text-sm text-gray-700">
                <span className="font-bold">Admin Mode: Active</span>
                <span className="ml-2 text-xs text-gray-500 block mt-1">
                  {(import.meta as any).env?.VITE_SUPABASE_URL 
                    ? '(Changes sync across all devices via Supabase)' 
                    : '(Using localStorage - changes are local to this device)'}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleRefresh}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white text-base uppercase tracking-widest hover:bg-blue-700 transition-colors rounded font-semibold"
                  title="Refresh portfolio (syncs across devices)"
                >
                  Refresh
                </button>
                <button
                  onClick={() => setShowUpload(!showUpload)}
                  className="flex-1 px-4 py-3 bg-[#121212] text-white text-base uppercase tracking-widest hover:bg-gray-800 transition-colors rounded font-semibold"
                >
                  {showUpload ? 'Cancel' : 'Add Media'}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-3 bg-gray-400 text-white text-base uppercase tracking-widest hover:bg-gray-500 transition-colors rounded font-semibold"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Folder Management */}
            <div className="border-t border-gray-300 pt-4 space-y-4">
              {/* Create New Folder */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">Create New Folder</h4>
                <input
                  type="text"
                  placeholder="Folder name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded focus:outline-none focus:border-[#121212]"
                />
                <textarea
                  placeholder="Folder description (optional)"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded focus:outline-none focus:border-[#121212] resize-none"
                />
                <button
                  onClick={createProject}
                  className="w-full px-4 py-3 bg-[#121212] text-white text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors rounded"
                >
                  Create Folder
                </button>
              </div>

              {/* Select/Edit Existing Folder */}
              {projects.length > 0 && (
                <div className="space-y-3 border-t border-gray-300 pt-4">
                  <label className="text-sm font-semibold text-gray-700">Select Folder to Add Media:</label>
                  <select
                    value={selectedProjectId || ''}
                    onChange={(e) => setSelectedProjectId(e.target.value || null)}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded focus:outline-none focus:border-[#121212]"
                  >
                    <option value="">-- Select a folder --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  
                  {/* Edit Folder Button */}
                  {selectedProjectId && (
                    <button
                      onClick={() => {
                        const project = projects.find(p => p.id === selectedProjectId);
                        if (project) handleEditProject(project);
                      }}
                      className="w-full px-4 py-2 bg-blue-600 text-white text-sm uppercase tracking-widest hover:bg-blue-700 transition-colors rounded"
                    >
                      Edit Folder Name/Description
                    </button>
                  )}
                </div>
              )}

              {/* Edit Folder Form */}
              {editingProjectId && (
                <div className="border-t border-gray-300 pt-4 space-y-3 bg-gray-50 p-4 rounded">
                  <h4 className="text-sm font-semibold text-gray-700">Edit Folder</h4>
                  <input
                    type="text"
                    placeholder="Folder name"
                    value={editingProjectName}
                    onChange={(e) => setEditingProjectName(e.target.value)}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded focus:outline-none focus:border-[#121212]"
                  />
                  <textarea
                    placeholder="Folder description"
                    value={editingProjectDescription}
                    onChange={(e) => setEditingProjectDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded focus:outline-none focus:border-[#121212] resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProjectEdit}
                      className="flex-1 px-4 py-2 bg-[#121212] text-white text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 px-4 py-2 bg-gray-400 text-white text-sm uppercase tracking-widest hover:bg-gray-500 transition-colors rounded"
                    >
                      Cancel
                    </button>
                  </div>
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
          <form onSubmit={(e) => { e.preventDefault(); handleAddMedia(); }} className="mb-8 p-4 md:p-6 bg-white/50 rounded-lg border border-gray-300">
            <h3 className="text-lg md:text-xl font-bold mb-4">Add Media to Folder</h3>
            
            {!selectedProjectId && (
              <p className="text-red-600 mb-4">Please select or create a folder first</p>
            )}

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Select Photos/Videos:
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileChange}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded focus:outline-none focus:border-[#121212] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#121212] file:text-white hover:file:bg-gray-800 file:cursor-pointer"
              />
              {uploadFiles.length > 0 && (
                <div className="mt-3 p-3 bg-gray-100 rounded">
                  <p className="text-sm font-semibold mb-2">Selected files ({uploadFiles.length}):</p>
                  <ul className="text-xs text-gray-600 space-y-1 max-h-32 overflow-y-auto">
                    {uploadFiles.map((file, idx) => (
                      <li key={idx} className="flex items-center justify-between">
                        <span className="truncate flex-1">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => setUploadFiles(uploadFiles.filter((_, i) => i !== idx))}
                          className="ml-2 text-red-600 hover:text-red-800 text-xs font-semibold"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadFiles([]);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="mt-2 text-xs text-red-600 hover:text-red-800 font-semibold"
                  >
                    Clear all
                  </button>
                </div>
              )}
              <p className="mt-2 text-xs text-gray-500">
                Max file size: 50MB. Supported: Images (JPG, PNG, GIF, WebP) and Videos (MP4, WebM)
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Media Title (optional):
              </label>
              <input
                type="text"
                placeholder="Enter title for all selected media"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded focus:outline-none focus:border-[#121212]"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Media Description (optional):
              </label>
              <textarea
                placeholder="Enter description for all selected media"
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded focus:outline-none focus:border-[#121212] resize-none"
                rows={3}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={!selectedProjectId || uploadFiles.length === 0}
                className="flex-1 px-6 py-3 text-base bg-[#121212] text-white uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded font-semibold"
              >
                Upload {uploadFiles.length > 0 ? `${uploadFiles.length} ` : ''}Media
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
                className="px-6 py-3 text-base bg-gray-400 text-white uppercase tracking-widest hover:bg-gray-500 transition-colors rounded font-semibold"
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
                  <div className="flex-1">
                    {editingProjectNameInline === project.id ? (
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={inlineProjectNameValue}
                          onChange={(e) => setInlineProjectNameValue(e.target.value)}
                          className="font-display text-3xl md:text-4xl text-gray-800 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#121212] flex-1"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveInlineProjectName(project.id);
                            } else if (e.key === 'Escape') {
                              handleCancelInlineProjectName();
                            }
                          }}
                        />
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleSaveInlineProjectName(project.id)}
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
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-display text-3xl md:text-4xl text-gray-800">
                          {project.name}
                        </h3>
                        {isAdmin && (
                          <button
                            onClick={() => handleStartEditProjectName(project.id, project.name)}
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
                    {editingDescriptionInline === project.id ? (
                      <div className="flex items-start gap-2 mt-2">
                        <textarea
                          value={inlineDescriptionValue}
                          onChange={(e) => setInlineDescriptionValue(e.target.value)}
                          rows={3}
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#121212] resize-none"
                          placeholder="Folder description"
                        />
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleSaveInlineDescription(project.id)}
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
                      <div className="flex items-start gap-2 mt-3">
                        {project.description ? (
                          <p className="text-base md:text-lg text-gray-700 font-light italic leading-relaxed flex-1 px-4 py-3 border-l-2 border-gray-300 pl-6">
                            {project.description}
                          </p>
                        ) : (
                          <p className="text-base md:text-lg text-gray-400 italic flex-1">No description</p>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => handleStartEditDescription(project.id, project.description || '')}
                            className="p-1 text-gray-500 hover:text-[#121212] transition-colors"
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    handleDeleteMedia(project.id, media.id);
                                  }}
                                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                                  aria-label="Delete media"
                                  type="button"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                            </div>
                            {(media.title || media.description || isAdmin) && (
                              <div className="p-4">
                                {editingMedia?.projectId === project.id && editingMedia?.mediaId === media.id && editingMedia?.field === 'title' ? (
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
                                        onClick={() => handleStartEditMedia(project.id, media.id, 'title', media.title || '')}
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
                                {editingMedia?.projectId === project.id && editingMedia?.mediaId === media.id && editingMedia?.field === 'description' ? (
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
                                        onClick={() => handleStartEditMedia(project.id, media.id, 'description', media.description || '')}
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
                    {/* Project Navigation Arrows - Desktop & Mobile */}
                    {projects.length > 1 && (
                      <div className="flex items-center justify-center gap-4 md:gap-8 mb-6 md:mb-8 relative z-50">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedProjectIndex((prev) => (prev > 0 ? prev - 1 : projects.length - 1));
                          }}
                          className="p-3 md:p-4 bg-[#121212] text-white rounded-full hover:bg-gray-800 transition-colors shadow-lg hover:scale-110 transition-transform z-50 pointer-events-auto"
                          aria-label="Previous project"
                          type="button"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-6 md:h-6">
                            <path d="M15 18l-6-6 6-6"/>
                          </svg>
                        </button>
                        
                        <div className="text-center">
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
                          className="p-3 md:p-4 bg-[#121212] text-white rounded-full hover:bg-gray-800 transition-colors shadow-lg hover:scale-110 transition-transform z-50 pointer-events-auto"
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
