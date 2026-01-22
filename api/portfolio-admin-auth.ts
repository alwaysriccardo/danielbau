// API endpoint: POST /api/portfolio-admin-auth
// Authenticates admin user

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

const ADMIN_USERNAME = 'danielmirciov';
const ADMIN_PASSWORD = 'Mirciov1*';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Generate a simple session token (in production, use proper JWT)
      const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
      
      return res.status(200).json({ 
        success: true,
        token,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      });
    }

    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ 
      error: 'Authentication failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Helper function to verify token (used by other admin endpoints)
// Simple check - just verifies token format (not secure, but simple)
// Token is base64 encoded "username:timestamp" from client
export function verifyAdminToken(token: string): boolean {
  if (!token) return false;
  try {
    // Decode base64 (Node.js compatible)
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    // Token format: "username:timestamp"
    if (decoded.includes('danielmirciov:')) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
