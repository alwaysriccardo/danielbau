// API endpoint: GET /api/portfolio-projects
// Returns list of all projects with cover images

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
import { getPublicUrl } from './r2-utils';
import { getProjects } from './kv-utils';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get projects from KV
    const projects = await getProjects();

    // Map KV schema to frontend format
    const projectsWithUrls = await Promise.all(projects.map(async (project) => {
      // Get media count for this project
      const { getProjectMedia } = await import('./kv-utils');
      const media = await getProjectMedia(project.id);
      
      return {
        ...project,
        name: project.title, // Frontend compatibility
        coverImage: project.coverKey ? getPublicUrl(project.coverKey) : undefined,
        mediaCount: media.length,
        updatedAt: project.createdAt, // Use createdAt as updatedAt for now
      };
    }));

    // Sort by order
    projectsWithUrls.sort((a, b) => a.order - b.order);

    return res.status(200).json(projectsWithUrls);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch projects',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
