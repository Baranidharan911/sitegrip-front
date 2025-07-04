'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved';
  monitorId: string;
  monitorName: string;
  createdAt: Date;
  resolvedAt?: Date;
  duration?: number;
}

interface IncidentTimelineProps {
  incidents: Incident[];
}

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({ incidents }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'investigating': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return 'Ongoing';
    const hours = Math.floor(duration / 3600000);
    const minutes = Math.floor((duration % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (incidents.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No incidents to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {incidents.map((incident, index) => (
        <motion.div
          key={incident.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-start gap-3">
            <div className={`w-3 h-3 rounded-full ${getSeverityColor(incident.severity)} mt-2`} />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {incident.title}
                </h3>
                <div className="flex items-center gap-2">
                  {getStatusIcon(incident.status)}
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDuration(incident.duration)}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {incident.description}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{incident.monitorName}</span>
                <span>{incident.createdAt.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}; 