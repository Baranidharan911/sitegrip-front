'use client';

import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const LogoutButton = () => {
  const { signOut, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: if signOut fails, still clear local data and redirect
      localStorage.removeItem('Sitegrip-user');
      window.location.href = '/login';
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-2 text-red-600 text-sm font-medium hover:underline disabled:opacity-50"
    >
      <LogOut size={18} /> 
      {loading ? 'Logging out...' : 'Logout'}
    </button>
  );
};

export default LogoutButton;
