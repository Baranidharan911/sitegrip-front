'use client';

import { LogOut } from 'lucide-react';

const LogoutButton = () => {
  const logout = () => {
    localStorage.removeItem('webwatch-user');
    window.location.href = '/login';
  };

  return (
    <button
      onClick={logout}
      className="flex items-center gap-2 text-red-600 text-sm font-medium hover:underline"
    >
      <LogOut size={18} /> Logout
    </button>
  );
};

export default LogoutButton;
