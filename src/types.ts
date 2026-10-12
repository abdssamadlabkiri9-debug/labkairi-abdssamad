export type FStopValue = 'f/1.2' | 'f/1.4' | 'f/1.8' | 'f/2.8' | 'f/4' | 'f/5.6' | 'f/8' | 'f/11' | 'f/16';

export type BokehShape = 'circular' | 'bladed_7' | 'bladed_9' | 'anamorphic' | 'swirly';

export interface FStopInfo {
  fNumber: number;
  label: FStopValue;
  name: string;
  depthOfField: 'Ultra Shallow' | 'Very Shallow' | 'Shallow' | 'Moderate' | 'Deep' | 'Infinite';
  irisDiameterRatio: number; // 0.1 to 1.0 (for aperture iris visualization)
  bokehFactor: number; // 0 to 1
  idealFor: string;
}

export const F_STOPS: FStopInfo[] = [
  {
    fNumber: 1.2,
    label: 'f/1.2',
    name: 'Dream Bokeh (Ultra Wide)',
    depthOfField: 'Ultra Shallow',
    irisDiameterRatio: 0.96,
    bokehFactor: 1.0,
    idealFor: 'Extreme cinematic portraits, creamy optical separation, low-light nightscapes',
  },
  {
    fNumber: 1.4,
    label: 'f/1.4',
    name: 'Master Portrait',
    depthOfField: 'Very Shallow',
    irisDiameterRatio: 0.85,
    bokehFactor: 0.88,
    idealFor: 'Fashion editorial, eye-catchlight isolation, soft background blur',
  },
  {
    fNumber: 1.8,
    label: 'f/1.8',
    name: 'Prime Standard',
    depthOfField: 'Shallow',
    irisDiameterRatio: 0.72,
    bokehFactor: 0.74,
    idealFor: 'Street documentary, environmental portraits, creamy specular balls',
  },
  {
    fNumber: 2.8,
    label: 'f/2.8',
    name: 'Pro Telephoto / Macro',
    depthOfField: 'Moderate',
    irisDiameterRatio: 0.58,
    bokehFactor: 0.55,
    idealFor: 'Commercial products, razor subject plane with gentle falloff',
  },
  {
    fNumber: 4.0,
    label: 'f/4',
    name: 'Balanced Clarity',
    depthOfField: 'Moderate',
    irisDiameterRatio: 0.44,
    bokehFactor: 0.38,
    idealFor: 'Full-body fashion, multi-subject groups, clean optical fidelity',
  },
  {
    fNumber: 5.6,
    label: 'f/5.6',
    name: 'Documentary Sharp',
    depthOfField: 'Deep',
    irisDiameterRatio: 0.34,
    bokehFactor: 0.24,
    idealFor: 'Urban architecture, travel photography, wide focus margin',
  },
  {
    fNumber: 8.0,
    label: 'f/8',
    name: 'Optical Sweet Spot',
    depthOfField: 'Deep',
    irisDiameterRatio: 0.25,
    bokehFactor: 0.12,
    idealFor: 'Maximum lens sharpness, edge-to-edge sensor resolving power',
  },
  {
    fNumber: 11.0,
    label: 'f/11',
    name: 'Landscape Grandeur',
    depthOfField: 'Deep',
    irisDiameterRatio: 0.18,
    bokehFactor: 0.05,
    idealFor: 'Mountains, deep nature vistas with foreground-to-horizon focus',
  },
  {
    fNumber: 16.0,
    label: 'f/16',
    name: 'Pinpoint Diffraction Starburst',
    depthOfField: 'Infinite',
    irisDiameterRatio: 0.12,
    bokehFactor: 0.0,
    idealFor: 'Solar starburst rays, deep architectural blueprints, infinite depth',
  },
];

export interface Adjustments {
  sharpness: number;    // 0 - 100
  clarity: number;      // 0 - 100
  exposure: number;     // -100 - +100
  contrast: number;     // -100 - +100
  highlights: number;   // -100 - +100
  shadows: number;      // -100 - +100
  saturation: number;   // -100 - +100
  temperature: number;  // -100 - +100
  denoise: number;      // 0 - 100
  vignette: number;     // 0 - 100
  // Aperture & Bokeh Optical Controls
  fStop: FStopValue;
  bokehIntensity: number; // 0 - 100
  focusX: number;         // 0 - 100 (percentage across width)
  focusY: number;         // 0 - 100 (percentage across height)
  focusRange: number;     // 10 - 100 (depth of field focal plane thickness)
  bokehShape: BokehShape;
  bokehBloom: number;     // 0 - 100 (specular highlight glow)
}

export const DEFAULT_ADJUSTMENTS: Adjustments = {
  sharpness: 50,
  clarity: 40,
  exposure: 0,
  contrast: 15,
  highlights: 0,
  shadows: 10,
  saturation: 10,
  temperature: 0,
  denoise: 25,
  vignette: 0,
  fStop: 'f/1.8',
  bokehIntensity: 35,
  focusX: 50,
  focusY: 45,
  focusRange: 40,
  bokehShape: 'circular',
  bokehBloom: 25,
};

export interface AIAnalysisResult {
  overallQualityScore: number;
  sharpnessScore: number;
  noiseLevelScore: number;
  dynamicRangeScore: number;
  detectedSubject: string;
  assessment: string;
  recommendedPreset: string;
  recommendedAdjustments: Adjustments;
  smart4kPrompt: string;
}

export type ResolutionPreset = '4k_uhd' | '4k_dci' | '4k_square' | '4k_story' | '2k_qhd' | 'original_4x';

export interface ResolutionConfig {
  id: ResolutionPreset;
  label: string;
  width: number;
  height: number;
  aspectRatio: string;
  description: string;
}

export const RESOLUTION_PRESETS: ResolutionConfig[] = [
  {
    id: '4k_uhd',
    label: '4K UHD (3840 × 2160)',
    width: 3840,
    height: 2160,
    aspectRatio: '16:9',
    description: 'Standard 4K Ultra High Definition (16:9 widescreen)',
  },
  {
    id: '4k_dci',
    label: '4K Cinema DCI (4096 × 2160)',
    width: 4096,
    height: 2160,
    aspectRatio: '1.9:1',
    description: 'Cinematic DCI 4K theatrical aspect',
  },
  {
    id: '4k_square',
    label: '4K Square (3840 × 3840)',
    width: 3840,
    height: 3840,
    aspectRatio: '1:1',
    description: 'Ultra high-res 1:1 format for premium social & print',
  },
  {
    id: '4k_story',
    label: '4K Vertical Story (2160 × 3840)',
    width: 2160,
    height: 3840,
    aspectRatio: '9:16',
    description: 'Vertical 4K for modern mobile screens & social reels',
  },
  {
    id: '2k_qhd',
    label: '2K QHD (2560 × 1440)',
    width: 2560,
    height: 1440,
    aspectRatio: '16:9',
    description: 'High-res fast export for web displays',
  },
  {
    id: 'original_4x',
    label: '4× Super-Scale (Preserve Aspect)',
    width: 0,
    height: 0,
    aspectRatio: 'Auto',
    description: 'Scales original dimensions by 4× up to 4K+ boundaries',
  },
];

export interface BatchItem {
  id: string;
  name: string;
  file?: File;
  originalUrl: string;
  processedUrl?: string;
  originalWidth: number;
  originalHeight: number;
  targetWidth: number;
  targetHeight: number;
  status: 'idle' | 'queued' | 'processing' | 'completed' | 'error';
  progress: number; // 0 - 100
  preset: string;
  customPrompt?: string;
  error?: string;
  processingTimeMs?: number;
}

export interface EnhancementPreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  badge: string;
  adjustments: Partial<Adjustments>;
  aiPromptSnippet: string;
}

export interface SamplePhoto {
  id: string;
  title: string;
  category: string;
  aspectRatio: string;
  originalResolution: string;
  targetResolution: string;
  thumbnail: string;
  url: string;
  description: string;
  suggestedPreset: string;
}
