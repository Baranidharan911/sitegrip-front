'use client';

import React from 'react';
import { MonitoringDashboard } from '../../components/Monitoring/MonitoringDashboard';

export default function UptimePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <MonitoringDashboard />
    </div>
  );
} 
