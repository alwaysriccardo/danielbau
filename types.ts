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
