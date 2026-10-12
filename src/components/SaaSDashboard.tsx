import React, { useState } from 'react';
import {
  Zap,
  Check,
  ShieldCheck,
  HardDrive,
  Copy,
  CheckCircle,
  Terminal,
  Activity,
  Layers,
  ArrowRight,
  Key,
} from 'lucide-react';

interface SaaSDashboardProps {
  credits: number;
  maxCredits: number;
  onTopUp: () => void;
}

export const SaaSDashboard: React.FC<SaaSDashboardProps> = ({
  credits,
  maxCredits,
  onTopUp,
}) => {
  const [activePlan, setActivePlan] = useState<'starter' | 'pro' | 'agency'>('pro');
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [copiedCurl, setCopiedCurl] = useState<boolean>(false);

  const apiKeySnippet = 'lmx_live_948f2c019a84b0e388147d';
  const curlSnippet = `curl -X POST https://lumix4k.api/v1/batch \\
  -H "Authorization: Bearer ${apiKeySnippet}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "images": ["https://images.example.com/raw_photo_1080p.jpg"],
    "target_resolution": "3840x2160",
    "preset": "ultra_clarity",
    "format": "png",
    "webhook_url": "https://my-app.com/api/webhooks/photo-ready"
  }'`;

  const copyToClipboard = (text: string, type: 'key' | 'curl') => {
    navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8 flex flex-col gap-8">
      {/* SaaS Overview Header */}
      <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">
                Lumix4K Micro SaaS Console
              </h1>
              <p className="text-xs text-slate-400">
                Subscription plans, neural credit limits, API authentication, and webhooks.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onTopUp}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>Top Up +50 4K Credits</span>
        </button>
      </div>

      {/* Usage & Health Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Neural 4K Credits</span>
            <HardDrive className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-black text-white">{credits}</span>
            <span className="text-xs text-slate-500 font-normal"> / {maxCredits} left</span>
            <div className="w-full h-2 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                style={{ width: `${(credits / maxCredits) * 100}%` }}
              ></div>
            </div>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Auto-renews next cycle
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total 4K Rendered</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-black text-white">1,428</span>
            <span className="text-xs text-slate-500"> photos</span>
            <div className="text-[11px] text-cyan-400 font-mono mt-1">11.8 Gigapixels exported</div>
          </div>
          <span className="text-[10px] text-slate-400">+342 photos this week</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Inference Speed</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-black text-emerald-400">1.18s</span>
            <span className="text-xs text-slate-500"> / photo</span>
            <div className="text-[11px] text-slate-400 mt-1">NVIDIA TensorRT + Gemini V3</div>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold">99.98% Uptime SLA</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Tier</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-black text-cyan-300 uppercase">Pro Studio</span>
            <div className="text-[11px] text-slate-400 mt-1">$49 / billed monthly</div>
          </div>
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Priority Batch Queue</span>
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-extrabold text-white">SaaS Subscription Plans</h2>
          <p className="text-xs text-slate-400">
            Scale seamlessly from individual photographers to high-volume commercial photo studios.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Starter Plan */}
          <div
            onClick={() => setActivePlan('starter')}
            className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              activePlan === 'starter'
                ? 'bg-slate-900/90 border-cyan-500 ring-2 ring-cyan-500/20'
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Starter</span>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-black text-white">$19</span>
                <span className="text-xs text-slate-400"> / month</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Ideal for solo creators and hobbyist photographers upscaling occasional galleries.
              </p>

              <div className="mt-6 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400" />
                  <span>250 4K Super-Res exports / mo</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400" />
                  <span>Batch queue size: up to 10 photos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400" />
                  <span>All 7 AI Enhancement presets</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400" />
                  <span>Standard processing speed</span>
                </div>
              </div>
            </div>

            <button className="mt-6 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors">
              Downgrade to Starter
            </button>
          </div>

          {/* Pro Studio Plan (Active) */}
          <div
            onClick={() => setActivePlan('pro')}
            className={`p-6 rounded-2xl border relative transition-all cursor-pointer flex flex-col justify-between ${
              activePlan === 'pro'
                ? 'bg-gradient-to-b from-cyan-950/30 via-slate-900 to-slate-900 border-cyan-400 ring-2 ring-cyan-500/30 shadow-2xl shadow-cyan-500/10'
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md">
              Current Plan
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Pro Studio</span>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-black text-white">$49</span>
                <span className="text-xs text-slate-400"> / month</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Designed for creative studios, e-commerce brands, and agency workflows.
              </p>

              <div className="mt-6 space-y-2.5 text-xs text-slate-200">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold">1,500 4K Super-Res exports / mo</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400" />
                  <span>Unlimited batch processing queue</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400" />
                  <span>Print-ready 300 DPI metadata export</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400" />
                  <span>Priority GPU queue (1.1s average)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400" />
                  <span>Lossless PNG and WebP 4K ZIP archives</span>
                </div>
              </div>
            </div>

            <button className="mt-6 w-full py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25">
              Active Plan
            </button>
          </div>

          {/* Agency Plan */}
          <div
            onClick={() => setActivePlan('agency')}
            className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              activePlan === 'agency'
                ? 'bg-slate-900/90 border-cyan-500 ring-2 ring-cyan-500/20'
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Agency / Enterprise</span>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-black text-white">$149</span>
                <span className="text-xs text-slate-400"> / month</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                High-concurrency programmatic photo remastering with automated REST API pipelines.
              </p>

              <div className="mt-6 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400" />
                  <span>Unlimited 4K Super-Res exports</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400" />
                  <span>Developer REST API & Webhooks</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400" />
                  <span>50 Concurrent batch streams</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400" />
                  <span>Dedicated enterprise support</span>
                </div>
              </div>
            </div>

            <button className="mt-6 w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md">
              Upgrade to Agency
            </button>
          </div>
        </div>
      </div>

      {/* Developer API & Webhooks Console */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              REST API & Automated Batch Integration
            </h3>
            <p className="text-xs text-slate-400">
              Trigger 4K batch super-resolution directly from your CMS, e-commerce shop, or custom backend.
            </p>
          </div>

          {/* API Key Box */}
          <div className="flex items-center gap-2 p-1.5 pl-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
            <Key className="w-3.5 h-3.5 text-cyan-400" />
            <span>{apiKeySnippet}</span>
            <button
              onClick={() => copyToClipboard(apiKeySnippet, 'key')}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Copy API Key"
            >
              {copiedKey ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* cURL Example */}
        <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 font-mono text-xs">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/60 text-slate-400 text-[11px]">
            <span>bash / curl</span>
            <button
              onClick={() => copyToClipboard(curlSnippet, 'curl')}
              className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors"
            >
              {copiedCurl ? (
                <>
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 font-sans">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span className="font-sans">Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-4 text-slate-300 overflow-x-auto leading-relaxed">{curlSnippet}</pre>
        </div>
      </div>
    </div>
  );
};
