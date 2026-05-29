import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DataPulse — AI Analytics Dashboard',
  description: 'Upload, visualize, and get AI-powered insights from your datasets',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
