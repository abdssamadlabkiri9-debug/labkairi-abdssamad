import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// High payload limit for 4K / high-res base64 images
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ limit: '60mb', extended: true }));

const apiKey = process.env.GEMINI_API_KEY || '';

const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey && apiKey.length > 5),
    timestamp: new Date().toISOString(),
  });
});

// AI Generate Photo endpoint
app.post('/api/ai/generate', async (req, res) => {
  try {
    const { prompt, aspectRatio = '16:9', stylePreset = 'realistic_ultra', lens = '85mm_portrait', fStop } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!apiKey) {
      return res.status(503).json({
        error: 'Gemini API key is not configured. Please check your environment configuration.',
      });
    }

    // Enhance prompt for 4K ultra-high-definition fidelity and optical aperture
    let styledPrompt = prompt;
    const apertureNote = fStop ? `, optical aperture ${fStop}` : '';
    if (stylePreset === 'cinematic') {
      styledPrompt = `${prompt}${apertureNote}, 4K UHD resolution, cinematic lighting, anamorphic lens flare, photorealistic masterwork, 35mm film grain, 8k textures, high dynamic range`;
    } else if (stylePreset === 'studio_portrait') {
      styledPrompt = `${prompt}${apertureNote}, shot on Hasselblad H6D-100c, 85mm lens, 4K resolution, soft studio profoto lighting, ultra crisp skin pores and eye reflection details, sharp focus`;
    } else if (stylePreset === 'architecture') {
      styledPrompt = `${prompt}${apertureNote}, architectural photography, 4K ultra wide angle, crisp straight lines, tilt-shift lens, golden hour natural light, ultra high clarity`;
    } else if (stylePreset === 'ecommerce') {
      styledPrompt = `${prompt}${apertureNote}, commercial product studio photography, 4K clean pure white background, crisp softbox highlights, ultra sharp macro details`;
    } else {
      styledPrompt = `${prompt}${apertureNote}, 4K ultra-high-definition, incredible detail, hyper-realistic, photorealistic, 3840x2160 aesthetic, flawless lighting and color grading`;
    }

    // Supported aspect ratios for gemini-3.1-flash-lite-image
    const validRatios = ['1:1', '3:4', '4:3', '9:16', '16:9'];
    const chosenRatio = validRatios.includes(aspectRatio) ? aspectRatio : '16:9';

    // Model selection
    const model = 'gemini-3.1-flash-lite-image';

    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [{ text: styledPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: chosenRatio,
        },
      },
    });

    let generatedImageUrl = '';
    let responseText = '';

    const candidates = response.candidates || [];
    if (candidates.length > 0 && candidates[0].content && candidates[0].content.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
          break;
        } else if (part.text) {
          responseText += part.text;
        }
      }
    }

    if (!generatedImageUrl) {
      return res.status(502).json({
        error: 'The AI model responded without an image.',
        details: responseText || 'No image data returned',
      });
    }

    return res.json({
      success: true,
      imageUrl: generatedImageUrl,
      promptUsed: styledPrompt,
      aspectRatio: chosenRatio,
    });
  } catch (err: any) {
    console.error('Error in /api/ai/generate:', err);
    return res.status(500).json({
      error: err.message || 'Failed to generate 4K photo with AI',
    });
  }
});

// AI Edit / Enhance Photo endpoint
app.post('/api/ai/edit', async (req, res) => {
  try {
    const { imageBase64, prompt, mode = 'enhance', enhancementPreset } = req.body;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    if (!apiKey) {
      return res.status(503).json({
        error: 'Gemini API key is not configured.',
      });
    }

    // Clean base64 header if present
    let rawData = imageBase64;
    let mimeType = 'image/jpeg';
    if (imageBase64.includes(';base64,')) {
      const parts = imageBase64.split(';base64,');
      rawData = parts[1];
      const match = parts[0].match(/data:(.*?)$/);
      if (match && match[1]) {
        mimeType = match[1];
      }
    }

    // Format instruction prompt
    let editInstruction = prompt || 'Enhance clarity, sharpen fine textures, upscale details to 4K fidelity, denoise and balance dynamic range';
    if (enhancementPreset === 'portrait_retouch') {
      editInstruction = 'Enhance this portrait to 4K studio quality: natural skin smoothing preserving micro-texture, enhance eye reflections, soft studio backlight, sharp hair detail.';
    } else if (enhancementPreset === 'cinematic_hdr') {
      editInstruction = 'Transform into cinematic 4K HDR: rich deep shadows, luminous highlights, subtle filmic color grade, wide dynamic range, crisp textures.';
    } else if (enhancementPreset === 'landscape_clarity') {
      editInstruction = 'Enhance landscape to 4K ultra clarity: deep blue skies, vibrant natural greenery, rich foliage details, atmospheric depth and mist clarity.';
    } else if (enhancementPreset === 'ecommerce_studio') {
      editInstruction = 'Studio commercial grade enhancement: crisp product edges, perfect neutral lighting, remove visual noise and chromatic aberration, pristine 4K polish.';
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: rawData,
              mimeType: mimeType,
            },
          },
          {
            text: editInstruction,
          },
        ],
      },
    });

    let resultImageUrl = '';
    let responseText = '';

    const candidates = response.candidates || [];
    if (candidates.length > 0 && candidates[0].content && candidates[0].content.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          resultImageUrl = `data:${mime};base64,${part.inlineData.data}`;
          break;
        } else if (part.text) {
          responseText += part.text;
        }
      }
    }

    if (!resultImageUrl) {
      return res.status(502).json({
        error: 'Model did not return an edited image.',
        details: responseText,
      });
    }

    return res.json({
      success: true,
      imageUrl: resultImageUrl,
      instruction: editInstruction,
    });
  } catch (err: any) {
    console.error('Error in /api/ai/edit:', err);
    return res.status(500).json({
      error: err.message || 'Failed to edit photo with AI',
    });
  }
});

// AI Analyze Photo Quality & Generate Smart 4K Enhancements
app.post('/api/ai/analyze', async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    if (!apiKey) {
      return res.status(503).json({ error: 'Gemini API key is not configured.' });
    }

    let rawData = imageBase64;
    let mimeType = 'image/jpeg';
    if (imageBase64.includes(';base64,')) {
      const parts = imageBase64.split(';base64,');
      rawData = parts[1];
      const match = parts[0].match(/data:(.*?)$/);
      if (match && match[1]) {
        mimeType = match[1];
      }
    }

    const prompt = `Analyze this photo's visual quality for 4K upscaling and enhancement. Evaluate sharpness, lighting, noise, and color balance. Provide optimal numeric adjustment recommendations (-100 to 100 for adjustments, 0 to 100 for scores) and an expert 4K AI prompt.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: rawData,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallQualityScore: { type: Type.INTEGER, description: 'Score from 0 to 100' },
            sharpnessScore: { type: Type.INTEGER, description: 'Score from 0 to 100' },
            noiseLevelScore: { type: Type.INTEGER, description: 'Noise estimate 0 to 100' },
            dynamicRangeScore: { type: Type.INTEGER, description: 'Dynamic range score 0 to 100' },
            detectedSubject: { type: Type.STRING, description: 'Main subject detected' },
            assessment: { type: Type.STRING, description: 'Short professional photo appraisal' },
            recommendedPreset: { type: Type.STRING, description: 'Recommended preset name' },
            recommendedAdjustments: {
              type: Type.OBJECT,
              properties: {
                sharpness: { type: Type.INTEGER, description: '0 to 100' },
                clarity: { type: Type.INTEGER, description: '0 to 100' },
                exposure: { type: Type.INTEGER, description: '-100 to 100' },
                contrast: { type: Type.INTEGER, description: '-100 to 100' },
                highlights: { type: Type.INTEGER, description: '-100 to 100' },
                shadows: { type: Type.INTEGER, description: '-100 to 100' },
                saturation: { type: Type.INTEGER, description: '-100 to 100' },
                temperature: { type: Type.INTEGER, description: '-100 to 100' },
                denoise: { type: Type.INTEGER, description: '0 to 100' },
              },
              required: ['sharpness', 'clarity', 'exposure', 'contrast', 'saturation', 'denoise'],
            },
            smart4kPrompt: { type: Type.STRING, description: 'Optimized neural prompt for 4K mastering' },
          },
          required: [
            'overallQualityScore',
            'sharpnessScore',
            'detectedSubject',
            'assessment',
            'recommendedPreset',
            'recommendedAdjustments',
            'smart4kPrompt',
          ],
        },
      },
    });

    const text = response.text || '{}';
    const analysis = JSON.parse(text);

    return res.json({
      success: true,
      analysis,
    });
  } catch (err: any) {
    console.error('Error in /api/ai/analyze:', err);
    return res.status(500).json({
      error: err.message || 'Failed to analyze photo',
    });
  }
});

// Setup Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Lumix4K AI Studio running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
