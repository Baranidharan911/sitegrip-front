'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ActivityEntry {
  action: string;
  timestamp: Timestamp;
}

interface ActivityLogProps {
  uid: string;
}

const ActivityLog: React.FC<ActivityLogProps> = ({ uid }) => {
  const [logs, setLogs] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const q = query(
          collection(db, 'activityLogs'),
          where('uid', '==', uid),
          orderBy('timestamp', 'desc'),
          limit(5)
        );

        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => doc.data()) as ActivityEntry[];
        setLogs(data);
      } catch (err) {
        console.error('Failed to fetch activity logs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [uid]);

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-white">Recent Activity</h3>

      {loading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      ) : logs.length === 0 ? (
        <p className="text-sm text-gray-400">No recent activity</p>
      ) : (
        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 pl-2">
          {logs.map((log, i) => (
            <li key={i}>
              {log.action}{' '}
              <span className="text-gray-400 text-xs">
                — {log.timestamp?.toDate
                  ? new Date(log.timestamp.toDate()).toLocaleString()
                  : 'Unknown time'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ActivityLog;
