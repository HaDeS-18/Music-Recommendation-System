import './globals.css';
import { Providers } from './providers';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Beat Wise",
  description: "A music recommendation system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-900 text-white min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}