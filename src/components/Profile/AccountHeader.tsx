'use client';

import React from 'react';

interface AccountHeaderProps {
  user: {
    displayName?: string;
    email: string;
    avatar?: string;
    metadata?: {
      creationTime?: string;
      lastSignInTime?: string;
    };
  };
}

const formatDate = (dateStr?: string) =>
  dateStr ? new Date(dateStr).toLocaleDateString() : '—';

const AccountHeader: React.FC<AccountHeaderProps> = ({ user }) => {
  const getInitial = (nameOrEmail: string) =>
    nameOrEmail?.trim()?.charAt(0)?.toUpperCase() || '?';

  const avatarSrc =
    user?.avatar?.startsWith('data:') || user?.avatar?.startsWith('http')
      ? user.avatar
      : null;

  return (
    <div className="flex items-center gap-4 p-4 rounded border bg-white/60 dark:bg-gray-800/60 shadow-sm">
      <div className="w-14 h-14 rounded-full overflow-hidden bg-indigo-600 text-white flex items-center justify-center font-bold text-xl">
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt="Avatar"
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          getInitial(user.displayName || user.email)
        )}
      </div>
      <div>
        <p className="text-lg font-semibold text-gray-800 dark:text-white">
          {user.displayName || 'Unnamed User'}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Joined: {formatDate(user.metadata?.creationTime)} | Last login:{' '}
          {formatDate(user.metadata?.lastSignInTime)}
        </p>
      </div>
    </div>
  );
};

export default AccountHeader;
