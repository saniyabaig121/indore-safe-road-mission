import React, { useState, useEffect } from 'react';
import { MapPin, Upload, AlertCircle, CheckCircle } from 'lucide-react';

export default function ReportForm() {
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('moderate');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = () => {
    setLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocating(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocating(false);
        }
      );
    } else {
      setLocating(false);
    }
  };

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!photo || !location) return;

    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append('photo', photo);
    formData.append('lat', location.lat);
    formData.append('lng', location.lng);
    formData.append('description', description);
    formData.append('severity', severity);

    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setStatus('success');
        setPhoto(null);
        setDescription('');
        setSeverity('moderate');
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto w-full">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Report a Pothole</h2>
        
        {status === 'success' && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start">
            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm">Thank you! Your report has been submitted successfully.</p>
          </div>
        )}

        {status === 'error' && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm">Something went wrong submitting your report. Please try again.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Take Photo</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors relative">
              <div className="space-y-1 text-center">
                {photo ? (
                  <div className="text-sm text-green-600 font-medium flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 mr-1" />
                    Photo attached ({photo.name})
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none px-2 py-1 shadow-sm border">
                        <span>Capture or Upload</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" capture="environment" onChange={handlePhotoChange} />
                      </label>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <div className="flex items-center space-x-2">
              <button 
                type="button" 
                onClick={getLocation}
                disabled={locating}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none w-full"
              >
                <MapPin className={`mr-2 h-4 w-4 ${locating ? 'animate-pulse text-blue-500' : 'text-gray-500'}`} />
                {locating ? 'Locating...' : (location ? 'Update Location' : 'Get Location')}
              </button>
            </div>
            {location && (
              <p className="mt-1 text-xs text-green-600 flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" /> Location captured ({location.lat.toFixed(4)}, {location.lng.toFixed(4)})
              </p>
            )}
            {!location && !locating && (
              <p className="mt-1 text-xs text-red-500 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" /> GPS location is required
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
            >
              <option value="low">Low (Small crack)</option>
              <option value="moderate">Moderate (Needs attention)</option>
              <option value="high">High (Dangerous for vehicles)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any additional details..."
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !photo || !location}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading || !photo || !location ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
