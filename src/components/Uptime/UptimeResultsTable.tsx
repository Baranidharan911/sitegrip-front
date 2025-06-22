import React from 'react';

export default function UptimeResultsTable({ results }: { results: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border border-gray-200 dark:border-gray-700">
        <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm">
          <tr>
            <th className="p-3 border-b">URL</th>
            <th className="p-3 border-b">Status</th>
            <th className="p-3 border-b">Response Time</th>
            <th className="p-3 border-b">Last Checked</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {results.map((r, idx) => (
            <tr key={idx} className="border-b">
              <td className="p-3 text-blue-600 underline">{r.url}</td>
              <td className={`p-3 font-bold ${r.status === 'Up' ? 'text-green-600' : 'text-red-600'}`}>
                {r.status}
              </td>
              <td className="p-3">{r.responseTime}</td>
              <td className="p-3">{r.lastChecked}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
