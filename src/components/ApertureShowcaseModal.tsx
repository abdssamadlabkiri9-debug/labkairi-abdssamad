import React, { useState } from 'react';
import {
  Camera,
  X,
  Sparkles,
  Eye,
  Sliders,
  Check,
  Maximize2,
  Info,
  Sun,
  Layers,
  ChevronRight,
  Focus,
} from 'lucide-react';
import { FStopValue, F_STOPS, BokehShape, Adjustments } from '../types';
import { ApertureIrisVisualizer } from './ApertureIrisVisualizer';

interface ApertureShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAdjustments: Adjustments;
  onApplyAperture: (updates: Partial<Adjustments>) => void;
  activeImageSrc: string;
}

export const ApertureShowcaseModal: React.FC<ApertureShowcaseModalProps> = ({
  isOpen,
  onClose,
  currentAdjustments,
  onApplyAperture,
  activeImageSrc,
}) => {
  if (!isOpen) return null;

  const [selectedFStop, setSelectedFStop] = useState<FStopValue>(currentAdjustments.fStop || 'f/1.8');
  const [bokehIntensity, setBokehIntensity] = useState<number>(currentAdjustments.bokehIntensity || 45);
  const [focusX, setFocusX] = useState<number>(currentAdjustments.focusX || 50);
  const [focusY, setFocusY] = useState<number>(currentAdjustments.focusY || 45);
  const [focusRange, setFocusRange] = useState<number>(currentAdjustments.focusRange || 35);
  const [bokehShape, setBokehShape] = useState<BokehShape>(currentAdjustments.bokehShape || 'circular');
  const [bokehBloom, setBokehBloom] = useState<number>(currentAdjustments.bokehBloom || 30);

  const fInfo = F_STOPS.find((f) => f.label === selectedFStop) || F_STOPS[2];

  // Presets
  const SHOWCASE_PRESETS = [
    {
      id: 'dream_portrait',
      name: 'Ultra-Creamy Portrait',
      fStop: 'f/1.2' as FStopValue,
      bokehIntensity: 85,
      bokehBloom: 45,
      bokehShape: 'circular' as BokehShape,
      desc: 'Maximum subject isolation with buttery smooth background obliteration.',
    },
    {
      id: 'anamorphic_cinema',
      name: 'Anamorphic Hollywood',
      fStop: 'f/1.4' as FStopValue,
      bokehIntensity: 70,
      bokehBloom: 60,
      bokehShape: 'anamorphic' as BokehShape,
      desc: 'Cinematic oval bokeh with horizontal specular flare streaks.',
    },
    {
      id: 'vintage_swirl',
      name: 'Petzval Vintage Swirl',
      fStop: 'f/1.8' as FStopValue,
      bokehIntensity: 65,
      bokehBloom: 35,
      bokehShape: 'swirly' as BokehShape,
      desc: 'Hypnotic swirly edge bokeh inspired by 19th-century Petzval brass lenses.',
    },
    {
      id: 'architectural_deep',
      name: 'Architectural Infinite',
      fStop: 'f/11' as FStopValue,
      bokehIntensity: 0,
      bokehBloom: 10,
      bokehShape: 'bladed_9' as BokehShape,
      desc: 'Deep focus with zero blur, razor edge-to-edge optical clarity.',
    },
  ];

  const handleApply = () => {
    onApplyAperture({
      fStop: selectedFStop,
      bokehIntensity,
      focusX,
      focusY,
      focusRange,
      bokehShape,
      bokehBloom,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Aperture & Depth-of-Field Optical Showcase</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  Optical Lab
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Interactive lens diaphragm simulator, circle of confusion (CoC) physics, and creamy bokeh rendering.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Iris Diaphragm & Optical Physics (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-5 p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Iris Diaphragm Physical State
              </span>
              <span className="text-xs font-mono font-bold text-cyan-400">{selectedFStop}</span>
            </div>

            {/* Iris Visualizer */}
            <div className="py-2 flex justify-center">
              <ApertureIrisVisualizer
                currentFStop={selectedFStop}
                onSelectFStop={setSelectedFStop}
                bokehShape={bokehShape}
                size={190}
                bladeCount={9}
              />
            </div>

            {/* Optical Specs Card */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Optical Classification:</span>
                <span className="font-bold text-white">{fInfo.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Depth of Field:</span>
                <span className="font-bold text-cyan-300">{fInfo.depthOfField}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Entrance Pupil Opening:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {Math.round(fInfo.irisDiameterRatio * 100)}% of Max Diameter
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Light Gathering Power:</span>
                <span className="font-mono text-amber-400 font-bold">
                  {(1 / (fInfo.fNumber * fInfo.fNumber)).toFixed(3)} EV Ratio
                </span>
              </div>
              <p className="text-[11px] text-slate-300 italic pt-1 border-t border-slate-800">
                "{fInfo.idealFor}"
              </p>
            </div>

            {/* Showcase Quick Presets */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Showcase Optical Presets
              </span>
              <div className="grid grid-cols-2 gap-2">
                {SHOWCASE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setSelectedFStop(preset.fStop);
                      setBokehIntensity(preset.bokehIntensity);
                      setBokehBloom(preset.bokehBloom);
                      setBokehShape(preset.bokehShape);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedFStop === preset.fStop && bokehShape === preset.bokehShape
                        ? 'bg-cyan-500/10 border-cyan-500/60 text-cyan-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs font-bold leading-tight">{preset.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{preset.fStop}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Focus Target & Bokeh Controls (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Interactive Image with Focal Point Target */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Focus className="w-4 h-4 text-cyan-400" />
                  Interactive Focus Point & Depth Plane
                </span>
                <span className="text-[11px] text-slate-400">Click photo to set focal point</span>
              </div>

              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const px = ((e.clientX - rect.left) / rect.width) * 100;
                  const py = ((e.clientY - rect.top) / rect.height) * 100;
                  setFocusX(Math.round(px));
                  setFocusY(Math.round(py));
                }}
                className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800 cursor-crosshair group shadow-xl"
              >
                <img src={activeImageSrc} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />

                {/* Animated Depth of Field Focal Target Ring */}
                <div
                  style={{ left: `${focusX}%`, top: `${focusY}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-150"
                >
                  {/* Outer Focus Bracket */}
                  <div
                    style={{
                      width: `${focusRange * 2.5}px`,
                      height: `${focusRange * 2.5}px`,
                    }}
                    className="rounded-full border-2 border-cyan-400/60 -translate-x-1/2 -translate-y-1/2 absolute animate-pulse"
                  ></div>

                  {/* Target Center Crosshair */}
                  <div className="w-7 h-7 rounded-full bg-cyan-500/20 border-2 border-cyan-400 text-cyan-300 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 absolute shadow-lg shadow-cyan-500/50">
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  </div>

                  <span className="absolute top-4 left-4 whitespace-nowrap px-2 py-0.5 rounded bg-black/80 backdrop-blur text-[10px] font-mono text-cyan-300 border border-cyan-500/40">
                    Focal Plane: ({focusX}%, {focusY}%)
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur text-[10px] font-bold text-slate-300 border border-slate-700">
                  Focal Range: ±{focusRange}%
                </div>
              </div>
            </div>

            {/* Bokeh Controls */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Optical Bokeh Synthesis Parameters
              </span>

              {/* Bokeh Intensity */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Bokeh Blur Radius (CoC)</span>
                  <span className="font-mono text-cyan-400 font-bold">{bokehIntensity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={bokehIntensity}
                  onChange={(e) => setBokehIntensity(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Focus Range Plane */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Focal Plane Thickness (Depth)</span>
                  <span className="font-mono text-cyan-400 font-bold">{focusRange}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={focusRange}
                  onChange={(e) => setFocusRange(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Specular Bloom */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Specular Highlight Bloom</span>
                  <span className="font-mono text-amber-400 font-bold">{bokehBloom}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={bokehBloom}
                  onChange={(e) => setBokehBloom(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Bokeh Shape Selector */}
              <div className="space-y-1.5 pt-1">
                <span className="text-xs text-slate-300">Bokeh Aperture Shape Geometry</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'circular', label: '9-Blade Rounded', desc: 'Creamy Leica' },
                    { id: 'anamorphic', label: 'Anamorphic Oval', desc: 'Cinema 2.39:1' },
                    { id: 'swirly', label: 'Petzval Swirl', desc: 'Vintage Spiral' },
                  ].map((shape) => (
                    <button
                      key={shape.id}
                      onClick={() => setBokehShape(shape.id as BokehShape)}
                      className={`p-2 rounded-xl border text-left text-xs transition-all ${
                        bokehShape === shape.id
                          ? 'bg-cyan-500/10 border-cyan-500/60 text-cyan-200 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="leading-tight">{shape.label}</div>
                      <div className="text-[10px] text-slate-500 font-normal leading-none mt-0.5">
                        {shape.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Apply & Action Buttons */}
            <div className="mt-auto pt-2 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleApply}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Apply to 4K Studio Editor</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
