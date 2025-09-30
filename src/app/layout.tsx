/**
 * Root layout
 * @author Eden Solutions <contact@eden-solutions.pro>
 */

import type { Metadata } from 'next';
import '#styles/globals.scss';

export const metadata: Metadata = {
  title: 'Junk Mail - Disposable Email',
  description: 'Temporary email service for testing and privacy',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}


