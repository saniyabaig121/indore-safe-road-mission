import React, { useState } from 'react';
import ReportForm from './ReportForm';
import LiveMap from './LiveMap';
import { Camera, Map as MapIcon } from 'lucide-react';

export default function CitizenApp() {
  const [activeTab, setActiveTab] = useState('report');

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      <header className="bg-blue-600 text-white p-4 shadow-md z-10 relative">
        <h1 className="text-xl font-bold text-center">Indore Pothole Tracker</h1>
      </header>

      <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
        {activeTab === 'report' ? <ReportForm /> : <LiveMap />}
      </main>

      <nav className="bg-white border-t border-gray-200 flex pb-safe">
        <button
          onClick={() => setActiveTab('report')}
          className={`flex-1 py-3 flex flex-col items-center justify-center transition-colors ${
            activeTab === 'report' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Camera size={24} className="mb-1" />
          <span className="text-xs font-medium">Report</span>
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`flex-1 py-3 flex flex-col items-center justify-center transition-colors ${
            activeTab === 'map' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <MapIcon size={24} className="mb-1" />
          <span className="text-xs font-medium">Live Map</span>
        </button>
      </nav>
    </div>
  );
}
