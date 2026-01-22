// Utility functions for Cloudflare Workers KV
// KV is accessed via environment variable in Vercel serverless functions

// KV namespace binding (set in Vercel environment variables)
// In Vercel, we'll use KV via REST API since we can't bind directly

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN;
const kvNamespaceId = process.env.CLOUDFLARE_KV_NAMESPACE_ID;

if (!accountId || !apiToken || !kvNamespaceId) {
  console.warn('Cloudflare KV credentials not configured. Portfolio features will not work.');
}

// KV REST API base URL
const kvApiUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${kvNamespaceId}`;

// Helper to make KV API requests
async function kvRequest(method: string, key: string, value?: string): Promise<string | null> {
  const url = `${kvApiUrl}/values/${encodeURIComponent(key)}`;
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${apiToken}`,
  };

  if (method === 'GET') {
    // Verify credentials are set
    if (!accountId || !apiToken || !kvNamespaceId) {
      throw new Error('KV credentials not configured. Check environment variables: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, CLOUDFLARE_KV_NAMESPACE_ID');
    }

    const response = await fetch(url, { method: 'GET', headers });
    
    if (response.status === 404) return null;
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('KV GET failed:', {
        status: response.status,
        statusText: response.statusText,
        url: url,
        errorText: errorText.substring(0, 200),
        hasAccountId: !!accountId,
        hasApiToken: !!apiToken,
        hasNamespaceId: !!kvNamespaceId
      });
      throw new Error(`KV GET failed: ${response.status} ${response.statusText} - ${errorText.substring(0, 100)}`);
    }
    
    const contentType = response.headers.get('content-type');
    const text = await response.text();
    
    // Check if response is actually JSON or just text
    if (!text || text.trim().length === 0) return null;
    
    // Log if we get unexpected content type
    if (contentType && !contentType.includes('application/json') && !contentType.includes('text/plain')) {
      console.warn('Unexpected content type from KV:', contentType, 'Response:', text.substring(0, 100));
    }
    
    return text;
  }

  if (method === 'PUT') {
    headers['Content-Type'] = 'text/plain';
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: value,
    });
    if (!response.ok) throw new Error(`KV PUT failed: ${response.statusText}`);
    return 'ok';
  }

  if (method === 'DELETE') {
    const response = await fetch(url, { method: 'DELETE', headers });
    if (!response.ok && response.status !== 404) {
      throw new Error(`KV DELETE failed: ${response.statusText}`);
    }
    return 'ok';
  }

  throw new Error(`Unsupported method: ${method}`);
}

// Get projects list
export async function getProjects(): Promise<any[]> {
  try {
    const data = await kvRequest('GET', 'projects');
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch (parseError) {
      console.error('Failed to parse projects JSON:', parseError);
      console.error('Raw data received:', data);
      return [];
    }
  } catch (error) {
    console.error('Error getting projects from KV:', error);
    throw error; // Re-throw so caller can see the error
  }
}

// Save projects list
export async function saveProjects(projects: any[]): Promise<void> {
  try {
    await kvRequest('PUT', 'projects', JSON.stringify(projects));
  } catch (error) {
    console.error('Error saving projects to KV:', error);
    throw error;
  }
}

// Get media for a project
export async function getProjectMedia(projectId: string): Promise<any[]> {
  try {
    const data = await kvRequest('GET', `project:${projectId}:media`);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch (parseError) {
      console.error('Failed to parse media JSON:', parseError);
      console.error('Raw data received:', data);
      return [];
    }
  } catch (error) {
    console.error('Error getting media from KV:', error);
    return [];
  }
}

// Save media for a project
export async function saveProjectMedia(projectId: string, media: any[]): Promise<void> {
  try {
    await kvRequest('PUT', `project:${projectId}:media`, JSON.stringify(media));
  } catch (error) {
    console.error('Error saving media to KV:', error);
    throw error;
  }
}

// Delete project media key
export async function deleteProjectMedia(projectId: string): Promise<void> {
  try {
    await kvRequest('DELETE', `project:${projectId}:media`);
  } catch (error) {
    console.error('Error deleting media from KV:', error);
    // Don't throw - might not exist
  }
}
