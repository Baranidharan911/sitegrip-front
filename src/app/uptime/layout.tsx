import AppContent from '@/components/Layout/AppContent';

export default function UptimeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppContent>{children}</AppContent>;
} 