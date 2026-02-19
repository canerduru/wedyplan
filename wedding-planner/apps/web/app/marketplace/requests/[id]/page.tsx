'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { BidComparisonTable } from '@/components/marketplace/BidComparisonTable';
import { MessageBoard } from '@/components/marketplace/MessageBoard';
import { useAuthStore } from '@/lib/store';

export default function RequestDetailsPage({ params }: { params: { id: string } }) {
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    api.get(`/marketplace/requests/${params.id}`).then(res => {
      setRequest(res.data);
      setLoading(false);
    });
  }, [params.id]);

  const handleAcceptBid = async (bidId: string) => {
    if (confirm('Are you sure you want to accept this bid? This will decline all others.')) {
      await api.post(`/marketplace/bids/${bidId}/accept`);
      alert('Bid Accepted!');
      window.location.reload();
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!request) return <div>Request not found</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h1 className="text-3xl font-bold mb-2">{request.title}</h1>
        <div className="flex gap-4 text-sm text-gray-500 mb-4">
          <span>{request.category}</span>
          <span>• {request.location}</span>
          <span>• {request.budgetRangeMin} - {request.budgetRangeMax} ₺</span>
        </div>
        <p className="text-gray-700">{request.description}</p>
        <div className="mt-4 inline-block px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800">
          Status: {request.status.toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">Bids ({request.bids.length})</h2>
          <BidComparisonTable bids={request.bids} onAccept={handleAcceptBid} />
        </div>
        <div>
          <h2 className="text-xl font-bold mb-4">Messages</h2>
          <MessageBoard requestId={request.id} currentUserId={user?.id || ''} />
        </div>
      </div>
    </div>
  );
}
