import { SamplePhoto, EnhancementPreset } from '../types';

// Helper to generate crisp SVG data URLs for sample photography
function createSampleSvgUrl(
  title: string,
  category: string,
  gradientStart: string,
  gradientEnd: string,
  accentColor: string,
  iconShape: 'portrait' | 'building' | 'car' | 'mountain' | 'product' | 'cyberpunk'
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${gradientStart}"/>
        <stop offset="100%" stop-color="${gradientEnd}"/>
      </linearGradient>
      <linearGradient id="glowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="${accentColor}" stop-opacity="0"/>
      </linearGradient>
      <radialGradient id="sunGlow" cx="70%" cy="30%" r="50%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
        <stop offset="40%" stop-color="${accentColor}" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="${gradientStart}" stop-opacity="0"/>
      </radialGradient>
      <filter id="noiseFilter">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.08 0"/>
      </filter>
    </defs>
    
    <!-- Background -->
    <rect width="1280" height="720" fill="url(#bgGrad)"/>
    <rect width="1280" height="720" fill="url(#sunGlow)"/>
    
    <!-- Micro Texture Simulation -->
    <rect width="1280" height="720" filter="url(#noiseFilter)" opacity="0.6"/>

    <!-- Shapes and Scene elements based on category -->
    ${
      iconShape === 'cyberpunk'
        ? `
      <!-- Cyberpunk Skyline & Grid -->
      <path d="M 0 520 L 1280 520" stroke="${accentColor}" stroke-width="2" opacity="0.6"/>
      <path d="M 100 520 L 250 240 L 400 520 Z" fill="#0d1117" stroke="${accentColor}" stroke-width="2"/>
      <path d="M 350 520 L 520 180 L 680 520 Z" fill="#161b22" stroke="#ec4899" stroke-width="2"/>
      <path d="M 620 520 L 780 220 L 940 520 Z" fill="#0d1117" stroke="${accentColor}" stroke-width="2"/>
      <path d="M 900 520 L 1050 280 L 1200 520 Z" fill="#161b22" stroke="#a855f7" stroke-width="2"/>
      <!-- Neon horizon -->
      <rect x="0" y="520" width="1280" height="200" fill="#05070a" opacity="0.95"/>
      <path d="M 0 530 L 1280 530" stroke="#f43f5e" stroke-width="3" opacity="0.7"/>
      <path d="M 0 560 L 1280 560" stroke="${accentColor}" stroke-width="2" opacity="0.4"/>
      <path d="M 0 620 L 1280 620" stroke="${accentColor}" stroke-width="1" opacity="0.25"/>
    `
        : iconShape === 'portrait'
        ? `
      <!-- Studio Portrait Silhouette & Softbox Rim -->
      <circle cx="640" cy="300" r="160" fill="#1e293b" stroke="${accentColor}" stroke-width="4"/>
      <path d="M 400 650 C 440 450, 840 450, 880 650 Z" fill="#0f172a" stroke="${accentColor}" stroke-width="3"/>
      <!-- Softbox glow effect -->
      <ellipse cx="640" cy="280" rx="90" ry="120" fill="url(#glowGrad)" opacity="0.3"/>
    `
        : iconShape === 'building'
        ? `
      <!-- Modern Architectural Geometry -->
      <polygon points="200,680 500,120 750,220 550,680" fill="#1e293b" stroke="${accentColor}" stroke-width="3"/>
      <polygon points="550,680 750,220 1080,180 920,680" fill="#0f172a" stroke="#60a5fa" stroke-width="3"/>
      <!-- Window grid patterns -->
      <line x1="300" y1="500" x2="480" y2="240" stroke="#ffffff" stroke-width="2" opacity="0.5"/>
      <line x1="600" y1="520" x2="720" y2="300" stroke="#ffffff" stroke-width="2" opacity="0.5"/>
    `
        : iconShape === 'mountain'
        ? `
      <!-- Mountain Range & Golden Hour Sun -->
      <polygon points="0,680 320,320 640,680" fill="#1e293b"/>
      <polygon points="280,680 720,220 1100,680" fill="#0f172a" stroke="${accentColor}" stroke-width="2"/>
      <polygon points="680,680 980,360 1280,680" fill="#1e293b"/>
      <circle cx="920" cy="180" r="80" fill="#fef08a" opacity="0.85"/>
      <!-- Lake reflection -->
      <rect x="0" y="580" width="1280" height="140" fill="#090d16" opacity="0.9"/>
      <line x1="0" y1="580" x2="1280" y2="580" stroke="${accentColor}" stroke-width="2" opacity="0.5"/>
    `
        : iconShape === 'product'
        ? `
      <!-- Commercial Product Podium & Spotlights -->
      <ellipse cx="640" cy="560" rx="280" ry="60" fill="#1e293b" stroke="${accentColor}" stroke-width="3"/>
      <rect x="520" y="240" width="240" height="320" rx="30" fill="#0f172a" stroke="${accentColor}" stroke-width="3"/>
      <circle cx="640" cy="380" r="50" fill="url(#glowGrad)"/>
    `
        : `
      <!-- Automotive Streamlined Curves -->
      <path d="M 200 520 C 350 510, 420 380, 680 360 C 900 350, 1020 440, 1150 520 Z" fill="#0f172a" stroke="${accentColor}" stroke-width="4"/>
      <circle cx="380" cy="520" r="60" fill="#1e293b" stroke="${accentColor}" stroke-width="4"/>
      <circle cx="960" cy="520" r="60" fill="#1e293b" stroke="${accentColor}" stroke-width="4"/>
      <line x1="100" y1="580" x2="1180" y2="580" stroke="${accentColor}" stroke-width="3" opacity="0.6"/>
    `
    }

    <!-- Cinematic Vignette Overlay -->
    <rect width="1280" height="720" fill="none" stroke="#000000" stroke-width="40" opacity="0.4"/>
    
    <!-- Top-Left SaaS Meta badge -->
    <rect x="36" y="36" width="220" height="42" rx="8" fill="#030712" fill-opacity="0.75" stroke="#374151"/>
    <text x="50" y="62" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold">SOURCE: 1080P HD (2.1 MP)</text>

    <!-- Center Category & Title -->
    <text x="640" y="650" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="28" font-weight="900" letter-spacing="2">${title.toUpperCase()}</text>
    <text x="640" y="682" text-anchor="middle" fill="${accentColor}" font-family="sans-serif" font-size="14" font-weight="bold" letter-spacing="4">${category.toUpperCase()} • 4K READY</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_PHOTOS: SamplePhoto[] = [
  {
    id: 'sample-portrait',
    title: 'Studio Portrait & Catchlight',
    category: 'Portrait',
    aspectRatio: '16:9',
    originalResolution: '1920 × 1080 (HD)',
    targetResolution: '3840 × 2160 (4K UHD)',
    thumbnail: '/src/assets/images/real_portrait_studio_1791813403412.jpg',
    url: '/src/assets/images/real_portrait_studio_1791813403412.jpg',
    description: 'High-end 85mm f/1.4 studio beauty portrait with natural skin micro-texture, eye catchlights, and soft bokeh.',
    suggestedPreset: 'portrait_retouch',
  },
  {
    id: 'sample-cyberpunk',
    title: 'Neon Tokyo Street Night',
    category: 'Urban / Night',
    aspectRatio: '16:9',
    originalResolution: '1920 × 1080 (HD)',
    targetResolution: '3840 × 2160 (4K UHD)',
    thumbnail: '/src/assets/images/real_cyberpunk_neon_1791813415544.jpg',
    url: '/src/assets/images/real_cyberpunk_neon_1791813415544.jpg',
    description: 'Cinematic night street photography of rainy Shinjuku Tokyo with neon reflections on wet asphalt puddles.',
    suggestedPreset: 'cinematic_hdr',
  },
  {
    id: 'sample-architecture',
    title: 'Modern Concrete Villa',
    category: 'Architecture',
    aspectRatio: '16:9',
    originalResolution: '1920 × 1080 (HD)',
    targetResolution: '3840 × 2160 (4K UHD)',
    thumbnail: '/src/assets/images/real_modern_villa_1791813429072.jpg',
    url: '/src/assets/images/real_modern_villa_1791813429072.jpg',
    description: 'Luxury cantilevered concrete and glass coastal villa at dusk with warm interior architectural lighting.',
    suggestedPreset: 'architecture_edge',
  },
  {
    id: 'sample-landscape',
    title: 'Alpine Lake Golden Hour',
    category: 'Landscape',
    aspectRatio: '16:9',
    originalResolution: '1920 × 1080 (HD)',
    targetResolution: '3840 × 2160 (4K UHD)',
    thumbnail: '/src/assets/images/real_alpine_lake_1791813440733.jpg',
    url: '/src/assets/images/real_alpine_lake_1791813440733.jpg',
    description: 'Crystal-clear alpine lake reflecting rugged jagged peaks and vibrant forest at sunset golden hour.',
    suggestedPreset: 'landscape_clarity',
  },
  {
    id: 'sample-product',
    title: 'Clean E-Commerce Audio Tech',
    category: 'E-Commerce',
    aspectRatio: '16:9',
    originalResolution: '1920 × 1080 (HD)',
    targetResolution: '3840 × 2160 (4K UHD)',
    thumbnail: '/src/assets/images/real_ecommerce_headphones_1791814057948.jpg',
    url: '/src/assets/images/real_ecommerce_headphones_1791814057948.jpg',
    description: 'Commercial product photography of luxury wireless headphones on black textured stone with studio softbox highlights.',
    suggestedPreset: 'ecommerce_studio',
  },
  {
    id: 'sample-automotive',
    title: 'Supercar Aerodynamics',
    category: 'Automotive',
    aspectRatio: '16:9',
    originalResolution: '1920 × 1080 (HD)',
    targetResolution: '3840 × 2160 (4K UHD)',
    thumbnail: '/src/assets/images/real_supercar_gt_1791814069687.jpg',
    url: '/src/assets/images/real_supercar_gt_1791814069687.jpg',
    description: 'Exotic carbon-fiber hypercar in a dark studio with aerodynamic curves, glossy reflections, and yellow brake calipers.',
    suggestedPreset: 'ultra_clarity',
  },
];

export const ENHANCEMENT_PRESETS: EnhancementPreset[] = [
  {
    id: 'ultra_clarity',
    name: 'Ultra 4K Super-Resolution',
    icon: 'Sparkles',
    description: 'Multi-pass unsharp mask + neural edge reconstruction for crisp 4K detail',
    badge: 'Popular',
    adjustments: {
      sharpness: 75,
      clarity: 65,
      contrast: 20,
      exposure: 5,
      denoise: 30,
    },
    aiPromptSnippet: 'Enhance to pristine 4K resolution: sharp edges, crisp textures, ultra clarity, clean lines',
  },
  {
    id: 'portrait_retouch',
    name: 'Studio Portrait Polish',
    icon: 'UserCheck',
    description: 'Micro skin texture preservation, enhanced eye reflections, soft studio backlight',
    badge: 'Retouch',
    adjustments: {
      sharpness: 55,
      clarity: 35,
      shadows: 15,
      highlights: -10,
      saturation: 12,
      denoise: 40,
    },
    aiPromptSnippet: 'Studio beauty retouch in 4K: crisp eyes and hair, natural skin micro-texture, flattering lighting',
  },
  {
    id: 'cinematic_hdr',
    name: 'Cinematic 4K HDR',
    icon: 'Film',
    description: 'Expansive dynamic range, deep rich blacks, luminous specular highlights',
    badge: 'Cinematic',
    adjustments: {
      sharpness: 60,
      clarity: 50,
      contrast: 30,
      shadows: 25,
      highlights: -15,
      saturation: 18,
      temperature: 5,
    },
    aiPromptSnippet: 'Cinematic 4K HDR master: rich color grading, expanded dynamic range, movie aesthetic',
  },
  {
    id: 'architecture_edge',
    name: 'Architectural Pop',
    icon: 'Building2',
    description: 'High-contrast structural edges, stone and glass micro-textures, tilt-shift clarity',
    badge: 'Structural',
    adjustments: {
      sharpness: 85,
      clarity: 70,
      contrast: 22,
      highlights: -8,
      shadows: 12,
      denoise: 20,
    },
    aiPromptSnippet: 'Architectural precision 4K: razor sharp straight lines, clean facade textures, golden light',
  },
  {
    id: 'ecommerce_studio',
    name: 'E-Commerce Crisp White',
    icon: 'ShoppingBag',
    description: 'Clean product isolation, neutral color balance, noise-free commercial look',
    badge: 'Commercial',
    adjustments: {
      sharpness: 70,
      clarity: 55,
      exposure: 10,
      contrast: 15,
      saturation: 8,
      denoise: 35,
    },
    aiPromptSnippet: 'E-commerce commercial product shot in 4K: ultra clean lighting, sharp product contours, neutral color',
  },
  {
    id: 'vintage_kodachrome',
    name: 'Vintage 35mm Analog',
    icon: 'Camera',
    description: 'Warm Kodachrome color tone, organic film grain, subtle shadow fade',
    badge: 'Film',
    adjustments: {
      sharpness: 45,
      clarity: 30,
      contrast: 25,
      shadows: 20,
      saturation: 15,
      temperature: 18,
      vignette: 25,
    },
    aiPromptSnippet: '35mm vintage film look in 4K: Kodachrome color palette, organic subtle grain, warm nostalgic feel',
  },
  {
    id: 'landscape_clarity',
    name: 'Vivid Landscape & Sky',
    icon: 'Mountain',
    description: 'Polarized sky blue, lush botanical saturation, deep valley depth',
    badge: 'Nature',
    adjustments: {
      sharpness: 80,
      clarity: 60,
      contrast: 25,
      saturation: 25,
      highlights: -18,
      shadows: 20,
    },
    aiPromptSnippet: 'Vivid landscape photography in 4K: deep sky blue, rich foliage, crisp mountain ridges, high clarity',
  },
];
