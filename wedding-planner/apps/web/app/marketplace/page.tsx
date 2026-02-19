'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { VendorSearch } from '@/components/marketplace/VendorSearch';
import { VendorCard } from '@/components/marketplace/VendorCard';
import { CreateRequestModal } from '@/components/marketplace/CreateRequestModal';

export default function MarketplacePage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [showRequestModal, setShowRequestModal] = useState(false);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Vendor Marketplace</h1>
        <button
          onClick={() => setShowRequestModal(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded shadow hover:bg-purple-700"
        >
          Post a Request
        </button>
      </div>

      <VendorSearch onSearch={setVendors} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map(vendor => (
          <VendorCard key={vendor.id} vendor={vendor} />
        ))}
      </div>

      {vendors.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          Use the search filters to find vendors or post a request to get bids.
        </div>
      )}

      {showRequestModal && (
        <CreateRequestModal
          weddingId="" // Handled by auth context in modal logic
          onClose={() => setShowRequestModal(false)}
        />
      )}
    </div>
  );
}
