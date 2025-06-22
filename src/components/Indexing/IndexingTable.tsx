'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface IndexingRequest {
  id: string;
  url: string;
  status: string;
  timestamp?: {
    toDate: () => Date;
  };
  indexedAt?: {
    toDate: () => Date;
  };
  failureReason?: string;
}

interface Props {
  requests: IndexingRequest[];
  onRetry: (e: React.MouseEvent, url: string) => void;
}

export default function IndexingTable({ requests, onRetry }: Props) {
  return (
    <section className="w-full">
      <h3 className="text-2xl font-semibold mb-4 border-b pb-2 dark:text-white">
        Recent Indexing Requests
      </h3>

      {requests.length === 0 ? (
        <p className="text-center text-gray-500 italic bg-gray-50 dark:bg-gray-800 p-4 rounded">
          No URLs submitted yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
            <thead className="bg-gray-100 dark:bg-gray-700 dark:text-white">
              <tr>
                <th className="px-4 py-2">URL</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-t border-gray-200 dark:border-gray-700">
                  {/* URL + Copy */}
                  <td className="px-4 py-2 text-blue-600 underline flex items-center gap-2">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate max-w-[200px] md:max-w-none"
                    >
                      {r.url}
                    </a>
                    <button
                      className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                      onClick={() => navigator.clipboard.writeText(r.url)}
                      title="Copy URL"
                    >
                      📋
                    </button>
                  </td>

                  {/* Status + Failure Reason + Retry */}
                  <td className="px-4 py-2">
                    <div>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          r.status.includes('Indexed')
                            ? 'bg-green-100 text-green-700'
                            : r.status.includes('Submitted')
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {r.status}
                      </span>

                      {r.status.includes('Failed') && r.failureReason && (
                        <div className="mt-1 space-y-1">
                          <p className="text-xs text-red-500">{r.failureReason}</p>
                          <button
                            className="text-xs underline text-indigo-500 hover:text-indigo-700"
                            onClick={(e) => onRetry(e, r.url)}
                          >
                            Retry
                          </button>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Time Since Submitted */}
                  <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    {r.timestamp?.toDate()
                      ? formatDistanceToNow(r.timestamp.toDate(), { addSuffix: true })
                      : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
