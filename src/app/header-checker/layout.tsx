import AppContent from '@/components/Layout/AppContent';

export default function HeaderCheckerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppContent>{children}</AppContent>;
} 