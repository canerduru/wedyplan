'use client';

import { useState } from 'react';
import { MoodBoardPage } from '@/components/design/MoodBoardPage';
import { ColorPaletteSelector } from '@/components/design/ColorPaletteSelector';
import { AIRenderModal } from '@/components/design/AIRenderModal';

export default function DesignHubPage({ params }: { params: { weddingId: string } }) {
  const [showAI, setShowAI] = useState(false);
  const weddingId = params.weddingId || 'mock-id';

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Design Studio</h1>
        <button
          onClick={() => setShowAI(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition transform hover:scale-105"
        >
          ✨ AI Venue Magic
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-4">Mood Board</h2>
            <div className="bg-white rounded-lg shadow min-h-[400px]">
              <MoodBoardPage weddingId={weddingId} initialPins={[]} />
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <ColorPaletteSelector weddingId={weddingId} onSave={() => {}} />

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-bold mb-4">Quick Actions</h3>
            <a href="/design/invitation" className="block w-full text-center border border-gray-300 py-3 rounded hover:bg-gray-50">
              💌 Design Invitations
            </a>
          </div>
        </div>
      </div>

      {showAI && <AIRenderModal onClose={() => setShowAI(false)} />}
    </div>
  );
}
