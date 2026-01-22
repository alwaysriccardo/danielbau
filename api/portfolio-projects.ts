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
import { getPublicUrl } from './r2-utils.js';
import { getProjects } from './kv-utils.js';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify environment variables are set
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    const kvNamespaceId = process.env.CLOUDFLARE_KV_NAMESPACE_ID;

    if (!accountId || !apiToken || !kvNamespaceId) {
      const missing = [];
      if (!accountId) missing.push('CLOUDFLARE_ACCOUNT_ID');
      if (!apiToken) missing.push('CLOUDFLARE_API_TOKEN');
      if (!kvNamespaceId) missing.push('CLOUDFLARE_KV_NAMESPACE_ID');
      
      return res.status(500).json({ 
        error: 'KV credentials not configured',
        details: `Missing environment variables: ${missing.join(', ')}`,
        missing
      });
    }

    // Get projects from KV
    const projects = await getProjects();

    // Map KV schema to frontend format
    const projectsWithUrls = await Promise.all(projects.map(async (project) => {
      // Get media count for this project
      const { getProjectMedia } = await import('./kv-utils.js');
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Log detailed error for debugging
    console.error('Error details:', {
      message: errorMessage,
      hasAccountId: !!process.env.CLOUDFLARE_ACCOUNT_ID,
      hasApiToken: !!process.env.CLOUDFLARE_API_TOKEN,
      hasKvNamespace: !!process.env.CLOUDFLARE_KV_NAMESPACE_ID,
      accountIdLength: process.env.CLOUDFLARE_ACCOUNT_ID?.length,
      apiTokenLength: process.env.CLOUDFLARE_API_TOKEN?.length,
      namespaceIdLength: process.env.CLOUDFLARE_KV_NAMESPACE_ID?.length,
    });
    
    return res.status(500).json({ 
      error: 'Failed to fetch projects',
      details: errorMessage
    });
  }
}
