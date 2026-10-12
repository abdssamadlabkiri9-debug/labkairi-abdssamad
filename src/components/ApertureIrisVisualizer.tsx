import React from 'react';
import { FStopValue, F_STOPS, BokehShape } from '../types';

interface ApertureIrisVisualizerProps {
  currentFStop: FStopValue;
  onSelectFStop: (fStop: FStopValue) => void;
  bladeCount?: 7 | 9;
  bokehShape?: BokehShape;
  size?: number;
  interactive?: boolean;
}

export const ApertureIrisVisualizer: React.FC<ApertureIrisVisualizerProps> = ({
  currentFStop,
  onSelectFStop,
  bladeCount = 9,
  bokehShape = 'circular',
  size = 180,
  interactive = true,
}) => {
  const fInfo = F_STOPS.find((f) => f.label === currentFStop) || F_STOPS[2];
  const openingRatio = fInfo.irisDiameterRatio; // 0.12 (f/16) to 0.96 (f/1.2)

  // Lens radius
  const outerR = size / 2;
  const innerR = Math.max(8, outerR * 0.78 * openingRatio);

  // Generate iris blades polygons
  const blades: string[] = [];
  const count = bladeCount;
  const angleStep = (Math.PI * 2) / count;

  for (let i = 0; i < count; i++) {
    const a1 = i * angleStep;
    const a2 = (i + 1) * angleStep;
    const a3 = (i + 2.2) * angleStep;

    const p1x = outerR + Math.cos(a1) * outerR * 0.95;
    const p1y = outerR + Math.sin(a1) * outerR * 0.95;

    const p2x = outerR + Math.cos(a2) * innerR;
    const p2y = outerR + Math.sin(a2) * innerR;

    const p3x = outerR + Math.cos(a3) * outerR * 0.95;
    const p3y = outerR + Math.sin(a3) * outerR * 0.95;

    blades.push(`M ${p1x} ${p1y} L ${p2x} ${p2y} L ${p3x} ${p3y} Z`);
  }

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      {/* Iris SVG Graphic */}
      <div className="relative group flex items-center justify-center">
        {/* Optical Glow behind opening */}
        <div
          className="absolute rounded-full transition-all duration-300"
          style={{
            width: `${innerR * 2.2}px`,
            height: `${bokehShape === 'anamorphic' ? innerR * 1.5 : innerR * 2.2}px`,
            background:
              'radial-gradient(circle, rgba(56,189,248,0.85) 0%, rgba(99,102,241,0.4) 60%, transparent 100%)',
            filter: 'blur(8px)',
          }}
        ></div>

        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="relative z-10 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]"
        >
          <defs>
            {/* Outer lens barrel gradient */}
            <radialGradient id="barrelGrad" cx="50%" cy="50%" r="50%">
              <stop offset="70%" stop-color="#0b1120" />
              <stop offset="90%" stop-color="#1e293b" />
              <stop offset="100%" stop-color="#020617" />
            </radialGradient>

            {/* Titanium blade metallic texture */}
            <linearGradient id="bladeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#1e293b" />
              <stop offset="50%" stop-color="#0f172a" />
              <stop offset="100%" stop-color="#334155" />
            </linearGradient>

            {/* Aperture hole clip */}
            <clipPath id="irisHole">
              {bokehShape === 'anamorphic' ? (
                <ellipse cx={outerR} cy={outerR} rx={innerR * 0.7} ry={innerR} />
              ) : (
                <circle cx={outerR} cy={outerR} r={innerR} />
              )}
            </clipPath>
          </defs>

          {/* Outer Lens Barrel Ring */}
          <circle cx={outerR} cy={outerR} r={outerR - 2} fill="url(#barrelGrad)" stroke="#38bdf8" stroke-width="1.5" opacity="0.9" />
          <circle cx={outerR} cy={outerR} r={outerR - 8} fill="none" stroke="#475569" stroke-width="1" stroke-dasharray="3 3" />

          {/* Aperture Iris Blades */}
          <g>
            {blades.map((d, idx) => (
              <path
                key={idx}
                d={d}
                fill="url(#bladeGrad)"
                stroke="#0f172a"
                stroke-width="1.2"
                className="transition-all duration-300 ease-out"
                opacity="0.95"
              />
            ))}
          </g>

          {/* Optical Clear Center Aperture Opening */}
          <circle
            cx={outerR}
            cy={outerR}
            r={innerR}
            fill="#38bdf8"
            fill-opacity={Math.max(0.15, openingRatio * 0.45)}
            stroke="#7dd3fc"
            stroke-width="1.5"
            className="transition-all duration-300 ease-out"
          />

          {/* Center Light Spot */}
          <circle
            cx={outerR}
            cy={outerR}
            r={Math.max(2, innerR * 0.25)}
            fill="#ffffff"
            opacity="0.9"
            className="transition-all duration-300"
          />
        </svg>

        {/* Center F-Stop readout overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
          <span className="font-mono font-black text-white text-base drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] bg-black/60 px-2 py-0.5 rounded-md border border-cyan-500/40">
            {currentFStop}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-300 mt-0.5 drop-shadow">
            {fInfo.depthOfField}
          </span>
        </div>
      </div>

      {/* Interactive F-Stop Aperture Ring Clicker */}
      {interactive && (
        <div className="flex flex-wrap items-center justify-center gap-1 max-w-xs">
          {F_STOPS.map((stop) => (
            <button
              key={stop.label}
              onClick={() => onSelectFStop(stop.label)}
              className={`px-2 py-1 rounded-md text-[11px] font-mono font-bold transition-all ${
                currentFStop === stop.label
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 scale-105'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
              title={`${stop.name} • ${stop.depthOfField} Depth of Field`}
            >
              {stop.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
