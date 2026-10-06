import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, CheckCircle2, Clock, TrendingUp } from 'lucide-react';

export default function AnalyticsCards({ reports }) {
  const total = reports.length;
  const pending = reports.filter(r => r.status === 'pending').length;
  const fixed = reports.filter(r => r.status === 'fixed').length;
  const inProgress = reports.filter(r => r.status === 'in-progress').length;

  const data = [
    { name: 'Pending', count: pending, fill: '#ef4444' },
    { name: 'In Progress', count: inProgress, fill: '#eab308' },
    { name: 'Fixed', count: fixed, fill: '#22c55e' }
  ];

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Reports</p>
            <p className="text-3xl font-bold text-gray-900">{total}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
            <TrendingUp size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Pending</p>
            <p className="text-3xl font-bold text-red-600">{pending}</p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-full">
            <AlertCircle size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">In Progress</p>
            <p className="text-3xl font-bold text-yellow-600">{inProgress}</p>
          </div>
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-full">
            <Clock size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Fixed</p>
            <p className="text-3xl font-bold text-green-600">{fixed}</p>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-full">
            <CheckCircle2 size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">Reports by Status</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
