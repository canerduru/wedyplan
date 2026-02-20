'use client';

import { THEMES } from '@/lib/website-themes';

export default function PublicWebsiteLayout({
  children,
  theme // Passed from page.tsx props or context
}: {
  children: React.ReactNode,
  theme: string
}) {
  const themeConfig = THEMES[theme as keyof typeof THEMES] || THEMES.classic;

  return (
    <div
      className="min-h-screen"
      style={{
        fontFamily: themeConfig.font,
        backgroundColor: '#fafafa', // Neutral base
        color: '#333'
      }}
    >
      <style jsx global>{`
        :root {
          --primary-color: ${themeConfig.primary};
        }
      `}</style>
      {children}
    </div>
  );
}
