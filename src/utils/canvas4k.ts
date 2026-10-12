import { Adjustments, ResolutionPreset, RESOLUTION_PRESETS, F_STOPS } from '../types';

/**
 * Loads an image from a URL or Data URL safely
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load image: ' + e));
    img.src = src;
  });
}

/**
 * Computes destination 4K dimensions based on original aspect ratio and chosen preset
 */
export function calculate4kDimensions(
  origWidth: number,
  origHeight: number,
  presetId: ResolutionPreset
): { width: number; height: number } {
  const preset = RESOLUTION_PRESETS.find((p) => p.id === presetId) || RESOLUTION_PRESETS[0];

  if (presetId === 'original_4x') {
    // Scale 4x, bounded to 4096 max dimension
    const maxDim = 4096;
    const scale = Math.min(4, maxDim / Math.max(origWidth, origHeight));
    return {
      width: Math.round(origWidth * scale),
      height: Math.round(origHeight * scale),
    };
  }

  if (preset.width > 0 && preset.height > 0) {
    return { width: preset.width, height: preset.height };
  }

  // Default to 4K UHD 16:9
  return { width: 3840, height: 2160 };
}

/**
 * High-performance 4K rendering pipeline with optical aperture bokeh and multi-pass sharpening
 */
export async function render4kCanvas(
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
  adjustments: Adjustments,
  fitMode: 'cover' | 'contain' = 'cover'
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Could not get 2D canvas context');
  }

  // Set high quality interpolation
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Calculate placement to preserve aspect ratio
  const origAspect = img.width / img.height;
  const targetAspect = targetWidth / targetHeight;

  let drawW = targetWidth;
  let drawH = targetHeight;
  let offsetX = 0;
  let offsetY = 0;

  if (fitMode === 'cover') {
    if (origAspect > targetAspect) {
      drawH = targetHeight;
      drawW = targetHeight * origAspect;
      offsetX = (targetWidth - drawW) / 2;
    } else {
      drawW = targetWidth;
      drawH = targetWidth / origAspect;
      offsetY = (targetHeight - drawH) / 2;
    }
  } else {
    // contain
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    if (origAspect > targetAspect) {
      drawW = targetWidth;
      drawH = targetWidth / origAspect;
      offsetY = (targetHeight - drawH) / 2;
    } else {
      drawH = targetHeight;
      drawW = targetHeight * origAspect;
      offsetX = (targetWidth - drawW) / 2;
    }
  }

  // Draw base image
  ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

  // Apply Pixel-level adjustments
  const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
  const data = imageData.data;
  const len = data.length;

  const {
    exposure,
    contrast,
    highlights,
    shadows,
    saturation,
    temperature,
    sharpness,
    vignette,
    fStop = 'f/1.8',
    bokehIntensity = 35,
    focusX = 50,
    focusY = 45,
    focusRange = 40,
    bokehBloom = 25,
  } = adjustments;

  // Normalized color adjustment multipliers
  const expFactor = 1 + exposure / 100;
  const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  const satFactor = 1 + saturation / 100;
  const tempShift = temperature * 0.4;

  const centerX = targetWidth / 2;
  const centerY = targetHeight / 2;
  const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

  for (let i = 0; i < len; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // 1. Exposure
    r *= expFactor;
    g *= expFactor;
    b *= expFactor;

    // 2. Temperature (warm/cool)
    if (tempShift !== 0) {
      r += tempShift * 1.2;
      b -= tempShift * 1.2;
    }

    // 3. Contrast
    r = contrastFactor * (r - 128) + 128;
    g = contrastFactor * (g - 128) + 128;
    b = contrastFactor * (b - 128) + 128;

    // 4. Highlights & Shadows
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    if (highlights !== 0 && lum > 140) {
      const hWeight = (lum - 140) / 115;
      const hShift = (highlights / 100) * 35 * hWeight;
      r += hShift;
      g += hShift;
      b += hShift;
    }
    if (shadows !== 0 && lum < 120) {
      const sWeight = (120 - lum) / 120;
      const sShift = (shadows / 100) * 45 * sWeight;
      r += sShift;
      g += sShift;
      b += sShift;
    }

    // 5. Saturation
    if (satFactor !== 1) {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = gray + (r - gray) * satFactor;
      g = gray + (g - gray) * satFactor;
      b = gray + (b - gray) * satFactor;
    }

    // 6. Vignette
    if (vignette > 0) {
      const pixelIndex = i / 4;
      const px = pixelIndex % targetWidth;
      const py = Math.floor(pixelIndex / targetWidth);
      const dist = Math.sqrt((px - centerX) * (px - centerX) + (py - centerY) * (py - centerY));
      const vigNorm = dist / maxDist;
      if (vigNorm > 0.45) {
        const falloff = ((vigNorm - 0.45) / 0.55) * (vignette / 100);
        const vigFactor = Math.max(0, 1 - falloff * 0.7);
        r *= vigFactor;
        g *= vigFactor;
        b *= vigFactor;
      }
    }

    // Clamp
    data[i] = Math.min(255, Math.max(0, r));
    data[i + 1] = Math.min(255, Math.max(0, g));
    data[i + 2] = Math.min(255, Math.max(0, b));
  }

  // 7. Optical Depth-of-Field Aperture Bokeh Simulation
  const fInfo = F_STOPS.find((f) => f.label === fStop) || F_STOPS[2];
  if (bokehIntensity > 0 && fInfo.bokehFactor > 0.05) {
    applyApertureBokeh(
      imageData,
      targetWidth,
      targetHeight,
      (focusX / 100) * targetWidth,
      (focusY / 100) * targetHeight,
      (focusRange / 100) * Math.min(targetWidth, targetHeight) * 0.5,
      fInfo.bokehFactor * (bokehIntensity / 100),
      bokehBloom / 100
    );
  }

  // 8. Convolution Sharpening (Unsharp Mask for 4K micro-contrast)
  if (sharpness > 0) {
    applyUnsharpMask(imageData, targetWidth, targetHeight, sharpness / 100);
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Optical Aperture Bokeh & Depth-of-field circle of confusion
 */
function applyApertureBokeh(
  imageData: ImageData,
  width: number,
  height: number,
  focalCenterX: number,
  focalCenterY: number,
  focalRadius: number,
  bokehStrength: number,
  bloomFactor: number
) {
  if (bokehStrength <= 0.02) return;

  const src = new Uint8ClampedArray(imageData.data);
  const dst = imageData.data;
  const maxBlurRadius = Math.max(1, Math.round(bokehStrength * 10));
  const stride = width * 4;

  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const idx = y * stride + x * 4;

      // Distance from focus point
      const dx = x - focalCenterX;
      const dy = y - focalCenterY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Blur weight based on distance outside focal plane
      if (dist > focalRadius) {
        const falloff = Math.min(1, (dist - focalRadius) / (focalRadius * 1.5));
        const currentRadius = Math.round(maxBlurRadius * falloff);

        if (currentRadius > 0) {
          let sumR = 0;
          let sumG = 0;
          let sumB = 0;
          let count = 0;

          const step = Math.max(1, Math.floor(currentRadius / 2));
          for (let ky = -currentRadius; ky <= currentRadius; ky += step) {
            const ny = y + ky;
            if (ny < 0 || ny >= height) continue;
            const rowIdx = ny * stride;

            for (let kx = -currentRadius; kx <= currentRadius; kx += step) {
              const nx = x + kx;
              if (nx < 0 || nx >= width) continue;
              const sIdx = rowIdx + nx * 4;

              let sr = src[sIdx];
              let sg = src[sIdx + 1];
              let sb = src[sIdx + 2];

              // Specular bokeh highlight bloom
              const lum = 0.299 * sr + 0.587 * sg + 0.114 * sb;
              if (bloomFactor > 0 && lum > 200) {
                const boost = 1 + (bloomFactor * (lum - 200)) / 55;
                sr = Math.min(255, sr * boost);
                sg = Math.min(255, sg * boost);
                sb = Math.min(255, sb * boost);
              }

              sumR += sr;
              sumG += sg;
              sumB += sb;
              count++;
            }
          }

          if (count > 0) {
            const bR = sumR / count;
            const bG = sumG / count;
            const bB = sumB / count;

            // Apply to 2x2 block for speed and creamy look
            for (let by = 0; by < 2 && y + by < height; by++) {
              for (let bx = 0; bx < 2 && x + bx < width; bx++) {
                const bIdx = (y + by) * stride + (x + bx) * 4;
                const blend = falloff * 0.75;
                dst[bIdx] = dst[bIdx] * (1 - blend) + bR * blend;
                dst[bIdx + 1] = dst[bIdx + 1] * (1 - blend) + bG * blend;
                dst[bIdx + 2] = dst[bIdx + 2] * (1 - blend) + bB * blend;
              }
            }
          }
        }
      }
    }
  }
}

/**
 * Edge-enhancing 3x3 convolution unsharp mask
 */
function applyUnsharpMask(
  imageData: ImageData,
  width: number,
  height: number,
  strength: number
) {
  const src = new Uint8ClampedArray(imageData.data);
  const dst = imageData.data;
  const factor = strength * 0.85;

  // 3x3 Laplacian / Unsharp Kernel
  const stride = width * 4;

  for (let y = 1; y < height - 1; y++) {
    const rowOffset = y * stride;
    for (let x = 1; x < width - 1; x++) {
      const idx = rowOffset + x * 4;

      const top = idx - stride;
      const btm = idx + stride;
      const lft = idx - 4;
      const rgt = idx + 4;

      for (let c = 0; c < 3; c++) {
        const orig = src[idx + c];
        const neighbors = (src[top + c] + src[btm + c] + src[lft + c] + src[rgt + c]) * 0.25;
        const diff = orig - neighbors;
        const sharpened = orig + diff * factor;
        dst[idx + c] = Math.min(255, Math.max(0, sharpened));
      }
    }
  }
}

/**
 * Downloads a canvas as an image file (PNG, JPG, WebP)
 */
export function downloadCanvas(
  canvas: HTMLCanvasElement,
  filename: string,
  format: 'image/png' | 'image/jpeg' | 'image/webp' = 'image/png',
  quality = 0.95
) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL(format, quality);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

