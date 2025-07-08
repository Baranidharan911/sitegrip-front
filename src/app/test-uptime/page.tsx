'use client';

import React, { useEffect, useState } from 'react';
import { useRealTimeUptime } from '../../hooks/useRealTimeUptime';

export default function TestUptimePage() {
  const {
    monitors,
    connectionStatus,
    loading,
    error,
    summary,
    connect,
    disconnect,
    refreshMonitors
  } = useRealTimeUptime(false); // Don't auto-connect

  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    addLog('Test page loaded');
  }, []);

  useEffect(() => {
    addLog(`Connection status: ${connectionStatus.isConnected ? 'Connected' : 'Disconnected'}`);
  }, [connectionStatus.isConnected]);

  useEffect(() => {
    if (error) {
      addLog(`Error: ${error}`);
    }
  }, [error]);

  const handleConnect = async () => {
    try {
      addLog('Attempting to connect...');
      await connect();
      addLog('Connect successful');
    } catch (err) {
      addLog(`Connect failed: ${err}`);
    }
  };

  const handleDisconnect = () => {
    addLog('Disconnecting...');
    disconnect();
    addLog('Disconnected');
  };

  const handleRefresh = async () => {
    try {
      addLog('Refreshing monitors...');
      await refreshMonitors();
      addLog(`Refreshed ${monitors.length} monitors`);
    } catch (err) {
      addLog(`Refresh failed: ${err}`);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Uptime Monitoring Test</h1>
      
      {/* Connection Controls */}
      <div className="flex gap-4">
        <button
          onClick={handleConnect}
          disabled={connectionStatus.isConnected || loading}
          className="px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-400"
        >
          {loading ? 'Connecting...' : 'Connect'}
        </button>
        
        <button
          onClick={handleDisconnect}
          disabled={!connectionStatus.isConnected}
          className="px-4 py-2 bg-red-600 text-white rounded disabled:bg-gray-400"
        >
          Disconnect
        </button>
        
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Refresh
        </button>
      </div>

      {/* Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-100 rounded">
          <h3 className="font-semibold">Connection Status</h3>
          <p className={connectionStatus.isConnected ? 'text-green-600' : 'text-red-600'}>
            {connectionStatus.isConnected ? 'Connected' : 'Disconnected'}
          </p>
        </div>
        
        <div className="p-4 bg-gray-100 rounded">
          <h3 className="font-semibold">Monitors</h3>
          <p>{monitors.length} monitors</p>
        </div>
        
        <div className="p-4 bg-gray-100 rounded">
          <h3 className="font-semibold">Summary</h3>
          <p>{summary ? `${summary.totalMonitors - (summary.totalMonitors - summary.upMonitors)}/${summary.totalMonitors} online` : 'Loading...'}</p>
        </div>
      </div>

      {/* Monitors List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Monitors</h2>
        <div className="space-y-2">
          {monitors.map(monitor => (
            <div key={monitor.id} className="p-4 border rounded flex justify-between items-center">
              <div>
                <h3 className="font-medium">{monitor.name}</h3>
                <p className="text-sm text-gray-600">{monitor.url}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-sm ${
                  monitor.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {monitor.status ? 'UP' : 'DOWN'}
                </span>
                <span className="text-sm text-gray-600">
                  {monitor.lastResponseTime ? `${monitor.lastResponseTime}ms` : 'N/A'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logs */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Logs</h2>
        <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
} 