import type { Metadata, Viewport } from 'next';
import './globals.css';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { RegisterSW } from '@/components/pwa/RegisterSW';
import { AppProviders } from '@/components/providers/AppProviders';

export const metadata: Metadata = {
  title: 'Gia Phả Việt',
  description: 'Phần mềm quản lý & kết nối gia phả gia đình Việt Nam',
  applicationName: 'Gia Phả Việt',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Gia Phả Việt', statusBarStyle: 'default' },
};

export const viewport: Viewport = {
  themeColor: '#7c3b2e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-dvh">
        <AppProviders>
          <TopBar />
          <main className="mx-auto w-full max-w-2xl px-4 pb-28 pt-4">{children}</main>
          <BottomNav />
        </AppProviders>
        <RegisterSW />
      </body>
    </html>
  );
}
