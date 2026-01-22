// API endpoint: POST /api/portfolio-admin-media (create metadata after upload)
// API endpoint: DELETE /api/portfolio-admin-media (delete media)
// API endpoint: PATCH /api/portfolio-admin-media (reorder)

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
import { verifyAdminToken } from './portfolio-admin-auth.js';
import { deleteObject } from './r2-utils.js';
import { getProjectMedia, saveProjectMedia, getProjects, saveProjects } from './kv-utils.js';

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
      const { projectId, key, type, media } = req.body;
      
      // Support both single and batch creation
      if (media && Array.isArray(media)) {
        // Batch creation - process all at once to avoid race conditions
        if (!projectId) {
          return res.status(400).json({ error: 'projectId is required' });
        }

        const projectMedia = await getProjectMedia(projectId);
        const baseOrder = projectMedia.length;
        
        const newMediaItems = media.map((item: { key: string; type: string }, index: number) => {
          const uniqueId = `media-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 9)}`;
          return {
            id: uniqueId,
            type: item.type,
            r2Key: item.key,
            order: baseOrder + index,
            createdAt: new Date().toISOString(),
          };
        });

        projectMedia.push(...newMediaItems);
        await saveProjectMedia(projectId, projectMedia);

        // Update project cover image if this is the first media
        if (projectMedia.length === newMediaItems.length) {
          const firstImage = newMediaItems.find(m => m.type === 'image');
          if (firstImage) {
            const projects = await getProjects();
            const project = projects.find(p => p.id === projectId);
            if (project) {
              project.coverKey = firstImage.r2Key;
              await saveProjects(projects);
            }
          }
        }

        return res.status(201).json({
          success: true,
          count: newMediaItems.length,
          media: newMediaItems.map(item => ({
            ...item,
            projectId,
            key: item.r2Key,
          })),
        });
      } else {
        // Single creation (backward compatibility)
        if (!projectId || !key || !type) {
          return res.status(400).json({ error: 'projectId, key, and type are required' });
        }

        const projectMedia = await getProjectMedia(projectId);
        
        // Generate unique ID with timestamp and random component to avoid collisions
        const uniqueId = `media-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        const newMedia = {
          id: uniqueId,
          type,
          r2Key: key,
          order: projectMedia.length,
          createdAt: new Date().toISOString(),
        };

        projectMedia.push(newMedia);
        await saveProjectMedia(projectId, projectMedia);

        // Update project cover image if it's the first media
        if (projectMedia.length === 1 && type === 'image') {
          const projects = await getProjects();
          const project = projects.find(p => p.id === projectId);
          if (project) {
            project.coverKey = key;
            await saveProjects(projects);
          }
        }

        return res.status(201).json({
          ...newMedia,
          projectId,
          key: newMedia.r2Key,
        });
      }
    }

    if (req.method === 'DELETE') {
      // Delete media
      const { mediaId, projectId } = req.query;
      if (!mediaId || typeof mediaId !== 'string' || !projectId || typeof projectId !== 'string') {
        return res.status(400).json({ error: 'mediaId and projectId are required' });
      }

      const projectMedia = await getProjectMedia(projectId);
      const mediaIndex = projectMedia.findIndex(m => m.id === mediaId);
      
      if (mediaIndex === -1) {
        return res.status(404).json({ error: 'Media not found' });
      }

      const media = projectMedia[mediaIndex];
      
      // Delete file from R2
      try {
        await deleteObject(media.r2Key);
      } catch (error) {
        console.error('Error deleting file from R2:', error);
        // Continue even if file deletion fails
      }

      // Remove from array
      projectMedia.splice(mediaIndex, 1);
      await saveProjectMedia(projectId, projectMedia);

      // Update project cover if this was the cover image
      const projects = await getProjects();
      const project = projects.find(p => p.id === projectId);
      if (project && project.coverKey === media.r2Key) {
        // Set new cover to first image, or null if no images left
        const firstImage = projectMedia.find(m => m.type === 'image');
        project.coverKey = firstImage ? firstImage.r2Key : null;
        await saveProjects(projects);
      }

      return res.status(200).json({ success: true });
    }

    if (req.method === 'PATCH') {
      // Reorder media
      const { projectId, mediaIds } = req.body;
      if (!projectId || !Array.isArray(mediaIds)) {
        return res.status(400).json({ error: 'projectId and mediaIds array are required' });
      }

      const projectMedia = await getProjectMedia(projectId);
      
      // Reorder based on mediaIds array
      const reorderedMedia = mediaIds.map((mediaId: string, index: number) => {
        const media = projectMedia.find(m => m.id === mediaId);
        if (media) {
          return { ...media, order: index };
        }
        return null;
      }).filter(Boolean) as any[];

      // Add any media not in the reorder list (shouldn't happen, but safety check)
      projectMedia.forEach(media => {
        if (!reorderedMedia.find(m => m.id === media.id)) {
          reorderedMedia.push({ ...media, order: reorderedMedia.length });
        }
      });

      await saveProjectMedia(projectId, reorderedMedia);

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Admin media error:', error);
    return res.status(500).json({ 
      error: 'Operation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
