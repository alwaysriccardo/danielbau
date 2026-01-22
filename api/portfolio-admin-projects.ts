// API endpoint: POST /api/portfolio-admin-projects (create)
// API endpoint: DELETE /api/portfolio-admin-projects (delete)
// API endpoint: PATCH /api/portfolio-admin-projects (update/reorder)

// Types for Vercel serverless functions
interface VercelRequest {
  method?: string;
  query?: Record<string, string | string[]>;
  body?: any;
  headers?: Record<string, string | string[] | undefined>;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
}
import { verifyAdminToken } from './portfolio-admin-auth';
import { getPublicUrl, deleteObject } from './r2-utils';
import { getProjects, saveProjects, getProjectMedia, deleteProjectMedia } from './kv-utils';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Verify admin authentication
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.substring(7);
  if (!verifyAdminToken(token)) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  try {
    if (req.method === 'POST') {
      // Create new project
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'name is required' });
      }

      const projects = await getProjects();
      const newProject = {
        id: `project-${Date.now()}`,
        title: name,
        coverKey: null,
        order: projects.length,
        createdAt: new Date().toISOString(),
      };

      projects.push(newProject);
      await saveProjects(projects);

      // Return with coverImage URL for frontend
      return res.status(201).json({
        ...newProject,
        name: newProject.title,
        coverImage: null,
        mediaCount: 0,
        updatedAt: newProject.createdAt,
      });
    }

    if (req.method === 'DELETE') {
      // Delete project
      const { projectId } = req.query;
      if (!projectId || typeof projectId !== 'string') {
        return res.status(400).json({ error: 'projectId is required' });
      }

      const projects = await getProjects();
      const projectIndex = projects.findIndex(p => p.id === projectId);
      
      if (projectIndex === -1) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Get all media for this project and delete files from R2
      const media = await getProjectMedia(projectId);
      for (const item of media) {
        try {
          await deleteObject(item.r2Key);
        } catch (error) {
          console.error('Error deleting file from R2:', error);
          // Continue even if file deletion fails
        }
      }

      // Delete media metadata from KV
      await deleteProjectMedia(projectId);

      // Remove project from list
      projects.splice(projectIndex, 1);
      await saveProjects(projects);

      return res.status(200).json({ success: true });
    }

    if (req.method === 'PATCH') {
      // Update project (rename or reorder)
      const { projectId, name, order } = req.body;
      if (!projectId) {
        return res.status(400).json({ error: 'projectId is required' });
      }

      const projects = await getProjects();
      const project = projects.find(p => p.id === projectId);
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      if (name !== undefined) {
        project.title = name;
      }
      if (order !== undefined) {
        project.order = order;
      }

      // Reorder all projects if needed
      if (order !== undefined) {
        projects.sort((a, b) => a.order - b.order);
        projects.forEach((p, index) => {
          p.order = index;
        });
      }

      await saveProjects(projects);

      // Return with coverImage URL for frontend
      return res.status(200).json({
        ...project,
        name: project.title,
        coverImage: project.coverKey ? getPublicUrl(project.coverKey) : null,
        mediaCount: (await getProjectMedia(projectId)).length,
        updatedAt: project.createdAt,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Admin projects error:', error);
    return res.status(500).json({ 
      error: 'Operation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
