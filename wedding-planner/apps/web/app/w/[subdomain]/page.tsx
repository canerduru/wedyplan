'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import PublicWebsiteLayout from './layout';

export default function PublicWebsitePage({ params }: { params: { subdomain: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    api.get(`/marketplace/public/${params.subdomain}`) // NOTE: Endpoint path adjusted to match controller
      .then(res => {
        setData(res.data);
        setIsAuth(!res.data.password); // If no password, auth is true
      })
      .catch(() => alert('Website not found'))
      .finally(() => setLoading(false));
  }, [params.subdomain]);

  const handleLogin = async () => {
    try {
      await api.post(`/marketplace/public/${params.subdomain}/auth`, { password });
      setIsAuth(true);
    } catch {
      alert('Incorrect password');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>Website Not Found</div>;

  if (data.password && !isAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded shadow text-center">
          <h1 className="text-xl font-bold mb-4">Protected Website</h1>
          <input
            type="password"
            placeholder="Enter Password"
            className="border p-2 rounded mb-2 w-full"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button onClick={handleLogin} className="bg-blue-600 text-white w-full py-2 rounded">
            Enter
          </button>
        </div>
      </div>
    );
  }

  const activePages = data.pages.filter((p: any) => p.isEnabled).sort((a: any, b: any) => a.orderIndex - b.orderIndex);

  return (
    <PublicWebsiteLayout theme={data.theme}>
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="font-bold text-xl" style={{ color: 'var(--primary-color)' }}>
            {data.subdomain.toUpperCase()}
          </div>
          <div className="hidden md:flex gap-6">
            {activePages.map((page: any) => (
              <a
                key={page.id}
                href={`#${page.pageType}`}
                className="hover:text-[var(--primary-color)] transition font-medium"
              >
                {page.title}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      {data.heroImageUrl && (
        <div className="h-[500px] w-full relative">
          <img src={data.heroImageUrl} alt="Couple" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white">
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-4">We're Getting Married!</h1>
              <p className="text-xl">Join us in our celebration</p>
            </div>
          </div>
        </div>
      )}

      {/* Pages Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-24">
        {activePages.map((page: any) => (
          <section key={page.id} id={page.pageType} className="scroll-mt-24">
            <h2
              className="text-3xl font-bold text-center mb-8 pb-4 border-b inline-block mx-auto"
              style={{ borderColor: 'var(--primary-color)' }}
            >
              {page.title}
            </h2>

            <div
              className="prose max-w-none text-center"
              dangerouslySetInnerHTML={{ __html: page.content || '' }}
            />

            {page.pageType === 'rsvp' && (
              <div className="mt-8 text-center">
                <a
                  href="/rsvp/demo-token" // In real app, link to generic RSVP or use embedded form
                  className="inline-block px-8 py-3 text-white rounded-full shadow-lg hover:shadow-xl transition"
                  style={{ backgroundColor: 'var(--primary-color)' }}
                >
                  RSVP Now
                </a>
              </div>
            )}
          </section>
        ))}
      </main>

      <footer className="bg-gray-900 text-white py-8 text-center">
        <p>© 2025 WedPlanner. Built with Love.</p>
      </footer>
    </PublicWebsiteLayout>
  );
}
