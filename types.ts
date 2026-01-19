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

export interface PortfolioItem {
  id: string;
  type: 'photo' | 'video';
  thumbnail: string;
  fullSize?: string;
  url: string;
  createdAt: string;
  caption?: string;
}
