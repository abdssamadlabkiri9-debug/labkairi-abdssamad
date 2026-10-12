import React, { useState } from 'react';
import {
  Layers,
  Play,
  Pause,
  Download,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Upload,
  AlertCircle,
  FileArchive,
  RefreshCw,
  Sliders,
  Check,
  Eye,
} from 'lucide-react';
import JSZip from 'jszip';
import { BatchItem, ResolutionPreset, RESOLUTION_PRESETS, Adjustments, DEFAULT_ADJUSTMENTS } from '../types';
import { ENHANCEMENT_PRESETS, SAMPLE_PHOTOS } from '../utils/sampleData';
import {
  loadImage,
  render4kCanvas,
  calculate4kDimensions,
  downloadCanvas,
} from '../utils/canvas4k';

interface BatchProcessingHubProps {
  batchQueue: BatchItem[];
  setBatchQueue: React.Dispatch<React.SetStateAction<BatchItem[]>>;
  onUseCredit: (amount?: number) => boolean;
  onPreviewItem?: (item: BatchItem) => void;
}

export const BatchProcessingHub: React.FC<BatchProcessingHubProps> = ({
  batchQueue,
  setBatchQueue,
  onUseCredit,
  onPreviewItem,
}) => {
  // Global Recipe settings
  const [globalPreset, setGlobalPreset] = useState<string>('ultra_clarity');
  const [globalResolution, setGlobalResolution] = useState<ResolutionPreset>('4k_uhd');
  const [globalFormat, setGlobalFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [customPrompt, setCustomPrompt] = useState<string>('');

  // Queue state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [zipProgress, setZipProgress] = useState<number>(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Drag and drop state
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Load sample batch set
  const handleLoadDemoBatch = () => {
    const demoItems: BatchItem[] = SAMPLE_PHOTOS.slice(0, 5).map((sample, idx) => {
      const dims = calculate4kDimensions(1920, 1080, globalResolution);
      return {
        id: `demo-${Date.now()}-${idx}`,
        name: sample.title.toLowerCase().replace(/\s+/g, '_'),
        originalUrl: sample.url,
        originalWidth: 1920,
        originalHeight: 1080,
        targetWidth: dims.width,
        targetHeight: dims.height,
        status: 'idle',
        progress: 0,
        preset: sample.suggestedPreset,
      };
    });

    setBatchQueue((prev) => [...prev, ...demoItems]);
  };

  // Handle file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const imgUrl = event.target.result as string;
          const img = new Image();
          img.onload = () => {
            const dims = calculate4kDimensions(img.width, img.height, globalResolution);
            const newItem: BatchItem = {
              id: `upload-${Date.now()}-${index}`,
              name: file.name.replace(/\.[^/.]+$/, ''),
              file,
              originalUrl: imgUrl,
              originalWidth: img.width,
              originalHeight: img.height,
              targetWidth: dims.width,
              targetHeight: dims.height,
              status: 'idle',
              progress: 0,
              preset: globalPreset,
              customPrompt,
            };
            setBatchQueue((prev) => [...prev, newItem]);
          };
          img.src = imgUrl;
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Run Batch Processing Queue
  const startBatchProcessing = async () => {
    if (batchQueue.length === 0) return;

    // Filter items to run
    const pendingItems = batchQueue.filter((item) => item.status !== 'completed');
    if (pendingItems.length === 0) return;

    if (!onUseCredit(pendingItems.length)) {
      alert('Insufficient credits for batch processing. Please upgrade plan.');
      return;
    }

    setIsRunning(true);

    for (const item of batchQueue) {
      if (item.status === 'completed') continue;

      // Update item status to processing
      setBatchQueue((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'processing', progress: 15 } : i))
      );

      const startTime = performance.now();

      try {
        const img = await loadImage(item.originalUrl);

        // Find preset
        const presetObj = ENHANCEMENT_PRESETS.find((p) => p.id === (item.preset || globalPreset));
        const adjustments: Adjustments = {
          ...DEFAULT_ADJUSTMENTS,
          sharpness: 65,
          clarity: 50,
          exposure: 0,
          contrast: 15,
          highlights: 0,
          shadows: 10,
          saturation: 10,
          temperature: 0,
          denoise: 25,
          vignette: 0,
          ...(presetObj?.adjustments || {}),
        };

        // Step 1: Render 4K super-resolution
        setBatchQueue((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, progress: 60 } : i))
        );

        const dims = calculate4kDimensions(img.width, img.height, globalResolution);
        const canvas = await render4kCanvas(img, dims.width, dims.height, adjustments, 'cover');

        const processedUrl = canvas.toDataURL(globalFormat, 0.95);
        const duration = Math.round(performance.now() - startTime);

        // Mark completed
        setBatchQueue((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  status: 'completed',
                  progress: 100,
                  processedUrl,
                  targetWidth: dims.width,
                  targetHeight: dims.height,
                  processingTimeMs: duration,
                }
              : i
          )
        );
      } catch (err: any) {
        console.error(`Error processing item ${item.id}:`, err);
        setBatchQueue((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  status: 'error',
                  progress: 100,
                  error: err.message || 'Processing failed',
                }
              : i
          )
        );
      }
    }

    setIsRunning(false);
  };

  // Download all as ZIP
  const handleDownloadZip = async () => {
    const completedItems = batchQueue.filter((item) => item.status === 'completed' && item.processedUrl);
    if (completedItems.length === 0) return;

    setIsZipping(true);
    setZipProgress(0);

    try {
      const zip = new JSZip();
      const folder = zip.folder('lumix4k_master_renders');

      for (let i = 0; i < completedItems.length; i++) {
        const item = completedItems[i];
        const base64Data = item.processedUrl!.split(',')[1];
        const ext = globalFormat === 'image/jpeg' ? 'jpg' : globalFormat === 'image/webp' ? 'webp' : 'png';
        const filename = `${item.name}_4k_${item.targetWidth}x${item.targetHeight}.${ext}`;

        folder?.file(filename, base64Data, { base64: true });
        setZipProgress(Math.round(((i + 1) / completedItems.length) * 80));
      }

      const content = await zip.generateAsync({ type: 'blob' }, (metadata) => {
        setZipProgress(80 + Math.round(metadata.percent * 0.2));
      });

      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Lumix4K_Batch_Export_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('ZIP generation error:', e);
      alert('Failed to generate ZIP archive: ' + e);
    } finally {
      setIsZipping(false);
      setZipProgress(0);
    }
  };

  // Single download
  const handleSingleDownload = (item: BatchItem) => {
    if (!item.processedUrl) return;
    const link = document.createElement('a');
    const ext = globalFormat === 'image/jpeg' ? 'jpg' : globalFormat === 'image/webp' ? 'webp' : 'png';
    link.download = `${item.name}_4k_${item.targetWidth}x${item.targetHeight}.${ext}`;
    link.href = item.processedUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Remove item
  const handleRemoveItem = (id: string) => {
    setBatchQueue((prev) => prev.filter((i) => i.id !== id));
  };

  // Clear completed
  const handleClearCompleted = () => {
    setBatchQueue((prev) => prev.filter((i) => i.status !== 'completed'));
  };

  const completedCount = batchQueue.filter((i) => i.status === 'completed').length;
  const totalMegapixelsRendered = batchQueue
    .filter((i) => i.status === 'completed')
    .reduce((acc, curr) => acc + (curr.targetWidth * curr.targetHeight) / 1000000, 0)
    .toFixed(1);

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8 flex flex-col gap-6">
      {/* Header & Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">
                Batch 4K Super-Resolution Hub
              </h1>
              <p className="text-xs text-slate-400">
                Bulk upscale, sharpen, and remaster entire photo catalogues to 3840 × 2160 UHD.
              </p>
            </div>
          </div>
        </div>

        {/* Batch Stats chips */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Queue Size</span>
            <span className="text-white font-extrabold text-sm">
              {completedCount} <span className="text-slate-500 font-normal">/ {batchQueue.length} Done</span>
            </span>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Rendered MP</span>
            <span className="text-cyan-400 font-extrabold text-sm">{totalMegapixelsRendered} MP</span>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Throughput</span>
            <span className="text-emerald-400 font-extrabold text-sm">~1.2s / 4K</span>
          </div>
        </div>
      </div>

      {/* Global Recipe Configuration Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Preset & Resolution Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Preset */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">AI Enhancer Recipe</label>
            <select
              value={globalPreset}
              onChange={(e) => setGlobalPreset(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 font-semibold focus:outline-none focus:border-cyan-500"
            >
              {ENHANCEMENT_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Resolution */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">Target 4K Resolution</label>
            <select
              value={globalResolution}
              onChange={(e) => setGlobalResolution(e.target.value as ResolutionPreset)}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 font-semibold focus:outline-none focus:border-cyan-500"
            >
              {RESOLUTION_PRESETS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Output Format */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">Export Format</label>
            <select
              value={globalFormat}
              onChange={(e) => setGlobalFormat(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 font-semibold focus:outline-none focus:border-cyan-500"
            >
              <option value="image/png">PNG (Lossless 4K)</option>
              <option value="image/jpeg">JPG (95% Ultra Quality)</option>
              <option value="image/webp">WebP (Optimized)</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 lg:pt-0">
          <button
            onClick={startBatchProcessing}
            disabled={isRunning || batchQueue.length === 0}
            className="flex-1 lg:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing Queue...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Start Batch ({batchQueue.filter((i) => i.status !== 'completed').length})</span>
              </>
            )}
          </button>

          {completedCount > 0 && (
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
            >
              {isZipping ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Zipping ({zipProgress}%)...</span>
                </>
              ) : (
                <>
                  <FileArchive className="w-4 h-4" />
                  <span>Download .ZIP ({completedCount})</span>
                </>
              )}
            </button>
          )}

          {completedCount > 0 && (
            <button
              onClick={handleClearCompleted}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-colors"
              title="Clear completed items"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Drag & Drop Multi-file Upload Card */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const files = e.dataTransfer.files;
          if (files && files.length > 0) {
            handleFileUpload({ target: { files } } as any);
          }
        }}
        className={`p-6 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center gap-3 ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/20 scale-[1.01]'
            : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
        }`}
      >
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
          <Upload className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-sm font-bold text-white">Drag & drop multiple high-res photos here</h3>
          <p className="text-xs text-slate-400 mt-0.5">Supports PNG, JPG, WebP, HEIC up to 50MB each</p>
        </div>

        <div className="flex items-center gap-3 mt-1">
          <label className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold cursor-pointer transition-colors">
            <span>Browse Files</span>
            <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={handleLoadDemoBatch}
            className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Load 5× Demo Photos</span>
          </button>
        </div>
      </div>

      {/* Batch Queue List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-slate-400">
            Queue Items ({batchQueue.length})
          </span>
          {batchQueue.length > 0 && (
            <button
              onClick={() => setBatchQueue([])}
              className="text-slate-500 hover:text-rose-400 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {batchQueue.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-slate-800/80 text-slate-500 text-xs">
            Queue is empty. Drop photos above or click "Load 5× Demo Photos" to test batch processing!
          </div>
        ) : (
          <div className="space-y-2">
            {batchQueue.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Thumbnail & Meta */}
                <div className="flex items-center gap-3">
                  <div className="w-16 h-10 rounded-lg overflow-hidden bg-black shrink-0 border border-slate-800 relative">
                    <img
                      src={item.processedUrl || item.originalUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {item.status === 'completed' && (
                      <span className="absolute bottom-0 right-0 p-0.5 bg-emerald-500 text-slate-950 rounded-tl">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span className="truncate max-w-[200px] sm:max-w-xs">{item.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 font-mono">
                        {item.preset}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span>
                        Source: {item.originalWidth} × {item.originalHeight}
                      </span>
                      <span>→</span>
                      <span className="text-cyan-400 font-bold">
                        Target: {item.targetWidth} × {item.targetHeight} 4K
                      </span>
                      {item.processingTimeMs && (
                        <span className="text-slate-500">({item.processingTimeMs}ms)</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  {/* Status Badge */}
                  <div>
                    {item.status === 'completed' ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Ready (4K)</span>
                      </span>
                    ) : item.status === 'processing' ? (
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Upscaling...</span>
                        </span>
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-400 transition-all duration-300"
                            style={{ width: `${item.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : item.status === 'error' ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Failed</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                        Queued
                      </span>
                    )}
                  </div>

                  {/* Single Download */}
                  {item.status === 'completed' && item.processedUrl && (
                    <button
                      onClick={() => handleSingleDownload(item)}
                      className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-colors"
                      title="Download this 4K render"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Remove */}
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Remove from queue"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
