'use client';

import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { clearAllAuthData } from '@/utils/auth';

const LogoutButton = () => {
  const { signOut, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      // The signOut function now handles the redirect and page reload
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: if signOut fails, still clear all local data and redirect
      clearAllAuthData();
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
        window.location.href = '/login';
      }
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
