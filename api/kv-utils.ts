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
    const response = await fetch(url, { method: 'GET', headers });
    if (response.status === 404) return null;
    if (!response.ok) {
      let errorText = '';
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorJson = await response.json();
          errorText = JSON.stringify(errorJson);
        } catch {
          errorText = await response.text();
        }
      } else {
        errorText = await response.text();
      }
      console.error('KV GET error:', response.status, response.statusText, errorText);
      throw new Error(`KV GET failed: ${response.statusText} - ${errorText}`);
    }
    const text = await response.text();
    // Check if response is actually JSON error
    if (text.trim().startsWith('{') && text.includes('"error"')) {
      try {
        const errorJson = JSON.parse(text);
        if (errorJson.error) {
          throw new Error(`KV API Error: ${errorJson.error.message || errorJson.error}`);
        }
      } catch (e) {
        // Not a JSON error, continue
      }
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
    if (!response.ok) {
      let errorText = '';
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorJson = await response.json();
          errorText = JSON.stringify(errorJson);
        } catch {
          errorText = await response.text();
        }
      } else {
        errorText = await response.text();
      }
      console.error('KV PUT error:', response.status, response.statusText, errorText);
      throw new Error(`KV PUT failed: ${response.statusText} - ${errorText}`);
    }
    // KV PUT returns empty body on success, or sometimes a JSON response
    const responseText = await response.text();
    return responseText || 'ok';
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
    // Handle empty string
    if (data.trim() === '') return [];
    try {
      return JSON.parse(data);
    } catch (parseError) {
      console.error('JSON parse error for projects:', parseError, 'Data:', data);
      return [];
    }
  } catch (error) {
    console.error('Error getting projects from KV:', error);
    return [];
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
    // Handle empty string
    if (data.trim() === '') return [];
    try {
      return JSON.parse(data);
    } catch (parseError) {
      console.error('JSON parse error for media:', parseError, 'Data:', data);
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
