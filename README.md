# DANIELBAU - Premium Interiors

A high-end construction and renovation portfolio website featuring smooth animations, sticky card stacks, and parallax effects. Built with React, TypeScript, GSAP, and Lenis smooth scrolling.

## Features

- 🎨 **Modern Design** - Premium interior design portfolio with elegant animations
- 🌍 **Multi-language Support** - Available in German (DE), English (EN), French (FR), and Italian (IT)
- ✨ **Smooth Animations** - GSAP-powered scroll animations and transitions
- 📱 **Responsive** - Fully responsive design for all devices
- 🎯 **Performance** - Optimized with Vite for fast loading times
- 💬 **WhatsApp Integration** - Direct contact via WhatsApp button
- 🎨 **Interior Renovation Services** - Painting, flooring, plastering, and more
- 🧹 **Cleaning Services** - Professional cleaning solutions

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **GSAP** - Animation library
- **Lenis** - Smooth scrolling
- **Tailwind CSS** - Styling

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/alwaysriccardo/danielbau.git
   cd danielbau
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Add your images to the `public/images/` directory:
   - `hero-hardwood.jpg` - Hero background (interior with hardwood floors)
   - `interior-1.jpg` - First service image
   - `interior-2.jpg` - Second service image
   - `interior-3.jpg` - Third service image
   - `interior-4.jpg` - Fourth service image
   
   See `public/images/README.md` for detailed specifications.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
danielbau/
├── components/          # React components
│   ├── CleaningServices.tsx
│   ├── Footer.tsx
│   ├── Hero.tsx
│   ├── Intro.tsx
│   ├── LanguageSidebar.tsx
│   ├── Navigation.tsx
│   ├── Preloader.tsx
│   ├── ServiceStack.tsx
│   ├── SplitText.tsx
│   └── WhatsAppButton.tsx
├── contexts/            # React contexts
│   └── LanguageContext.tsx
├── public/              # Static assets
│   └── images/          # Image files
├── constants.ts         # App constants and data
├── translations.ts      # Multi-language translations
├── types.ts            # TypeScript type definitions
├── App.tsx             # Main app component
├── index.tsx           # Entry point
└── vite.config.ts      # Vite configuration
```

## License

© 2025 DANIELBAU SCHWEIZ. All rights reserved.
