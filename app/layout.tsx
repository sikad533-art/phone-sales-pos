import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { AppProvider } from '@/lib/store';

export const metadata: Metadata = {
  title: 'سيستم مبيعات فون',
  description: 'نظام إدارة مبيعات للهواتف المحمولة والتقسيط',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ar" dir="rtl">
      <body suppressHydrationWarning className="bg-gray-50 text-gray-900 font-sans">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
