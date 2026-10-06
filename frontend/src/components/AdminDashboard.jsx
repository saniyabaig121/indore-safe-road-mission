import React, { useState, useEffect } from 'react';
import AnalyticsCards from './AnalyticsCards';
import ReportsTable from './ReportsTable';
import { Activity } from 'lucide-react';

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReports();
    
    // Setup WebSocket for live updates
    const wsUrl = 'ws://localhost:8001/ws';
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'NEW_REPORT') {
          setReports((prev) => [data.report, ...prev]);
        } else if (data.type === 'UPDATE_REPORT_STATUS') {
          setReports((prev) =>
            prev.map((r) => (r.id === data.reportId ? { ...r, status: data.status } : r))
          );
        }
      } catch (err) {
        console.error('WebSocket message parsing error', err);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reports');
      if (!res.ok) throw new Error('Failed to fetch reports');
      const data = await res.json();
      setReports(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reportId, newStatus) => {
    // Optimistic UI update
    const previousReports = [...reports];
    setReports(reports.map(r => r.id === reportId ? { ...r, status: newStatus } : r));

    try {
      const res = await fetch(`/api/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) {
        throw new Error('Failed to update status');
      }
    } catch (err) {
      console.error(err);
      // Revert on failure
      setReports(previousReports);
      alert('Failed to update report status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Activity className="animate-pulse text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Monitor and manage pothole reports across Indore</p>
          </div>
          {error && <p className="text-red-500 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
        </div>

        <AnalyticsCards reports={reports} />
        <ReportsTable reports={reports} onStatusChange={handleStatusChange} />
      </div>
    </div>
  );
}
