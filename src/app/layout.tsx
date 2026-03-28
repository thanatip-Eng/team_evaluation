import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ระบบประเมินเพื่อนในกลุ่ม',
  description: 'ระบบประเมินเพื่อนในกลุ่ม - Peer Evaluation System',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="antialiased bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
