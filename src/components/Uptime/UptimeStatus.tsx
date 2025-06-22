'use client';
import React from 'react';

interface UptimeResult {
  timestamp: string;
  status: string;
  responseTime: number | null;
}

interface UptimeStatusProps {
  results: UptimeResult[];
  url: string;
  lastChecked: Date | null;
}

export default function UptimeStatus({ results, url, lastChecked }: UptimeStatusProps) {
  const latest = results[0];

  return (
    <div className="text-center mb-6 w-full">
      <p className="text-gray-700 dark:text-gray-300 text-sm mb-1">
        Monitoring: <span className="font-semibold text-indigo-600">{url}</span>
      </p>
      <p className="text-md font-medium text-gray-700 dark:text-gray-300">
        Last checked: {lastChecked ? lastChecked.toLocaleString() : '—'}
      </p>
      <p className="mt-1 text-md">
        Status: <span className={`font-bold ${latest.status === 'UP' ? 'text-green-600' : 'text-red-500'}`}>{latest.status}</span>
        {latest.responseTime !== null && (
          <span className="ml-2 text-sm text-gray-500">({latest.responseTime}ms)</span>
        )}
      </p>
    </div>
  );
}
