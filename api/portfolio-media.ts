// API endpoint: GET /api/portfolio-media?projectId=xxx
// Returns media list for a specific project

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

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { projectId } = req.query;

  if (!projectId || typeof projectId !== 'string') {
    return res.status(400).json({ error: 'projectId is required' });
  }

  try {
    // Get media from KV
    const { getProjectMedia } = await import('./kv-utils');
    const media = await getProjectMedia(projectId);

    // Sort by order
    media.sort((a, b) => a.order - b.order);

    // Add public URLs and map to frontend format
    const mediaWithUrls = media.map(item => ({
      ...item,
      projectId, // Add projectId for frontend
      key: item.r2Key, // Frontend compatibility
      url: getPublicUrl(item.r2Key),
      thumbnail: item.type === 'image' ? getPublicUrl(item.r2Key) : getPublicUrl(item.r2Key.replace(/\.(mp4|webm|mov)$/, '.jpg')),
    }));

    return res.status(200).json(mediaWithUrls);
  } catch (error) {
    console.error('Error fetching media:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch media',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
