import { ServiceItem } from './types';

export const SERVICES: ServiceItem[] = [
  {
    id: 1,
    number: "01",
    title: "MALERARBEITEN & FLIESEN",
    subtitle: "Anstrich & Gestaltung",
    description: "Professionelle Malerarbeiten, Tapetenverlegung und dekorative Techniken. Von Innen- und Außenanstrichen bis hin zu Isolierung, Bodenverlegung und Putzarbeiten – wir veredeln Ihre Räume mit Präzision.",
    image: "/images/interior-1.jpg",
    image2: "/images/bathroom-tiling.jpg", // Second image for split view
    accentColor: "text-red-600"
  },
  {
    id: 2,
    number: "02",
    title: "BODEN & FASSADE",
    subtitle: "Komplettlösungen",
    description: "Hochwertige Bodenverlegung mit Holz, Laminat und Fliesen. Fassadenrenovierung und Isolierung für optimalen Schutz und Energieeffizienz. Wir schaffen langlebige, ästhetische Oberflächen.",
    image: "/images/interior-2.jpg",
    image2: "/images/interior-2-1.jpg", // Second image for split view
    accentColor: "text-green-600"
  },
  {
    id: 3,
    number: "03",
    title: "INNENAUSBAU",
    subtitle: "Komplettrenovierung",
    description: "Von der Planung bis zur Schlüsselübergabe. Wir koordinieren und realisieren Ihren kompletten Innenausbau effizient und sauber – Malerei, Boden, Putz und mehr.",
    image: "/images/interior-3.gif", // GIF for service 03
    accentColor: "text-blue-600"
  },
  {
    id: 4,
    number: "04",
    title: "PUTZ & ISOLIERUNG",
    subtitle: "Fachgerechte Ausführung",
    description: "Professionelle Putzarbeiten für perfekte Wandoberflächen. Isolierungsarbeiten für optimale Energieeffizienz und Komfort in Ihrem Zuhause.",
    image: "/images/interior-4.jpg",
    image2: "/images/interior-4-1.jpg", // Second image for split view
    accentColor: "text-amber-600"
  }
];

export const IMAGES = {
  HERO: "/images/hero-hardwood.jpg", // Replace with interior image featuring hardwood floors
  FOOTER_BG: "/images/interior-1.jpg" // Using one of the interior images
};
