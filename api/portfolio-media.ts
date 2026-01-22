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
import { getPublicUrl } from './r2-utils.js';

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
    const { getProjectMedia } = await import('./kv-utils.js');
    const media = await getProjectMedia(projectId);

    // Sort by order
    media.sort((a, b) => a.order - b.order);

    // Add public URLs and map to frontend format
    // For videos, we might need presigned URLs to ensure proper Content-Type headers
    const { generatePresignedGetUrl } = await import('./r2-utils.js');
    
    const mediaWithUrls = await Promise.all(media.map(async (item) => {
      const baseUrl = getPublicUrl(item.r2Key);
      
      // Use presigned URLs for both images and videos to ensure correct MIME types
      // Fallback to public URL if presigned fails
      let mediaUrl = baseUrl;
      let thumbnailUrl = baseUrl;
      
      try {
        // Generate presigned URLs for both images and videos
        mediaUrl = await generatePresignedGetUrl(item.r2Key, 3600);
        thumbnailUrl = await generatePresignedGetUrl(item.r2Key, 3600);
      } catch (error) {
        console.warn('Failed to generate presigned URL, using public URL:', error);
        mediaUrl = baseUrl;
        thumbnailUrl = baseUrl;
      }
      
      return {
        ...item,
        projectId, // Add projectId for frontend
        key: item.r2Key, // Frontend compatibility
        url: mediaUrl,
        // Use presigned URL for thumbnail (ensures correct MIME type for both images and videos)
        thumbnail: thumbnailUrl,
      };
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
