import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CampusTrack AI - Intelligent Attendance Assistant',
  description: 'Subject-wise attendance tracking, shortage prediction, risk alerts, leave reconciliation, and condonation calculator.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
