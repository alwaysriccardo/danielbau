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
  async uploadMedia(file: File): Promise<string | null> {
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
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
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
  }
};
