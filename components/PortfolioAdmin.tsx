import React, { useState, useEffect } from 'react';
import { PortfolioProject, PortfolioMedia } from '../types';

interface PortfolioAdminProps {
  onClose: () => void;
  projects: PortfolioProject[];
  setProjects: React.Dispatch<React.SetStateAction<PortfolioProject[]>>;
}

const PortfolioAdmin: React.FC<PortfolioAdminProps> = ({ onClose, projects, setProjects }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [media, setMedia] = useState<PortfolioMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if already authenticated
  useEffect(() => {
    const token = localStorage.getItem('portfolio_admin_token');
    const expiresAt = localStorage.getItem('portfolio_admin_expires');
    
    if (token && expiresAt && Date.now() < parseInt(expiresAt)) {
      setAdminToken(token);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    // Client-side authentication (password is in code - not secure but simple)
    const ADMIN_USERNAME = 'danielmirciov';
    const ADMIN_PASSWORD = 'Mirciov1*';

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Generate a simple token (just for consistency, not real security)
      const token = btoa(`${username}:${Date.now()}`);
      setAdminToken(token);
      localStorage.setItem('portfolio_admin_token', token);
      localStorage.setItem('portfolio_admin_expires', (Date.now() + 24 * 60 * 60 * 1000).toString()); // 24 hours
      setIsAuthenticated(true);
    } else {
      setAuthError('Invalid credentials');
    }
  };

  const handleLogout = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsAuthenticated(false);
    setAdminToken(null);
    localStorage.removeItem('portfolio_admin_token');
    localStorage.removeItem('portfolio_admin_expires');
    setSelectedProject(null);
    setMedia([]);
  };

  const loadProjectMedia = async (projectId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/portfolio-media?projectId=${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setMedia(data);
      }
    } catch (error) {
      console.error('Error loading media:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6">Admin Login</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>
            {authError && (
              <div className="mb-4 text-red-600 text-sm">{authError}</div>
            )}
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-[#121212] text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Login
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-[#E3E1DC] overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6 md:p-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display">Portfolio Admin</h1>
        </div>

        {/* Projects Management */}
        <ProjectsManager
          projects={projects}
          setProjects={setProjects}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          onProjectSelect={loadProjectMedia}
          adminToken={adminToken!}
          error={error}
          setError={setError}
        />

        {/* Media Management */}
        {selectedProject && (
          <MediaManager
            project={selectedProject}
            media={media}
            setMedia={setMedia}
            adminToken={adminToken!}
            onMediaChange={() => loadProjectMedia(selectedProject.id)}
          />
        )}

        {/* Action Buttons - Placed at bottom for better accessibility */}
        <div className="mt-12 pt-8 border-t border-gray-300 flex justify-end gap-4 pb-8">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleLogout(e);
            }}
            className="px-6 py-3 border border-gray-400 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Logout
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="px-6 py-3 bg-[#121212] text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Projects Manager Component
const ProjectsManager: React.FC<{
  projects: PortfolioProject[];
  setProjects: React.Dispatch<React.SetStateAction<PortfolioProject[]>>;
  selectedProject: PortfolioProject | null;
  setSelectedProject: React.Dispatch<React.SetStateAction<PortfolioProject | null>>;
  onProjectSelect: (projectId: string) => void;
  adminToken: string;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}> = ({ projects, setProjects, selectedProject, setSelectedProject, onProjectSelect, adminToken, error, setError }) => {
  const [newProjectName, setNewProjectName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    try {
      setCreating(true);
      setError(null);
      const response = await fetch('/api/portfolio-admin-projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ name: newProjectName }),
      });

      const data = await response.json();

      if (response.ok) {
        setProjects([...projects, data]);
        setNewProjectName('');
        setError(null);
      } else {
        setError(data.error || data.details || 'Failed to create project');
        console.error('Error creating project:', data);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create project';
      setError(errorMessage);
      console.error('Error creating project:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? All media will be deleted.')) {
      return;
    }

    try {
      const response = await fetch(`/api/portfolio-admin-projects?projectId=${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      if (response.ok) {
        setProjects(projects.filter(p => p.id !== projectId));
        if (selectedProject?.id === projectId) {
          setSelectedProject(null);
        }
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleRenameProject = async (projectId: string, newName: string) => {
    try {
      const response = await fetch('/api/portfolio-admin-projects', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ projectId, name: newName }),
      });

      if (response.ok) {
        setProjects(projects.map(p => p.id === projectId ? { ...p, name: newName, title: newName } : p));
      }
    } catch (error) {
      console.error('Error renaming project:', error);
    }
  };

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-4">Projects</h2>
      
      {/* Create New Project */}
      <div className="mb-6">
        <div className="flex gap-4 mb-2">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="New project name"
            className="flex-1 px-4 py-2 border rounded-lg"
            onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
          />
          <button
            onClick={handleCreateProject}
            disabled={creating || !newProjectName.trim()}
            className="px-6 py-2 bg-[#121212] text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
        </div>
        {error && (
          <div className="text-red-600 text-sm mt-2">{error}</div>
        )}
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            isSelected={selectedProject?.id === project.id}
            onSelect={() => {
              setSelectedProject(project);
              onProjectSelect(project.id);
            }}
            onDelete={handleDeleteProject}
            onRename={handleRenameProject}
          />
        ))}
      </div>
    </div>
  );
};

// Project Card Component
const ProjectCard: React.FC<{
  project: PortfolioProject;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
}> = ({ project, isSelected, onSelect, onDelete, onRename }) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(project.name || project.title);

  const handleRename = () => {
    const currentName = project.name || project.title;
    if (newName.trim() && newName !== currentName) {
      onRename(project.id, newName.trim());
    }
    setIsRenaming(false);
  };

  return (
    <div
      className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
        isSelected ? 'border-[#121212] bg-gray-50' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onSelect}
    >
      {isRenaming ? (
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onBlur={handleRename}
          onKeyPress={(e) => e.key === 'Enter' && handleRename()}
          className="w-full px-2 py-1 border rounded text-sm"
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-semibold text-sm">{project.name || project.title}</h3>
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setIsRenaming(true)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Rename
              </button>
              <button
                onClick={() => onDelete(project.id)}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-600">{project.mediaCount} items</p>
        </>
      )}
    </div>
  );
};

// Media Manager Component
const MediaManager: React.FC<{
  project: PortfolioProject;
  media: PortfolioMedia[];
  setMedia: React.Dispatch<React.SetStateAction<PortfolioMedia[]>>;
  adminToken: string;
  onMediaChange: () => void;
}> = ({ project, media, setMedia, adminToken, onMediaChange }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    const fileArray = Array.from(files);
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];
    const successfulUploads: Array<{ key: string; type: string }> = [];

    try {
      // Step 1: Upload all files to R2 first
      for (const file of fileArray) {
        try {
          // Get presigned URL
          const urlResponse = await fetch('/api/portfolio-upload-url', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${adminToken}`,
            },
            body: JSON.stringify({
              projectId: project.id,
              fileName: file.name,
              contentType: file.type,
            }),
          });

          if (!urlResponse.ok) {
            const errorData = await urlResponse.json().catch(() => ({ error: 'Failed to get upload URL' }));
            throw new Error(errorData.error || `Failed to get upload URL: ${urlResponse.status}`);
          }

          const { uploadUrl, key } = await urlResponse.json();

          if (!uploadUrl || !key) {
            throw new Error('Invalid response from upload URL endpoint');
          }

          // Upload directly to R2
          const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type,
            },
          });

          if (!uploadResponse.ok) {
            throw new Error(`Failed to upload to R2: ${uploadResponse.status}`);
          }

          // Store successful upload for batch metadata creation
          successfulUploads.push({
            key,
            type: file.type.startsWith('video/') ? 'video' : 'image',
          });

          successCount++;
          console.log(`Successfully uploaded to R2: ${file.name}`);
        } catch (fileError) {
          failCount++;
          const errorMessage = fileError instanceof Error ? fileError.message : 'Unknown error';
          errors.push(`${file.name}: ${errorMessage}`);
          console.error(`Error uploading ${file.name}:`, fileError);
        }
      }

      // Step 2: Create all metadata in a single batch request to avoid race conditions
      if (successfulUploads.length > 0) {
        try {
          const batchResponse = await fetch('/api/portfolio-admin-media', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${adminToken}`,
            },
            body: JSON.stringify({
              projectId: project.id,
              media: successfulUploads, // Send array of {key, type}
            }),
          });

          if (!batchResponse.ok) {
            const errorData = await batchResponse.json().catch(() => ({ error: 'Failed to create metadata' }));
            throw new Error(errorData.error || `Failed to create metadata: ${batchResponse.status}`);
          }

          console.log(`Successfully created metadata for ${successfulUploads.length} file(s)`);
        } catch (batchError) {
          console.error('Error creating metadata batch:', batchError);
          // Don't count this as a file failure since files were uploaded successfully
          errors.push(`Metadata creation failed: ${batchError instanceof Error ? batchError.message : 'Unknown error'}`);
        }
      }

      // Refresh media list after all uploads
      await onMediaChange();

      // Show results
      if (failCount > 0) {
        alert(`${successCount} file(s) uploaded successfully. ${failCount} file(s) failed:\n${errors.join('\n')}`);
      } else if (successCount > 0) {
        console.log(`All ${successCount} file(s) uploaded successfully`);
      }
    } catch (error) {
      console.error('Error in upload process:', error);
      alert('Upload process failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm('Delete this media item?')) return;

    try {
      const response = await fetch(`/api/portfolio-admin-media?mediaId=${mediaId}&projectId=${project.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      if (response.ok) {
        onMediaChange();
      }
    } catch (error) {
      console.error('Error deleting media:', error);
    }
  };

  const handleReorder = async (newOrder: PortfolioMedia[]) => {
    try {
      await fetch('/api/portfolio-admin-media', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          projectId: project.id,
          mediaIds: newOrder.map(m => m.id),
        }),
      });

      setMedia(newOrder);
    } catch (error) {
      console.error('Error reordering:', error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Media: {project.name || project.title}</h2>
      
      {/* Upload Button */}
      <div className="mb-6">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
          id="media-upload"
        />
        <label
          htmlFor="media-upload"
          className="inline-block px-6 py-2 bg-[#121212] text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
        >
          {uploading ? 'Uploading...' : 'Upload Images/Videos'}
        </label>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {media.map((item, index) => (
          <div key={item.id} className="relative group">
            <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
              {item.type === 'image' ? (
                <img 
                  src={item.url} 
                  alt={`Media ${index + 1}`} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Image load error in admin:', e);
                    console.error('Image URL:', item.url);
                    console.error('Image key:', item.key || item.r2Key);
                  }}
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
                      console.error('Video thumbnail error in admin:', e);
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
            <button
              onClick={() => handleDeleteMedia(item.id)}
              className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {/* Reorder buttons */}
            <div className="absolute bottom-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {index > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const newOrder = [...media];
                    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
                    handleReorder(newOrder);
                  }}
                  className="p-1 bg-black/50 text-white rounded text-xs"
                >
                  ↑
                </button>
              )}
              {index < media.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const newOrder = [...media];
                    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                    handleReorder(newOrder);
                  }}
                  className="p-1 bg-black/50 text-white rounded text-xs"
                >
                  ↓
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortfolioAdmin;
