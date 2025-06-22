'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface NotificationSettingsProps {
  uid: string;
  onChange: (prefs: any) => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ uid, onChange }) => {
  const [prefs, setPrefs] = useState({ indexing: true, uptime: true, seo: true });

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        const data = snap.data();
        if (data?.notifications) {
          setPrefs(data.notifications);
          onChange(data.notifications);
        }
      }
    };
    fetch();
  }, [uid, onChange]);

  const toggle = (key: keyof typeof prefs) => {
    const newPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(newPrefs);
    onChange(newPrefs);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-white">Notification Preferences</h3>
      <div className="space-y-2">
        {['indexing', 'uptime', 'seo'].map((k) => (
          <label
            key={k}
            className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
          >
            <input
              type="checkbox"
              checked={prefs[k as keyof typeof prefs]}
              onChange={() => toggle(k as keyof typeof prefs)}
              className="accent-purple-600"
            />
            {k.charAt(0).toUpperCase() + k.slice(1)} Alerts
          </label>
        ))}
      </div>
    </div>
  );
};

export default NotificationSettings;
