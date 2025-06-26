// 'use client';

// import React, { useState } from 'react';
// import AppHeader from '@/components/Layout/AppHeader';
// import UptimeForm from '@/components/Uptime/UptimeForm';
// import UptimeStatus from '@/components/Uptime/UptimeStatus';
// import UptimeResultsTable from '@/components/Uptime/UptimeResultsTable';
// import NoUptimeResults from '@/components/Uptime/NoUptimeResults';

// export default function UptimePage() {
//   const [isLoading, setIsLoading] = useState(false);
//   const [url, setUrl] = useState('');
//   const [results, setResults] = useState<any[]>([]);
//   const [lastChecked, setLastChecked] = useState<Date | null>(null);

//   const handleSubmit = async (inputUrl: string) => {
//     setIsLoading(true);
//     setUrl(inputUrl);

//     // Simulate an async API call
//     setTimeout(() => {
//       const mockResults = [
//         { timestamp: new Date().toISOString(), status: 'UP', responseTime: 192 },
//         { timestamp: new Date(Date.now() - 60 * 1000).toISOString(), status: 'UP', responseTime: 204 },
//         { timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(), status: 'DOWN', responseTime: null },
//       ];
//       setResults(mockResults);
//       setLastChecked(new Date());
//       setIsLoading(false);
//     }, 1500);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
//       <main className="flex-1 flex flex-col items-center justify-start pt-28 px-6 max-w-4xl mx-auto w-full">
//         <h1 className="text-3xl font-bold text-green-700 dark:text-green-400 mb-2">Uptime Monitoring</h1>
//         <p className="text-gray-600 dark:text-gray-300 mb-6">
//           Track website uptime and downtime in real time.
//         </p>

//         <UptimeForm onSubmit={handleSubmit} isLoading={isLoading} />

//         {results.length > 0 ? (
//           <>
//             <UptimeStatus results={results} url={url} lastChecked={lastChecked} />
//             <UptimeResultsTable results={results} />
//           </>
//         ) : (
//           !isLoading && <NoUptimeResults />
//         )}
//       </main>
//     </div>
//   );
// }
