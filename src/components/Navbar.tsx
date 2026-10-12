import React from 'react';
import { Sparkles, Layers, Sliders, Zap, HardDrive, ShieldCheck, Download, Camera } from 'lucide-react';

interface NavbarProps {
  activeTab: 'studio' | 'batch' | 'generate' | 'saas';
  setActiveTab: (tab: 'studio' | 'batch' | 'generate' | 'saas') => void;
  batchCount: number;
  credits: number;
  maxCredits: number;
  onQuickExport?: () => void;
  onOpenApertureShowcase?: () => void;
  isProcessing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  batchCount,
  credits,
  maxCredits,
  onQuickExport,
  onOpenApertureShowcase,
  isProcessing = false,
}) => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/85 backdrop-blur-md px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950 border border-cyan-500/40 shadow-lg shadow-cyan-500/25 p-1 group hover:border-cyan-400/70 transition-all cursor-pointer">
            {/* Multi-layered Optical Lens Aperture Logo SVG */}
            <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="lensRing" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#06b6d4" />
                  <stop offset="0.5" stopColor="#3b82f6" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
                <radialGradient id="lensCore" cx="20" cy="20" r="14" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#38bdf8" stopOpacity="0.9" />
                  <stop offset="0.6" stopColor="#1e1b4b" stopOpacity="0.8" />
                  <stop offset="1" stopColor="#020617" />
                </radialGradient>
                <linearGradient id="bladeGradLogo" x1="10" y1="10" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#0e7490" />
                  <stop offset="1" stopColor="#1e293b" />
                </linearGradient>
              </defs>
              {/* Outer Lens Housing */}
              <circle cx="20" cy="20" r="18" stroke="url(#lensRing)" strokeWidth="1.75" />
              <circle cx="20" cy="20" r="15" stroke="#334155" strokeWidth="0.75" strokeDasharray="2 2" />

              {/* Core Optical Element */}
              <circle cx="20" cy="20" r="14" fill="url(#lensCore)" />

              {/* Overlapping Aperture Blades */}
              <path d="M 20 6 L 27 15 L 20 18 Z" fill="url(#bladeGradLogo)" stroke="#06b6d4" strokeWidth="0.5" />
              <path d="M 32 13 L 30 24 L 23 20 Z" fill="url(#bladeGradLogo)" stroke="#06b6d4" strokeWidth="0.5" />
              <path d="M 33 25 L 23 30 L 21 22 Z" fill="url(#bladeGradLogo)" stroke="#06b6d4" strokeWidth="0.5" />
              <path d="M 23 34 L 13 30 L 17 22 Z" fill="url(#bladeGradLogo)" stroke="#06b6d4" strokeWidth="0.5" />
              <path d="M 9 27 L 10 16 L 18 19 Z" fill="url(#bladeGradLogo)" stroke="#06b6d4" strokeWidth="0.5" />
              <path d="M 12 13 L 22 9 L 20 17 Z" fill="url(#bladeGradLogo)" stroke="#06b6d4" strokeWidth="0.5" />

              {/* Center High-DPI 4K Aperture Pupil */}
              <circle cx="20" cy="20" r="4.5" fill="#020617" stroke="#38bdf8" strokeWidth="1" />
              <circle cx="20" cy="20" r="2" fill="#ffffff" />
              <circle cx="21" cy="19" r="0.75" fill="#ffffff" />

              {/* Optical Flare Glint */}
              <path d="M 20 7 L 20 10 M 20 30 L 20 33 M 7 20 L 10 20 M 30 20 L 33 20" stroke="#38bdf8" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
            </svg>

            {/* Active Pulse Status Pip */}
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500 ring-2 ring-slate-950"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Lumix<span className="text-cyan-400 font-black">4K</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                PRO SAAS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block tracking-wide">
              Neural 4K Super-Resolution & Batch Studio
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'studio'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>4K Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('batch')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
              activeTab === 'batch'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Batch Engine</span>
            {batchCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-cyan-400 text-slate-950">
                {batchCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('generate')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'generate'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Creator</span>
          </button>

          <button
            onClick={() => setActiveTab('saas')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'saas'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden md:inline">SaaS Tiers & API</span>
            <span className="md:hidden">SaaS</span>
          </button>
        </nav>

        {/* Right side: Credits & Quick Action */}
        <div className="flex items-center gap-3">
          {/* Aperture Showcase Quick Launch */}
          {onOpenApertureShowcase && (
            <button
              onClick={onOpenApertureShowcase}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all shadow-sm"
              title="Open Aperture & Optical Bokeh Showcase Lab"
            >
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Aperture Showcase</span>
            </button>
          )}

          {/* Neural Engine status indicator */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-medium">Gemini 4K Engine</span>
          </div>

          {/* Credits meter */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Credits</span>
              <span className="font-bold text-slate-100 text-xs leading-none">
                {credits} <span className="text-slate-500 font-normal">/ {maxCredits}</span>
              </span>
            </div>
            <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden ml-1">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                style={{ width: `${Math.min(100, (credits / maxCredits) * 100)}%` }}
              ></div>
            </div>
          </div>

          {onQuickExport && (
            <button
              onClick={onQuickExport}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export 4K</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
