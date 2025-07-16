"use client";

import { useState, useEffect } from "react";
import { Loader2, Activity, FileText, Download, Printer, Share2, CheckCircle, AlertCircle, Check, Star, XCircle, Clock, Zap } from "lucide-react";
import { RealTimeUptimeDashboard } from '../../components/Uptime/RealTimeUptimeDashboard';
import AuthGuard from '@/components/Common/AuthGuard';

export const dynamic = 'force-dynamic';

export default function UptimePage() {
  return (
    <AuthGuard>
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <RealTimeUptimeDashboard />
    </div>
    </AuthGuard>
  );
} 
