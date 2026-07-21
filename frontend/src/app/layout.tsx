import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { env } from '@/constants/env';
import { AppProviders } from '@/providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: {
    default: env.appName,
    template: `%s | ${env.appName}`,
  },
  description:
    'Xen Automation — enterprise platform for managing smart home products, templates, and quotations.',
  icons: {
    icon: '/xen-logo.png',
    apple: '/xen-logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
