// Vercel Serverless Function for Facebook Portfolio
// This file should be in /api/facebook-portfolio.ts for Vercel deployment

// Types for Vercel serverless functions
interface VercelRequest {
  method?: string;
  query?: Record<string, string | string[]>;
  body?: any;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
}

interface FacebookPhoto {
  id: string;
  picture: string;
  source?: string;
  created_time: string;
  message?: string; // Replaces deprecated 'name' field
  link?: string;
}

interface FacebookVideo {
  id: string;
  picture: string;
  source?: string;
  embed_html?: string;
  created_time: string;
  message?: string; // Replaces deprecated 'name' field
  description?: string;
  link?: string;
}

interface PortfolioItem {
  id: string;
  type: 'photo' | 'video';
  thumbnail: string;
  fullSize?: string;
  url: string;
  createdAt: string;
  caption?: string;
}

// Simple in-memory cache (for production, consider using Redis or Vercel KV)
let cache: {
  data: PortfolioItem[];
  timestamp: number;
} | null = null;

const CACHE_DURATION = 3600000; // 1 hour in milliseconds

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check cache first
  if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
    return res.status(200).json(cache.data);
  }

  try {
    const pageId = process.env.FACEBOOK_PAGE_ID;
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

    if (!pageId || !accessToken) {
      return res.status(500).json({ 
        error: 'Facebook credentials not configured. Please set FACEBOOK_PAGE_ID and FACEBOOK_ACCESS_TOKEN environment variables.' 
      });
    }

    const portfolioItems: PortfolioItem[] = [];

    // Fetch photos (only uploaded photos from posts, excludes profile/cover photos)
    try {
      // Using type=uploaded ensures we only get photos uploaded to the page (not profile/cover)
      // Note: 'name' field is deprecated, using 'message' or 'description' instead
      // Request large picture size for high-quality thumbnails
      const photosResponse = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}/photos?fields=id,picture.type(large),source,created_time,message,link&limit=50&type=uploaded&access_token=${accessToken}`
      );
      
      const photosData = await photosResponse.json();
      
      if (!photosResponse.ok) {
        console.error('Photos API Error:', photosData);
        // Don't throw, just log - continue to try videos
      } else {
        const photos: FacebookPhoto[] = photosData.data || [];
        
        photos.forEach((photo) => {
          // Use source (full size) for thumbnail if available, otherwise use large picture
          const highQualityThumbnail = photo.source || photo.picture;
          portfolioItems.push({
            id: photo.id,
            type: 'photo',
            thumbnail: highQualityThumbnail,
            fullSize: photo.source || photo.picture,
            url: photo.link || `https://www.facebook.com/photo/?fbid=${photo.id}`,
            createdAt: photo.created_time,
            caption: photo.message, // Use 'message' instead of deprecated 'name'
          });
        });
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    }

    // Fetch videos
    try {
      // Request large picture size for high-quality video thumbnails
      const videosResponse = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}/videos?fields=id,picture.type(large),source,embed_html,created_time,message,description,link&limit=50&access_token=${accessToken}`
      );
      
      const videosData = await videosResponse.json();
      
      if (!videosResponse.ok) {
        console.error('Videos API Error:', videosData);
        // Return error details if both fail
        if (portfolioItems.length === 0) {
          return res.status(500).json({ 
            error: 'Failed to fetch portfolio data',
            details: videosData.error?.message || 'Unknown error',
            facebookError: videosData.error
          });
        }
      } else {
        const videos: FacebookVideo[] = videosData.data || [];
        
        videos.forEach((video) => {
          portfolioItems.push({
            id: video.id,
            type: 'video',
            thumbnail: video.picture,
            fullSize: video.source,
            embedHtml: video.embed_html, // Store embed HTML if available
            url: video.link || `https://www.facebook.com/video.php?v=${video.id}`,
            createdAt: video.created_time,
            caption: video.message || video.description, // Use 'message' instead of deprecated 'name'
          });
        });
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      if (portfolioItems.length === 0) {
        return res.status(500).json({ 
          error: 'Failed to fetch portfolio data',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Sort by creation date (newest first)
    portfolioItems.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Limit to 30 most recent items
    const limitedItems = portfolioItems.slice(0, 30);

    // Update cache
    cache = {
      data: limitedItems,
      timestamp: Date.now(),
    };

    return res.status(200).json(limitedItems);
  } catch (error) {
    console.error('Error fetching Facebook portfolio:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch portfolio data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
