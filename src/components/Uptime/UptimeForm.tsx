'use client';
import React, { useState } from 'react';

interface UptimeFormProps {
  onSubmit: (inputUrl: string) => void;
  isLoading: boolean;
}

export default function UptimeForm({ onSubmit, isLoading }: UptimeFormProps) {
  const [inputUrl, setInputUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    onSubmit(inputUrl.trim());
    setInputUrl('');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 flex flex-col sm:flex-row gap-4 w-full">
      <input
        type="url"
        value={inputUrl}
        onChange={(e) => setInputUrl(e.target.value)}
        placeholder="Enter website URL to monitor"
        className="flex-grow px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
        required
      />
      <button
        type="submit"
        disabled={isLoading}
        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition disabled:opacity-50"
      >
        {isLoading ? 'Checking...' : 'Check Uptime'}
      </button>
    </form>
  );
}
