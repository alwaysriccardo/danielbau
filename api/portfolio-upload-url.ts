// API endpoint: POST /api/portfolio-upload-url
// Generates presigned URL for direct upload to R2

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

import { generatePresignedUploadUrl } from './r2-utils';
import { verifyAdminToken } from './portfolio-admin-auth';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
    const { projectId, fileName, contentType } = req.body;

    if (!projectId || !fileName || !contentType) {
      return res.status(400).json({ error: 'projectId, fileName, and contentType are required' });
    }

    // Generate unique key
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const extension = fileName.split('.').pop();
    const key = `projects/${projectId}/${timestamp}-${sanitizedFileName}`;

    // Generate presigned URL (expires in 1 hour)
    const uploadUrl = await generatePresignedUploadUrl(key, contentType, 3600);

    return res.status(200).json({
      uploadUrl,
      key,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return res.status(500).json({ 
      error: 'Failed to generate upload URL',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
