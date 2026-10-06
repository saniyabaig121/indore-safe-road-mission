import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { RefreshCw, MapPin } from 'lucide-react';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const getSeverityColor = (severity) => {
  switch (severity) {
    case 'high': return 'text-red-600';
    case 'moderate': return 'text-yellow-600';
    default: return 'text-green-600';
  }
};

export default function LiveMap() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Indore coordinates
  const indoreCenter = [22.7196, 75.8577];

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reports');
      if (response.ok) {
        const data = await response.json();
        setReports(data || []);
      } else {
        // Fallback for development/testing
        setReports([
          { id: 1, lat: 22.72, lng: 75.86, severity: 'high', description: 'Deep pothole', status: 'reported' },
          { id: 2, lat: 22.71, lng: 75.85, severity: 'moderate', description: 'Multiple cracks', status: 'investigating' }
        ]);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      // Fallback
      setReports([
        { id: 1, lat: 22.72, lng: 75.86, severity: 'high', description: 'Deep pothole', status: 'reported' },
        { id: 2, lat: 22.71, lng: 75.85, severity: 'moderate', description: 'Multiple cracks', status: 'investigating' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="h-full w-full relative flex flex-col">
      <div className="absolute top-4 right-4 z-[400]">
        <button 
          onClick={fetchReports}
          className="bg-white p-2 rounded-full shadow-md border border-gray-200 text-gray-700 hover:text-blue-600 transition-colors"
          title="Refresh map"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="flex-1 w-full h-full z-0">
        <MapContainer center={indoreCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {reports.map((report) => (
            <Marker key={report.id} position={[report.lat, report.lng]}>
              <Popup>
                <div className="p-1">
                  <h3 className="font-bold text-sm mb-1 capitalize flex items-center">
                    <MapPin size={14} className={`mr-1 ${getSeverityColor(report.severity)}`} />
                    {report.severity} Severity
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">{report.description || 'No description provided'}</p>
                  <div className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded-md inline-block uppercase">
                    Status: {report.status || 'Reported'}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[400] bg-white bg-opacity-90 px-4 py-2 rounded-full shadow-md border border-gray-200 text-xs font-medium flex items-center space-x-4 w-auto max-w-[90%] whitespace-nowrap">
        <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-1.5"></span> High</span>
        <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-yellow-500 mr-1.5"></span> Moderate</span>
        <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-green-500 mr-1.5"></span> Low</span>
      </div>
    </div>
  );
}
