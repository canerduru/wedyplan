'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

const vendorSchema = z.object({
  businessName: z.string().min(2),
  category: z.string(),
  description: z.string(),
  city: z.string(),
  priceRange: z.string(),
});

type VendorForm = z.infer<typeof vendorSchema>;

export default function VendorOnboardingPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<VendorForm>({
    resolver: zodResolver(vendorSchema),
  });

  const onSubmit = async (data: VendorForm) => {
    try {
      // Mock File Upload
      const fileRes = await api.post('/vendor/upload-license', {});
      const licenseUrl = fileRes.data.url;

      await api.post('/vendor/profile', {
        ...data,
        serviceArea: [data.city], // Simplification for now
        licenseUrl,
      });

      alert('Vendor profile created! Wait for approval.');
      router.push('/dashboard');
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to create profile');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full max-w-lg border p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Vendor Onboarding</h1>

        <div>
          <label className="block text-sm font-medium">Business Name</label>
          <input {...register('businessName')} className="border p-2 w-full rounded" />
          {errors.businessName && <p className="text-red-500 text-sm">{errors.businessName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Category</label>
          <select {...register('category')} className="border p-2 w-full rounded">
            <option value="Venue">Venue</option>
            <option value="Photography">Photography</option>
            <option value="Catering">Catering</option>
            <option value="Music">Music</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea {...register('description')} className="border p-2 w-full rounded" rows={3} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">City</label>
            <input {...register('city')} className="border p-2 w-full rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Price Range</label>
            <select {...register('priceRange')} className="border p-2 w-full rounded">
              <option value="$">$ (Budget)</option>
              <option value="$$">$$ (Moderate)</option>
              <option value="$$$">$$$ (Luxury)</option>
            </select>
          </div>
        </div>

        <div className="border-t pt-4">
          <label className="block text-sm font-medium mb-2">Upload License (Mock)</label>
          <div className="border-dashed border-2 p-4 text-center text-gray-500">
            Click to simulate upload
          </div>
        </div>

        <button type="submit" className="bg-purple-600 text-white p-2 rounded w-full mt-4">
          Create Vendor Profile
        </button>
      </form>
    </div>
  );
}
