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
      
      // For videos, try to get presigned URL for better MIME type support
      // Fallback to public URL if presigned fails
      let videoUrl = baseUrl;
      let thumbnailUrl = baseUrl;
      
      if (item.type === 'video') {
        try {
          // Use presigned URLs for both playback and thumbnails to ensure correct MIME types
          videoUrl = await generatePresignedGetUrl(item.r2Key, 3600);
          thumbnailUrl = await generatePresignedGetUrl(item.r2Key, 3600); // Same URL, used for thumbnail
        } catch (error) {
          console.warn('Failed to generate presigned URL for video, using public URL:', error);
          videoUrl = baseUrl;
          thumbnailUrl = baseUrl;
        }
      }
      
      return {
        ...item,
        projectId, // Add projectId for frontend
        key: item.r2Key, // Frontend compatibility
        url: item.type === 'video' ? videoUrl : baseUrl,
        // For videos, use presigned URL for thumbnail (ensures correct MIME type)
        // For images, use the image URL
        thumbnail: item.type === 'video' ? thumbnailUrl : baseUrl,
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
