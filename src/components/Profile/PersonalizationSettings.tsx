'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface PersonalizationSettingsProps {
  uid: string;
  onChange: (prefs: { defaultModule: string; uiDensity: string }) => void;
}

const PersonalizationSettings: React.FC<PersonalizationSettingsProps> = ({ uid, onChange }) => {
  const [module, setModule] = useState('');
  const [density, setDensity] = useState('comfy');

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        const d = snap.data();
        const values = {
          defaultModule: d.defaultModule || '',
          uiDensity: d.uiDensity || 'comfy',
        };
        setModule(values.defaultModule);
        setDensity(values.uiDensity);
        onChange(values);
      }
    };
    load();
  }, [uid, onChange]);

  useEffect(() => {
    onChange({ defaultModule: module, uiDensity: density });
  }, [module, density, onChange]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-white">Personalization</h3>
      <div className="flex flex-wrap gap-4">
        <select
          value={module}
          onChange={(e) => setModule(e.target.value)}
          className="border rounded px-3 py-2 w-full md:w-60 dark:bg-gray-800 dark:text-white"
        >
          <option value="">Select default module</option>
          <option value="/indexing">Indexing</option>
          <option value="/seo-crawler">SEO Crawler</option>
          <option value="/uptime">Uptime</option>
        </select>
        <select
          value={density}
          onChange={(e) => setDensity(e.target.value)}
          className="border rounded px-3 py-2 w-full md:w-40 dark:bg-gray-800 dark:text-white"
        >
          <option value="comfy">Comfy UI</option>
          <option value="compact">Compact UI</option>
        </select>
      </div>
    </div>
  );
};

export default PersonalizationSettings;
