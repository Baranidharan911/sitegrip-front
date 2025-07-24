'use client';

import { useSidebar } from '@/context/SidebarContext';

const Backdrop = () => {
  const { isOpen, closeSidebar } = useSidebar();

  return isOpen ? (
    <div
      onClick={closeSidebar}
      className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden"
    />
  ) : null;
};

export default Backdrop;
