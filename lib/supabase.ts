// Supabase client setup
// Install: npm install @supabase/supabase-js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set. Portfolio will use localStorage fallback.');
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database types
export interface PortfolioMedia {
  id: string;
  url: string;
  type: 'image' | 'video';
  title?: string;
  description?: string;
  uploaded_at: string;
}

export interface PortfolioProject {
  id: string;
  name: string;
  description?: string;
  media: PortfolioMedia[];
  order: number;
  created_at: string;
}

// Portfolio API functions
export const portfolioAPI = {
  // Fetch all projects
  async getProjects(): Promise<PortfolioProject[]> {
    if (!supabase) {
      // Fallback to localStorage
      const stored = localStorage.getItem('danielbau_portfolio_projects');
      return stored ? JSON.parse(stored) : [];
    }

    try {
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select('*')
        .order('order', { ascending: true });

      if (error) throw error;

      // Transform data to match frontend format
      return (data || []).map((project: any) => ({
        id: project.id,
        name: project.name,
        description: project.description || '',
        media: (project.media || []).map((m: any) => ({
          id: m.id,
          url: m.url,
          type: m.type,
          title: m.title,
          description: m.description,
          uploadedAt: m.uploaded_at || m.uploadedAt || new Date().toISOString()
        })),
        order: project.order || 0,
        createdAt: project.created_at
      }));
    } catch (error) {
      console.error('Error fetching projects:', error);
      // Fallback to localStorage
      const stored = localStorage.getItem('danielbau_portfolio_projects');
      return stored ? JSON.parse(stored) : [];
    }
  },

  // Create a new project
  async createProject(name: string, description?: string): Promise<PortfolioProject | null> {
    if (!supabase) {
      // Fallback to localStorage
      const newProject: PortfolioProject = {
        id: Date.now().toString(),
        name,
        description: description || '',
        media: [],
        order: 0,
        createdAt: new Date().toISOString()
      };
      const existing = JSON.parse(localStorage.getItem('danielbau_portfolio_projects') || '[]');
      existing.push(newProject);
      localStorage.setItem('danielbau_portfolio_projects', JSON.stringify(existing));
      return newProject;
    }

    try {
      const { data, error } = await supabase
        .from('portfolio_projects')
        .insert({
          name,
          description: description || '',
          media: [],
          order: 0,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        media: data.media || [],
        order: data.order || 0,
        createdAt: data.created_at
      };
    } catch (error) {
      console.error('Error creating project:', error);
      return null;
    }
  },

  // Update a project
  async updateProject(projectId: string, updates: Partial<PortfolioProject>): Promise<boolean> {
    if (!supabase) {
      // Fallback to localStorage
      const existing = JSON.parse(localStorage.getItem('danielbau_portfolio_projects') || '[]');
      const index = existing.findIndex((p: PortfolioProject) => p.id === projectId);
      if (index !== -1) {
        existing[index] = { ...existing[index], ...updates };
        localStorage.setItem('danielbau_portfolio_projects', JSON.stringify(existing));
        return true;
      }
      return false;
    }

    try {
      const { error } = await supabase
        .from('portfolio_projects')
        .update({
          name: updates.name,
          description: updates.description,
          media: updates.media,
          order: updates.order
        })
        .eq('id', projectId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating project:', error);
      return false;
    }
  },

  // Delete a project
  async deleteProject(projectId: string): Promise<boolean> {
    if (!supabase) {
      // Fallback to localStorage
      const existing = JSON.parse(localStorage.getItem('danielbau_portfolio_projects') || '[]');
      const filtered = existing.filter((p: PortfolioProject) => p.id !== projectId);
      localStorage.setItem('danielbau_portfolio_projects', JSON.stringify(filtered));
      return true;
    }

    try {
      const { error } = await supabase
        .from('portfolio_projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  },

  // Reorder projects
  async reorderProjects(projectIds: string[]): Promise<boolean> {
    if (!supabase) {
      // Fallback to localStorage
      const existing = JSON.parse(localStorage.getItem('danielbau_portfolio_projects') || '[]');
      const reordered = projectIds.map((id, index) => {
        const project = existing.find((p: PortfolioProject) => p.id === id);
        return { ...project, order: index };
      });
      localStorage.setItem('danielbau_portfolio_projects', JSON.stringify(reordered));
      return true;
    }

    try {
      // Update each project's order
      const updates = projectIds.map((id, index) =>
        supabase
          .from('portfolio_projects')
          .update({ order: index })
          .eq('id', id)
      );

      await Promise.all(updates);
      return true;
    } catch (error) {
      console.error('Error reordering projects:', error);
      return false;
    }
  },

  // Upload file to Supabase Storage
  async uploadMedia(file: File, projectId?: string): Promise<string | null> {
    if (!supabase) {
      // Fallback to base64 for localStorage mode
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    }

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = projectId 
        ? `${projectId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        : `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `portfolio/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('portfolio-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('portfolio-media')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading media to storage:', error);
      // Fallback to base64 if storage fails
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    }
  },

  // Migrate base64 media to Supabase Storage
  // This runs automatically in the background and updates the database
  async migrateBase64ToStorage(): Promise<void> {
    if (!supabase) {
      console.log('Migration skipped: Supabase not configured');
      return;
    }

    // Check if migration already completed
    const migrationKey = 'danielbau_migration_completed';
    if (localStorage.getItem(migrationKey) === 'true') {
      return; // Migration already completed
    }

    try {
      // Check if storage bucket exists by trying to list it
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      if (bucketError) {
        console.log('Migration skipped: Cannot access storage buckets');
        return;
      }
      
      const bucketExists = buckets?.some(b => b.name === 'portfolio-media');
      if (!bucketExists) {
        console.log('Migration skipped: portfolio-media bucket does not exist yet');
        return; // Bucket doesn't exist, skip migration (will run when bucket is created)
      }

      console.log('Starting base64 to Storage migration...');
      
      // Fetch all projects
      const projects = await portfolioAPI.getProjects();
      let migratedCount = 0;
      let errorCount = 0;

      // Process each project
      for (const project of projects) {
        if (!project.media || project.media.length === 0) continue;

        let hasChanges = false;
        const updatedMedia = await Promise.all(
          project.media.map(async (media) => {
            // Check if URL is base64
            if (!media.url || !media.url.startsWith('data:')) {
              return media; // Already migrated or not base64
            }

            try {
              // Convert base64 to File
              const base64Data = media.url;
              const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
              if (!matches) {
                console.warn(`Invalid base64 format for media ${media.id}`);
                return media;
              }

              const mimeType = matches[1];
              const base64String = matches[2];
              const byteCharacters = atob(base64String);
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              
              // Determine file extension from mime type
              let fileExt = 'jpg';
              if (mimeType.includes('png')) fileExt = 'png';
              else if (mimeType.includes('gif')) fileExt = 'gif';
              else if (mimeType.includes('webp')) fileExt = 'webp';
              else if (mimeType.includes('video') || mimeType.includes('mp4')) fileExt = 'mp4';
              else if (mimeType.includes('webm')) fileExt = 'webm';

              const fileName = `${media.id}.${fileExt}`;
              const file = new File([byteArray], fileName, { type: mimeType });

              // Upload to Storage
              const storageUrl = await portfolioAPI.uploadMedia(file, project.id);
              
              if (storageUrl && !storageUrl.startsWith('data:')) {
                // Only update if we got a Storage URL (not base64 fallback)
                hasChanges = true;
                migratedCount++;
                console.log(`Migrated media ${media.id} from base64 to Storage`);
                return {
                  ...media,
                  url: storageUrl
                };
              } else {
                errorCount++;
                console.warn(`Failed to upload media ${media.id} to Storage, keeping base64`);
                return media;
              }
            } catch (error) {
              errorCount++;
              console.error(`Error migrating media ${media.id}:`, error);
              return media; // Keep original on error
            }
          })
        );

        // Update project if any media was migrated
        if (hasChanges) {
          const success = await portfolioAPI.updateProject(project.id, {
            ...project,
            media: updatedMedia
          });
          if (!success) {
            console.error(`Failed to update project ${project.id} after migration`);
          }
        }
      }

      // Mark migration as completed only if we successfully migrated at least one item
      // or if there were no base64 items to migrate
      if (migratedCount > 0) {
        localStorage.setItem(migrationKey, 'true');
        console.log(`Migration completed: ${migratedCount} media items migrated, ${errorCount} errors`);
      } else if (errorCount === 0) {
        // No base64 items found, mark as completed
        localStorage.setItem(migrationKey, 'true');
        console.log('Migration completed: No base64 media found to migrate');
      } else {
        console.warn(`Migration completed with errors: ${migratedCount} migrated, ${errorCount} errors`);
      }
    } catch (error) {
      console.error('Error during migration:', error);
      // Don't mark as completed if there was a critical error
    }
  }
};
