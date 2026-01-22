export interface ServiceItem {
  id: number;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  image2?: string; // Optional second image for split view
  accentColor: string;
}

export interface NavLink {
  label: string;
  href: string;
}

// Portfolio types
// KV Schema: {id, title, createdAt, coverKey, order}
export interface PortfolioProject {
  id: string;
  title: string; // KV uses 'title'
  name?: string; // Frontend compatibility
  coverKey?: string; // KV uses 'coverKey' (R2 key)
  coverImage?: string; // Frontend uses 'coverImage' (full URL)
  mediaCount?: number; // Computed, not in KV
  order: number;
  createdAt: string;
  updatedAt?: string; // Frontend compatibility
}

// KV Schema: {id, type, r2Key, createdAt, order}
export interface PortfolioMedia {
  id: string;
  projectId?: string; // Not in KV, but used in frontend
  r2Key: string; // KV uses 'r2Key' (R2 object key)
  key?: string; // Frontend compatibility
  type: 'image' | 'video';
  order: number;
  createdAt: string;
  url?: string; // Computed from r2Key (full URL)
  thumbnail?: string; // Computed for videos
}

export interface PresignedUploadUrl {
  uploadUrl: string;
  key: string;
  expiresIn: number;
}
