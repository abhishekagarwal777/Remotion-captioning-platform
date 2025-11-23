import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './global.css';
// import './fonts/fonts.css';
import { ToastProvider } from '../components/ui/Toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Remotion Captioning Platform',
  description: 'Automatically generate and render captions on videos using Remotion',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
