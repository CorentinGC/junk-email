/**
 * Root layout
 * @author Eden Solutions <contact@eden-solutions.pro>
 */

import type { Metadata } from 'next';
import '#styles/globals.scss';
import AuthProvider from '#components/AuthProvider';

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
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}


