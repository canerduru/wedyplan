'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

export function CreateRequestModal({ weddingId, onClose }: { weddingId: string, onClose: () => void }) {
  const [formData, setFormData] = useState({
    category: 'Photography',
    title: '',
    description: '',
    budgetRangeMin: '',
    budgetRangeMax: ''
  });

  const handleSubmit = async () => {
    try {
      await api.post('/marketplace/requests', {
        ...formData,
        // weddingId is handled by backend from auth context
        budgetRangeMin: Number(formData.budgetRangeMin),
        budgetRangeMax: Number(formData.budgetRangeMax)
      });
      alert('Request Posted!');
      onClose();
    } catch (err) {
      alert('Failed to post request');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Create Service Request</h2>
        <div className="space-y-4">
          <select
            className="border p-2 w-full rounded"
            value={formData.category}
            onChange={e => setFormData({...formData, category: e.target.value})}
          >
            <option>Photography</option>
            <option>Venue</option>
            <option>Catering</option>
          </select>
          <input
            placeholder="Title (e.g. Wedding Photographer needed)"
            className="border p-2 w-full rounded"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
          />
          <textarea
            placeholder="Describe what you need..."
            className="border p-2 w-full rounded h-24"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Min Budget"
              className="border p-2 w-full rounded"
              value={formData.budgetRangeMin}
              onChange={e => setFormData({...formData, budgetRangeMin: e.target.value})}
            />
            <input
              type="number"
              placeholder="Max Budget"
              className="border p-2 w-full rounded"
              value={formData.budgetRangeMax}
              onChange={e => setFormData({...formData, budgetRangeMax: e.target.value})}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 text-gray-500">Cancel</button>
            <button onClick={handleSubmit} className="px-4 py-2 bg-purple-600 text-white rounded">Post Request</button>
          </div>
        </div>
      </div>
    </div>
  );
}
