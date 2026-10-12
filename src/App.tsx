import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { StudioEditor } from './components/StudioEditor';
import { BatchProcessingHub } from './components/BatchProcessingHub';
import { AiGenerator } from './components/AiGenerator';
import { SaaSDashboard } from './components/SaaSDashboard';
import { BatchItem, SamplePhoto } from './types';
import { SAMPLE_PHOTOS } from './utils/sampleData';

export default function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'batch' | 'generate' | 'saas'>('studio');
  const [batchQueue, setBatchQueue] = useState<BatchItem[]>([]);
  const [credits, setCredits] = useState<number>(88);
  const maxCredits = 100;
  const [selectedSampleForStudio, setSelectedSampleForStudio] = useState<SamplePhoto | undefined>(
    SAMPLE_PHOTOS[0]
  );

  // Credit deduction helper
  const handleUseCredit = (amount = 1): boolean => {
    if (credits < amount) {
      return false;
    }
    setCredits((prev) => Math.max(0, prev - amount));
    return true;
  };

  // Top up credits
  const handleTopUp = () => {
    setCredits((prev) => Math.min(maxCredits, prev + 50));
  };

  // Add item to batch queue
  const handleAddToBatch = (item: Omit<BatchItem, 'id' | 'status' | 'progress'>) => {
    const newItem: BatchItem = {
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      status: 'idle',
      progress: 0,
    };
    setBatchQueue((prev) => [...prev, newItem]);
  };

  // Switch to studio with a given sample
  const handleSendToStudio = (sample: SamplePhoto) => {
    setSelectedSampleForStudio(sample);
    setActiveTab('studio');
  };

  const handleOpenAperture = () => {
    setActiveTab('studio');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        batchCount={batchQueue.length}
        credits={credits}
        maxCredits={maxCredits}
        onOpenApertureShowcase={handleOpenAperture}
      />

      <main className="flex-1 flex flex-col">
        {activeTab === 'studio' && (
          <StudioEditor
            onAddToBatch={handleAddToBatch}
            onUseCredit={() => handleUseCredit(1)}
            selectedSample={selectedSampleForStudio}
          />
        )}

        {activeTab === 'batch' && (
          <BatchProcessingHub
            batchQueue={batchQueue}
            setBatchQueue={setBatchQueue}
            onUseCredit={(amount = 1) => handleUseCredit(amount)}
            onPreviewItem={(item) => {
              handleSendToStudio({
                id: item.id,
                title: item.name,
                category: 'Batch Item',
                aspectRatio: '16:9',
                originalResolution: `${item.originalWidth} × ${item.originalHeight}`,
                targetResolution: `${item.targetWidth} × ${item.targetHeight}`,
                thumbnail: item.processedUrl || item.originalUrl,
                url: item.processedUrl || item.originalUrl,
                description: item.customPrompt || 'Batch processed item',
                suggestedPreset: item.preset,
              });
            }}
          />
        )}

        {activeTab === 'generate' && (
          <AiGenerator
            onSendToStudio={handleSendToStudio}
            onAddToBatch={handleAddToBatch}
            onUseCredit={() => handleUseCredit(1)}
          />
        )}

        {activeTab === 'saas' && (
          <SaaSDashboard
            credits={credits}
            maxCredits={maxCredits}
            onTopUp={handleTopUp}
          />
        )}
      </main>
    </div>
  );
}
