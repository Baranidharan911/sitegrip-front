'use client';

import React from 'react';
import toast from 'react-hot-toast';

interface IndexingFormProps {
  urlInput: string;
  setUrlInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export default function IndexingForm({
  urlInput,
  setUrlInput,
  handleSubmit,
  isSubmitting,
}: IndexingFormProps) {
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      toast.error('Please enter a valid URL.');
      return;
    }
    handleSubmit(e);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="mb-8 w-full bg-gray-50 dark:bg-gray-700 rounded-xl shadow-inner flex flex-col sm:flex-row items-stretch gap-4 p-4 sm:p-6"
    >
      <input
        type="url"
        value={urlInput}
        onChange={(e) => setUrlInput(e.target.value)}
        placeholder="Enter your URL here..."
        className="flex-1 px-4 py-3 border rounded-lg text-base focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        required
        disabled={isSubmitting}
        autoFocus
      />
      <button
        type="submit"
        className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition disabled:opacity-60"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Index My URL!'}
      </button>
    </form>
  );
}
